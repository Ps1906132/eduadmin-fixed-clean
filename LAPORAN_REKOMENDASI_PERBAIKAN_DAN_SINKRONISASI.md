# LAPORAN REKOMENDASI PERBAIKAN ERROR DAN SINKRONISASI USER ROLES
**Tanggal:** 2025-01-21  
**Proyek:** Sistem Informasi EduAdmin - Sistem Manajemen Sekolah

---

## RINGKASAN EKSEKUTIF

Dokumen ini berisi:
1. **Rekomendasi perbaikan error** yang ditemukan pada analisis sebelumnya
2. **Panduan sinkronisasi User Roles** di seluruh sistem
3. **Perbandingan menu Admin vs Role lain** untuk memastikan konsistensi
4. **Perintah/perintah lengkap** untuk implementasi perbaikan

**Total Error Ditemukan:** 11 error  
**Status:** ⚠️ **PERLU PERBAIKAN SEGERA**

---

## BAGIAN 1: REKOMENDASI PERBAIKAN ERROR

### 🔴 PRIORITAS TINGGI - Error yang Menghalangi Kompilasi

#### ERROR #1: Absen.tsx - Type 'unknown' Error

**Lokasi:** `components/Absen.tsx`  
**Baris:** 143, 156  
**Jenis:** TypeScript Compilation Error  
**Severity:** CRITICAL

**Error Detail:**
```typescript
// Baris 142-145
const handleSave = () => {
    const counts = Object.values(attendance).reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1; // ❌ ERROR: Type 'unknown' cannot be used as index
        return acc;
    }, {} as Record<string, number>);
};

// Baris 155-157
Object.values(attendance).forEach(status => {
    if (status) counts[status]++; // ❌ ERROR: Type 'unknown' cannot be used as index
});
```

**Penyebab:**
- `Object.values(attendance)` mengembalikan `unknown[]`
- Variable `curr` dan `status` bertipe `unknown`
- TypeScript tidak mengizinkan `unknown` sebagai index type

**SOLUSI:**

**File:** `components/Absen.tsx`

**Perintah Perbaikan #1.1:**
```typescript
// PERBAIKI BARIS 142-149
// GANTI:
const handleSave = () => {
    const counts = Object.values(attendance).reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    console.log('Saving data:', { date: currentDate, class: selectedClassRaw, attendance });
    setIsSaved(true);
};

// DENGAN:
const handleSave = () => {
    const counts = Object.values(attendance).reduce((acc, curr) => {
        const status = curr as AttendanceStatus; // ✅ Type assertion
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<AttendanceStatus, number>); // ✅ Gunakan AttendanceStatus sebagai key
    console.log('Saving data:', { date: currentDate, class: selectedClassRaw, attendance });
    setIsSaved(true);
};
```

**Perintah Perbaikan #1.2:**
```typescript
// PERBAIKI BARIS 152-157
// GANTI:
const counts = {
    H: 0, S: 0, I: 0, A: 0
};
Object.values(attendance).forEach(status => {
    if (status) counts[status]++;
});

// DENGAN:
const counts: Record<AttendanceStatus, number> = {
    H: 0, S: 0, I: 0, A: 0
};
Object.values(attendance).forEach(statusValue => {
    const status = statusValue as AttendanceStatus; // ✅ Type assertion
    if (status) counts[status]++;
});
```

---

#### ERROR #2: DataGuruStaff.tsx - setKelasData Type Error

**Lokasi:** `components/DataGuruStaff.tsx`  
**Baris:** 49, 272, 283, 298  
**Jenis:** TypeScript Compilation Error  
**Severity:** CRITICAL

**Error Detail:**
```typescript
// Baris 49 - Default parameter salah
setKelasData = () => { }

// Baris 272, 283, 298 - Penggunaan dengan callback
setKelasData(prev => prev.map(...)) // ❌ ERROR: Expected 0 arguments, but got 1
```

**Penyebab:**
- Default parameter `setKelasData = () => { }` hanya menerima 0 argument
- Tapi kode menggunakan `setKelasData` dengan callback function (1 argument)

**SOLUSI:**

**File:** `components/DataGuruStaff.tsx`

