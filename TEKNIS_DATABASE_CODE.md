# DOKUMENTASI TEKNIS IMPLEMENTASI
## Database Schema & Code Structure

---

## 1️⃣ DATABASE MIGRATION

### **Migration 1: Add Role Type to Users**

```php
// database/migrations/2024_01_XX_add_role_type_to_users.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoleTypeToUsers extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Pilih satu: ENUM atau Foreign Key
            
            // Option 1: ENUM (simple)
            $table->enum('role_type', ['admin', 'kurikulum', 'keuangan'])
                  ->default('admin')
                  ->after('password');
            
            // Option 2: Foreign Key (scalable)
            // $table->unsignedBigInteger('role_id')->nullable();
            // $table->foreign('role_id')->references('id')->on('roles');
            
            // Tracking columns
            $table->string('created_by_role')->nullable();
            $table->unsignedBigInteger('created_by_user_id')->nullable();
            $table->timestamp('role_assigned_at')->nullable();
            
            // Status tracking
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role_type', 'created_by_role', 'created_by_user_id', 
                              'role_assigned_at', 'is_active', 'last_login_at']);
        });
    }
}
```

### **Migration 2: Create Audit Logs Table**

```php
// database/migrations/2024_01_XX_create_audit_logs_table.php

public function up()
{
    Schema::create('audit_logs', function (Blueprint $table) {
        $table->id();
        $table->string('action'); // CREATE, READ, UPDATE, DELETE
        $table->string('module'); // kurikulum.schedules, keuangan.finance, etc
        $table->string('table_name');
        $table->unsignedBigInteger('record_id')->nullable();
        $table->unsignedBigInteger('user_id')->nullable();
        $table->string('user_role');
        $table->json('old_values')->nullable();
        $table->json('new_values')->nullable();
        $table->string('ip_address')->nullable();
        $table->text('user_agent')->nullable();
        $table->enum('status', ['success', 'failed', 'unauthorized'])->default('success');
        $table->text('error_message')->nullable();
        $table->timestamps();
        
        // Indexes untuk performa
        $table->index('user_id');
        $table->index('module');
        $table->index('table_name');
        $table->index('user_role');
        $table->index('created_at');
    });
}
```

### **Migration 3: Add Tracking Columns ke Tabel Penting**

```php
// database/migrations/2024_01_XX_add_tracking_columns.php

public function up()
{
    // Schedule table
    Schema::table('schedules', function (Blueprint $table) {
        $table->unsignedBigInteger('created_by_kurikulum_id')->after('id');
        $table->unsignedBigInteger('updated_by_kurikulum_id')->nullable();
        $table->string('status')->default('active'); // active, archived, deleted
        $table->timestamps();
        $table->softDeletes();
    });

    // Attendance table
    Schema::table('attendance', function (Blueprint $table) {
        $table->unsignedBigInteger('recorded_by_kurikulum_id')->after('id');
        $table->timestamps();
        $table->softDeletes();
    });

    // Grades table
    Schema::table('grades', function (Blueprint $table) {
        $table->unsignedBigInteger('input_by_kurikulum_id')->after('id');
        $table->unsignedBigInteger('verified_by_kurikulum_id')->nullable();
        $table->timestamp('verified_at')->nullable();
        $table->string('status')->default('draft'); // draft, submitted, verified, locked
        $table->timestamps();
        $table->softDeletes();
    });

    // School Finance table
    Schema::table('school_finances', function (Blueprint $table) {
        $table->unsignedBigInteger('created_by_keuangan_id')->after('id');
        $table->unsignedBigInteger('approved_by_admin_id')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->string('status')->default('draft'); // draft, pending_approval, approved, rejected
        $table->timestamps();
        $table->softDeletes();
    });

    // Student Savings table
    Schema::table('student_savings', function (Blueprint $table) {
        $table->unsignedBigInteger('managed_by_keuangan_id')->after('id');
        $table->timestamps();
        $table->softDeletes();
    });
}
```

### **Migration 4: Create Role Permissions Table (Optional - untuk flexibility)**

