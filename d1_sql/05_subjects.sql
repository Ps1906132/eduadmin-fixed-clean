-- ========================================
-- D1 TABLE 05: SUBJECTS
-- ========================================

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    subject_group_id TEXT NOT NULL,
    description TEXT,
    credits INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_group_id) REFERENCES subject_groups(id)
);

-- Insert default subjects
INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-001', 'Matematika', 'MTK', 'sg-001', 3, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-002', 'Fisika', 'FIS', 'sg-001', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-003', 'Kimia', 'KIM', 'sg-001', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-004', 'Biologi', 'BIO', 'sg-001', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-005', 'Bahasa Indonesia', 'B.IND', 'sg-002', 3, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-006', 'Bahasa Inggris', 'B.ENG', 'sg-002', 3, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-007', 'Sejarah', 'SEJ', 'sg-003', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-008', 'Geografi', 'GEO', 'sg-003', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-009', 'Pendidikan Jasmani', 'PJOK', 'sg-004', 2, 1);

INSERT OR IGNORE INTO subjects (id, name, code, subject_group_id, credits, is_active)
VALUES ('subj-010', 'Seni Rupa', 'SENI', 'sg-004', 2, 1);

-- Index
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_group ON subjects(subject_group_id);
