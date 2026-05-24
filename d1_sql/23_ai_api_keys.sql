-- ========================================
-- D1 TABLE 23: AI_API_KEYS
-- ========================================

CREATE TABLE IF NOT EXISTS ai_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    api_key TEXT NOT NULL,
    api_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_provider ON ai_api_keys(provider_id);
