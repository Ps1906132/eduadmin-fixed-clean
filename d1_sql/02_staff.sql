-- ========================================
-- D1 TABLE 02: STAFF (Detailed Staff Info)
-- ========================================

CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    profile_id TEXT UNIQUE NOT NULL,
    nip TEXT UNIQUE,
    position TEXT,
    department TEXT,
    hire_date DATE,
    salary DECIMAL(15, 2),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_staff_nip ON staff(nip);
