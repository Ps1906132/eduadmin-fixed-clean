# CONTOH IMPLEMENTASI KODE SIAP PAKAI
## Copy-Paste Ready Code Snippets

---

## 1️⃣ AUDIT LOG TRAIT (Reusable)

```php
// app/Traits/AuditableTrait.php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

trait AuditableTrait
{
    /**
     * Boot the trait
     */
    public static function bootAuditableTrait()
    {
        static::created(function (Model $model) {
            static::logAudit('CREATE', $model, null, $model->toArray());
        });

        static::updated(function (Model $model) {
            $original = $model->getOriginal();
            $changes = $model->getDirty();
            
            static::logAudit('UPDATE', $model, $original, $changes);
        });

        static::deleted(function (Model $model) {
            static::logAudit('DELETE', $model, $model->toArray(), null);
        });

        static::restored(function (Model $model) {
            static::logAudit('RESTORE', $model, null, $model->toArray());
        });
    }

    /**
     * Log audit trail
     */
    protected static function logAudit($action, Model $model, $oldValues, $newValues)
    {
        try {
            AuditLog::create([
                'action' => $action,
                'module' => static::getModuleName(),
                'table_name' => $model->getTable(),
                'record_id' => $model->id,
                'user_id' => auth()->id(),
                'user_role' => auth()->user()->role_type ?? 'system',
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'status' => 'success',
            ]);
        } catch (\Exception $e) {
            \Log::error('Audit Log Error: ' . $e->getMessage());
        }
    }

    /**
     * Get module name from controller
     */
    public static function getModuleName()
    {
        $class = static::class;
        
        if (strpos($class, 'Kurikulum') !== false) {
            return 'kurikulum.' . strtolower(class_basename($class));
        } elseif (strpos($class, 'Keuangan') !== false) {
            return 'keuangan.' . strtolower(class_basename($class));
        } else {
            return 'admin.' . strtolower(class_basename($class));
        }
    }
}
```

**Gunakan di Model:**
```php
class Schedule extends Model
{
    use AuditableTrait;
    // ... rest of model
}
```

---

## 2️⃣ FORM REQUEST VALIDATION (Reusable)

```php
// app/Http/Requests/Kurikulum/StoreScheduleRequest.php

namespace App\Http\Requests\Kurikulum;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && auth()->user()->isKurikulum();
    }

    public function rules()
    {
        return [
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'required|string|max:50',
        ];
    }

    public function messages()
    {
        return [
            'class_id.required' => 'Kelas harus dipilih',
            'class_id.exists' => 'Kelas tidak ditemukan',
            'subject_id.required' => 'Mata pelajaran harus dipilih',
            'teacher_id.required' => 'Guru harus dipilih',
            'day.required' => 'Hari harus dipilih',
            'day.in' => 'Hari tidak valid',
            'start_time.required' => 'Waktu mulai harus diisi',
            'start_time.date_format' => 'Format waktu mulai tidak valid (HH:MM)',
            'end_time.required' => 'Waktu selesai harus diisi',
            'end_time.date_format' => 'Format waktu selesai tidak valid (HH:MM)',
            'end_time.after' => 'Waktu selesai harus lebih dari waktu mulai',
            'room.required' => 'Ruangan harus diisi',
        ];
    }
}
```

---

## 3️⃣ AUTHORIZATION POLICY

```php
// app/Policies/SchedulePolicy.php

namespace App\Policies;

use App\Models\User;
use App\Models\Kurikulum\Schedule;

class SchedulePolicy
{
    /**
     * Determine if user can view the schedule
     */
    public function view(User $user, Schedule $schedule)
    {
        // Kurikulum atau Admin bisa view
        return $user->isKurikulum() || $user->isAdmin();
    }

    /**
     * Determine if user can create
     */
    public function create(User $user)
    {
        return $user->isKurikulum();
    }

    /**
     * Determine if user can update
     */
    public function update(User $user, Schedule $schedule)
    {
        // Only kurikulum yang create bisa update, atau admin
        return $user->isAdmin() || 
               ($user->isKurikulum() && $schedule->created_by_kurikulum_id === $user->id);
    }

    /**
     * Determine if user can delete
     */
    public function delete(User $user, Schedule $schedule)
    {
        // Only kurikulum yang create bisa delete, atau admin
        return $user->isAdmin() || 
               ($user->isKurikulum() && $schedule->created_by_kurikulum_id === $user->id);
    }

    /**
     * Determine if user can restore
     */
    public function restore(User $user, Schedule $schedule)
    {
        return $user->isAdmin();
    }

    /**
     * Determine if user can permanently delete
     */
    public function forceDelete(User $user, Schedule $schedule)
    {
        return $user->isAdmin();
    }
}
```

