# LAPORAN ANALISIS SINKRONISASI USER ROLES
**Tanggal:** 2025-01-21  
**Proyek:** Sistem Informasi EduAdmin - Sistem Manajemen Sekolah

---

## RINGKASAN EKSEKUTIF

Dari analisis menyeluruh terhadap sinkronisasi User Roles di seluruh sistem, ditemukan:

**Status:** ⚠️ **SEBAGIAN BESAR SINKRON, TAPI ADA INKONSISTENSI DI DATA JABATAN**

- ✅ **Routing & Login**: Sudah sinkron (100%)
- ⚠️ **Data Jabatan**: Ada inkonsistensi mapping role dengan kode akses
- ❌ **Validasi Login**: Tidak ada validasi terhadap stafList yang sebenarnya

---

## 1. USER ROLES YANG DITETAPKAN

### 1.1 Role Codes (Kode Role)
Sistem menggunakan **6 role codes** untuk routing dan autentikasi:

| Kode | Nama Role | Deskripsi |
|------|-----------|-----------|
| `'admin'` | Super Admin | Administrator sistem penuh |
| `'ks'` | Kepala Sekolah | Kepala sekolah |
| `'gm'` | Guru Mata Pelajaran | Guru pengajar mata pelajaran |
| `'wk'` | Wali Kelas | Guru wali kelas |
| `'gb'` | Guru Bimbel | Guru bimbingan belajar |
| `'ot'` | Orang Tua | Wali murid/orang tua siswa |

---

## 2. SINKRONISASI DI SETIAP KOMPONEN

### ✅ 2.1 Login.tsx → App.tsx (SINKRON)

**Login.tsx** mengirim role code yang konsisten dengan routing di **App.tsx**:

| Login Credential | Role Code | App.tsx Routing | Status |
|-----------------|-----------|-----------------|--------|
| `admin` / `admin123` | `'admin'` | `if (userRole === 'admin')` | ✅ Sinkron |
| `kepsek` / `kepsek123` | `'ks'` | `if (userRole === 'ks')` | ✅ Sinkron |
| `guru` / `guru123` | `'gm'` | `if (userRole === 'gm')` | ✅ Sinkron |
| `wali` / `wali123` | `'wk'` | `if (userRole === 'wk')` | ✅ Sinkron |
| `bimbel` / `bimbel123` | `'gb'` | `if (userRole === 'gb')` | ✅ Sinkron |
| `ortu` / `ortu123` | `'ot'` | `if (userRole === 'ot')` | ✅ Sinkron |

**Kesimpulan:** Routing dan login sudah **100% sinkron**.

---

### ⚠️ 2.2 DataGuruStaff.tsx - JabatanList (INKONSISTENSI)

**Lokasi:** `components/DataGuruStaff.tsx` baris 94-98

```typescript
const [jabatanList, setJabatanList] = useState([
  { no: 1, kode: 'JBT-001', nama: 'Kepala Sekolah', kategori: 'Struktural', jumlah: '1 Orang', akses: 'Super Admin' },
  { no: 2, kode: 'JBT-002', nama: 'Guru Kelas', kategori: 'Pendidik', jumlah: '12 Orang', akses: 'Guru' },
  { no: 3, kode: 'JBT-003', nama: 'Guru Mata Pelajaran', kategori: 'Pendidik', jumlah: '8 Orang', akses: 'Guru' },
  { no: 4, kode: 'JBT-004', nama: 'Staff Tata Usaha', kategori: 'Tenaga Kependidikan', jumlah: '3 Orang', akses: 'Staff' },
]);
```

#### Masalah yang Ditemukan:

1. **Field `akses` menggunakan string deskriptif**, bukan role code:
   - ❌ `akses: 'Super Admin'` (seharusnya: `'admin'` atau `'ks'`)
   - ❌ `akses: 'Guru'` (seharusnya: `'gm'`, `'wk'`, atau `'gb'`)
   - ❌ `akses: 'Staff'` (tidak ada role code yang sesuai)

2. **Tidak ada mapping antara jabatan dan role code:**
   - Jabatan "Kepala Sekolah" → Role code `'ks'` ✅ (bisa dipetakan)
   - Jabatan "Guru Kelas" → Role code `'wk'` ✅ (bisa dipetakan)
   - Jabatan "Guru Mata Pelajaran" → Role code `'gm'` ✅ (bisa dipetakan)
   - Jabatan "Staff Tata Usaha" → Role code `?` ❌ (tidak ada role code yang sesuai)