```php
// database/migrations/2024_01_XX_create_role_permissions_table.php

public function up()
{
    // Roles table
    Schema::create('roles', function (Blueprint $table) {
        $table->id();
        $table->string('name')->unique(); // admin, kurikulum, keuangan
        $table->string('display_name');
        $table->text('description')->nullable();
        $table->json('permissions'); // Stored as JSON
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });

    // Seed default roles
    DB::table('roles')->insert([
        [
            'name' => 'admin',
            'display_name' => 'Administrator',
            'description' => 'System Administrator dengan akses penuh',
            'permissions' => json_encode(['admin.*']),
            'is_active' => true,
        ],
        [
            'name' => 'kurikulum',
            'display_name' => 'Kurikulum',
            'description' => 'Manager Akademik & Pembelajaran',
            'permissions' => json_encode([
                'kurikulum.schedules.create',
                'kurikulum.schedules.read',
                'kurikulum.schedules.update',
                'kurikulum.schedules.delete',
                'kurikulum.attendance.*',
                'kurikulum.grades.*',
                'kurikulum.reportcards.*',
                'kurikulum.promotions.*',
            ]),
            'is_active' => true,
        ],
        [
            'name' => 'keuangan',
            'display_name' => 'Keuangan',
            'description' => 'Manager Keuangan Sekolah',
            'permissions' => json_encode([
                'keuangan.finance.*',
                'keuangan.savings.*',
                'keuangan.reports.*',
                'keuangan.invoices.*',
                'keuangan.payments.*',
            ]),
            'is_active' => true,
        ],
    ]);

    // User Roles table (pivot)
    Schema::create('user_roles', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->unsignedBigInteger('role_id');
        $table->timestamp('assigned_at')->useCurrent();
        $table->unsignedBigInteger('assigned_by_user_id')->nullable();
        $table->timestamps();
        
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        $table->foreign('assigned_by_user_id')->references('id')->on('users')->onNullDelete();
        
        $table->unique(['user_id', 'role_id']);
    });
}
```

---

## 2️⃣ MODEL UPDATES

### **User Model Update**

```php
// app/Models/User.php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_type', // 'admin', 'kurikulum', 'keuangan'
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    // Helper Methods
    public function isAdmin()
    {
        return $this->role_type === 'admin';
    }

    public function isKurikulum()
    {
        return $this->role_type === 'kurikulum';
    }

    public function isKeuangan()
    {
        return $this->role_type === 'keuangan';
    }

    public function hasRole($role)
    {
        return $this->role_type === $role;
    }

    public function hasPermission($permission)
    {
        // Check if user has specific permission
        $role = Role::where('name', $this->role_type)->first();
        return $role && in_array($permission, $role->permissions);
    }

    public function canAccess($module)
    {
        $accessMap = [
            'admin' => [
                'students', 'teachers', 'classes', 'subjects', 'announcements',
                'multimedia', 'ai', 'settings', 'schedules', 'attendance',
                'grades', 'reportcards', 'promotions', 'finance', 'savings'
            ],
            'kurikulum' => [
                'schedules', 'attendance', 'grades', 'reportcards', 
                'promotions', 'students', 'teachers', 'classes', 'subjects'
            ],
            'keuangan' => [
                'finance', 'savings', 'reports', 'invoices', 'students', 'teachers'
            ],
        ];

        return in_array($module, $accessMap[$this->role_type] ?? []);
    }
}
```

### **Schedule Model (Kurikulum)**

```php
// app/Models/Kurikulum/Schedule.php

namespace App\Models\Kurikulum;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use SoftDeletes;

    protected $table = 'schedules';

    protected $fillable = [
        'class_id',
        'subject_id',
        'teacher_id',
        'day',
        'start_time',
        'end_time',
        'room',
        'created_by_kurikulum_id',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Relationships
    public function class()
    {
        return $this->belongsTo(\App\Models\ClassModel::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(\App\Models\Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(\App\Models\Teacher::class);
    }

    public function createdByKurikulum()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by_kurikulum_id');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    // Methods
    public function hasConflict()
    {
        return Schedule::where('room', $this->room)
            ->where('day', $this->day)
            ->where('id', '!=', $this->id)
            ->whereRaw('NOT (end_time <= ? OR start_time >= ?)', 
                      [$this->start_time, $this->end_time])
            ->exists();
    }
}
```

### **Grade Model (Kurikulum)**

