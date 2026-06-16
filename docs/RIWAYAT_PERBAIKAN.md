# Riwayat Perbaikan — EduAdmin

Dokumen ini mencatat semua perubahan kode yang telah dilakukan beserta cuplikan kode sebelum dan sesudah.

---

## Fase 4 — Sinkronisasi Modul Bimbingan Belajar (Les)

### 4.1 — Filter Jadwal Guru Bimbel Berbasis ID (✅ Selesai)

**File:** `src/components/DashboardGuruBimbel.tsx`

**Masalah:** Filter kelas guru menggunakan pencocokan string nama (`c.teacher === user?.nama`). Jika nama tidak cocok persis (spasi, gelar, kapital), kelas tidak muncul di akun Guru Bimbel.

**Sebelum:**
```ts
const myTutoringClasses = tutoringClasses.filter(c =>
    c.teacher === user?.nama || user?.role === 'admin'
);

const myEnrollments = enrollments.filter(e => myClassIds.includes(e.classId));
```

**Sesudah:**
```ts
const myTeacherId = (() => {
    if (typeof user?.id === 'string' && user.id.startsWith('bimbel_')) {
        return parseInt(user.id.replace('bimbel_', ''), 10);
    }
    return null;
})();

const myTutoringClasses = tutoringClasses.filter(c =>
    c.id === myTeacherId || user?.role === 'admin'
);

const myEnrollments = enrollments.filter(e => myClassIds.includes(e.groupId));
```

**Penjelasan:**
- Profile guru bimbel dibuat dengan ID `bimbel_{teacherId}` (contoh: `bimbel_1712345678901`)
- `TutoringClass.id` diisi dengan `teacherId` yang sama (dari `Date.now()`)
- Guru dicocokkan dengan mengekstrak ID dari `user.id`, bukan dari string nama
- Filter enrollment pakai `e.groupId` (dari sharedData) karena `e.classId` tidak selalu ada

---

### 4.2 — Rekap Kehadiran di Admin (✅ Selesai)

**File:** `src/components/DashboardSuperAdmin/components/views/BimbinganBelajarView.tsx`

**Masalah:** Admin tidak bisa melihat data kehadiran les yang sudah diinput oleh Guru Bimbel.

**Perubahan:**

1. Tambah icon ke import:
```ts
import { ..., UserCheck, Calendar, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
```

2. Tambah state dan fungsi fetch:
```ts
const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
const [attendanceData, setAttendanceData] = useState<any[]>([]);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [selectedAttendanceGroup, setSelectedAttendanceGroup] = useState<number | ''>('');

const fetchAttendance = async (groupId: number | '', date: string) => {
    if (!groupId) return;
    setAttendanceLoading(true);
    try {
        const token = localStorage.getItem('eduadmin_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        const res = await fetch(`/api/bimbel_attendance?tutoring_class_id=eq.${groupId}&date=eq.${date}`, { headers });
        if (res.ok) {
            const data = await res.json();
            setAttendanceData(Array.isArray(data) ? data : []);
        }
    } catch (e) {
        console.error('Gagal mengambil data kehadiran:', e);
    } finally {
        setAttendanceLoading(false);
    }
};
```

3. Tambah helper nama siswa:
```ts
const getStudentName = (studentId: number | string) => {
    const sid = Number(studentId);
    const student = (students || []).find(s => Number(s.id || s.nis || s.student_id) === sid);
    return student?.nama || student?.name || student?.student_name || `Siswa #${sid}`;
};
```

4. Tambah tab "Rekap Kehadiran" di navigasi:
```tsx
{ id: 'kehadiran', label: 'Rekap Kehadiran', icon: <UserCheck size={16} /> },
```

5. UI tab: pilih guru + tanggal → tampilkan tabel siswa + status hadir/sakit/izin/alpa

---

### 4.4 — Filter Kelas Siswa Berdasarkan Enrollment (✅ Selesai)

**File:** `src/components/BimbinganBelajarSiswa.tsx`

**Masalah:** Semua kelas bimbel tampil ke semua user (siswa/orang tua bisa lihat kelas yang tidak terdaftar).

**Sebelum:**
```ts
const classes = tutoringClasses;
const studentId = user?.studentId;
```

**Sesudah:**
```ts
import { tutoringEnrollmentsGlobal } from './../data/sharedData';

