-- =============================================================================
--  EDUADMIN — CLOUDFLARE D1 DATABASE SCHEMA
--  Versi   : 2.0 (18 Juni 2026)
--  Engine  : SQLite (Cloudflare D1)
--  Sumber  : backup_eduadmin_remote.sql + PERJANJIAN_KERJA_ROLE.md
-- =============================================================================
--
--  CARA PAKAI:
--  1. Reset database bersih:
--     npx wrangler d1 execute <DB_NAME> --remote --file=eduadmin_d1_schema.sql
--
--  2. Lokal (dev):
--     npx wrangler d1 execute <DB_NAME> --local --file=eduadmin_d1_schema.sql
--
--  CATATAN PENTING:
--  - Semua ID bertipe TEXT (UUID / custom string)
--  - Timestamps: DATETIME DEFAULT CURRENT_TIMESTAMP
--  - Boolean: INTEGER (0 = false, 1 = true)
--  - D1 tidak mendukung CASCADE DELETE — hapus manual secara berurutan
--  - CHECK constraint role: 7 role resmi sesuai PERJANJIAN_KERJA_ROLE.md
-- =============================================================================

PRAGMA defer_foreign_keys = TRUE;

-- =============================================================================
-- BAGIAN 0 — DROP SEMUA TABEL (urutan: anak dulu, induk belakangan)
-- =============================================================================

DROP TABLE IF EXISTS exam_answers;
DROP TABLE IF EXISTS exam_sessions;
DROP TABLE IF EXISTS exam_questions;
DROP TABLE IF EXISTS exam_schedules;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS parent_students;
DROP TABLE IF EXISTS rapor_descriptions;
DROP TABLE IF EXISTS grade_types;
DROP TABLE IF EXISTS bimbel_progress;
DROP TABLE IF EXISTS bimbel_attendance;
DROP TABLE IF EXISTS tutoring_enrollments;
DROP TABLE IF EXISTS tutoring_classes;
DROP TABLE IF EXISTS tutoring_teachers;
DROP TABLE IF EXISTS tutoring_subjects;
DROP TABLE IF EXISTS latihan_soal;
DROP TABLE IF EXISTS materi;
DROP TABLE IF EXISTS savings_transactions;
DROP TABLE IF EXISTS savings_accounts;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS student_bills;
DROP TABLE IF EXISTS expense_categories;
DROP TABLE IF EXISTS finance_settings;
DROP TABLE IF EXISTS school_bank_accounts;
DROP TABLE IF EXISTS cash_accounts;
DROP TABLE IF EXISTS student_bill_installments;
DROP TABLE IF EXISTS payment_type_classes;
DROP TABLE IF EXISTS payment_types;
DROP TABLE IF EXISTS broadcasts;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS schedule_periods;
DROP TABLE IF EXISTS class_students;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS subject_groups;
DROP TABLE IF EXISTS promotion_history;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS ai_api_keys;
DROP TABLE IF EXISTS ai_providers;
DROP TABLE IF EXISTS ai_system_settings;
DROP TABLE IF EXISTS multimedia_settings;
DROP TABLE IF EXISTS multimedia_videos;
DROP TABLE IF EXISTS school_settings;
DROP TABLE IF EXISTS audit_logs;

-- ===== BAGIAN 14 (Quran) =====
DROP TABLE IF EXISTS quran_verses;
DROP TABLE IF EXISTS quran_surahs;

-- ===== BAGIAN 15 (Notepad) =====
DROP TABLE IF EXISTS teacher_notes;

-- ===== BAGIAN 16 (Bimbel Materi/Latihan) =====
DROP TABLE IF EXISTS bimbel_latihan;
DROP TABLE IF EXISTS bimbel_materi;

-- ===== BAGIAN 17 (Dashboard Cache) =====
DROP TABLE IF EXISTS dashboard_cache;

-- ===== BAGIAN 18 (Positions / Jabatan) =====
DROP TABLE IF EXISTS positions;


-- =============================================================================
-- BAGIAN 1 — TABEL INTI SISTEM
-- =============================================================================