**Perintah Perbaikan #2.1:**
```typescript
// PERBAIKI BARIS 39-49
// GANTI:
interface DataGuruStaffProps {
  mapelList?: MapelItem[];
  setMapelList?: React.Dispatch<React.SetStateAction<MapelItem[]>>;
  stafList?: any[];
  setStafList?: React.Dispatch<React.SetStateAction<any[]>>;
  kelasData?: any[];
  setKelasData?: React.Dispatch<React.SetStateAction<any[]>>;
}

const DataGuruStaff: React.FC<DataGuruStaffProps> = ({
  mapelList: sharedMapelList,
  setMapelList: setSharedMapelList,
  stafList: sharedStafList,
  setStafList: setSharedStafList,
  kelasData = [],
  setKelasData = () => { } // ❌ SALAH
}) => {

// DENGAN:
interface DataGuruStaffProps {
  mapelList?: MapelItem[];
  setMapelList?: React.Dispatch<React.SetStateAction<MapelItem[]>>;
  stafList?: any[];
  setStafList?: React.Dispatch<React.SetStateAction<any[]>>;
  kelasData?: any[];
  setKelasData?: React.Dispatch<React.SetStateAction<any[]>>; // ✅ Tetap di interface
}

const DataGuruStaff: React.FC<DataGuruStaffProps> = ({
  mapelList: sharedMapelList,
  setMapelList: setSharedMapelList,
  stafList: sharedStafList,
  setStafList: setSharedStafList,
  kelasData = [],
  setKelasData // ✅ Hapus default parameter
}) => {
  // ✅ Tambahkan fallback di dalam komponen jika perlu
  const setKelasDataSafe = setKelasData || (() => {}); // Fallback jika undefined
```

**Perintah Perbaikan #2.2:**
```typescript
// PERBAIKI SEMUA PENGGUNAAN setKelasData (baris 272, 283, 298)
// GANTI:
setKelasData(prev => prev.map(...))

// DENGAN:
if (setKelasData) {
    setKelasData(prev => prev.map(...));
}
// ATAU gunakan setKelasDataSafe jika sudah dibuat fallback
```

---

### 🟡 PRIORITAS SEDANG - Runtime Issues (Dynamic CSS)

#### ERROR #3-7: Dynamic Tailwind CSS Classes

**Lokasi:** Multiple files  
**Jenis:** Runtime Issue  
**Severity:** MEDIUM

**Files yang Terpengaruh:**
1. `components/Dashboard.tsx` - Baris 81
2. `components/Keuangan.tsx` - Baris 73-74, 78, 242-247
3. `components/Tabungan.tsx` - Baris 68-69, 73
4. `components/NaikKelas.tsx` - Baris 57, 62
5. `components/BimbinganBelajar.tsx` - Baris 68, 73

**Masalah:**
Tailwind CSS tidak bisa generate class secara dinamis seperti `bg-${item.color}-50`

**SOLUSI UMUM:**

Buat file helper untuk color mapping:

**Perintah Perbaikan #3.1: Buat File Helper**

**File:** `utils/tailwindHelpers.ts` (BUAT FILE BARU)

