# CATATAN PERBAIKAN #4

**Tanggal:** 28 Juni 2026  
**Fokus:** Audit & Perbaikan Seluruh Ikon Dashboard Guru Mapel / Wali Kelas

---

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Perbaikan #1: InformasiWaliKelas.tsx](#perbaikan-1-informasiwalikelas)
3. [Perbaikan #2: KelasKu.tsx](#perbaikan-2-kelasku)
4. [Perbaikan #3: RapotSiswa.tsx (E-Rapor)](#perbaikan-3-rapotsiswa-e-rapor)
5. [Perbaikan #4: JadwalUjian.tsx](#perbaikan-4-jadwalujian)
6. [Perbaikan #5: ChannelSekolahSiswa.tsx](#perbaikan-5-channelsekolahsiswa)
7. [Audit Lengkap 12 Ikon](#audit-lengkap-12-ikon)
8. [Schema D1 yang Relevan](#schema-d1-yang-relevan)

---

## Ringkasan Eksekutif

### Masalah Utama

Sebelum perbaikan, Dashboard Guru memiliki **5 issue kritis/tinggi** yang menyebabkan:

| Issue | Dampak |
|-------|--------|
| Student filter pakai `s.kelas` (field tidak ada di D1) | **0 siswa tampil** di hampir semua komponen |
| Attendance fetch ALL records tanpa filter | **Performance buruk** + potensi data leak |
| Grade calculation pakai `assessment_type` (field tidak ada) | **Perhitungan rapor salah** |
| Channel Sekolah fetch table `broadcasts` (tracking table) | **Channel tidak menampilkan data** |
| Jadwal Ujian filter guru tidak diterapkan | **Semua guru lihat semua jadwal ujian** |

### Hasil Perbaikan

- ✅ **12/12 ikon** sudah terhubung ke D1 dengan benar
- ✅ **TypeScript build: 0 errors**
- ✅ **Siap push ke GitHub, deploy, dan build**

---

## Perbaikan #1: InformasiWaliKelas

**File:** `src/components/InformasiWaliKelas.tsx`  
**Severity:** CRITICAL  
**Keterangan:** Siswa tidak tampil karena field `kelas` tidak ada di D1 `students`

### Masalah

```typescript
// SEBELUM — SALAH
// Line 45: students.filter((s: any) => s.kelas === waliKelas)
// D1 students TIDAK ADA kolom kelas
const filtered = allStudents.filter((s: any) => s.kelas === waliKelas);
```

```typescript
// SEBELUM — SALAH
// Line 27: waliKelas = user?.kelas || ''
// Guru profile tidak punya field kelas
const waliKelas = user?.kelas || '';
```

### Perbaikan

```typescript
// SESUDAH — BENAR
// Fetch siswa via class_students pivot table
const [resClassStudents, resStudents] = await Promise.all([
    fetch(`/api/class_students?class_id=eq.${classId}&is_active=eq.1`, { headers }),
    fetch('/api/students', { headers }),
]);

const classStudentsData = await resClassStudents.json();
const studentIds = classStudentsData.map((cs: any) => cs.student_id);

const allStudents = await resStudents.json();
const filtered = allStudents.filter((s: any) => studentIds.includes(s.id));
```

```typescript
// SESUDAH — BENAR
// Fetch wali kelas dari classes table
const resClasses = await fetch(`/api/classes?teacher_id=eq.${user.id}&is_active=eq.1`, { headers });
const classesData = await resClasses.json();
const classId = classesData[0]?.id;
const className = classesData[0]?.name;
```

### Field Mapping D1

| Komponen | Sebelum (Salah) | Sesudah (Benar) |
|----------|-----------------|-----------------|
| Tempat Lahir | `tempat_lahir` | `birth_place` |
| Tanggal Lahir | `tanggal_lahir` | `birth_date` |
| Pekerjaan Ayah | `pekerjaan_ayah` | `parent_job` |
| No. HP | `no_hp` | `phone` |

---

## Perbaikan #2: KelasKu

**File:** `src/components/KelasKu.tsx`  
**Severity:** CRITICAL  
**Keterangan:** Stats kehadiran kosong karena filter pakai nama bukan ID

### Masalah

```typescript
// SEBELUM — SALAH
// Line 53: Fetch ALL attendance tanpa filter
const resAttendance = await fetch('/api/attendance?select=*', { headers });

// Line 106: Filter pakai NAMA bukan ID
const records = attendanceData.filter(
    (a: any) => a.student_id === studentId && a.class_id === selectedClassName
);
```

### Perbaikan

```typescript
// SESUDAH — BENAR
// Fetch attendance per kelas, re-fetch saat kelas berubah
useEffect(() => {
    if (!selectedClassId) {
        setAttendanceData([]);
        return;
    }
    const fetchAttendance = async () => {
        const res = await fetch(`/api/attendance?class_id=eq.${selectedClassId}`, { headers });
        if (res.ok) {
            const data = await res.json();
            setAttendanceData(Array.isArray(data) ? data : []);
        }
    };
    fetchAttendance();
}, [selectedClassId]);

// Filter langsung dari attendanceData (sudah per-class)
const records = attendanceData.filter(
    (a: any) => a.student_id === studentId
);
```

### Alur Data

```
Initial Load:
    ├─ classes?teacher_id=user     → kelas wali
    ├─ class_students?active=1     → pivot
    └─ students                    → semua siswa

Select Kelas:
    └─ attendance?class_id=X       → re-fetch attendance
```

---

## Perbaikan #3: RapotSiswa (E-Rapor)

**File:** `src/components/RapotSiswa.tsx`  
**Severity:** CRITICAL  
**Keterangan:** Perhitungan rapor salah total karena 6 issue

### Masalah

| # | Issue | Line | Detail |
|---|-------|------|--------|
| 1 | `waliKelas` pakai `user?.kelas` | 27 | Guru profile tidak punya field `kelas` |
| 2 | Student filter pakai `s.kelas` | 45 | D1 `students` tidak ada kolom `kelas` |
| 3 | Grade fetch tanpa `academic_year_id` | 80 | Bisa tampilkan nilai tahun lalu |
| 4 | Grade calculation pakai `assessment_type` | 114 | D1 pakai `grade_type_id` FK |
| 5 | Tidak pakai `grade_types.weight` | 118 | Rata-rata tanpa bobot |
| 6 | Subject list tidak filter guru | 40 | Fetch semua subjects |

### Perbaikan

```typescript
// 1. Fetch wali kelas dari D1
const resClasses = await fetch(`/api/classes?teacher_id=eq.${user.id}&is_active=eq.1`, { headers });
const classId = classesData[0]?.id;

// 2. Fetch students via pivot
const resClassStudents = await fetch(`/api/class_students?class_id=eq.${classId}&is_active=eq.1`, { headers });
const studentIds = classStudentsData.map(cs => cs.student_id);
const filtered = allStudents.filter(s => studentIds.includes(s.id));

// 3. Fetch grades dengan academic_year_id
const [resGradeTypes, resGrades] = await Promise.all([
    fetch(`/api/grade_types?academic_year_id=eq.${currentYearId}&semester=eq.${semester}`, { headers }),
    fetch(`/api/grades?student_id=eq.${studentId}&academic_year_id=eq.${currentYearId}&semester=eq.${semester}`, { headers }),
]);

// 4. Grade calculation pakai grade_types.code
const typeMap = new Map();
gradeTypes.forEach(gt => typeMap.set(gt.id, { code: gt.code, weight: gt.weight, name: gt.name }));

for (const g of gradeData) {
    const typeInfo = typeMap.get(g.grade_type_id);
    const code = typeInfo?.code || '';
    const weight = typeInfo?.weight || 1;

    if (code.startsWith('uh') || code.startsWith('tugas')) {
        // Daily grade (weighted)
        dailySum += gradeVal * weight;
        dailyWeight += weight;
    } else if (code === 'uts' || code === 'uas' || code === 'pts' || code === 'pat') {
        // Exam grade (weighted)
        examSum += gradeVal * weight;
        examWeight += weight;
    }
}

// 5. Weighted average
const report = totalWeight > 0 ? Math.round((dailySum + examSum) / totalWeight) : 0;
```

---

## Perbaikan #4: JadwalUjian

**File:** `src/components/JadwalUjian.tsx`  
**Severity:** HIGH  
**Keterangan:** Filter guru tidak diterapkan — semua guru lihat semua jadwal ujian

### Masalah

```typescript
// SEBELUM — SALAH
// Line 140-150: Filter selalu return true
const filteredItems = examItems.filter((item) => {
    if (item.day !== selectedDay) return false;
    if (!user?.id) return true;
    // TODO: cross-check with myClassNames if needed
    return true;  // ← SELALU TRUE
});
```

```typescript
// SEBELUM — SALAH
// Line 80-84: staff.class_name tidak ada di schema
staff.forEach((s: any) => {
    if (s.profile_id === teacherId || s.teacher_id === teacherId) {
        if (s.class_name) myClassNames.add(s.class_name);  // ← SELALU UNDEFINED
    }
});
```

### Perbaikan

```typescript
// SESUDAH — BENAR
// Fetch teacher's classes via schedules + classes
const [schedByTeacherRes, clsRes] = await Promise.all([
    fetch(`/api/schedules?teacher_id=eq.${teacherId}`, { headers }),
    fetch('/api/classes', { headers }),
]);

// Build teacherClassIds from classes.teacher_id
const teacherClassIds = new Set<string>();
classes.forEach((c: any) => {
    if (c.teacher_id === teacherId) teacherClassIds.add(c.id);
});

// Add from schedules.class_id
if (schedByTeacherRes.ok) {
    const schedByTeacher = await schedByTeacherRes.json();
    schedByTeacher.forEach((s: any) => {
        if (s.class_id) teacherClassIds.add(s.class_id);
    });
}

// Filter: only show exams for teacher's classes
const filteredItems = examItems.filter((item) => {
    if (item.day !== selectedDay) return false;
    if (!user?.id) return true;
    if (myClassIds.size === 0) return true;
    return myClassIds.has(item.classId);
});
```

---

## Perbaikan #5: ChannelSekolahSiswa

**File:** `src/components/ChannelSekolahSiswa.tsx`  
**Severity:** HIGH  
**Keterangan:** Fetch dari table salah — `broadcasts` adalah tracking table, bukan content table

### Masalah

```typescript
// SEBELUM — SALAH
// Fetch dari broadcasts (tracking table)
const res = await fetch('/api/broadcasts', { headers });
// broadcasts hanya punya: id, announcement_id, recipient_type, recipient_id, read_status, read_at
// TIDAK ADA: title, content, url, category, status, views
```

### Perbaikan

```typescript
// SESUDAH — BENAR
// Fetch dari 3 tables yang benar
const [settingsRes, videosRes, announcementsRes] = await Promise.all([
    fetch('/api/multimedia_settings', { headers }),       // channel settings
    fetch('/api/multimedia_videos?is_active=eq.1', { headers }),  // YouTube videos
    fetch('/api/announcements?status=eq.Terbit', { headers }),     // announcements
]);

// multimedia_videos: title, youtube_url, description, thumbnail
// announcements: title, content, category, status, viewers
// multimedia_settings: name, autoplay, mode
```

### Table Mapping

| Komponen | Sebelum (Salah) | Sesudah (Benar) |
|----------|-----------------|-----------------|
| Video content | `broadcasts.url` | `multimedia_videos.youtube_url` |
| Video title | `broadcasts.title` | `multimedia_videos.title` |
| Description | `broadcasts.description` | `multimedia_videos.description` |
| Viewers | `broadcasts.views` | `announcements.viewers` |
| Status | `b.status === 'Active'` | `status=eq.Terbit` |

---

## Audit Lengkap 12 Ikon

### Status Akhir

| # | Ikon | Komponen | Status | Keterangan |
|---|------|----------|--------|------------|
| 1 | Jadwal Mengajar | JadwalMengajarGuru.tsx | ✅ OK | D1 clean, teacher filter correct |
| 2 | Jadwal Ujian | JadwalUjian.tsx | ✅ FIXED | Filter guru diterapkan |
| 3 | Absensi Siswa | KehadiranSiswaGuru.tsx | ✅ OK | Status mapping H/S/I/A → hadir/sakit/izin/alpa |
| 4 | Input Nilai | InputNilaiGuru.tsx | ✅ OK | Grade save via useGrades hook |
| 5 | Master Deskripsi | RaporSettingsView.tsx | ✅ OK | D1 rapor_descriptions, predicates A/B/C/D |
| 6 | Materi & Latihan | MateriLatihanGuru.tsx | ✅ OK | teacher_id filter, subjectId support |
| 7 | Al Quran | AlQuranSiswa.tsx | ✅ OK | External API (api.alquran.cloud) |
| 8 | Channel Sekolah | ChannelSekolahSiswa.tsx | ✅ FIXED | Fetch dari multimedia_videos + announcements |
| 9 | Belajar dengan AI | BelajarAISiswa.tsx | ✅ OK | Gemini API |
| 10 | Notepad | NotepadGuru.tsx | ✅ OK | D1 teacher_notes, teacher_id filter |
| 11 | Kelas Ku | KelasKu.tsx | ✅ FIXED | Attendance fetch per class, filter by ID |
| 12 | E-Rapor | RapotSiswa.tsx | ✅ FIXED | Grade calc pakai grade_types, weighted avg |
| 13 | Informasi | InformasiWaliKelas.tsx | ✅ FIXED | class_students pivot, D1 field mapping |

### Hooks yang Sudah Benar

| Hook | Status | Keterangan |
|------|--------|------------|
| useAttendance.ts | ✅ OK | ATTENDANCE_WRITE_ROLES, created_by, STATUS_MAP |
| useGrades.ts | ✅ OK | GRADE_WRITE_ROLES, upsert logic |
| useExams.ts | ✅ OK | subject_id/teacher_id use IDs |
| useSchedules.ts | ✅ OK | teacher_id in sync body |
| useMateri.ts | ✅ OK | teacherId param, filter by teacher_id |

---

## Schema D1 yang Relevan

### Tables Utama

```sql
-- Students: TIDAK ADA kolom kelas!
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    nis TEXT,
    nisn TEXT,
    gender TEXT,
    birth_date TEXT,
    birth_place TEXT,
    address TEXT,
    phone TEXT,
    parent_name TEXT,
    parent_job TEXT,
    mother_name TEXT,
    mother_job TEXT,
    is_active INTEGER DEFAULT 1
);

-- Class Students: Pivot table
CREATE TABLE class_students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    academic_year_id TEXT,
    is_active INTEGER DEFAULT 1
);

-- Classes: teacher_id = wali kelas
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade_level TEXT,
    academic_year_id TEXT,
    teacher_id TEXT,  -- wali kelas
    is_active INTEGER DEFAULT 1
);

-- Schedules: teacher_id = guru mengajar
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    day_of_week TEXT,
    start_time TEXT,
    end_time TEXT,
    room TEXT,
    is_published INTEGER DEFAULT 0
);

-- Attendance: class_id (bukan nama!)
CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT CHECK (status IN ('hadir','sakit','izin','alpa')),
    remarks TEXT,
    created_by TEXT
);

-- Grades: pakai grade_type_id FK
CREATE TABLE grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    academic_year_id TEXT,
    semester INTEGER,
    grade_type_id TEXT,  -- FK ke grade_types
    grade_value DECIMAL(5,2),
    created_by TEXT
);

-- Grade Types: ada code dan weight
CREATE TABLE grade_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,       -- "UH 1", "UTS", "UAS"
    code TEXT NOT NULL,       -- "uh1", "uts", "uas"
    weight REAL DEFAULT 1.0,  -- bobot kalkulasi
    academic_year_id TEXT,
    semester INTEGER
);

-- Multimedia Videos: YouTube videos
CREATE TABLE multimedia_videos (
    id TEXT PRIMARY KEY,
    setting_id TEXT NOT NULL,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    thumbnail TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- Announcements: untuk channel sekolah
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft','Terbit','Arsip')),
    viewers INTEGER DEFAULT 0,
    publish_date DATETIME,
    created_by TEXT
);
```

### Permission Matrix (Guru)

| Fitur | Guru Mapel | Wali Kelas |
|-------|------------|------------|
| Jadwal Mengajar | ✅ (teacher_id filter) | ✅ |
| Jadwal Ujian | ✅ (class filter) | ✅ |
| Absensi Siswa | ✅ (class filter) | ✅ |
| Input Nilai | ✅ (class+subject filter) | ✅ |
| Master Deskripsi | ✅ (teacher_id filter) | ✅ |
| Materi & Latihan | ✅ (teacher_id filter) | ✅ |
| Al Quran | ✅ (external API) | ✅ |
| Channel Sekolah | ✅ (read-only) | ✅ |
| Belajar dengan AI | ✅ (Gemini API) | ✅ |
| Notepad | ✅ (teacher_id filter) | ✅ |
| Kelas Ku | ❌ (hidden) | ✅ (class filter) |
| E-Rapor | ❌ (hidden) | ✅ (class filter) |
| Informasi | ❌ (hidden) | ✅ (class filter) |

---

## Catatan Teknis

### D1 Flat Rows → Client Transform

D1 mengembalikan flat rows tanpa JOIN. Semua komponen harus:
1. Fetch data terpisah (classes, students, class_students, dll)
2. Build lookup maps (classMap, studentMap, subjectMap)
3. Filter dan join di client-side

### Status Attendance Mapping

| UI Code | D1 Status | Label |
|---------|-----------|-------|
| H | hadir | Hadir |
| S | sakit | Sakit |
| I | izin | Izin |
| A | alpa | Alpha |

### Grade Types Code Mapping

| Code | Kategori | Keterangan |
|------|----------|------------|
| uh*, tugas* | Daily | Ulang Harian / Tugas |
| uts | Mid Exam | Ujian Tengah Semester |
| uas | Final Exam | Ujian Akhir Semester |
| pts | Mid Assessment | Penilaian Tengah Semester |
| pat | Final Assessment | Penilaian Akhir Semester |

---

**Dokumen ini disiapkan sebelum push ke GitHub pada 28 Juni 2026.**
