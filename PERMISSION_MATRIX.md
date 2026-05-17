# PERMISSION MATRIX & ACCESS CONTROL
## Detail Hak Akses Per Role di EduAdmin

---

## 1️⃣ PERMISSION MATRIX LENGKAP

### **ADMIN ROLE - Modul yang Dikuasai**

| # | Modul | CREATE | READ | UPDATE | DELETE | NOTES |
|---|-------|--------|------|--------|--------|-------|
| 1 | Data Siswa | ✅ | ✅ | ✅ | ✅ | Full access, audit log |
| 2 | Data Guru & Staff | ✅ | ✅ | ✅ | ✅ | Full access, sensitive data |
| 3 | Kelas & Wali Kelas | ✅ | ✅ | ✅ | ✅ | Setup & maintain |
| 4 | Mata Pelajaran | ✅ | ✅ | ✅ | ✅ | Master data |
| 5 | Bimbingan Belajar | ✅ | ✅ | ✅ | ✅ | Manage BK activity |
| 6 | Pengumuman | ✅ | ✅ | ✅ | ✅ | School-wide announcements |
| 7 | Manajemen Multimedia | ✅ | ✅ | ✅ | ✅ | Upload/manage media |
| 8 | Manajemen AI | ✅ | ✅ | ✅ | ✅ | AI integration settings |
| 9 | Pengaturan Sistem | ✅ | ✅ | ✅ | ✅ | System configuration |
| 10 | Jadwal | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 11 | Absen | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 12 | Jadwal Ujian | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 13 | Nilai | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 14 | Rapot | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 15 | Naik Kelas | ✅ | ✅ | - | - | READ ONLY untuk Kurikulum |
| 16 | Keuangan Sekolah | ✅ | ✅ | - | - | READ ONLY untuk Keuangan |
| 17 | Tabungan Siswa | ✅ | ✅ | - | - | READ ONLY untuk Keuangan |
| 18 | Laporan Keuangan | ✅ | ✅ | - | - | READ ONLY untuk Keuangan |

---

### **KURIKULUM ROLE - Modul yang Dikuasai**

| # | Modul | CREATE | READ | UPDATE | DELETE | NOTES |
|---|-------|--------|------|--------|--------|-------|
| 1 | Jadwal | ✅ | ✅ | ✅ | ✅ | Full control, primary owner |
| 2 | Absen | ✅ | ✅ | ✅ | ✅ | Attendance management |
| 3 | Jadwal Ujian | ✅ | ✅ | ✅ | ✅ | Exam scheduling |
| 4 | Manajemen Nilai | ✅ | ✅ | ✅ | ✅ | Grade input & management |
| 5 | Rapot | ✅ | ✅ | ✅ | ✅ | Generate & manage reports |
| 6 | Naik Kelas | ✅ | ✅ | ✅ | ✅ | Grade promotion |
| 7 | Data Siswa | - | ✅ | - | - | View only |
| 8 | Data Guru | - | ✅ | - | - | View only |
| 9 | Kelas & Wali | - | ✅ | - | - | View only |
| 10 | Mata Pelajaran | - | ✅ | - | - | View only |
| 11 | Laporan | - | ✅ | - | - | View academic reports only |

---

### **KEUANGAN ROLE - Modul yang Dikuasai**

| # | Modul | CREATE | READ | UPDATE | DELETE | NOTES |
|---|-------|--------|------|--------|--------|-------|
| 1 | Keuangan Sekolah | ✅ | ✅ | ✅ | ✅ | Full financial management |
| 2 | Tabungan Siswa | ✅ | ✅ | ✅ | ✅ | Student savings account |
| 3 | Laporan Keuangan | ✅ | ✅ | ✅ | ✅ | Financial reporting & export |
| 4 | Data Siswa | - | ✅ | - | - | View name & ID only |
| 5 | Data Guru | - | ✅ | - | - | View gaji section only |
| 6 | Absen | - | ✅ | - | - | View for attendance deductions |
| 7 | Nilai | - | ✅ | - | - | View for performance bonus |

