-- ========================================
-- D1 TABLE 30: EXAM_SCHEDULES (Jadwal Ujian per Kelas)
-- ========================================

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

-- Index
CREATE INDEX IF NOT EXISTS idx_exam_schedules_exam ON exam_schedules(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_class ON exam_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules(exam_date);
