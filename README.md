<div align="center">
<img width="1200" height="475" alt="EduAdmin Banner" src="https://github.com" />
</div>

# EduAdmin - Sistem Manajemen Sekolah

Sistem informasi lengkap untuk pengelolaan sekolah dasar (SD) yang mencakup manajemen data siswa, guru, keuangan, akademik, dan komunikasi.

## 🚀 Fitur Utama

- **Dashboard Admin**: Monitoring keseluruhan sistem sekolah
- **Manajemen Siswa**: Data siswa, absensi, nilai, rapor
- **Manajemen Guru & Staff**: Jadwal mengajar, data personal, bimbingan belajar
- **Keuangan**: Tabungan siswa, pembayaran, laporan keuangan
- **Akademik**: Mata pelajaran, jadwal, materi pembelajaran
- **Komunikasi**: Pengumuman, notifikasi, rapor online
- **AI Integration**: Fitur belajar dengan AI (menggunakan Gemini API)

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (versi 18+)
- npm atau yarn

## 🚀 Instalasi & Menjalankan

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd projek-sistem-sd
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Setup Supabase Database**:
   - Buat project baru di [Supabase](https://supabase.com)
   - Jalankan SQL script dari `supabase_schema.sql` di SQL Editor
   - Jalankan migration script dari `supabase_migration.sql`
   - Copy environment variables ke `.env.local`

5. **Install dependencies**:
   ```bash
   npm install
   ```

6. **Setup environment variables**:
   - Copy `.env.example` ke `.env.local`
   - Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
   - Isi `GEMINI_API_KEY` untuk fitur AI

7. **Jalankan development server**:
   ```bash
   npm run dev
   ```

5. **Build untuk production**:
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Struktur Proyek

```
src/
├── components/          # Komponen React
│   ├── DashboardSuperAdmin/  # Dashboard admin dengan struktur modular
│   └── ...               # Komponen lainnya
├── data/                 # Data shared
├── utils/                # Utilities (tailwind helpers, dll)
└── types.ts             # Type definitions
```

## 🔧 Konfigurasi

- **Port**: 3000 (development)
- **Environment**: `.env.local` untuk API keys
- **Build output**: `dist/` folder

## 📊 Status Proyek

✅ **Phase 1-3 Completed**: Struktur modular, data hooks, UI components  
🔄 **Phase 4**: Testing & optimization  
📋 **Next**: Deployment setup, documentation lengkap

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

This project is licensed under the MIT License.
