-- ========================================
-- D1 TABLE 32: EXAM_SESSIONS (Sesi Ujian Siswa)
-- ========================================

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

-- Index
CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam ON exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student ON exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);
