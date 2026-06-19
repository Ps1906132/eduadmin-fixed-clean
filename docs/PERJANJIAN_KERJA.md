 PERJANJIAN KERJA — Role & Menu System

**EduAdmin** — Berlaku sejak 17 Juni 2026  
**Tujuan:** Dokumen ini adalah sumber kebenaran tunggal (*single source of truth*) untuk seluruh definisi role, menu, dan routing dashboard. Setiap perubahan kode **harus** sesuai dengan dokumen ini.

---

## 1. DAFTAR ROLE RESMI

Hanya 7 role berikut yang diakui. Role di luar daftar ini **TIDAK BOLEH** ada di kode manapun (kecuali legacy alias yang di-mapping ke role resmi).

| # | Role Code | Nama Lengkap | Dashboard |
|---|-----------|-------------|-----------|
| 1 | `admin` | Administrator | `DashboardSuperAdmin` (sidebar) |
| 2 | `kurikulum` | Wakil Kurikulum | `DashboardSuperAdmin` (sidebar) |
| 3 | `ks` | Kepala Sekolah | `DashboardSuperAdmin` (sidebar) |
| 4 | `keuangan` | Keuangan / Tata Usaha | `DashboardSuperAdmin` (sidebar) |
| 5 | `guru` | Guru (Mapel & Wali Kelas) | `DashboardGuru` (bottom nav) — **SATU dashboard untuk semua guru** |
| 6 | `gb` | Guru Bimbingan Belajar | `DashboardGuruBimbel` (bottom nav) |
| 7 | `ortu` | Orang Tua / Wali Murid | `DashboardOrangTua` (bottom nav) |

### 1.1 — Role yang Dihapus

| Role | Alasan |
|------|--------|
| `multimedia` | Tidak ada di CHECK constraint DB. Fungsinya overlap dengan admin. |
| `siswa` | Siswa tidak login ke sistem admin. Diganti: siswa pakai device orang tua. |
| `operator` | Tidak diperlukan. Cukup admin. |
| `gm` | Digabung ke `guru` — satu dashboard untuk semua jenis guru. |
| `wk` | Digabung ke `guru` — wali kelas tetap punya akses tambahan via permission, bukan dashboard terpisah. |

### 1.2 — Legacy Alias (mapping ke role resmi)

Semua alias berikut **harus** di-mapping ke role resmi di `App.tsx:mapRoleToCode`:

| Legacy | Mapping ke |
|--------|-----------|
| `super admin`, `operator data` | `admin` |
| `wakil kurikulum`, `waka kurikulum` | `kurikulum` |
| `kepala sekolah`, `kepsek` | `ks` |
| `bendahara` | `keuangan` |
| `wali kelas`, `guru kelas`, `guru mata pelajaran`, `guru mapel` | `guru` |
| `tutor bimbel`, `tentor` | `gb` |
| `orang tua`, `wali murid`, `parent`, `siswa`, `murid` | `ortu` |

---

## 2. MENU PER ROLE

### 2.1 — Admin
**Dashboard:** `DashboardSuperAdmin` dengan sidebar 11 menu:

| # | ID Menu | Label | Modul |
|---|---------|-------|-------|
| 1 | `dashboard` | Beranda | - |
| 2 | `data_siswa` | Data Siswa & Kelas | data-siswa |
| 3 | `data_guru` | Data Guru & Staff | data-guru |
| 4 | `kelas_wali` | Kelas & Wali Kelas | kelas-wali |
| 5 | `mapel` | Mata Pelajaran | mata-pelajaran |
| 6 | `bimbingan_belajar` | Bimbingan Belajar | bimbingan |
| 7 | `pengumuman` | Pengumuman | pengumuman |
| 8 | `multimedia` | Manajemen Multimedia | multimedia |
| 9 | `ai_management` | Manajemen AI | manajemen-ai |
| 10 | `audit_log` | Audit Log | pengaturan |
| 11 | `settings` | Pengaturan | pengaturan |