**Register di AuthServiceProvider:**
```php
protected $policies = [
    Schedule::class => SchedulePolicy::class,
    Grade::class => GradePolicy::class,
    SchoolFinance::class => SchoolFinancePolicy::class,
];
```

---

## 4️⃣ CONTROLLER DENGAN AUTHORIZATION

```php
// app/Http/Controllers/Kurikulum/ScheduleController.php

namespace App\Http\Controllers\Kurikulum;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kurikulum\StoreScheduleRequest;
use App\Models\Kurikulum\Schedule;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Teacher;

class ScheduleController extends Controller
{
    public function __construct()
    {
        // Verify auth dan role
        $this->middleware('auth');
        $this->middleware('kurikulum');
        
        // Authorize resource actions
        $this->authorizeResource(Schedule::class);
    }

    /**
     * Display a listing of schedules
     */
    public function index()
    {
        $schedules = Schedule::with(['class', 'subject', 'teacher'])
            ->orderBy('day')
            ->orderBy('start_time')
            ->paginate(15);

        return view('kurikulum.schedules.index', compact('schedules'));
    }

    /**
     * Show form to create new schedule
     */
    public function create()
    {
        $classes = ClassModel::active()->get();
        $subjects = Subject::active()->get();
        $teachers = Teacher::active()->get();

        return view('kurikulum.schedules.create', compact('classes', 'subjects', 'teachers'));
    }

    /**
     * Store a new schedule
     */
    public function store(StoreScheduleRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by_kurikulum_id'] = auth()->id();

        // Check untuk conflict sebelum save
        $conflict = Schedule::where('room', $validated['room'])
            ->where('day', $validated['day'])
            ->whereRaw('NOT (end_time <= ? OR start_time >= ?)',
                      [$validated['start_time'], $validated['end_time']])
            ->first();

        if ($conflict) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Ruangan ini sudah digunakan pada waktu tersebut');
        }

        $schedule = Schedule::create($validated);

        return redirect()
            ->route('kurikulum.schedules.show', $schedule)
            ->with('success', 'Jadwal berhasil ditambahkan');
    }

    /**
     * Show schedule detail
     */
    public function show(Schedule $schedule)
    {
        $schedule->load(['class', 'subject', 'teacher', 'attendance']);

        return view('kurikulum.schedules.show', compact('schedule'));
    }

    /**
     * Show form to edit schedule
     */
    public function edit(Schedule $schedule)
    {
        // Verify user authorized (via policy)
        $this->authorize('update', $schedule);

        // Check if has attendance records (prevent edit jika sudah ada absen)
        if ($schedule->attendance()->exists()) {
            return redirect()
                ->back()
                ->with('error', 'Tidak bisa mengedit jadwal yang sudah memiliki data absensi');
        }

        $classes = ClassModel::active()->get();
        $subjects = Subject::active()->get();
        $teachers = Teacher::active()->get();

        return view('kurikulum.schedules.edit', 
            compact('schedule', 'classes', 'subjects', 'teachers'));
    }

    /**
     * Update schedule
     */
    public function update(StoreScheduleRequest $request, Schedule $schedule)
    {
        // Verify user authorized
        $this->authorize('update', $schedule);

        $validated = $request->validated();

        // Store old values untuk audit
        $oldValues = $schedule->only($request->keys());

        $schedule->update($validated);

        return redirect()
            ->route('kurikulum.schedules.show', $schedule)
            ->with('success', 'Jadwal berhasil diubah');
    }

    /**
     * Delete schedule
     */
    public function destroy(Schedule $schedule)
    {
        $this->authorize('delete', $schedule);

        $schedule->delete();

        return redirect()
            ->route('kurikulum.schedules.index')
            ->with('success', 'Jadwal berhasil dihapus');
    }

    /**
     * Check schedule conflicts (AJAX)
     */
    public function checkConflicts()
    {
        $conflicts = Schedule::where('room', request('room'))
            ->where('day', request('day'))
            ->where('id', '!=', request('schedule_id'))
            ->whereRaw('NOT (end_time <= ? OR start_time >= ?)',
                      [request('start_time'), request('end_time')])
            ->get(['id', 'class_id', 'start_time', 'end_time']);

        return response()->json([
            'has_conflict' => $conflicts->count() > 0,
            'conflicts' => $conflicts,
        ]);
    }
}
```

