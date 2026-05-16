# RENCANA PHASE 3: EXTRACT DATA HOOKS / CENTRALIZE DATA

## 📋 ANALISIS STATE YANG ADA

Dari analisis DashboardSuperAdmin.tsx, ada **103 useState declarations** yang dapat dikategorikan:

### 1. **UI State** (~40)
- Modal states (showAddClassModal, showAddStudentModal, dll)
- View states (activeView, isSidebarOpen)
- Selected states (selectedClass, selectedStudent, dll)
- Edit states (modalMode, editItem, editType)

### 2. **Data State** (~30)
- **Students**: `students`, `setStudents`
- **Teachers**: `teachers`, `setTeachers`
- **Classes**: `classes`, `setClasses`
- **Subjects**: `subjects`, `setSubjects`, `subjectGroups`, `setSubjectGroups`
- **Schedules**: `schedules`, `setSchedules`, `schedulePeriods`, `setSchedulePeriods`
- **Attendance**: `attendanceData`, `setAttendanceData`
- **Exams**: `examSchedules`, `setExamSchedules`, `examScheduleItems`, `setExamScheduleItems`
- **Grades**: `nilaiData`, `setNilaiData`
- **Finance**: `cashAccounts`, `setCashAccounts`, `paymentTypes`, `setPaymentTypes`, `studentBills`, `setStudentBills`, `expenses`, `setExpenses`
- **Savings**: `savingsData`, `setSavingsData`

### 3. **Form State** (~20)
- Form inputs, validation states
- New item states (newPaymentType, newExpense, dll)

### 4. **Helper State** (~13)
- Search queries (absenSearchQuery, searchStudentForPayment)
- Filters (selectedNilaiClass, selectedNilaiSubject)
- Pagination, sorting, dll

---

## 🎯 STRATEGI PHASE 3

### **Pendekatan: Custom Hooks untuk Grouped State**

Kita akan membuat custom hooks untuk setiap kelompok data yang terkait:

1. **useStudents** - untuk students data
2. **useTeachers** - untuk teachers data
3. **useClasses** - untuk classes data
4. **useSubjects** - untuk subjects & subjectGroups
5. **useSchedules** - untuk schedules & schedule periods
6. **useFinance** - untuk finance data (cashAccounts, paymentTypes, studentBills, expenses)
7. **useSavings** - untuk savings data

**UI State dan Helper State** tetap di component karena spesifik untuk UI.

---

## 📁 STRUKTUR FOLDER BARU

```
components/DashboardSuperAdmin/
├── types.ts ✅
├── components/
│   ├── Sidebar.tsx ✅
│   └── views/
│       ├── DashboardHome.tsx ✅
│       ├── PengumumanView.tsx ✅
│       ├── LaporanView.tsx ✅
│       ├── MultimediaView.tsx ✅
│       └── SettingsView.tsx ✅
└── hooks/ (NEW)
    ├── useStudents.ts
    ├── useTeachers.ts
    ├── useClasses.ts
    ├── useSubjects.ts
    ├── useSchedules.ts
    ├── useFinance.ts
    └── useSavings.ts
```

---

## 🚀 LANGKAH-LANGKAH

### **Step 1: Analisis State**
- ✅ Identifikasi semua useState
- ✅ Kategorikan berdasarkan fungsi
- ✅ Tentukan grouped state

### **Step 2: Buat Custom Hooks (Satu per satu)**
- ✅ useStudents.ts
- ✅ useTeachers.ts
- ✅ useClasses.ts
- ✅ useSubjects.ts
- ✅ useSchedules.ts
- ✅ useFinance.ts
- ✅ useSavings.ts

### **Step 3: Update DashboardSuperAdmin**
- ✅ Replace useState dengan custom hooks
- ✅ Update components yang menggunakan data
- ✅ Test setiap perubahan

### **Step 4: Test & Verify**
- ✅ TypeScript compilation
- ✅ Linter check
- ✅ Functional testing

---

## ⚠️ CATATAN PENTING

1. **Tetap di Component**: UI state dan helper state tetap di component (karena UI-specific)
2. **Incremental**: Buat hooks satu per satu, test setiap perubahan
3. **Tidak ubah logic**: Hanya memindahkan state management, tidak mengubah logic
4. **Props tetap sama**: Components yang menggunakan hooks harus tetap menerima props yang sama

---

**Ready to start Phase 3!** 🚀
