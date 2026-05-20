// scripts/migrate-to-d1.ts
// Jalankan dari browser console setelah login admin
const TOKEN = localStorage.getItem('eduadmin_token');
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

async function post(table: string, items: any[]) {
  if (!items?.length) { console.log(`[${table}] kosong, skip.`); return; }
  const res = await fetch(`/api/${table}`, { method:'POST', headers:H, body:JSON.stringify(items) });
  const ok = await res.json();
  console.log(`[${table}] ${items.length} record → status ${res.status}`, ok);
}

async function migrateAll() {
  // 1. SISWA
  const rawStudents = JSON.parse(localStorage.getItem('students_data_v11') || '[]');
  const students = rawStudents.map((s: any) => ({
    id: String(s.id), nis: s.nis, full_name: s.nama,
    gender: s.gender || null, birth_date: s.ttl?.split(', ')[1] || null,
    birth_place: s.ttl?.split(', ')[0] || null, parent_name: s.ayah || null,
    address: null, phone: null, status: 'active',
    enrollment_date: new Date().toISOString().split('T')[0]
  }));
  await post('students', students);

  // 2. GURU & STAFF
  const rawTeachers = JSON.parse(localStorage.getItem('teachers_data_v11') || '[]');
  const profiles = rawTeachers.map((t: any) => ({
    id: String(t.id), email: `${t.username}@eduadmin.sch.id`,
    full_name: t.nama, role: t.role || 'gm', is_active: 1
  }));
  await post('profiles', profiles);

  // 3. KELAS
  const rawClasses = JSON.parse(localStorage.getItem('classes_data_v11') || '[]');
  const classes = rawClasses.map((c: any) => ({
    id: String(c.id), name: c.nama, grade_level: c.tingkat,
    academic_year_id: 'ay-2024-2025', is_active: 1
  }));
  await post('classes', classes);

  // 4. TAGIHAN & PEMBAYARAN
  const rawBills = JSON.parse(localStorage.getItem('finance_student_bills_v10') || '[]');
  const bills = rawBills.map((b: any) => ({
    id: String(b.id), student_id: String(b.studentId),
    payment_name: b.paymentName, amount: b.amount,
    period: b.period, status: b.status, type: b.type || 'BULANAN'
  }));
  await post('student_bills', bills);

  // 5. TABUNGAN
  const rawSavings = JSON.parse(localStorage.getItem('savings_data_v10') || '[]');
  const savings = rawSavings.map((s: any) => ({
    id: String(s.id || `sav-${s.studentId}`),
    student_id: String(s.studentId), balance: s.balance || s.saldo || 0
  }));
  await post('savings_accounts', savings);

  // 6. PENGUMUMAN
  const rawAnnouncements = JSON.parse(localStorage.getItem('announcements_data_v10') || '[]');
  const announcements = rawAnnouncements.map((a: any) => ({
    id: String(a.id), title: a.title, category: a.category,
    target: a.target || 'all', content: a.content,
    status: a.status || 'Draft', viewers: a.viewers || 0
  }));
  await post('announcements', announcements);

  console.log('=== MIGRASI SELESAI ===');
}

// migrateAll();  // Jalankan dari console!
