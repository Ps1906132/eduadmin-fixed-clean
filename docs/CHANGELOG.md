# Changelog

## Fase 2 — Pembenahan Struktur Direktori & Konfigurasi

### 2.1 Konsolidasi Struktur `components/` ke `src/`
- Semua file dari `components/` dipindahkan ke `src/components/`
- `data/sharedData.ts` dipindahkan ke `src/data/sharedData.ts`
- Semua file dari `utils/` dipindahkan ke `src/utils/`
- Update `vite.config.ts`: alias `@` diubah dari `.` ke `./src`
- Update `tsconfig.json`: paths `@/*` diubah dari `./*` ke `./src/*`
- Update semua import paths di `App.tsx`, `ProtectedModule.tsx`, `geminiService.ts`, `Pengaturan.tsx`, `AIManagementView.tsx` menggunakan alias `@/`
- Fix path di `migrateToD1.ts`

### 2.2 Standarisasi Import Path RBAC
- Semua import `src/lib/rbac/` distandarisasi ke `@/lib/rbac/`
- Update 4 file test di `src/__tests__/rbac/`

### 2.3 Hapus Duplikasi Sidebar
- Hapus `src/components/Sidebar.tsx` (legacy, hanya dipakai fallback role tak dikenal)
- Sederhanakan layout fallback di `App.tsx`

### 2.4 Bersihkan File Asing & Dokumentasi Redundan
- Hapus: `check_balance.py`, `check_tags.py`, `tailwind.config.js.bak`, `scratch_hash.js`
- Pindahkan ke `scripts/`: `execute_all_d1_files.sh`, `execute_all_d1_files.ps1`, `D1_SETUP_GUIDE.sh`, `pre-deploy-check.js`, `test-production.js`
- Konsolidasi 8 file dokumentasi D1 menjadi `docs/DEPLOYMENT.md`
- Hapus 6 file D1_*.md redundan dari root (konten sudah ada di docs/DEPLOYMENT.md)
- Update `README.md`: hapus referensi Supabase, tambah arsitektur Cloudflare D1
