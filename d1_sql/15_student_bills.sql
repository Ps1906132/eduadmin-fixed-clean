-- ========================================
-- D1 TABLE 15: STUDENT_BILLS
-- ========================================

CREATE TABLE IF NOT EXISTS student_bills (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    payment_name TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
    type TEXT DEFAULT 'BULANAN',
    due_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_student_bills_student ON student_bills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_bills_status ON student_bills(status);
CREATE INDEX IF NOT EXISTS idx_student_bills_due_date ON student_bills(due_date);