```typescript
// utils/tailwindHelpers.ts
export type ColorName = 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'teal' | 'indigo' | 'violet' | 'cyan' | 'slate' | 'orange' | 'pink';

export const colorClasses = {
    blue: {
        bg50: 'bg-blue-50',
        bg100: 'bg-blue-100',
        text600: 'text-blue-600',
        text700: 'text-blue-700',
        text800: 'text-blue-800',
        border200: 'border-blue-200',
        ring200: 'ring-blue-200',
    },
    purple: {
        bg50: 'bg-purple-50',
        bg100: 'bg-purple-100',
        text600: 'text-purple-600',
        text700: 'text-purple-700',
        text800: 'text-purple-800',
        border200: 'border-purple-200',
        ring200: 'ring-purple-200',
    },
    emerald: {
        bg50: 'bg-emerald-50',
        bg100: 'bg-emerald-100',
        text600: 'text-emerald-600',
        text700: 'text-emerald-700',
        text800: 'text-emerald-800',
        border200: 'border-emerald-200',
        ring200: 'ring-emerald-200',
    },
    rose: {
        bg50: 'bg-rose-50',
        bg100: 'bg-rose-100',
        text600: 'text-rose-600',
        text700: 'text-rose-700',
        text800: 'text-rose-800',
        border200: 'border-rose-200',
        ring200: 'ring-rose-200',
    },
    teal: {
        bg50: 'bg-teal-50',
        bg100: 'bg-teal-100',
        text600: 'text-teal-600',
        text700: 'text-teal-700',
        text800: 'text-teal-800',
        border200: 'border-teal-200',
        ring200: 'ring-teal-200',
    },
    indigo: {
        bg50: 'bg-indigo-50',
        bg100: 'bg-indigo-100',
        text600: 'text-indigo-600',
        text700: 'text-indigo-700',
        text800: 'text-indigo-800',
        border200: 'border-indigo-200',
        ring200: 'ring-indigo-200',
    },
    violet: {
        bg50: 'bg-violet-50',
        bg100: 'bg-violet-100',
        text600: 'text-violet-600',
        text700: 'text-violet-700',
        text800: 'text-violet-800',
        border200: 'border-violet-200',
        ring200: 'ring-violet-200',
    },
    cyan: {
        bg50: 'bg-cyan-50',
        bg100: 'bg-cyan-100',
        text600: 'text-cyan-600',
        text700: 'text-cyan-700',
        text800: 'text-cyan-800',
        border200: 'border-cyan-200',
        ring200: 'ring-cyan-200',
    },
    slate: {
        bg50: 'bg-slate-50',
        bg100: 'bg-slate-100',
        text600: 'text-slate-600',
        text700: 'text-slate-700',
        text800: 'text-slate-800',
        border200: 'border-slate-200',
        ring200: 'ring-slate-200',
    },
    amber: {
        bg50: 'bg-amber-50',
        bg100: 'bg-amber-100',
        text600: 'text-amber-600',
        text700: 'text-amber-700',
        text800: 'text-amber-800',
        border200: 'border-amber-200',
        ring200: 'ring-amber-200',
    },
    orange: {
        bg50: 'bg-orange-50',
        bg100: 'bg-orange-100',
        text600: 'text-orange-600',
        text700: 'text-orange-700',
        text800: 'text-orange-800',
        border200: 'border-orange-200',
        ring200: 'ring-orange-200',
    },
    pink: {
        bg50: 'bg-pink-50',
        bg100: 'bg-pink-100',
        text600: 'text-pink-600',
        text700: 'text-pink-700',
        text800: 'text-pink-800',
        border200: 'border-pink-200',
        ring200: 'ring-pink-200',
    },
} as const;

export const getColorClasses = (color: ColorName) => {
    return colorClasses[color] || colorClasses.slate; // Fallback ke slate
};
```

**Perintah Perbaikan #3.2: Perbaiki Dashboard.tsx**

**File:** `components/Dashboard.tsx`

```typescript
// TAMBAHKAN IMPORT DI ATAS
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';

// PERBAIKI BARIS 81
// GANTI:
<div className={`p-4 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>

// DENGAN:
<div className={`p-4 rounded-xl ${getColorClasses(stat.color as ColorName).bg50} ${getColorClasses(stat.color as ColorName).text600} group-hover:scale-110 transition-transform duration-300`}>
```

**Perintah Perbaikan #3.3: Perbaiki Keuangan.tsx**

**File:** `components/Keuangan.tsx`

```typescript
// TAMBAHKAN IMPORT DI ATAS
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';

// PERBAIKI BARIS 73-74
// GANTI:
className={`... bg-${item.color}-50 text-${item.color}-700 ... ring-${item.color}-200`}

// DENGAN:
const colorClass = getColorClasses(item.color as ColorName);
className={`... ${colorClass.bg50} ${colorClass.text700} ... ${colorClass.ring200}`}

// PERBAIKI BARIS 78
// GANTI:
<span className={isActive ? `text-${item.color}-600` : ''}>

// DENGAN:
<span className={isActive ? getColorClasses(item.color as ColorName).text600 : ''}>

// PERBAIKI BARIS 242-247 (PERLU DIUBAH STRUKTUR)
// GANTI:
className={`p-4 border border-${item.color}-200 bg-${item.color}-50 ...`}
className={`text-${item.color}-600`}
className={`font-bold text-${item.color}-800`}
className={`bg-white ... text-${item.color}-600 ...`}

