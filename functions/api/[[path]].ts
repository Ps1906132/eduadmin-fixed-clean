import bcrypt from 'bcryptjs';
import { getJwtSecret, signJWT, verifyJWT } from './_shared/jwt';

async function writeAuditLog(env: { DB: D1Database }, entry: {
  user_id?: string | null;
  user_role?: string | null;
  action: string;
  module: string;
  table_name?: string;
  record_id?: string | null;
  status: string;
  ip?: string;
  error_message?: string;
  old_value?: string | null;
  new_value?: string | null;
}): Promise<void> {
  try {
    await env.DB.prepare(`
      INSERT INTO audit_logs (id, user_id, user_role, action, module, table_name, record_id, status, ip_address, error_message, old_value, new_value, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      entry.user_id || null,
      entry.user_role || null,
      entry.action,
      entry.module,
      entry.table_name || null,
      entry.record_id || null,
      entry.status,
      entry.ip || null,
      entry.error_message || null,
      entry.old_value || null,
      entry.new_value || null,
      new Date().toISOString()
    ).run();
  } catch (e) {
    // Audit log should never break the main operation
    console.error('Audit log write failed:', e);
  }
}

// 1. Whitelisted tables to prevent SQL injection
const ALLOWED_TABLES = [
  'profiles',
  'staff',
  'academic_years',
  'subject_groups',
  'subjects',
  'classes',
  'students',
  'attendance',
  'schedules',
  'ai_providers',
  'ai_api_keys',
  'ai_system_settings',
  'student_bills',
  'payment_transactions',
  'expenses',
  'savings_accounts',
  'savings_transactions',
  'payment_types',
  'payment_type_classes',
  'student_bill_installments',
  'cash_accounts',
  'school_bank_accounts',
  'finance_settings',
  'expense_categories',
  'announcements',
  'exams',
  'exam_schedules',
  'exam_questions',
  'exam_sessions',
  'exam_answers',
  'parent_students',
  'tutoring_classes',
  'class_students',
  'broadcasts',
  'multimedia_settings',
  'grades',
  'school_settings',
  'promotion_history',
  'schedule_periods',
  'tutoring_subjects',
  'tutoring_teachers',
  'tutoring_enrollments',
  'materi',
  'latihan_soal',
  'bimbel_attendance',
  'bimbel_progress',
  'grade_types',
  'rapor_descriptions',
  'multimedia_videos',
  'quran_verses',
  'teacher_notes',
  'bimbel_materi',
  'bimbel_latihan',
  'dashboard_cache',
  'positions',
  'audit_logs'
];

// Authentication login endpoint handler
async function handleLogin(request: Request, env: { DB: D1Database; JWT_SECRET?: string; RATE_LIMIT_KV?: KVNamespace }): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  try {
    const { username, password } = await request.json() as any;
    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username dan password wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const trimmedUsername = username.trim();
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `rate_limit:${clientIp}:${trimmedUsername}`;
    const RATE_LIMIT_MAX = 5;
    const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    // Rate limiting check
    if (env.RATE_LIMIT_KV) {
      const existing = await env.RATE_LIMIT_KV.get(rateLimitKey, 'json') as { count: number; firstAttempt: number } | null;
      if (existing) {
        const elapsed = Date.now() - existing.firstAttempt;
        if (elapsed < RATE_LIMIT_WINDOW_MS) {
          if (existing.count >= RATE_LIMIT_MAX) {
            const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000);
            writeAuditLog(env, {
              action: 'LOGIN',
              module: 'auth',
              status: 'rate_limited',
              ip: clientIp,
              error_message: `Rate limited: ${existing.count} attempts in 15 min`,
            });
            return new Response(JSON.stringify({
              error: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`
            }), {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfter)
              }
            });
          }
        } else {
          // Reset if outside window
          await env.RATE_LIMIT_KV.delete(rateLimitKey);
        }
      }
    }

    // Query profiles in database - Support both full email, username-only, and NIP
    let queryEmail = trimmedUsername;
    if (!trimmedUsername.includes('@')) {
      queryEmail = `${trimmedUsername}@eduadmin.com`;
    }

    const { results } = await env.DB.prepare(`
      SELECT p.*, s.position, s.nip 
      FROM profiles p 
      LEFT JOIN staff s ON p.id = s.profile_id
      WHERE (p.email = ? OR p.email = ? OR s.nip = ?) 
      AND p.is_active = 1
      LIMIT 1
    `)
      .bind(trimmedUsername, queryEmail, trimmedUsername)
      .all();
    
    if (!results || results.length === 0) {
      if (env.RATE_LIMIT_KV) {
        await incrementRateLimit(env.RATE_LIMIT_KV, rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
      }
      writeAuditLog(env, { action: 'LOGIN', module: 'auth', status: 'failed', ip: clientIp, error_message: 'User not found' });
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = results[0] as any;
    const passwordHash = user.password_hash || user.password;
    
    if (!passwordHash) {
      if (env.RATE_LIMIT_KV) {
        await incrementRateLimit(env.RATE_LIMIT_KV, rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
      }
      writeAuditLog(env, { action: 'LOGIN', module: 'auth', status: 'failed', user_id: user.id, user_role: user.role, ip: clientIp, error_message: 'Password not set' });
      return new Response(JSON.stringify({ error: 'Password belum diatur untuk akun ini' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const isValid = bcrypt.compareSync(password, passwordHash);
    if (!isValid) {
      if (env.RATE_LIMIT_KV) {
        await incrementRateLimit(env.RATE_LIMIT_KV, rateLimitKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
      }
      writeAuditLog(env, { action: 'LOGIN', module: 'auth', status: 'failed', user_id: user.id, user_role: user.role, ip: clientIp, error_message: 'Invalid password' });
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.delete(rateLimitKey);
    }

    writeAuditLog(env, { action: 'LOGIN', module: 'auth', status: 'success', user_id: user.id, user_role: user.role, ip: clientIp });

    const jwtSecret = getJwtSecret(env);
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    const token = await signJWT(payload, jwtSecret);

    // Look up student context for parent (ortu) and student (siswa) roles
    let studentId: string | null = null;
    let studentName: string | null = null;
    let studentClass: string | null = null;
    let studentWali: string | null = null;
    let parentName: string | null = null;
    let motherName: string | null = null;
    let birthPlace: string | null = null;
    let birthDate: string | null = null;
    let studentAddress: string | null = null;
    let studentPhone: string | null = null;
    let studentNis: string | null = null;
    let studentNisn: string | null = null;
    let studentGender: string | null = null;
    let children: any[] = [];

    const studentQuery = user.role === 'ortu'
      ? `
          SELECT s.id as student_id, s.full_name as s_name, s.parent_name, s.mother_name, s.birth_place, s.birth_date,
                 s.gender, s.address, s.phone, s.nis, s.nisn,
                 c.name as c_name, p.full_name as wali_name
          FROM parent_students ps
          JOIN students s ON ps.student_id = s.id
          LEFT JOIN class_students cs ON cs.student_id = s.id AND cs.is_active = 1
          LEFT JOIN classes c ON cs.class_id = c.id
          LEFT JOIN profiles p ON c.teacher_id = p.id
          WHERE ps.parent_id = ?
        `
      : user.role === 'siswa'
        ? `
            SELECT s.id as student_id, s.full_name as s_name, s.parent_name, s.mother_name, s.birth_place, s.birth_date,
                   s.gender, s.address, s.phone, s.nis, s.nisn,
                   c.name as c_name, p.full_name as wali_name
            FROM students s
            LEFT JOIN class_students cs ON cs.student_id = s.id AND cs.is_active = 1
            LEFT JOIN classes c ON cs.class_id = c.id
            LEFT JOIN profiles p ON c.teacher_id = p.id
            WHERE s.profile_id = ?
            LIMIT 1
          `
        : null;

    if (studentQuery) {
      try {
        const { results: sResults } = await env.DB.prepare(studentQuery).bind(user.id).all();
        if (sResults && sResults.length > 0) {
          // Build children array
          children = sResults.map((sr: any) => {
            let bDate = null;
            if (sr.birth_date) {
              try {
                const d = new Date(sr.birth_date + 'T00:00:00');
                bDate = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
              } catch (_) {
                bDate = sr.birth_date;
              }
            }
            return {
              studentId: sr.student_id || null,
              studentName: sr.s_name || null,
              studentClass: sr.c_name ? sr.c_name.replace(/^Kelas\s+/i, '').trim() : null,
              studentWali: sr.wali_name || null,
              parentName: sr.parent_name || null,
              motherName: sr.mother_name || null,
              birthPlace: sr.birth_place || null,
              birthDate: bDate,
              gender: sr.gender || null,
              address: sr.address || null,
              phone: sr.phone || null,
              nis: sr.nis || null,
              nisn: sr.nisn || null
            };
          });

          // Backward compat: set first child as top-level fields
          const first = children[0];
          studentId = first.studentId;
          studentName = first.studentName;
          studentClass = first.studentClass;
          studentWali = first.studentWali;
          parentName = first.parentName;
          motherName = first.motherName;
          birthPlace = first.birthPlace;
          birthDate = first.birthDate;
          studentGender = first.gender;
          studentAddress = first.address;
          studentPhone = first.phone;
          studentNis = first.nis;
          studentNisn = first.nisn;
        }
      } catch (e) {
        console.error('Failed to look up student context:', e);
      }
    }

    // AUTO-BACKFILL: If ortu login has no children, try matching by NIS from email pattern
    if (children.length === 0 && user.role === 'ortu') {
      try {
        // parent email format: ortu_{nis}@eduadmin.com
        const emailStr = user.email || '';
        const nisMatch = emailStr.match(/^ortu_(.+)@/);
        const parentNis = nisMatch ? nisMatch[1] : null;

        if (parentNis) {
          const fallbackResults = await env.DB.prepare(`
            SELECT s.id as student_id, s.full_name as s_name, s.parent_name, s.mother_name,
                   s.birth_place, s.birth_date, s.gender, s.address, s.phone, s.nis, s.nisn,
                   c.name as c_name, p.full_name as wali_name
            FROM students s
            LEFT JOIN class_students cs ON cs.student_id = s.id AND cs.is_active = 1
            LEFT JOIN classes c ON cs.class_id = c.id
            LEFT JOIN profiles p ON c.teacher_id = p.id
            WHERE s.nis = ?
          `).bind(parentNis).all();

          if (fallbackResults.results && fallbackResults.results.length > 0) {
            // Auto-create parent_students link for future logins
            const sr = fallbackResults.results[0] as any;
            try {
              await env.DB.prepare(`
                INSERT OR IGNORE INTO parent_students (id, parent_id, student_id)
                VALUES (?, ?, ?)
              `).bind(
                `ps-${sr.student_id}-${user.id}`,
                user.id,
                sr.student_id
              ).run();
            } catch (_) { /* link may already exist */ }

            // Build children from fallback results
            children = fallbackResults.results.map((sr: any) => {
              let bDate = null;
              if (sr.birth_date) {
                try {
                  const d = new Date(sr.birth_date + 'T00:00:00');
                  bDate = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                } catch (_) { bDate = sr.birth_date; }
              }
              return {
                studentId: sr.student_id || null,
                studentName: sr.s_name || null,
                studentClass: sr.c_name ? sr.c_name.replace(/^Kelas\s+/i, '').trim() : null,
                studentWali: sr.wali_name || null,
                parentName: sr.parent_name || null,
                motherName: sr.mother_name || null,
                birthPlace: sr.birth_place || null,
                birthDate: bDate,
                gender: sr.gender || null,
                address: sr.address || null,
                phone: sr.phone || null,
                nis: sr.nis || null,
                nisn: sr.nisn || null
              };
            });

            const first = children[0];
            studentId = first.studentId;
            studentName = first.studentName;
            studentClass = first.studentClass;
            studentWali = first.studentWali;
            parentName = first.parentName;
            motherName = first.motherName;
            birthPlace = first.birthPlace;
            birthDate = first.birthDate;
            studentGender = first.gender;
            studentAddress = first.address;
            studentPhone = first.phone;
            studentNis = first.nis;
            studentNisn = first.nisn;
          }
        }
      } catch (e) {
        console.error('Auto-backfill parent_students failed:', e);
      }
    }
    
    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        nama: user.full_name,
        email: user.email,
        role: user.position || user.role,
        db_role: user.role,
        avatar: user.avatar_url || null,
        nip: user.nip || null,
        ...(studentName ? { studentId, studentName, studentClass, studentWali, parentName, motherName, birthPlace, birthDate, studentGender, studentAddress, studentPhone, studentNis, studentNisn, children } : {})
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleChangePassword(request: Request, env: { DB: D1Database; JWT_SECRET?: string }): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const jwtSecret = getJwtSecret(env);
    const decoded = await verifyJWT(token, jwtSecret);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Token invalid atau expired' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const { oldPassword, newPassword } = await request.json() as any;
    if (!oldPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Password lama dan baru wajib diisi' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Password baru minimal 8 karakter' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const profile = await env.DB.prepare(
      'SELECT id, password_hash FROM profiles WHERE id = ? AND is_active = 1'
    ).bind(decoded.id).first() as any;

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Akun tidak ditemukan' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }

    const storedHash = profile.password_hash;
    if (!storedHash || !storedHash.startsWith('$2')) {
      return new Response(JSON.stringify({ error: 'Konfigurasi password tidak valid' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const isValid = bcrypt.compareSync(oldPassword, storedHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Password lama salah' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await env.DB.prepare(
      'UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(newHash, new Date().toISOString(), decoded.id).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function incrementRateLimit(kv: KVNamespace, key: string, maxAttempts: number, windowMs: number): Promise<void> {
  const existing = await kv.get(key, 'json') as { count: number; firstAttempt: number } | null;
  const now = Date.now();
  if (existing) {
    const elapsed = now - existing.firstAttempt;
    if (elapsed < windowMs) {
      await kv.put(key, JSON.stringify({ count: existing.count + 1, firstAttempt: existing.firstAttempt }), {
        expirationTtl: Math.ceil((windowMs - elapsed) / 1000)
      });
    } else {
      await kv.put(key, JSON.stringify({ count: 1, firstAttempt: now }), {
        expirationTtl: Math.ceil(windowMs / 1000)
      });
    }
  } else {
    await kv.put(key, JSON.stringify({ count: 1, firstAttempt: now }), {
      expirationTtl: Math.ceil(windowMs / 1000)
    });
  }
}

export const onRequest: PagesFunction<{ DB: D1Database; JWT_SECRET?: string; RATE_LIMIT_KV?: KVNamespace; ENABLE_DIAGNOSTIC?: string }> = async ({ request, env, params }) => {
  const url = new URL(request.url);
  const path = (params as any).path as string[];
  const table = path[0];

  if (!table) return new Response('Endpoint not specified', { status: 400 });

  // Handle Authentication endpoint
  if (table === 'auth') {
    if (path[1] === 'login') {
      return handleLogin(request, env);
    }
    if (path[1] === 'change-password' && request.method === 'POST') {
      return handleChangePassword(request, env);
    }
    return new Response('Not found', { status: 404 });
  }

  // Handle Exam Grading endpoint: POST /api/exam_sessions/:id/grade
  if (table === 'exam_sessions' && path[2] === 'grade' && request.method === 'POST') {
    const sessionId = path[1];
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const token = authHeader.substring(7);
    let jwtSecret: string;
    try {
      jwtSecret = getJwtSecret(env);
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
    const decodedToken = await verifyJWT(token, jwtSecret);
    if (!decodedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Token is invalid or expired' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Fetch session info
      const sessionRes = await env.DB.prepare('SELECT * FROM exam_sessions WHERE id = ?').bind(sessionId).first();
      if (!sessionRes) {
        return new Response(JSON.stringify({ error: 'Exam session not found' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }
      const session = sessionRes as any;

      // Fetch exam questions
      const { results: questions } = await env.DB.prepare(
        'SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY question_number ASC'
      ).bind(session.exam_id).all();

      if (!questions || questions.length === 0) {
        return new Response(JSON.stringify({ error: 'No questions found for this exam' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }

      // Fetch student answers
      const { results: answers } = await env.DB.prepare(
        'SELECT * FROM exam_answers WHERE session_id = ?'
      ).bind(sessionId).all();

      if (!answers || answers.length === 0) {
        return new Response(JSON.stringify({ error: 'No answers found for this session' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }

      // Auto-grade PG questions
      let totalScore = 0;
      let maxScore = 0;
      const questionMap = new Map(questions.map((q: any) => [q.id, q]));
      const updateStmts: { id: string; score: number }[] = [];

      for (const answer of answers as any[]) {
        const question: any = questionMap.get(answer.question_id);
        if (!question) continue;

        const points = question.points || 1;
        maxScore += points;

        if (question.question_type === 'pg' && answer.answer !== null && answer.answer !== undefined) {
          const selectedIdx = parseInt(answer.answer);
          const correctIdx = question.correct_answer !== null ? parseInt(question.correct_answer) : -1;
          const score = selectedIdx === correctIdx ? points : 0;
          totalScore += score;
          updateStmts.push({ id: answer.id, score });
        } else {
          // Essay questions: leave score as null (teacher grades later)
          updateStmts.push({ id: answer.id, score: -1 });
        }
      }

      // Batch update answer scores
      for (const stmt of updateStmts) {
        if (stmt.score >= 0) {
          await env.DB.prepare(
            'UPDATE exam_answers SET score = ?, graded_by = ?, graded_at = ? WHERE id = ?'
          ).bind(stmt.score, decodedToken.id, new Date().toISOString(), stmt.id).run();
        }
      }

      // Calculate percentage score
      const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

      // Update session
      await env.DB.prepare(
        'UPDATE exam_sessions SET total_score = ?, status = ?, submitted_at = ?, updated_at = ? WHERE id = ?'
      ).bind(finalScore, 'selesai', new Date().toISOString(), new Date().toISOString(), sessionId).run();

      return new Response(JSON.stringify({
        status: 'success',
        total_score: finalScore,
        max_score: maxScore,
        correct_count: updateStmts.filter(s => s.score > 0).length,
        total_questions: questions.length,
        graded_count: updateStmts.filter(s => s.score >= 0).length,
        essay_pending: updateStmts.filter(s => s.score < 0).length
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 2. WHITELIST VALIDATION: Table name check
  if (!ALLOWED_TABLES.includes(table)) {
    return new Response(JSON.stringify({ error: `Table '${table}' is not whitelisted` }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. JWT TOKEN VERIFICATION (Session Guard)
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token format' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.substring(7);
  let jwtSecret: string;
  try {
    jwtSecret = getJwtSecret(env);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const decodedToken = await verifyJWT(token, jwtSecret);
  if (!decodedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Token is invalid or expired' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userRole = decodedToken.role;
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';

  const auditCtx = { user_id: decodedToken.id, user_role: userRole, ip: clientIp };

  // --- SERVER-SIDE ROLE-BASED ACCESS CONTROL (RBAC) GUARD ---
  const ADMIN_ONLY_TABLES = [
    'ai_api_keys', 'ai_providers', 'ai_system_settings',
    'school_settings', 'multimedia_settings', 'audit_logs',
    'profiles', 'staff'
  ];

  // Allow kurikulum to READ profiles & staff (data-guru view only)
  if (ADMIN_ONLY_TABLES.includes(table) && userRole !== 'admin') {
    if ((table === 'profiles' || table === 'staff') && request.method === 'GET' && userRole === 'kurikulum') {
      // Allow READ access for kurikulum
    } else {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-admin access to admin-only table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mengakses tabel ${table}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const FINANCE_WRITE_TABLES = [
    'student_bills', 'payment_transactions', 'expenses', 'savings_accounts', 'savings_transactions',
    'payment_types', 'payment_type_classes', 'student_bill_installments',
    'cash_accounts', 'school_bank_accounts', 'finance_settings', 'expense_categories'
  ];

  if (FINANCE_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin' && userRole !== 'keuangan') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-finance write to finance table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Admin atau Staff Keuangan yang dapat mengubah data finansial` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Fase 2: RBAC READ — Finansial hanya untuk admin, keuangan, ortu (data sendiri), siswa (data sendiri)
  const FINANCE_READ_TABLES = [
    'student_bills', 'payment_transactions', 'expenses', 'savings_accounts', 'savings_transactions',
    'payment_types', 'payment_type_classes', 'student_bill_installments',
    'cash_accounts', 'school_bank_accounts', 'finance_settings', 'expense_categories'
  ];
  if (FINANCE_READ_TABLES.includes(table) && request.method === 'GET') {
    if (userRole !== 'admin' && userRole !== 'keuangan' && userRole !== 'ortu' && userRole !== 'siswa') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-finance GET to finance table' });
      return new Response(JSON.stringify({ error: 'Forbidden: Hanya Admin atau Staff Keuangan yang dapat melihat data finansial' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // ortu/siswa only allowed on student-level tables (not expenses)
    if ((userRole === 'ortu' || userRole === 'siswa') && table === 'expenses') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Ortu/siswa GET to expenses table' });
      return new Response(JSON.stringify({ error: 'Forbidden: Hanya Admin atau Staff Keuangan yang dapat melihat data pengeluaran sekolah' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const ACADEMIC_MASTER_WRITE_TABLES = [
    'classes', 'academic_years', 'subject_groups', 'subjects', 'profiles', 'staff'
  ];

  if (ACADEMIC_MASTER_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin' && userRole !== 'kurikulum') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-admin write to academic master table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mengubah data master akademik` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // --- EXAM SCHEDULE RBAC: only kurikulum can read+write, admin blocked ---
  const EXAM_TABLES = ['exams', 'exam_schedules'];
  if (EXAM_TABLES.includes(table)) {
    // Write: only kurikulum
    if (['POST', 'PATCH', 'DELETE'].includes(request.method)) {
      if (userRole !== 'kurikulum') {
        writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-kurikulum write to exam table' });
        return new Response(JSON.stringify({ error: 'Forbidden: Hanya Kurikulum yang dapat mengubah jadwal ujian' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    // Read: admin diblokir, ortu/siswa hanya boleh lihat published
    if (request.method === 'GET') {
      if (userRole === 'admin') {
        writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Admin read to exam table' });
        return new Response(JSON.stringify({ error: 'Forbidden: Admin tidak dapat melihat jadwal ujian' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Ortu/siswa: exams hanya published, exam_schedules hanya via relasi
      if ((userRole === 'ortu' || userRole === 'siswa') && table === 'exams' && request.url.includes('status=eq.published')) {
        // Allowed — only published exams
      } else if ((userRole === 'ortu' || userRole === 'siswa') && table === 'exam_schedules') {
        // Allowed — filtered by frontend
      } else if (userRole === 'ortu' || userRole === 'siswa') {
        // Block non-published access
        if (table === 'exams' && !request.url.includes('status=eq.published')) {
          return new Response(JSON.stringify({ error: 'Forbidden: Hanya jadwal ujian yang dipublikasikan yang dapat dilihat' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }

  const STUDENT_WRITE_TABLES = ['students', 'parent_students', 'class_students'];
  if (STUDENT_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-admin write to student table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mendaftarkan siswa` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Bimbel tables: only Guru Bimbel (gb) can write — Admin reads only
  const BIMBEL_WRITE_TABLES = ['bimbel_attendance', 'bimbel_progress'];
  if (BIMBEL_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'gb') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-GB write to bimbel attendance/progress table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Guru Bimbel yang dapat mengubah data absensi dan perkembangan bimbel` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Materi & latihan tables: only Guru Bimbel (gb) can write (Admin read-only)
  const MATERI_WRITE_TABLES = ['materi', 'latihan_soal'];
  if (MATERI_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'gb') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-GB write to materi/latihan table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Guru Bimbel yang dapat mengubah materi dan latihan` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Grades tables: only Guru (guru) and Kurikulum (kurikulum) can write — Admin reads only
  const GRADES_WRITE_TABLES = ['grades', 'grade_types'];
  if (GRADES_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'guru' && userRole !== 'kurikulum') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-guru/kurikulum write to grades table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Guru dan Kurikulum yang dapat mengubah data nilai` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Attendance table: only Guru (guru) and Admin (admin) can write — Kurikulum view-only
  if (table === 'attendance' && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'guru' && userRole !== 'admin') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: table, table_name: table, status: 'denied', error_message: 'Non-guru/admin write to attendance table' });
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Guru dan Admin yang dapat mengubah data absensi` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle Diagnostics (only for admin, after JWT verification)
  if (table === 'diagnostic') {
    if (userRole !== 'admin') {
      writeAuditLog(env, { ...auditCtx, action: 'UNAUTHORIZED', module: 'diagnostic', table_name: 'diagnostic', status: 'denied', error_message: 'Non-admin access to diagnostic endpoint' });
      return new Response(JSON.stringify({ error: 'Forbidden: Hanya administrator yang dapat mengakses endpoint diagnostic' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const isEnabled = env.ENABLE_DIAGNOSTIC !== 'false';
    if (!isEnabled) {
      return new Response(JSON.stringify({ error: 'Diagnostic endpoint is disabled' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const dbCheck = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      const tables = dbCheck.results.map((r: any) => r.name);

      let profilesCount = 0;
      let profilesColumns: string[] = [];
      let adminExists = false;
      let adminRole = null;
      let adminActive = null;
      let adminPasswordHashSet = false;

      if (tables.includes('profiles')) {
        const countRes = await env.DB.prepare("SELECT COUNT(*) as count FROM profiles").first();
        profilesCount = (countRes as any)?.count || 0;

        const colRes = await env.DB.prepare("PRAGMA table_info(profiles)").all();
        profilesColumns = colRes.results.map((r: any) => r.name);

        const hasHashCol = profilesColumns.includes('password_hash');
        const hasPassCol = profilesColumns.includes('password');

        const selectCols = ['role', 'is_active'];
        if (hasHashCol) selectCols.push('password_hash');
        if (hasPassCol) selectCols.push('password');

        const adminRes = await env.DB.prepare(`SELECT ${selectCols.join(', ')} FROM profiles WHERE email = 'admin@eduadmin.com'`).all();
        if (adminRes.results && adminRes.results.length > 0) {
          adminExists = true;
          const adminObj = adminRes.results[0] as any;
          adminRole = adminObj.role;
          adminActive = adminObj.is_active;
          adminPasswordHashSet = !!((hasHashCol && adminObj.password_hash) || (hasPassCol && adminObj.password));
        }
      }

      return new Response(JSON.stringify({
        status: 'success',
        tables,
        profiles: {
          exists: tables.includes('profiles'),
          count: profilesCount,
          columns: profilesColumns,
          adminExists,
          adminRole,
          adminActive,
          adminPasswordHashSet
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ status: 'error', message: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    // 1. GET (SELECT) - Protected against SQL Injection
    if (request.method === 'GET') {
      let select = url.searchParams.get('select') || '*';
      const order = url.searchParams.get('order');
      const dir = url.searchParams.get('dir') || 'asc';
      const limit = url.searchParams.get('limit');

      // SQL Validation: Check select parameters
      if (select !== '*' && !/^[a-zA-Z0-9_,\s\*]+$/.test(select)) {
        return new Response('Invalid select parameter', { status: 400 });
      }

      // SQL Validation: Check order parameter
      if (order && !/^[a-zA-Z0-9_]+$/.test(order)) {
        return new Response('Invalid order parameter', { status: 400 });
      }

      // SQL Validation: Check direction parameter
      if (dir !== 'asc' && dir !== 'desc') {
        return new Response('Invalid dir parameter', { status: 400 });
      }

      // SQL Validation: Check limit parameter
      if (limit && !/^\d+$/.test(limit)) {
        return new Response('Invalid limit parameter', { status: 400 });
      }

      let whereClauses: string[] = [];
      let whereValues: any[] = [];

      for (const [key, value] of url.searchParams.entries()) {
        if (['select', 'order', 'dir', 'limit'].includes(key)) continue;

        // SQL Validation: Verify column keys
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          return new Response('Invalid filter key', { status: 400 });
        }

        if (value.startsWith('eq.')) {
          whereClauses.push(`${key} = ?`);
          whereValues.push(value.substring(3));
        } else if (value.startsWith('neq.')) {
          whereClauses.push(`${key} != ?`);
          whereValues.push(value.substring(4));
        } else if (value.startsWith('like.')) {
          whereClauses.push(`${key} LIKE ?`);
          whereValues.push(value.substring(5));
        }
      }

      // Fase 0.4: RBAC for CBT tables - siswa cannot see answer keys
      if (table === 'exam_questions' && userRole === 'siswa') {
        if (select === '*') {
          select = 'id, exam_id, subject_id, question_number, question_text, question_type, option_a, option_b, option_c, option_d, points, created_by, created_at, updated_at';
        }
      }

      // RBAC for materi/latihan_soal - siswa/ortu only see published items
      if ((table === 'materi' || table === 'latihan_soal') && (userRole === 'siswa' || userRole === 'ortu')) {
        whereClauses.push('status = ?');
        whereValues.push('Terbit');
      }

      // Fase 0.4: RBAC for exam sessions/answers - siswa only sees own data
      if ((table === 'exam_sessions' || table === 'exam_answers') && userRole === 'siswa') {
        const studentIdRes = await env.DB.prepare('SELECT id FROM students WHERE profile_id = ?').bind(decodedToken.id).first();
        const studentRecordId = studentIdRes ? (studentIdRes as any).id : null;
        if (studentRecordId) {
          whereClauses.push('student_id = ?');
          whereValues.push(studentRecordId);
        } else {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      let query = `SELECT ${select} FROM ${table}`;
      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      if (order) {
        query += ` ORDER BY ${order} ${dir.toUpperCase()}`;
      }
      if (limit) {
        query += ` LIMIT ${limit}`;
      }

      let stmt = env.DB.prepare(query);
      if (whereValues.length > 0) {
        stmt = stmt.bind(...whereValues);
      }
      const { results } = await stmt.all();

      // Security: redact sensitive columns from GET responses
      const SENSITIVE_COLUMNS = ['password_hash'];
      const filteredResults = (results || []).map((row: any) => {
        const filtered = { ...row };
        for (const col of SENSITIVE_COLUMNS) {
          delete filtered[col];
        }
        return filtered;
      });

      return new Response(JSON.stringify(filteredResults), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. POST (INSERT) - Protected against SQL Injection
    if (request.method === 'POST') {
      // Fase 0.4: Siswa can only insert exam answers/sessions for themselves
      if ((table === 'exam_answers' || table === 'exam_sessions') && userRole === 'siswa') {
        const studentIdRes = await env.DB.prepare('SELECT id FROM students WHERE profile_id = ?').bind(decodedToken.id).first();
        const studentRecordId = studentIdRes ? (studentIdRes as any).id : null;
        if (!studentRecordId) {
          return new Response(JSON.stringify({ error: 'Student profile not found' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      let data = await request.json() as any;
      if (!Array.isArray(data)) {
        data = [data];
      }
      const responses = [];

      for (const item of data) {
        // Fase 0.4: Validate ownership for exam data
        if ((table === 'exam_answers' || table === 'exam_sessions') && userRole === 'siswa') {
          const studentIdRes = await env.DB.prepare('SELECT id FROM students WHERE profile_id = ?').bind(decodedToken.id).first();
          const studentRecordId = studentIdRes ? (studentIdRes as any).id : null;
          if (item.student_id && item.student_id !== studentRecordId) {
            return new Response(JSON.stringify({ error: 'Forbidden: Anda hanya dapat mengelola data ujian Anda sendiri' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = keys.map(() => '?').join(', ');

        // SQL Validation: Verify column keys
        for (const key of keys) {
          if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            return new Response('Invalid insert column name', { status: 400 });
          }
        }

        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await env.DB.prepare(query).bind(...values).run();
        responses.push(result);
      }

      // Fase 1.2: Audit log for sensitive write operations
      const SENSITIVE_AUDIT_TABLES = ['ai_api_keys', 'school_settings', 'multimedia_settings'];
      if (SENSITIVE_AUDIT_TABLES.includes(table)) {
        const redacted = data.map((item: any) => {
          const safe = { ...item };
          if (safe.api_key) safe.api_key = '[REDACTED]';
          if (safe.password) safe.password = '[REDACTED]';
          if (safe.password_hash) safe.password_hash = '[REDACTED]';
          return safe;
        });
        writeAuditLog(env, { ...auditCtx, action: 'CREATE', module: table, table_name: table, status: 'success', new_value: JSON.stringify(redacted) });
      }

      return new Response(JSON.stringify(responses), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. PATCH (UPDATE) - Protected against SQL Injection
    if (request.method === 'PATCH') {
      // Fase 0.4: Siswa cannot patch exam answers/sessions data
      if ((table === 'exam_answers' || table === 'exam_sessions') && userRole === 'siswa') {
        return new Response(JSON.stringify({ error: 'Forbidden: Siswa tidak dapat mengubah data ujian' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await request.json();
      const searchParams = url.searchParams;
      
      let whereClauses: string[] = [];
      let whereValues: any[] = [];
      
      for (const [key, value] of searchParams.entries()) {
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          return new Response('Invalid filter key', { status: 400 });
        }
        if (value.startsWith('eq.')) {
          whereClauses.push(`${key} = ?`);
          whereValues.push(value.substring(3));
        } else if (value.startsWith('neq.')) {
          whereClauses.push(`${key} != ?`);
          whereValues.push(value.substring(4));
        } else if (value.startsWith('like.')) {
          whereClauses.push(`${key} LIKE ?`);
          whereValues.push(value.substring(5));
        }
      }

      if (whereClauses.length === 0 && path[1]) {
        whereClauses.push('id = ?');
        whereValues.push(path[1]);
      }

      if (whereClauses.length === 0) {
        return new Response('Missing update filter', { status: 400 });
      }

      const keys = Object.keys(data);
      const setClause = keys.map(k => `${k} = ?`).join(', ');

      // SQL Validation: Verify column keys
      for (const key of keys) {
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          return new Response('Invalid update column name', { status: 400 });
        }
      }
      
      const values = [...Object.values(data), ...whereValues];
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClauses.join(' AND ')}`;
      const result = await env.DB.prepare(query).bind(...values).run();

      // Fase 1.2: Audit log for sensitive write operations
      const SENSITIVE_AUDIT_TABLES = ['ai_api_keys', 'school_settings', 'multimedia_settings', 'audit_logs'];
      if (SENSITIVE_AUDIT_TABLES.includes(table)) {
        const safeData = { ...data };
        if (safeData.api_key) safeData.api_key = '[REDACTED]';
        if (safeData.password) safeData.password = '[REDACTED]';
        if (safeData.password_hash) safeData.password_hash = '[REDACTED]';
        writeAuditLog(env, { ...auditCtx, action: 'UPDATE', module: table, table_name: table, status: 'success', new_value: JSON.stringify(safeData) });
      }
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. DELETE - Protected against SQL Injection
    if (request.method === 'DELETE') {
      // Fase 0.4: Siswa cannot delete exam data
      if ((table === 'exam_answers' || table === 'exam_sessions') && userRole === 'siswa') {
        return new Response(JSON.stringify({ error: 'Forbidden: Siswa tidak dapat menghapus data ujian' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const searchParams = url.searchParams;
      let whereClauses: string[] = [];
      let whereValues: any[] = [];
      
      for (const [key, value] of searchParams.entries()) {
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          return new Response('Invalid delete filter key', { status: 400 });
        }
        if (value.startsWith('eq.')) {
          whereClauses.push(`${key} = ?`);
          whereValues.push(value.substring(3));
        } else if (value.startsWith('neq.')) {
          whereClauses.push(`${key} != ?`);
          whereValues.push(value.substring(4));
        } else if (value.startsWith('like.')) {
          whereClauses.push(`${key} LIKE ?`);
          whereValues.push(value.substring(5));
        }
      }

      if (whereClauses.length === 0 && path[1]) {
        whereClauses.push('id = ?');
        whereValues.push(path[1]);
      }

      if (whereClauses.length === 0) {
        return new Response('Missing delete filter', { status: 400 });
      }

      // Fase 1.2: Audit log for sensitive delete operations
      const SENSITIVE_DELETE_TABLES = [
        'student_bills', 'payment_transactions', 'expenses',
        'savings_accounts', 'savings_transactions',
        'students', 'class_students', 'parent_students',
        'ai_api_keys', 'school_settings', 'multimedia_settings', 'audit_logs'
      ];
      if (SENSITIVE_DELETE_TABLES.includes(table)) {
        writeAuditLog(env, { ...auditCtx, action: 'DELETE', module: table, table_name: table, status: 'success', record_id: whereValues[0] || null });
      }

      const query = `DELETE FROM ${table} WHERE ${whereClauses.join(' AND ')}`;
      const result = await env.DB.prepare(query).bind(...whereValues).run();
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
