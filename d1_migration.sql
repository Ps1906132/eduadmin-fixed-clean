-- ========================================
-- D1 MIGRATION SCRIPT
-- For use with Wrangler CLI
-- ========================================
-- 
-- Usage: wrangler d1 execute eduadmin_db --file d1_migration.sql
--
-- This file applies additional migrations, constraints, and optimizations
-- after the base schema has been created.
--

-- ========================================
-- 1. ADD TRIGGERS FOR AUDIT LOGGING
-- ========================================

-- Note: SQLite triggers for automatic audit logging
-- Uncomment below if you want automatic audit trail

/*
CREATE TRIGGER IF NOT EXISTS trg_profiles_audit AFTER INSERT ON profiles
BEGIN
  INSERT INTO audit_logs (
    id, timestamp, user_id, action, table_name, record_id, 
    new_value, status
  ) VALUES (
    'audit-' || datetime('now') || '-' || NEW.id,
    datetime('now'),
    NEW.id,
    'CREATE',
    'profiles',
    NEW.id,
    json_object('email', NEW.email, 'role', NEW.role),
    'SUCCESS'
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_students_audit AFTER INSERT ON students
BEGIN
  INSERT INTO audit_logs (
    id, timestamp, user_id, action, table_name, record_id, 
    new_value, status
  ) VALUES (
    'audit-' || datetime('now') || '-' || NEW.id,
    datetime('now'),
    'system',
    'CREATE',
    'students',
    NEW.id,
    json_object('nis', NEW.nis, 'name', NEW.full_name),
    'SUCCESS'
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_grades_audit AFTER INSERT ON grades
BEGIN
  INSERT INTO audit_logs (
    id, timestamp, user_id, action, table_name, record_id, 
    new_value, status
  ) VALUES (
    'audit-' || datetime('now') || '-' || NEW.id,
    datetime('now'),
    NEW.created_by,
    'CREATE',
    'grades',
    NEW.id,
    json_object('student_id', NEW.student_id, 'grade', NEW.grade_value),
    'SUCCESS'
  );
END;
*/

-- ========================================
-- 2. UPDATE TIMESTAMPS TRIGGERS
-- ========================================

-- SQLite doesn't support generated columns in standard way,
-- so we need triggers to maintain updated_at timestamps

CREATE TRIGGER IF NOT EXISTS trg_profiles_update_timestamp
AFTER UPDATE ON profiles
BEGIN
  UPDATE profiles SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_staff_update_timestamp
AFTER UPDATE ON staff
BEGIN
  UPDATE staff SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_classes_update_timestamp
AFTER UPDATE ON classes
BEGIN
  UPDATE classes SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_students_update_timestamp
AFTER UPDATE ON students
BEGIN
  UPDATE students SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_schedules_update_timestamp
AFTER UPDATE ON schedules
BEGIN
  UPDATE schedules SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_attendance_update_timestamp
AFTER UPDATE ON attendance
BEGIN
  UPDATE attendance SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_grades_update_timestamp
AFTER UPDATE ON grades
BEGIN
  UPDATE grades SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_student_bills_update_timestamp
AFTER UPDATE ON student_bills
BEGIN
  UPDATE student_bills SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_payment_transactions_update_timestamp
AFTER UPDATE ON payment_transactions
BEGIN
  UPDATE payment_transactions SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- ========================================
-- 3. ADD CONSTRAINTS & VALIDATIONS
-- ========================================

-- CHECK constraints sudah diterapkan langsung di CREATE TABLE pada d1_schema.sql:
-- profiles.role, attendance.status, student_bills.status

-- ========================================
-- 4. ADDITIONAL OPTIMIZATION INDEXES
-- ========================================

-- For frequently used queries
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_student_bills_date_range ON student_bills(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON grades(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON classes(grade_level);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);

-- ========================================
-- 5. ADD SAMPLE DATA FOR TESTING (OPTIONAL)
-- ========================================

-- Add more academic years
INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, semester, is_active)
VALUES ('ay-2026-2027', '2026/2027 - Semester 1', '2026-07-01', '2026-12-31', 1, 0);

