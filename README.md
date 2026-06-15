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
- **Backend**: Cloudflare Workers (API Routes via `functions/`)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT (bcryptjs)
- **AI**: Google Gemini API (server-side)
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

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

3. **Setup D1 Database** (lihat [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)):
   ```bash
   wrangler login
   wrangler d1 create eduadmin_db
   wrangler d1 execute eduadmin_db --file d1_schema.sql
   ```

4. **Set JWT_SECRET**:
   ```bash
   wrangler secret put JWT_SECRET
   ```

5. **Jalankan development server** (butuh 2 terminal):
   ```bash
   # Terminal 1: Backend (Wrangler)
   wrangler dev

   # Terminal 2: Frontend (Vite)
   npm run dev
   ```

6. **Build untuk production**:
   ```bash
   npm run build
   wrangler pages deploy dist/
   ```

## 📁 Struktur Proyek

```
src/
├── components/          # Komponen React
│   ├── DashboardSuperAdmin/  # Dashboard admin dengan struktur modular
│   └── ...               # Komponen lainnya
├── data/                 # Data shared
├── utils/                # Utilities (tailwind helpers, dll)
├── types.ts             # Type definitions
functions/
├── api/                 # Cloudflare Workers API routes
scripts/                 # Utility scripts (deploy, migrate, seed)
d1_sql/                  # Per-table SQL files untuk D1
```

## 🔧 Konfigurasi

- **Port**: 3000 (development frontend), 8788 (development backend)
- **Database**: Cloudflare D1 via Wrangler
- **Secrets**: JWT_SECRET via `wrangler secret put`
- **Build output**: `dist/` folder

## 📊 Status Proyek

✅ **Phase 1-3 Completed**: Struktur modular, data hooks, UI components  
✅ **Database**: Cloudflare D1 (25+ tables)  
✅ **Deployment**: Cloudflare Pages + Workers  
📋 **Next**: Testing & optimization lanjutan

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

This project is licensed under the MIT License.
