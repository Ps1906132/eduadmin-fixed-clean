# DashboardSuperAdmin - Refactored Structure

## 📁 Struktur Folder

```
components/DashboardSuperAdmin/
├── README.md (dokumentasi ini)
├── types.ts (Types & Interfaces)
├── hooks/ (Custom Hooks untuk Data Management)
│   ├── useStudents.ts
│   ├── useTeachers.ts
│   ├── useClasses.ts
│   ├── useSubjects.ts
│   ├── useFinance.ts
│   └── useSavings.ts
└── components/
    ├── Sidebar.tsx (Sidebar Navigation)
    └── views/ (View Components)
        ├── DashboardHome.tsx
        ├── PengumumanView.tsx
        ├── LaporanView.tsx
        ├── MultimediaView.tsx
        └── SettingsView.tsx
```

---

## 📝 Custom Hooks

### useStudents
- **File:** `hooks/useStudents.ts`
- **Purpose:** Manajemen data siswa
- **Returns:** `{ students, setStudents }`
- **Interface:** `Student`

### useTeachers
- **File:** `hooks/useTeachers.ts`
- **Purpose:** Manajemen data guru
- **Returns:** `{ teachers, setTeachers }`
- **Interface:** `Teacher`

### useClasses
- **File:** `hooks/useClasses.ts`
- **Purpose:** Manajemen data kelas
- **Returns:** `{ classes, setClasses }`
- **Interface:** `Class`

### useSubjects
- **File:** `hooks/useSubjects.ts`
- **Purpose:** Manajemen mata pelajaran & kelompok
- **Returns:** `{ subjectGroups, setSubjectGroups, subjects, setSubjects }`
- **Interfaces:** `SubjectGroup`, `Subject`

### useFinance
- **File:** `hooks/useFinance.ts`
- **Purpose:** Manajemen data keuangan
- **Returns:** `{ financialYear, cashAccounts, paymentTypes, studentBills, expenses, ... }`
- **Interfaces:** `CashAccount`, `PaymentType`, `StudentBill`, `Expense`

### useSavings
- **File:** `hooks/useSavings.ts`
- **Purpose:** Manajemen data tabungan
- **Returns:** `{ savingsData, savingsTransactions, ... }`
- **Interfaces:** `SavingsData`, `SavingsTransaction`

---

## 🎯 View Components

### DashboardHome
- **File:** `components/views/DashboardHome.tsx`
- **Purpose:** Dashboard utama dengan stats cards, notifikasi, dan akses cepat
- **Props:** `{ students, setActiveView }`

### PengumumanView
- **File:** `components/views/PengumumanView.tsx`
- **Purpose:** Wrapper untuk komponen Pengumuman
- **Props:** None (menggunakan data dari sharedData)

### LaporanView
- **File:** `components/views/LaporanView.tsx`
- **Purpose:** Wrapper untuk komponen Laporan
- **Props:** None

### MultimediaView
- **File:** `components/views/MultimediaView.tsx`
- **Purpose:** Wrapper untuk komponen Multimedia
- **Props:** None

### SettingsView
- **File:** `components/views/SettingsView.tsx`
- **Purpose:** Wrapper untuk komponen Pengaturan
- **Props:** None

---

## 🔧 Types & Interfaces

### File: `types.ts`

Berisi semua types dan interfaces yang digunakan di DashboardSuperAdmin:

- `SuperAdminProps`
- `ScheduleItem`
- `Period`
- `MasterSchedule`
- `DailyScheduleInfo`
- `MenuItem`
- `DAYS` constant

---

## 📊 Usage

### Menggunakan Custom Hooks

```typescript
import { useStudents } from './DashboardSuperAdmin/hooks/useStudents';
import { useTeachers } from './DashboardSuperAdmin/hooks/useTeachers';

const MyComponent = () => {
    const { students, setStudents } = useStudents();
    const { teachers, setTeachers } = useTeachers();
    
    // Use students and teachers...
};
```

### Menggunakan View Components

```typescript
import DashboardHome from './DashboardSuperAdmin/components/views/DashboardHome';
import PengumumanView from './DashboardSuperAdmin/components/views/PengumumanView';

// In your JSX:
{activeView === 'dashboard' && (
    <DashboardHome students={students} setActiveView={setActiveView} />
)}

{activeView === 'pengumuman' && (
    <PengumumanView />
)}
```

---

## 🚀 Refactoring History

Refactoring dilakukan dalam 4 phase:

1. **Phase 1:** Setup Struktur (types.ts, Sidebar.tsx)
2. **Phase 2:** Extract Views (5 view components)
3. **Phase 3:** Extract Data Hooks (6 custom hooks)
4. **Phase 4:** Cleanup & Documentation

**Hasil:**
- File DashboardSuperAdmin.tsx: **4.959 → 4.719 baris** (-240 baris, -4.8%)
- **11 komponen/hooks baru** dibuat
- Code lebih modular dan maintainable

---

## 📝 Notes

- **UI State** dan **Helper State** tetap di component (karena UI-specific)
- **Data State** menggunakan custom hooks (untuk reusability)
- Semua hooks memiliki type definitions untuk type safety
- Initial data terpusat di hooks untuk maintainability

---

**Last Updated:** 2025-01-21  
**Status:** ✅ Refactored & Documented