---

## 2️⃣ DETAILED ACCESS RULES

### **DATA SHARING ANTAR ROLE**

#### ✅ Data yang SHARED (Admin dapat akses semua role, role lain hanya read):

```
students (
    - Admin: CRUD
    - Kurikulum: READ (nama, no_induk, class)
    - Keuangan: READ (nama, no_induk, Guardian contact)
    - Guru: READ (via schedule)
)

classes (
    - Admin: CRUD
    - Kurikulum: READ
    - Keuangan: READ
)

subjects (
    - Admin: CRUD
    - Kurikulum: READ
    - Keuangan: READ
)

teachers (
    - Admin: CRUD
    - Kurikulum: READ
    - Keuangan: READ (salary info only)
)

academic_year (
    - Admin: CRUD
    - Kurikulum: READ
    - Keuangan: READ
)
```

#### ✅ Data yang KURIKULUM (Only Kurikulum dapat CRUD):

```
schedules (
    - Admin: READ ONLY
    - Kurikulum: CRUD
    - Keuangan: READ (attendance linked)
)

attendance (
    - Admin: READ ONLY
    - Kurikulum: CRUD
    - Keuangan: READ (calculate penalties)
)

exam_schedules (
    - Admin: READ ONLY
    - Kurikulum: CRUD
)

grades (
    - Admin: READ ONLY
    - Kurikulum: CRUD
    - Keuangan: READ (for scholarship)
)

report_cards (
    - Admin: READ ONLY
    - Kurikulum: CRUD
)

grade_promotions (
    - Admin: READ ONLY
    - Kurikulum: CRUD
)
```

#### ✅ Data yang KEUANGAN (Only Keuangan dapat CRUD):

```
school_finance (
    - Admin: READ ONLY
    - Keuangan: CRUD
)

student_savings (
    - Admin: READ ONLY
    - Keuangan: CRUD
)

finance_reports (
    - Admin: READ ONLY
    - Keuangan: CRUD
)

payment_history (
    - Admin: READ ONLY
    - Keuangan: CRUD
)

student_invoices (
    - Admin: READ ONLY
    - Keuangan: CRUD
)
```

---

## 3️⃣ FIELD-LEVEL ACCESS CONTROL

### **Sensitive Fields yang Perlu Dibatasi**

#### **Personal Data (Admin only)**
```javascript
students: {
    - email ❌ Kurikulum
    - phone ❌ Kurikulum
    - address ✅ Keuangan (billing address)
    - parents_info ❌ Kurikulum
    - medical_info ❌ Keuangan
    - id_number ✅ Both (for records)
}

teachers: {
    - salary ❌ Kurikulum
    - bank_account ❌ Kurikulum  
    - identity_number ✅ Both (general)
    - home_address ❌ Both
}
```

#### **Financial Data (Keuangan only)**
```javascript
student_savings: {
    - balance_amount ✅ Admin (READ ONLY)
    - transaction_history ❌ Kurikulum
    - interest_earned ❌ Kurikulum
}

school_finance: {
    - budget_details ❌ Kurikulum
    - profit_loss ❌ Kurikulum
    - cash_flow ❌ Kurikulum
}
```

---

## 4️⃣ ACTION LEVEL PERMISSIONS

### **Operasi Spesifik yang Dibatasi**

#### **Jadwal Modul (Kurikulum)**
```
✅ Create Schedule
✅ Edit Schedule  
✅ Delete Schedule
❌ Change Class Assignment (hanya Admin)
❌ Lock Schedule for Changes
✅ Export Schedule
✅ View Conflicts/Overlaps
```

#### **Nilai Modul (Kurikulum)**
```
✅ Input Grades
✅ Edit Grades
✅ Delete Grades (dengan timestamp)
❌ Manually Generate Rapot (auto-generated)
❌ Lock Grades (Admin only)
✅ Calculate GPA
✅ Generate Grade Summary
```

