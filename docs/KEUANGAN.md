# 📊 KEUANGAN.md — Audit, Perbaikan & Rencana Fitur Modul Keuangan

> **Dokumen Lengkap**: Audit kode, temuan masalah, perbaikan yang sudah dilakukan, dan rencana penambahan fitur modul Keuangan & Tabungan.
>
> **Terakhir diperbarui**: 26 Juni 2026

---

## DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Audit Modul Keuangan](#2-audit-modul-keuangan)
3. [Temuan Masalah (Issues)](#3-temuan-masalah-issues)
4. [Perbaikan yang Sudah Dilakukan](#4-perbaikan-yang-sudah-dilakukan)
5. [Rencana Penambahan Fitur](#5-rencana-penambahan-fitur)
6. [Database Schema (Tabel Baru)](#6-database-schema-tabel-baru)
7. [Alur Fitur Detail](#7-alur-fitur-detail)
8. [Komponen Cetak (Print & PDF)](#8-komponen-cetak-print--pdf)
9. [File yang Perlu Diubah/Dibuat](#9-file-yang-perlu-diubahdibuat)
10. [Urutan Pengerjaan](#10-urutan-pengerjaan)
11. [Rangkuman](#11-rangkuman)

---

## 1. Ringkasan Eksekutif

### Kondisi Saat Ini

| Modul | Status D1 | Status UI | Catatan |
|-------|-----------|-----------|---------|
| BERANDA (DashboardHome) | ✅ Sudah D1 | ✅ OK | Fetch `student_bills` dari D1 |
| TABUNGAN SISWA | ✅ Sudah D1 | ✅ OK | Fetch + POST ke D1, tombol cetak belum fungsi |
| KEUANGAN SEKOLAH | ⚠️ Sebagian | ⚠️ 5 Masalah | `cashAccounts`, `paymentTypes` tidak di D1 |
| LAPORAN | ✅ Sudah D1 | ✅ OK | Menggunakan `useFinance()` |

### Rencana Penambahan Fitur

| No | Fitur | Prioritas |
|----|-------|-----------|
| 1 | Mengatur Nominal SPP Per Kelas | TINGGI |
| 2 | Uang Pangkal / Pemeliharaan (Bisa Dicil) | TINGGI |
| 3 | Menambah Nama Pembayaran Manual | TINGGI |
| 4 | Melihat Rincian Pembayaran Siswa | SEDANG |
| 5 | Mencetak Rincian Pembayaran (PDF + Print) | SEDANG |
| 6 | Mencetak Kuitansi Per Pembayaran | SEDANG |
| 7 | Mencetak Buku Tabungan | SEDANG |
| 8 | Mencetak Historis Tabungan (Filter Tanggal) | SEDANG |

---

## 2. Audit Modul Keuangan

### 2.1 BERANDA (DashboardHome)

**File**: `src/components/DashboardSuperAdmin/components/views/DashboardHome.tsx`

**Status**: ✅ **BERSIH**

- Data tagihan siswa (`student_bills`) diambil dari D1 via `/api/student_bills`
- Hanya ditampilkan untuk role `ks` (Kepala Sekolah)
- Tidak ada masalah ditemukan

### 2.2 TABUNGAN SISWA

**File**:
- `src/components/DashboardSuperAdmin/hooks/useSavings.ts`
- `src/components/DashboardSuperAdmin/components/views/TabunganView.tsx`

**Status**: ✅ **BERSIH**

- `savings_accounts` dan `savings_transactions` diambil dari D1 saat halaman dimuat
- Setoran dan penarikan POST ke D1 + saldo otomatis ter-update via PATCH
- Tidak ada masalah persistensi data

**Catatan**: Tombol "Cetak Buku" sudah ada di UI tapi **belum berfungsi** (hanya menampilkan toast).

### 2.3 KEUANGAN SEKOLAH

**File**:
- `src/components/DashboardSuperAdmin/hooks/useFinance.ts`
- `src/components/DashboardSuperAdmin/components/views/KeuanganView.tsx`
- `src/components/DashboardSuperAdmin/components/modals/AddPaymentTypeModal.tsx`
- `src/components/DashboardSuperAdmin/components/modals/EditPaymentTypeModal.tsx`

**Status**: ⚠️ **5 MASALAH DITEMUKAN**

### 2.4 LAPORAN

**File**:
- `src/components/Laporan.tsx`
- `src/components/DashboardSuperAdmin/components/views/LaporanView.tsx`

**Status**: ✅ **BERSIH (dengan catatan)**

- `LaporanAkademik`: Mengambil data nilai dan kehadiran dari D1 ✅
- `LaporanKeuangan`: Menggunakan `useFinance()` — tapi `cashAccounts` kosong karena tidak ada tabel D1

---

## 3. Temuan Masalah (Issues)

### Issue 1: `cashAccounts` Tidak Tersimpan ke Database 🔴 KRITIS

**Lokasi**: `useFinance.ts`

**Masalah**:
- `cashAccounts` diinisialisasi kosong (`[]`)
- Tidak ada tabel `cash_accounts` di D1 schema
- Tidak ada fetch dari API saat mount
- Data hanya hidup di state React — hilang saat refresh halaman

**Dampak**:
- Dashboard "Saldo Kas Saat Ini" selalu tampil "Rp 0"
- Tab "Kas & Saldo" tidak menampilkan data akun
- User harus re-setup akun kas/bank setiap kali membuka halaman

### Issue 2: `paymentTypes` Tidak Tersimpan ke Database 🔴 KRITIS

**Lokasi**: `useFinance.ts`

**Masalah**:
- `paymentTypes` diinisialisasi kosong (`[]`)
- Tidak ada tabel `payment_types` di D1 schema
- Tidak ada fetch dari API saat mount
- `AddPaymentTypeModal` dan `EditPaymentTypeModal` hanya update local state

**Dampak**:
- Tabel "Jenis Pembayaran & Tarif" selalu kosong saat halaman dimuat
- User harus re-input jenis pembayaran setiap kali membuka halaman
- Nominal SPP, Uang Pangkal, dll tidak persist

### Issue 3: `schoolBankAccounts` Hanya di Memori 🟡 SEDANG

**Lokasi**: `KeuanganView.tsx` (state lokal)

**Masalah**:
- Rekening bank sekolah ditambahkan via modal
- Tidak ada tabel `school_bank_accounts` di D1
- Data hilang saat refresh

### Issue 4: `expenseCategories` Hanya di Memori 🟡 SEDANG

**Lokasi**: `KeuanganView.tsx` (state lokal)

**Masalah**:
- Kategori pengeluaran ditambah/dihapus oleh user
- Default: `['Operasional Sekolah', 'Honor Guru/Staff', 'ATK & Fotokopi', 'Konsumsi']`
- Perubahan hilang saat refresh

### Issue 5: `financeSettings` Hanya di Memori 🟡 SEDANG

**Lokasi**: `KeuanganView.tsx` (state lokal)

**Masalah**:
- Pengaturan kuitansi (nama bendahara, footer, template WA)
- Tidak ada tabel `finance_settings` di D1
- Perubahan hilang saat refresh

### Issue 6: Kode Mati (Dead Code) 🟢 RENDAH

**Lokasi**: `KeuanganView.tsx` baris 147-153

**Masalah**:
```typescript
const handleSavingsDeposit = () => {
    toast.success('Simulasi Setoran Berhasil');
};
const handleSavingsWithdrawal = () => {
    toast.success('Simulasi Penarikan Berhasil');
};
```

Fungsi ini hanya menampilkan toast tanpa melakukan apa-apa. Fungsi asli sudah ditangani di `TabunganView.tsx`.

---

## 4. Perbaikan yang Sudah Dilakukan

### 4.1 Modul Kurikulum (Sebelumnya — CATATAN_PERBAIKAN2)

Berikut perbaikan yang sudah dilakukan di modul lain (referensi):

| Modul | Perbaikan | File |
|-------|-----------|------|
| JadwalPelajaranView | Simpan button → `setSchedules()` → sync ke D1 | `JadwalPelajaranView.tsx` |
| JadwalUjianView | D1 fetch + sync + `dailyNotes`/`dailyUniforms` | `JadwalUjianView.tsx` |
| RaporSettingsView | API-first fetch + `descriptionsLoaded` flag | `RaporSettingsView.tsx` |
| NaikKelasView | D1 fetch `promotion_history` on mount | `NaikKelasView.tsx` |
| BimbinganBelajarView | Type error fix — missing `password` field | `BimbinganBelajarView.tsx` |
| useSchedules/useAttendance/etc | `hasPermission` type cast fix | Semua hooks |
| RBAC Tests | Synced with actual permissions | 3 test files |

### 4.2 Modul Keuangan (Sedang Direncanakan)

Belum ada perbaikan dilakukan untuk modul keuangan. Dokumen ini merencanakan perbaikan tersebut.

---

## 5. Rencana Penambahan Fitur

### 5.1 Ringkasan Requirements

| No | Fitur | Keputusan |
|----|-------|-----------|
| 1 | Format Kuitansi | Format resmi sekolah |
| 2 | Uang Pangkal | Bisa dicicil |
| 3 | Cetak | PDF + Print langsung dari browser |
| 4 | SPP per Kelas | Nominal berbeda per kelas → tabel `payment_type_classes` |
| 5 | Cetak Riwayat Tabungan | Filter tanggal |

### 5.2 Fitur Detail

#### Fitur 1: Mengatur Nominal SPP Per Kelas

**Lokasi UI**: Tab "Data Dasar" → "Jenis Pembayaran & Tarif"

**Cara Kerja**:
1. User klik "SPP Bulanan" di tabel jenis pembayaran
2. Muncul panel pengaturan per kelas
3. User bisa atur nominal berbeda per kelas:
   - Kelas 1-3: Rp 150.000
   - Kelas 4-6: Rp 200.000
4. Saat generate tagihan, nominal diambil dari `payment_type_classes` dulu, fallback ke `payment_types.amount`

**Database**: Tabel `payment_type_classes`

#### Fitur 2: Uang Pangkal / Pemeliharaan (Bisa Dicil)

**Lokasi UI**: Tab "Data Dasar" → Tambah Jenis Pembayaran

**Cara Kerja**:
1. User tambah jenis pembayaran:
   - Nama: "Uang Pangkal"
   - Tipe: **CICILAN** (tipe baru)
   - Total: Rp 5.000.000
   - Jumlah Cicilan: 5
2. Muncul form atur jadwal cicilan (nominal per cicilan + jatuh tempo)
3. Saat generate tagihan untuk siswa, otomatis buat:
   - 1 record `student_bills` (total)
   - 5 record `student_bill_installments` (per cicilan)
4. Saat bayar cicilan:
   - Pilih tagihan "Uang Pangkal"
   - Centang cicilan yang mau dibayar
   - Update `student_bill_installments.status = 'paid'`
   - Kalau semua cicilan lunas → `student_bills.status = 'paid'`

**Database**: Tabel `student_bill_installments` + tipe `CICILAN` di `payment_types`

#### Fitur 3: Menambah Nama Pembayaran Manual

**Sudah tercakup di Fitur 1** — `AddPaymentTypeModal` dengan field:
- Nama (bebas tulis): "Uang Pemeliharaan Gedung", "Seragam", dll
- Tipe: BULANAN / TAHUNAN / SEKALI / CICILAN
- Nominal: bebas
- Kategori: bebas

#### Fitur 4: Melihat Rincian Pembayaran Siswa

**Lokasi UI**: Tab "Tagihan Siswa" → Klik nama siswa atau tombol "Detail"

**Tampilan**:
- Semua tagihan siswa (lunas + belum lunas)
- Riwayat pembayaran per tagihan
- Sisa yang harus dibayar
- Tombol "Cetak Rincian" dan "PDF"

#### Fitur 5: Mencetak Rincian Pembayaran (PDF + Print)

**Komponen**: `PrintPaymentDetail.tsx`

**Cara Kerja**:
- Tombol "Print" → `window.print()` langsung dari browser
- Tombol "PDF" → `html2canvas` + `jsPDF` → download file PDF

**Installasi**: `npm install html2canvas jspdf`

#### Fitur 6: Mencetak Kuitansi Per Pembayaran

**Komponen**: `PrintPaymentReceipt.tsx`

**Format Kuitansi Resmi Sekolah**:
```
╔══════════════════════════════════════════════════════════════╗
║                    SMK NU WEDA                               ║
║              Jl. Contoh No. 123, Kota                        ║
║              Telp: (021) 1234567                             ║
╠══════════════════════════════════════════════════════════════╣
║                   BUKTI PEMBAYARAN                           ║
║  No. Transaksi  : TRX-2026-000001                           ║
║  Tanggal        : 15 Januari 2026                           ║
║  Petugas        : Siti Aminah                                ║
╠══════════════════════════════════════════════════════════════╣
║  PEMBAYAR DARI                                               ║
║  Nama           : Ahmad Fadillah                             ║
║  NIS            : 12345                                      ║
║  Kelas          : 3A                                         ║
╠══════════════════════════════════════════════════════════════╣
║  RINCIAN PEMBAYARAN                                          ║
║  SPP Bulanan Januari 2026     :         Rp 150.000           ║
║  TOTAL BAYAR                  :         Rp 150.000           ║
║  METODE PEMBAYARAN            : Tunai                        ║
╠══════════════════════════════════════════════════════════════╣
║  Status: LUNAS ✓                                             ║
║  Harap simpan bukti ini sebagai alat bukti yang sah.         ║
║                                                              ║
║  _________                    ___________                    ║
║  Bendahara                    Kepala Sekolah                 ║
╚══════════════════════════════════════════════════════════════╝
```

#### Fitur 7: Mencetak Buku Tabungan

**Komponen**: `PrintSavingsBook.tsx`

**Lokasi UI**: Tab "Data Tabungan" → Tombol "Cetak Buku" (sudah ada)

**Format Cetak**:
```
╔══════════════════════════════════════════════════════════════╗
║                    SMK NU WEDA                               ║
║                   BUKU TABUNGAN                              ║
╠══════════════════════════════════════════════════════════════╣
║  Nama Siswa   : Ahmad Fadillah                              ║
║  NIS          : 12345                                       ║
║  Kelas        : 3A                                          ║
║  No. Rekening : TBG-2026-0001                               ║
║  Saldo Saat Ini: Rp 250.000                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Tanggal  │ Keterangan│ Setor     │ Tarik    │ Saldo        ║
║  01/01/26 │ Setor    │  50.000    │    -     │  50.000      ║
║  15/01/26 │ Setor    │  50.000    │    -     │ 100.000      ║
║  01/02/26 │ Setor    │  50.000    │    -     │ 150.000      ║
║  10/02/26 │ Tarik    │     -      │ 20.000   │ 130.000      ║
║  01/03/26 │ Setor    │  50.000    │    -     │ 180.000      ║
║  15/03/26 │ Setor    │  50.000    │    -     │ 230.000      ║
║  01/04/26 │ Setor    │  20.000    │    -     │ 250.000      ║
╠══════════════════════════════════════════════════════════════╣
║  Dicetak pada: 26 Juni 2026                                  ║
╚══════════════════════════════════════════════════════════════╝
```

#### Fitur 8: Mencetak Historis Tabungan (Filter Tanggal)

**Komponen**: `PrintSavingsHistory.tsx`

**Lokasi UI**: Tab "Riwayat" → Filter tanggal → Tombol "Cetak Riwayat"

**Filter**:
```
┌─────────────────────┐ ┌─────────────────────┐
│ Dari: [01/01/2026]  │ │ Sampai: [30/06/2026]│
└─────────────────────┘ └─────────────────────┘
[Terapkan Filter] [Cetak Riwayat] [PDF]
```

**Format Cetak**:
```
╔══════════════════════════════════════════════════════════════╗
║                    SMK NU WEDA                               ║
║          RIWAYAT TRANSAKSI TABUNGAN                          ║
║          Periode: 01 Januari - 30 Juni 2026                 ║
╠══════════════════════════════════════════════════════════════╣
║  Tanggal  │ Nama Siswa    │ Kelas │ Jenis    │ Nominal      ║
║  01/01/26 │ Ahmad F.      │ 3A    │ Setor    │  50.000      ║
║  01/01/26 │ Siti A.       │ 3A    │ Setor    │  75.000      ║
║  15/01/26 │ Ahmad F.      │ 3A    │ Setor    │  50.000      ║
║  15/01/26 │ Budi C.       │ 4A    │ Tarik    │  30.000      ║
║  ...      │ ...           │ ...   │ ...      │  ...         ║
╠══════════════════════════════════════════════════════════════╣
║  TOTAL SETORAN    : Rp 5.000.000                             ║
║  TOTAL PENARIKAN  : Rp 1.200.000                             ║
║  SELISIH (NET)    : Rp 3.800.000                             ║
║  JUMLAH TRANSAKSI : 45 transaksi                             ║
╠══════════════════════════════════════════════════════════════╣
║  Dicetak pada: 26 Juni 2026                                  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 6. Database Schema (Tabel Baru)

### 6.1 `payment_types` — Master Jenis Pembayaran

```sql
CREATE TABLE payment_types (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,              -- "SPP", "Uang Pangkal", "Uang Gedung"
    type        TEXT NOT NULL               -- 'BULANAN' | 'TAHUNAN' | 'SEKALI' | 'CICILAN'
                CHECK (type IN ('BULANAN','TAHUNAN','SEKALI','CICILAN')),
    amount      DECIMAL(15,2) NOT NULL,     -- Nominal default
    category    TEXT DEFAULT 'Lainnya',
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Catatan**: Tipe `CICILAN` ditambahkan untuk uang pangkal yang bisa dicicil.

### 6.2 `payment_type_classes` — Nominal SPP Per Kelas

```sql
CREATE TABLE payment_type_classes (
    id              TEXT PRIMARY KEY,
    payment_type_id TEXT NOT NULL,          -- FK ke payment_types
    class_id        TEXT NOT NULL,          -- FK ke classes
    custom_amount   DECIMAL(15,2) NOT NULL, -- Nominal khusus untuk kelas ini
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_type_id) REFERENCES payment_types(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE(payment_type_id, class_id)       -- 1 jenis per kelas hanya 1 baris
);
```

**Contoh Data**:
| payment_type_id | class_id | custom_amount |
|-----------------|----------|---------------|
| spp_001 | 1A | 150000 |
| spp_001 | 1B | 150000 |
| spp_001 | 3A | 175000 |
| spp_001 | 4A | 200000 |

### 6.3 `student_bill_installments` — Cicilan per Tagihan

```sql
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
```

**Contoh Data** (Uang Pangkal Rp 5.000.000, 5 cicilan):
| bill_id | installment_no | amount | due_date | status |
|---------|---------------|--------|----------|--------|
| bill_001 | 1 | 1000000 | 2026-07-01 | paid |
| bill_001 | 2 | 1000000 | 2026-08-01 | paid |
| bill_001 | 3 | 1000000 | 2026-09-01 | pending |
| bill_001 | 4 | 1000000 | 2026-10-01 | pending |
| bill_001 | 5 | 1000000 | 2026-11-01 | pending |

### 6.4 `cash_accounts` — Akun Kas/Bank Sekolah

```sql
CREATE TABLE cash_accounts (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,              -- "Kas Utama", "Bank BCA"
    type        TEXT NOT NULL               -- 'KAS' | 'BANK'
                CHECK (type IN ('KAS','BANK')),
    balance     DECIMAL(15,2) DEFAULT 0,
    number      TEXT,                       -- Nomor rekening
    is_primary  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.5 `school_bank_accounts` — Rekening Bank untuk Transfer

```sql
CREATE TABLE school_bank_accounts (
    id          TEXT PRIMARY KEY,
    bank        TEXT NOT NULL,              -- "BCA", "Mandiri"
    number      TEXT NOT NULL,              -- Nomor rekening
    name        TEXT NOT NULL,              -- Atas nama
    is_active   INTEGER DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.6 `finance_settings` — Pengaturan Keuangan

```sql
CREATE TABLE finance_settings (
    id          TEXT PRIMARY KEY,
    key         TEXT UNIQUE NOT NULL,       -- 'treasurer_name', 'receipt_footer'
    value       TEXT NOT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Contoh Data**:
| key | value |
|-----|-------|
| treasurer_name | Siti Aminah, S.Pd |
| receipt_footer | Harap simpan bukti pembayaran ini sebagai alat bukti yang sah. |
| wa_template | Assalamualaikum Bapak/Ibu Wali Murid, kami informasikan tagihan SPP bulan ini sebesar *{nominal}*. Terima kasih. |

### 6.7 `expense_categories` — Kategori Pengeluaran

```sql
CREATE TABLE expense_categories (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    is_active   INTEGER DEFAULT 1,
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Contoh Data**:
| name | sort_order |
|------|-----------|
| Operasional Sekolah | 1 |
| Honor Guru/Staff | 2 |
| ATK & Fotokopi | 3 |
| Konsumsi | 4 |
| Pembangunan & Sarpras | 5 |
| Listrik & Internet | 6 |

---

## 7. Alur Fitur Detail

### 7.1 Alur Pengaturan SPP Per Kelas

```
User klik "SPP Bulanan" di tabel
    ↓
Modal ClassAmountModal muncul
    ↓
User lihat daftar kelas + nominal saat ini
    ↓
User klik "Edit" per kelas
    ↓
Form edit nominal muncul
    ↓
User ubah nominal → klik Simpan
    ↓
PATCH ke /api/payment_type_classes
    ↓
Tabel refresh dari D1
```

### 7.2 Alur Cicilan Uang Pangkal

```
User tambah jenis pembayaran
    ↓
Isi: Nama="Uang Pangkal", Tipe=CICILAN, Total=5000000, Cicilan=5x
    ↓
POST ke /api/payment_types (type='CICILAN')
    ↓
Muncul form atur jadwal cicilan
    ↓
User atur: nominal per cicilan + jatuh tempo
    ↓
POST ke /api/student_bill_installments (5 baris)
    ↓
Saat generate tagihan untuk siswa:
    ↓
Buat 1 student_bills (status='pending')
Buat 5 student_bill_installments
```

### 7.3 Alur Pembayaran Cicilan

```
User klik "Bayar" di tagihan Uang Pangkal
    ↓
Pindah ke tab "Pembayaran"
    ↓
Pilih siswa → muncul tagihan + cicilan
    ↓
Centang cicilan yang mau dibayar (misal: cicilan 3 & 4)
    ↓
Pilih metode (Tunai/Transfer)
    ↓
Klik "Proses Pembayaran"
    ↓
POST ke /api/payment_transactions
    ↓
PATCH student_bill_installments:
    - cicilan 3: status='paid', paid_amount=1000000
    - cicilan 4: status='paid', paid_amount=1000000
    ↓
Cek: semua cicilan lunas?
    ↓
Ya → PATCH student_bills.status='paid'
Tidak → status tetap 'pending'
```

### 7.4 Alur cetak

```
User klik tombol "Cetak" atau "PDF"
    ↓
Komponen cetak muncul (hidden div)
    ↓
Data di-render ke dalam template cetak
    ↓
Untuk Print: window.print() via iframe
Untuk PDF: html2canvas → jsPDF → download
```

---

## 8. Komponen Cetak (Print & PDF)

### 8.1 Dependencies Baru

```bash
npm install html2canvas jspdf
```

### 8.2 Pola Cetak (Sudah Ada di Codebase)

**Referensi**: `CetakKartuLoginView.tsx`, `RaporView.tsx`

```typescript
// Pola Print via iframe
const handlePrint = () => {
    const printContent = componentRef.current;
    if (printContent) {
        const printArea = printContent.innerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>Cetak</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            @page { size: A4; margin: 10mm; }
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body class="p-4 bg-white">
                    ${printArea}
                </body>
                </html>
            `);
            doc.close();
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 500);
        }
    }
};
```

### 8.3 Pola PDF Export (Baru)

```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const handleExportPDF = async (filename: string) => {
    const element = componentRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
};
```

### 8.4 Komponen Cetak yang Perlu Dibuat

| Komponen | Fungsi | Lokasi UI |
|----------|--------|-----------|
| `PrintPaymentDetail.tsx` | Cetak rincian pembayaran siswa | Tab "Tagihan Siswa" → Detail |
| `PrintPaymentReceipt.tsx` | Cetak kuitansi per transaksi | Tab "Pembayaran" → Riwayat → Print |
| `PrintSavingsBook.tsx` | Cetak buku tabungan per siswa | Tab "Data Tabungan" → Cetak Buku |
| `PrintSavingsHistory.tsx` | Cetak riwayat transaksi tabungan | Tab "Riwayat" → Cetak Riwayat |

---

## 9. File yang Perlu Diubah/Dibuat

### 9.1 Database & Backend

| File | Aksi | Keterangan |
|------|------|------------|
| `schema/eduadmin_d1_schema.sql` | EDIT | +7 tabel baru (payment_types, payment_type_classes, student_bill_installments, cash_accounts, school_bank_accounts, finance_settings, expense_categories) |
| `functions/api/[[path]].ts` | EDIT | +7 tabel ke ALLOWED_TABLES + FINANCE_WRITE_TABLES + FINANCE_READ_TABLES |

### 9.2 Hooks

| File | Aksi | Keterangan |
|------|------|------------|
| `useFinance.ts` | EDIT | Fetch `payment_types`, `cash_accounts`, `finance_settings`, `payment_type_classes` dari D1 |
| `useSavings.ts` | EDIT | Fetch `savings_transactions` termasuk `balance_after` |
| `useInstallments.ts` | **BARU** | Fetch/manage cicilan dari `student_bill_installments` |

### 9.3 Modals

| File | Aksi | Keterangan |
|------|------|------------|
| `AddPaymentTypeModal.tsx` | EDIT | POST ke API + handle cicilan + nominal per kelas |
| `EditPaymentTypeModal.tsx` | EDIT | PATCH ke API |
| `PaymentDetailModal.tsx` | **BARU** | Modal rincian pembayaran siswa |
| `InstallmentSettingsModal.tsx` | **BARU** | Modal pengaturan cicilan per jenis pembayaran |
| `ClassAmountModal.tsx` | **BARU** | Modal nominal per kelas |

### 9.4 Views

| File | Aksi | Keterangan |
|------|------|------------|
| `KeuanganView.tsx` | EDIT | Semua tab fetch dari D1, tambah tombol cetak, hapus dead code |
| `TabunganView.tsx` | EDIT | Hubungkan tombol cetak + filter tanggal |

### 9.5 Komponen Cetak (BARU)

| File | Keterangan |
|------|------------|
| `PrintPaymentDetail.tsx` | Cetak rincian pembayaran siswa |
| `PrintPaymentReceipt.tsx` | Cetak kuitansi per transaksi |
| `PrintSavingsBook.tsx` | Cetak buku tabungan per siswa |
| `PrintSavingsHistory.tsx` | Cetak riwayat transaksi tabungan |

### 9.6 Package

| File | Aksi | Keterangan |
|------|------|------------|
| `package.json` | EDIT | Tambah `html2canvas` + `jspdf` |

---

## 10. Urutan Pengerjaan

| Tahap | Deskripsi | Estimasi |
|-------|-----------|----------|
| **1** | Migration Database — Buat 7 tabel baru di `eduadmin_d1_schema.sql` | 30 menit |
| **2** | Backend API — Tambah tabel ke ALLOWED_TABLES + FINANCE_WRITE/READ di `[[path]].ts` | 15 menit |
| **3** | Install dependency — `npm install html2canvas jspdf` | 5 menit |
| **4** | `useFinance.ts` — Fetch payment_types, cash_accounts, finance_settings, payment_type_classes dari D1 | 30 menit |
| **5** | `useInstallments.ts` — Hook baru untuk cicilan | 20 menit |
| **6** | `useSavings.ts` — Update fetch | 10 menit |
| **7** | `AddPaymentTypeModal.tsx` — POST ke API + form cicilan + nominal per kelas | 45 menit |
| **8** | `EditPaymentTypeModal.tsx` — PATCH ke API | 20 menit |
| **9** | `PaymentDetailModal.tsx` — Modal rincian pembayaran | 30 menit |
| **10** | `InstallmentSettingsModal.tsx` — Modal pengaturan cicilan | 25 menit |
| **11** | `ClassAmountModal.tsx` — Modal nominal per kelas | 20 menit |
| **12** | `PrintPaymentDetail.tsx` — Komponen cetak rincian | 30 menit |
| **13** | `PrintPaymentReceipt.tsx` — Komponen cetak kuitansi | 30 menit |
| **14** | `PrintSavingsBook.tsx` — Komponen cetak buku tabungan | 25 menit |
| **15** | `PrintSavingsHistory.tsx` — Komponen cetak riwayat tabungan | 25 menit |
| **16** | `KeuanganView.tsx` — Update semua tab + hubungkan cetak | 45 menit |
| **17** | `TabunganView.tsx` — Hubungkan tombol cetak + filter tanggal | 30 menit |
| **18** | Testing — Build + Tests | 20 menit |
| | **TOTAL ESTIMASI** | **~6 jam** |

---

## 11. Rangkuman

### Kondisi Saat Ini

Modul keuangan memiliki **4 komponen utama**:
1. **BERANDA** — Sudah berfungsi dengan baik, data dari D1
2. **TABUNGAN SISWA** — Sudah berfungsi dengan baik, data dari D1, tapi tombol cetak belum aktif
3. **KEUANGAN SEKOLAH** — **5 masalah ditemukan**: `cashAccounts`, `paymentTypes`, `schoolBankAccounts`, `expenseCategories`, `financeSettings` tidak tersimpan ke D1
4. **LAPORAN** — Sudah berfungsi, mengambil data dari D1

### Masalah Kritis

Dua masalah paling kritis yang harus diperbaiki:
1. **`paymentTypes` tidak di D1** — Jenis pembayaran (SPP, Uang Pangkal, dll) hilang saat refresh
2. **`cashAccounts` tidak di D1** — Akun kas/bank hilang saat refresh

### Rencana Penambahan Fitur

8 fitur baru direncanakan:
1. **Nominal SPP Per Kelas** — Tabel `payment_type_classes`
2. **Uang Pangkal Bisa Dicil** — Tabel `student_bill_installments` + tipe `CICILAN`
3. **Tambah Nama Pembayaran Manual** — Sudah tercakup di fitur 1-2
4. **Rincian Pembayaran Siswa** — Modal detail
5. **Cetak Rincian (PDF + Print)** — Komponen `PrintPaymentDetail`
6. **Cetak Kuitansi** — Komponen `PrintPaymentReceipt`
7. **Cetak Buku Tabungan** — Komponen `PrintSavingsBook`
8. **Cetak Historis Tabungan** — Komponen `PrintSavingsHistory` + filter tanggal

### Database Baru

7 tabel baru perlu dibuat:
1. `payment_types` — Master jenis pembayaran
2. `payment_type_classes` — Nominal per kelas
3. `student_bill_installments` — Cicilan per tagihan
4. `cash_accounts` — Akun kas/bank
5. `school_bank_accounts` — Rekening bank
6. `finance_settings` — Pengaturan kuitansi
7. `expense_categories` — Kategori pengeluaran

### File yang Perlu Diubah/Dibuat

- **14 file** perlu diubah
- **7 file** baru perlu dibuat
- **2 dependencies** baru: `html2canvas`, `jspdf`

### Estimasi Waktu

Total estimasi pengerjaan: **~6 jam** (18 tahap)

### Technology Stack

- **Frontend**: React 19 + TypeScript + TailwindCSS 4
- **Backend**: Cloudflare Workers + D1 (SQLite)
- **Cetak**: `window.print()` via iframe + `html2canvas` + `jsPDF`
- **API**: Generic CRUD via `/api/[[path]].ts`

---

> **Dokumen ini dibuat sebagai acuan lengkap untuk pengembangan modul keuangan.**
> **Silakan dibaca, dianalisis, dan dipelajari sebelum memulai implementasi.**

 Pertanyaan Terakhir
1. Logo Sekolah: Untuk kuitansi resmi, perlu logo sekolah di header? Kalau ya, filenya dimana?
2. Tanda Tangan: Kuitansi perlu tanda tangan digital bendahara + kepala sekolah? Atau cukup nama saja?
3. Nomor Transaksi: Format nomor transaksi seperti apa? Contoh: TRX-2026-000001 atau format lain?
4. Cicilan Default: Berapa cicilan maksimal yang harus didukung? 5? 10? 12?
5. SPP per Kelas: Apakah ada kelas yang nominalnya beda? Contoh: kelas 1-3 = Rp 150.000, kelas 4-6 = Rp 200.000? Atau semua sama?