// DENGAN:
const notifColorClass = getColorClasses(item.color as ColorName);
className={`p-4 border ${notifColorClass.border200} ${notifColorClass.bg50} ...`}
className={notifColorClass.text600}
className={`font-bold ${notifColorClass.text800}`}
className={`bg-white ... ${notifColorClass.text600} ...`}
```

**Perintah Perbaikan #3.4: Perbaiki Tabungan.tsx, NaikKelas.tsx, BimbinganBelajar.tsx**

Gunakan pendekatan yang sama seperti Keuangan.tsx di atas.

---

## BAGIAN 2: SINKRONISASI USER ROLES

### 🔴 PRIORITAS TINGGI - Sinkronisasi Login dengan StafList

#### Masalah: Login Hardcoded, Tidak Terhubung dengan StafList

**Lokasi:** `components/Login.tsx`  
**Baris:** 27-57

**Masalah:**
- Login menggunakan hardcoded credentials
- Tidak memvalidasi terhadap stafList di App.tsx
- StafList memiliki username/password yang tidak bisa digunakan

**SOLUSI:**

**Opsi A: Integrasi dengan StafList (Disarankan untuk Production)**

**File:** `App.tsx`

**Perintah Perbaikan #4.1:**
```typescript
// TAMBAHKAN FUNCTION DI App.tsx (setelah handleLogout)
const mapJabatanToRoleCode = (jabatan: string): string => {
  const mapping: Record<string, string> = {
    'Kepala Sekolah': 'ks',
    'Guru Kelas': 'wk',
    'Guru Kelas 1': 'wk',
    'Guru Matematika': 'gm',
    'Guru Mata Pelajaran': 'gm',
    'Staff Tata Usaha': 'admin',
    'Operator Data': 'admin',
    'Guru Bimbel': 'gb',
  };
  return mapping[jabatan] || 'gm'; // Default fallback
};

// PASS KE LOGIN COMPONENT
<Login
  onLogin={handleLogin}
  schoolName={schoolSettings.name}
  bannerImage={schoolSettings.bannerImage}
  stafList={stafList} // ✅ TAMBAHKAN
  mapJabatanToRoleCode={mapJabatanToRoleCode} // ✅ TAMBAHKAN
/>
```

**File:** `components/Login.tsx`

**Perintah Perbaikan #4.2:**
```typescript
// PERBAIKI INTERFACE
interface LoginProps {
    onLogin: (role: string, userData: any) => void;
    schoolName?: string;
    logo?: string;
    bannerImage?: string;
    stafList?: Array<{ username: string; password: string; nama: string; jabatan: string; noPegawai: string }>; // ✅ TAMBAHKAN
    mapJabatanToRoleCode?: (jabatan: string) => string; // ✅ TAMBAHKAN
}

