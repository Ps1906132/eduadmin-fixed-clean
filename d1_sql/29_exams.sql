-- ========================================
-- D1 TABLE 29: EXAMS (Master Ujian)
-- ========================================

CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    duration_minutes INTEGER DEFAULT 90,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_exams_academic_year ON exams(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(type);
