-- ========================================
-- EDUADMIN D1 DATABASE SCHEMA
-- Complete SQL for Cloudflare D1
-- ========================================

-- ========================================
-- 1. CORE TABLES - USER & PROFILE
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('admin', 'kurikulum', 'keuangan', 'guru', 'siswa', 'ortu')),
    role_type TEXT DEFAULT 'single',
    is_active INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT,
    phone_number TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    profile_id TEXT UNIQUE NOT NULL,
    nip TEXT UNIQUE,
    position TEXT,
    department TEXT,
    hire_date DATE,
    salary DECIMAL(15, 2),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- ========================================
-- 2. ACADEMIC STRUCTURE
-- ========================================

CREATE TABLE IF NOT EXISTS academic_years (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    semester INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subject_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    subject_group_id TEXT NOT NULL,
    description TEXT,
    credits INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_group_id) REFERENCES subject_groups(id)
);

CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    teacher_id TEXT,
    capacity INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id)
);

-- ========================================
-- 3. STUDENTS & ENROLLMENT
-- ========================================

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    profile_id TEXT UNIQUE,
    nis TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT,
    birth_date DATE,
    birth_place TEXT,
    parent_name TEXT,
    address TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    enrollment_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS class_students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    enrollment_date DATE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(class_id, student_id, academic_year_id)
);

-- ========================================
-- 4. SCHEDULES & PERIODS
-- ========================================

CREATE TABLE IF NOT EXISTS schedule_periods (
    id TEXT PRIMARY KEY,
    period_number INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INTEGER,
    academic_year_id TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(academic_year_id, period_number)
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT,
    day_of_week TEXT NOT NULL,
    period_id TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    room TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    FOREIGN KEY (period_id) REFERENCES schedule_periods(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- ========================================
-- 5. ATTENDANCE & GRADES
-- ========================================

CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    schedule_id TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    UNIQUE(student_id, class_id, date)
);

CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    grade_value DECIMAL(5, 2),
    grade_letter TEXT,
    assessment_type TEXT,
    exam_date DATE,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(student_id, subject_id, academic_year_id, assessment_type)
);

-- ========================================
-- 6. ANNOUNCEMENTS & COMMUNICATIONS
-- ========================================

CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    target TEXT DEFAULT 'all',
    status TEXT DEFAULT 'Draft',
    viewers INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    announcement_id TEXT NOT NULL,
    recipient_type TEXT,
    recipient_id TEXT,
    read_status INTEGER DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id)
);

-- ========================================
-- 7. FINANCE & PAYMENTS
-- ========================================

