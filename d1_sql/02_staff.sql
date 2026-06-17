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

-- Insert Staff Record for Super Admin
-- Ini diperlukan agar profil Super Admin dapat diupdate/dikelola dari UI
INSERT OR REPLACE INTO staff (
    id,
    profile_id,
    nip,
    position,
    department,
    is_active
) VALUES (
    'admin-001',
    'admin-001',
    'admin',
    'Kepala Sekolah',
    'Umum',
    1
);

-- Insert Staff Record for Staff Tata Usaha
INSERT OR REPLACE INTO staff (
    id,
    profile_id,
    nip,
    position,
    department,
    is_active
) VALUES (
    'tu-001',
    'tu-001',
    'TU001',
    'Staff Tata Usaha',
    'Keuangan',
    1
);

-- Insert Staff Record for Wakil Kurikulum
INSERT OR REPLACE INTO staff (
    id,
    profile_id,
    nip,
    position,
    department,
    is_active
) VALUES (
    'kurikulum-001',
    'kurikulum-001',
    'WK001',
    'Wakil Kurikulum',
    'Kurikulum',
    1
);

-- Insert Staff Record for Kepala Sekolah
INSERT OR REPLACE INTO staff (
    id,
    profile_id,
    nip,
    position,
    department,
    is_active
) VALUES (
    'ks-001',
    'ks-001',
    'KS001',
    'Kepala Sekolah',
    'Umum',
    1
);

