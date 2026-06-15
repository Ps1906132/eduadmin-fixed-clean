CREATE TABLE IF NOT EXISTS latihan_soal (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_name TEXT DEFAULT '',
    type TEXT DEFAULT 'PG',
    questions TEXT DEFAULT '[]',
    publish_date TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_latihan_soal_class_status ON latihan_soal(class_id, status);