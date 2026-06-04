import bcrypt from 'bcryptjs';

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
  'tutoring_enrollments'
];

// Helper to sign JWT using Web Crypto API (dependency-free)
async function signJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Base64Url helper
  const toBase64Url = (str: string) => {
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(tokenInput)
  );
  
  const signatureArray = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < signatureArray.byteLength; i++) {
    binary += String.fromCharCode(signatureArray[i]);
  }
  const encodedSignature = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${tokenInput}.${encodedSignature}`;
}

// Helper to verify JWT using Web Crypto API (dependency-free)
async function verifyJWT(token: string, secret: string): Promise<any | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  // Base64Url decode helper
  const fromBase64Url = (str: string) => {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return atob(padded);
  };
  
  try {
    const signatureBin = fromBase64Url(encodedSignature);
    const signatureBytes = new Uint8Array(signatureBin.length);
    for (let i = 0; i < signatureBin.length; i++) {
      signatureBytes[i] = signatureBin.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(tokenInput)
    );
    
    if (!isValid) return null;
    
    const payloadJson = fromBase64Url(encodedPayload);
    const payload = JSON.parse(payloadJson);
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

// Authentication login endpoint handler
async function handleLogin(request: Request, env: { DB: D1Database; JWT_SECRET?: string }): Promise<Response> {
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
    
    // Query profiles in database
    const { results } = await env.DB.prepare('SELECT * FROM profiles WHERE email = ? AND is_active = 1').bind(username.trim()).all();
    
    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = results[0] as any;
    const passwordHash = user.password_hash || user.password;
    
    if (!passwordHash) {
      return new Response(JSON.stringify({ error: 'Password belum diatur untuk akun ini' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate password hash via bcryptjs
    const isValid = bcrypt.compareSync(password, passwordHash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sign JWT
    const jwtSecret = env.JWT_SECRET || 'fallback-dev-secret-key-12345';
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    const token = await signJWT(payload, jwtSecret);
    
    return new Response(JSON.stringify({
      token,
      user: {
        id: user.id,
        nama: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url || null
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

export const onRequest: PagesFunction<{ DB: D1Database; JWT_SECRET?: string }> = async ({ request, env, params }) => {
  const url = new URL(request.url);
  const path = params.path as string[];
  const table = path[0];

  if (!table) return new Response('Endpoint not specified', { status: 400 });

  // Handle Authentication endpoint
  if (table === 'auth') {
    if (path[1] === 'login') {
      return handleLogin(request, env);
    }
    return new Response('Not found', { status: 404 });
  }

  // Handle Diagnostics
  if (table === 'diagnostic') {
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
  const jwtSecret = env.JWT_SECRET || 'fallback-dev-secret-key-12345';
  if (!jwtSecret) {
    return new Response(JSON.stringify({ error: 'Server Configuration Error: JWT_SECRET is not configured' }), {
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

  // --- SERVER-SIDE ROLE-BASED ACCESS CONTROL (RBAC) GUARD ---
  const userRole = decodedToken.role;

  // 1. Tabel Konfigurasi & Kunci API Sensitif: Hanya boleh diakses oleh Admin (Read & Write)
  const ADMIN_ONLY_TABLES = [
    'ai_api_keys',
    'ai_providers',
    'ai_system_settings',
    'school_settings',
    'multimedia_settings',
    'audit_logs'
  ];

  if (ADMIN_ONLY_TABLES.includes(table) && userRole !== 'admin') {
    return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mengakses tabel ${table}` }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Tabel Finansial: Hanya boleh dimodifikasi (Write) oleh Admin atau Keuangan
  const FINANCE_WRITE_TABLES = [
    'student_bills',
    'payment_transactions',
    'expenses',
    'savings_accounts',
    'savings_transactions'
  ];

  if (FINANCE_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin' && userRole !== 'keuangan') {
      return new Response(JSON.stringify({ error: `Forbidden: Hanya Admin atau Staff Keuangan yang dapat mengubah data finansial` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 3. Tabel Master Akademik: Hanya boleh dimodifikasi (Write) oleh Admin
  const ACADEMIC_MASTER_WRITE_TABLES = [
    'classes',
    'academic_years',
    'subject_groups',
    'subjects',
    'profiles',
    'staff'
  ];

  if (ACADEMIC_MASTER_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mengubah data master akademik` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 4. Tabel Registrasi Siswa: Hanya boleh dimodifikasi (Write) oleh Admin
  const STUDENT_WRITE_TABLES = ['students', 'parent_students', 'class_students'];
  if (STUDENT_WRITE_TABLES.includes(table) && ['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    if (userRole !== 'admin') {
      return new Response(JSON.stringify({ error: `Forbidden: Hanya administrator yang dapat mendaftarkan siswa` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    // 1. GET (SELECT) - Protected against SQL Injection
    if (request.method === 'GET') {
      const select = url.searchParams.get('select') || '*';
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
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. POST (INSERT) - Protected against SQL Injection
    if (request.method === 'POST') {
      let data = await request.json() as any;
      if (!Array.isArray(data)) {
        data = [data];
      }
      const responses = [];

      for (const item of data) {
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

      return new Response(JSON.stringify(responses), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. PATCH (UPDATE) - Protected against SQL Injection
    if (request.method === 'PATCH') {
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
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. DELETE - Protected against SQL Injection
    if (request.method === 'DELETE') {
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
