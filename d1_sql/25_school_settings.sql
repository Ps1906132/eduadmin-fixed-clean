-- ========================================
-- D1 TABLE 25: SCHOOL_SETTINGS
-- ========================================

CREATE TABLE IF NOT EXISTS school_settings (
    id TEXT PRIMARY KEY,
    school_name TEXT,
    school_address TEXT,
    school_phone TEXT,
    school_email TEXT,
    principal_name TEXT,
    npsn TEXT,
    academic_year_id TEXT,
    semester INTEGER,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Insert default school settings
INSERT OR IGNORE INTO school_settings (id, school_name, academic_year_id, created_at, updated_at)
VALUES ('settings-school', 'Sekolah Anda', 'ay-2025-2026', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
