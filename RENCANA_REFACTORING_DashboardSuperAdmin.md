# RENCANA REFACTORING DashboardSuperAdmin.tsx

## 📋 ANALISIS STRUKTUR

**File saat ini:**
- `components/DashboardSuperAdmin.tsx` - 4.959 baris
- 103 useState declarations
- 18 menu items / views

**Menu Items:**
1. dashboard - Beranda
2. data_siswa - Data Siswa dan kelas
3. data_guru - Data Guru & Staff
4. kelas_wali - Kelas dan wali kelas
5. mapel - Mata Pelajaran
6. jadwal - Jadwal
7. absen - Absen
8. ujian - Jadwal Ujian
9. nilai - Nilai
10. rapot - Rapot
11. keuangan - Keuangan
12. tabungan - Tabungan
13. naik_kelas - Naik Kelas
14. bimbingan_belajar - Bimbingan belajar (les)
15. pengumuman - Pengumuman
16. laporan - Laporan
17. multimedia - Manajemen Multimedia
18. settings - Pengaturan

---

## 🎯 STRATEGI REFACTORING

### **Pendekatan: Incremental Refactoring (Bertahap)**

Kita akan memecah file besar menjadi komponen-komponen kecil secara bertahap, tanpa merusak fungsi yang ada.

---

## 📁 STRUKTUR FOLDER BARU

```
components/
├── DashboardSuperAdmin/
│   ├── DashboardSuperAdmin.tsx (Main container - ~200-300 baris)
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── views/
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── DataSiswaView.tsx
│   │   │   ├── DataGuruView.tsx
│   │   │   ├── KelasWaliView.tsx
│   │   │   ├── MataPelajaranView.tsx
│   │   │   ├── JadwalView.tsx
│   │   │   ├── AbsenView.tsx
│   │   │   ├── UjianView.tsx
│   │   │   ├── NilaiView.tsx
│   │   │   ├── RapotView.tsx
│   │   │   ├── KeuanganView.tsx
│   │   │   ├── TabunganView.tsx
│   │   │   ├── NaikKelasView.tsx
│   │   │   ├── BimbinganBelajarView.tsx
│   │   │   ├── PengumumanView.tsx
│   │   │   ├── LaporanView.tsx
│   │   │   ├── MultimediaView.tsx
│   │   │   └── SettingsView.tsx
│   │   └── modals/ (jika diperlukan)
│   ├── hooks/
│   │   ├── useDashboardData.ts
│   │   ├── useStudents.ts
│   │   ├── useTeachers.ts
│   │   └── ... (custom hooks lainnya)
│   └── types.ts
```

---

## 🚀 LANGKAH-LANGKAH REFACTORING

### **Phase 1: Setup Struktur (Tanpa mengubah fungsi)**

1. ✅ Buat folder `components/DashboardSuperAdmin/`
2. ✅ Buat file `types.ts` untuk types/interfaces
3. ✅ Buat file `DashboardSuperAdmin.tsx` baru (main container)
4. ✅ Pindahkan Sidebar ke komponen terpisah

### **Phase 2: Extract Views (Satu per satu)**

Untuk setiap view, lakukan:
1. ✅ Ekstrak view section ke file terpisah
2. ✅ Pass props yang diperlukan
3. ✅ Test fungsi masih bekerja
4. ✅ Commit perubahan

**Urutan ekstraksi (prioritas):**
1. DashboardHome (dashboard)
2. PengumumanView (sudah ada komponen Pengumuman.tsx)
3. LaporanView (sudah ada komponen Laporan.tsx)
4. MultimediaView (sudah ada komponen Multimedia.tsx)
5. SettingsView (sudah ada komponen Pengaturan.tsx)
6. DataSiswaView
7. DataGuruView
8. ... dan seterusnya

### **Phase 3: Extract Data Hooks (Optional - jika diperlukan)**

Jika banyak state yang digunakan bersama:
1. ✅ Buat custom hooks untuk grouped state
2. ✅ Gunakan useReducer untuk complex state
3. ✅ Atau gunakan Context API

### **Phase 4: Cleanup**

1. ✅ Hapus file lama (backup dulu)
2. ✅ Update imports di App.tsx
3. ✅ Test semua fungsi
4. ✅ Dokumentasi

---

## 💡 KEUNTUNGAN SETELAH REFACTORING

1. **Maintainability** - Setiap file kecil dan fokus
2. **Readability** - Mudah dibaca dan dipahami
3. **Testability** - Mudah untuk di-test
4. **Reusability** - Komponen bisa digunakan ulang
5. **Collaboration** - Tim bisa bekerja paralel tanpa conflict
6. **Performance** - Lazy loading untuk view yang tidak aktif

---

## ⚠️ CATATAN PENTING

1. **Backup dulu** - Buat backup file DashboardSuperAdmin.tsx sebelum refactoring
2. **Incremental** - Lakukan secara bertahap, test setiap step
3. **Tidak ubah logic** - Hanya memindahkan kode, tidak mengubah logic
4. **Tetap fungsional** - Pastikan semua fungsi masih bekerja setelah refactoring

---

**Apakah Anda ingin saya mulai refactoring sekarang?**

Saya akan:
1. ✅ Buat struktur folder baru
2. ✅ Ekstrak komponen secara bertahap
3. ✅ Test setiap perubahan
4. ✅ Pastikan semua fungsi tetap bekerja
