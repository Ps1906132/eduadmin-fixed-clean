CREATE TABLE IF NOT EXISTS bimbel_attendance (id TEXT PRIMARY KEY, enrollment_id TEXT NOT NULL, tutoring_class_id TEXT NOT NULL, student_id TEXT NOT NULL, date DATE NOT NULL, status TEXT NOT NULL, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, created_by TEXT, UNIQUE(enrollment_id, date));

CREATE INDEX IF NOT EXISTS idx_bimbel_attendance_class ON bimbel_attendance(tutoring_class_id);
CREATE INDEX IF NOT EXISTS idx_bimbel_attendance_student ON bimbel_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_bimbel_attendance_date ON bimbel_attendance(date);