const Login: React.FC<LoginProps> = ({ 
  onLogin, 
  schoolName = "NAMA SEKOLAH", 
  logo, 
  bannerImage,
  stafList = [], // ✅ TAMBAHKAN
  mapJabatanToRoleCode // ✅ TAMBAHKAN
}) => {

// PERBAIKI handleLogin FUNCTION (baris 18-71)
// GANTI SELURUH ISI handleLogin DENGAN:
const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        // ✅ VALIDASI TERHADAP STAFLIST
        if (stafList && stafList.length > 0) {
            const user = stafList.find(
                s => s.username === username && s.password === password
            );
            
            if (user && mapJabatanToRoleCode) {
                const roleCode = mapJabatanToRoleCode(user.jabatan);
                onLogin(roleCode, {
                    nama: user.nama,
                    role: user.jabatan,
                    nip: user.noPegawai,
                    username: user.username
                });
                setIsLoading(false);
                return;
            }
        }
        
        // ✅ FALLBACK: Hardcoded credentials untuk demo (hapus di production)
        if (username === 'admin' && password === 'admin123') {
            onLogin('admin', { nama: 'Super Admin', role: 'Super Admin' });
        } else if (username === 'kepsek' && password === 'kepsek123') {
            onLogin('ks', { nama: 'Kepala Sekolah', role: 'Kepala Sekolah' });
        } else if (username === 'guru' && password === 'guru123') {
            onLogin('gm', {
                nama: 'Budi Santoso, S.Pd',
                role: 'Guru Mapel',
                nip: '19850712 201001 1 009',
                mapel: 'Pendidikan Agama Islam',
            });
        } else if (username === 'wali' && password === 'wali123') {
            onLogin('wk', {
                nama: 'Siti Aminah, S.Pd',
                role: 'Wali Kelas',
                nip: '19901025 201201 2 005',
                kelas: '1 A',
            });
        } else if (username === 'ortu' && password === 'ortu123') {
            onLogin('ot', { nama: 'Budi Santoso', role: 'Orang Tua' });
        } else if (username === 'bimbel' && password === 'bimbel123') {
            onLogin('gb', {
                nama: 'Ahmad Dahlan, S.Pd',
                role: 'Guru Bimbel',
                nip: '19950520 201903 1 008',
                mapel: 'Bimbingan Belajar',
            });
        } else {
            setError('Username atau password salah!');
        }
        setIsLoading(false);
    }, 800);
};
```

---

### 🟡 PRIORITAS SEDANG - Standarisasi Field `akses` di JabatanList

#### Masalah: Field `akses` Menggunakan String Deskriptif, Bukan Role Code

**Lokasi:** `components/DataGuruStaff.tsx`  
**Baris:** 94-98

**SOLUSI:**

**File:** `components/DataGuruStaff.tsx`

**Perintah Perbaikan #5.1:**
```typescript
// PERBAIKI BARIS 94-98
// GANTI:
const [jabatanList, setJabatanList] = useState([
  { no: 1, kode: 'JBT-001', nama: 'Kepala Sekolah', kategori: 'Struktural', jumlah: '1 Orang', akses: 'Super Admin' },
  { no: 2, kode: 'JBT-002', nama: 'Guru Kelas', kategori: 'Pendidik', jumlah: '12 Orang', akses: 'Guru' },
  { no: 3, kode: 'JBT-003', nama: 'Guru Mata Pelajaran', kategori: 'Pendidik', jumlah: '8 Orang', akses: 'Guru' },
  { no: 4, kode: 'JBT-004', nama: 'Staff Tata Usaha', kategori: 'Tenaga Kependidikan', jumlah: '3 Orang', akses: 'Staff' },
]);

