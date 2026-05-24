-- ========================================
-- D1 TABLE 04: SUBJECT_GROUPS
-- ========================================

CREATE TABLE IF NOT EXISTS subject_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subject groups
INSERT OR IGNORE INTO subject_groups (id, name, description, is_active)
VALUES ('sg-001', 'Matematika & IPA', 'Kelompok mata pelajaran MIPA', 1);

INSERT OR IGNORE INTO subject_groups (id, name, description, is_active)
VALUES ('sg-002', 'Bahasa & Sastra', 'Kelompok mata pelajaran Bahasa', 1);

INSERT OR IGNORE INTO subject_groups (id, name, description, is_active)
VALUES ('sg-003', 'IPS & PKN', 'Kelompok mata pelajaran Sosial', 1);

INSERT OR IGNORE INTO subject_groups (id, name, description, is_active)
VALUES ('sg-004', 'Olahraga & Seni', 'Kelompok mata pelajaran Kesehatan & Seni', 1);
