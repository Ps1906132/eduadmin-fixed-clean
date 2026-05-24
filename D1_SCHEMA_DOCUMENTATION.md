## 📊 D1 DATABASE SCHEMA DOCUMENTATION

### Overview
Complete SQL schema for EduAdmin with Cloudflare D1. This documentation details all tables, their relationships, and usage guidelines.

---

## 📋 TABLE REFERENCE

### 1️⃣ PROFILES (Users)
**Purpose**: Store all user accounts (admin, teachers, staff, students, parents)

```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,           -- Login identifier
    full_name TEXT NOT NULL,               -- Display name
    password_hash TEXT NOT NULL,           -- Bcrypt hashed password
    role TEXT NOT NULL,                    -- admin|kurikulum|keuangan|guru|siswa|ortu
    is_active INTEGER DEFAULT 1,           -- 0 = suspended, 1 = active
    avatar_url TEXT,                       -- Profile picture URL
    phone_number TEXT,                     -- Contact number
    address TEXT,                          -- Home/office address
    created_at DATETIME,                   -- Account creation date
    updated_at DATETIME                    -- Last modified
);
```

**Valid Roles**:
- `admin` - System administrator (full access)
- `kurikulum` - Curriculum/academic staff
- `keuangan` - Finance/accounting staff
- `guru` - Teacher
- `siswa` - Student
- `ortu` - Parent/Guardian

**Example**:
```sql
-- Admin user
INSERT INTO profiles VALUES 
('admin-001', 'admin@school.com', 'Budi Santoso', '$2a$10$hash...', 'admin', 1, NULL, '081234567890', 'Jakarta', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Teacher
INSERT INTO profiles VALUES 
('guru-001', 'siti@school.com', 'Siti Nurhaliza', '$2a$10$hash...', 'guru', 1, NULL, '081234567891', 'Jakarta', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

### 2️⃣ STAFF
**Purpose**: Detailed staff information (extends profiles table)

```sql
CREATE TABLE staff (
    id TEXT PRIMARY KEY,
    profile_id TEXT UNIQUE NOT NULL,       -- Reference to profiles
    nip TEXT UNIQUE,                       -- Personnel ID number
    position TEXT,                         -- Job title
    department TEXT,                       -- Dept/section
    hire_date DATE,                        -- When hired
    salary DECIMAL(15,2),                  -- Salary amount
    is_active INTEGER DEFAULT 1            -- Active status
);
```

**Relationship**: One-to-one with profiles table
**Example**: 
```sql
INSERT INTO staff VALUES 
('staff-001', 'guru-001', '19850515 200912 2 002', 'Guru Matematika', 'Kurikulum', '2015-07-01', 5000000, 1);
```

---

### 3️⃣ ACADEMIC_YEARS
**Purpose**: School years and semesters

```sql
CREATE TABLE academic_years (
    id TEXT PRIMARY KEY,                   -- ay-2025-2026
    name TEXT UNIQUE NOT NULL,             -- Display name
    start_date DATE NOT NULL,              -- Semester start
    end_date DATE NOT NULL,                -- Semester end
    semester INTEGER,                      -- 1 or 2
    is_active INTEGER DEFAULT 1            -- Current active year
);
```

**Usage**: Filter all data by academic year
**Example**:
```sql
-- Semester 1: July - December
INSERT INTO academic_years VALUES 
('ay-2025-2026', '2025/2026 - Semester 1', '2025-07-01', '2025-12-31', 1, 1);