// DENGAN:
const [jabatanList, setJabatanList] = useState([
  { no: 1, kode: 'JBT-001', nama: 'Kepala Sekolah', kategori: 'Struktural', jumlah: '1 Orang', akses: 'ks' }, // ✅
  { no: 2, kode: 'JBT-002', nama: 'Guru Kelas', kategori: 'Pendidik', jumlah: '12 Orang', akses: 'wk' }, // ✅
  { no: 3, kode: 'JBT-003', nama: 'Guru Mata Pelajaran', kategori: 'Pendidik', jumlah: '8 Orang', akses: 'gm' }, // ✅
  { no: 4, kode: 'JBT-004', nama: 'Staff Tata Usaha', kategori: 'Tenaga Kependidikan', jumlah: '3 Orang', akses: 'admin' }, // ✅
]);
```

---

## BAGIAN 3: PERBANDINGAN MENU ADMIN VS ROLE LAIN

### Analisis Menu Super Admin vs Menu Default (App.tsx)

**Super Admin Menu (18 menu):**
1. Beranda ✅
2. Data Siswa dan kelas ✅
3. Data Guru & Staff ✅
4. Kelas dan wali kelas ✅
5. Mata Pelajaran ✅
6. Jadwal ✅
7. Absen ✅
8. **Jadwal Ujian** ⭐ **EKSTRA di Admin**
9. Nilai ✅
10. Rapot ✅
11. Keuangan ✅
12. Tabungan ✅
13. Naik Kelas ✅
14. Bimbingan belajar (les) ✅
15. Pengumuman ✅
16. Laporan ✅
17. **Manajemen Multimedia** ⭐ **EKSTRA di Admin**
18. Pengaturan ✅

**Menu Default (App.tsx/Sidebar.tsx) - 16 menu:**
1. Beranda ✅
2. Data Siswa dan kelas ✅
3. Data Guru & Staff ✅
4. Kelas dan wali kelas ✅
5. Mata Pelajaran ✅
6. Jadwal ✅
7. Absen ✅
8. Nilai ✅
9. Rapot ✅
10. Keuangan ✅
11. Tabungan ✅
12. Naik Kelas ✅
13. Bimbingan belajar (les) ✅
14. Pengumuman ✅
15. Laporan ✅
16. Pengaturan ✅

**Kesimpulan:**
- ✅ **Menu sudah SELARAS** (16 menu sama)
- ⭐ **Admin memiliki 2 menu EKSTRA:**
  - Jadwal Ujian
  - Manajemen Multimedia
- ✅ **Tidak ada menu yang hilang** di role default
- ✅ **Tidak perlu menambahkan menu** ke role default

**Catatan:**
- Menu "Jadwal Ujian" dan "Multimedia" adalah **fitur khusus admin** yang wajar tidak ada di role lain
- Tidak perlu sinkronisasi menu tambahan

---

## BAGIAN 4: CHECKLIST IMPLEMENTASI

### Urutan Perbaikan (Disarankan)

#### FASE 1: Perbaikan Error Kritis (Hari 1)

- [ ] **Fix Error #1:** Absen.tsx - Type 'unknown' error
  - File: `components/Absen.tsx`
  - Baris: 142-149, 152-157
  - Estimasi: 15 menit

- [ ] **Fix Error #2:** DataGuruStaff.tsx - setKelasData type error
  - File: `components/DataGuruStaff.tsx`
  - Baris: 39-49, 272, 283, 298
  - Estimasi: 20 menit

- [ ] **Test Compilation:**
  ```bash
  npx tsc --noEmit
  ```
  - Pastikan tidak ada error TypeScript

#### FASE 2: Sinkronisasi User Roles (Hari 1-2)

- [ ] **Fix #4.1:** Integrasi Login dengan StafList
  - File: `App.tsx`
  - Tambahkan mapJabatanToRoleCode function
  - Pass props ke Login component
  - Estimasi: 30 menit

- [ ] **Fix #4.2:** Update Login.tsx
  - File: `components/Login.tsx`
  - Update interface dan handleLogin function
  - Estimasi: 45 menit

- [ ] **Fix #5.1:** Standarisasi Field `akses`
  - File: `components/DataGuruStaff.tsx`
  - Baris: 94-98
  - Estimasi: 10 menit

- [ ] **Test Login:**
  - Test login dengan credentials dari stafList
  - Test login dengan hardcoded credentials (fallback)
  - Pastikan role mapping benar

#### FASE 3: Perbaikan Dynamic CSS (Hari 2-3)

- [ ] **Fix #3.1:** Buat file helper
  - File: `utils/tailwindHelpers.ts` (BUAT BARU)
  - Estimasi: 30 menit

- [ ] **Fix #3.2:** Perbaiki Dashboard.tsx
  - File: `components/Dashboard.tsx`
  - Baris: 81
  - Estimasi: 10 menit

- [ ] **Fix #3.3:** Perbaiki Keuangan.tsx
  - File: `components/Keuangan.tsx`
  - Baris: 73-74, 78, 242-247
  - Estimasi: 20 menit

- [ ] **Fix #3.4:** Perbaiki Tabungan.tsx
  - File: `components/Tabungan.tsx`
  - Baris: 68-69, 73
  - Estimasi: 15 menit

- [ ] **Fix #3.5:** Perbaiki NaikKelas.tsx
  - File: `components/NaikKelas.tsx`
  - Baris: 57, 62
  - Estimasi: 10 menit

- [ ] **Fix #3.6:** Perbaiki BimbinganBelajar.tsx
  - File: `components/BimbinganBelajar.tsx`
  - Baris: 68, 73
  - Estimasi: 10 menit

- [ ] **Test UI:**
  - Test semua menu yang diperbaiki
  - Pastikan styling muncul dengan benar
  - Test responsive design

---

## BAGIAN 5: COMMAND LINE SUMMARY

### Command untuk Testing

```bash
# 1. Test TypeScript Compilation
npx tsc --noEmit

# 2. Build Project (setelah perbaikan)
npm run build

# 3. Run Dev Server (untuk testing)
npm run dev

