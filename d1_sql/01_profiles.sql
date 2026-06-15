-- ========================================
-- D1 TABLE 01: PROFILES (Users/Authentication)
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'siswa' CHECK (role IN ('admin', 'kurikulum', 'keuangan', 'guru', 'siswa', 'ortu')),
    role_type TEXT DEFAULT 'single',
    is_active INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT,
    phone_number TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Super Admin User
-- Ganti password default segera setelah deployment pertama!
-- Gunakan: scripts/generate-admin-seed.ts untuk generate hash baru
INSERT OR REPLACE INTO profiles (
    id, 
    email, 
    full_name, 
    password_hash, 
    role, 
    role_type,
    is_active
) VALUES (
    'admin-001',
    'admin@eduadmin.com',
    'Super Administrator',
    '$2b$10$Or6VxlRM/4hl2h.bPh5MfevcP.p.53gxW1fYPxoIuaRvZBtTB9HHW',
    'admin',
    'single',
    1
);

-- Index untuk faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
