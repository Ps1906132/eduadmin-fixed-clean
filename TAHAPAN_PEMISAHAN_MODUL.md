# TAHAPAN PEMISAHAN MODUL ADMINISTRASI SEKOLAH
## Dari Admin Terpusat → Admin, Kurikulum, Keuangan

---

## 📋 RINGKASAN EKSEKUTIF

Proyek ini akan memisahkan **modul Admin** yang monolitik menjadi **3 role terpisah** dengan hak akses yang spesifik:
- **Admin** - Data Master & Manajemen Sistem
- **Kurikulum** - Pembelajaran & Akademik
- **Keuangan** - Finansial Sekolah

---

## 🎯 TAHAPAN IMPLEMENTASI

### **FASE 1: PERENCANAAN & ANALISIS (1-2 Minggu)**

#### 1.1 Audit Database & Struktur Tabel
**Tujuan:** Memahami ketergantungan data antar modul

- [ ] Identifikasi tabel yang akan dipindah/share antar role
- [ ] Buat dependency map (modul A bergantung modul B)
- [ ] Dokumentasikan foreign keys dan relasi data

**Tabel yang Shared (Tetap di Admin):**
```
users / staff
classes / kelas
students / siswa
teachers / guru
subjects / mata_pelajaran
```

**Tabel yang Pindah ke Kurikulum:**
```
schedules / jadwal
attendance / absen
exam_schedules / jadwal_ujian
grades / nilai
report_cards / rapot
grade_promotions / naik_kelas
```

**Tabel yang Pindah ke Keuangan:**
```
school_finance / keuangan_sekolah
student_savings / tabungan_siswa
finance_reports / laporan_keuangan
```

#### 1.2 Mapping Hak Akses per Role

**Buat Matrix Permissions:**

| Modul | Admin | Kurikulum | Keuangan | Keterangan |
|-------|-------|-----------|----------|-----------|
| Data Siswa & Kelas | CREATE, READ, UPDATE, DELETE | READ | READ | Admin full, others view only |
| Data Guru & Staff | CRUD | - | - | Admin only |
| Kelas & Wali Kelas | CRUD | READ | - | |
| Mata Pelajaran | CRUD | READ | - | |
| Jadwal | CRUD | CRUD | - | Move to Kurikulum |
| Absen | CRUD | CRUD | - | Move to Kurikulum |
| Jadwal Ujian | CRUD | CRUD | - | Move to Kurikulum |
| Manajemen Nilai | CRUD | CRUD | - | Move to Kurikulum |
| Rapot | CRUD | CRUD | - | Move to Kurikulum |
| Naik Kelas | CRUD | CRUD | - | Move to Kurikulum |
| Keuangan Sekolah | CRUD | - | CRUD | Move to Keuangan |
| Tabungan Siswa | CRUD | - | CRUD | Move to Keuangan |
| Laporan | READ | READ | CRUD | Finance reports to Keuangan |
| Bimbingan Belajar | CRUD | READ | - | Stay in Admin |
| Pengumuman | CRUD | - | - | Stay in Admin |
| Manajemen Multimedia | CRUD | - | - | Stay in Admin |
| Manajemen AI | CRUD | - | - | Stay in Admin |
| Pengaturan | CRUD | - | - | Admin only |

#### 1.3 Identifikasi Perubahan Database
- [ ] Field yang perlu ditambah: `created_by`, `updated_by`, `role_context`
- [ ] Audit trail untuk setiap modul
- [ ] Foreign key constraints untuk memastikan integritas data

---

### **FASE 2: SETUP INFRASTRUCTURE (1-2 Minggu)**

#### 2.1 Modifikasi Database

**A. Tambah Role Tipe Baru:**
```sql
-- Jika menggunakan ENUM
ALTER TABLE users ADD COLUMN role_type ENUM('admin', 'kurikulum', 'keuangan') DEFAULT 'admin';

-- Atau buat tabel roles baru:
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**B. Tambah Tracking Columns:**
```sql
ALTER TABLE students ADD COLUMN managed_by_admin_id INT;
ALTER TABLE schedules ADD COLUMN created_by_kurikulum_id INT;
ALTER TABLE finance_school ADD COLUMN created_by_keuangan_id INT;

