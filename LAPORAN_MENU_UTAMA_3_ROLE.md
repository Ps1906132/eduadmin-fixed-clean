# LAPORAN MENU UTAMA UNTUK 3 ROLE USER
**Tanggal:** 2025-01-21  
**Proyek:** Sistem Informasi EduAdmin - Sistem Manajemen Sekolah

---

## RINGKASAN EKSEKUTIF

Dokumen ini berisi daftar lengkap menu utama yang tersedia untuk 3 role user:
1. **Kepala Sekolah** (`'ks'`)
2. **Guru Mata Pelajaran** (`'gm'`)
3. **Wali Kelas** (`'wk'`)

**Total Menu per Role:**
- Kepala Sekolah: **6 menu utama**
- Guru Mata Pelajaran: **9 menu utama** + 4 menu navigasi bawah
- Wali Kelas: **10 menu utama** + 4 menu navigasi bawah

---

## 1. KEPALA SEKOLAH (DashboardKepalaSekolah)

**File:** `components/DashboardKepalaSekolah.tsx`  
**Role Code:** `'ks'`  
**Total Menu Utama:** **6 menu**

### 1.1 Daftar Menu Utama

| No | Menu | ID | Icon | Komponen | Deskripsi |
|----|------|----|----- |----------|-----------|
| 1 | **Monitor Sekolah** | `dashboard` | LayoutDashboard | Dashboard utama | Dashboard monitoring sekolah dengan statistik siswa, guru, kehadiran, dan agenda |
| 2 | **Laporan & Arsip** | `laporan` | FileText | Laporan & Arsip | Akses laporan keuangan, akademik, kepegawaian, dan kesiswaan yang telah divalidasi |
| 3 | **Al Quran** | `quran` | Book | AlQuranSiswa | Fitur Al Quran digital untuk membaca dan belajar |
| 4 | **Channel Sekolah** | `channel` | Tv | ChannelSekolahSiswa | Channel komunikasi dan informasi sekolah |
| 5 | **Asisten AI** | `ai` | Bot | BelajarAISiswa | Asisten AI untuk analisis data sekolah dan pertanyaan |
| 6 | **Perpustakaan** | `library` | Library | PerpustakaanSiswa | Akses ke koleksi perpustakaan digital |

### 1.2 Fitur Dashboard Utama (Monitor Sekolah)

Dashboard utama Kepala Sekolah menampilkan:

1. **Statistik Overview:**
   - Total Siswa (452 siswa)
   - Total Guru (32 guru)
   - Kehadiran Siswa (96.5%)
   - Agenda Sekolah (4 agenda)

2. **Pengumuman Pusat:**
   - Informasi & Pengumuman yang di-sync dari Admin
   - Status: Live Sync

3. **Akses Cepat:**
   - Lihat Laporan (Keuangan & Akademik)
   - Tanya Asisten AI (Analisis Data Sekolah)

### 1.3 Menu Lainnya

- **Keluar Sistem** (Logout) - Tersedia di sidebar bawah

---

## 2. GURU MATA PELAJARAN (DashboardGuruMapel)

**File:** `components/DashboardGuruMapel.tsx`  
**Role Code:** `'gm'`  
**Total Menu Utama:** **9 menu**  
**Menu Navigasi Bawah:** **4 menu**

### 2.1 Daftar Menu Utama

| No | Menu | ID | Icon | Komponen | Deskripsi |
|----|------|----|----- |----------|-----------|
| 1 | **Jadwal Mengajar** | `jadwal` | Calendar | JadwalMengajarGuru | Lihat dan kelola jadwal mengajar |
| 2 | **Cek kehadiran Siswa** | `kehadiran` | UserCheck | KehadiranSiswaGuru | Input dan cek kehadiran siswa |
| 3 | **Input Nilai** | `nilai` | FolderInput | InputNilaiGuru | Input nilai siswa untuk mata pelajaran yang diajar |
| 4 | **Materi dan Latihan** | `latihan` | BookOpen | MateriLatihanGuru | Upload dan kelola materi pembelajaran serta latihan soal |
| 5 | **Al Quran** | `quran` | Book | AlQuranSiswa | Fitur Al Quran digital |
| 6 | **Chanel sekolah ku** | `channel` | Tv | ChannelSekolahSiswa | Channel komunikasi sekolah |
| 7 | **Belajar dengan ku** | `ai` | Bot | BelajarAISiswa | Asisten AI untuk pembelajaran |
| 8 | **Perpustakaan** | `library` | Library | PerpustakaanSiswa | Akses perpustakaan digital |
| 9 | **Notepad** | `notepad` | StickyNote | NotepadGuru | Catatan pribadi guru |

### 2.2 Menu Navigasi Bawah (Bottom Navigation)

