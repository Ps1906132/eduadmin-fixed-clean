-- ========================================
-- D1 TABLE 18: SAVINGS_ACCOUNTS
-- ========================================

CREATE TABLE IF NOT EXISTS savings_accounts (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    account_number TEXT,
    opened_date DATE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_savings_accounts_student ON savings_accounts(student_id);
CREATE INDEX IF NOT EXISTS idx_savings_accounts_status ON savings_accounts(status);