-- Semester 2: January - June
INSERT INTO academic_years VALUES 
('ay-2025-2026-2', '2025/2026 - Semester 2', '2026-01-01', '2026-06-30', 2, 1);
```

---

### 4️⃣ SUBJECT_GROUPS
**Purpose**: Categorize subjects (MIPA, Bahasa, IPS, Seni)

```sql
CREATE TABLE subject_groups (
    id TEXT PRIMARY KEY,                   -- sg-001
    name TEXT NOT NULL,                    -- Group name
    description TEXT,                      -- Details
    is_active INTEGER DEFAULT 1
);
```

---

### 5️⃣ SUBJECTS
**Purpose**: Individual subjects/courses

```sql
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,                   -- subj-001
    name TEXT NOT NULL,                    -- Subject name
    code TEXT UNIQUE NOT NULL,             -- MTK, FIS, BIO, etc
    subject_group_id TEXT NOT NULL,        -- FK to subject_groups
    description TEXT,
    credits INTEGER,                       -- SKS (credit hours)
    is_active INTEGER DEFAULT 1
);
```

**Example**:
```sql
INSERT INTO subjects VALUES 
('subj-001', 'Matematika', 'MTK', 'sg-001', 'Pelajaran Matematika', 3, 1);
```

---

### 6️⃣ CLASSES
**Purpose**: School classes/grade levels

```sql
CREATE TABLE classes (
    id TEXT PRIMARY KEY,                   -- cls-10a
    name TEXT NOT NULL,                    -- Class name
    grade_level TEXT NOT NULL,             -- 10, 11, 12 (for SMA/SMK)
    academic_year_id TEXT NOT NULL,        -- FK to academic_years
    teacher_id TEXT,                       -- Homeroom teacher (FK profiles)
    capacity INTEGER,                      -- Max students
    is_active INTEGER DEFAULT 1
);
```

**Example**:
```sql
INSERT INTO classes VALUES 
('cls-10a', 'X-A', '10', 'ay-2025-2026', 'guru-001', 35, 1);
```

---

### 7️⃣ STUDENTS
**Purpose**: Student master data

```sql
CREATE TABLE students (
    id TEXT PRIMARY KEY,                   -- student-001
    nis TEXT UNIQUE NOT NULL,              -- Student ID number
    full_name TEXT NOT NULL,               -- Full name
    gender TEXT,                           -- M/F
    birth_date DATE,                       -- DOB
    birth_place TEXT,                      -- Birthplace
    parent_name TEXT,                      -- Parent/guardian
    address TEXT,                          -- Home address
    phone TEXT,                            -- Contact
    status TEXT DEFAULT 'active',          -- active|graduated|transferred
    enrollment_date DATE NOT NULL          -- When enrolled
);
```

**Example**:
```sql
INSERT INTO students VALUES 
('student-001', '20250001', 'Ahmad Putra', 'M', '2007-01-15', 'Jakarta', 'Budi Santoso', 'Jl. Merdeka 123', '081234567890', 'active', '2023-07-01');
```

---

### 8️⃣ CLASS_STUDENTS
**Purpose**: Track which students are in which classes per academic year

```sql
CREATE TABLE class_students (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,                -- FK classes
    student_id TEXT NOT NULL,              -- FK students
    academic_year_id TEXT NOT NULL,        -- FK academic_years
    enrollment_date DATE,
    is_active INTEGER DEFAULT 1,
    UNIQUE(class_id, student_id, academic_year_id)  -- Prevent duplicates
);
```

**Why separate table?**: Students move between classes each academic year
**Example**:
```sql
INSERT INTO class_students VALUES 
('cs-001', 'cls-10a', 'student-001', 'ay-2025-2026', '2025-07-01', 1);
```

---

### 9️⃣ SCHEDULE_PERIODS
**Purpose**: Define lesson periods (blocks of time)

```sql
CREATE TABLE schedule_periods (
    id TEXT PRIMARY KEY,                   -- per-1, per-2, etc
    period_number INTEGER,                 -- 1, 2, 3...
    start_time TEXT NOT NULL,              -- HH:MM format
    end_time TEXT NOT NULL,                -- HH:MM format
    duration_minutes INTEGER,              -- 45 minutes
    academic_year_id TEXT NOT NULL,        -- FK academic_years
    is_active INTEGER DEFAULT 1
);
```

**Example**:
```sql
-- 1st period: 07:00 - 07:45
INSERT INTO schedule_periods VALUES 
('per-1', 1, '07:00', '07:45', 45, 'ay-2025-2026', 1);

