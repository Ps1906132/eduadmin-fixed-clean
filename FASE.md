# Status Perbaikan Proyek EduAdmin (Per Fase)

Dokumen ini adalah **status tracker** setelah perbaikan bertahap.
✅ = Selesai, 🔄 = Sedang dikerjakan, ⬜ = Belum, ❌ = Tidak relevan

---

## FASE 0 — Keamanan Kritis ✅ (SEMUA SELESAI)

| Item | Status | Keterangan |
|------|--------|------------|
| 0.1 Hapus Fallback JWT Secret | ✅ | `_shared/jwt.ts` sudah ada, `[[path]].ts` & `gemini.ts` pakai `getJwtSecret(env)` |
| 0.2 Amankan Endpoint Diagnostic | ✅ | Sudah dipindah setelah JWT verify, admin-only + feature flag |
| 0.3 Hapus Dev Offline Bypass Login | ✅ | Login.tsx sudah clean, single auth flow ke backend |
| 0.4 RBAC Kolom CBT | ✅ | Backend filter `correct_answer` untuk role siswa |
| 0.5 Hapus Password Default | ✅ | `verifyPassword()` return false utk non-bcrypt, seed via generate script |

## FASE 1 — Hardening Lapis Kedua (⬜ Belum)

| Item | Status | Keterangan |
|------|--------|------------|
| 1.1 Rate Limiting Login | ✅ | `handleLogin()` + `incrementRateLimit()` via KV sudah ada |
| 1.2 Audit Log Lengkap | ⬜ | `writeAuditLog()` sudah ada tapi view admin (AuditLogView.tsx) belum |

## FASE 2 — Struktur & Konfigurasi (✅ Mayoritas Selesai)

| Item | Status | Keterangan |
|------|--------|------------|
| 2.1 Konsolidasi components/ ke src/ | ✅ | Root `components/` sudah tidak ada |
| 2.2 Standarisasi Import Path RBAC | ✅ | Semua pakai `@/lib/rbac/...` |
| 2.3 Hapus Duplikasi Sidebar | ✅ | Root Sidebar.tsx sudah dihapus |
| 2.4 Bersihkan File Asing & Dokumen | ✅ | 6 file D1_*.md dihapus, docs/DEPLOYMENT.md sudah ada |
| 2.5 Lengkapi File SQL Individual | ⬜ | Perlu validasi d1_schema.sql vs d1_sql/ |

## FASE 3 — Migrasi localStorage → D1 (🔄 Sebagian)

| Item | Status | Keterangan |
|------|--------|------------|
| 3.1 Migrasi Tabungan | ✅ | `useSavings.ts` + `TabunganSiswa.tsx` sudah pakai D1 |
| 3.2 Data Operasional DashboardSuperAdmin | ⬜ | Views masih banyak localStorage: NaikKelasView, SettingsView, TeacherDataView, DashboardHome, RaporView, NilaiView |
| 3.3 Audit Fallback localStorage | ⬜ | Perlu audit hooks/ untuk pola fallback |

**Komponen standalone sudah dimigrasi:**
- ✅ `KehadiranSiswa.tsx` — dari localStorage ke D1
- ✅ `PembayaranSiswa.tsx` — dari localStorage ke D1  
- ✅ `JadwalMengajarGuru.tsx` — dari localStorage ke D1
- ✅ `KehadiranSiswaGuru.tsx` — dari localStorage ke D1
- ✅ `InputNilaiGuru.tsx` — dari localStorage ke D1
- ✅ `RapotSiswa.tsx` — dari localStorage ke D1
- ✅ `DashboardOrangTua.tsx` — pakai `useAnnouncements`
- ✅ `DashboardWaliKelas.tsx` — pakai `useAnnouncements`

## FASE 4 — Refactor Komponen Besar (🔄 Sebagian)

| Item | Status | Keterangan |
|------|--------|------------|
| 4.1 Pecah DashboardSuperAdmin.tsx | ⬜ | Masih ~4200 baris, perlu dipecah per modul |
| 4.2 Hubungkan CBTSiswa.tsx | ✅ | Sudah pakai `/api/exam_questions`, `/api/exam_answers`, `/api/exam_sessions/:id/grade` |
| 4.3 Update Model Gemini | ✅ | Default `gemini-2.0-flash`, configurable via `env.GEMINI_MODEL`, error handling model deprecated |

---

## Ringkasan Pekerjaan Tersisa

| Prioritas | Item | File Terkait |
|-----------|------|-------------|
| 🔴 Tinggi | Migrasi DashboardSuperAdmin views | `NaikKelasView.tsx`, `SettingsView.tsx`, `TeacherDataView.tsx`, `DashboardHome.tsx`, `RaporView.tsx`, `NilaiView.tsx`, `TambahKelasView.tsx` |
| 🔴 Tinggi | Audit hooks localStorage fallback | `src/components/DashboardSuperAdmin/hooks/*.ts` |
| 🟡 Sedang | Pecah DashboardSuperAdmin.tsx | ~4200 baris → modul-modul kecil |
| 🟡 Sedang | Validasi d1_schema.sql vs d1_sql/ | Buat `scripts/validate-d1-sql.ts` |
| 🟢 Ringan | Audit Log view admin | Buat `AuditLogView.tsx` |
