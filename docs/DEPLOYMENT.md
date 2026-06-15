# Deployment Guide

> Panduan lengkap deployment EduAdmin ke Cloudflare D1 + Pages.

---

## Prerequisites

### Infrastructure

- Node.js 18+
- npm atau yarn
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account (aktif)
- Domain terdaftar/dikonfigurasi di Cloudflare

### Environment Variables & Secrets

**WAJIB:** JWT_SECRET harus dikonfigurasi, jangan gunakan fallback default.

```bash
# Generate JWT_SECRET (32+ karakter random)
# Windows PowerShell:
[System.Convert]::ToBase64String([System.Random]::new().GetBytes(32))

# Mac/Linux:
openssl rand -base64 32

# Set sebagai secret di Cloudflare:
wrangler secret put JWT_SECRET
```

**Variable lain di `wrangler.toml`:**
```toml
[vars]
VITE_USE_D1 = "true"
JWT_SECRET = "your-super-secret-jwt-key-minimum-32-characters-long"
```

**Variable untuk frontend (dashboard Cloudflare → Pages → Settings → Environment Variables):**
```
VITE_USE_D1 = true
```

> ⚠️ **Security**: JWT_SECRET adalah rahasia server. Jangan hardcode di source code. Set via `wrangler secret put` atau dashboard Cloudflare.

---

## Database Setup (D1)

### 1. Create Database

```bash
wrangler login
wrangler d1 create eduadmin_db
```

Copy `database_id` dari output ke `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "eduadmin_db"
database_id = "YOUR-DATABASE-ID-HERE"
```

### 2. Apply Schema

Ada dua pendekatan:

#### Opsi A: Schema Tunggal

```bash
wrangler d1 execute eduadmin_db --file d1_schema.sql
wrangler d1 execute eduadmin_db --file d1_migration.sql
```

#### Opsi B: File Per Tabel (28 file di `d1_sql/`)

Gunakan script automation:

```powershell
# Windows
.\scripts\execute_all_d1_files.ps1
```

```bash
# Mac/Linux
chmod +x scripts/execute_all_d1_files.sh
./scripts/execute_all_d1_files.sh
```

Atau execute manual satu per satu (urutan penting karena foreign keys):

```bash
wrangler d1 execute eduadmin_db --file d1_sql/01_profiles.sql
wrangler d1 execute eduadmin_db --file d1_sql/02_staff.sql
# ... lanjutkan untuk semua 28 file
```

### 3. Verify Tables

```bash
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Output expected: 25-28 tables.

### 4. Generate Admin Seed

Gunakan script untuk membuat admin user dengan bcrypt hash:

```bash
npx tsx scripts/generate-admin-seed.ts admin@eduadmin.com YourSecurePassword123!
```

Script ini akan menghasilkan perintah `INSERT OR REPLACE` dengan bcrypt hash. Jalankan outputnya:

```bash
wrangler d1 execute eduadmin_db --command="INSERT OR REPLACE INTO profiles (id, email, full_name, password_hash, role, role_type, is_active) VALUES ('admin-...', 'admin@eduadmin.com', 'Super Administrator', '\$2a\$10\$...', 'admin', 'single', 1);"
```

Default credentials (development):
- **Email**: admin@eduadmin.com
- **Password**: Harus di-set via seed script di atas

> ⚠️ Jangan gunakan password lemah atau hardcoded di production.

### 5. Sample Data (Opsional)

Load sample data untuk development:

```bash
wrangler d1 execute eduadmin_db --command "
INSERT INTO academic_years (id, name, start_date, end_date, semester, is_active) VALUES
('ay-2025-2026', '2025/2026 - Semester 1', '2025-07-01', '2025-12-31', 1, 1);
"
```

### 6. Rate Limiting (KV)

```bash
# Production
wrangler kv:namespace create "RATE_LIMIT_KV"

# Preview
wrangler kv:namespace create "RATE_LIMIT_KV" --preview
```

Copy namespace ID ke `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-namespace-id"
preview_id = "your-preview-namespace-id"
```

---

## Deploy to Cloudflare Pages

### Step-by-Step

```bash
# 1. Build project
npm run build