#### **Keuangan Modul (Keuangan)**
```
✅ Create Invoice
✅ Record Payment
✅ Generate Report
✅ Export to Excel/PDF
❌ Modify Posted Transactions (audit trail)
❌ Delete Transaction (only mark as void)
✅ Approve Transactions (if > threshold)
✅ Generate Audit Trail Report
```

---

## 5️⃣ APPROVAL WORKFLOWS

### **Multi-Level Approval (if applicable)**

#### **Scenario: Keuangan membuat Biaya Operasional**
```
Step 1: Keuangan INPUT data biaya
↓
Step 2: Admin REVIEW & APPROVE/REJECT
↓
Step 3: If APPROVED → Keuangan dapat FINALIZE
↓
Step 4: Transaction LOCKED untuk history
```

#### **Scenario: Kurikulum menaikkan kelas siswa**
```
Step 1: Kurikulum prepare data naik kelas
↓
Step 2: Admin VERIFY data integrity
↓
Step 3: If OK → Kurikulum EXECUTE promotion
↓
Step 4: System AUTO-UPDATE class assignment
↓
Step 5: Admin dapat UNDO jika error (24 jam)
```

---

## 6️⃣ AUDIT LOGGING REQUIREMENTS

### **Setiap operasi CRUD harus logged:**

```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    user_role VARCHAR(50),
    module VARCHAR(100),
    action VARCHAR(50), -- CREATE, READ, UPDATE, DELETE
    table_name VARCHAR(100),
    record_id INT,
    field_changed VARCHAR(100), -- untuk UPDATE
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(15),
    user_agent TEXT,
    status VARCHAR(20), -- SUCCESS, FAILED, UNAUTHORIZED
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX (timestamp),
    INDEX (user_role),
    INDEX (module),
    INDEX (table_name)
);
```

**Logging Configuration per Role:**
```
ADMIN:
- Log SEMUA akses
- Retensi: 2 tahun
- Export: Daily reports

KURIKULUM:
- Log akses nilai, jadwal, absen
- Retensi: 1 tahun
- Export: Per request

KEUANGAN:
- Log SEMUA transaksi finansial
- Retensi: 7 tahun (compliance)
- Export: Monthly reports
```

---

## 7️⃣ CROSS-ROLE DATA DEPENDENCIES

### **Chain of Dependencies:**

```
Admin membuat/update Data Siswa
        ↓
Kurikulum membuat Jadwal untuk siswa tersebut
        ↓
Kurikulum input Absen untuk siswa
        ↓
Kurikulum input Nilai berdasarkan Absen & Jadwal
        ↓
Kurikulum generate Rapot dari Nilai
        ↓
Keuangan query Absen untuk hitung Denda (if absent)
        ↓
Keuangan create Invoice dengan Denda + Biaya Operasional
        ↓
Keuangan record Pembayaran ke Tabungan
```

**Critical Validations:**
- ❌ Tidak boleh ada Absen jika belum ada Jadwal
- ❌ Tidak boleh ada Nilai jika belum ada Absen
- ❌ Tidak boleh ada Rapot jika belum ada Nilai
- ❌ Tidak boleh ada Denda jika belum ada Absen record

---

## 8️⃣ DASHBOARD & REPORTING ACCESS

### **Visibility di Dashboard**

#### **Admin Dashboard**
```
- System Overview (uptime, user activity)
- Quick Stats (total siswa, guru, keuangan)
- Recent Activities (all logs)
- User Management
- System Health
```

#### **Kurikulum Dashboard**
```
- Schedule Overview
- Attendance Summary (by class)
- Grade Distribution (by subject)
- Top/Bottom Performers
- Exam Schedule Preview
- Class Promotion Preview
```

#### **Keuangan Dashboard**
```
- Monthly Revenue
- Outstanding Payments
- Cash Flow Overview
- Savings Account Summary
- Expense Breakdown
- Financial Health (balance)
```

---

## 9️⃣ EXPORT & REPORTING

