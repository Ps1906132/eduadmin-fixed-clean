-- ========================================
-- D1 TABLE 21: TUTORING_CLASSES
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
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tutoring_classes_teacher ON tutoring_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_classes_status ON tutoring_classes(status);