CREATE TABLE IF NOT EXISTS student_bills (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    payment_name TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
    type TEXT DEFAULT 'BULANAN',
    due_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    payment_method TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by TEXT,
    FOREIGN KEY (bill_id) REFERENCES student_bills(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- ========================================
-- 8. SAVINGS ACCOUNTS
-- ========================================

CREATE TABLE IF NOT EXISTS savings_accounts (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    account_number TEXT,
    opened_date DATE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS savings_transactions (
    id TEXT PRIMARY KEY,
    savings_account_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15, 2),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by TEXT,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ========================================
-- 9. CBT / UJIAN
-- ========================================

CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    duration_minutes INTEGER DEFAULT 90,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS exam_schedules (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT,
    exam_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    UNIQUE(exam_id, class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS exam_questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'pg',
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT,
    points DECIMAL(5, 2) DEFAULT 1.00,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (created_by) REFERENCES profiles(id),
    UNIQUE(exam_id, subject_id, question_number)
);

CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL,
    exam_schedule_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    started_at DATETIME,
    submitted_at DATETIME,
    status TEXT NOT NULL DEFAULT 'belum_mulai',
    total_score DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (exam_schedule_id) REFERENCES exam_schedules(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(exam_schedule_id, student_id)
);

CREATE TABLE IF NOT EXISTS exam_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    answer TEXT,
    score DECIMAL(5, 2),
    graded_by TEXT,
    graded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (question_id) REFERENCES exam_questions(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (graded_by) REFERENCES profiles(id),
    UNIQUE(session_id, question_id)
);

-- ========================================
-- 10. RELASI ORANG TUA - SISWA
-- ========================================

CREATE TABLE IF NOT EXISTS parent_students (
    id TEXT PRIMARY KEY,
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'wali',
    is_primary INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES profiles(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(parent_id, student_id)
);

-- ========================================
-- 11. TUTORING/BIMBINGAN BELAJAR
-- ========================================

CREATE TABLE IF NOT EXISTS tutoring_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    subject_id TEXT,
    subject TEXT,
    schedule TEXT,
    room TEXT,
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    description TEXT,
    sessions TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS tutoring_subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classes TEXT, -- stored as JSON string e.g. ["1A", "1B"]
    meetings INTEGER DEFAULT 10,
    status TEXT DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS tutoring_teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT DEFAULT 'internal',
    subject_id TEXT,
    subject_name TEXT,
    class_id TEXT,
    schedule_day TEXT,
    schedule_start TEXT,
    schedule_end TEXT,
    username TEXT,
    password TEXT,
    students_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS tutoring_enrollments (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, student_id)
);

-- ========================================
-- 11. AI & SETTINGS
-- ========================================

CREATE TABLE IF NOT EXISTS ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    api_key TEXT NOT NULL,
    api_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
);

CREATE TABLE IF NOT EXISTS ai_system_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 12. SCHOOL SETTINGS & CONFIGURATION
-- ========================================

CREATE TABLE IF NOT EXISTS school_settings (
    id TEXT PRIMARY KEY,
    school_name TEXT,
    school_address TEXT,
    school_phone TEXT,
    school_email TEXT,
    principal_name TEXT,
    npsn TEXT,
    academic_year_id TEXT,
    semester INTEGER,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

CREATE TABLE IF NOT EXISTS multimedia_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 13. PROMOTION & CLASS ADVANCEMENT
-- ========================================

CREATE TABLE IF NOT EXISTS promotion_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    from_class_id TEXT,
    to_class_id TEXT,
    academic_year_id TEXT NOT NULL,
    promotion_date DATE,
    status TEXT,
    remarks TEXT,
    processed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- ========================================
-- 14. AUDIT & LOGGING
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    user_role TEXT,
    module TEXT,
    action TEXT,
    table_name TEXT,
    record_id TEXT,
    field_changed TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_role ON audit_logs(user_role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_nip ON staff(nip);
CREATE INDEX IF NOT EXISTS idx_students_nis ON students(nis);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_class ON grades(class_id);
CREATE INDEX IF NOT EXISTS idx_student_bills_student ON student_bills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_bills_status ON student_bills(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_bill ON payment_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_student ON savings_accounts(student_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_account ON savings_transactions(savings_account_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_exams_academic_year ON exams(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam ON exam_schedules(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_class ON exam_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student ON exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON exam_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_student ON exam_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

CREATE VIEW IF NOT EXISTS v_student_attendance_summary AS
SELECT 
    s.id,
    s.nis,
    s.full_name,
    COUNT(CASE WHEN a.status = 'hadir' THEN 1 END) as days_present,
    COUNT(CASE WHEN a.status = 'sakit' THEN 1 END) as days_sick,
    COUNT(CASE WHEN a.status = 'izin' THEN 1 END) as days_leave,
    COUNT(CASE WHEN a.status = 'alpa' THEN 1 END) as days_absent,
    COUNT(*) as total_days
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.nis, s.full_name;

CREATE VIEW IF NOT EXISTS v_student_grades_summary AS
SELECT 
    s.id,
    s.nis,
    s.full_name,
    sub.name as subject_name,
    AVG(g.grade_value) as average_grade,
    MAX(g.grade_value) as highest_grade,
    MIN(g.grade_value) as lowest_grade,
    COUNT(*) as assessment_count
FROM students s
LEFT JOIN grades g ON s.id = g.student_id
LEFT JOIN subjects sub ON g.subject_id = sub.id
GROUP BY s.id, s.nis, s.full_name, sub.name;

CREATE VIEW IF NOT EXISTS v_class_statistics AS
SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT cs.student_id) as total_students,
    c.capacity,
    ROUND(100.0 * COUNT(DISTINCT cs.student_id) / c.capacity, 2) as occupancy_percentage
FROM classes c
LEFT JOIN class_students cs ON c.id = cs.class_id
GROUP BY c.id, c.name, c.capacity;

-- ========================================
-- SAMPLE SEED DATA (OPTIONAL)
-- ========================================

-- Insert default system admin
INSERT OR IGNORE INTO profiles (id, email, full_name, password_hash, role, is_active) 
VALUES ('admin-001', 'admin@eduadmin.com', 'System Administrator', 
    '$2a$10$YourHashedPasswordHere', 'admin', 1);

INSERT OR IGNORE INTO staff (id, profile_id, nip, position, department, is_active)
VALUES ('admin-001', 'admin-001', 'admin', 'Kepala Sekolah', 'Umum', 1);


-- Insert default academic year if needed
INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, semester, is_active)
VALUES ('ay-2025-2026', '2025/2026 - Semester 1', '2025-07-01', '2025-12-31', 1, 1);

INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, semester, is_active)
VALUES ('ay-2025-2026-2', '2025/2026 - Semester 2', '2026-01-01', '2026-06-30', 2, 1);

-- ========================================
-- END OF SCHEMA
-- ========================================