-- Audit Log
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module VARCHAR(50),
    action VARCHAR(50),
    user_id INT,
    old_data JSON,
    new_data JSON,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 Buat Struktur Folder Backend

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── StudentController.php
│   │   │   ├── TeacherController.php
│   │   │   ├── AnnouncementController.php
│   │   │   └── ...
│   │   ├── Kurikulum/
│   │   │   ├── ScheduleController.php
│   │   │   ├── AttendanceController.php
│   │   │   ├── GradeController.php
│   │   │   ├── ReportCardController.php
│   │   │   └── ...
│   │   └── Keuangan/
│   │       ├── SchoolFinanceController.php
│   │       ├── StudentSavingsController.php
│   │       ├── FinanceReportController.php
│   │       └── ...
│   └── Middleware/
│       ├── AdminMiddleware.php
│       ├── KurikulumMiddleware.php
│       └── KeuanganMiddleware.php
├── Models/
│   ├── User.php (update dengan role_type)
│   ├── Admin/ (shared models)
│   ├── Kurikulum/ (kurikulum-specific)
│   └── Keuangan/ (keuangan-specific)
└── Repositories/
    ├── AdminRepository.php
    ├── KurikulumRepository.php
    └── KeuanganRepository.php
```

#### 2.3 Buat Routes Terpisah

```php
// routes/web.php
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::resource('students', 'Admin\StudentController');
    Route::resource('teachers', 'Admin\TeacherController');
    Route::resource('announcements', 'Admin\AnnouncementController');
    // ... modul admin lainnya
});

Route::middleware(['auth', 'kurikulum'])->prefix('kurikulum')->group(function () {
    Route::resource('schedules', 'Kurikulum\ScheduleController');
    Route::resource('attendance', 'Kurikulum\AttendanceController');
    Route::resource('grades', 'Kurikulum\GradeController');
    Route::resource('reportcards', 'Kurikulum\ReportCardController');
    // ... modul kurikulum lainnya
});

Route::middleware(['auth', 'keuangan'])->prefix('keuangan')->group(function () {
    Route::resource('finance', 'Keuangan\SchoolFinanceController');
    Route::resource('savings', 'Keuangan\StudentSavingsController');
    Route::resource('reports', 'Keuangan\FinanceReportController');
    // ... modul keuangan lainnya
});
```

---

### **FASE 3: DEVELOPMENT MODUL (3-4 Minggu)**

#### 3.1 Refactor Modul Kurikulum

**Prioritas:**
1. **Jadwal** (Foundation - diperlukan oleh modul lain)
2. **Absen** (Depends on Jadwal)
3. **Jadwal Ujian** 
4. **Manajemen Nilai**
5. **Rapot** (Depends on Nilai)
6. **Naik Kelas** (Depends on Nilai)

**Checklist per Modul:**
- [ ] Migrasi Controller dari Admin ke Kurikulum folder
- [ ] Update Model dan relationships
- [ ] Buat Policy untuk authorization
- [ ] Adjust middleware permissions
- [ ] Update views/templates
- [ ] Test CRUD operations
- [ ] Test relationships antar modul

**Contoh Migration Modul Jadwal:**

```php
// app/Http/Controllers/Kurikulum/ScheduleController.php
namespace App\Http\Controllers\Kurikulum;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ScheduleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:kurikulum');
    }

    public function index()
    {
        $schedules = Schedule::all();
        return view('kurikulum.schedules.index', compact('schedules'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'room' => 'required|string'
        ]);

        Schedule::create($validated);
        return redirect()->route('kurikulum.schedules.index')
            ->with('success', 'Jadwal berhasil ditambahkan');
    }
}
```

#### 3.2 Refactor Modul Keuangan

**Prioritas:**
1. **Keuangan Sekolah** (Foundation)
2. **Tabungan Siswa**
3. **Laporan Keuangan**

**Checklist per Modul:**
- [ ] Migrasi Controller dari Admin ke Keuangan folder
- [ ] Update Model dan relationships
- [ ] Buat Policy untuk authorization
- [ ] Implement approval workflow (jika ada)
- [ ] Update views/templates
- [ ] Test CRUD operations
- [ ] Test reporting & export functionality

#### 3.3 Maintain Modul Admin

**Modul yang tetap di Admin:**
- Data Siswa & Kelas
- Data Guru & Staff
- Kelas & Wali Kelas
- Mata Pelajaran
- Bimbingan Belajar
- Pengumuman
- Manajemen Multimedia
- Manajemen AI
- Pengaturan

**Checklist:**
- [ ] Pastikan akses hanya untuk admin
- [ ] Implement shared data access logic
- [ ] Audit trail untuk data sensitive

---

### **FASE 4: AUTHORIZATION & SECURITY (2 Minggu)**

#### 4.1 Implement Role-Based Access Control (RBAC)

**A. Create Middleware:**

```php
// app/Http/Middleware/AdminMiddleware.php
public function handle($request, Closure $next)
{
    if (auth()->check() && auth()->user()->role_type === 'admin') {
        return $next($request);
    }
    return response('Unauthorized', 403);
}