```php
// app/Models/Kurikulum/Grade.php

namespace App\Models\Kurikulum;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grade extends Model
{
    use SoftDeletes;

    protected $table = 'grades';

    protected $fillable = [
        'student_id',
        'subject_id',
        'class_id',
        'daily_score',
        'midterm_score',
        'final_score',
        'total_score',
        'grade', // A, B, C, D, E
        'notes',
        'input_by_kurikulum_id',
        'verified_by_kurikulum_id',
        'verified_at',
        'status', // draft, submitted, verified, locked
    ];

    protected $casts = [
        'daily_score' => 'float',
        'midterm_score' => 'float',
        'final_score' => 'float',
        'total_score' => 'float',
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(\App\Models\Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(\App\Models\Subject::class);
    }

    public function class()
    {
        return $this->belongsTo(\App\Models\ClassModel::class);
    }

    public function inputBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'input_by_kurikulum_id');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by_kurikulum_id');
    }

    // Scopes
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function scopeForClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified')->orWhere('status', 'locked');
    }

    // Methods
    public function calculateTotal()
    {
        // Example: total = (daily * 0.3) + (midterm * 0.35) + (final * 0.35)
        $this->total_score = round(
            ($this->daily_score * 0.3) + 
            ($this->midterm_score * 0.35) + 
            ($this->final_score * 0.35),
            2
        );
        
        $this->grade = $this->getGradeFromScore($this->total_score);
        return $this;
    }

    private function getGradeFromScore($score)
    {
        if ($score >= 85) return 'A';
        if ($score >= 75) return 'B';
        if ($score >= 65) return 'C';
        if ($score >= 55) return 'D';
        return 'E';
    }

    public function isLocked()
    {
        return $this->status === 'locked';
    }
}
```

### **SchoolFinance Model (Keuangan)**

```php
// app/Models/Keuangan/SchoolFinance.php

namespace App\Models\Keuangan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolFinance extends Model
{
    use SoftDeletes;

    protected $table = 'school_finances';

    protected $fillable = [
        'fiscal_year',
        'item_description',
        'category', // income, expense, adjustment
        'amount',
        'reference_number',
        'notes',
        'created_by_keuangan_id',
        'approved_by_admin_id',
        'approved_at',
        'status', // draft, pending_approval, approved, rejected
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function createdByKeuangan()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by_keuangan_id');
    }

    public function approvedByAdmin()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by_admin_id');
    }

    // Scopes
    public function scopeIncome($query)
    {
        return $query->where('category', 'income');
    }

    public function scopeExpense($query)
    {
        return $query->where('category', 'expense');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeByYear($query, $year)
    {
        return $query->where('fiscal_year', $year);
    }

    // Methods
    public function approve($adminId)
    {
        $this->status = 'approved';
        $this->approved_by_admin_id = $adminId;
        $this->approved_at = now();
        return $this->save();
    }

    public function reject($reason = null)
    {
        $this->status = 'rejected';
        $this->notes = ($this->notes ?? '') . "\nRejected: " . $reason;
        return $this->save();
    }
}
```

---

## 3️⃣ MIDDLEWARE

### **Create Admin Middleware**

```php
// app/Http/Middleware/AdminMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return redirect('login');
        }

        if (auth()->user()->role_type !== 'admin') {
            \Log::warning('Unauthorized access attempt', [
                'user_id' => auth()->id(),
                'role' => auth()->user()->role_type,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
            ]);
            
            return response()->view('errors.unauthorized', [], 403);
        }

        return $next($request);
    }
}
```

### **Create Kurikulum Middleware**

```php
// app/Http/Middleware/KurikulumMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class KurikulumMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return redirect('login');
        }

        if (auth()->user()->role_type !== 'kurikulum') {
            \Log::warning('Unauthorized Kurikulum access attempt', [
                'user_id' => auth()->id(),
                'role' => auth()->user()->role_type,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
            ]);
            
            return response()->view('errors.unauthorized', [], 403);
        }

        // Set context untuk database queries
        \Auth::user()->setAttribute('current_module', 'kurikulum');

        return $next($request);
    }
}
```

### **Create Keuangan Middleware**

```php
// app/Http/Middleware/KeuanganMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class KeuanganMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check()) {
            return redirect('login');
        }

        if (auth()->user()->role_type !== 'keuangan') {
            \Log::warning('Unauthorized Keuangan access attempt', [
                'user_id' => auth()->id(),
                'role' => auth()->user()->role_type,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
            ]);
            
            return response()->view('errors.unauthorized', [], 403);
        }

        \Auth::user()->setAttribute('current_module', 'keuangan');

        return $next($request);
    }
}
```

### **Register Middleware di Kernel**

