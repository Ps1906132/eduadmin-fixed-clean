-- ========================================
-- D1 TABLE 24: AI_SYSTEM_SETTINGS
-- ========================================

CREATE TABLE IF NOT EXISTS ai_system_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
