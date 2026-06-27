# CATATAN PERBAIKAN 3 — Positions (Jabatan) + Grades Semester

> **Tanggal:** 28 Juni 2026
> **Scope:** Modul Jabatan, Kepala Sekolah, Grades API
> **Single Source of Truth:** `docs/PERJANJIAN_KERJA.md`

---

## Daftar Isi

1. [Ringkasan Percakapan](#1-ringkasan-percakapan)
2. [Analisis Awal — Positions Hardcoded](#2-analisis-awal--positions-hardcoded)
3. [Keputusan Desain — 6 Posisi](#3-keputusan-desain--6-posisi)
4. [Implementasi — Positions Table di D1](#4-implementasi--positions-table-di-d1)
5. [Implementasi — Hook usePositions](#5-implementasi--hook-usepositions)
6. [Implementasi — Ganti Hardcoded di DashboardSuperAdmin](#6-implementasi--ganti-hardcoded-di-dashboardsuperadmin)
7. [Normalisasi Nama — Guru Kelas → Wali Kelas](#7-normalisasi-nama--guru-kelas--wali-kelas)
8. [Fix — Kepala Sekolah Role Mapping](#8-fix--kepala-sekolah-role-mapping)
9. [Fix — Grades API 500 Error](#9-fix--grades-api-500-error)
10. [Audit Modul Kepala Sekolah](#10-audit-modul-kepala-sekolah)
11. [Histori Push GitHub](#11-histori-push-github)
12. [File yang Diubah](#12-file-yang-diubah)

---

## 1. Ringkasan Percakapan

### Masalah yang Dibahas

| # | Masalah | Status |
|---|---------|--------|
| 1 | Positions (jabatan) hardcoded di DashboardSuperAdmin.tsx | ✅ Fixed |
| 2 | Guru Kelas vs Wali Kelas tidak konsisten | ✅ Fixed |
| 3 | Staff Tata Usaha tidak include Keuangan | ✅ Fixed |
| 4 | Kepala Sekolah tidak ada di dropdown jabatan | ✅ Fixed |
| 5 | Role mapping kepala sekolah → 'admin' (salah) | ✅ Fixed |
| 6 | Grades API 500 error — filter semester tidak ada kolom | ✅ Fixed |
| 7 | Tabel Guru & Staff kosong | 🔍 Perlu cek data D1 |
| 8 | Monitoring Siswa gagal muat | ✅ Fixed (grades API) |
| 9 | permissionMatrix KS pengumuman READ_ONLY tapi bisa CREATE | ⚠️ Inkonsisten |

---

## 2. Analisis Awal — Positions Hardcoded

### Kode Sebelumnya

**File:** `src/components/DashboardSuperAdmin.tsx:159-165`

```typescript
const [positions, setPositions] = useState<{ id: number; nama: string; kategori: string }[]>([
    { id: 2, nama: 'Wakil Kurikulum', kategori: 'Struktural' },
    { id: 3, nama: 'Guru Kelas', kategori: 'Fungsional' },
    { id: 4, nama: 'Guru Mata Pelajaran', kategori: 'Fungsional' },
    { id: 5, nama: 'Staff Tata Usaha', kategori: 'Staff' },
    { id: 6, nama: 'Operator Data', kategori: 'Teknis' },
]);
```

### Masalah

| # | Issue |
|---|-------|
| 1 | Tidak ada tabel `positions` di schema SQL |
| 2 | Kepala Sekolah tidak ada di list jabatan |
| 3 | Staff Tata Usaha ≠ Staff Tata Usaha/Keuangan |
| 4 | Guru Kelas vs Wali Kelas — istilah campuran |
| 5 | ID tidak unik — mulai dari 2, bukan 1 |

---

## 3. Keputusan Desain — 6 Posisi

### Hasil Diskusi dengan User

| # | Pertanyaan User | Jawaban |
|---|-----------------|---------|
| 1 | Kepala Sekolah di positions? | Tetap pakai role `ks` di DB |
| 2 | Guru Bimbel? | Terpisah di modul Bimbel |
| 3 | Staff Tata Usaha + Keuangan? | Digabung: "Staff Tata Usaha/Keuangan" |
| 4 | Guru Kelas vs Wali Kelas? | Guru Mata Pelajaran = pengampu mapel, Wali Kelas = wali kelas |

### 6 Posisi yang Disepakati

| id | name | category | role di DB |
|----|------|----------|------------|
| 1 | Operator Data | Teknis | `admin` |
| 2 | Kepala Sekolah | Struktural | `ks` |
| 3 | Wakil Kurikulum | Struktural | `kurikulum` |
| 4 | Staff Tata Usaha/Keuangan | Staff | `keuangan` |
| 5 | Guru Mata Pelajaran | Fungsional | `guru` |
| 6 | Wali Kelas | Fungsional | `guru` |

---

## 4. Implementasi — Positions Table di D1

### Schema Baru

**File:** `schema/eduadmin_d1_schema.sql`

```sql
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
(1, 'Operator Data',            'Teknis'),
(2, 'Kepala Sekolah',           'Struktural'),
(3, 'Wakil Kurikulum',          'Struktural'),
(4, 'Staff Tata Usaha/Keuangan', 'Staff'),
(5, 'Guru Mata Pelajaran',      'Fungsional'),
(6, 'Wali Kelas',               'Fungsional');
```

### Index

```sql
CREATE INDEX idx_positions_name   ON positions(name);
CREATE INDEX idx_positions_active ON positions(is_active);
```

### Drop Table

```sql
DROP TABLE IF EXISTS positions;
```

### Migration untuk D1 yang Sudah Ada

**File:** `schema/migration_positions.sql` (jika diperlukan)

```sql
CREATE TABLE IF NOT EXISTS positions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL UNIQUE,
    category  TEXT    NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO positions (id, name, category) VALUES
(1, 'Operator Data',            'Teknis'),
(2, 'Kepala Sekolah',           'Struktural'),
(3, 'Wakil Kurikulum',          'Struktural'),
(4, 'Staff Tata Usaha/Keuangan', 'Staff'),
(5, 'Guru Mata Pelajaran',      'Fungsional'),
(6, 'Wali Kelas',               'Fungsional');
```

---

## 5. Implementasi — Hook usePositions

### File Baru: `src/components/DashboardSuperAdmin/hooks/usePositions.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface Position {
    id: number;
    name: string;
    category: string;
    is_active: number;
}

/** Fetch positions from D1 via API */
export const usePositions = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPositions = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await fetch('/api/positions?is_active=eq.1&order=id', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPositions(data);
            }
        } catch (err) {
            console.error('Error fetching positions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    const addPosition = async (name: string, category: string) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch('/api/positions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, category })
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan "${name}" berhasil ditambahkan`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal menambahkan jabatan');
            }
        } catch (err) {
            console.error('Error adding position:', err);
            toast.error('Gagal menambahkan jabatan');
        }
    };

    const updatePosition = async (id: number, name: string, category: string) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch(`/api/positions?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, category })
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan berhasil diperbarui`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal memperbarui jabatan');
            }
        } catch (err) {
            console.error('Error updating position:', err);
            toast.error('Gagal memperbarui jabatan');
        }
    };

    const deletePosition = async (id: number) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        try {
            const res = await fetch(`/api/positions?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchPositions();
                toast.success(`Jabatan berhasil dihapus`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal menghapus jabatan');
            }
        } catch (err) {
            console.error('Error deleting position:', err);
            toast.error('Gagal menghapus jabatan');
        }
    };

    return {
        positions,
        loading,
        addPosition,
        updatePosition,
        deletePosition,
        refetch: fetchPositions
    };
};
```

---

## 6. Implementasi — Ganti Hardcoded di DashboardSuperAdmin

### Import Hook

```typescript
import { usePositions } from './DashboardSuperAdmin/hooks/usePositions';
```

### Ganti useState → usePositions()

**Sebelum:**
```typescript
const [positions, setPositions] = useState<{ id: number; nama: string; kategori: string }[]>([
    { id: 2, nama: 'Wakil Kurikulum', kategori: 'Struktural' },
    { id: 3, nama: 'Guru Kelas', kategori: 'Fungsional' },
    { id: 4, nama: 'Guru Mata Pelajaran', kategori: 'Fungsional' },
    { id: 5, nama: 'Staff Tata Usaha', kategori: 'Staff' },
    { id: 6, nama: 'Operator Data', kategori: 'Teknis' },
]);
```

**Sesudah:**
```typescript
const { positions, addPosition, updatePosition, deletePosition } = usePositions();
```

### Update confirmAddPosition

**Sebelum:**
```typescript
const confirmAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nama = (form.elements.namedItem('positionName') as HTMLInputElement).value;
    const kategori = (form.elements.namedItem('positionCategory') as HTMLSelectElement).value;

    if (nama && kategori) {
        if (editItem && editType === 'Jabatan') {
            setPositions(positions.map(p => p.id === editItem.id ? { ...p, nama, kategori } : p));
            toast.success("Jabatan berhasil diperbarui");
        } else {
            setPositions([...positions, { id: Date.now(), nama, kategori }]);
            toast.success("Jabatan berhasil ditambahkan");
        }
        setShowPositionModal(false);
        setEditItem(null);
        setEditType('');
    }
}
```

**Sesudah:**
```typescript
const confirmAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('positionName') as HTMLInputElement).value;
    const category = (form.elements.namedItem('positionCategory') as HTMLSelectElement).value;

    if (name && category) {
        if (editItem && editType === 'Jabatan') {
            await updatePosition(editItem.id, name, category);
        } else {
            await addPosition(name, category);
        }
        setShowPositionModal(false);
        setEditItem(null);
        setEditType('');
    }
}
```

### Update handleDeletePosition

**Sebelum:**
```typescript
const handleDeletePosition = (id: number) => {
    setConfirmModal({
        show: true,
        message: 'Apakah anda yakin ingin menghapus jabatan ini?',
        onConfirm: () => {
            setPositions(positions.filter(p => p.id !== id));
            toast.success("Jabatan berhasil dihapus");
            setConfirmModal({ show: false, message: '', onConfirm: () => { } });
        }
    });
}
```

**Sesudah:**
```typescript
const handleDeletePosition = (id: number) => {
    setConfirmModal({
        show: true,
        message: 'Apakah anda yakin ingin menghapus jabatan ini?',
        onConfirm: async () => {
            await deletePosition(id);
            setConfirmModal({ show: false, message: '', onConfirm: () => { } });
        }
    });
}
```

### Update Dropdown Jabatan

**Sebelum:**
```tsx
{positions.map(p => (
    <option key={p.id} value={p.nama}>{p.nama}</option>
))}
```

**Sesudah:**
```tsx
{positions.map(p => (
    <option key={p.id} value={p.name}>{p.name}</option>
))}
```

### Update Modal Jabatan

**Sebelum:**
```tsx
<input name="positionName" required defaultValue={editItem?.nama || ''} ... />
<select name="positionCategory" defaultValue={editItem?.kategori || 'Struktural'} ...>
```

**Sesudah:**
```tsx
<input name="positionName" required defaultValue={editItem?.name || ''} ... />
<select name="positionCategory" defaultValue={editItem?.category || 'Struktural'} ...>
```

### Update Wali Kelas Dropdown

**Sebelum:**
```tsx
disabled={newTeacher.jabatan !== 'Guru Kelas' && newTeacher.jabatan !== 'Wali Kelas'}
```

**Sesudah:**
```tsx
disabled={newTeacher.jabatan !== 'Wali Kelas'}
```

---

## 7. Normalisasi Nama — Guru Kelas → Wali Kelas

### File yang Diubah

| # | File | Perubahan |
|---|------|-----------|
| 1 | `DashboardGuru.tsx:47` | `'Guru Kelas' \|\| 'Wali Kelas'` → `'Wali Kelas'` |
| 2 | `DashboardSuperAdmin.tsx:361` | Sama |
| 3 | `DashboardSuperAdmin.tsx:374` | Sama |
| 4 | `DashboardSuperAdmin.tsx:894` | Sama |
| 5 | `InputNilaiGuru.tsx:12` | Sama |
| 6 | `KehadiranSiswaGuru.tsx:13` | Sama |
| 7 | `MataPelajaranView.tsx:41` | Hapus `includes('guru kelas')` |
| 8 | `Login.tsx:64` | Hapus `includes('guru kelas')` |
| 9 | `useTeachers.ts:128` | Hapus `includes('guru kelas')` |
| 10 | `useTeachers.ts:208` | Hapus `includes('guru kelas')` |

### Contoh Perubahan

**DashboardGuru.tsx:**
```typescript
// Sebelum
const isWaliKelas = user?.jabatan === 'Guru Kelas' || user?.jabatan === 'Wali Kelas' || !!user?.kelas;

// Sesudah
const isWaliKelas = user?.jabatan === 'Wali Kelas' || !!user?.kelas;
```

**Login.tsx:**
```typescript
// Sebelum
} else if (serverRole.includes('wali kelas') || serverRole.includes('guru kelas') || serverRole === 'wk') {

// Sesudah
} else if (serverRole.includes('wali kelas') || serverRole === 'wk') {
```

---

## 8. Fix — Kepala Sekolah Role Mapping

### Masalah

`useTeachers.ts:122` — mapping `kepala sekolah` → `role: 'admin'` (SALAH)

### Fix

**File:** `src/components/DashboardSuperAdmin/hooks/useTeachers.ts`

**Sebelum:**
```typescript
if (['admin', 'operator', 'kepala sekolah', 'wakil kepala'].some(k => jabatanLower.includes(k))) {
    dbRole = 'admin';
}
```

**Sesudah:**
```typescript
if (jabatanLower.includes('kepala sekolah')) {
    dbRole = 'ks';
}
```

### TeacherDataView — Wali Kelas Disabled untuk KS

**Sebelum:**
```tsx
disabled={isKurikulum || isKS || ['Staff Tata Usaha', 'Operator Data'].includes(guru.jabatan)}
```

**Sesudah:**
```tsx
disabled={isKurikulum || isKS || ['Kepala Sekolah', 'Staff Tata Usaha/Keuangan', 'Operator Data'].includes(guru.jabatan)}
```

---

## 9. Fix — Grades API 500 Error

### Error di Console

```
api/grades?semester=eq.1 500 (Internal Server Error)
```

### Root Cause

Tabel `grades` di D1 **tidak ada kolom `semester`**. Kode filter pakai `semester=eq.1` → SQLite error.

### Solusi

Tambah kolom `semester` ke tabel `grades`.

### Migration

**File:** `schema/migration_grades_semester.sql`

```sql
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
```

### Schema Update

**File:** `schema/eduadmin_d1_schema.sql`

```sql
CREATE TABLE grades (
    id               TEXT    PRIMARY KEY,
    student_id       TEXT    NOT NULL,
    subject_id       TEXT    NOT NULL,
    class_id         TEXT    NOT NULL,
    academic_year_id TEXT    NOT NULL,
    semester         INTEGER,                  -- ✅ BARU: 1 atau 2
    grade_type_id    TEXT,
    assessment_type  TEXT,
    grade_value      DECIMAL(5, 2),
    grade_letter     TEXT,
    kkm              DECIMAL(5, 2),
    exam_date        DATE,
    remarks          TEXT,
    created_by       TEXT,
    updated_by       TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    ...
);
```

### Index

```sql
CREATE INDEX idx_grd_semester ON grades(semester);
```

---

## 10. Audit Modul Kepala Sekolah

### Hasil Audit

| # | Item | File:Baris | Status | Detail |
|---|------|-----------|--------|--------|
| 1 | Sidebar 7 menu | `Sidebar.tsx:92-93` | ✅ | 7 menu sesuai PERJANJIAN_KERJA.md |
| 2a | data_guru → TeacherDataView | `DashboardSuperAdmin.tsx:579-582` | ✅ | KS render TeacherDataView langsung |
| 2b | nilai → LaporanAkademik | `DashboardSuperAdmin.tsx:738-747` | ✅ | KS render LaporanAkademik |
| 2c | laporan → LaporanKeuangan | `Laporan.tsx:27-31` | ✅ | KS render LaporanKeuangan |
| 2d | Modal guard | `DashboardSuperAdmin.tsx:815,909` | ✅ | Modal diblokir untuk KS |
| 3a | TeacherDataView read-only | `TeacherDataView.tsx:538-638` | ✅ | Semua tombol CRUD disabled |
| 3b | TeacherDataView lihat data | `TeacherDataView.tsx:567-644` | ✅ | Tabel data guru tampil |
| **3c** | **Reset Password untuk KS** | `TeacherDataView.tsx:631-633` | ❌ | **Tombol tersembunyi** — `!isKS` memblokir |
| 4 | DataSiswaView statistik | `DataSiswaView.tsx:59-125` | ✅ | KS lihat Total Siswa, per-tingkat |
| 5 | Multimedia hanya Channel | `Multimedia.tsx:33,351-354` | ✅ | Tab Settings disembunyikan |
| 6 | Pengumuman hanya create | `Pengumuman.tsx:37,407-415` | ✅ | Edit/Pin/Delete disembunyikan |
| 7 | DashboardHome + Keuangan card | `DashboardHome.tsx:72-188` | ✅ | StudentTingkatBreakdown |
| **8** | **permissionMatrix pengumuman** | `permissionMatrix.ts:105` | ⚠️ | `READ_ONLY` tapi note "bisa CREATE" |
| 9 | _normalizeRole('ks') | `usePermissions.ts:168-173` | ✅ | Return `'ks'` |
| 10 | NilaiView readOnly | `NilaiView.tsx:47` | ✅ | `readOnly` termasuk KS |

### Temuan yang Perlu Diperbaiki

#### ❌ Item 3c — Reset Password Tersembunyi untuk KS

```tsx
// TeacherDataView.tsx:631-633
!isKurikulum && !isKS && (  // ← !isKS memblokir KS
    <button onClick={() => handleOpenReset(guru)}>
        Reset Password
    </button>
)
```

#### ⚠️ Item 8 — permissionMatrix Inkonsisten

```typescript
// permissionMatrix.ts:105
{ module: 'pengumuman', actions: READ_ONLY, notes: 'READ ONLY (bisa CREATE)' }
// actions: READ_ONLY = ['READ'] — tidak termasuk CREATE
// Tapi UI bisa create karena cek isKS langsung, bukan lewat RBAC
```

---

## 11. Histori Push GitHub

### Commit 1: `c97974a` — feat: persistent positions

```
feat: persistent positions (jabatan) via D1 database

- Add positions table + seed 5 jabatan to D1 schema
- Add positions to API whitelist
- New usePositions hook (CRUD via API)
- Replace hardcoded positions with DB fetch
- Normalize 'Guru Kelas' → 'Wali Kelas' across codebase
- Rename 'Staff Tata Usaha' → 'Staff Tata Usaha/Keuangan'
```

**12 files changed:**
| File | Perubahan |
|------|-----------|
| `functions/api/[[path]].ts` | Tambah `'positions'` ke whitelist |
| `schema/eduadmin_d1_schema.sql` | Tambah tabel positions + seed |
| `src/components/DashboardGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/DashboardSuperAdmin.tsx` | Ganti hardcoded → usePositions() |
| `src/components/DashboardSuperAdmin/components/views/JabatanView.tsx` | `item.nama` → `item.name` |
| `src/components/DashboardSuperAdmin/components/views/MataPelajaranView.tsx` | Hapus `guru kelas` |
| `src/components/DashboardSuperAdmin/components/views/TeacherDataView.tsx` | `p.nama` → `p.name` |
| `src/components/DashboardSuperAdmin/hooks/usePositions.ts` | **BARU** — hook CRUD |
| `src/components/DashboardSuperAdmin/hooks/useTeachers.ts` | Hapus `guru kelas` |
| `src/components/InputNilaiGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/KehadiranSiswaGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/Login.tsx` | Hapus `guru kelas` |

### Commit 2: `c2b116b` — fix: Kepala Sekolah

```
fix: tambah Kepala Sekolah ke positions + fix role mapping ke 'ks'
```

**3 files changed:**
| File | Perubahan |
|------|-----------|
| `schema/eduadmin_d1_schema.sql` | Seed 5 → 6 jabatan (tambah Kepala Sekolah) |
| `src/components/DashboardSuperAdmin/components/views/TeacherDataView.tsx` | Wali Kelas disabled untuk KS |
| `src/components/DashboardSuperAdmin/hooks/useTeachers.ts` | `kepala sekolah` → `role: 'ks'` |

### Commit 3: `24c95ff` — fix: grades API 500

```
fix: grades API 500 - filter by academic_year_id instead of semester column
```

**2 files changed:**
| File | Perubahan |
|------|-----------|
| `src/components/Laporan.tsx` | Fetch academic_year dulu, lalu filter grades |
| `src/components/RapotSiswa.tsx` | Sama |

### Commit 4: `90fc70c` — feat: kolom semester

```
feat: tambah kolom semester ke tabel grades + index

- Tambah kolom semester (INTEGER) ke tabel grades di schema D1
- Buat migration file untuk D1 yang sudah ada
- Tambah index idx_grd_semester
- Revert kode filter (sekarang pakai semester langsung)
```

**4 files changed:**
| File | Perubahan |
|------|-----------|
| `schema/eduadmin_d1_schema.sql` | Tambah kolom semester + index |
| `schema/migration_grades_semester.sql` | **BARU** — migration file |
| `src/components/Laporan.tsx` | Revert ke filter `semester=eq.1` |
| `src/components/RapotSiswa.tsx` | Revert ke filter `semester=eq.1` |

---

## 12. File yang Diubah

### File Baru

| File | Deskripsi |
|------|-----------|
| `src/components/DashboardSuperAdmin/hooks/usePositions.ts` | Hook CRUD positions via API |
| `schema/migration_grades_semester.sql` | Migration tambah kolom semester |

### File yang Diubah

| File | Perubahan |
|------|-----------|
| `schema/eduadmin_d1_schema.sql` | Tambah tabel positions + kolom semester |
| `functions/api/[[path]].ts` | Tambah `'positions'` ke whitelist |
| `src/components/DashboardSuperAdmin.tsx` | Ganti hardcoded → usePositions() |
| `src/components/DashboardSuperAdmin/components/views/JabatanView.tsx` | `item.nama` → `item.name` |
| `src/components/DashboardSuperAdmin/components/views/TeacherDataView.tsx` | Dropdown + disable logic |
| `src/components/DashboardSuperAdmin/components/views/MataPelajaranView.tsx` | Hapus `guru kelas` |
| `src/components/DashboardSuperAdmin/hooks/useTeachers.ts` | Role mapping + hapus `guru kelas` |
| `src/components/DashboardGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/InputNilaiGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/KehadiranSiswaGuru.tsx` | Guru Kelas → Wali Kelas |
| `src/components/Login.tsx` | Hapus `guru kelas` |
| `src/components/Laporan.tsx` | Fix grades API |
| `src/components/RapotSiswa.tsx` | Fix grades API |

---

*Ditambahkan: 28 Juni 2026*
*Session selesai — 4 commit, 15 file diubah, 2 file baru*
