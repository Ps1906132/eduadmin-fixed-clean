-- ========================================
-- D1 TABLE 10: SCHEDULES
-- ========================================

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

-- Index
CREATE INDEX IF NOT EXISTS idx_schedules_class ON schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_year ON schedules(academic_year_id);
