-- ========================================
-- D1 TABLE 14: BROADCASTS
-- ========================================

CREATE TABLE IF NOT EXISTS broadcasts (
    id TEXT PRIMARY KEY,
    announcement_id TEXT NOT NULL,
    recipient_type TEXT,
    recipient_id TEXT,
    read_status INTEGER DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_broadcasts_announcement ON broadcasts(announcement_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_recipient ON broadcasts(recipient_id);