```php
// app/Http/Kernel.php

protected $routeMiddleware = [
    // ... existing middleware
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
    'kurikulum' => \App\Http\Middleware\KurikulumMiddleware::class,
    'keuangan' => \App\Http\Middleware\KeuanganMiddleware::class,
];
```

---

## 4️⃣ ROUTES STRUCTURE

### **Admin Routes**

```php
// routes/admin.php

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', 'Admin\DashboardController@index')->name('dashboard');
    
    // Master Data
    Route::resource('students', 'Admin\StudentController');
    Route::resource('teachers', 'Admin\TeacherController');
    Route::resource('classes', 'Admin\ClassController');
    Route::resource('subjects', 'Admin\SubjectController');
    
    // Admin-specific
    Route::resource('announcements', 'Admin\AnnouncementController');
    Route::resource('multimedia', 'Admin\MultimediaController');
    Route::resource('ai-settings', 'Admin\AiSettingController');
    Route::resource('settings', 'Admin\SettingController');
    
    // Guidance & Counseling
    Route::resource('guidance', 'Admin\GuidanceController');
    
    // Read-only views of other modules
    Route::get('kurikulum-schedules', 'Admin\ViewOnlyController@schedules')->name('kurikulum-schedules');
    Route::get('kurikulum-grades', 'Admin\ViewOnlyController@grades')->name('kurikulum-grades');
    Route::get('keuangan-finance', 'Admin\ViewOnlyController@finance')->name('keuangan-finance');
});
```

### **Kurikulum Routes**

```php
// routes/kurikulum.php

Route::middleware(['auth', 'kurikulum'])->prefix('kurikulum')->name('kurikulum.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', 'Kurikulum\DashboardController@index')->name('dashboard');
    
    // Academic Modules
    Route::resource('schedules', 'Kurikulum\ScheduleController');
    Route::resource('attendance', 'Kurikulum\AttendanceController');
    Route::resource('exam-schedules', 'Kurikulum\ExamScheduleController');
    Route::resource('grades', 'Kurikulum\GradeController');
    Route::resource('report-cards', 'Kurikulum\ReportCardController');
    Route::resource('promotions', 'Kurikulum\PromotionController');
    
    // Additional academic routes
    Route::post('grades/{grade}/verify', 'Kurikulum\GradeController@verify')->name('grades.verify');
    Route::post('grades/{grade}/lock', 'Kurikulum\GradeController@lock')->name('grades.lock');
    Route::get('schedules/check-conflicts', 'Kurikulum\ScheduleController@checkConflicts');
    
    // Reports
    Route::get('reports/attendance', 'Kurikulum\ReportController@attendance')->name('reports.attendance');
    Route::get('reports/grades', 'Kurikulum\ReportController@grades')->name('reports.grades');
    Route::get('reports/summary', 'Kurikulum\ReportController@summary')->name('reports.summary');
    
    // Export
    Route::get('export/grades', 'Kurikulum\ExportController@grades')->name('export.grades');
    Route::get('export/attendance', 'Kurikulum\ExportController@attendance')->name('export.attendance');
    Route::get('export/reportcard/{reportcard}', 'Kurikulum\ExportController@reportcard')->name('export.reportcard');
});
```

### **Keuangan Routes**

```php
// routes/keuangan.php

Route::middleware(['auth', 'keuangan'])->prefix('keuangan')->name('keuangan.')->group(function () {
    
    // Dashboard
    Route::get('/dashboard', 'Keuangan\DashboardController@index')->name('dashboard');
    
    // Financial Modules
    Route::resource('finance', 'Keuangan\SchoolFinanceController');
    Route::resource('savings', 'Keuangan\StudentSavingsController');
    Route::resource('invoices', 'Keuangan\InvoiceController');
    Route::resource('payments', 'Keuangan\PaymentController');
    
    // Finance Actions
    Route::post('finance/{finance}/approve', 'Keuangan\SchoolFinanceController@approve')
         ->name('finance.approve');
    Route::post('finance/{finance}/reject', 'Keuangan\SchoolFinanceController@reject')
         ->name('finance.reject');
    
    // Reports
    Route::get('reports/income', 'Keuangan\ReportController@income')->name('reports.income');
    Route::get('reports/expense', 'Keuangan\ReportController@expense')->name('reports.expense');
    Route::get('reports/cash-flow', 'Keuangan\ReportController@cashFlow')->name('reports.cash-flow');
    Route::get('reports/student-debt', 'Keuangan\ReportController@studentDebt')->name('reports.student-debt');
    
    // Export
    Route::get('export/finance', 'Keuangan\ExportController@finance')->name('export.finance');
    Route::get('export/invoice/{invoice}', 'Keuangan\ExportController@invoice')->name('export.invoice');
    Route::get('export/report', 'Keuangan\ExportController@report')->name('export.report');
});
```