---

## 5️⃣ BLADE TEMPLATE DENGAN AUTHORIZATION

```blade
<!-- resources/views/kurikulum/schedules/index.blade.php -->

@extends('layouts.kurikulum')

@section('title', 'Daftar Jadwal')

@section('content')
<div class="container-fluid">
    <div class="row mb-4">
        <div class="col-md-8">
            <h1>Jadwal Pelajaran</h1>
        </div>
        <div class="col-md-4 text-right">
            @can('create', App\Models\Kurikulum\Schedule::class)
                <a href="{{ route('kurikulum.schedules.create') }}" 
                   class="btn btn-primary">
                    <i class="fas fa-plus"></i> Tambah Jadwal
                </a>
            @endcan
        </div>
    </div>

    @if ($message = Session::get('success'))
        <div class="alert alert-success alert-dismissible fade show">
            <i class="fas fa-check-circle"></i> {{ $message }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if ($message = Session::get('error'))
        <div class="alert alert-danger alert-dismissible fade show">
            <i class="fas fa-exclamation-circle"></i> {{ $message }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Kelas</th>
                        <th>Mata Pelajaran</th>
                        <th>Guru</th>
                        <th>Hari</th>
                        <th>Waktu</th>
                        <th>Ruangan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($schedules as $schedule)
                        <tr>
                            <td>
                                <strong>{{ $schedule->class->name }}</strong>
                            </td>
                            <td>{{ $schedule->subject->name }}</td>
                            <td>{{ $schedule->teacher->name }}</td>
                            <td>
                                <span class="badge bg-info">
                                    {{ $schedule->day }}
                                </span>
                            </td>
                            <td>
                                {{ $schedule->start_time->format('H:i') }} - 
                                {{ $schedule->end_time->format('H:i') }}
                            </td>
                            <td>{{ $schedule->room }}</td>
                            <td>
                                @can('view', $schedule)
                                    <a href="{{ route('kurikulum.schedules.show', $schedule) }}" 
                                       class="btn btn-sm btn-info" title="Lihat">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                @endcan

                                @can('update', $schedule)
                                    <a href="{{ route('kurikulum.schedules.edit', $schedule) }}" 
                                       class="btn btn-sm btn-warning" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                @endcan

                                @can('delete', $schedule)
                                    <button type="button" class="btn btn-sm btn-danger" 
                                            onclick="confirm('Hapus jadwal ini?') && 
                                                    document.getElementById('delete-{{ $schedule->id }}').submit()">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                    <form id="delete-{{ $schedule->id }}" 
                                          action="{{ route('kurikulum.schedules.destroy', $schedule) }}" 
                                          method="POST" style="display:none;">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                @endcan
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">
                                Belum ada jadwal. 
                                @can('create', App\Models\Kurikulum\Schedule::class)
                                    <a href="{{ route('kurikulum.schedules.create') }}">
                                        Tambah sekarang
                                    </a>
                                @endcan
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="card-footer">
            {{ $schedules->links() }}
        </div>
    </div>
</div>
@endsection
```

---

## 6️⃣ SEEDER UNTUK ROLES & USERS