# 4. Lint Check (jika ada)
# npx eslint components/ --ext .tsx
```

---

## BAGIAN 6: REKOMENDASI TAMBAHAN

### 1. Buat File Constants untuk Role Codes

**File:** `constants/roles.ts` (BUAT BARU)

```typescript
// constants/roles.ts
export const ROLE_CODES = {
  ADMIN: 'admin',
  KEPALA_SEKOLAH: 'ks',
  GURU_MAPEL: 'gm',
  WALI_KELAS: 'wk',
  GURU_BIMBEL: 'gb',
  ORANG_TUA: 'ot',
} as const;

export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES];

export const ROLE_LABELS: Record<RoleCode, string> = {
  [ROLE_CODES.ADMIN]: 'Super Admin',
  [ROLE_CODES.KEPALA_SEKOLAH]: 'Kepala Sekolah',
  [ROLE_CODES.GURU_MAPEL]: 'Guru Mata Pelajaran',
  [ROLE_CODES.WALI_KELAS]: 'Wali Kelas',
  [ROLE_CODES.GURU_BIMBEL]: 'Guru Bimbel',
  [ROLE_CODES.ORANG_TUA]: 'Orang Tua/Wali',
};

export const JABATAN_TO_ROLE: Record<string, RoleCode> = {
  'Kepala Sekolah': ROLE_CODES.KEPALA_SEKOLAH,
  'Guru Kelas': ROLE_CODES.WALI_KELAS,
  'Guru Kelas 1': ROLE_CODES.WALI_KELAS,
  'Guru Matematika': ROLE_CODES.GURU_MAPEL,
  'Guru Mata Pelajaran': ROLE_CODES.GURU_MAPEL,
  'Staff Tata Usaha': ROLE_CODES.ADMIN,
  'Operator Data': ROLE_CODES.ADMIN,
  'Guru Bimbel': ROLE_CODES.GURU_BIMBEL,
};
```

**Gunakan di:**
- `App.tsx` - mapJabatanToRoleCode function
- `Login.tsx` - Validasi role
- `DataGuruStaff.tsx` - Field akses

---

### 2. Unifikasi Data Teachers

**Rekomendasi:**
- Gunakan stafList dari App.tsx sebagai single source of truth
- Hapus duplikasi teachers di DashboardSuperAdmin.tsx
- Buat shared state atau context untuk teachers/staff

---

### 3. Perbaiki Menu "Informasi" di Guru Bimbel

**Lokasi:** `components/DashboardGuruBimbel.tsx`  
**Baris:** 60, 144-154

**Rekomendasi:**
- Opsi A: Hubungkan ke komponen InformasiWaliKelas (reuse)
- Opsi B: Buat komponen InformasiBimbelGuru (khusus bimbel)
- Opsi C: Hapus dari array jika tidak digunakan

---

## BAGIAN 7: KESIMPULAN

### Ringkasan Prioritas

**PRIORITAS TINGGI (Harus diperbaiki sekarang):**
1. ✅ Fix TypeScript errors (Absen.tsx, DataGuruStaff.tsx)
2. ✅ Integrasikan Login dengan StafList
3. ✅ Standarisasi field `akses` di JabatanList

**PRIORITAS SEDANG (Perbaiki untuk UX yang lebih baik):**
4. ✅ Fix Dynamic CSS issues (5 komponen)
5. ✅ Buat constants file untuk role codes
6. ✅ Unifikasi data teachers

**PRIORITAS RENDAH (Nice to have):**
7. ⚠️ Perbaiki menu "Informasi" di Guru Bimbel
8. ⚠️ Tambahkan error handling yang lebih baik

### Estimasi Waktu Total

| Fase | Estimasi Waktu | Status |
|------|---------------|--------|
| Fase 1: Fix Error Kritis | 45 menit | ❌ Belum |
| Fase 2: Sinkronisasi Roles | 1.5 jam | ❌ Belum |
| Fase 3: Fix Dynamic CSS | 1.5 jam | ❌ Belum |
| **TOTAL** | **~3.5 jam** | |

### Status Menu Admin vs Role Lain

- ✅ **Menu sudah SELARAS**
- ✅ **Admin memiliki 2 menu ekstra** (Jadwal Ujian, Multimedia) - **WAJAR**
- ✅ **Tidak perlu menambahkan menu** ke role default

---

**Dibuat oleh:** AI Assistant  
**Metode Analisis:** Code Review + Error Analysis + Menu Comparison  
**Tools:** TypeScript Compiler, Manual Code Review
