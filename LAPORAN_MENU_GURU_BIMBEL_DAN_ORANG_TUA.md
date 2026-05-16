# LAPORAN MENU UTAMA UNTUK GURU BIMBEL DAN ORANG TUA/WALI
**Tanggal:** 2025-01-21  
**Proyek:** Sistem Informasi EduAdmin - Sistem Manajemen Sekolah

---

## RINGKASAN EKSEKUTIF

Dokumen ini berisi daftar lengkap menu utama yang tersedia untuk 2 role user:
1. **Guru Bimbel** (`'gb'`)
2. **Orang Tua/Wali** (`'ot'`)

**Total Menu per Role:**
- Guru Bimbel: **10 menu utama** + 4 menu navigasi bawah
- Orang Tua/Wali: **12 menu utama** + 5 menu navigasi bawah

---

## 1. GURU BIMBEL (DashboardGuruBimbel)

**File:** `components/DashboardGuruBimbel.tsx`  
**Role Code:** `'gb'`  
**Total Menu Utama:** **10 menu**  
**Menu Navigasi Bawah:** **4 menu**

### 1.1 Daftar Menu Utama

| No | Menu | ID | Icon | Komponen | Deskripsi |
|----|------|----|----- |----------|-----------|
| 1 | **Jadwal Bimbel** | `jadwal` | Calendar | JadwalBimbelGuru | Lihat dan kelola jadwal bimbingan belajar |
| 2 | **Cek kehadiran Siswa** | `kehadiran` | UserCheck | KehadiranBimbelGuru | Input dan cek kehadiran siswa bimbel |
| 3 | **Input Nilai** | `nilai` | FolderInput | InputNilaiBimbelGuru | Input nilai siswa untuk program bimbel |
| 4 | **Materi dan Latihan** | `latihan` | BookOpen | InputMateriBimbelLengkap | Upload dan kelola materi bimbel serta latihan soal |
| 5 | **Al Quran** | `quran` | Book | AlQuranSiswa | Fitur Al Quran digital |
| 6 | **Chanel sekolah ku** | `channel` | Tv | ChannelSekolahSiswa | Channel komunikasi sekolah |
| 7 | **Belajar dengan ku** | `ai` | Bot | BelajarAISiswa | Asisten AI untuk pembelajaran |
| 8 | **Perpustakaan** | `library` | Library | PerpustakaanSiswa | Akses perpustakaan digital |
| 9 | **Notepad** | `notepad` | StickyNote | NotepadGuru | Catatan pribadi guru bimbel |
| 10 | **Informasi** | `informasi` | Megaphone | - | ⚠️ **Menu ada di array tapi belum terhubung ke komponen** |

### 1.2 Menu Navigasi Bawah (Bottom Navigation)

| No | Menu | ID | Icon | Deskripsi |
|----|------|----|----- |-----------|
| 1 | **Beranda** | `home` | Home | Kembali ke halaman utama dengan grid menu |
| 2 | **Jadwal** | `jadwal` | Calendar | Quick access ke jadwal bimbel |
| 3 | **Notifikasi** | `notifikasi` | Bell | Notifikasi dan pengumuman (center button dengan badge) |
| 4 | **Akun** | `profile` | User | Profil dan pengaturan akun guru bimbel |

### 1.3 Fitur Khusus

- **Header Info:**
  - Nama Guru Bimbel
  - NIP
  - Mata Pelajaran/Program Bimbel
  - Tanggal & Waktu real-time

- **Komponen Khusus Bimbel:**
  - `JadwalBimbelGuru` - Khusus untuk jadwal bimbingan belajar
  - `KehadiranBimbelGuru` - Khusus untuk kehadiran siswa bimbel
  - `InputNilaiBimbelGuru` - Khusus untuk input nilai bimbel
  - `InputMateriBimbelLengkap` - Khusus untuk materi bimbel lengkap

- **Catatan:**
  - Menu "Informasi" ada di array menuItems tapi belum terhubung ke komponen (baris 60)
  - Menu "Informasi" tidak memiliki handler onClick di baris 144-154

---

## 2. ORANG TUA/WALI (DashboardOrangTua)

**File:** `components/DashboardOrangTua.tsx`  
**Role Code:** `'ot'`  
**Total Menu Utama:** **12 menu**  
**Menu Navigasi Bawah:** **5 menu**

### 2.1 Daftar Menu Utama