-- Add default subject groups
INSERT OR IGNORE INTO subject_groups (id, name, description, is_active)
VALUES 
  ('sg-001', 'Matematika & IPA', 'Kelompok mata pelajaran MIPA', 1),
  ('sg-002', 'Bahasa & Sastra', 'Kelompok mata pelajaran Bahasa', 1),
  ('sg-003', 'IPS & PKN', 'Kelompok mata pelajaran Sosial', 1),
  ('sg-004', 'Olahraga & Seni', 'Kelompok mata pelajaran Kesehatan & Seni', 1);

-- Add default subjects
INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES 
  ('subj-001', 'Matematika', 'MTK', 'sg-001', 3, 1),
  ('subj-002', 'Fisika', 'FIS', 'sg-001', 2, 1),
  ('subj-003', 'Kimia', 'KIM', 'sg-001', 2, 1),
  ('subj-004', 'Biologi', 'BIO', 'sg-001', 2, 1),
  ('subj-005', 'Bahasa Indonesia', 'B.IND', 'sg-002', 3, 1),
  ('subj-006', 'Bahasa Inggris', 'B.ENG', 'sg-002', 3, 1),
  ('subj-007', 'Sejarah', 'SEJ', 'sg-003', 2, 1),
  ('subj-008', 'Geografi', 'GEO', 'sg-003', 2, 1),
  ('subj-009', 'Pendidikan Jasmani', 'PJOK', 'sg-004', 2, 1),
  ('subj-010', 'Seni Rupa', 'SENI', 'sg-004', 2, 1);

-- Add default schedule periods
INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES 
  ('per-1', 1, '07:00', '07:45', 45, 'ay-2025-2026', 1),
  ('per-2', 2, '07:45', '08:30', 45, 'ay-2025-2026', 1),
  ('per-3', 3, '08:30', '09:15', 45, 'ay-2025-2026', 1),
  ('per-4', 4, '09:15', '10:00', 45, 'ay-2025-2026', 1),
  ('per-br', 5, '10:00', '10:15', 15, 'ay-2025-2026', 1),
  ('per-5', 6, '10:15', '11:00', 45, 'ay-2025-2026', 1),
  ('per-6', 7, '11:00', '11:45', 45, 'ay-2025-2026', 1),
  ('per-7', 8, '11:45', '12:30', 45, 'ay-2025-2026', 1),
  ('per-8', 9, '12:30', '13:15', 45, 'ay-2025-2026', 1);

-- Add default AI provider
INSERT OR IGNORE INTO ai_providers (id, name, type, is_active)
VALUES ('ai-gemini', 'Google Gemini', 'LLM', 1);

-- Add school settings (you should update these with actual school info)
INSERT OR IGNORE INTO school_settings (id, school_name, school_address, school_phone, school_email, principal_name, created_at)
VALUES (
  'settings-school',
  'SMK Negeri 1',
  'Jl. Pendidikan No. 123, Jakarta',
  '(021) 123-4567',
  'info@smkn1.sch.id',
  'Dr. Budi Santoso',
  CURRENT_TIMESTAMP
);

-- ========================================
-- 6. VERIFY SCHEMA
-- ========================================

-- You can run these SELECT statements to verify the migration

/*

-- Count all tables
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Check profiles table
PRAGMA table_info(profiles);

-- Check students table
PRAGMA table_info(students);

-- View sample data
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_classes FROM classes;

*/

-- ========================================
-- 7. MAINTENANCE & MONITORING
-- ========================================

-- Vacuum database (cleanup and optimize)
-- VACUUM;

-- Analyze for query optimization
-- ANALYZE;

-- ========================================
-- END OF MIGRATION SCRIPT
-- ========================================
