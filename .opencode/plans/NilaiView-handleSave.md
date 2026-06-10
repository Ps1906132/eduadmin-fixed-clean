# Fase 1 — NilaiView: Ganti handleSave palsu dengan saveGradesBatch nyata

## Ringkasan
Mengganti fungsi `handleSave` di `NilaiView.tsx` yang hanya simulasi toast menjadi fungsi yang benar-benar menyimpan data nilai ke server via hook `useGrades`.

## File yang diubah
- `components/DashboardSuperAdmin/components/views/NilaiView.tsx`

## Perubahan

### Perubahan 1 — Tambah import (setelah baris 8)
- **Import yang ditambah:** `useGrades` dan `GradeRecord` dari `'../../hooks/useGrades'`
- Path: `components/DashboardSuperAdmin/hooks/useGrades.ts` (sudah exist, mengekspor `GradeRecord` interface dan `saveGradesBatch`)

### Perubahan 2 — Inisialisasi hook (setelah baris 40)
- Setelah `const role = user?.role || user?.role_type || user?.roleCode;`
- Tambah: `const { saveGradesBatch } = useGrades();`

### Perubahan 3 — Ganti handleSave (baris 242-253)
Fungsi baru akan:
1. Parsing `localStorage 'classes_data_v11'` → cari kelas berdasarkan `selectedClass`
2. Parsing `localStorage 'subjects_data_v10'` → cari mapel berdasarkan `selectedSubject`
3. Jika tidak ketemu → `toast.error` + return
4. Mapping `grades` (GradeRow[]) ke `GradeRecord[]` via `flatMap`:
   - `tp1` sampai `tp{tpCount}` → `assessmentType: 'tp{i}'`
   - `pts` → `assessmentType: 'pts'`
   - `pas` → `assessmentType: 'pas'`
   - `pat` → `assessmentType: 'pat'`
   - `finalScore` → `assessmentType: 'final'` dengan `remarks: row.description`
5. Panggil `saveGradesBatch(records)` dalam `toast.promise`
6. `setIsDirty(false)`

## Baris yang berubah
| Perubahan | Baris | Tipe |
|-----------|-------|------|
| Import | 9 (baris baru) | Tambah |
| Hook init | 41 (baris baru) | Tambah |
| handleSave | 242-253 | Ganti (12 baris) |

**Total: 14 baris** (2 tambah, 12 ganti)

## Verifikasi
- `saveGradesBatch` di hook: menerima `GradeRecord[]`, return `{ success, error }`
- `toast.promise`—menangani promise yang selalu resolve (internal error handle di hook)
- Tidak ada perubahan selain yang di atas