| No | Menu | ID | Icon | Komponen | Deskripsi |
|----|------|----|----- |----------|-----------|
| 1 | **Jadwal Pelajaran** | `jadwal` | Calendar | JadwalPelajaran | Lihat jadwal pelajaran anak |
| 2 | **Jadwal Ujian** | `ujian` | FileText | JadwalUjian | Lihat jadwal ujian dan evaluasi |
| 3 | **Hasil Belajar** | `hasil` | GraduationCap | HasilBelajar | Lihat rapor, nilai, dan hasil belajar anak |
| 4 | **Kehadiran** | `absen` | UserCheck | KehadiranSiswa | Lihat riwayat kehadiran anak di sekolah |
| 5 | **Pembayaran** | `bayar` | CreditCard | PembayaranSiswa | Lihat tagihan dan riwayat pembayaran (SPP, dll) |
| 6 | **Tabungan** | `tabungan` | Wallet | TabunganSiswa | Lihat saldo dan riwayat tabungan anak |
| 7 | **Bimbingan Belajar** | `bimbingan` | BookOpen | BimbinganBelajarSiswa | Informasi tentang program bimbel anak |
| 8 | **Materi dan Latihan** | `latihan` | PenTool | LatihanSoalSiswa | Akses materi pembelajaran dan latihan soal |
| 9 | **Al Quran** | `quran` | Book | AlQuranSiswa | Fitur Al Quran digital |
| 10 | **Channel Sekolah** | `channel` | Tv | ChannelSekolahSiswa | Channel komunikasi sekolah |
| 11 | **Belajar AI** | `ai` | Bot | BelajarAISiswa | Asisten AI untuk pembelajaran |
| 12 | **Perpustakaan** | `library` | Library | PerpustakaanSiswa | Akses perpustakaan digital |

### 2.2 Menu Navigasi Bawah (Bottom Navigation)

| No | Menu | ID | Icon | Deskripsi |
|----|------|----|----- |-----------|
| 1 | **Beranda** | `home` | Home | Kembali ke halaman utama dengan grid menu |
| 2 | **Tabungan** | `tabungan` | Wallet | Quick access ke tabungan anak (khusus orang tua) |
| 3 | **Notifikasi** | `notifikasi` | Bell | Notifikasi dan pengumuman (center button dengan badge) |
| 4 | **Agenda** | `jadwal` | Calendar | Quick access ke jadwal pelajaran (sebagai "Agenda") |
| 5 | **Akun** | `profile` | User | Profil dan pengaturan akun orang tua |

### 2.3 Fitur Khusus

- **Header Info:**
  - Nama Orang Tua/Wali
  - Nama Anak (Ananda Tercinta)
  - Kelas Anak (contoh: "Kelas 5A")
  - Wali Kelas (contoh: "Ibu Guru Siti Aminah")
  - Tanggal & Waktu real-time

- **Sidebar Informasi Sekolah:**
  - Panel informasi sekolah di sisi kanan (hanya muncul di halaman home)
  - Menampilkan pengumuman sekolah yang di-sync
  - Status: Live Sync

- **Menu Khusus Orang Tua:**
  - **Pembayaran** - Menu khusus untuk melihat tagihan dan pembayaran
  - **Tabungan** - Menu khusus untuk melihat tabungan anak
  - **Hasil Belajar** - Menu untuk melihat rapor dan nilai
  - **Jadwal Ujian** - Menu khusus untuk jadwal ujian

---

## 3. PERBANDINGAN MENU

### 3.1 Menu yang SAMA pada Guru Bimbel & Orang Tua

| Menu | Guru Bimbel | Orang Tua |
|------|-------------|-----------|
| Al Quran | ✅ | ✅ |
| Channel Sekolah | ✅ | ✅ |
| Belajar AI | ✅ | ✅ |
| Perpustakaan | ✅ | ✅ |
| Materi dan Latihan | ✅ | ✅ |

### 3.2 Menu yang BERBEDA

#### Menu Khusus Guru Bimbel:
- ✅ **Jadwal Bimbel** (bukan Jadwal Pelajaran)
- ✅ **Cek kehadiran Siswa** (untuk input kehadiran)
- ✅ **Input Nilai** (untuk input nilai)
- ✅ **Notepad** (catatan pribadi)
- ⚠️ **Informasi** (ada di array tapi belum terhubung)

#### Menu Khusus Orang Tua:
- ✅ **Jadwal Pelajaran** (lihat jadwal)
- ✅ **Jadwal Ujian** (lihat jadwal ujian)
- ✅ **Hasil Belajar** (lihat rapor/nilai)
- ✅ **Kehadiran** (lihat riwayat, bukan input)
- ✅ **Pembayaran** (lihat tagihan)
- ✅ **Tabungan** (lihat saldo)
- ✅ **Bimbingan Belajar** (informasi bimbel anak)

