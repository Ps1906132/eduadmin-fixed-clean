-- =============================================================================
--  EDUADMIN — ADDITIONS & FIXES (v2.1 — 18 Juni 2026)
--  Melengkapi gap berdasarkan PERJANJIAN_KERJA.md §4 butir 6:
--    "Lenkapi Databes, Analisis Databes, serta lengkapi database."
--
--  TABLE ADDED:
--    1. quran_surahs / quran_verses  → Al-Quran digital
--    2. teacher_notes                → Notepad Guru
--    3. bimbel_materi                → Materi Bimbingan Belajar
--    4. bimbel_latihan               → Latihan Soal Bimbingan Belajar
--    5. dashboard_cache              → Cache statistik dashboard (KS, dll)
--
--  FIXES / CATATAN:
--    A. exam_answers — tambah UNIQUE (session_id, question_id)
--    B. tutoring_enrollments — group_id = FK utama; tutoring_class_id redundant
-- =============================================================================
--  Cara pakai:
--    Jalankan SETELAH eduadmin_d1_schema.sql sukses:
--    npx wrangler d1 execute <DB_NAME> --remote --file=eduadmin_d2_additions.sql
-- =============================================================================

PRAGMA defer_foreign_keys = TRUE;


-- =============================================================================
-- DROP (anak dulu, induk belakangan — agar bisa di-re-run)
-- =============================================================================
DROP TABLE IF EXISTS bimbel_latihan;
DROP TABLE IF EXISTS bimbel_materi;
DROP TABLE IF EXISTS teacher_notes;
DROP TABLE IF EXISTS quran_verses;
DROP TABLE IF EXISTS quran_surahs;
DROP TABLE IF EXISTS dashboard_cache;


-- =============================================================================
-- BAGIAN 14 — AL-QURAN DIGITAL
-- =============================================================================
-- Dipakai di menu "Al Quran" oleh Guru (Mapel & Wali Kelas), GB, dan Ortu.
-- Berisi surah + ayat lengkap dengan terjemahan bahasa Indonesia.
-- Data bisa diisi via seed dari API eksternal atau file JSON.

-- ─── 14.1 quran_surahs ───────────────────────────────────────────────────────
CREATE TABLE quran_surahs (
    id              TEXT    PRIMARY KEY,
    surah_number    INTEGER NOT NULL UNIQUE,         -- 1–114
    name_id         TEXT    NOT NULL,                 -- "Al-Fatihah"
    name_arabic     TEXT    NOT NULL,                 -- "الفاتحة"
    name_latin      TEXT,                             -- "Al-Fatihah"
    meaning         TEXT,                             -- "Pembukaan"
    verse_count     INTEGER NOT NULL,
    revelation_type TEXT    DEFAULT 'makkiyah' CHECK (revelation_type IN ('makkiyah', 'madaniyah')),
    juz_count       INTEGER DEFAULT 1,
    description     TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 14.2 quran_verses ───────────────────────────────────────────────────────
CREATE TABLE quran_verses (
    id              TEXT    PRIMARY KEY,
    surah_id        TEXT    NOT NULL,
    surah_number    INTEGER NOT NULL,                 -- denormalisasi untuk query cepat
    verse_number    INTEGER NOT NULL,                 -- nomor ayat dalam surah
    verse_text      TEXT    NOT NULL,                 -- teks Arab
    verse_latin     TEXT,                             -- teks latin (optional)
    translation     TEXT,                             -- terjemahan bahasa Indonesia
    tafsir          TEXT,                             -- tafsir singkat (opsional)
    juz             INTEGER,                          -- nomor juz (1–30)
    page            INTEGER,                          -- nomor halaman mushaf
    manzil         INTEGER,                          -- 1–7 (pembagian 7 hari)
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (surah_id) REFERENCES quran_surahs(id) ON DELETE CASCADE,
    UNIQUE (surah_id, verse_number)
);

CREATE INDEX idx_qv_surah      ON quran_verses(surah_id);
CREATE INDEX idx_qv_surah_num  ON quran_verses(surah_number);
CREATE INDEX idx_qv_juz        ON quran_verses(juz);
CREATE INDEX idx_qv_page       ON quran_verses(page);


-- =============================================================================
-- BAGIAN 15 — NOTEPAD GURU
-- =============================================================================
-- Catatan pribadi guru (menu "Notepad" di DashboardGuru).
-- Data bersifat privat per guru, tidak dibagikan ke role lain.

-- ─── 15.1 teacher_notes ──────────────────────────────────────────────────────
CREATE TABLE teacher_notes (
    id          TEXT    PRIMARY KEY,
    teacher_id  TEXT    NOT NULL,                     -- FK ke profiles (role=guru)
    title       TEXT    DEFAULT 'Untitled',
    content     TEXT,                                 -- bisa rich-text / markdown
    is_pinned   INTEGER NOT NULL DEFAULT 0,
    color       TEXT,                                 -- warna label (opsional, hex)
    tags        TEXT,                                 -- JSON array tag
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES profiles(id)
);

CREATE INDEX idx_tn_teacher    ON teacher_notes(teacher_id);
CREATE INDEX idx_tn_pinned     ON teacher_notes(teacher_id, is_pinned);
CREATE INDEX idx_tn_archived   ON teacher_notes(teacher_id, is_archived);


-- =============================================================================
-- BAGIAN 16 — BIMBINGAN BELAJAR: MATERI & LATIHAN
-- =============================================================================
-- Berbeda dengan materi/latihan untuk kelas reguler (tabel materi & latihan_soal
-- yang terikat class_id). Tabel ini khusus untuk Bimbel, terikat tutoring_classes
-- dan session_number (pertemuan ke-berapa).

-- ─── 16.1 bimbel_materi ──────────────────────────────────────────────────────
-- Materi belajar yang diupload Guru Bimbel per sesi pertemuan.
-- Dibaca Orang Tua di ikon "Bimbingan Belajar" → klik mapel → pilih pertemuan.
CREATE TABLE bimbel_materi (
    id                TEXT    PRIMARY KEY,
    tutoring_class_id TEXT    NOT NULL,
    session_number    INTEGER,                        -- pertemuan ke-berapa (1, 2, 3, ...)
    title             TEXT    NOT NULL,
    description       TEXT,
    drive_link        TEXT    NOT NULL,               -- link Google Drive / file
    publish_date      TEXT    NOT NULL,
    status            TEXT    DEFAULT 'Draft' CHECK (status IN ('Draft', 'Terbit', 'Arsip')),
    created_by        TEXT,                           -- profiles.id guru bimbel
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutoring_class_id) REFERENCES tutoring_classes(id)
);

