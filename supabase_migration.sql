-- =========================================
-- EduAdmin Data Migration Scripts
-- Migrate from hardcoded data to Supabase
-- =========================================

-- =========================================
-- 1. MIGRATE USERS & STAFF
-- =========================================

-- Insert admin user (you'll need to create this user in Supabase Auth first)
-- Note: Replace with actual UUID from auth.users after creating user
INSERT INTO public.profiles (id, email, full_name, role, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@school.com', 'Administrator', 'admin', true),
('00000000-0000-0000-0000-000000000002', 'kepsek@school.com', 'Kepala Sekolah', 'ks', true),
('00000000-0000-0000-0000-000000000003', 'guru@school.com', 'Guru Mata Pelajaran', 'gm', true),
('00000000-0000-0000-0000-000000000004', 'wali@school.com', 'Wali Kelas', 'wk', true),
('00000000-0000-0000-0000-000000000005', 'bimbel@school.com', 'Guru Bimbel', 'gb', true),
('00000000-0000-0000-0000-000000000006', 'ortu@school.com', 'Orang Tua', 'ot', true);

-- Insert staff details
INSERT INTO public.staff (
    profile_id, employee_number, position, department, hire_date, phone, address
) VALUES
(
    '00000000-0000-0000-0000-000000000002',
    '19750101 200012 1 001',
    'Kepala Sekolah',
    'Administrasi',
    '2020-01-01',
    '081234567890',
    'Jl. Sekolah No. 1'
),
(
    '00000000-0000-0000-0000-000000000003',
    '19850202 201001 2 002',
    'Guru Kelas 1',
    'Pendidikan',
    '2021-01-01',
    '081234567891',
    'Jl. Guru No. 1'
),
(
    '00000000-0000-0000-0000-000000000004',
    '19840303 200903 1 003',
    'Guru Matematika',
    'Pendidikan',
    '2019-01-01',
    '081234567892',
    'Jl. Guru No. 2'
);

-- =========================================
-- 2. MIGRATE ACADEMIC DATA
-- =========================================

-- Insert classes (from hardcoded data)
INSERT INTO public.classes (
    name, grade_level, academic_year_id, homeroom_teacher_id, capacity, is_active
) VALUES
('1A', 1, (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
 (SELECT id FROM public.staff WHERE position = 'Guru Kelas 1' LIMIT 1), 30, true),
('1B', 1, (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1), NULL, 30, true),
('2A', 2, (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1), NULL, 30, true);

-- Insert students (from studentsDataGlobal)
INSERT INTO public.students (
    nis, nisn, full_name, gender, birth_date, birth_place, address,
    phone, email, parent_name, parent_phone, parent_email,
    enrollment_date, class_id, profile_id
) VALUES
('2025891023', '1234567890', 'Abdul Solihin', 'L', '2015-01-15', 'Jakarta',
 'Jl. Mawar No. 1, Jakarta', '081234567890', 'abdul@email.com',
 'Ahmad Solihin', '081234567891', 'ahmad@email.com',
 '2023-07-01',
 (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
 '00000000-0000-0000-0000-000000000006'),

('2025891100', '1234567891', 'Budi Santoso', 'L', '2015-02-20', 'Bandung',
 'Jl. Melati No. 2, Bandung', '081234567892', 'budi@email.com',
 'Santoso Budi', '081234567893', 'santoso@email.com',
 '2023-07-01',
 (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
 NULL),

('2025891101', '1234567892', 'Citra Kirana', 'P', '2015-03-10', 'Surabaya',
 'Jl. Anggrek No. 3, Surabaya', '081234567894', 'citra@email.com',
 'Kirana Citra', '081234567895', 'kirana@email.com',
 '2023-07-01',
 (SELECT id FROM public.classes WHERE name = '1B' LIMIT 1),
 NULL);

-- Insert schedules (from hardcoded schedules)
INSERT INTO public.schedules (
    academic_year_id, subject_id, class_id, teacher_id,
    day_of_week, start_time, end_time, room, schedule_type, is_active
) VALUES
(
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    (SELECT id FROM public.subjects WHERE code = 'BIND-001' LIMIT 1),
    (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
    (SELECT id FROM public.staff WHERE position = 'Guru Kelas 1' LIMIT 1),
    1, '07:00', '08:30', 'Ruang 101', 'regular', true
),
(
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    (SELECT id FROM public.subjects WHERE code = 'MTK-001' LIMIT 1),
    (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
    (SELECT id FROM public.staff WHERE position = 'Guru Matematika' LIMIT 1),
    2, '07:00', '08:30', 'Ruang 102', 'regular', true
);

-- =========================================
-- 3. MIGRATE FINANCE DATA
-- =========================================

-- Insert student bills (from hardcoded data)
INSERT INTO public.student_bills (
    student_id, payment_type_id, academic_year_id, amount, due_date,
    paid_amount, status, notes
) VALUES
(
    (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1),
    (SELECT id FROM public.payment_types WHERE name = 'SPP' LIMIT 1),
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    150000.00, '2024-08-01', 150000.00, 'paid', 'SPP Juli 2024'
),
(
    (SELECT id FROM public.students WHERE nis = '2025891100' LIMIT 1),
    (SELECT id FROM public.payment_types WHERE name = 'SPP' LIMIT 1),
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    150000.00, '2024-08-01', 0.00, 'unpaid', 'SPP Juli 2024'
);

-- Insert payment transactions (from paymentHistoryGlobal)
INSERT INTO public.payment_transactions (
    student_bill_id, student_id, cash_account_id, amount,
    payment_method, reference_number, notes, transaction_date, recorded_by
) VALUES
(
    (SELECT id FROM public.student_bills WHERE student_id = (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1) LIMIT 1),
    (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1),
    (SELECT id FROM public.cash_accounts WHERE name = 'Kas Sekolah Utama' LIMIT 1),
    150000.00, 'cash', 'TRX-001', 'Pembayaran SPP Juli 2024',
    '2024-07-15',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- Insert expenses (from hardcoded expenses)
INSERT INTO public.expenses (
    cash_account_id, category, description, amount, expense_date,
    proof_url, recorded_by
) VALUES
(
    (SELECT id FROM public.cash_accounts WHERE name = 'Kas Sekolah Utama' LIMIT 1),
    'Operasional', 'Pembelian alat tulis kantor', 500000.00, '2024-07-10',
    NULL,
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
    (SELECT id FROM public.cash_accounts WHERE name = 'Kas Sekolah Utama' LIMIT 1),
    'Maintenance', 'Perbaikan AC ruang guru', 750000.00, '2024-07-12',
    NULL,
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- =========================================
-- 4. MIGRATE SAVINGS DATA
-- =========================================

-- Insert savings accounts (from savingsData)
INSERT INTO public.savings_accounts (
    account_number, student_id, balance, interest_rate, is_active
) VALUES
('TAB-001', (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1), 50000.00, 0.025, true),
('TAB-002', (SELECT id FROM public.students WHERE nis = '2025891100' LIMIT 1), 75000.00, 0.025, true),
('TAB-003', (SELECT id FROM public.students WHERE nis = '2025891101' LIMIT 1), 25000.00, 0.025, true);

-- Insert savings transactions (from savingsTransactions)
INSERT INTO public.savings_transactions (
    savings_account_id, transaction_type, amount, balance_before,
    balance_after, notes, transaction_date, recorded_by
) VALUES
(
    (SELECT id FROM public.savings_accounts WHERE account_number = 'TAB-001' LIMIT 1),
    'deposit', 50000.00, 0.00, 50000.00, 'Setoran awal',
    '2024-07-01',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
),
(
    (SELECT id FROM public.savings_accounts WHERE account_number = 'TAB-002' LIMIT 1),
    'deposit', 75000.00, 0.00, 75000.00, 'Setoran awal',
    '2024-07-01',
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- =========================================
-- 5. MIGRATE ATTENDANCE DATA
-- =========================================

-- Insert attendance records (sample data)
INSERT INTO public.attendance (
    student_id, class_id, schedule_id, date, status, notes, recorded_by
) VALUES
(
    (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1),
    (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
    (SELECT id FROM public.schedules WHERE day_of_week = 1 LIMIT 1),
    '2024-07-15', 'H', 'Hadir tepat waktu',
    (SELECT id FROM public.profiles WHERE role = 'wk' LIMIT 1)
),
(
    (SELECT id FROM public.students WHERE nis = '2025891100' LIMIT 1),
    (SELECT id FROM public.classes WHERE name = '1A' LIMIT 1),
    (SELECT id FROM public.schedules WHERE day_of_week = 1 LIMIT 1),
    '2024-07-15', 'H', 'Hadir tepat waktu',
    (SELECT id FROM public.profiles WHERE role = 'wk' LIMIT 1)
);

-- =========================================
-- 6. MIGRATE GRADES DATA
-- =========================================

-- Insert grades (sample data)
INSERT INTO public.grades (
    student_id, subject_id, academic_year_id, semester, assessment_type,
    score, weight, notes, recorded_by
) VALUES
(
    (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1),
    (SELECT id FROM public.subjects WHERE code = 'BIND-001' LIMIT 1),
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    '1', 'UH1', 85.00, 1.0, 'Ulangan Harian 1',
    (SELECT id FROM public.profiles WHERE role = 'gm' LIMIT 1)
),
(
    (SELECT id FROM public.students WHERE nis = '2025891023' LIMIT 1),
    (SELECT id FROM public.subjects WHERE code = 'MTK-001' LIMIT 1),
    (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1),
    '1', 'UH1', 90.00, 1.0, 'Ulangan Harian 1',
    (SELECT id FROM public.profiles WHERE role = 'gm' LIMIT 1)
);

-- =========================================
-- 7. MIGRATE ANNOUNCEMENTS
-- =========================================

-- Insert sample announcements
INSERT INTO public.announcements (
    title, content, priority, target_audience, is_published,
    published_at, created_by
) VALUES
(
    'Pengumuman Libur Semester Ganjil',
    'Diberitahukan kepada seluruh siswa, orang tua, dan staff sekolah bahwa libur semester ganjil akan dimulai tanggal 20 Desember 2024 sampai dengan 5 Januari 2025.',
    'high', ARRAY['ot', 'gm', 'wk', 'gb'], true, NOW(),
    (SELECT id FROM public.profiles WHERE role = 'ks' LIMIT 1)
),
(
    'Pendaftaran Siswa Baru Gelombang II',
    'Pendaftaran siswa baru gelombang II untuk tahun ajaran 2025/2026 telah dibuka. Kuota tersedia 50 siswa.',
    'normal', ARRAY['ot'], true, NOW(),
    (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
);

-- =========================================
-- 8. MIGRATE LIBRARY DATA
-- =========================================

-- Insert sample books
INSERT INTO public.library_books (
    isbn, title, author, publisher, publication_year, category,
    total_copies, available_copies, location, description
) VALUES
(
    '9786020324789', 'Bahasa Indonesia untuk SD', 'Tim Pengarang',
    'Erlangga', 2023, 'Bahasa Indonesia', 5, 5, 'Rak A1',
    'Buku pelajaran Bahasa Indonesia untuk siswa SD kelas 1-6'
),
(
    '9789797808735', 'Matematika Seru', 'Ahmad Sudrajat',
    'Yudhistira', 2022, 'Matematika', 3, 3, 'Rak B2',
    'Buku matematika dengan pendekatan yang menyenangkan'
);

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Check data counts
SELECT
    'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'staff', COUNT(*) FROM public.staff
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'classes', COUNT(*) FROM public.classes
UNION ALL
SELECT 'subjects', COUNT(*) FROM public.subjects
UNION ALL
SELECT 'schedules', COUNT(*) FROM public.schedules
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'grades', COUNT(*) FROM public.grades
UNION ALL
SELECT 'student_bills', COUNT(*) FROM public.student_bills
UNION ALL
SELECT 'payment_transactions', COUNT(*) FROM public.payment_transactions
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'savings_accounts', COUNT(*) FROM public.savings_accounts
UNION ALL
SELECT 'savings_transactions', COUNT(*) FROM public.savings_transactions
UNION ALL
SELECT 'announcements', COUNT(*) FROM public.announcements
UNION ALL
SELECT 'library_books', COUNT(*) FROM public.library_books;

-- =========================================
-- END OF MIGRATION
-- =========================================

-- Note: After running this migration:
-- 1. Update the UUIDs in profiles table to match actual Supabase auth user IDs
-- 2. Run the application and test all features
-- 3. Adjust RLS policies if needed
-- 4. Set up proper file storage for uploads