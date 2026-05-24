-- ========================================
-- D1 TABLE 21: TUTORING_CLASSES
-- ========================================

CREATE TABLE IF NOT EXISTS tutoring_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    subject_id TEXT,
    schedule TEXT,
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tutoring_classes_teacher ON tutoring_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_classes_status ON tutoring_classes(status);