-- ─── 16.2 bimbel_latihan ─────────────────────────────────────────────────────
-- Soal latihan yang dibuat Guru Bimbel per sesi pertemuan.
CREATE TABLE bimbel_latihan (
    id                TEXT    PRIMARY KEY,
    tutoring_class_id TEXT    NOT NULL,
    session_number    INTEGER,                        -- pertemuan ke-berapa
    title             TEXT    NOT NULL,
    type              TEXT    DEFAULT 'PG' CHECK (type IN ('PG', 'Essay', 'Campuran')),
    questions         TEXT    DEFAULT '[]',            -- JSON array soal
    publish_date      TEXT    NOT NULL,
    status            TEXT    DEFAULT 'Draft' CHECK (status IN ('Draft', 'Terbit', 'Arsip')),
    created_by        TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutoring_class_id) REFERENCES tutoring_classes(id)
);

CREATE INDEX idx_bm_class    ON bimbel_materi(tutoring_class_id);
CREATE INDEX idx_bm_session  ON bimbel_materi(tutoring_class_id, session_number);
CREATE INDEX idx_bm_status   ON bimbel_materi(status);
CREATE INDEX idx_bl_class    ON bimbel_latihan(tutoring_class_id);
CREATE INDEX idx_bl_session  ON bimbel_latihan(tutoring_class_id, session_number);
CREATE INDEX idx_bl_status   ON bimbel_latihan(status);


-- =============================================================================
-- BAGIAN 17 — DASHBOARD CACHE / STATISTIK
-- =============================================================================
-- Menyimpan hasil agregasi untuk dashboard statistik (Kepala Sekolah, dll).
-- Di-refresh periodik atau saat data berubah.
-- Contoh: jumlah siswa per tahun, jumlah guru, rekap keuangan, dll.

-- ─── 17.1 dashboard_cache ───────────────────────────────────────────────────
CREATE TABLE dashboard_cache (
    id          TEXT    PRIMARY KEY,
    cache_key   TEXT    UNIQUE NOT NULL,               -- contoh: 'stat_siswa_per_tahun', 'stat_guru_total'
    cache_value TEXT    NOT NULL,                      -- JSON value
    label       TEXT,                                  -- label display (opsional)
    category    TEXT,                                  -- 'siswa' | 'guru' | 'keuangan' | 'kelas' | 'umum'
    updated_by  TEXT,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dc_key      ON dashboard_cache(cache_key);
CREATE INDEX idx_dc_category ON dashboard_cache(category);


-- =============================================================================
-- BAGIAN 18 — PERBAIKAN & CATATAN
-- =============================================================================

-- ─── 18.1 exam_answers — UNIQUE constraint ────────────────────────────────────
-- ✅ SUDAH DIPERBAIKI: UNIQUE (session_id, question_id) ditambahkan langsung
--    ke CREATE TABLE di eduadmin_d1_schema.sql.
--    Jika database sudah jalan, migrasi manual diperlukan:
--
--   CREATE TABLE exam_answers_new (
--       ... (sama seperti skema) ...,
--       UNIQUE (session_id, question_id)
--   );
--   INSERT INTO exam_answers_new SELECT * FROM exam_answers;
--   DROP TABLE exam_answers;
--   ALTER TABLE exam_answers_new RENAME TO exam_answers;
--
-- Atau handle di level aplikasi (cek duplikat sebelum INSERT).

-- ─── 18.2 tutoring_enrollments — kolom redundant ──────────────────────────────
-- ✅ SUDAH DIPERBAIKI: `tutoring_class_id` dihapus dari CREATE TABLE
--    di eduadmin_d1_schema.sql. Hanya `group_id` yang dipakai.
--    Jika database sudah jalan, migrasi manual diperlukan:
--    ALTER TABLE tutoring_enrollments DROP COLUMN tutoring_class_id;


-- =============================================================================
-- RINGKASAN PERUBAHAN
-- =============================================================================
--   GRUP                  TABEL BARU
--   ─────────────────     ─────────────────────────────────────────────────
--   Al-Quran Digital (2)  quran_surahs, quran_verses
--   Notepad Guru     (1)  teacher_notes
--   Bimbel Materi    (2)  bimbel_materi, bimbel_latihan
--   Dashboard Cache  (1)  dashboard_cache
--   ─────────────────     ─────────────────────────────────────────────────
--   TOTAL TABEL BARU = 6
--   TOTAL KESELURUHAN = 42 tabel
-- =============================================================================
