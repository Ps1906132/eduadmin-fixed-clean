-- ========================================
-- D1 TABLE 03: ACADEMIC_YEARS
-- ========================================

CREATE TABLE IF NOT EXISTS academic_years (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    semester INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default academic years
INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, semester, is_active)
VALUES ('ay-2025-2026', '2025/2026 - Semester 1', '2025-07-01', '2025-12-31', 1, 1);

INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, semester, is_active)
VALUES ('ay-2025-2026-2', '2025/2026 - Semester 2', '2026-01-01', '2026-06-30', 2, 1);