```php
// database/seeders/RoleAndUserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class RoleAndUserSeeder extends Seeder
{
    public function run()
    {
        // Create Admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@eduadmin.test',
            'password' => bcrypt('password'),
            'role_type' => 'admin',
            'is_active' => true,
        ]);

        // Create Kurikulum users
        User::create([
            'name' => 'Kepala Kurikulum',
            'email' => 'kurikulum@eduadmin.test',
            'password' => bcrypt('password'),
            'role_type' => 'kurikulum',
            'is_active' => true,
        ]);

        // Create Keuangan users
        User::create([
            'name' => 'Kepala Keuangan',
            'email' => 'keuangan@eduadmin.test',
            'password' => bcrypt('password'),
            'role_type' => 'keuangan',
            'is_active' => true,
        ]);

        echo "✓ Users created successfully\n";
        echo "  Admin: admin@eduadmin.test (password)\n";
        echo "  Kurikulum: kurikulum@eduadmin.test (password)\n";
        echo "  Keuangan: keuangan@eduadmin.test (password)\n";
    }
}
```

**Jalankan:**
```bash
php artisan db:seed --class=RoleAndUserSeeder
```

---

## 7️⃣ HELPER FUNCTIONS

```php
// app/Helpers/AuthHelper.php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    /**
     * Check if current user is admin
     */
    public static function isAdmin()
    {
        return Auth::check() && Auth::user()->isAdmin();
    }

    /**
     * Check if current user is kurikulum
     */
    public static function isKurikulum()
    {
        return Auth::check() && Auth::user()->isKurikulum();
    }

    /**
     * Check if current user is keuangan
     */
    public static function isKeuangan()
    {
        return Auth::check() && Auth::user()->isKeuangan();
    }

    /**
     * Get current user role
     */
    public static function currentRole()
    {
        return Auth::check() ? Auth::user()->role_type : null;
    }

    /**
     * Check if user has permission
     */
    public static function hasPermission($permission)
    {
        return Auth::check() && Auth::user()->hasPermission($permission);
    }

    /**
     * Get dashboard url per role
     */
    public static function getDashboardUrl()
    {
        if (!Auth::check()) {
            return '/';
        }

        $role = Auth::user()->role_type;

        return match($role) {
            'admin' => route('admin.dashboard'),
            'kurikulum' => route('kurikulum.dashboard'),
            'keuangan' => route('keuangan.dashboard'),
            default => '/',
        };
    }

    /**
     * Get accessible modules for current user
     */
    public static function getAccessibleModules()
    {
        if (!Auth::check()) {
            return [];
        }

        $role = Auth::user()->role_type;

        return match($role) {
            'admin' => [
                'students', 'teachers', 'classes', 'subjects',
                'announcements', 'multimedia', 'ai', 'settings'
            ],
            'kurikulum' => [
                'schedules', 'attendance', 'grades', 'reportcards',
                'promotions', 'exam_schedules'
            ],
            'keuangan' => [
                'finance', 'savings', 'invoices', 'payments', 'reports'
            ],
            default => [],
        };
    }
}
```

**Register as Facade (optional):**
```php
// config/app.php
'aliases' => [
    'AuthHelper' => App\Helpers\AuthHelper::class,
]

// Usage: AuthHelper::isAdmin()
```

---

## 8️⃣ TEST EXAMPLE

