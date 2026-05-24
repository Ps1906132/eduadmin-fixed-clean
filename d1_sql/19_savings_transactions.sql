-- ========================================
-- D1 TABLE 19: SAVINGS_TRANSACTIONS
-- ========================================

CREATE TABLE IF NOT EXISTS savings_transactions (
    id TEXT PRIMARY KEY,
    savings_account_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15, 2),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by TEXT,
    FOREIGN KEY (savings_account_id) REFERENCES savings_accounts(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_savings_transactions_account ON savings_transactions(savings_account_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_student ON savings_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(transaction_date);