# 2. Deploy ke Cloudflare Pages
wrangler pages deploy dist/

# 3. Atau jika menggunakan wrangler publish
wrangler publish
```

### Set Environment Variables di Cloudflare Dashboard

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Masuk ke **Workers & Pages** → pilih project
3. **Settings** → **Environment Variables**
4. Tambahkan:
   - `VITE_USE_D1 = true` (Production)
   - `JWT_SECRET` (Production) — jangan expose di frontend
5. **Save and redeploy**

### Post-Deployment Verification

```bash
# Cek health endpoint
curl https://your-domain.com/api/diagnostic

# Monitor logs
wrangler tail --format json

# Test login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eduadmin.com","password":"YourPassword"}'
```

### Rollback

```bash
# Revert code
git revert <commit-hash>
npm run build
wrangler pages deploy dist/

# Restore database jika perlu
wrangler d1 backup list --database=eduadmin_db
wrangler d1 backup restore --database=eduadmin_db --backup-id=<backup-id>
```

---

## Troubleshooting

### "Table not found"

```bash
# Pastikan schema sudah diapply
wrangler d1 execute eduadmin_db --file d1_schema.sql

# Cek table spesifik
wrangler d1 execute eduadmin_db --command "PRAGMA table_info(profiles);"
```

### "ECONNREFUSED" / Backend tidak merespon

```
Error: [vite] http proxy error: /api/classes
AggregateError [ECONNREFUSED]: connection refused
```

**Penyebab:** Backend (Wrangler) tidak berjalan.

**Solusi:**
```bash
# Terminal 1: Jalankan backend
wrangler dev

# Terminal 2: Jalankan frontend
npm run dev
```

Pastikan port backend (8788) dan frontend (3000) tidak bertabrakan.

### "Unauthorized" / Login gagal

```javascript
// Cek token di browser
console.log(localStorage.getItem('eduadmin_token'));

// Login ulang (token expired 24 jam)
// Jika admin user belum ada, jalankan seed script
```

### "Foreign key constraint failed"

Execute file SQL dalam urutan yang benar (01, 02, 03, ...) karena ada foreign key relationships antar tabel.

### Browser checkbox blocking requests

Jika muncul dialog "Jangan izinkan localhost:3000 menanyakan Anda lagi" — **JANGAN centang**. Jika terlanjur:
1. Buka DevTools (F12) → Application → Storage → Cookies → Delete all
2. Hard refresh (Ctrl+Shift+R)
3. Atau gunakan incognito mode

### Database locked

SQLite locks dapat terjadi dengan concurrent writes. Tunggu sebentar dan retry.

```bash
wrangler d1 execute eduadmin_db --command "PRAGMA integrity_check;"
```

### Slow queries

```bash
# Update statistics
wrangler d1 execute eduadmin_db --command "ANALYZE;"

# Cek query plan
wrangler d1 execute eduadmin_db --command "EXPLAIN QUERY PLAN SELECT ...;"

# Cek indexes
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='index';"
```

### Delete class gagal

```
Dialog: "Gagal menghapus kelas. Silakan coba lagi."
```

**Penyebab:** Backend API tidak berjalan (port 8788).

**Solusi:** Jalankan `wrangler dev` di terminal terpisah.

### Maintenance rutin

```bash
# Mingguan: Analyze database
wrangler d1 execute eduadmin_db --command "ANALYZE;"

# Bulanan: Vacuum + integrity check
wrangler d1 execute eduadmin_db --command "VACUUM;"
wrangler d1 execute eduadmin_db --command "PRAGMA integrity_check;"

# Backup
wrangler d1 backup database eduadmin_db
```

---

## Referensi

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- Database schema: `d1_schema.sql` dan `d1_migration.sql`
- Script migrasi data: `scripts/migrate-to-d1.ts`
- Admin seed generator: `scripts/generate-admin-seed.ts`

---

*Last Updated: June 2026*
