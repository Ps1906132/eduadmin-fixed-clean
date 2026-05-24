-- ========================================
-- D1 TABLE 26: MULTIMEDIA_SETTINGS
-- ========================================

CREATE TABLE IF NOT EXISTS multimedia_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
