-- ========================================
-- D1 TABLE 06: CLASSES
-- ========================================

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

-- Index
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_grade_level ON classes(grade_level);
