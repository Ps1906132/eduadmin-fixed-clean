# Analisis & Perbaikan: Data Siswa + Manajemen Kelas (EduAdmin D1)

## Ringkasan Masalah

Aplikasi EduAdmin sudah live di **eduadmin-fixed-clean.pages.dev** menggunakan Cloudflare Pages + D1 Database, namun ada **2 masalah utama**:

1. ❌ **Tidak bisa menyimpan data pribadi siswa ke D1**
2. ❌ **Tidak bisa menyimpan kelas/level ke D1**

---

## Hasil Analisis Root Cause

### 🔴 Masalah 1: POST students — Field `enrollment_date` WAJIB tapi tidak dikirim dengan benar

**File:** [`useStudents.ts` baris 146-160](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useStudents.ts#L146-L160)

Schema D1 (`students` tabel):
```sql
enrollment_date DATE NOT NULL  -- REQUIRED, tidak ada DEFAULT
```

Payload yang dikirim saat `addNewStudent`:
```js
enrollment_date: new Date().toISOString().split('T')[0]  // ✅ Ada
```

**Masalah sebenarnya:** Field `mother_name`, `mother_job`, `parent_job`, `username` **tidak dikirim** dalam payload POST ke D1. Saat update (`updateStudent`), field-field ini sudah dipetakan, tapi saat insert (POST) — `ibu`, `jobIbu`, `jobAyah`, `username` **tidak ada** di body request.

---

### 🔴 Masalah 2: POST classes — Foreign Key `academic_year_id` tidak valid

**File:** [`useClasses.ts` baris 126-148](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useClasses.ts#L126-L148)  
**File:** [`TambahKelas.tsx` baris 147-166](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/TambahKelas.tsx#L147-L166)

Schema D1 (`classes` tabel):
```sql
academic_year_id TEXT NOT NULL,
FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
```

Kode mengirim:
```js
academic_year_id: localStorage.getItem('active_academic_year_id') || 'ay-2025-2026'
```

**Masalah:** `academic_year_id = 'ay-2025-2026'` hanya valid jika row ini **sudah ada di tabel `academic_years`** di D1. Jika D1 baru/reset, tabel ini kosong → INSERT classes **gagal** karena FK violation. Error ini ditelan secara diam-diam (`console.warn`), sehingga user tidak tahu.

---

### 🔴 Masalah 3: PATCH students menggunakan URL path yang salah

**File:** [`useStudents.ts` baris 230](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useStudents.ts#L230)

```js
// SALAH — /api/students/123 tidak ada di router
const res = await fetch(`/api/students/${idStr}`, { method: 'PATCH', ... });
```

**File:** [`[[path]].ts` baris 492-541](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/functions/api/%5B%5Bpath%5D%5D.ts#L492-L541)

Router PATCH hanya memahami:
- `PATCH /api/students?id=eq.{id}` ← Query string filter
- `PATCH /api/students/{id}` ← `path[1]` sebagai ID (ini **seharusnya berfungsi** tapi perlu verifikasi)

**Masalah:** DELETE di `useStudents.ts` juga menggunakan `/api/students/${idStr}` tapi router DELETE hanya menerima filter via query string `?id=eq.{id}`. Path `path[1]` memang ditangani di router untuk DELETE, tapi tidak konsisten.

---

### 🔴 Masalah 4: `academic_years` row belum tentu ada di D1

Jika D1 database belum di-seed atau reset, INSERT ke `classes` dan `class_students` akan selalu gagal karena FK constraint ke `academic_years`. Seed data di schema hanya menggunakan `INSERT OR IGNORE` yang tidak dijamin sudah dijalankan.

---

### 🟡 Masalah 5: Error ditelan diam-diam (Silent Failure)

Di banyak tempat, error API ditelan dengan `console.warn` saja, sehingga:
- User melihat "berhasil" (karena optimistic UI update ke localStorage)
- Tapi data **tidak tersimpan ke D1**
- Saat refresh, data hilang karena diambil dari D1 yang kosong

---

## Proposed Changes

### Fix 1: Tambah field yang hilang di `addNewStudent` POST payload

#### [MODIFY] [useStudents.ts](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useStudents.ts)

Tambahkan field berikut ke body POST:
- `mother_name` ← dari `student.ibu`
- `parent_job` ← dari `student.jobAyah`
- `mother_job` ← dari `student.jobIbu`
- `username` ← dari `student.username`

---

### Fix 2: Pastikan `academic_year` ada sebelum INSERT classes

#### [MODIFY] [useClasses.ts](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useClasses.ts)

Sebelum POST ke `/api/classes`, lakukan **upsert** academic_year terlebih dahulu:
```
POST /api/academic_years → INSERT OR IGNORE 'ay-2025-2026'
```

Sama untuk [TambahKelas.tsx](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/TambahKelas.tsx)

---

### Fix 3: Perbaiki URL PATCH/DELETE di useStudents

#### [MODIFY] [useStudents.ts](file:///d:/01.%20PROJEK%202025/cursor1/EduAdmin%20files/eduadmin-fixed-clean/components/DashboardSuperAdmin/hooks/useStudents.ts)

Ganti:
```js
// PATCH
fetch(`/api/students/${idStr}`, { method: 'PATCH', ... })
// DELETE
fetch(`/api/students/${targetIdStr}`, { method: 'DELETE', ... })
```
Menjadi:
```js
// PATCH
fetch(`/api/students?id=eq.${idStr}`, { method: 'PATCH', ... })
// DELETE
fetch(`/api/students?id=eq.${targetIdStr}`, { method: 'DELETE', ... })
```

---

### Fix 4: Tambah endpoint `/api/ensure-setup` untuk auto-seed

#### [NEW] Tambah route di `[[path]].ts`

Tambah handler `ensure-setup` yang menggunakan `INSERT OR IGNORE` untuk memastikan academic_year default selalu ada, dipanggil otomatis saat pertama kali data dibutuhkan.

---

### Fix 5: Tambah user-visible error saat API gagal

Untuk modul Tambah Kelas dan Upload Siswa — tampilkan pesan error yang jelas ke user saat D1 API mengembalikan error (bukan hanya `console.warn`).

---

## Open Questions

> [!IMPORTANT]
> **Apakah D1 database sudah dijalankan schema-nya?**
> 
> Perlu dicek apakah tabel `academic_years` di D1 sudah berisi row `ay-2025-2026`. Jika belum, semua INSERT ke `classes` dan `class_students` akan gagal.
> 
> Jalankan di Cloudflare Dashboard → D1 → Database → Execute SQL:
> ```sql
> SELECT * FROM academic_years;
> ```
> Jika kosong, perlu seed ulang.

> [!IMPORTANT]
> **Apakah JWT_SECRET sudah dikonfigurasi di Cloudflare Pages → Environment Variables?**
> 
> Tanpa `JWT_SECRET`, semua API call yang membutuhkan autentikasi akan menggunakan fallback secret yang mungkin tidak cocok dengan token yang tersimpan.

---

## Verification Plan

### Automated Tests
- Build lokal: `npm run build` — pastikan tidak ada TypeScript error
- Test manual via browser console setelah deploy

### Manual Verification
1. Login sebagai admin
2. Tambah kelas baru → cek di Cloudflare D1 Console apakah row muncul di tabel `classes`
3. Upload CSV siswa → cek di tabel `students` di D1
4. Edit data siswa → pastikan perubahan tersimpan
5. Hapus kelas → pastikan dihapus dari D1

---

## Urutan Perbaikan

1. ✅ Fix `useStudents.ts` — POST payload + PATCH/DELETE URL
2. ✅ Fix `useClasses.ts` + `TambahKelas.tsx` — ensure academic_year sebelum insert
3. ✅ Fix `[[path]].ts` — tambah endpoint `ensure-setup`
4. ✅ Fix error handling — tampilkan error ke user