### **Data Export Permissions**

| Format | Admin | Kurikulum | Keuangan | Restrictions |
|--------|-------|-----------|----------|--------------|
| PDF | ✅ Semua modul | ✅ Academic only | ✅ Finance only | Watermark dengan role |
| Excel | ✅ Semua modul | ✅ Academic only | ✅ Finance only | Formula protected |
| CSV | ✅ Semua modul | ✅ Academic only | ✅ Finance only | No sensitive fields |
| Print | ✅ Semua modul | ✅ Academic only | ✅ Finance only | Page header with role |
| API Export | ✅ Full access | ✅ Academic APIs | ✅ Finance APIs | Rate limited |

---

## 🔟 REAL-WORLD SCENARIOS

### **Scenario 1: Guru melihat Jadwal**
```
1. Guru login → Role: Guru (jika ada, atau via Kurikulum)
2. Query: SELECT * FROM schedules WHERE teacher_id = current_user
3. Result: ALLOWED (karena relasi teacher ke schedule)
4. Perubahan Jadwal: ❌ BLOCKED (read-only untuk guru)
```

### **Scenario 2: Kurikulum input Nilai Ujian Siswa**
```
1. Kurikulum login → Role: Kurikulum
2. Try: INSERT into grades (student_id, subject_id, value)
3. Validations:
   - ✅ Check: Student exists di class
   - ✅ Check: Subject scheduled untuk class ini
   - ✅ Check: Exam date sudah lewat
4. Result: ✅ ALLOWED
5. Audit Log: User, Timestamp, Old Value, New Value
```

### **Scenario 3: Keuangan membaca Absen untuk Denda**
```
1. Keuangan login → Role: Keuangan
2. Query: SELECT student_id, count(absent_dates) FROM attendance 
          WHERE student_id = X AND month = current_month
3. Result: ✅ ALLOWED (READ ONLY)
4. Action: Calculate denda = count * tarif_per_hari
5. Create Invoice dengan denda
```

### **Scenario 4: Admin coba akses Jadwal di URL**
```
1. Admin try: /kurikulum/schedules
2. Middleware Check: 
   - ✅ User is authenticated
   - ❌ User role != kurikulum
3. Result: 403 Forbidden "Anda tidak memiliki akses ke modul ini"
4. Audit Log: Unauthorized access attempt
```

---

## 🔐 SECURITY BEST PRACTICES

### **1. Principle of Least Privilege**
```
✅ Each user dapat hanya akses modul yang diperlukan
❌ Tidak ada "super-user" except System Admin
✅ Default DENY, explicit ALLOW
```

### **2. Role Separation**
```
✅ Tidak ada user dengan multiple roles (admin & keuangan)
   Exception: System Admin (jika perlu troubleshoot)
❌ Tidak ada shared account
✅ Setiap user punya unique login
```

### **3. Data Validation**
```
✅ Server-side validation mandatory
✅ Foreign key constraints enforced
✅ Check user role sebelum return data
✅ Validate timestamps untuk prevent backdating
```

### **4. Encryption**
```
- At Rest: Encrypt sensitive fields (password, SSN, salary)
- In Transit: HTTPS only
- In Logs: Never log sensitive data (passwords, card numbers)
```

### **5. Session Management**
```
- Session timeout: 30 minutes inactivity
- Force logout: Role change requires new login
- Device tracking: Log device info for suspicious activity
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Database schema updated dengan role_type column
- [ ] Middleware created untuk setiap role
- [ ] Policies implemented untuk authorization
- [ ] Routes segmented per role
- [ ] Controllers moved ke folder yang sesuai
- [ ] Views updated dengan role context
- [ ] Audit logging enabled
- [ ] Permission matrix documented
- [ ] Access control tested
- [ ] Security audit completed
- [ ] Staff trained pada new permissions
- [ ] Monitoring configured untuk unauthorized access

---

**Version:** 1.0  
**Last Updated:** 2026  
**Status:** Ready for Implementation
