-- ========================================
-- D1 TABLE 27: PROMOTION_HISTORY
-- ========================================

CREATE TABLE IF NOT EXISTS promotion_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    from_class_id TEXT,
    to_class_id TEXT,
    academic_year_id TEXT NOT NULL,
    promotion_date DATE,
    status TEXT,
    remarks TEXT,
    processed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_promotion_history_student ON promotion_history(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_history_year ON promotion_history(academic_year_id);
