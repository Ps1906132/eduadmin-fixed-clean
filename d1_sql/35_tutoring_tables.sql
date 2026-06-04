-- ========================================
-- D1 TABLE 35: TUTORING EXTRAS & EXTENSIONS
-- ========================================

CREATE TABLE IF NOT EXISTS tutoring_subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    classes TEXT, -- stored as JSON string e.g. ["1A", "1B"]
    meetings INTEGER DEFAULT 10,
    status TEXT DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS tutoring_teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT DEFAULT 'internal',
    subject_id TEXT,
    subject_name TEXT,
    class_id TEXT,
    schedule_day TEXT,
    schedule_start TEXT,
    schedule_end TEXT,
    username TEXT,
    password TEXT,
    students_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Aktif'
);

CREATE TABLE IF NOT EXISTS tutoring_enrollments (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, student_id)
);

-- Alter tutoring_classes to add missing columns used by the frontend hook
-- Note: SQLite does not support ALTER TABLE ADD COLUMN IF NOT EXISTS.
-- If these columns already exist, wrangler execution might show an error which can be safely ignored.
ALTER TABLE tutoring_classes ADD COLUMN subject TEXT;
ALTER TABLE tutoring_classes ADD COLUMN room TEXT;
ALTER TABLE tutoring_classes ADD COLUMN sessions TEXT;
ALTER TABLE tutoring_classes ADD COLUMN is_active INTEGER DEFAULT 1;