| No | Menu | ID | Icon | Deskripsi |
|----|------|----|----- |-----------|
| 1 | **Beranda** | `home` | Home | Kembali ke halaman utama dengan grid menu |
| 2 | **Jadwal** | `jadwal` | Calendar | Quick access ke jadwal mengajar |
| 3 | **Notifikasi** | `notifikasi` | Bell | Notifikasi dan pengumuman (center button dengan badge) |
| 4 | **Akun** | `profile` | User | Profil dan pengaturan akun guru |

### 2.3 Fitur Khusus

- **Header Info:**
  - Nama Guru
  - NIP
  - Mata Pelajaran yang diajar
  - Tanggal & Waktu real-time

- **Notifikasi Badge:**
  - Icon notifikasi memiliki badge merah untuk menunjukkan notifikasi baru

---

## 3. WALI KELAS (DashboardWaliKelas)

**File:** `components/DashboardWaliKelas.tsx`  
**Role Code:** `'wk'`  
**Total Menu Utama:** **10 menu**  
**Menu Navigasi Bawah:** **4 menu**

### 3.1 Daftar Menu Utama

| No | Menu | ID | Icon | Komponen | Deskripsi |
|----|------|----|----- |----------|-----------|
| 1 | **Jadwal Mengajar** | `jadwal` | Calendar | JadwalMengajarGuru | Lihat dan kelola jadwal mengajar |
| 2 | **Cek kehadiran Siswa** | `kehadiran` | UserCheck | KehadiranSiswaGuru | Input dan cek kehadiran siswa kelas yang diwadani |
| 3 | **Input Nilai** | `nilai` | FolderInput | InputNilaiGuru | Input nilai siswa untuk kelas yang diwadani |
| 4 | **Materi dan Latihan** | `latihan` | BookOpen | MateriLatihanGuru | Upload dan kelola materi pembelajaran serta latihan soal |
| 5 | **Al Quran** | `quran` | Book | AlQuranSiswa | Fitur Al Quran digital |
| 6 | **Chanel sekolah ku** | `channel` | Tv | ChannelSekolahSiswa | Channel komunikasi sekolah |
| 7 | **Belajar dengan ku** | `ai` | Bot | BelajarAISiswa | Asisten AI untuk pembelajaran |
| 8 | **Perpustakaan** | `library` | Library | PerpustakaanSiswa | Akses perpustakaan digital |
| 9 | **Notepad** | `notepad` | StickyNote | NotepadGuru | Catatan pribadi wali kelas |
| 10 | **Informasi** | `informasi` | Megaphone | InformasiWaliKelas | ⭐ **Menu khusus wali kelas** - Informasi dan pengumuman untuk kelas |

### 3.2 Menu Navigasi Bawah (Bottom Navigation)

| No | Menu | ID | Icon | Deskripsi |
|----|------|----|----- |-----------|
| 1 | **Beranda** | `home` | Home | Kembali ke halaman utama dengan grid menu |
| 2 | **Jadwal** | `jadwal` | Calendar | Quick access ke jadwal mengajar |
| 3 | **Notifikasi** | `notifikasi` | Bell | Notifikasi dan pengumuman (center button dengan badge) |
| 4 | **Akun** | `profile` | User | Profil dan pengaturan akun wali kelas |

### 3.3 Fitur Khusus

- **Menu Tambahan:** Wali Kelas memiliki **1 menu ekstra** dibanding Guru Mata Pelajaran:
  - **Informasi** - Menu khusus untuk mengelola informasi dan pengumuman kelas

- **Header Info:**
  - Nama Wali Kelas
  - NIP
  - Kelas yang diwadani (contoh: "Wali Kelas 1 A")
  - Tanggal & Waktu real-time

---

## 4. PERBANDINGAN MENU ANTAR ROLE

### 4.1 Menu yang SAMA pada Semua Role

| Menu | Kepala Sekolah | Guru Mapel | Wali Kelas |
|------|----------------|------------|------------|
| Al Quran | ✅ | ✅ | ✅ |
| Channel Sekolah | ✅ | ✅ | ✅ |
| Asisten AI | ✅ | ✅ | ✅ |
| Perpustakaan | ✅ | ✅ | ✅ |

### 4.2 Menu yang SAMA pada Guru Mapel & Wali Kelas

| Menu | Kepala Sekolah | Guru Mapel | Wali Kelas |
|------|----------------|------------|------------|
| Jadwal Mengajar | ❌ | ✅ | ✅ |
| Cek kehadiran Siswa | ❌ | ✅ | ✅ |
| Input Nilai | ❌ | ✅ | ✅ |
| Materi dan Latihan | ❌ | ✅ | ✅ |
| Notepad | ❌ | ✅ | ✅ |
| Navigasi Bawah (4 menu) | ❌ | ✅ | ✅ |

### 4.3 Menu EKSKLUSIF per Role

#### Kepala Sekolah:
- ✅ **Monitor Sekolah** (dashboard dengan statistik)
- ✅ **Laporan & Arsip** (akses laporan divalidasi)

#### Guru Mata Pelajaran:
- ❌ Tidak ada menu eksklusif (semua menu juga ada di Wali Kelas atau umum)

