CREATE TABLE IF NOT EXISTS materi (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_name TEXT DEFAULT '',
    drive_link TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materi_class_status ON materi(class_id, status);