const studentId = user?.studentId || user?.id;
const myEnrolledGroupIds = studentId
    ? new Set(tutoringEnrollmentsGlobal.filter(e => e.studentId === Number(studentId)).map(e => e.groupId))
    : new Set<number>();
const classes = studentId
    ? tutoringClasses.filter(c => myEnrolledGroupIds.has(c.id))
    : tutoringClasses;
```

---

## Perbaikan Error TypeScript

### 1. Template Literal Rusak

**File:** `scripts/generate-admin-seed.ts`

**Sebelum:** Baris 24 menggunakan backtick tanpa ditutup.
```ts
console.log(`-- Run: wrangler d1 execute eduadmin_db --command="...");
```

**Sesudah:**
```ts
console.log('-- Run: wrangler d1 execute eduadmin_db --command="..."');
```

### 2. Import Hilang

| File | Sebelum | Sesudah |
|------|---------|---------|
| `MateriLatihanGuru.tsx` | `import React, { useState } from 'react'` | `import React, { useState, useEffect } from 'react'` |
| `Rapot.tsx` | `import { ScrollText, Printer, ... }` | Tambah `Save` ke import lucide-react |
| `JadwalUjianView.tsx` | — | Tambah `Dispatch, SetStateAction` import |

### 3. Type TutoringEnrollment Tidak Konsisten

**File:** `src/components/DashboardSuperAdmin/hooks/useTutoring.ts`

Dua definisi `TutoringEnrollment` berbeda antara `sharedData.ts` (`{ groupId, studentId }`) dan `useTutoring.ts` (`{ id, studentId, studentName, classId, ... }`). Digabung dengan `extends`:

```ts
export interface TutoringEnrollment extends SharedTutoringEnrollment {
    id?: string;
    studentName?: string;
    classId?: number;
    className?: string;
    enrollmentDate?: string;
    status?: 'Menunggu' | 'Aktif' | 'Selesai';
}
```

### 4. Type Unknown pada Fetch Response

**File:** `useFinance.ts`, `useSavings.ts`

Response `await fetch().json()` bertipe `unknown` di TypeScript 5.8. Ditambahkan casting `any[]`:

```ts
const students: any[] = resStudents.ok ? await resStudents.json() : [];
const student: any = studentMap.get(b.student_id) || {};
```

### 5. Thenable db.from() untuk await

**File:** `Pengaturan.tsx`, `migrateToD1.ts`

`db.from()` mengembalikan object thenable yang tidak dikenali TypeScript untuk `await`. Solusi: bungkus dengan `as any` atau helper `exec`:

```ts
// Pengaturan.tsx
await (db.from('audit_logs').insert(newLogEntry) as any);

// migrateToD1.ts
const exec = (p: any): Promise<any> => Promise.resolve(p);
await exec(db.from('profiles').insert([{ ... }]));
```

### 6. Cloudflare Workers Types

**File:** `functions/api/_shared/types.d.ts` (baru)

Menambahkan deklarasi type untuk `D1Database`, `KVNamespace`, `PagesFunction`, `EventContext` yang digunakan di `[[path]].ts` dan `gemini.ts`.

### 7. SavingsData dan MasterExamSchedule

**File:** `src/data/sharedData.ts`

Tambah field yang hilang:
- `SavingsData.studentId?: string | number` (dipakai oleh Tabungan.tsx, TabunganSiswa.tsx)
- `MasterExamSchedule.dailyUniforms?: Record<string, string>` (dipakai oleh JadwalUjianView.tsx)

### 8. Lain-lain

| File | Perubahan |
|------|-----------|
| `KehadiranSiswa.tsx` | Ganti `{studentName}` (undefined) dengan `{user?.studentName \|\| user?.nama \|\| ''}` |
| `DataGuruStaff.tsx` | Tambah field `teacher_id` di object `handleAddWali()` |
| `DashboardSuperAdmin.tsx` | Hapus prop `classes` dari `TabunganView` (tidak ada di props interface) |
| `Tabungan.tsx` | Object literal disesuaikan dengan interface `SavingsData` (`nama`, `kelas`, `saldo` bukan `studentName`, `class`, `balance`) |
| `JadwalUjianView.tsx` | Perbaiki nama props modal (`tempExamUniform` bukan `tempUniform`, dll) |