#### Wali Kelas:
- ✅ **Informasi** (menu khusus wali kelas untuk informasi kelas)

---

## 5. STATISTIK MENU

### 5.1 Jumlah Menu per Role

| Role | Menu Utama | Menu Navigasi Bawah | Total Menu |
|------|-----------|---------------------|------------|
| Kepala Sekolah | 6 | 0 | **6** |
| Guru Mata Pelajaran | 9 | 4 | **13** |
| Wali Kelas | 10 | 4 | **14** |

### 5.2 Kategori Menu

| Kategori | Jumlah Menu | Role yang Memiliki |
|----------|-------------|-------------------|
| **Akademik/Teaching** | 4 | Guru Mapel, Wali Kelas |
| - Jadwal Mengajar | 1 | - |
| - Cek Kehadiran | 1 | - |
| - Input Nilai | 1 | - |
| - Materi & Latihan | 1 | - |
| **Monitoring/Reporting** | 2 | Kepala Sekolah |
| - Monitor Sekolah | 1 | - |
| - Laporan & Arsip | 1 | - |
| **Multimedia/Learning** | 4 | Semua |
| - Al Quran | 1 | - |
| - Channel Sekolah | 1 | - |
| - Asisten AI | 1 | - |
| - Perpustakaan | 1 | - |
| **Tools** | 2 | Guru Mapel, Wali Kelas |
| - Notepad | 1 | - |
| - Informasi (khusus Wali) | 1 | Wali Kelas saja |
| **Navigation** | 4 | Guru Mapel, Wali Kelas |
| - Beranda, Jadwal, Notifikasi, Akun | 4 | - |

---

## 6. DETAIL KOMPONEN YANG DIGUNAKAN

### 6.1 Komponen Shared (Digunakan oleh Multiple Role)

| Komponen | File | Digunakan Oleh |
|----------|------|----------------|
| AlQuranSiswa | `components/AlQuranSiswa.tsx` | KS, GM, WK |
| ChannelSekolahSiswa | `components/ChannelSekolahSiswa.tsx` | KS, GM, WK |
| BelajarAISiswa | `components/BelajarAISiswa.tsx` | KS, GM, WK |
| PerpustakaanSiswa | `components/PerpustakaanSiswa.tsx` | KS, GM, WK |
| JadwalMengajarGuru | `components/JadwalMengajarGuru.tsx` | GM, WK |
| KehadiranSiswaGuru | `components/KehadiranSiswaGuru.tsx` | GM, WK |
| InputNilaiGuru | `components/InputNilaiGuru.tsx` | GM, WK |
| MateriLatihanGuru | `components/MateriLatihanGuru.tsx` | GM, WK |
| NotepadGuru | `components/NotepadGuru.tsx` | GM, WK |
| ProfilGuru | `components/ProfilGuru.tsx` | GM, WK |
| NotifikasiSiswa | `components/NotifikasiSiswa.tsx` | GM, WK |

### 6.2 Komponen Eksklusif

| Komponen | File | Digunakan Oleh |
|----------|------|----------------|
| InformasiWaliKelas | `components/InformasiWaliKelas.tsx` | Wali Kelas saja |

---

## 7. KESIMPULAN

### 7.1 Ringkasan

1. **Kepala Sekolah:**
   - Memiliki menu paling sedikit (6 menu)
   - Fokus pada **monitoring** dan **laporan**
   - Tidak memiliki menu navigasi bawah
   - Dashboard lebih sederhana dan professional

2. **Guru Mata Pelajaran:**
   - Memiliki 9 menu utama + 4 menu navigasi
   - Fokus pada **aktivitas mengajar** (jadwal, kehadiran, nilai, materi)
   - Memiliki navigasi bawah untuk akses cepat
   - UI mobile-friendly dengan bottom navigation

3. **Wali Kelas:**
   - Memiliki **menu terbanyak** (10 menu utama + 4 menu navigasi)
   - Memiliki **semua menu Guru Mapel** + **1 menu tambahan** (Informasi)
   - Menu "Informasi" adalah pembeda utama dengan Guru Mapel
   - Fokus pada **manajemen kelas** yang lebih lengkap

### 7.2 Rekomendasi

1. ✅ **Menu sudah lengkap** untuk kebutuhan masing-masing role
2. ✅ **Konsistensi** pada menu shared sudah baik
3. ⚠️ **Wali Kelas vs Guru Mapel:** Hanya berbeda 1 menu (Informasi)
4. 💡 **Saran:** Pertimbangkan untuk membedakan lebih jelas fungsi Wali Kelas vs Guru Mapel jika diperlukan

---

**Dibuat oleh:** AI Assistant  
**Metode Analisis:** Code Review + File Reading  
**Lokasi File:**
- `components/DashboardKepalaSekolah.tsx`
- `components/DashboardGuruMapel.tsx`
- `components/DashboardWaliKelas.tsx`