---

## 4. STATISTIK MENU

### 4.1 Jumlah Menu per Role

| Role | Menu Utama | Menu Navigasi Bawah | Total Menu |
|------|-----------|---------------------|------------|
| Guru Bimbel | 10 | 4 | **14** |
| Orang Tua/Wali | 12 | 5 | **17** |

### 4.2 Kategori Menu

| Kategori | Guru Bimbel | Orang Tua |
|----------|-------------|-----------|
| **Teaching/Input** | 4 menu | 0 menu |
| - Jadwal Bimbel | ✅ | ❌ |
| - Cek Kehadiran | ✅ | ❌ |
| - Input Nilai | ✅ | ❌ |
| - Materi & Latihan | ✅ | ❌ |
| **Monitoring/View** | 0 menu | 7 menu |
| - Jadwal Pelajaran | ❌ | ✅ |
| - Jadwal Ujian | ❌ | ✅ |
| - Hasil Belajar | ❌ | ✅ |
| - Kehadiran | ❌ | ✅ |
| - Pembayaran | ❌ | ✅ |
| - Tabungan | ❌ | ✅ |
| - Bimbingan Belajar | ❌ | ✅ |
| **Multimedia/Learning** | 4 menu | 4 menu |
| - Al Quran | ✅ | ✅ |
| - Channel Sekolah | ✅ | ✅ |
| - Belajar AI | ✅ | ✅ |
| - Perpustakaan | ✅ | ✅ |
| **Tools** | 2 menu | 0 menu |
| - Notepad | ✅ | ❌ |
| - Informasi | ⚠️ | ❌ |

---

## 5. DETAIL KOMPONEN YANG DIGUNAKAN

### 5.1 Komponen Khusus Guru Bimbel

| Komponen | File | Deskripsi |
|----------|------|-----------|
| JadwalBimbelGuru | `components/JadwalBimbelGuru.tsx` | Jadwal khusus bimbingan belajar |
| KehadiranBimbelGuru | `components/KehadiranBimbelGuru.tsx` | Kehadiran siswa bimbel |
| InputNilaiBimbelGuru | `components/InputNilaiBimbelGuru.tsx` | Input nilai bimbel |
| InputMateriBimbelLengkap | `components/InputMateriBimbelLengkap.tsx` | Materi bimbel lengkap |

### 5.2 Komponen Khusus Orang Tua

| Komponen | File | Deskripsi |
|----------|------|-----------|
| JadwalPelajaran | `components/JadwalPelajaran.tsx` | Jadwal pelajaran siswa |
| JadwalUjian | `components/JadwalUjian.tsx` | Jadwal ujian siswa |
| HasilBelajar | `components/HasilBelajar.tsx` | Rapor dan nilai siswa |
| KehadiranSiswa | `components/KehadiranSiswa.tsx` | Riwayat kehadiran siswa |
| PembayaranSiswa | `components/PembayaranSiswa.tsx` | Tagihan dan pembayaran |
| TabunganSiswa | `components/TabunganSiswa.tsx` | Tabungan siswa |
| BimbinganBelajarSiswa | `components/BimbinganBelajarSiswa.tsx` | Info bimbel siswa |
| LatihanSoalSiswa | `components/LatihanSoalSiswa.tsx` | Latihan soal untuk siswa |

### 5.3 Komponen Shared

| Komponen | File | Digunakan Oleh |
|----------|------|----------------|
| AlQuranSiswa | `components/AlQuranSiswa.tsx` | GB, OT |
| ChannelSekolahSiswa | `components/ChannelSekolahSiswa.tsx` | GB, OT |
| BelajarAISiswa | `components/BelajarAISiswa.tsx` | GB, OT |
| PerpustakaanSiswa | `components/PerpustakaanSiswa.tsx` | GB, OT |
| NotepadGuru | `components/NotepadGuru.tsx` | GB saja |
| ProfilGuru | `components/ProfilGuru.tsx` | GB saja |
| ProfilAkun | `components/ProfilAkun.tsx` | OT saja |
| NotifikasiSiswa | `components/NotifikasiSiswa.tsx` | GB, OT |

---

## 6. PERBANDINGAN DENGAN ROLE LAIN

### 6.1 Perbandingan dengan Guru Mapel & Wali Kelas