// app/Http/Middleware/KurikulumMiddleware.php
public function handle($request, Closure $next)
{
    if (auth()->check() && auth()->user()->role_type === 'kurikulum') {
        return $next($request);
    }
    return response('Unauthorized', 403);
}

// app/Http/Middleware/KeuanganMiddleware.php
public function handle($request, Closure $next)
{
    if (auth()->check() && auth()->user()->role_type === 'keuangan') {
        return $next($request);
    }
    return response('Unauthorized', 403);
}
```

**B. Create Policies (Laravel):**

```php
// app/Policies/SchedulePolicy.php
public function view(User $user, Schedule $schedule)
{
    return $user->role_type === 'kurikulum';
}

public function create(User $user)
{
    return $user->role_type === 'kurikulum';
}

public function update(User $user, Schedule $schedule)
{
    return $user->role_type === 'kurikulum';
}
```

#### 4.2 Data Visibility Rules

**Dokumentasi siapa bisa melihat apa:**

| Data | Admin | Kurikulum | Keuangan |
|------|-------|-----------|----------|
| Siswa - Nama, ID | READ | READ | READ |
| Siswa - Alamat, Kontak | READ | - | - |
| Nilai Siswa | - | CRUD | READ |
| Pembayaran Siswa | - | READ | CRUD |
| Laporan Keuangan | - | - | CRUD |

#### 4.3 Audit & Logging

```php
// Catat setiap perubahan data
public function store(Request $request)
{
    $data = $request->validated();
    $model = Model::create($data);
    
    Log::channel('audit')->info('Created Schedule', [
        'user_id' => auth()->id(),
        'user_role' => auth()->user()->role_type,
        'module' => 'kurikulum.schedule',
        'action' => 'CREATE',
        'data' => $model->toArray()
    ]);
    
    return redirect()->back()->with('success', 'Data berhasil ditambahkan');
}
```

---

### **FASE 5: TESTING (2-3 Minggu)**

#### 5.1 Unit Testing

```php
// tests/Feature/Kurikulum/ScheduleTest.php
public function test_kurikulum_can_create_schedule()
{
    $user = User::factory()->create(['role_type' => 'kurikulum']);
    $this->actingAs($user);
    
    $response = $this->post('/kurikulum/schedules', [
        'class_id' => 1,
        'subject_id' => 1,
        // ... other fields
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('schedules', ['class_id' => 1]);
}

public function test_admin_cannot_access_kurikulum_schedule()
{
    $user = User::factory()->create(['role_type' => 'admin']);
    $this->actingAs($user);
    
    $response = $this->get('/kurikulum/schedules');
    $response->assertStatus(403);
}
```

#### 5.2 Integration Testing

- [ ] Test workflow Jadwal → Absen → Nilai → Rapot
- [ ] Test sharing data antar role
- [ ] Test data integrity setelah pemindahan
- [ ] Test import/export functionality

#### 5.3 User Acceptance Testing (UAT)

- [ ] Test dengan user admin
- [ ] Test dengan user kurikulum
- [ ] Test dengan user keuangan
- [ ] Verify business logic sesuai kebutuhan

---

### **FASE 6: MIGRATION DATA (1 Minggu)**

#### 6.1 Data Migration Scripts

```php
// database/seeders/RoleAssignmentSeeder.php
public function run()
{
    // Assign role ke existing users
    User::where('is_admin', true)->update(['role_type' => 'admin']);
    User::where('is_kurikulum', true)->update(['role_type' => 'kurikulum']);
    User::where('is_keuangan', true)->update(['role_type' => 'keuangan']);
}
```

#### 6.2 Backup & Rollback Plan

- [ ] Backup production database sebelum migration
- [ ] Test rollback scenario
- [ ] Create restore documentation
- [ ] Have rollback time < 30 minutes

---

### **FASE 7: DEPLOYMENT & GO-LIVE (1 Minggu)**

#### 7.1 Pre-Launch Checklist

- [ ] Semua module sudah ditest
- [ ] Documentation updated
- [ ] User manual/training created
- [ ] Database backed up
- [ ] Performance tested
- [ ] Security audit passed

#### 7.2 Deployment Steps

1. **Development** → Stage (test with real data)
2. **Stage** → Production (in business hours)
3. **Monitor** logs dan error reporting
4. **Support team** on standby

#### 7.3 User Training

- [ ] Training materials created
- [ ] Video tutorials recorded
- [ ] Quick reference guides printed
- [ ] Support desk briefed

#### 7.4 Post-Launch Support (2 Minggu)

- [ ] Monitor system 24/7
- [ ] Quick bug fixes
- [ ] User feedback collection
- [ ] Performance optimization

---

## 📊 DISTRIBUSI MODUL FINAL

### **Module Admin**
```
✓ Data Siswa dan Kelas
✓ Data Guru & Staff
✓ Kelas dan Wali Kelas
✓ Mata Pelajaran
✓ Bimbingan Belajar
✓ Pengumuman
✓ Manajemen Multimedia
✓ Manajemen AI
✓ Pengaturan
```

### **Module Kurikulum**
```
✓ Jadwal
✓ Absen
✓ Jadwal Ujian
✓ Manajemen Nilai
✓ Rapot
✓ Naik Kelas
```

### **Module Keuangan**
```
✓ Keuangan Sekolah
✓ Tabungan Siswa
✓ Laporan (Finance Reports)
```

---

## ⏱️ TIMELINE ESTIMASI

| Fase | Durasi | Mulai | Selesai |
|------|--------|-------|---------|
| 1. Perencanaan | 1-2 minggu | Week 1 | Week 2 |
| 2. Infrastructure | 1-2 minggu | Week 2 | Week 4 |
| 3. Development | 3-4 minggu | Week 4 | Week 8 |
| 4. Authorization | 2 minggu | Week 8 | Week 10 |
| 5. Testing | 2-3 minggu | Week 10 | Week 13 |
| 6. Migration Data | 1 minggu | Week 13 | Week 14 |
| 7. Go-Live | 1 minggu | Week 14 | Week 15 |
| **Total** | **~15 minggu** | | |

---

## 📝 DOKUMEN YANG HARUS DIBUAT

1. **Database Schema Documentation** - Tabel, relationships, permissions
2. **API Documentation** - Endpoints per role
3. **User Manual** - Untuk setiap role (Admin, Kurikulum, Keuangan)
4. **System Architecture Diagram** - Visualisasi role & permissions
5. **Migration Guide** - Step-by-step untuk data migration
6. **Troubleshooting Guide** - Common issues & solutions
7. **Audit Trail Documentation** - Logging & reporting

---

## 🔒 SECURITY CONSIDERATIONS

- [ ] Implement CSRF protection
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting per endpoint
- [ ] API key rotation (jika ada external API)
- [ ] Encrypt sensitive data (password, finance data)
- [ ] Implement 2FA untuk critical users
- [ ] Regular security audit

---

## 📈 SUCCESS METRICS

- ✅ 0 critical bugs post-launch
- ✅ 99.5% system uptime
- ✅ User adoption rate > 90%
- ✅ Average response time < 2 detik
- ✅ Data integrity 100%
- ✅ Zero unauthorized access incidents

---

**Status:** Ready for Phase 1
**Last Updated:** 2026
**Owner:** Development Team
