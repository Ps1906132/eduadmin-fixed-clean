-- =============================================================================
--  MIGRATION: Tambah 7 Tabel Keuangan ke D1
--  Tidak menghapus data yang sudah ada (CREATE TABLE IF NOT EXISTS)
--
--  CARA PAKAI:
--  npx wrangler d1 execute eduadmin_db --remote --file=./schema/migration_keuangan.sql
-- =============================================================================

-- 1. payment_types — Master Jenis Pembayaran
CREATE TABLE IF NOT EXISTS payment_types (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL
                CHECK (type IN ('BULANAN','TAHUNAN','SEKALI','CICILAN')),
    amount      DECIMAL(15,2) NOT NULL,
    category    TEXT DEFAULT 'Lainnya',
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. payment_type_classes — Nominal SPP Per Kelas/Tahun
CREATE TABLE IF NOT EXISTS payment_type_classes (
    id              TEXT PRIMARY KEY,
    payment_type_id TEXT NOT NULL,
    academic_year_id TEXT NOT NULL,
    custom_amount   DECIMAL(15,2) NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id),
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
    UNIQUE(payment_type_id, academic_year_id)
);

-- 3. student_bill_installments — Cicilan per Tagihan
CREATE TABLE IF NOT EXISTS student_bill_installments (
    id              TEXT PRIMARY KEY,
    bill_id         TEXT NOT NULL,
    installment_no  INTEGER NOT NULL,
    amount          DECIMAL(15,2) NOT NULL,
    due_date        DATE,
    status          TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','overdue')),
    paid_amount     DECIMAL(15,2) DEFAULT 0,
    paid_date       DATE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES student_bills(id)
);

-- 4. cash_accounts — Akun Kas/Bank Sekolah
CREATE TABLE IF NOT EXISTS cash_accounts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL
                CHECK (type IN ('KAS','BANK')),
    balance     DECIMAL(15,2) DEFAULT 0,
    number      TEXT,
    is_primary  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. school_bank_accounts — Rekening Bank untuk Transfer
CREATE TABLE IF NOT EXISTS school_bank_accounts (
    id          TEXT PRIMARY KEY,
    bank        TEXT NOT NULL,
    number      TEXT NOT NULL,
    name        TEXT NOT NULL,
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. finance_settings — Pengaturan Keuangan
CREATE TABLE IF NOT EXISTS finance_settings (
    id          TEXT PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,
    value       TEXT NOT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. expense_categories — Kategori Pengeluaran
CREATE TABLE IF NOT EXISTS expense_categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    is_active   INTEGER DEFAULT 1,
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SEED DATA: expense_categories
-- =============================================================================
INSERT OR IGNORE INTO expense_categories (id, name, is_active, sort_order) VALUES
    ('cat_001', 'Operasional Sekolah', 1, 1),
    ('cat_002', 'Honor Guru/Staff', 1, 2),
    ('cat_003', 'ATK & Fotokopi', 1, 3),
    ('cat_004', 'Konsumsi', 1, 4),
    ('cat_005', 'Pembangunan & Sarpras', 1, 5),
    ('cat_006', 'Listrik & Internet', 1, 6);

-- =============================================================================
-- SEED DATA: finance_settings
-- =============================================================================
INSERT OR IGNORE INTO finance_settings (id, key, value) VALUES
    ('fs_001', 'treasurer_name', ''),
    ('fs_002', 'receipt_footer', 'Harap simpan bukti pembayaran ini sebagai alat bukti yang sah.'),
    ('fs_003', 'wa_template', 'Assalamualaikum Bapak/Ibu Wali Murid, kami informasikan tagihan SPP bulan ini sebesar *{nominal}*. Terima kasih.'),
    ('fs_004', 'school_logo_url', '');

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_payment_types_type ON payment_types(type);
CREATE INDEX IF NOT EXISTS idx_payment_type_classes_type ON payment_type_classes(payment_type_id);
CREATE INDEX IF NOT EXISTS idx_student_bill_installments_bill ON student_bill_installments(bill_id);
CREATE INDEX IF NOT EXISTS idx_student_bill_installments_status ON student_bill_installments(status);
CREATE INDEX IF NOT EXISTS idx_cash_accounts_type ON cash_accounts(type);
CREATE INDEX IF NOT EXISTS idx_expense_categories_active ON expense_categories(is_active);