### **Register Routes di web.php**

```php
// routes/web.php

Route::get('/', 'HomeController@index')->name('home');
Route::post('/login', 'AuthController@login')->name('login');
Route::post('/logout', 'AuthController@logout')->name('logout');

// Role-based routing
Route::middleware('auth')->group(function () {
    require __DIR__ . '/admin.php';
    require __DIR__ . '/kurikulum.php';
    require __DIR__ . '/keuangan.php';
});
```

---

## 5️⃣ FOLDER STRUCTURE

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Admin/
│   │   │   ├── DashboardController.php
│   │   │   ├── StudentController.php
│   │   │   ├── TeacherController.php
│   │   │   ├── ClassController.php
│   │   │   ├── SubjectController.php
│   │   │   ├── AnnouncementController.php
│   │   │   ├── MultimediaController.php
│   │   │   ├── AiSettingController.php
│   │   │   ├── SettingController.php
│   │   │   ├── GuidanceController.php
│   │   │   └── ViewOnlyController.php
│   │   ├── Kurikulum/
│   │   │   ├── DashboardController.php
│   │   │   ├── ScheduleController.php
│   │   │   ├── AttendanceController.php
│   │   │   ├── ExamScheduleController.php
│   │   │   ├── GradeController.php
│   │   │   ├── ReportCardController.php
│   │   │   ├── PromotionController.php
│   │   │   ├── ReportController.php
│   │   │   └── ExportController.php
│   │   └── Keuangan/
│   │       ├── DashboardController.php
│   │       ├── SchoolFinanceController.php
│   │       ├── StudentSavingsController.php
│   │       ├── InvoiceController.php
│   │       ├── PaymentController.php
│   │       ├── ReportController.php
│   │       └── ExportController.php
│   ├── Middleware/
│   │   ├── AdminMiddleware.php
│   │   ├── KurikulumMiddleware.php
│   │   ├── KeuanganMiddleware.php
│   │   └── RoleMiddleware.php
│   └── Requests/
│       ├── Admin/
│       │   ├── StoreStudentRequest.php
│       │   └── UpdateStudentRequest.php
│       ├── Kurikulum/
│       │   ├── StoreScheduleRequest.php
│       │   └── StoreGradeRequest.php
│       └── Keuangan/
│           ├── StoreFinanceRequest.php
│           └── StorePaymentRequest.php
├── Models/
│   ├── User.php (updated)
│   ├── Role.php
│   ├── AuditLog.php
│   ├── Admin/
│   │   ├── Student.php
│   │   ├── Teacher.php
│   │   ├── ClassModel.php
│   │   ├── Subject.php
│   │   ├── Announcement.php
│   │   └── Guidance.php
│   ├── Kurikulum/
│   │   ├── Schedule.php
│   │   ├── Attendance.php
│   │   ├── ExamSchedule.php
│   │   ├── Grade.php
│   │   ├── ReportCard.php
│   │   └── GradePromotion.php
│   └── Keuangan/
│       ├── SchoolFinance.php
│       ├── StudentSavings.php
│       ├── Invoice.php
│       └── Payment.php
├── Policies/
│   ├── SchedulePolicy.php
│   ├── GradePolicy.php
│   ├── SchoolFinancePolicy.php
│   └── AuditLogPolicy.php
├── Services/
│   ├── Kurikulum/
│   │   ├── ScheduleService.php
│   │   ├── AttendanceService.php
│   │   ├── GradeService.php
│   │   └── ReportCardService.php
│   └── Keuangan/
│       ├── FinanceService.php
│       ├── InvoiceService.php
│       └── ReportService.php
└── Repositories/
    ├── Admin/
    │   ├── StudentRepository.php
    │   └── TeacherRepository.php
    ├── Kurikulum/
    │   ├── ScheduleRepository.php
    │   └── GradeRepository.php
    └── Keuangan/
        ├── FinanceRepository.php
        └── SavingsRepository.php