3. **Tidak ada role untuk "Staff Tata Usaha":**
   - Sistem tidak memiliki role code untuk staff tata usaha
   - Staff Tata Usaha mungkin harus menggunakan role `'admin'` atau perlu role baru

---

### ❌ 2.3 StafList vs Login Credentials (TIDAK TERHUBUNG)

**Masalah:** Login menggunakan hardcoded credentials, tidak terhubung dengan stafList yang sebenarnya.

**App.tsx** (stafList):
```typescript
const [stafList, setStafList] = useState([
  { no: 1, noPegawai: '19750101 200012 1 001', nama: 'Abdul Solihin, S.Pd.I', jabatan: 'Kepala Sekolah', username: 'abdul.solihin', password: 'password123' },
  { no: 2, noPegawai: '19850202 201001 2 002', nama: 'Siti Aminah, S.Pd', jabatan: 'Guru Kelas 1', username: 'siti.aminah', password: 'password123' },
  { no: 3, noPegawai: '19840303 200903 1 003', nama: 'Budi Santoso, M.Pd', jabatan: 'Guru Matematika', username: 'budi.santoso', password: 'password123' },
]);
```

**Login.tsx** (hardcoded credentials):
- `admin` / `admin123` → Tidak ada di stafList
- `kepsek` / `kepsek123` → Tidak ada di stafList
- `guru` / `guru123` → Tidak ada di stafList
- `wali` / `wali123` → Tidak ada di stafList
- dll.

**Dampak:**
- StafList memiliki username/password yang tidak bisa digunakan untuk login
- Login menggunakan credentials terpisah yang tidak sinkron dengan data staff
- Tidak ada validasi login terhadap stafList

---

### ⚠️ 2.4 DashboardSuperAdmin - Teachers Data (TERPISAH)

**Lokasi:** `components/DashboardSuperAdmin.tsx` baris 128-133

```typescript
const [teachers, setTeachers] = useState([
  { id: 1, nama: 'Ahmad Dahlan, S.Pd', nip: '198501012010011001', jabatan: 'Guru Kelas', mapel: 'Tematik', wali: '1A', user: 'ahmad85', password: 'password123' },
  { id: 2, nama: 'Siti Aminah, S.Pd', nip: '199002022015022002', jabatan: 'Guru Mata Pelajaran', mapel: 'Bahasa Inggris, Seni Budaya', wali: '-', user: 'siti90', password: 'password123' },
  { id: 3, nama: 'Budi Santoso, M.Pd', nip: '198003032005031003', jabatan: 'Kepala Sekolah', mapel: '-', wali: '-', user: 'kepsek_budi', password: 'securepass' },
  { id: 4, nama: 'Ratna Sari, S.Kom', nip: '-', jabatan: 'Operator Data', mapel: '-', wali: '-', user: 'admin_ops', password: 'adminpass' },
]);
```

**Masalah:**
- Data teachers di DashboardSuperAdmin **terpisah** dari stafList di App.tsx
- Tidak ada sinkronisasi antara kedua data
- Data duplikat dengan nama yang berbeda

---

## 3. MAPPING JABATAN → ROLE CODE

### Mapping yang Seharusnya:

| Jabatan (Nama) | Role Code | Status Mapping |
|----------------|-----------|----------------|
| Kepala Sekolah | `'ks'` | ✅ Bisa dipetakan |
| Guru Kelas | `'wk'` | ✅ Bisa dipetakan |
| Guru Mata Pelajaran | `'gm'` | ✅ Bisa dipetakan |
| Staff Tata Usaha | `?` | ❌ Tidak ada role code |
| Operator Data | `'admin'`? | ⚠️ Harus dipetakan ke admin |
| Guru Bimbel | `'gb'` | ✅ Sudah ada di sistem |

---

## 4. REKOMENDASI PERBAIKAN

### 🔴 PRIORITAS TINGGI:

#### 1. Standarisasi Field `akses` di JabatanList

**Masalah:** Field `akses` menggunakan string deskriptif, bukan role code.