```php
// tests/Feature/Kurikulum/ScheduleTest.php

namespace Tests\Feature\Kurikulum;

use Tests\TestCase;
use App\Models\User;
use App\Models\Kurikulum\Schedule;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Teacher;

class ScheduleTest extends TestCase
{
    protected $kurikulumUser;
    protected $adminUser;
    protected $class;
    protected $subject;
    protected $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->kurikulumUser = User::factory()
            ->create(['role_type' => 'kurikulum']);
        $this->adminUser = User::factory()
            ->create(['role_type' => 'admin']);

        // Create test data
        $this->class = ClassModel::factory()->create();
        $this->subject = Subject::factory()->create();
        $this->teacher = Teacher::factory()->create();
    }

    /**
     * Test kurikulum can access schedule list
     */
    public function test_kurikulum_can_access_schedule_list()
    {
        $response = $this->actingAs($this->kurikulumUser)
            ->get(route('kurikulum.schedules.index'));

        $response->assertStatus(200);
        $response->assertViewIs('kurikulum.schedules.index');
    }

    /**
     * Test admin cannot access kurikulum schedule route
     */
    public function test_admin_cannot_access_kurikulum_schedule_route()
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('kurikulum.schedules.index'));

        $response->assertStatus(403);
    }

    /**
     * Test kurikulum can create schedule
     */
    public function test_kurikulum_can_create_schedule()
    {
        $data = [
            'class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'day' => 'Monday',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'room' => 'A-101',
        ];

        $response = $this->actingAs($this->kurikulumUser)
            ->post(route('kurikulum.schedules.store'), $data);

        $response->assertRedirect();
        $this->assertDatabaseHas('schedules', [
            'class_id' => $this->class->id,
            'created_by_kurikulum_id' => $this->kurikulumUser->id,
        ]);
    }

    /**
     * Test schedule validation
     */
    public function test_schedule_creation_validates_required_fields()
    {
        $response = $this->actingAs($this->kurikulumUser)
            ->post(route('kurikulum.schedules.store'), []);

        $response->assertSessionHasErrors([
            'class_id',
            'subject_id',
            'teacher_id',
            'day',
            'start_time',
            'end_time',
            'room',
        ]);
    }

    /**
     * Test conflict detection
     */
    public function test_conflict_detection_prevents_double_booking()
    {
        // Create first schedule
        Schedule::factory()->create([
            'room' => 'A-101',
            'day' => 'Monday',
            'start_time' => '08:00',
            'end_time' => '09:00',
        ]);

        // Try to create conflicting schedule
        $data = [
            'class_id' => $this->class->id,
            'subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'day' => 'Monday',
            'start_time' => '08:30', // Overlap with existing
            'end_time' => '09:30',
            'room' => 'A-101',
        ];

        $response = $this->actingAs($this->kurikulumUser)
            ->post(route('kurikulum.schedules.store'), $data);

        $response->assertSessionHas('error');
    }
}
```

**Jalankan tests:**
```bash
php artisan test tests/Feature/Kurikulum/ScheduleTest.php
```

---

## 9️⃣ MIGRATION FILE SIAP PAKAI

```php
// database/migrations/2024_01_15_000001_create_audit_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // CREATE, READ, UPDATE, DELETE
            $table->string('module');
            $table->string('table_name');
            $table->unsignedBigInteger('record_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_role');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->enum('status', ['success', 'failed', 'unauthorized'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('module');
            $table->index('user_role');
            $table->index('created_at');
            $table->index(['table_name', 'record_id']);

            // Foreign key
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
```

---

## 🔟 ENV CONFIGURATION

```env
# .env

APP_NAME=EduAdmin
APP_ENV=production
APP_KEY=base64:example
APP_DEBUG=false
APP_URL=https://eduadmin.example.com

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=eduadmin_prod
DB_USERNAME=root
DB_PASSWORD=secure_password

# Audit & Logging
AUDIT_LOG_RETENTION_DAYS=730 # 2 years
FINANCE_LOG_RETENTION_DAYS=2555 # 7 years
ACADEMIC_LOG_RETENTION_DAYS=365 # 1 year

# Session
SESSION_DRIVER=database
SESSION_LIFETIME=30 # 30 minutes

# Mail (for notifications)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
```

---

## 🎯 CHECKLIST QUICK START

```bash
# 1. Create migrations
php artisan make:migration add_role_type_to_users

# 2. Run migrations
php artisan migrate

# 3. Create models
php artisan make:model Kurikulum/Schedule

# 4. Create controllers
php artisan make:controller Kurikulum/ScheduleController --resource

# 5. Create policies
php artisan make:policy SchedulePolicy --model=Schedule

# 6. Create form requests
php artisan make:request Kurikulum/StoreScheduleRequest

# 7. Create middleware
php artisan make:middleware KurikulumMiddleware

# 8. Create tests
php artisan make:test Kurikulum/ScheduleTest --feature

# 9. Run seeders
php artisan db:seed --class=RoleAndUserSeeder

# 10. Test
php artisan test
```

---

**Semua code di atas siap untuk digunakan dan dapat dikustomisasi sesuai kebutuhan spesifik sistem Anda.**

Happy Coding! 🚀