-- Break: 10:00 - 10:15
INSERT INTO schedule_periods VALUES 
('per-br', 5, '10:00', '10:15', 15, 'ay-2025-2026', 1);
```

---

### 🔟 SCHEDULES
**Purpose**: Weekly schedule of classes

```sql
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,                -- FK classes
    subject_id TEXT NOT NULL,              -- FK subjects
    teacher_id TEXT,                       -- FK profiles (teacher)
    day_of_week TEXT NOT NULL,             -- Senin, Selasa, etc
    period_id TEXT NOT NULL,               -- FK schedule_periods
    academic_year_id TEXT NOT NULL,        -- FK academic_years
    room TEXT,                             -- Room/lab name
    is_active INTEGER DEFAULT 1,
    created_by TEXT,                       -- Who created
    updated_by TEXT                        -- Last modified by
);
```

**Example**:
```sql
-- Class 10-A, Math on Monday period 1, room 101
INSERT INTO schedules VALUES 
('sch-001', 'cls-10a', 'subj-001', 'guru-001', 'Senin', 'per-1', 'ay-2025-2026', 'Ruang 101', 1, 'admin-001', 'admin-001');
```

---

### 1️⃣1️⃣ ATTENDANCE
**Purpose**: Track student attendance records

```sql
CREATE TABLE attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,              -- FK students
    class_id TEXT NOT NULL,                -- FK classes
    schedule_id TEXT,                      -- FK schedules (which lesson)
    date DATE NOT NULL,                    -- Which date
    status TEXT NOT NULL,                  -- hadir|sakit|izin|alpa
    remarks TEXT,                          -- Notes
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT,                       -- Who recorded
    updated_by TEXT,
    UNIQUE(student_id, class_id, date)     -- One record per day
);
```

**Status Values**:
- `hadir` - Present
- `sakit` - Sick (with letter)
- `izin` - Leave/Permission
- `alpa` - Absent (without permission)

**Example**:
```sql
INSERT INTO attendance VALUES 
('att-001', 'student-001', 'cls-10a', 'sch-001', '2025-09-01', 'hadir', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin-001', NULL);
```

---

### 1️⃣2️⃣ GRADES
**Purpose**: Student grades/scores for subjects

```sql
CREATE TABLE grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,              -- FK students
    subject_id TEXT NOT NULL,              -- FK subjects
    class_id TEXT NOT NULL,                -- FK classes
    academic_year_id TEXT NOT NULL,        -- FK academic_years
    grade_value DECIMAL(5,2),              -- Numeric score (0-100)
    grade_letter TEXT,                     -- A, B, C, D, E
    assessment_type TEXT,                  -- UTS|UAS|PR|Quiz
    exam_date DATE,                        -- When exam was held
    remarks TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT,                       -- Teacher who entered
    updated_by TEXT
);
```

**Example**:
```sql
INSERT INTO grades VALUES 
('grade-001', 'student-001', 'subj-001', 'cls-10a', 'ay-2025-2026', 85.50, 'B', 'UAS', '2025-12-15', 'Bagus', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'guru-001', NULL);
```

---

### 1️⃣3️⃣ ANNOUNCEMENTS
**Purpose**: School announcements/notifications

```sql
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,                   -- Headline
    content TEXT NOT NULL,                 -- Full text
    category TEXT,                         -- akademik|keuangan|umum
    target TEXT DEFAULT 'all',             -- all|siswa|guru|ortu
    status TEXT DEFAULT 'Draft',           -- Draft|Published|Archived
    viewers INTEGER DEFAULT 0,             -- View count
    created_by TEXT NOT NULL,              -- FK profiles (creator)
    created_at DATETIME,
    updated_at DATETIME,
    published_at DATETIME                  -- When published
);
```

**Example**:
```sql
INSERT INTO announcements VALUES 
('ann-001', 'Libur Semester Gasal', 'Libur semester akan dimulai...', 'akademik', 'all', 'Published', 150, 'admin-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2025-12-01');
```

---

### 1️⃣4️⃣ STUDENT_BILLS
**Purpose**: Invoice/bills for students (tuition, activities, etc)

```sql
CREATE TABLE student_bills (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,              -- FK students
    payment_name TEXT NOT NULL,            -- Tuition, Activity fee, etc
    amount DECIMAL(15,2) NOT NULL,         -- Amount due
    period TEXT,                           -- Bulan 1, Bulan 2, etc
    status TEXT DEFAULT 'pending',         -- pending|partial|paid|cancelled
    type TEXT DEFAULT 'BULANAN',           -- BULANAN|TAHUNAN|SEKALI
    due_date DATE,                         -- Payment deadline
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT
);
```

**Example**:
```sql
INSERT INTO student_bills VALUES 
('bill-001', 'student-001', 'SPP Bulan September', 500000, 'Bulan 1', 'paid', 'BULANAN', '2025-09-10', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin-001');
```

---

### 1️⃣5️⃣ PAYMENT_TRANSACTIONS
**Purpose**: Record individual payments made by students

```sql
CREATE TABLE payment_transactions (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,                 -- FK student_bills
    student_id TEXT NOT NULL,              -- FK students
    payment_method TEXT,                   -- cash|transfer|check
    amount DECIMAL(15,2) NOT NULL,         -- Amount paid
    transaction_date DATE NOT NULL,        -- Payment date
    reference_number TEXT,                 -- Bank ref, receipt #
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    recorded_by TEXT                       -- Who recorded payment
);
```

**Example**:
```sql
INSERT INTO payment_transactions VALUES 
('pay-001', 'bill-001', 'student-001', 'transfer', 500000, '2025-09-05', 'TRF12345678', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'admin-001');
```

---

### 1️⃣6️⃣ SAVINGS_ACCOUNTS
**Purpose**: Tabungan (savings accounts) for students

```sql
CREATE TABLE savings_accounts (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,       -- FK students (one per student)
    balance DECIMAL(15,2) DEFAULT 0.00,    -- Current balance
    account_number TEXT,                   -- Bank-like account #
    opened_date DATE,                      -- Account opening date
    status TEXT DEFAULT 'active',          -- active|frozen|closed
    created_at DATETIME,
    updated_at DATETIME
);
```

**Example**:
```sql
INSERT INTO savings_accounts VALUES 
('sav-001', 'student-001', 250000, 'SAV-10001', '2025-07-01', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

### 1️⃣7️⃣ SAVINGS_TRANSACTIONS
**Purpose**: Withdraw/deposit transactions for savings

```sql
CREATE TABLE savings_transactions (
    id TEXT PRIMARY KEY,
    savings_account_id TEXT NOT NULL,      -- FK savings_accounts
    student_id TEXT NOT NULL,              -- FK students
    transaction_type TEXT NOT NULL,        -- setor|tarik
    amount DECIMAL(15,2) NOT NULL,         -- Transaction amount
    description TEXT,                      -- Why/what for
    balance_after DECIMAL(15,2),           -- Balance after transaction
    transaction_date DATETIME,             -- When it happened
    recorded_by TEXT                       -- Who recorded it
);
```

**Example**:
```sql
INSERT INTO savings_transactions VALUES 
('savtx-001', 'sav-001', 'student-001', 'setor', 50000, 'Infaq', 300000, CURRENT_TIMESTAMP, 'admin-001');
```

---

### 1️⃣8️⃣ LIBRARY_BOOKS
**Purpose**: Book catalog for school library

```sql
CREATE TABLE library_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT UNIQUE,                      -- ISBN number
    publisher TEXT,
    category TEXT,                         -- Fiction, Reference, etc
    total_copies INTEGER,                  -- Total copies owned
    available_copies INTEGER,              -- How many available to borrow
    location TEXT,                         -- Shelf location
    status TEXT DEFAULT 'available',       -- available|restricted|retired
    acquisition_date DATE,                 -- When purchased
    created_at DATETIME,
    updated_at DATETIME
);
```

---

### 1️⃣9️⃣ TUTORING_CLASSES
**Purpose**: Bimbingan belajar (tutoring/remedial classes)

```sql
CREATE TABLE tutoring_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,                    -- Class name
    teacher_id TEXT NOT NULL,              -- FK profiles (teacher)
    subject_id TEXT,                       -- FK subjects (optional)
    schedule TEXT,                         -- Meeting times
    max_students INTEGER,                  -- Capacity
    current_students INTEGER DEFAULT 0,    -- Enrolled count
    status TEXT DEFAULT 'active',          -- active|paused|finished
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

### 2️⃣0️⃣ AI PROVIDERS
**Purpose**: AI service configuration (Gemini, ChatGPT, etc)

```sql
CREATE TABLE ai_providers (
    id TEXT PRIMARY KEY,                   -- ai-gemini
    name TEXT NOT NULL,                    -- Display name
    type TEXT NOT NULL,                    -- LLM|Vision|Speech
    is_active INTEGER DEFAULT 1
);
```

**Example**:
```sql
INSERT INTO ai_providers VALUES 
('ai-gemini', 'Google Gemini', 'LLM', 1);
```

---

### 2️⃣1️⃣ AI_API_KEYS
**Purpose**: Store API credentials for AI services

```sql
CREATE TABLE ai_api_keys (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,             -- FK ai_providers
    api_key TEXT NOT NULL,                 -- The API key (ENCRYPTED in production)
    api_url TEXT,                          -- Endpoint URL
    is_active INTEGER DEFAULT 1,
    created_by TEXT,                       -- Who added it
    created_at DATETIME,
    updated_at DATETIME
);
```

---

### 2️⃣2️⃣ AI_SYSTEM_SETTINGS
**Purpose**: AI configuration settings

```sql
CREATE TABLE ai_system_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,      -- max_tokens, temperature
    setting_value TEXT,                    -- Value
    description TEXT,
    updated_by TEXT,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

### 2️⃣3️⃣ SCHOOL_SETTINGS
**Purpose**: General school configuration

```sql
CREATE TABLE school_settings (
    id TEXT PRIMARY KEY,
    school_name TEXT,
    school_address TEXT,
    school_phone TEXT,
    school_email TEXT,
    principal_name TEXT,
    npsn TEXT,                             -- School ID number
    academic_year_id TEXT,                 -- Current active year
    semester INTEGER,
    logo_url TEXT,                         -- School logo
    created_at DATETIME,
    updated_at DATETIME
);
```

---

### 2️⃣4️⃣ PROMOTION_HISTORY
**Purpose**: Track class promotions (grade advancement)

```sql
CREATE TABLE promotion_history (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,              -- FK students
    from_class_id TEXT,                    -- FK classes (previous)
    to_class_id TEXT,                      -- FK classes (new)
    academic_year_id TEXT NOT NULL,        -- FK academic_years
    promotion_date DATE,                   -- When promoted
    status TEXT,                           -- promoted|retained|transferred
    remarks TEXT,
    processed_by TEXT,                     -- Who processed
    created_at DATETIME
);
```

---

### 2️⃣5️⃣ AUDIT_LOGS
**Purpose**: Complete audit trail of all system changes

```sql
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME,
    user_id TEXT,                          -- FK profiles (who did it)
    user_role TEXT,                        -- Role of the user
    module TEXT,                           -- Which module (akademik, keuangan)
    action TEXT,                           -- CREATE|READ|UPDATE|DELETE
    table_name TEXT,                       -- Which table affected
    record_id TEXT,                        -- Which record
    field_changed TEXT,                    -- Which field (for UPDATE)
    old_value TEXT,                        -- Previous value (JSON)
    new_value TEXT,                        -- New value (JSON)
    ip_address TEXT,                       -- User's IP
    user_agent TEXT,                       -- Browser info
    status TEXT DEFAULT 'SUCCESS',         -- SUCCESS|FAILED|UNAUTHORIZED
    error_message TEXT                     -- Error details if failed
);
```

**Logging Policy**:
```
ADMIN:     Log all operations, 2-year retention
KURIKULUM: Log akademik operations, 1-year retention  
KEUANGAN:  Log all finance, 7-year retention (compliance)
```

---

## 🔗 RELATIONSHIP DIAGRAM

```
profiles (users)
  ├─→ staff (details)
  ├─→ classes (as teacher)
  ├─→ schedules (as teacher)
  ├─→ grades (created_by)
  ├─→ announcements (created_by)
  └─→ audit_logs (user_id)

academic_years
  ├─→ classes
  ├─→ schedule_periods
  ├─→ schedules
  ├─→ grades
  ├─→ promotion_history
  └─→ school_settings

subjects
  ├─→ subject_groups
  ├─→ schedules
  ├─→ grades
  └─→ tutoring_classes

classes
  ├─→ academic_years
  ├─→ profiles (teacher)
  ├─→ class_students
  ├─→ schedules
  ├─→ attendance
  └─→ grades

students
  ├─→ class_students
  ├─→ attendance
  ├─→ grades
  ├─→ student_bills
  ├─→ payment_transactions
  ├─→ savings_accounts
  └─→ promotion_history

schedule_periods
  └─→ schedules
  └─→ academic_years

schedules
  ├─→ classes
  ├─→ subjects
  ├─→ profiles (teacher)
  ├─→ schedule_periods
  └─→ attendance

savings_accounts
  └─→ students
  └─→ savings_transactions

student_bills
  ├─→ students
  └─→ payment_transactions

announcements
  └─→ broadcasts
```

---

## 📊 QUERY EXAMPLES

### Get student in class with attendance
```sql
SELECT 
  s.nis, s.full_name,
  COUNT(CASE WHEN a.status='hadir' THEN 1 END) as hadir,
  COUNT(CASE WHEN a.status='sakit' THEN 1 END) as sakit,
  COUNT(CASE WHEN a.status='alpa' THEN 1 END) as alpa
FROM students s
JOIN class_students cs ON s.id = cs.student_id
LEFT JOIN attendance a ON s.id = a.student_id
WHERE cs.class_id = 'cls-10a'
GROUP BY s.id;
```

### Get student schedule
```sql
SELECT 
  sc.day_of_week,
  sp.start_time, sp.end_time,
  sub.name as subject,
  p.full_name as teacher,
  sc.room
FROM schedules sc
JOIN subjects sub ON sc.subject_id = sub.id
JOIN profiles p ON sc.teacher_id = p.id
JOIN schedule_periods sp ON sc.period_id = sp.id
WHERE sc.class_id = 'cls-10a'
ORDER BY FIELD(day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
         sp.start_time;
```

### Get student grades
```sql
SELECT 
  sub.name as subject,
  g.grade_value,
  g.grade_letter,
  g.assessment_type,
  g.exam_date
FROM grades g
JOIN subjects sub ON g.subject_id = sub.id
WHERE g.student_id = 'student-001'
ORDER BY g.exam_date DESC;
```

### Financial summary
```sql
SELECT 
  s.nis, s.full_name,
  SUM(sb.amount) as total_bills,
  SUM(pt.amount) as paid,
  SUM(sb.amount) - SUM(COALESCE(pt.amount,0)) as unpaid
FROM students s
LEFT JOIN student_bills sb ON s.id = sb.student_id
LEFT JOIN payment_transactions pt ON sb.id = pt.bill_id
GROUP BY s.id;
```

---

## 🔐 SECURITY NOTES

1. **password_hash**: Always bcrypt, never store plain passwords
2. **api_keys**: Encrypt in production, use environment variables
3. **sensitive fields**: Audit log without passwords, SSN
4. **audit_logs**: Never delete, maintain for compliance
5. **role_based access**: Enforce at API level, not just database

---

## 📈 INDEX STRATEGY

All critical foreign keys and filter columns are indexed for performance:
- Lookups by email, nis, student_id
- Date range queries
- Role and status filters
- Academic year filtering

---

## 🔄 MAINTENANCE

### Regular Tasks
```sql
-- Analyze for optimizer (weekly)
ANALYZE;

-- Vacuum to optimize storage (monthly)
VACUUM;

-- Check integrity
PRAGMA integrity_check;
```

### Backup Before Updates
```bash
wrangler d1 backup database eduadmin_db
```

---

## 📝 VERSION HISTORY

- **v1.0** (May 2025): Initial D1 schema
  - 25 tables
  - Full RBAC support
  - Audit logging
  - Relationships and constraints
  - Performance indexes

---

**Last Updated**: May 22, 2026
**Schema Version**: 1.0
**Database**: Cloudflare D1 (SQLite)