**Solusi:**
```typescript
const [jabatanList, setJabatanList] = useState([
  { no: 1, kode: 'JBT-001', nama: 'Kepala Sekolah', kategori: 'Struktural', jumlah: '1 Orang', akses: 'ks' }, // ✅
  { no: 2, kode: 'JBT-002', nama: 'Guru Kelas', kategori: 'Pendidik', jumlah: '12 Orang', akses: 'wk' }, // ✅
  { no: 3, kode: 'JBT-003', nama: 'Guru Mata Pelajaran', kategori: 'Pendidik', jumlah: '8 Orang', akses: 'gm' }, // ✅
  { no: 4, kode: 'JBT-004', nama: 'Staff Tata Usaha', kategori: 'Tenaga Kependidikan', jumlah: '3 Orang', akses: 'staff' }, // ⚠️ Perlu role baru
]);
```

#### 2. Tambahkan Role Code untuk Staff Tata Usaha

**Opsi A:** Gunakan role `'admin'` untuk staff tata usaha  
**Opsi B:** Buat role code baru `'staff'` untuk staff tata usaha

**Rekomendasi:** Opsi A (gunakan `'admin'` dengan permission terbatas di frontend)

#### 3. Integrasikan Login dengan StafList

**Solusi:**
```typescript
// Di Login.tsx, validasi terhadap stafList dari App.tsx
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  // Validasi terhadap stafList
  const user = stafList.find(s => s.username === username && s.password === password);
  if (user) {
    // Map jabatan ke role code
    const roleCode = mapJabatanToRoleCode(user.jabatan);
    onLogin(roleCode, user);
  } else {
    setError('Username atau password salah!');
  }
};
```

### 🟡 PRIORITAS SEDANG:

#### 4. Buat Mapping Function Jabatan → Role Code

```typescript
// utils/roleMapper.ts
export const mapJabatanToRoleCode = (jabatan: string): string => {
  const mapping: Record<string, string> = {
    'Kepala Sekolah': 'ks',
    'Guru Kelas': 'wk',
    'Guru Mata Pelajaran': 'gm',
    'Guru Matematika': 'gm',
    'Staff Tata Usaha': 'admin', // atau 'staff'
    'Operator Data': 'admin',
  };
  return mapping[jabatan] || 'gm'; // default fallback
};
```

#### 5. Unifikasi Data Teachers

- Gunakan stafList dari App.tsx sebagai single source of truth
- Hapus duplikasi data teachers di DashboardSuperAdmin
- Buat shared state untuk teachers/staff

---

## 5. CHECKLIST SINKRONISASI

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Login → App.tsx Routing | ✅ Sinkron | Semua role code konsisten |
| Role Codes (6 role) | ✅ Lengkap | admin, ks, gm, wk, gb, ot |
| JabatanList → Role Code | ⚠️ Inkonsisten | Field `akses` perlu diubah ke role code |
| StafList → Login | ❌ Tidak terhubung | Login hardcoded, tidak validasi stafList |
| Teachers Data | ⚠️ Duplikasi | Data terpisah di App.tsx dan DashboardSuperAdmin |
| Role untuk Staff TU | ❌ Tidak ada | Perlu role code atau mapping ke admin |

---

## 6. KESIMPULAN

### Status Keseluruhan: ⚠️ **SEBAGIAN BESAR SINKRON, PERLU PERBAIKAN**

**Yang Sudah Baik:**
- ✅ Routing dan login menggunakan role code yang konsisten
- ✅ Semua 6 role memiliki dashboard khusus
- ✅ Struktur role sudah jelas dan terdefinisi

**Yang Perlu Diperbaiki:**
- ⚠️ Field `akses` di jabatanList harus menggunakan role code, bukan string deskriptif
- ❌ Login harus terintegrasi dengan stafList (single source of truth)
- ⚠️ Perlu mapping function untuk jabatan → role code
- ⚠️ Staff Tata Usaha perlu role code yang jelas (atau mapping ke admin)
- ⚠️ Data teachers terduplikasi, perlu unifikasi

**Prioritas:**
1. **PRIORITAS TINGGI**: Standarisasi field `akses` di jabatanList
2. **PRIORITAS TINGGI**: Integrasikan login dengan stafList
3. **PRIORITAS SEDANG**: Buat mapping function jabatan → role code
4. **PRIORITAS SEDANG**: Unifikasi data teachers

---

**Dibuat oleh:** AI Assistant  
**Metode Analisis:** Code Review + Pattern Matching  
**Tools:** grep, codebase_search, manual analysis