### 2.2 — Kurikulum
**Dashboard:** `DashboardSuperAdmin` dengan sidebar 9 menu:

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Beranda |
| 2 | `mapel` | Mata Pelajaran |
| 3 | `jadwal` | Jadwal |
| 4 | `absen` | Absen |
| 5 | `ujian` | Jadwal Ujian |
| 6 | `nilai` | Manajemen Nilai |
| 7 | `rapot` | Rapot |
| 8 | `naik_kelas` | Naik Kelas |
| 9 | `laporan` | Laporan | ( Laporan hasil belajar perkelas disajikan dalam bentuk laporan  Statistik 

**CRUD terbatas:** Kurikulum bisa lihat data guru Pada Mata Pelajaran , yang sudah di atur oleh admin 

### 2.3 — Kepala Sekolah
**Dashboard:** `DashboardSuperAdmin` dengan sidebar 7 menu:

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Monitor Sekolah |
| 2 | `data_siswa` | Data Siswa & Kelas |
| 3 | `data_guru` | Data Guru & Staff |
| 4 | `laporan` | Laporan & Arsip |
| 5 | `pengumuman` | Pengumuman |
| 6 | `multimedia` | Channel Sekolah |
| 7 | `nilai` | Monitor Nilai | Kehadiran siswa Berupa laporan Statistik 

**READ ONLY:** Kepala sekolah hanya bisa melihat data, TIDAK bisa menambah/edit/menghapus.

### 2.4 — Keuangan
**Dashboard:** `DashboardSuperAdmin` dengan sidebar 4 menu:

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Beranda |
| 2 | `keuangan` | Keuangan Sekolah |
| 3 | `tabungan` | Tabungan Siswa |
| 4 | `laporan` | Laporan  | Berisi hasil dari pembayaran spp, atau pemabayaran lainya yang di tambahkan oleh bagian keuangan , 

### 2.5 — Guru (Mapel & Wali Kelas)

**Kondisi saat ini:** Ada 2 file dashboard terpisah (`DashboardGuruMapel.tsx` dan `DashboardWaliKelas.tsx`) yang hampir identik. 
**Target:** Digabung jadi SATU dashboard `DashboardGuru.tsx` dengan flag wali kelas untuk menu tambahan.

#### Grid Menu (sama untuk Mapel & Wali Kelas):

| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 1 | `jadwal` | Jadwal Mengajar | Lihat jadwal mengajar harian — component `JadwalMengajarGuru` |
| 2 | `ujian` | Jadwal Ujian | Lihat jadwal ujian (UTS/UAS/PAS/PAT) — component `JadwalUjian` |
| 3 | `kehadiran` | Absensi Siswa | Input & lihat kehadiran siswa per kelas — component `KehadiranSiswaGuru` |
| 4 | `nilai` | Input Nilai | Input nilai UH, UTS, UAS per siswa per mapel — component `InputNilaiGuru` |
| 5 | `deskripsi` | Master Deskripsi | Kelola deskripsi rapor (capaian, predikat) — component `RaporSettingsView` (mode deskripsi) |
| 6 | `latihan` | Materi dan Latihan | Upload materi & buat latihan soal untuk siswa — component `MateriLatihanGuru` |
| 7 | `quran` | Al Quran | Aplikasi Al Quran digital & juz amma — component `AlQuranSiswa` |
| 8 | `channel` | Channel sekolah ku | Lihat channel/video sekolah — component `ChannelSekolahSiswa` |
| 9 | `ai` | Belajar dengan ku | Belajar dengan AI (chatbot edukasi) — component `BelajarAISiswa` |
| 10 | `notepad` | Notepad | Catatan pribadi guru — component `NotepadGuru` |

#### Bottom Navigation (4 item):
| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 1 | `home` | Beranda | Halaman utama berisi grid menu + pengumuman |
| 2 | `jadwal` | Jadwal | Pintasan cepat ke jadwal mengajar |
| 3 | `notifikasi` | Notifikasi | Notifikasi & pemberitahuan (tombol tengah menonjol) |
| 4 | `profile` | Akun | Profil guru (nama, NIP, mapel, ganti password, logout) |

#### Tambahan untuk Wali Kelas (jika user punya flag wali):
| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 11 | `kelas_ku` | Kelas Ku | List Nama Siswa Kelas — statistik absen kehadiran (apabila wali kelas klik nama siswa maka akan muncul absen kehadiran) |
| 12 | `raport` | E-Rapor | Cetak & lihat rapor siswa per kelas — component `RapotSiswa` |
| 13 | `informasi` | Informasi | Informasi wali kelas (data siswa, kontak orang tua) — component `InformasiWaliKelas` |

### 2.6 — Guru Bimbingan Belajar
**Dashboard:** `DashboardGuruBimbel` (bottom navigation + grid menu).

**Grid Menu (6 item):**
| # | ID | Label |
|---|----|-------|
| 1 | `jadwal` | Jadwal Bimbel |
| 2 | `kehadiran` | Cek Kehadiran Siswa |
| 3 | `nilai` | Input Perkembangan |
| 4 | `latihan` | Materi dan Latihan |
| 5 | `quran` | Al Quran |
| 6 | `informasi` | Informasi |

**Bottom Navigation (4 item):** Beranda, Jadwal, Notifikasi, Akun

**Catatan:** State type juga mencantumkan `channel`, `ai`, `notepad` tapi tidak ada di grid menu dan tidak punya handler — unreachable/dead code.

### 2.7 — Orang Tua
**Dashboard:** `DashboardOrangTua` (bottom navigation + grid menu).

**Grid Menu (11 item):**
| # | ID | Label |
|---|----|-------|
| 1 | `jadwal` | Jadwal Pelajaran |
| 2 | `ujian` | Jadwal Ujian |
| 3 | `hasil` | Hasil Belajar |
| 4 | `absen` | Kehadiran |
| 5 | `bayar` | Pembayaran |
| 6 | `tabungan` | Tabungan |
| 7 | `bimbingan` | Bimbingan Belajar |
| 8 | `latihan` | Materi dan Latihan |
| 9 | `quran` | Al Quran |
| 10 | `channel` | Channel Sekolah |
| 11 | `ai` | Belajar AI |

**Bottom Navigation (5 item):**
| # | ID | Label |
|---|----|-------|
| 1 | `home` | Beranda |
| 2 | `tabungan` | Tabungan |
| 3 | `notifikasi` | Notifikasi |
| 4 | `jadwal` | Agenda |
| 5 | `profile` | Akun |

---

## 3. ATURAN KODE

### 3.1 — Database `profiles.role` CHECK constraint

```sql
CHECK (role IN (
    'admin', 'kurikulum', 'ks', 'keuangan',
    'guru', 'gb', 'ortu'
))
```

**HANYA 7 value ini.** Tidak ada `multimedia`, `operator`, `wk`, `gm`, `siswa`.

### 3.2 — `App.tsx` — mapRoleToCode

Mapping function HARUS mengembalikan salah satu dari 7 code di atas.

```typescript
function mapRoleToCode(role: string): string {
    const r = (role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'super admin' || r === 'operator data') return 'admin';
    if (r === 'kurikulum' || r.includes('wakil kurikulum') || r.includes('waka kurikulum')) return 'kurikulum';
    if (r === 'ks' || r.includes('kepala sekolah') || r.includes('kepsek')) return 'ks';
    if (r === 'keuangan' || r.includes('bendahara')) return 'keuangan';
    if (r.includes('guru') || r === 'wk' || r === 'gm' || r.includes('wali kelas') || r.includes('guru kelas') || r.includes('guru mata pelajaran')) return 'guru';
    if (r === 'gb' || r.includes('bimbel') || r.includes('tentor')) return 'gb';
    return 'ortu'; // default: siswa, murid, orang tua, wali murid, parent
}
```

### 3.3 — `App.tsx` — Routing Dashboard

```typescript
if (['admin', 'kurikulum', 'ks', 'keuangan'].includes(userRole))
    return <DashboardSuperAdmin user={currentUser} onLogout={handleLogout} />;
if (userRole === 'guru')
    return <DashboardGuru user={currentUser} onLogout={handleLogout} />;
if (userRole === 'gb')
    return <DashboardGuruBimbel user={currentUser} onLogout={handleLogout} />;
return <DashboardOrangTua user={currentUser} onLogout={handleLogout} />;
```

### 3.4 — `Sidebar.tsx` — Filter Menu

```typescript
const ROLE_MENUS: Record<string, string[]> = {
    admin:     ['dashboard','data_siswa','data_guru','kelas_wali','mapel',
                'bimbingan_belajar','pengumuman','multimedia','ai_management',
                'audit_log','settings'],
    kurikulum: ['dashboard','mapel','jadwal',
                'absen','ujian','nilai','rapot','naik_kelas','laporan'],
    ks:        ['dashboard','data_siswa','data_guru','laporan','pengumuman',
                'multimedia','nilai'],
    keuangan:  ['dashboard','keuangan','tabungan','laporan'],
};
```

### 3.5 — TIDAK BOLEH Ada Dashboard Terpisah untuk Sub-role Guru

- TIDAK BOLEH `DashboardWaliKelas.tsx` — wali kelas adalah `guru` dengan flag tambahan.
- TIDAK BOLEH `DashboardGuruMapel.tsx` — guru mapel adalah `guru`.
- Semua guru menggunakan `DashboardGuru.tsx` SATU file.

### 3.6 — `siswa` BUKAN role login

Role `siswa` TIDAK login ke sistem ini. Login siswa dilakukan via device orang tua (role `ortu`).  
Di `mapRoleToCode`, `siswa` dan `murid` harus di-mapping ke `'ortu'`.

---

## 4. ATURAN PERUBAHAN KODE

1. **Setiap perubahan role** harus update dokumen ini TERLEBIH DAHULU.
2. **Setiap penambahan menu** harus disetujui dan dicatat di sini.
3. **TIDAK BOLEH** membuat dashboard baru untuk role yang sudah ada.
4. **TIDAK BOLEH** menambahkan role baru tanpa update CHECK constraint database.
5. **Semua role** harus konsisten di 4 tempat: DB, `App.tsx`, `Sidebar.tsx`, dan dokumen ini.
6. **Lenkapi Databes** Analisis Databes, serta lengkapi database, apabila masih terlewat dalam pembuatan tabel maka, dianggap tidak tuntas dan tidak propesional

---

## 5. Deskripsi 
**ADMIN**
| 1 | `dashboard` | Beranda | - | Halaman utama berisi statistik dan informasi umum |
| 2 | `data_siswa` | Data Siswa & Kelas | data-siswa | Admin Mengisi Data Kelas yang terhubung dengan tabel siswa - Kurikulum - Keuangan dan - guru mapel /wali keals - Guru Bimbel - orang tua. Admin input data siswa secara upload dengan templet, dan bisa dengan manual terhubung dengan Kurikulum - Keuangan - Guru mapel/ Wali Kealas ( Pengelompokan perkelas, yang dipilih menjadi wali kelas ) - Guru Bimbel ( Yang dipilih dari data kelas dan siswa )
| 3 | `data_guru` | Data Guru & Staff | data-guru | Admin menginput data guru berdasarkan jabatan yang ada , yang terhubung atau tersinkron dengan akun guru mapel/ wali kelas, terdiri dari nama guru , jabatan ( Guru Mapel / Wali Kelas - apabila guru dipilih jabatan wali kelas maka akan muncul kelas saya pada akun wali kelas berdasarkan jabatan yang dipilih dan kelas yang dipilih )terhubung juga  manajemen mata pelajaran yang nantinya akan di pilih mata pelajaran yang akan di ampuh
| 4 | `kelas_wali` | Kelas & Wali Kelas | kelas-wali | Melihat data kelas dan wali yang sudah diatur oleh admin
| 5 | `mapel` | Mata Pelajaran | mata-pelajaran | input mata pelajaran , dan memilih guru sebagai guru mapel, guru juga bisa megampuh beberapah mata pelajaran yang di pilih ( contoh Pelajaran untuk kelas ( guru juga bisa mengajar beberapah kelas - pilih mata pelajaran )  tersinkron dengan waka kurikulum pada manajemen jadwal , tersinkron juga pada akun guru dan akun orang tua pada ikon jadwal
| 6 | `bimbingan_belajar` | Bimbingan Belajar | bimbingan | Admin menginput Mata Pelajaran , Menginput data guru bimbel dan mata pelajaran yang sudah di daftarakan tinggal milih , admin juga menambahkan siswa yang di ambil dari tabel data siswa dan kelas , secara dipilih , ( bimbingan belajar yang sudah di input dari matapelajaran, data guru bimbel, input siswa , maka akan tersinkron langsung dengan akun Guru Bimbel)
| 7 | `pengumuman` | Pengumuman | pengumuman | admin memposting pengumuman , dan memilih opjek terdiri dari Guru, Siswa , dan Guru Bimbel )
| 8 | `multimedia` | Manajemen Multimedia | multimedia | Admin memasukan link youtube yang akan di publikasikan pada user Orang tua
| 9 | `ai_management` | Manajemen AI | manajemen-ai | admin memasukan api key yang akan terhubung dengan menu chat pada guru dan Orang tua
| 10 | `audit_log` | Audit Log | pengaturan |
| 11 | `settings` | Pengaturan | pengaturan | admin mengatur nama aplikasi dan kolom manajemen serta logo dan ikon pwa, yang tersinkron pada tampilan login, serta mengatur tahun ajaran dan kopsurat dan nama kepala sekolah yang tersinkron dengan sistem, dan pengaturan lainya yang sudah terhubung dengan sistem serta database.
---

**kurikulum** 

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Beranda | Halaman utama kurikulum |
| 2 | `mapel` | Mata Pelajaran | Kurikulum melihat daftar guru yang sudah terpilih menjadi guru pengampuh dan wali kelas terdapat tabel No. NIP, NAMA GURU , JUMLAH MAPEL, NAMA -NAMA MAPEL , NAMA NAMA KELAS , SETATUS ( guru mapel / Wali Kelas ) , ( `mapel` | Mata Pelajaran | data yang di ambil dari `mapel` | Mata Pelajaran | mata-pelajaran | pada admin )
| 3 | `jadwal` | Jadwal | kurikulum mengatur jadwal perkelas berdasarkan dari mapel` | Mata Pelajaran | mata-pelajaran | admin , guru dan mata pelajaran yang di ampuh , terdiri dari nama kelas dan pilih kelas  , tsmbsh jam ke (contoh jam ke 1 , 2, 3,... ) , pilih kelas , pili mata pelajaran, pada saat dipublikasi dan disimpan maka jadwal pelajaran akun terhubung dengan akun Guru mapel/wali kelas dan orang tuaa, pada menu ikon jadwal 
| 4 | `absen` | Absen | kurikulum melihat hasil dari input absen oleh guru mapel dan wali kelas berdasarkan perkelas , permata pelajaran, yang berupa data Statistik
| 5 | `ujian` | Jadwal Ujian | bagian jadwal ujian sama dengan jadwal pelajaran , bedanya terdiri dari pilih kelas (bisa memilih lebih dari satu ) tanggal , jam ke , Mulia jam - akhir jam , Jenis mata pelajaran dan publikasi jadwal ke akun orang tua 
| 6 | `nilai` | Manajemen Nilai | kurikulum , melihat hasil input Nilai dari Guru mapel / wali kelas , kurikulum juga bisa menambahkan jenis ujian , yang sudah terhubung atau sinkron dengan akun guru mapel dan akun orang tua 
| 7 | `rapot` | Rapot | Kurikulum melihat dan mencetak rapot yang di ambil datanya pada manajemen Nilai 
| 8 | `naik_kelas` | Naik Kelas | kurikulum menaikan kelas ( Contoh dari Kelas 1 ke kelas 2 ) bisa secara di pilih persiswa bisa secara semua siswa , berdasarkan dilihat dari nilai , dan akan dinaikan ketingkat berikutnya 
| 9 | `laporan` | Laporan | ( Laporan hasil belajar perkelas disajikan dalam bentuk laporan  Statistik, terdiri dari absen , nilai ujian .

**Kepala Sekolah**

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Monitor Sekolah | jumlah statistk data kelas , jumlah statistik data siswa pertahun, jumlah statistik Jumlah Guru , jumlah statistik keuangan  Tuntas / Tidak Tuntas 
| 2 | `data_siswa` | Data Siswa & Kelas |, Melihat jumlah siswa pertahun  yang terhubgung dengan keuangan sekolah , terdapat pilih kelas ( bisa pilih semua kelas ), pilih setatus ( Tuntas / Tidak Tuntas )
| 3 | `data_guru` | Data Guru & Staff |, Melihat Data Guru pada tabel admin `mapel` | Mata Pelajaran | mata-pelajaran |
| 4 | `laporan` | Laporan & Arsip | Kepala sekolah melihat laporan keuangan , pemasukan dan pengeluaran 
| 5 | `pengumuman` | Pengumuman | Kepala sekolah memberi Pengumuman hanya pada guru dan staff saja 
| 6 | `multimedia` | Channel Sekolah | kepala sekolah dapat melihat Channel sekolah , yang di atur oleh admin 
| 7 | `nilai` | Monitor Nilai | kepala sekolah melihat hasil belajar dimulai dari tahun ,Kehadiran, nilia  siswa Berupa laporan Statistik 


**Keuangan**

| # | ID Menu | Label |
|---|---------|-------|
| 1 | `dashboard` | Beranda |
| 2 | `keuangan` | Keuangan Sekolah | Keuangan Meng input Pembayaran SPP, dan Bisa menambahkan pembayaran lain , dengan cara bisa pilih kelas , bisa pencarian NIS/NISN  yang diambil datanya dari  `data_siswa` --- Data Siswa & Kelas pada admin, serta tersinkron langsung dengan akun orang tua ikon pembayaran 
| 3 | `tabungan` | Tabungan Siswa | Keuangan menginput tabungan siswa yang diambil datanya `data_siswa` --- Data Siswa & Kelas - admin - terdiri dari tabel no . NIS/NISN , NAMA SISWA, kELAS ( APABILA NAIK KELAS MAKA KELAS PADA TABEL AKAN BERUBAH ) , JUMLAH SALDO AWAL, JUMLAH SALDO AKHIR , Tanggal Penarikan , Total Saldo  
| 4 | `laporan` | Laporan  | Berisi hasil dari pembayaran spp, atau pemabayaran lainya yang di tambahkan oleh bagian keuangan , 

**Guru (Mapel & Wali Kelas)**

Grid Menu (sama untuk Mapel & Wali Kelas):

| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 1 | `jadwal` | Jadwal Mengajar | Lihat jadwal mengajar harian — component `JadwalMengajarGuru` | di  ambil pada data kurikulum `jadwal` | Jadwal |
| 2 | `ujian` | Jadwal Ujian | Lihat jadwal ujian (UTS/UAS/PAS/PAT) — component `JadwalUjian` | diambil pada data kurikulum `ujian` | Jadwal Ujian | 
| 3 | `kehadiran` | Absensi Siswa | Input & lihat kehadiran siswa per kelas — component `KehadiranSiswaGuru` | Sinkron dengan kurikulum | 3 | `absen` | Absen | dan sinkron dengan Orang tua ikon `absen` | Kehadiran |
| 4 | `nilai` | Input Nilai | Input nilai UH, UTS, UAS per siswa per mapel — component `InputNilaiGuru` | sinkron dengan kuri kulum `nilai` | Manajemen Nilai |  
| 5 | `deskripsi` | Master Deskripsi | Kelola deskripsi rapor (capaian, predikat) — component `RaporSettingsView` (mode deskripsi) | sinkron dengan kurikulum  | `rapot` | Rapot | serta sinkron dengan akun orang tua ikon `hasil` | Hasil Belajar |
| 6 | `latihan` | Materi dan Latihan | Upload materi & buat latihan soal untuk siswa — component `MateriLatihanGuru` | sinkron dengan akun orang tua ikon  `latihan` | Materi dan Latihan |
| 7 | `quran` | Al Quran | Aplikasi Al Quran digital & juz amma — component `AlQuranSiswa` |
| 8 | `channel` | Channel sekolah ku | Lihat channel/video sekolah — component `ChannelSekolahSiswa` | guru mapel bisa melihat Channel sekolah ku yang dinput oleh admin berupa link youtube
| 9 | `ai` | Belajar dengan ku | Belajar dengan AI (chatbot edukasi) — component `BelajarAISiswa` | berupa chatbot 
| 10 | `notepad` | Notepad | Catatan pribadi guru — component `NotepadGuru` |

Bottom Navigation (4 item):
| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 1 | `home` | Beranda | Halaman utama berisi grid menu + pengumuman |
| 2 | `jadwal` | Jadwal | Pintasan cepat ke jadwal mengajar |
| 3 | `notifikasi` | Notifikasi | Notifikasi & pemberitahuan (tombol tengah menonjol) |
| 4 | `profile` | Akun | Profil guru (nama, NIP, mapel, ganti password, logout) |

Tambahan untuk Wali Kelas (jika user punya flag wali):
| # | ID | Label | Keterangan |
|---|----|-------|------------|
| 11 | `kelas_ku` | Kelas Ku | List Nama Siswa Kelas — statistik absen kehadiran (apabila wali kelas klik nama siswa maka akan muncul absen kehadiran)
| 12 | `raport` | E-Rapor | Cetak & lihat rapor siswa per kelas — component `RapotSiswa` | Rapot kelas apabila di klik nama siswa maka terdapat hasi belajar siswa , yang di input oleh guru MAPEL
| 13 | `informasi` | Informasi | Informasi wali kelas (data siswa, kontak orang tua) — component `InformasiWaliKelas` |

**Guru Bimbingan Belajar**

| # | ID | Label |
|---|----|-------|
| 1 | `jadwal` | Jadwal Bimbel | di ambil data dari admin `bimbingan_belajar` | Bimbingan Belajar | bimbingan | 
| 2 | `kehadiran` | Cek Kehadiran Siswa | diambil data siswa yang sudah dipilih oleh admin , mata pelajaran mana yang akan di pilih oleh siswa maka admin memilih dan mendaftarkan siswa yang di ambil datanya dari manajemen `data_siswa` --- Data Siswa & Kelas  dan tersinkron dengan akun guru bimbel  ikon | `kehadiran` |  yang terhubung dengan orang tua ikon | `bimbingan` | Bimbingan Belajar |
| 3 | `nilai` | Input Perkembangan | nilai hasi perkembangan bimbinga belajar yang sinkron dengan dengan orang tua ikon | `bimbingan` | Bimbingan Belajar |
| 4 | `latihan` | Materi dan Latihan | guru bimbel upload materi dan latihan yang sinkron dengan orang tua ikon | `bimbingan` | Bimbingan Belajar |
| 5 | `quran` | Al Quran |
| 6 | `informasi` | Informasi | yang di publikasikan oleh admin 

**Bottom Navigation (4 item):** Beranda, Jadwal, Notifikasi, Akun


**Orang Tua**

| # | ID | Label |
|---|----|-------|
| 1 | `jadwal` | Jadwal Pelajaran | di ambil datanya dari kurikulum `jadwal` | Jadwal | 
| 2 | `ujian` | Jadwal Ujian | di ambil datanya dari kurikulum  `ujian` | Jadwal Ujian |
| 3 | `hasil` | Hasil Belajar | diambil datanya dari guru mapel `nilai` | Input Nilai | 
| 4 | `absen` | Kehadiran | diambil datanya dari guru mapel `kehadiran` | Absensi Siswa |
| 5 | `bayar` | Pembayaran | diambil datanya dari keuangan `keuangan` | Keuangan Sekolah | 
| 6 | `tabungan` | Tabungan | diambil datanya dari keuangan apibila didaftarkan oleh bagian keuangan  `tabungan` | Tabungan Siswa |
| 7 | `bimbingan` | Bimbingan Belajar | diambil datanya  dari admin dan guru bimbel , ambil data dari admin Mata pelajaran , Jadwal ,| diambil data dari Guru bimbel  `kehadiran` | Cek Kehadiran Siswa | ,`nilai` | Input Perkembangan |,  `latihan` | Materi dan Latihan | , Apabila mengkilik Mata Pelajaran Maka akan muncul Pertemuan 1, 2, 3... berupa list  dan mengklik pertemuan maka akan muncul `latihan` | Materi dan Latihan |
| 8 | `latihan` | Materi dan Latihan | diambil dari guru mapel  `latihan` | Materi dan Latihan |
| 9 | `quran` | Al Quran |
| 10 | `channel` | Channel Sekolah | Siswa  bisa melihat Channel sekolah ku yang dinput oleh admin berupa link youtube
| 11 | `ai` | Belajar AI |

**Bottom Navigation (5 item):**
| # | ID | Label |
|---|----|-------|
| 1 | `home` | Beranda | Menampilan ikon Jadwal Pelajaran, Ikon Jadwal Ujian , Ikon Kehadiran , Ikon Hasil Belajar , Ikon Kehadiran , Ikon Pembayaran , Ikon Tabungan , Ikon Bimbingan Belajar , ikon materi dan latihan , ikon Al Quran, Ikon channel ku , ikon Belajar dengan IA
| 2 | `tabungan` | Tabungan | Menampilkan Saldo tabungan dan historis stor tunai dan tarik tunai , yang di lengkapi jam,hari, tanggal, tahun secara automatis 
| 3 | `notifikasi` | Notifikasi | berupa informasi yang dikirim oleh admin 
| 4 | `jadwal` | Agenda | jadwal pelajaran 
| 5 | `profile` | Akun | berupa Nama Orang tua , nama anak dan terdapat tombol keluar 
---