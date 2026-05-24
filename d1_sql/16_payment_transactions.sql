-- ========================================
-- D1 TABLE 16: PAYMENT_TRANSACTIONS
-- ========================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    payment_method TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    recorded_by TEXT,
    FOREIGN KEY (bill_id) REFERENCES student_bills(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_payment_transactions_bill ON payment_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student ON payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON payment_transactions(transaction_date);
