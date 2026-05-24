-- ========================================
-- D1 TABLE 22: AI_PROVIDERS
-- ========================================

CREATE TABLE IF NOT EXISTS ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default AI provider
INSERT OR IGNORE INTO ai_providers (id, name, type, is_active)
VALUES ('ai-gemini', 'Google Gemini', 'LLM', 1);
