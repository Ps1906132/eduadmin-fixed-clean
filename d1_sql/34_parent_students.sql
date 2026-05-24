-- ========================================
-- D1 TABLE 34: PARENT_STUDENTS (Relasi Orang Tua - Siswa)
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

-- Index
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);