resources/
└── views/
    ├── layouts/
    │   ├── admin-layout.blade.php
    │   ├── kurikulum-layout.blade.php
    │   └── keuangan-layout.blade.php
    ├── admin/
    │   ├── dashboard.blade.php
    │   ├── students/
    │   ├── teachers/
    │   ├── classes/
    │   └── ...
    ├── kurikulum/
    │   ├── dashboard.blade.php
    │   ├── schedules/
    │   ├── attendance/
    │   ├── grades/
    │   └── ...
    └── keuangan/
        ├── dashboard.blade.php
        ├── finance/
        ├── invoices/
        └── ...

database/
└── migrations/
    ├── 2024_01_XX_add_role_type_to_users.php
    ├── 2024_01_XX_create_audit_logs_table.php
    ├── 2024_01_XX_add_tracking_columns.php
    └── 2024_01_XX_create_role_permissions_table.php
```

---

## 6️⃣ EXAMPLE CONTROLLER

### **ScheduleController (Kurikulum)**

```php
// app/Http/Controllers/Kurikulum/ScheduleController.php

namespace App\Http\Controllers\Kurikulum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kurikulum\StoreScheduleRequest;
use App\Models\Kurikulum\Schedule;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('kurikulum');
        $this->authorizeResource(Schedule::class);
    }

    public function index()
    {
        $schedules = Schedule::with(['class', 'subject', 'teacher'])->paginate(15);
        return view('kurikulum.schedules.index', compact('schedules'));
    }

    public function create()
    {
        $classes = ClassModel::all();
        $subjects = Subject::all();
        $teachers = Teacher::all();
        
        return view('kurikulum.schedules.create', compact('classes', 'subjects', 'teachers'));
    }

    public function store(StoreScheduleRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by_kurikulum_id'] = auth()->id();

        $schedule = Schedule::create($validated);

        // Log audit
        AuditLog::create([
            'action' => 'CREATE',
            'module' => 'kurikulum.schedules',
            'table_name' => 'schedules',
            'record_id' => $schedule->id,
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role_type,
            'new_values' => json_encode($validated),
            'ip_address' => request()->ip(),
            'status' => 'success',
        ]);

        return redirect()
            ->route('kurikulum.schedules.show', $schedule)
            ->with('success', 'Jadwal berhasil ditambahkan');
    }

    public function show(Schedule $schedule)
    {
        return view('kurikulum.schedules.show', compact('schedule'));
    }

    public function edit(Schedule $schedule)
    {
        if ($schedule->hasConflict()) {
            return redirect()
                ->back()
                ->with('warning', 'Jadwal ini memiliki bentrokan dengan jadwal lain');
        }

        $classes = ClassModel::all();
        $subjects = Subject::all();
        $teachers = Teacher::all();

        return view('kurikulum.schedules.edit', 
            compact('schedule', 'classes', 'subjects', 'teachers'));
    }

    public function update(StoreScheduleRequest $request, Schedule $schedule)
    {
        $oldValues = $schedule->toArray();
        $validated = $request->validated();

        $schedule->update($validated);

        // Log audit dengan perubahan
        AuditLog::create([
            'action' => 'UPDATE',
            'module' => 'kurikulum.schedules',
            'table_name' => 'schedules',
            'record_id' => $schedule->id,
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role_type,
            'old_values' => json_encode($oldValues),
            'new_values' => json_encode($validated),
            'ip_address' => request()->ip(),
            'status' => 'success',
        ]);

        return redirect()
            ->route('kurikulum.schedules.show', $schedule)
            ->with('success', 'Jadwal berhasil diubah');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        AuditLog::create([
            'action' => 'DELETE',
            'module' => 'kurikulum.schedules',
            'table_name' => 'schedules',
            'record_id' => $schedule->id,
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role_type,
            'old_values' => json_encode($schedule->toArray()),
            'ip_address' => request()->ip(),
            'status' => 'success',
        ]);

        return redirect()
            ->route('kurikulum.schedules.index')
            ->with('success', 'Jadwal berhasil dihapus');
    }

    public function checkConflicts(Request $request)
    {
        $conflicts = Schedule::where('room', $request->room)
            ->where('day', $request->day)
            ->whereRaw('NOT (end_time <= ? OR start_time >= ?)',
                      [$request->start_time, $request->end_time])
            ->get(['id', 'start_time', 'end_time', 'class_id']);

        return response()->json(['conflicts' => $conflicts]);
    }
}
```

---

**Total Code Length: Comprehensive Technical Documentation**
**Ready for: Implementation & Development**