-- ─── 1.1 profiles ────────────────────────────────────────────────────────────
-- Tabel utama akun login semua pengguna.
-- role = 7 nilai resmi sesuai PERJANJIAN_KERJA.md §3.1
-- Login orang tua menggunakan NIS/NISN siswa (bukan role 'siswa')
CREATE TABLE profiles (
    id            TEXT    PRIMARY KEY,
    email         TEXT    UNIQUE NOT NULL,
    full_name     TEXT    NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'ortu'
                          CHECK (role IN (
                              'admin',      -- Administrator / Operator
                              'kurikulum',  -- Wakil Kurikulum
                              'ks',         -- Kepala Sekolah
                              'keuangan',   -- Keuangan / TU
                              'guru',       -- Guru Mapel & Wali Kelas (dibedakan via staff.position)
                              'gb',         -- Guru Bimbingan Belajar
                              'ortu'        -- Orang Tua / Wali Murid
                          )),
    role_type     TEXT    DEFAULT 'single',
    is_active     INTEGER NOT NULL DEFAULT 1,
    avatar_url    TEXT,
    phone_number  TEXT,
    address       TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 1.2 staff ───────────────────────────────────────────────────────────────
-- Data jabatan/NIP untuk semua role staf (admin, ks, kurikulum, keuangan, guru, gb).
-- Kolom `position` menyimpan jabatan asli (contoh: "Wali Kelas", "Guru Mata Pelajaran")
-- yang digunakan App.tsx untuk menentukan sub-tipe guru (wali kelas vs guru mapel).
CREATE TABLE staff (
    id          TEXT    PRIMARY KEY,
    profile_id  TEXT    UNIQUE NOT NULL,
    nip         TEXT    UNIQUE,
    position    TEXT,       -- contoh: "Wali Kelas", "Guru Mata Pelajaran", "Guru Bimbel"
    department  TEXT,
    hire_date   DATE,
    salary      DECIMAL(15, 2),
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- ─── 1.3 academic_years ──────────────────────────────────────────────────────
-- Tahun ajaran dan semester. is_active=1 = tahun ajaran berjalan.
CREATE TABLE academic_years (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL UNIQUE,   -- contoh: "2025/2026 - Semester 1"
    start_date  DATE    NOT NULL,
    end_date    DATE    NOT NULL,
    semester    INTEGER,                   -- 1 atau 2
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 1.4 school_settings ─────────────────────────────────────────────────────
-- Pengaturan sekolah: diisi Admin di menu Settings.
-- Dipakai di: halaman login (nama/logo), kop surat rapot, seluruh tampilan.
CREATE TABLE school_settings (
    id               TEXT PRIMARY KEY,
    school_name      TEXT,
    school_address   TEXT,
    school_phone     TEXT,
    school_email     TEXT,
    principal_name   TEXT,
    npsn             TEXT,
    academic_year_id TEXT,
    semester         INTEGER,
    logo_url         TEXT,
    icon_url         TEXT,
    accreditation    TEXT,
    school_status    TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- ─── 1.5 audit_logs ──────────────────────────────────────────────────────────
-- Log semua aksi penting sistem. Hanya Admin yang bisa melihat di menu audit_log.
CREATE TABLE audit_logs (
    id            TEXT    PRIMARY KEY,
    timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id       TEXT,
    user_role     TEXT,
    module        TEXT,         -- contoh: 'auth', 'schedules', 'grades'
    action        TEXT,         -- LOGIN, CREATE, UPDATE, DELETE, VIEW
    table_name    TEXT,
    record_id     TEXT,
    field_changed TEXT,
    old_value     TEXT,
    new_value     TEXT,
    ip_address    TEXT,
    user_agent    TEXT,
    status        TEXT DEFAULT 'SUCCESS',   -- SUCCESS | FAILED | UNAUTHORIZED
    error_message TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);


-- =============================================================================
-- BAGIAN 2 — MATA PELAJARAN & KELAS
-- =============================================================================

-- ─── 2.1 subject_groups ──────────────────────────────────────────────────────
-- Kelompok mapel (MIPA, Bahasa, IPS, dll). Dipakai Admin saat input mapel.
CREATE TABLE subject_groups (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 2.2 subjects ────────────────────────────────────────────────────────────
-- Mata pelajaran. Dibuat Admin, digunakan Kurikulum untuk jadwal.
-- teacher_id = guru pengampu utama (bisa di-override per jadwal)
CREATE TABLE subjects (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,
    code             TEXT    UNIQUE NOT NULL,    -- kode singkat, contoh: MTK, IPA
    subject_group_id TEXT    NOT NULL,
    teacher_id       TEXT,                       -- guru pengampu (dari profiles, role=guru)
    description      TEXT,
    credits          INTEGER,
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_group_id) REFERENCES subject_groups(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id)
);

-- ─── 2.3 classes ─────────────────────────────────────────────────────────────
-- Data kelas. teacher_id = wali kelas (profile guru dengan jabatan "Wali Kelas").
-- Dipakai Admin, disinkron ke: Kurikulum (jadwal), Keuangan (SPP), Guru, Ortu.
CREATE TABLE classes (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,           -- contoh: "Kelas 1A"
    grade_level      TEXT    NOT NULL,           -- contoh: "1", "2", "6"
    academic_year_id TEXT    NOT NULL,
    teacher_id       TEXT,                       -- wali kelas (profiles.id, role=guru)
    capacity         INTEGER,
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id)
);

-- ─── 2.4 students ────────────────────────────────────────────────────────────
-- Data siswa. Dibuat Admin via upload template atau input manual.
-- Sinkron ke: Kurikulum, Keuangan, Guru, Guru Bimbel, Orang Tua.
CREATE TABLE students (
    id              TEXT    PRIMARY KEY,
    profile_id      TEXT    UNIQUE,              -- link ke profiles jika siswa punya akun
    nis             TEXT    UNIQUE NOT NULL,      -- Nomor Induk Siswa
    nisn            TEXT    UNIQUE,              -- Nomor Induk Siswa Nasional (opsional)
    full_name       TEXT    NOT NULL,
    gender          TEXT    CHECK (gender IN ('L', 'P')),
    birth_date      DATE,
    birth_place     TEXT,
    parent_name     TEXT,                        -- nama ayah / wali
    mother_name     TEXT,
    parent_job      TEXT,
    mother_job      TEXT,
    address         TEXT,
    phone           TEXT,
    username        TEXT,
    status          TEXT    NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    enrollment_date DATE    NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- ─── 2.5 class_students ──────────────────────────────────────────────────────
-- Relasi siswa-kelas per tahun ajaran. Berubah saat naik kelas (Kurikulum).
CREATE TABLE class_students (
    id               TEXT    PRIMARY KEY,
    class_id         TEXT    NOT NULL,
    student_id       TEXT    NOT NULL,
    academic_year_id TEXT    NOT NULL,
    enrollment_date  DATE,
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE (class_id, student_id, academic_year_id)
);

-- ─── 2.6 parent_students ─────────────────────────────────────────────────────
-- Relasi akun Orang Tua ke siswa. Satu ortu bisa punya lebih dari satu anak.
-- Dipakai di login: menentukan data siswa mana yang ditampilkan ke ortu.
CREATE TABLE parent_students (
    id         TEXT    PRIMARY KEY,
    parent_id  TEXT    NOT NULL,    -- profiles.id (role = ortu)
    student_id TEXT    NOT NULL,    -- students.id
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES profiles(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE (parent_id, student_id)
);


-- =============================================================================
-- BAGIAN 3 — JADWAL PELAJARAN
-- =============================================================================

-- ─── 3.1 schedule_periods ────────────────────────────────────────────────────
-- Definisi jam ke-1, ke-2, istirahat, dll. Dibuat Admin di pengaturan.
CREATE TABLE schedule_periods (
    id               TEXT    PRIMARY KEY,
    period_number    INTEGER NOT NULL,
    start_time       TEXT    NOT NULL,   -- format "HH:MM"
    end_time         TEXT    NOT NULL,
    duration_minutes INTEGER,
    label            TEXT,               -- contoh: "Istirahat", "Jam ke-1"
    academic_year_id TEXT    NOT NULL,
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE (academic_year_id, period_number)
);

-- ─── 3.2 schedules ───────────────────────────────────────────────────────────
-- Jadwal pelajaran per kelas. Dibuat Kurikulum, dibaca Guru & Orang Tua.
CREATE TABLE schedules (
    id               TEXT    PRIMARY KEY,
    class_id         TEXT    NOT NULL,
    subject_id       TEXT    NOT NULL,
    teacher_id       TEXT,               -- guru pengampu kelas ini (bisa beda dari subjects.teacher_id)
    day_of_week      TEXT    NOT NULL    -- 'Senin' | 'Selasa' | ... | 'Sabtu'
                             CHECK (day_of_week IN ('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')),
    period_id        TEXT    NOT NULL,
    academic_year_id TEXT    NOT NULL,
    room             TEXT,
    is_published     INTEGER NOT NULL DEFAULT 0,   -- 1 = sudah dipublikasi ke guru & ortu
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_by       TEXT,
    updated_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    FOREIGN KEY (period_id) REFERENCES schedule_periods(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);


-- =============================================================================
-- BAGIAN 4 — ABSENSI & NILAI
-- =============================================================================

-- ─── 4.1 attendance ──────────────────────────────────────────────────────────
-- Kehadiran siswa per hari per kelas. Input oleh Guru Mapel / Wali Kelas.
-- Dibaca: Kurikulum (rekap), Orang Tua (monitoring harian).
CREATE TABLE attendance (
    id          TEXT    PRIMARY KEY,
    student_id  TEXT    NOT NULL,
    class_id    TEXT    NOT NULL,
    schedule_id TEXT,               -- jadwal spesifik (opsional)
    date        DATE    NOT NULL,
    status      TEXT    NOT NULL    CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
    remarks     TEXT,
    created_by  TEXT,               -- profiles.id guru yang input
    updated_by  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    UNIQUE (student_id, class_id, date)
);

-- ─── 4.2 grade_types ─────────────────────────────────────────────────────────
-- Jenis penilaian (UH 1, UH 2, UTS, UAS, dll). Dibuat Kurikulum.
-- Tersinkron ke: Guru Mapel (input nilai), Orang Tua (lihat hasil belajar).
CREATE TABLE grade_types (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,       -- contoh: "UH 1", "UTS", "UAS"
    code             TEXT    NOT NULL,       -- contoh: "uh1", "uts", "uas"
    weight           REAL    DEFAULT 1.0,    -- bobot untuk kalkulasi nilai akhir
    academic_year_id TEXT    NOT NULL,
    semester         INTEGER,
    sort_order       INTEGER DEFAULT 0,
    is_active        INTEGER NOT NULL DEFAULT 1,
    created_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE (code, academic_year_id, semester)
);

-- ─── 4.3 grades ──────────────────────────────────────────────────────────────
-- Nilai siswa per mapel per jenis penilaian. Input oleh Guru Mapel.
-- Dibaca: Kurikulum (manajemen nilai, rapot), Orang Tua (ikon Hasil Belajar).
CREATE TABLE grades (
    id               TEXT    PRIMARY KEY,
    student_id       TEXT    NOT NULL,
    subject_id       TEXT    NOT NULL,
    class_id         TEXT    NOT NULL,
    academic_year_id TEXT    NOT NULL,
    semester         INTEGER,                  -- 1 atau 2, sync dari academic_years
    grade_type_id    TEXT,                   -- FK ke grade_types (jenis ujian)
    assessment_type  TEXT,                   -- fallback text jika grade_type_id null
    grade_value      DECIMAL(5, 2),
    grade_letter     TEXT,
    kkm              DECIMAL(5, 2),          -- Kriteria Ketuntasan Minimal
    exam_date        DATE,
    remarks          TEXT,
    created_by       TEXT,
    updated_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    FOREIGN KEY (grade_type_id) REFERENCES grade_types(id),
    UNIQUE (student_id, subject_id, academic_year_id, grade_type_id)
);

-- ─── 4.4 rapor_descriptions ──────────────────────────────────────────────────
-- Deskripsi capaian pembelajaran per mapel per guru — dipakai di cetak rapor.
-- Diisi Guru Mapel di menu "Master Deskripsi", dibaca Kurikulum (rapot) & Ortu.
CREATE TABLE rapor_descriptions (
    id               TEXT    PRIMARY KEY,
    subject_id       TEXT    NOT NULL,
    class_id         TEXT    NOT NULL,
    teacher_id       TEXT    NOT NULL,       -- guru yang mengisi
    academic_year_id TEXT    NOT NULL,
    semester         INTEGER,
    description_text TEXT,                   -- deskripsi capaian umum
    predicate_A      TEXT,                   -- deskripsi untuk nilai A (sangat baik)
    predicate_B      TEXT,                   -- deskripsi untuk nilai B (baik)
    predicate_C      TEXT,                   -- deskripsi untuk nilai C (cukup)
    predicate_D      TEXT,                   -- deskripsi untuk nilai D (perlu bimbingan)
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE (subject_id, class_id, academic_year_id, semester)
);


-- =============================================================================
-- BAGIAN 5 — UJIAN (JADWAL & CBT)
-- =============================================================================

-- ─── 5.1 exams ───────────────────────────────────────────────────────────────
-- Master ujian (UTS, UAS, dll). Dibuat Kurikulum.
CREATE TABLE exams (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,       -- contoh: "UTS Semester 1 2025/2026"
    type             TEXT    NOT NULL,       -- UTS | UAS | PAS | PAT | UH
    academic_year_id TEXT    NOT NULL,
    semester         INTEGER,
    status           TEXT    NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'published', 'ongoing', 'finished')),
    created_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- ─── 5.2 exam_schedules ──────────────────────────────────────────────────────
-- Jadwal ujian per kelas per mapel. Dibuat Kurikulum, dipublikasi ke Ortu.
CREATE TABLE exam_schedules (
    id          TEXT    PRIMARY KEY,
    exam_id     TEXT    NOT NULL,
    class_id    TEXT    NOT NULL,
    subject_id  TEXT    NOT NULL,
    teacher_id  TEXT,
    exam_date   TEXT    NOT NULL,       -- format "YYYY-MM-DD"
    start_time  TEXT    NOT NULL,       -- format "HH:MM"
    end_time    TEXT    NOT NULL,
    room        TEXT,
    notes       TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES profiles(id)
);

-- ─── 5.3 exam_questions ──────────────────────────────────────────────────────
-- Soal ujian (untuk fitur CBT online).
CREATE TABLE exam_questions (
    id              TEXT    PRIMARY KEY,
    exam_id         TEXT    NOT NULL,
    subject_id      TEXT,
    question_number INTEGER NOT NULL,
    question_text   TEXT    NOT NULL,
    question_type   TEXT    NOT NULL CHECK (question_type IN ('pg', 'essay')),
    option_a        TEXT,
    option_b        TEXT,
    option_c        TEXT,
    option_d        TEXT,
    correct_answer  TEXT,               -- 'A'|'B'|'C'|'D' untuk PG, atau kunci untuk essay
    points          INTEGER DEFAULT 1,
    created_by      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- ─── 5.4 exam_sessions ───────────────────────────────────────────────────────
-- Sesi pengerjaan ujian per siswa.
CREATE TABLE exam_sessions (
    id           TEXT    PRIMARY KEY,
    exam_id      TEXT    NOT NULL,
    student_id   TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'submitted', 'expired')),
    total_score  INTEGER,
    started_at   DATETIME,
    submitted_at DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE (exam_id, student_id)
);

-- ─── 5.5 exam_answers ────────────────────────────────────────────────────────
-- Jawaban siswa per soal.
CREATE TABLE exam_answers (
    id          TEXT    PRIMARY KEY,
    session_id  TEXT    NOT NULL,
    question_id TEXT    NOT NULL,
    student_id  TEXT    NOT NULL,
    answer      TEXT,
    score       INTEGER,
    graded_by   TEXT,
    graded_at   DATETIME,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (question_id) REFERENCES exam_questions(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE (session_id, question_id)
);


-- =============================================================================
-- BAGIAN 6 — PENGUMUMAN
-- =============================================================================

-- ─── 6.1 announcements ───────────────────────────────────────────────────────
-- Pengumuman dari Admin (ke semua) dan Kepala Sekolah (ke Guru & Staff saja).
-- target: 'Semua' | 'Guru' | 'Siswa' | 'Orang Tua'
CREATE TABLE announcements (
    id           TEXT    PRIMARY KEY,
    title        TEXT    NOT NULL,
    content      TEXT    NOT NULL,
    category     TEXT,
    target       TEXT    DEFAULT 'Semua'
                         CHECK (target IN ('Semua', 'Guru', 'Siswa', 'Orang Tua')),
    target_class TEXT,                   -- opsional: filter kelas tertentu
    end_date     TEXT,
    is_pinned    INTEGER DEFAULT 0,
    status       TEXT    DEFAULT 'Draft' CHECK (status IN ('Draft', 'Terbit', 'Arsip')),
    viewers      INTEGER DEFAULT 0,
    publish_date DATETIME,
    created_by   TEXT    NOT NULL,       -- profiles.id (admin atau ks)
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- ─── 6.2 broadcasts ──────────────────────────────────────────────────────────
-- Tracking pengiriman & pembacaan pengumuman per penerima.
CREATE TABLE broadcasts (
    id              TEXT    PRIMARY KEY,
    announcement_id TEXT    NOT NULL,
    recipient_type  TEXT,               -- 'guru' | 'ortu' | 'siswa'
    recipient_id    TEXT,               -- profiles.id penerima
    read_status     INTEGER DEFAULT 0,
    read_at         DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id)
);


-- =============================================================================
-- BAGIAN 7 — KEUANGAN
-- =============================================================================

-- ─── 7.1 student_bills ───────────────────────────────────────────────────────
-- Tagihan siswa (SPP + jenis pembayaran lain). Dibuat/dikelola Keuangan.
-- Dibaca Orang Tua di ikon "Pembayaran".
CREATE TABLE student_bills (
    id           TEXT    PRIMARY KEY,
    student_id   TEXT    NOT NULL,
    payment_name TEXT    NOT NULL,       -- contoh: "SPP Januari 2026", "Seragam"
    amount       DECIMAL(15, 2) NOT NULL,
    period       TEXT,                   -- contoh: "2026-01"
    type         TEXT    DEFAULT 'BULANAN' CHECK (type IN ('BULANAN','TAHUNAN','INSIDENTAL')),
    status       TEXT    NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'partial', 'paid', 'cancelled')),
    due_date     DATE,
    notes        TEXT,
    created_by   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ─── 7.2 payment_transactions ────────────────────────────────────────────────
-- Riwayat transaksi pembayaran per tagihan.
CREATE TABLE payment_transactions (
    id               TEXT    PRIMARY KEY,
    bill_id          TEXT    NOT NULL,
    student_id       TEXT    NOT NULL,
    amount           DECIMAL(15, 2) NOT NULL,
    payment_method   TEXT,               -- 'tunai' | 'transfer' | 'qris'
    transaction_date DATE    NOT NULL,
    payment_date     TEXT,
    type             TEXT,
    status           TEXT    DEFAULT 'success' CHECK (status IN ('success','pending','failed','refunded')),
    reference_number TEXT,
    notes            TEXT,
    recorded_by      TEXT,               -- profiles.id petugas keuangan
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES student_bills(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ─── 7.3 expenses ────────────────────────────────────────────────────────────
-- Pengeluaran sekolah. Diinput Keuangan, dilihat KS (read only).
CREATE TABLE expenses (
    id             TEXT    PRIMARY KEY,
    category       TEXT    NOT NULL,
    description    TEXT    NOT NULL,
    amount         DECIMAL(15, 2) NOT NULL,
    expense_date   DATE    NOT NULL,
    payment_method TEXT,
    proof          TEXT,                 -- URL bukti pembayaran
    status         TEXT    DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    notes          TEXT,
    created_by     TEXT    NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- ─── 7.4 savings_accounts ────────────────────────────────────────────────────
-- Akun tabungan siswa. Dikelola Keuangan, dilihat Orang Tua (ikon Tabungan).
CREATE TABLE savings_accounts (
    id             TEXT    PRIMARY KEY,
    student_id     TEXT    UNIQUE NOT NULL,
    account_number TEXT,
    balance        DECIMAL(15, 2) DEFAULT 0.00,
    opened_date    DATE,
    status         TEXT    DEFAULT 'active' CHECK (status IN ('active','closed','frozen')),
    is_active      INTEGER DEFAULT 1,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ─── 7.5 savings_transactions ────────────────────────────────────────────────
-- Riwayat setor/tarik tabungan. Ditampilkan lengkap ke Orang Tua (jam, tanggal).
CREATE TABLE savings_transactions (
    id            TEXT    PRIMARY KEY,
    account_id    TEXT    NOT NULL,
    student_id    TEXT    NOT NULL,
    type          TEXT    NOT NULL CHECK (type IN ('setor', 'tarik')),
    amount        DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2),
    notes         TEXT,
    officer       TEXT,               -- nama/ID petugas keuangan
    date          DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES savings_accounts(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- ─── 7.6 payment_types ────────────────────────────────────────────────────────
-- Master jenis pembayaran (SPP, Uang Pangkal, Seragam, dll).
-- Dibuat/dikelola Keuangan di menu "Data Dasar".
CREATE TABLE payment_types (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,              -- "SPP Bulanan", "Uang Pangkal"
    type        TEXT NOT NULL               -- 'BULANAN' | 'TAHUNAN' | 'SEKALI' | 'CICILAN'
                CHECK (type IN ('BULANAN','TAHUNAN','SEKALI','CICILAN')),
    amount      DECIMAL(15,2) NOT NULL,     -- Nominal default
    category    TEXT DEFAULT 'Lainnya',
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7.7 payment_type_classes ─────────────────────────────────────────────────
-- Nominal SPP per tahun ajaran. Jika ada, pakai custom_amount; jika tidak, fallback ke payment_types.amount.
CREATE TABLE payment_type_classes (
    id               TEXT PRIMARY KEY,
    payment_type_id  TEXT NOT NULL,          -- FK ke payment_types
    academic_year_id TEXT NOT NULL,          -- FK ke academic_years
    custom_amount    DECIMAL(15,2) NOT NULL, -- Nominal khusus untuk tahun ini
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(payment_type_id, academic_year_id) -- 1 jenis per tahun hanya 1 baris
);

-- ─── 7.8 student_bill_installments ────────────────────────────────────────────
-- Cicilan per tagihan. Digunakan untuk tipe CICILAN (Uang Pangkal, dll).
-- Jumlah cicilan diatur user (bisa 5, 10, atau lainnya).
CREATE TABLE student_bill_installments (
    id              TEXT PRIMARY KEY,
    bill_id         TEXT NOT NULL,           -- FK ke student_bills
    installment_no  INTEGER NOT NULL,       -- Urutan cicilan (1, 2, 3...)
    amount          DECIMAL(15,2) NOT NULL,  -- Nominal cicilan
    due_date        DATE,                    -- Jatuh tempo cicilan ini
    status          TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','overdue')),
    paid_amount     DECIMAL(15,2) DEFAULT 0,
    paid_date       DATE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES student_bills(id)
);

-- ─── 7.9 cash_accounts ────────────────────────────────────────────────────────
-- Akun kas/bank sekolah. Menampilkan saldo kas saat ini.
CREATE TABLE cash_accounts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,              -- "Kas Utama", "Bank BCA"
    type        TEXT NOT NULL               -- 'KAS' | 'BANK'
                CHECK (type IN ('KAS','BANK')),
    balance     DECIMAL(15,2) DEFAULT 0,
    number      TEXT,                       -- Nomor rekening (untuk bank)
    is_primary  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7.10 school_bank_accounts ────────────────────────────────────────────────
-- Rekening bank sekolah untuk pembayaran transfer.
-- Ditampilkan ke orang tua saat memilih metode transfer.
CREATE TABLE school_bank_accounts (
    id          TEXT PRIMARY KEY,
    bank        TEXT NOT NULL,              -- "BCA", "Mandiri"
    number      TEXT NOT NULL,              -- Nomor rekening
    name        TEXT NOT NULL,              -- Atas nama
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7.11 finance_settings ────────────────────────────────────────────────────
-- Pengaturan keuangan: nama bendahara, tanda tangan, footer kuitansi, logo, dll.
-- Disimpan sebagai key-value pairs.
CREATE TABLE finance_settings (
    id          TEXT PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,       -- 'treasurer_name', 'receipt_footer', dll
    value       TEXT NOT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7.12 expense_categories ──────────────────────────────────────────────────
-- Master kategori pengeluaran. Dikelola Keuangan di menu "Pengaturan".
CREATE TABLE expense_categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    is_active   INTEGER DEFAULT 1,
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- BAGIAN 8 — BIMBINGAN BELAJAR (LES)
-- =============================================================================

-- ─── 8.1 tutoring_subjects ───────────────────────────────────────────────────
-- Mata pelajaran bimbel. Dibuat Admin di menu Bimbingan Belajar.
CREATE TABLE tutoring_subjects (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    classes  TEXT,               -- JSON array kelas yang bisa ikut, contoh: '["1A","2A"]'
    meetings INTEGER DEFAULT 10, -- total pertemuan per paket
    status   TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif'))
);

-- ─── 8.2 tutoring_teachers ───────────────────────────────────────────────────
-- Data guru bimbel. Dibuat Admin, dilink ke profiles (role=gb).
-- Ini tabel referensi guru bimbel yang dibuat Admin — berbeda dari akun login (profiles).
CREATE TABLE tutoring_teachers (
    id             TEXT    PRIMARY KEY,
    profile_id     TEXT,               -- FK ke profiles (role=gb) — bisa null jika belum punya akun
    name           TEXT    NOT NULL,
    source         TEXT    DEFAULT 'internal' CHECK (source IN ('internal','external')),
    subject_id     TEXT,               -- mata pelajaran bimbel utama
    subject_name   TEXT,
    class_id       TEXT,               -- kelas yang diampu
    schedule_day   TEXT,
    schedule_start TEXT,
    schedule_end   TEXT,
    students_count INTEGER DEFAULT 0,
    status         TEXT    DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Tidak Aktif')),
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- ─── 8.3 tutoring_classes ────────────────────────────────────────────────────
-- Kelas / grup bimbel. Dibuat Admin, dikelola Guru Bimbel.
CREATE TABLE tutoring_classes (
    id               TEXT    PRIMARY KEY,
    name             TEXT    NOT NULL,
    teacher_id       TEXT    NOT NULL,   -- tutoring_teachers.id
    subject_id       TEXT,               -- tutoring_subjects.id
    subject          TEXT,               -- nama mapel (cache)
    schedule         TEXT,               -- deskripsi jadwal teks
    room             TEXT,
    max_students     INTEGER,
    current_students INTEGER DEFAULT 0,
    sessions         TEXT,               -- JSON array sesi/pertemuan
    status           TEXT    DEFAULT 'active' CHECK (status IN ('active','inactive','finished')),
    description      TEXT,
    is_active        INTEGER DEFAULT 1,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 8.4 tutoring_enrollments ────────────────────────────────────────────────
-- Siswa yang terdaftar di kelas bimbel. Dipilih Admin saat setup bimbel.
-- Dipakai Guru Bimbel untuk input kehadiran & nilai.
CREATE TABLE tutoring_enrollments (
    id                TEXT    PRIMARY KEY,
    group_id          TEXT    NOT NULL,   -- tutoring_classes.id
    student_id        TEXT    NOT NULL,   -- students.id
    student_name      TEXT,               -- cache nama siswa
    class_name        TEXT,               -- cache nama kelas asal
    enrollment_date   TEXT,
    status            TEXT    DEFAULT 'active' CHECK (status IN ('active','inactive','finished')),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE (group_id, student_id)
);

-- ─── 8.5 bimbel_attendance ───────────────────────────────────────────────────
-- Kehadiran siswa per sesi bimbel. Input Guru Bimbel, dibaca Orang Tua (ikon Bimbingan).
CREATE TABLE bimbel_attendance (
    id                TEXT    PRIMARY KEY,
    enrollment_id     TEXT    NOT NULL,
    tutoring_class_id TEXT    NOT NULL,
    student_id        TEXT    NOT NULL,
    session_number    INTEGER,            -- pertemuan ke-berapa
    date              DATE    NOT NULL,
    status            TEXT    NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
    notes             TEXT,
    created_by        TEXT,               -- profiles.id guru bimbel
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES tutoring_enrollments(id),
    FOREIGN KEY (tutoring_class_id) REFERENCES tutoring_classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE (enrollment_id, date)
);

-- ─── 8.6 bimbel_progress ─────────────────────────────────────────────────────
-- Nilai perkembangan siswa bimbel per sesi. Input Guru Bimbel, dibaca Orang Tua.
CREATE TABLE bimbel_progress (
    id                TEXT    PRIMARY KEY,
    enrollment_id     TEXT    NOT NULL,
    tutoring_class_id TEXT    NOT NULL,
    student_id        TEXT    NOT NULL,
    session_number    INTEGER,            -- pertemuan ke-berapa
    report_type       TEXT    NOT NULL,   -- 'nilai' | 'catatan' | 'perkembangan'
    title             TEXT,
    score             REAL,
    score_date        DATE,
    month             TEXT,
    notes             TEXT,
    recommendation    TEXT,
    created_by        TEXT,
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- BAGIAN 9 — MATERI & LATIHAN
-- =============================================================================

-- ─── 9.1 materi ──────────────────────────────────────────────────────────────
-- Materi belajar (link Google Drive / file). Diupload Guru Mapel.
-- Dibaca Orang Tua di ikon "Materi dan Latihan".
CREATE TABLE materi (
    id           TEXT    PRIMARY KEY,
    title        TEXT    NOT NULL,
    class_id     TEXT    NOT NULL,
    subject_name TEXT    DEFAULT '',
    subject_id   TEXT,
    teacher_id   TEXT,                   -- guru yang upload
    drive_link   TEXT    NOT NULL,
    publish_date TEXT    NOT NULL,
    status       TEXT    DEFAULT 'Draft' CHECK (status IN ('Draft','Terbit','Arsip')),
    created_by   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- ─── 9.2 latihan_soal ────────────────────────────────────────────────────────
-- Soal latihan mandiri untuk siswa. Dibuat Guru Mapel.
-- Dibaca Orang Tua di ikon "Materi dan Latihan".
CREATE TABLE latihan_soal (
    id           TEXT    PRIMARY KEY,
    title        TEXT    NOT NULL,
    class_id     TEXT    NOT NULL,
    subject_name TEXT    DEFAULT '',
    subject_id   TEXT,
    teacher_id   TEXT,
    type         TEXT    DEFAULT 'PG' CHECK (type IN ('PG','Essay','Campuran')),
    questions    TEXT    DEFAULT '[]',   -- JSON array soal
    publish_date TEXT    NOT NULL,
    status       TEXT    DEFAULT 'Draft' CHECK (status IN ('Draft','Terbit','Arsip')),
    created_by   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);


-- =============================================================================
-- BAGIAN 10 — KENAIKAN KELAS
-- =============================================================================

-- ─── 10.1 promotion_history ──────────────────────────────────────────────────
-- Riwayat naik kelas per siswa. Diproses Kurikulum di menu naik_kelas.
-- Kolom kelas di seluruh sistem berubah otomatis (class_students diupdate).
CREATE TABLE promotion_history (
    id               TEXT    PRIMARY KEY,
    student_id       TEXT    NOT NULL,
    from_class_id    TEXT,               -- kelas asal
    to_class_id      TEXT,               -- kelas tujuan (null jika lulus)
    academic_year_id TEXT    NOT NULL,   -- tahun ajaran kenaikan
    promotion_date   DATE,
    status           TEXT    CHECK (status IN ('naik','tinggal','lulus','pindah')),
    remarks          TEXT,
    processed_by     TEXT,               -- profiles.id kurikulum yang memproses
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (from_class_id) REFERENCES classes(id),
    FOREIGN KEY (to_class_id) REFERENCES classes(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);


-- =============================================================================
-- BAGIAN 11 — MULTIMEDIA & AI
-- =============================================================================

-- ─── 11.1 multimedia_settings ────────────────────────────────────────────────
-- Channel sekolah (link YouTube). Diinput Admin, dilihat Guru & Orang Tua & KS.
CREATE TABLE multimedia_settings (
    id       TEXT    PRIMARY KEY,
    name     TEXT    NOT NULL DEFAULT 'Channel Sekolah',
    autoplay INTEGER DEFAULT 0,
    mode     TEXT    DEFAULT 'manual' CHECK (mode IN ('manual','playlist')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 11.2 multimedia_videos ──────────────────────────────────────────────────
-- Daftar video YouTube untuk channel sekolah.
CREATE TABLE multimedia_videos (
    id           TEXT    PRIMARY KEY,
    setting_id   TEXT    NOT NULL,
    title        TEXT    NOT NULL,
    youtube_url  TEXT    NOT NULL,
    thumbnail    TEXT,
    description  TEXT,
    sort_order   INTEGER DEFAULT 0,
    is_active    INTEGER DEFAULT 1,
    created_by   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (setting_id) REFERENCES multimedia_settings(id)
);

-- ─── 11.3 ai_providers ───────────────────────────────────────────────────────
-- Provider AI (Google Gemini, OpenAI, dll). Dikonfigurasi Admin.
CREATE TABLE ai_providers (
    id         TEXT    PRIMARY KEY,
    name       TEXT    NOT NULL,
    type       TEXT    NOT NULL,   -- 'LLM' | 'Vision' | 'Embedding'
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 11.4 ai_api_keys ────────────────────────────────────────────────────────
-- API Key untuk provider AI. Diinput Admin di menu ai_management.
-- Dipakai oleh fitur "Belajar dengan AI" di akun Guru & Orang Tua.
CREATE TABLE ai_api_keys (
    id          TEXT    PRIMARY KEY,
    provider_id TEXT    NOT NULL,
    api_key     TEXT    NOT NULL,
    api_url     TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_by  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
);

-- ─── 11.5 ai_system_settings ─────────────────────────────────────────────────
-- Key-value pengaturan sistem AI (system prompt, model, dll).
CREATE TABLE ai_system_settings (
    id            TEXT    PRIMARY KEY,
    setting_key   TEXT    UNIQUE NOT NULL,
    setting_value TEXT,
    description   TEXT,
    updated_by    TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 11.6 positions ───────────────────────────────────────────────────────────
-- Daftar jabatan/staf yang bisa dipilih saat input data guru.
-- Hanya untuk guru & staff reguler (Bimbel dikelola terpisah).
CREATE TABLE positions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL UNIQUE,
    category  TEXT    NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: 6 jabatan utama
INSERT INTO positions (id, name, category) VALUES
(1, 'Operator Data',           'Teknis'),
(2, 'Kepala Sekolah',          'Struktural'),
(3, 'Wakil Kurikulum',         'Struktural'),
(4, 'Staff Tata Usaha/Keuangan','Staff'),
(5, 'Guru Mata Pelajaran',     'Fungsional'),
(6, 'Wali Kelas',              'Fungsional');


-- =============================================================================
-- BAGIAN 12 — INDEXES
-- =============================================================================

-- Profiles & Staff
CREATE INDEX idx_profiles_email   ON profiles(email);
CREATE INDEX idx_profiles_role    ON profiles(role);
CREATE INDEX idx_profiles_active  ON profiles(is_active);
CREATE INDEX idx_staff_profile    ON staff(profile_id);
CREATE INDEX idx_staff_nip        ON staff(nip);
CREATE INDEX idx_staff_position   ON staff(position);

-- Positions
CREATE INDEX idx_positions_name   ON positions(name);
CREATE INDEX idx_positions_active ON positions(is_active);

-- Subjects & Classes
CREATE INDEX idx_subjects_code    ON subjects(code);
CREATE INDEX idx_subjects_group   ON subjects(subject_group_id);
CREATE INDEX idx_subjects_teacher ON subjects(teacher_id);
CREATE INDEX idx_classes_year     ON classes(academic_year_id);
CREATE INDEX idx_classes_teacher  ON classes(teacher_id);
CREATE INDEX idx_classes_grade    ON classes(grade_level);
CREATE INDEX idx_classes_active   ON classes(is_active);

-- Students
CREATE INDEX idx_students_nis     ON students(nis);
CREATE INDEX idx_students_nisn    ON students(nisn);
CREATE INDEX idx_students_status  ON students(status);
CREATE INDEX idx_cs_student       ON class_students(student_id);
CREATE INDEX idx_cs_class         ON class_students(class_id);
CREATE INDEX idx_cs_year          ON class_students(academic_year_id);
CREATE INDEX idx_cs_active        ON class_students(is_active);
CREATE INDEX idx_ps_parent        ON parent_students(parent_id);
CREATE INDEX idx_ps_student       ON parent_students(student_id);

-- Schedules
CREATE INDEX idx_schedules_class   ON schedules(class_id);
CREATE INDEX idx_schedules_teacher ON schedules(teacher_id);
CREATE INDEX idx_schedules_subject ON schedules(subject_id);
CREATE INDEX idx_schedules_day     ON schedules(day_of_week);
CREATE INDEX idx_schedules_year    ON schedules(academic_year_id);
CREATE INDEX idx_schedules_pub     ON schedules(is_published);

-- Attendance & Grades
CREATE INDEX idx_att_student  ON attendance(student_id);
CREATE INDEX idx_att_class    ON attendance(class_id);
CREATE INDEX idx_att_date     ON attendance(date);
CREATE INDEX idx_att_status   ON attendance(status);
CREATE INDEX idx_grd_student  ON grades(student_id);
CREATE INDEX idx_grd_subject  ON grades(subject_id);
CREATE INDEX idx_grd_class    ON grades(class_id);
CREATE INDEX idx_grd_year     ON grades(academic_year_id);
CREATE INDEX idx_grd_semester ON grades(semester);
CREATE INDEX idx_grd_type     ON grades(grade_type_id);
CREATE INDEX idx_gt_year      ON grade_types(academic_year_id);
CREATE INDEX idx_rd_subject   ON rapor_descriptions(subject_id);
CREATE INDEX idx_rd_class     ON rapor_descriptions(class_id);
CREATE INDEX idx_rd_teacher   ON rapor_descriptions(teacher_id);

-- Exams
CREATE INDEX idx_exsched_exam    ON exam_schedules(exam_id);
CREATE INDEX idx_exsched_class   ON exam_schedules(class_id);
CREATE INDEX idx_exq_exam        ON exam_questions(exam_id);
CREATE INDEX idx_exses_student   ON exam_sessions(student_id);
CREATE INDEX idx_exses_exam      ON exam_sessions(exam_id);
CREATE INDEX idx_exans_session   ON exam_answers(session_id);
CREATE INDEX idx_exans_student   ON exam_answers(student_id);

-- Announcements
CREATE INDEX idx_ann_status      ON announcements(status);
CREATE INDEX idx_ann_target      ON announcements(target);
CREATE INDEX idx_ann_created_by  ON announcements(created_by);
CREATE INDEX idx_bc_announcement ON broadcasts(announcement_id);
CREATE INDEX idx_bc_recipient    ON broadcasts(recipient_id);

-- Keuangan
CREATE INDEX idx_bills_student   ON student_bills(student_id);
CREATE INDEX idx_bills_status    ON student_bills(status);
CREATE INDEX idx_bills_due       ON student_bills(due_date);
CREATE INDEX idx_pay_bill        ON payment_transactions(bill_id);
CREATE INDEX idx_pay_student     ON payment_transactions(student_id);
CREATE INDEX idx_pay_date        ON payment_transactions(transaction_date);
CREATE INDEX idx_exp_date        ON expenses(expense_date);
CREATE INDEX idx_exp_status      ON expenses(status);
CREATE INDEX idx_sav_student     ON savings_accounts(student_id);
CREATE INDEX idx_savt_account    ON savings_transactions(account_id);
CREATE INDEX idx_savt_student    ON savings_transactions(student_id);
CREATE INDEX idx_savt_date       ON savings_transactions(date);
CREATE INDEX idx_pt_type         ON payment_types(type);
CREATE INDEX idx_pt_active       ON payment_types(is_active);
CREATE INDEX idx_ptc_type        ON payment_type_classes(payment_type_id);
CREATE INDEX idx_ptc_year        ON payment_type_classes(academic_year_id);
CREATE INDEX idx_sbi_bill        ON student_bill_installments(bill_id);
CREATE INDEX idx_sbi_status      ON student_bill_installments(status);
CREATE INDEX idx_ca_type         ON cash_accounts(type);
CREATE INDEX idx_sba_active      ON school_bank_accounts(is_active);

-- Bimbel
CREATE INDEX idx_tc_teacher      ON tutoring_classes(teacher_id);
CREATE INDEX idx_te_group        ON tutoring_enrollments(group_id);
CREATE INDEX idx_te_student      ON tutoring_enrollments(student_id);
CREATE INDEX idx_ba_class        ON bimbel_attendance(tutoring_class_id);
CREATE INDEX idx_ba_student      ON bimbel_attendance(student_id);
CREATE INDEX idx_ba_date         ON bimbel_attendance(date);
CREATE INDEX idx_bp_class        ON bimbel_progress(tutoring_class_id);
CREATE INDEX idx_bp_student      ON bimbel_progress(student_id);

-- Materi & Latihan
CREATE INDEX idx_mat_class_status ON materi(class_id, status);
CREATE INDEX idx_lat_class_status ON latihan_soal(class_id, status);

-- Promotion
CREATE INDEX idx_promo_student   ON promotion_history(student_id);
CREATE INDEX idx_promo_year      ON promotion_history(academic_year_id);

-- Audit
CREATE INDEX idx_audit_user      ON audit_logs(user_id);
CREATE INDEX idx_audit_ts        ON audit_logs(timestamp);
CREATE INDEX idx_audit_module    ON audit_logs(module);
CREATE INDEX idx_audit_role      ON audit_logs(user_role);

-- AI
CREATE INDEX idx_aikey_provider  ON ai_api_keys(provider_id);
CREATE INDEX idx_aik_active      ON ai_api_keys(is_active);


-- =============================================================================
-- BAGIAN 13 — SEED DATA (Data Awal Wajib)
-- =============================================================================

-- ─── Tahun Ajaran ─────────────────────────────────────────────────────────────
INSERT INTO academic_years (id, name, start_date, end_date, semester, is_active) VALUES
    ('ay-2025-2026-1', '2025/2026 - Semester 1', '2025-07-01', '2025-12-31', 1, 0),
    ('ay-2025-2026-2', '2025/2026 - Semester 2', '2026-01-01', '2026-06-30', 2, 1);

-- ─── Pengaturan Sekolah ────────────────────────────────────────────────────────
INSERT INTO school_settings (id, school_name, school_address, principal_name, academic_year_id, semester) VALUES
    ('settings-school', 'EduAdmin School', 'Jl. Pendidikan No. 1, Samarinda', 'Kepala Sekolah', 'ay-2025-2026-2', 2);

-- ─── Kelompok Mata Pelajaran ───────────────────────────────────────────────────
INSERT INTO subject_groups (id, name, description) VALUES
    ('sg-001', 'Matematika & IPA',  'Kelompok mata pelajaran MIPA'),
    ('sg-002', 'Bahasa & Sastra',   'Kelompok mata pelajaran Bahasa'),
    ('sg-003', 'IPS & PKN',         'Kelompok mata pelajaran Sosial'),
    ('sg-004', 'Olahraga & Seni',   'Kelompok mata pelajaran Kesehatan & Seni'),
    ('sg-005', 'Agama & Karakter',  'Kelompok mata pelajaran Agama');

-- ─── Jam Pelajaran ─────────────────────────────────────────────────────────────
INSERT INTO schedule_periods (id, period_number, start_time, end_time, duration_minutes, label, academic_year_id) VALUES
    ('per-1',  1, '07:00', '07:45', 45, 'Jam ke-1',    'ay-2025-2026-2'),
    ('per-2',  2, '07:45', '08:30', 45, 'Jam ke-2',    'ay-2025-2026-2'),
    ('per-3',  3, '08:30', '09:15', 45, 'Jam ke-3',    'ay-2025-2026-2'),
    ('per-4',  4, '09:15', '10:00', 45, 'Jam ke-4',    'ay-2025-2026-2'),
    ('per-br', 5, '10:00', '10:15', 15, 'Istirahat',   'ay-2025-2026-2'),
    ('per-5',  6, '10:15', '11:00', 45, 'Jam ke-5',    'ay-2025-2026-2'),
    ('per-6',  7, '11:00', '11:45', 45, 'Jam ke-6',    'ay-2025-2026-2'),
    ('per-7',  8, '11:45', '12:30', 45, 'Jam ke-7',    'ay-2025-2026-2'),
    ('per-8',  9, '12:30', '13:15', 45, 'Jam ke-8',    'ay-2025-2026-2');

-- ─── AI Provider ──────────────────────────────────────────────────────────────
INSERT INTO ai_providers (id, name, type, is_active) VALUES
    ('ai-gemini', 'Google Gemini', 'LLM', 1),
    ('ai-openai', 'OpenAI GPT',    'LLM', 0);

-- ─── Multimedia Default ────────────────────────────────────────────────────────
INSERT INTO multimedia_settings (id, name, autoplay, mode) VALUES
    ('mm-001', 'Channel Sekolah Utama', 0, 'manual');

-- ─── Kategori Pengeluaran Default ──────────────────────────────────────────────
INSERT INTO expense_categories (id, name, is_active, sort_order) VALUES
    ('ec-001', 'Operasional Sekolah', 1, 1),
    ('ec-002', 'Honor Guru/Staff', 1, 2),
    ('ec-003', 'ATK & Fotokopi', 1, 3),
    ('ec-004', 'Konsumsi', 1, 4),
    ('ec-005', 'Pembangunan & Sarpras', 1, 5),
    ('ec-006', 'Listrik & Internet', 1, 6);

-- ─── Pengaturan Keuangan Default ───────────────────────────────────────────────
INSERT INTO finance_settings (id, key, value) VALUES
    ('fs-001', 'treasurer_name', 'Bendahara Sekolah'),
    ('fs-002', 'treasurer_title', 'Bendahara'),
    ('fs-003', 'receipt_footer', 'Harap simpan bukti pembayaran ini sebagai alat bukti yang sah.'),
    ('fs-004', 'wa_template', 'Assalamualaikum Bapak/Ibu Wali Murid, kami informasikan tagihan SPP bulan ini sebesar *{nominal}*. Terima kasih.');

-- ─── Akun Admin (password: admin123) ──────────────────────────────────────────
-- Hash: bcrypt dari "admin123"
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('admin-001', 'admin@eduadmin.com', 'Super Administrator',
     '$2b$10$meiZ7CSnPwWuBLrgjCpY1evy0AYwQSzN4GihunbQNuW7fSf74YMKG',
     'admin', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-admin-001', 'admin-001', '0000000000001', 'Operator Data', 'IT', 1);

-- ─── Akun Kepala Sekolah (password: ks123) ────────────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('ks-001', 'kepsek@eduadmin.com', 'Drs. Kepala Sekolah, M.Pd',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'ks', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-ks-001', 'ks-001', '0000000000002', 'Kepala Sekolah', 'Manajemen', 1);

-- ─── Akun Kurikulum (password: kurikulum123) ──────────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('kur-001', 'kurikulum@eduadmin.com', 'Dra. Waka Kurikulum, M.Pd',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'kurikulum', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-kur-001', 'kur-001', '0000000000003', 'Wakil Kurikulum', 'Akademik', 1);

-- ─── Akun Keuangan (password: keuangan123) ────────────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('keu-001', 'keuangan@eduadmin.com', 'Bendahara Sekolah, S.E',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'keuangan', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-keu-001', 'keu-001', '0000000000004', 'Bendahara', 'Keuangan', 1);

-- ─── Akun Guru Wali Kelas (password: guru123) ─────────────────────────────────
-- position = "Wali Kelas" → DashboardGuru akan tampilkan menu tambahan kelas_saya & rapot
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('guru-wk-001', 'walikelas1a@eduadmin.com', 'Siti Aminah, S.Pd',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'guru', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-guru-wk-001', 'guru-wk-001', '0000000000005', 'Wali Kelas', 'Akademik', 1);

-- ─── Akun Guru Mata Pelajaran (password: guru123) ─────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('guru-mp-001', 'gurumtk@eduadmin.com', 'Budi Santoso, S.Pd',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'guru', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-guru-mp-001', 'guru-mp-001', '0000000000006', 'Guru Mata Pelajaran', 'Akademik', 1);

-- ─── Akun Guru Bimbel (password: bimbel123) ───────────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('gb-001', 'gurubimbel@eduadmin.com', 'Ustadz Ahmad, S.Ag',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'gb', 1);
INSERT INTO staff (id, profile_id, nip, position, department, is_active) VALUES
    ('staff-gb-001', 'gb-001', '0000000000007', 'Guru Bimbel', 'Bimbingan', 1);

-- ─── Akun Orang Tua (password: ortu123) ───────────────────────────────────────
INSERT INTO profiles (id, email, full_name, password_hash, role, is_active) VALUES
    ('ortu-001', 'orangtua1@eduadmin.com', 'H. Abdullah',
     '$2b$10$xqHOQl6eFcLC658oGr5MxeXYd.plKkvXuGU.jNesfx5Rd6A9wq0va',
     'ortu', 1);


-- =============================================================================
-- RINGKASAN TABEL (50 tabel)
-- =============================================================================
--
--  GRUP                  TABEL
--  ─────────────────     ──────────────────────────────────────────────────────
--  Sistem & Auth    (3)  profiles, staff, audit_logs
--  Sekolah          (2)  academic_years, school_settings
--  Mapel & Kelas    (4)  subject_groups, subjects, classes, class_students
--  Siswa & Ortu     (2)  students, parent_students
--  Jadwal           (2)  schedule_periods, schedules
--  Absensi & Nilai  (4)  attendance, grade_types, grades, rapor_descriptions
--  Ujian CBT        (5)  exams, exam_schedules, exam_questions,
--                        exam_sessions, exam_answers
--  Pengumuman       (2)  announcements, broadcasts
--  Keuangan         (12) student_bills, payment_transactions, expenses,
--                        savings_accounts, savings_transactions,
--                        payment_types, payment_type_classes,
--                        student_bill_installments, cash_accounts,
--                        school_bank_accounts, finance_settings,
--                        expense_categories
--  Bimbingan Belajar(8)  tutoring_subjects, tutoring_teachers, tutoring_classes,
--                        tutoring_enrollments, bimbel_attendance, bimbel_progress,
--                        **bimbel_materi, bimbel_latihan**
--  Materi & Latihan (2)  materi, latihan_soal
--  Naik Kelas       (1)  promotion_history
--  Multimedia & AI  (5)  multimedia_settings, multimedia_videos,
--                        ai_providers, ai_api_keys, ai_system_settings
--  **Al-Quran**     (2)  **quran_surahs, quran_verses**
--  **Notepad**      (1)  **teacher_notes**
--  **Dashboard**    (1)  **dashboard_cache**
--  **Positions**    (1)  **positions**
-- =============================================================================
