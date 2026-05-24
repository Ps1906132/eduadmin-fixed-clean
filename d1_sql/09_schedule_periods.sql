-- ========================================
-- D1 TABLE 09: SCHEDULE_PERIODS
-- ========================================

CREATE TABLE IF NOT EXISTS schedule_periods (
    id TEXT PRIMARY KEY,
    period_number INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INTEGER,
    academic_year_id TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(academic_year_id, period_number)
);

-- Insert default schedule periods
INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-1', 1, '07:00', '07:45', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-2', 2, '07:45', '08:30', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-3', 3, '08:30', '09:15', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-4', 4, '09:15', '10:00', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-br', 5, '10:00', '10:15', 15, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-5', 6, '10:15', '11:00', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-6', 7, '11:00', '11:45', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-7', 8, '11:45', '12:30', 45, 'ay-2025-2026', 1);

INSERT OR IGNORE INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, academic_year_id, is_active)
VALUES ('per-8', 9, '12:30', '13:15', 45, 'ay-2025-2026', 1);
