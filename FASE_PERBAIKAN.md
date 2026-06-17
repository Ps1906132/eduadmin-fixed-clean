# FASE PERBAIKAN — Data Guru & Staff (Wakil Kurikulum)

## Fase 1: Perbaikan Login & Role Mapping (CRITICAL)
**Ketergantungan:** Tidak ada  
**Estimasi:** 1-2 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 1.1 | Ubah mapping `kurikulum`/`wakil kurikulum` dari `admin` → `kurikulum` | `src/components/Login.tsx:62-63` | Perbaiki finalRole jadi `'kurikulum'` |
| 1.2 | Sinkronkan App.tsx `mapRoleToCode` dengan mapping Login.tsx | `App.tsx:51-65` | Pastikan tidak ada konflik mapping |
| 1.3 | Tambahkan seed account default role `kurikulum` | `d1_sql/01_profiles.sql` | Untuk testing login kurikulum |
| 1.4 | Verifikasi alur login + reload + sidebar yang tampil | Manual test | Pastikan sidebar kurikulum muncul |

---

## Fase 2: Validasi Role Database (HIGH)
**Ketergantungan:** Fase 1  
**Estimasi:** 1-2 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 2.1 | Ganti mapping `wk` → `guru` pada jabatan "Wali Kelas" | `src/components/DashboardSuperAdmin/hooks/useTeachers.ts:127-128` | `'wk'` tidak valid di CHECK constraint, fallback ke `'guru'` |
| 2.2 | Cek mapping UPDATE teacher di baris yang sama | `useTeachers.ts:173-261` | Pastikan update juga pakai `'guru'` bukan `'wk'` |
| 2.3 | Verifikasi INSERT/UPDATE teacher sukses ke D1 | Manual test | Cek semua jabatan: kurikulum, wali kelas, guru mapel, dll |

---

## Fase 3: Sidebar & Permission Akses Data Guru (MEDIUM)
**Ketergantungan:** Fase 1  
**Estimasi:** 2-3 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 3.1 | Tambahkan `data_guru` ke sidebar menu kurikulum | `src/components/DashboardSuperAdmin/components/Sidebar.tsx:82-83` | Sesuai permissionMatrix: READ ONLY |
| 3.2 | Bungkus halaman Data Guru dengan `ProtectedModule` untuk READ ONLY | `TeacherDataView.tsx` atau parent | Kurikulum hanya bisa lihat, tidak bisa tambah/edit/hapus |
| 3.3 | Sembunyikan tombol "Tambah Guru" / "Edit" / "Hapus" untuk role kurikulum | `TeacherDataView.tsx` | Conditional render berdasarkan permission |
| 3.4 | Verifikasi akses sidebar + CRUD restriction | Manual test | Login sebagai kurikulum, cek akses data guru |

---

## Fase 4: Konsolidasi Dua Antarmuka Guru (MEDIUM)
**Ketergantungan:** Fase 2, 3  
**Estimasi:** 3-4 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 4.1 | Analisis apakah `DataGuruStaff.tsx` (legacy) masih dipakai di route mana | `App.tsx`, cari `DataGuruStaff` | Identifikasi dead code |
| 4.2 | Jika tidak dipakai: hapus file dan seluruh referensi | `DataGuruStaff.tsx` + imports | Bersihkan codebase |
| 4.3 | Jika masih dipakai: migrasikan state management ke D1 sync | `DataGuruStaff.tsx` | Gunakan useTeachers hook |
| 4.4 | Verifikasi data guru konsisten di kedua entry point | Manual test | Bandingkan data |

---

## Fase 5: Password Default & Security (LOW)
**Ketergantungan:** Fase 2  
**Estimasi:** 1 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 5.1 | Ganti default password jadi random generated | `TeacherDataView.tsx:334`, `DataGuruStaff.tsx:107` | `generateRandomPassword()` atau minta user isi |
| 5.2 | Tambahkan validasi password minimal 6 karakter di form | `TeacherDataView.tsx` | Frontend validation |
| 5.3 | Tampilkan password di modal setelah simpan (sekali lihat) | `DashboardSuperAdmin.tsx` modal | UX: admin tahu password awal guru |

---

## Fase 6: Server-side RBAC untuk Kurikulum (ENHANCEMENT)
**Ketergantungan:** Fase 1  
**Estimasi:** 2-3 jam

| # | Task | File | Keterangan |
|---|------|------|------------|
| 6.1 | Tambahkan role `kurikulum` ke `ACADEMIC_MASTER_WRITE_TABLES` di API | `functions/api/[[path]].ts` | Agar kurikulum bisa CRUD data akademik di backend |
| 6.2 | Pastikan role `kurikulum` tetap **TIDAK bisa** write ke `profiles`, `staff` | `[[path]].ts` | Data sensitif hanya admin |
| 6.3 | Cek seluruh endpoint API apakah ada yang missing permission untuk kurikulum | `[[path]].ts` | Audit endpoint by endpoint |

---

## Dependency Graph

```
Fase 1 (Login/Role) ──┬── Fase 3 (Sidebar/Permission) ── Fase 4 (Konsolidasi)
                       │
                       └── Fase 2 (Validasi Role DB) ── Fase 5 (Password)
                       
Fase 1 ── Fase 6 (Server RBAC)   [optional / enhancement]
```

**Rekomendasi:** Kerjakan berurutan dari Fase 1 → 6. Setiap fase bisa di-test dan di-deploy independen setelah fase sebelumnya selesai.
