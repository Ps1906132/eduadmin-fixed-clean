-- Migration: Tambah kolom `semester` ke tabel `grades`
-- Tanggal: 28 Juni 2026
-- Alasan: Filter nilai per semester tanpa join ke academic_years

-- 1. Tambah kolom semester (1 atau 2)
ALTER TABLE grades ADD COLUMN semester INTEGER;

-- 2. Update semester berdasarkan academic_years yang terhubung
UPDATE grades
SET semester = (
    SELECT ay.semester
    FROM academic_years ay
    WHERE ay.id = grades.academic_year_id
)
WHERE semester IS NULL;

-- 3. Index untuk performa filter
CREATE INDEX IF NOT EXISTS idx_grades_semester ON grades(semester);
