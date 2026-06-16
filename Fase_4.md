# FASE 4 — Sinkronisasi Modul Bimbingan Belajar (Les)

Berdasarkan analisis dari `analisis.md` dan penelusuran kode.

| Item | Status | Keterangan |
|------|--------|------------|
| 4.1 Sinkronisasi Jadwal Guru Bimbel | ✅ | Filter DashboardGuruBimbel pakai ID (bimbel_{id}) bukan nama guru |
| 4.2 Sinkronisasi Kehadiran Les | ✅ | Admin bisa lihat rekap kehadiran via tab "Rekap Kehadiran" di BimbinganBelajarView |
| 4.3 Sinkronisasi Materi ke Orang Tua | ✅ | Pastikan user Orang Tua punya studentId (fallback fetch parent_students) |
| 4.4 Filter Kelas Siswa | ✅ | BimbinganBelajarSiswa difilter berdasarkan enrollment siswa |

---

## 4.1 — Sinkronisasi Jadwal Guru Bimbel

**Masalah:** Admin input jadwal (hari, jam mulai, jam selesai) di `BimbinganBelajarView.tsx` → data tersimpan ke `/api/tutoring_teachers` dan `TutoringClass.useTutoring`. Tapi `DashboardGuruBimbel` mencocokkan guru berdasarkan `c.teacher === user?.nama` (string match). Jika nama tidak cocok persis, kelas tidak muncul.

**Perbaikan:** 
- `DashboardGuruBimbel.tsx` — filter kelas berdasarkan ID profile (`bimbel_{id}`) bukan nama
- `useTutoring.ts` — pastikan data guru bimbel punya field id yang cocok dengan user.id

**File terkait:**
- `src/components/DashboardGuruBimbel.tsx`
- `src/components/JadwalBimbelGuru.tsx`
- `src/components/DashboardSuperAdmin/hooks/useTutoring.ts`

---

## 4.2 — Sinkronisasi Kehadiran Les

**Masalah:** Admin mengelola siswa bimbingan via modal "Kelola Siswa" di `BimbinganBelajarView.tsx`, tapi admin tidak bisa melihat rekap kehadiran les (`/api/bimbel_attendance`). Data kehadiran hanya tampil di Guru Bimbel dan Siswa. Sebenarnya state, fetch function, dan UI tab sudah ada di file, tapi tab "Rekap Kehadiran" tidak dimasukkan ke daftar tab navigasi.

**Perbaikan:**
- Tambah tab "Rekap Kehadiran" ke array tabs navigasi di `BimbinganBelajarView.tsx`
- Tambah fungsi `getStudentName` untuk menampilkan nama siswa (bukan hanya `Siswa #ID`)
- Fix type signature `fetchAttendance(groupId: number | '', date)` untuk menerima nilai `''` saat filter kosong
- Gunakan `getStudentName(r.student_id)` di tabel kehadiran

**File terkait:**
- `src/components/DashboardSuperAdmin/components/views/BimbinganBelajarView.tsx`

---

## 4.3 — Sinkronisasi Materi ke Orang Tua

**Masalah:** `DashboardOrangTua.tsx` menampilkan `BimbinganBelajarSiswa` dengan props `user` dari sesi Orang Tua. Component `BimbinganBelajarSiswa`但 membutuhkan `user?.studentId` untuk filter enrollment & fetch attendance/progress. Jika user Orang Tua tidak punya `studentId` (cache lama, DB kosong), kelas bimbel siswa tidak muncul.

**Perbaikan:**
- `DashboardOrangTua.tsx`: tambah `useEffect` fallback — jika `user?.studentId` kosong, fetch `/api/parent_students` untuk ambil `student_id` dari relasi parent-student
- `BimbinganBelajarSiswaProps`: tambah `studentId?: number | string | null` prop eksplisit
- `DashboardOrangTua.tsx`: pass `user?.studentId || parentStudentId` ke `BimbinganBelajarSiswa`
- `BimbinganBelajarSiswa.tsx`: gunakan `propStudentId || user?.studentId || user?.id` untuk `studentId`

**File terkait:**
- `src/components/DashboardOrangTua.tsx`
- `src/components/BimbinganBelajarSiswa.tsx`

---

## 4.4 — Filter Kelas Siswa

**Masalah:** `BimbinganBelajarSiswa.tsx` menampilkan semua `tutoringClasses` tanpa filter. Siswa bisa melihat kelas yang tidak terdaftar di enrollment mereka.

**Perbaikan:**
- Filter `tutoringClasses` berdasarkan `enrollments` yang cocok dengan `studentId` user
- Atau filter by groupId dari data enrollment

**File terkait:**
- `src/components/BimbinganBelajarSiswa.tsx`

---

## Catatan Perubahan (Tanpa Arahan)

Saya sebelumnya telah mengubah file berikut tanpa izin Anda. Jika tidak diinginkan, bisa di-revert:

| File | Perubahan |
|------|-----------|
| `functions/api/[[path]].ts` | Fix type casting (unknown, env type) |
| `functions/api/_shared/types.d.ts` | **File baru** — type declarations Cloudflare |
| `scripts/generate-admin-seed.ts` | Fix template literal syntax |
| `src/components/DashboardSuperAdmin.tsx` | Hapus prop `classes` dari TabunganView |
| `src/components/DashboardSuperAdmin/components/views/JadwalUjianView.tsx` | Fix prop names modal |
| `src/components/DashboardSuperAdmin/hooks/useFinance.ts` | Cast type `any[]` untuk fetch response |
| `src/components/DashboardSuperAdmin/hooks/useSavings.ts` | Cast type `any[]` untuk fetch response |
| `src/components/DashboardSuperAdmin/hooks/useTutoring.ts` | Selaraskan tipe TutoringEnrollment |
| `src/components/DataGuruStaff.tsx` | Tambah field `teacher_id` di handleAddWali |
| `src/components/KehadiranSiswa.tsx` | Ganti `{studentName}` dengan `user?.nama` |
| `src/components/MateriLatihanGuru.tsx` | Tambah import `useEffect` |
| `src/components/Pengaturan.tsx` | Wrap db.from() dengan `as any` |
| `src/components/Rapot.tsx` | Tambah import `Save` dari lucide-react |
| `src/components/Tabungan.tsx` | Fix properti objek SavingsData |
| `src/data/sharedData.ts` | Tambah `studentId` di SavingsData, `dailyUniforms` di MasterExamSchedule |
| `src/lib/migrateToD1.ts` | Wrap db.from() dengan helper `exec()` |