| Menu | Guru Bimbel | Guru Mapel | Wali Kelas |
|------|-------------|------------|------------|
| **Jadwal** | ✅ Jadwal Bimbel | ✅ Jadwal Mengajar | ✅ Jadwal Mengajar |
| **Kehadiran** | ✅ Cek Kehadiran | ✅ Cek Kehadiran | ✅ Cek Kehadiran |
| **Nilai** | ✅ Input Nilai | ✅ Input Nilai | ✅ Input Nilai |
| **Materi & Latihan** | ✅ Materi Bimbel | ✅ Materi & Latihan | ✅ Materi & Latihan |
| **Notepad** | ✅ | ✅ | ✅ |
| **Informasi** | ⚠️ Ada tapi belum terhubung | ❌ | ✅ |

**Kesimpulan:**
- Guru Bimbel memiliki menu yang **sangat mirip** dengan Guru Mapel dan Wali Kelas
- Perbedaan utama: "Jadwal Bimbel" vs "Jadwal Mengajar"
- Komponen yang digunakan berbeda (khusus bimbel)

### 6.2 Perbandingan Navigasi Bawah

| Role | Beranda | Menu 2 | Notifikasi | Menu 4 | Menu 5 |
|------|---------|--------|------------|--------|--------|
| **Guru Bimbel** | ✅ | ✅ Jadwal | ✅ | ✅ Akun | - |
| **Orang Tua** | ✅ | ✅ Tabungan | ✅ | ✅ Agenda | ✅ Akun |
| **Guru Mapel** | ✅ | ✅ Jadwal | ✅ | ✅ Akun | - |
| **Wali Kelas** | ✅ | ✅ Jadwal | ✅ | ✅ Akun | - |

**Kesimpulan:**
- Orang Tua memiliki **5 menu navigasi** (paling banyak)
- Menu "Tabungan" di navigasi bawah adalah unik untuk Orang Tua
- Menu "Agenda" di Orang Tua sama dengan "Jadwal" di role lain

---

## 7. KESIMPULAN

### 7.1 Ringkasan Guru Bimbel

1. **Total Menu:** 14 menu (10 utama + 4 navigasi)
2. **Fokus:** Aktivitas mengajar bimbingan belajar
3. **Menu Khusus:**
   - Jadwal Bimbel
   - Komponen khusus bimbel (JadwalBimbelGuru, KehadiranBimbelGuru, dll)
4. **Catatan:**
   - Menu "Informasi" ada di array tapi belum terhubung ke komponen
   - Perlu diperbaiki atau dihapus jika tidak digunakan

### 7.2 Ringkasan Orang Tua/Wali

1. **Total Menu:** 17 menu (12 utama + 5 navigasi) - **TERBANYAK**
2. **Fokus:** Monitoring dan melihat informasi anak
3. **Menu Khusus:**
   - Pembayaran (SPP, tagihan)
   - Tabungan
   - Hasil Belajar (rapor)
   - Jadwal Ujian
   - Kehadiran (view only)
4. **Fitur Unik:**
   - Sidebar informasi sekolah (pengumuman)
   - Navigasi bawah dengan 5 menu (paling lengkap)
   - Menu "Tabungan" di navigasi bawah

### 7.3 Perbedaan Utama

| Aspek | Guru Bimbel | Orang Tua |
|-------|-------------|-----------|
| **Orientasi** | Input/Teaching | View/Monitoring |
| **Menu Input** | 4 menu | 0 menu |
| **Menu View** | 0 menu | 7 menu |
| **Komponen Khusus** | 4 komponen bimbel | 8 komponen siswa |
| **Navigasi Bawah** | 4 menu | 5 menu (terlengkap) |

---

## 8. REKOMENDASI

### 8.1 Untuk Guru Bimbel

1. ⚠️ **Perbaiki Menu "Informasi":**
   - Menu "Informasi" ada di array menuItems (baris 60)
   - Tapi belum terhubung ke komponen di handler onClick
   - **Opsi A:** Hubungkan ke komponen InformasiWaliKelas atau buat komponen baru
   - **Opsi B:** Hapus dari array jika tidak digunakan

### 8.2 Untuk Orang Tua

1. ✅ **Menu sudah lengkap** untuk kebutuhan monitoring anak
2. ✅ **Navigasi bawah sudah optimal** dengan 5 menu penting
3. ✅ **Sidebar informasi** memberikan value yang baik

---

**Dibuat oleh:** AI Assistant  
**Metode Analisis:** Code Review + File Reading  
**Lokasi File:**
- `components/DashboardGuruBimbel.tsx`
- `components/DashboardOrangTua.tsx`
