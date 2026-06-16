# CHANGELOG — Perbaikan Sinkronisasi & TypeScript

## Ringkasan

Dua kategori utama perbaikan:
1. **Perbaikan TypeScript & Kompilasi** — Error bawaan proyek (build gagal, tsc error)
2. **Fase 4 — Sinkronisasi Modul Bimbingan Belajar** — Memastikan data les (jadwal, kehadiran, materi, kelas) sinkron antar role: Admin → Guru Bimbel → Siswa/Orang Tua

---

## 1. Perbaikan TypeScript & Kompilasi

| # | File | Perubahan | Alasan |
|---|------|-----------|--------|
| 1 | `functions/api/[[path]].ts` | Cast `unknown` → `Env`, fix tipe env | Tipe parameter fetch handler tidak kompatibel |
| 2 | `functions/api/_shared/types.d.ts` | **File baru** — deklarasi tipe Cloudflare (`Env`, `D1Database`) | Agar TypeScript mengenali tipe environment Workers |
| 3 | `scripts/generate-admin-seed.ts` | Fix template literal (backtick) | Syntax error runtime |
| 4 | `src/components/DashboardSuperAdmin.tsx` | Hapus prop `classes` dari `TabunganView` | Prop tidak didefinisikan di interface TabunganView |
| 5 | `src/components/DashboardSuperAdmin/components/views/JadwalUjianView.tsx` | Sesuaikan nama prop di modal | Nama prop tidak cocok dengan state |
| 6 | `src/components/DashboardSuperAdmin/hooks/useFinance.ts` | Cast response fetch sebagai `any[]` | Tipe response tidak dikenal TypeScript |
| 7 | `src/components/DashboardSuperAdmin/hooks/useSavings.ts` | Cast response fetch sebagai `any[]` | Sama dengan useFinance |
| 8 | `src/components/DashboardSuperAdmin/hooks/useTutoring.ts` | Selaraskan interface `TutoringEnrollment` dengan sharedData | Duplikasi tipe menyebabkan error |
| 9 | `src/components/DataGuruStaff.tsx` | Tambah field `teacher_id` di object `handleAddWali` | Missing property |
| 10 | `src/components/KehadiranSiswa.tsx` | Ganti `{studentName}` dengan `user?.nama` | Variabel tidak didefinisikan |
| 11 | `src/components/MateriLatihanGuru.tsx` | Tambah import `useEffect` | React hook digunakan tanpa import |
| 12 | `src/components/Pengaturan.tsx` | Wrap `db.from()` dengan `as any` | Tipe Supabase/D1 tidak dikenali |
| 13 | `src/components/Rapot.tsx` | Tambah import `Save` dari `lucide-react` | Icon digunakan tanpa import |
| 14 | `src/components/Tabungan.tsx` | Perbaiki properti object `SavingsData` | Nama field tidak cocok dengan interface |
| 15 | `src/data/sharedData.ts` | Tambah `studentId` di interface `SavingsData`, `dailyUniforms` di `MasterExamSchedule` | Field reference di komponen lain |
| 16 | `src/lib/migrateToD1.ts` | Wrap `db.from()` dengan helper `exec()` | Tipe method tidak kompatibel |

---

## 2. Fase 4 — Sinkronisasi Bimbingan Belajar

### 4.1 — Sinkronisasi Jadwal Guru Bimbel

**Masalah:** `DashboardGuruBimbel` mencocokkan guru berdasarkan `c.teacher === user?.nama` (string match). Jika nama guru tidak cocok persis (spasi, kapital, dll), kelas tidak muncul di dashboard guru.

**Perbaikan:**
- `DashboardGuruBimbel.tsx:30-38` — Filter kelas menggunakan ID profile (`bimbel_{id}`) bukan string nama
- `useTutoring.ts` — Data guru bimbel sekarang punya field `id` yang cocok dengan `user.id` (format: `bimbel_{Date.now()}`)

### 4.2 — Sinkronisasi Kehadiran Les

**Masalah:** Admin tidak bisa melihat rekap kehadiran les (`/api/bimbel_attendance`). Data hanya tampil di Guru Bimbel dan Siswa. Tab "Rekap Kehadiran" sudah ada state/fetch function-nya tapi tidak dimasukkan ke navigasi tab.

**Perbaikan:**
- `BimbinganBelajarView.tsx:671-760` — Tambah tab "Rekap Kehadiran" ke navigasi tab
- Tabel kehadiran menampilkan: Nama Siswa, Status (hadir/sakit/izin/alpa), Catatan
- Filter berdasarkan Guru Bimbel + Tanggal
- Fungsi `getStudentName(r.student_id)` untuk menampilkan nama (bukan `Siswa #ID`)

### 4.3 — Sinkronisasi Materi ke Orang Tua

**Masalah:** `DashboardOrangTua` melewatkan `user` ke `BimbinganBelajarSiswa`, tapi jika `user?.studentId` tidak ada (cache lama, database kosong), kelas bimbel siswa tidak muncul.

**Perbaikan:**
- `DashboardOrangTua.tsx:50-65` — `useEffect` fallback: jika `user?.studentId` kosong, fetch `/api/parent_students?parent_id=eq.{user.id}` untuk ambil `student_id`
- `BimbinganBelajarSiswa.tsx:10` — Interface ditambah `studentId?: number | string | null`
- `BimbinganBelajarSiswa.tsx:22` — `const studentId = propStudentId || user?.studentId || user?.id` (prioritas: prop → user → fallback)

### 4.4 — Filter Kelas Siswa

**Masalah:** `BimbinganBelajarSiswa` menampilkan semua `tutoringClasses` tanpa filter. Siswa bisa melihat kelas yang tidak terdaftar di enrollment mereka.

**Perbaikan:**
- `BimbinganBelajarSiswa.tsx:22-28` — Filter `tutoringClasses` berdasarkan `tutoringEnrollmentsGlobal` yang cocok dengan `studentId`
- State `myEnrolledGroupIds` dibangun dari enrollment global, lalu kelas difilter: `tutoringClasses.filter(c => myEnrolledGroupIds.has(c.id))`
- Jika tidak ada enrollment, tidak ada kelas yang tampil

---

## Status Akhir

| Modul | Status | Keterangan |
|-------|--------|------------|
| TypeScript build | ✅ | `tsc --noEmit` lulus, `vite build` sukses |
| 4.1 Jadwal Guru Bimbel | ✅ | Filter pakai ID, bukan nama |
| 4.2 Kehadiran Les | ✅ | Tab rekap kehadiran di Admin |
| 4.3 Materi → Orang Tua | ✅ | Fallback fetch `studentId` |
| 4.4 Filter Kelas Siswa | ✅ | Hanya tampilkan kelas terdaftar |

---

## Catatan

- Perbaikan ini bersifat **frontend-only**, tidak ada perubahan skema database
- Data enrollment les di-cache di `localStorage` key `tutoring_enrollments_v11`
- Setiap perbaikan sudah diverifikasi dengan `npx tsc --noEmit` dan `npx vite build`
