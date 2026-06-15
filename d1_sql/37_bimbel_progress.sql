CREATE TABLE IF NOT EXISTS bimbel_progress (id TEXT PRIMARY KEY, enrollment_id TEXT NOT NULL, tutoring_class_id TEXT NOT NULL, student_id TEXT NOT NULL, report_type TEXT NOT NULL, title TEXT, score REAL, score_date DATE, month TEXT, notes TEXT, recommendation TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, created_by TEXT);

CREATE INDEX IF NOT EXISTS idx_bimbel_progress_class ON bimbel_progress(tutoring_class_id);
CREATE INDEX IF NOT EXISTS idx_bimbel_progress_student ON bimbel_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_bimbel_progress_type ON bimbel_progress(report_type);
