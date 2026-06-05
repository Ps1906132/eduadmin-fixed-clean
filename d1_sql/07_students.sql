-- ========================================
-- D1 TABLE 07: STUDENTS
-- ========================================

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    profile_id TEXT UNIQUE,
    nis TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT,
    birth_date DATE,
    birth_place TEXT,
    parent_name TEXT,
    mother_name TEXT,
    parent_job TEXT,
    mother_job TEXT,
    address TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    enrollment_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_students_nis ON students(nis);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
