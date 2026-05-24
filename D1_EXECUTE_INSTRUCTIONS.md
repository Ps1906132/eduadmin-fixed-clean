## 📋 PETUNJUK: EXECUTE D1 SQL FILES SATU PER SATU

**Database ID**: `77d7d271-5515-4cd1-8865-5cd676d4752b`

> ⚠️ D1 tidak bisa copy-paste langsung, jadi kita execute file satu per satu

---

## 👤 SUPER ADMIN CREDENTIALS

```
Username: admin@eduadmin.com
Password: EduAdmin@2026!
```

---

## 📂 FILES TERSEDIA

Semua file SQL sudah dibuat di folder: `d1_sql/`

```
d1_sql/
  ├─ 01_profiles.sql                (PROFILES + ADMIN USER)
  ├─ 02_staff.sql                   (STAFF)
  ├─ 03_academic_years.sql          (ACADEMIC YEARS)
  ├─ 04_subject_groups.sql          (SUBJECT GROUPS)
  ├─ 05_subjects.sql                (SUBJECTS + DEFAULT SUBJECTS)
  ├─ 06_classes.sql                 (CLASSES)
  ├─ 07_students.sql                (STUDENTS)
  ├─ 08_class_students.sql          (CLASS STUDENTS MAPPING)
  ├─ 09_schedule_periods.sql        (SCHEDULE PERIODS + DEFAULT PERIODS)
  ├─ 10_schedules.sql               (SCHEDULES)
  ├─ 11_attendance.sql              (ATTENDANCE)
  ├─ 12_grades.sql                  (GRADES)
  ├─ 13_announcements.sql           (ANNOUNCEMENTS)
  ├─ 14_broadcasts.sql              (BROADCASTS)
  ├─ 15_student_bills.sql           (STUDENT BILLS)
  ├─ 16_payment_transactions.sql    (PAYMENT TRANSACTIONS)
  ├─ 17_expenses.sql                (EXPENSES)
  ├─ 18_savings_accounts.sql        (SAVINGS ACCOUNTS)
  ├─ 19_savings_transactions.sql    (SAVINGS TRANSACTIONS)
  ├─ 20_library_books.sql           (LIBRARY BOOKS)
  ├─ 21_tutoring_classes.sql        (TUTORING CLASSES)
  ├─ 22_ai_providers.sql            (AI PROVIDERS + DEFAULT)
  ├─ 23_ai_api_keys.sql             (AI API KEYS)
  ├─ 24_ai_system_settings.sql      (AI SYSTEM SETTINGS)
  ├─ 25_school_settings.sql         (SCHOOL SETTINGS + DEFAULT)
  ├─ 26_multimedia_settings.sql     (MULTIMEDIA SETTINGS)
  ├─ 27_promotion_history.sql       (PROMOTION HISTORY)
  └─ 28_audit_logs.sql              (AUDIT LOGS)
```

**Total**: 28 tabel ready to deploy!

---

## 🚀 CARA EXECUTE

### **OPTION 1: Via Wrangler CLI (Recommended)**

Buka PowerShell dan jalankan satu per satu:

```powershell
# File 1 - PROFILES (termasuk admin user)
wrangler d1 execute eduadmin_db --file d1_sql/01_profiles.sql

# File 2 - STAFF
wrangler d1 execute eduadmin_db --file d1_sql/02_staff.sql

# File 3 - ACADEMIC YEARS
wrangler d1 execute eduadmin_db --file d1_sql/03_academic_years.sql

# File 4 - SUBJECT GROUPS
wrangler d1 execute eduadmin_db --file d1_sql/04_subject_groups.sql

# File 5 - SUBJECTS
wrangler d1 execute eduadmin_db --file d1_sql/05_subjects.sql

# File 6 - CLASSES
wrangler d1 execute eduadmin_db --file d1_sql/06_classes.sql

# File 7 - STUDENTS
wrangler d1 execute eduadmin_db --file d1_sql/07_students.sql

# File 8 - CLASS STUDENTS
wrangler d1 execute eduadmin_db --file d1_sql/08_class_students.sql

# File 9 - SCHEDULE PERIODS
wrangler d1 execute eduadmin_db --file d1_sql/09_schedule_periods.sql

# File 10 - SCHEDULES
wrangler d1 execute eduadmin_db --file d1_sql/10_schedules.sql

# File 11 - ATTENDANCE
wrangler d1 execute eduadmin_db --file d1_sql/11_attendance.sql

# File 12 - GRADES
wrangler d1 execute eduadmin_db --file d1_sql/12_grades.sql

# File 13 - ANNOUNCEMENTS
wrangler d1 execute eduadmin_db --file d1_sql/13_announcements.sql

# File 14 - BROADCASTS
wrangler d1 execute eduadmin_db --file d1_sql/14_broadcasts.sql

# File 15 - STUDENT BILLS
wrangler d1 execute eduadmin_db --file d1_sql/15_student_bills.sql

# File 16 - PAYMENT TRANSACTIONS
wrangler d1 execute eduadmin_db --file d1_sql/16_payment_transactions.sql

# File 17 - EXPENSES
wrangler d1 execute eduadmin_db --file d1_sql/17_expenses.sql

# File 18 - SAVINGS ACCOUNTS
wrangler d1 execute eduadmin_db --file d1_sql/18_savings_accounts.sql

# File 19 - SAVINGS TRANSACTIONS
wrangler d1 execute eduadmin_db --file d1_sql/19_savings_transactions.sql

# File 20 - LIBRARY BOOKS
wrangler d1 execute eduadmin_db --file d1_sql/20_library_books.sql

# File 21 - TUTORING CLASSES
wrangler d1 execute eduadmin_db --file d1_sql/21_tutoring_classes.sql

# File 22 - AI PROVIDERS
wrangler d1 execute eduadmin_db --file d1_sql/22_ai_providers.sql

# File 23 - AI API KEYS
wrangler d1 execute eduadmin_db --file d1_sql/23_ai_api_keys.sql

# File 24 - AI SYSTEM SETTINGS
wrangler d1 execute eduadmin_db --file d1_sql/24_ai_system_settings.sql

# File 25 - SCHOOL SETTINGS
wrangler d1 execute eduadmin_db --file d1_sql/25_school_settings.sql

# File 26 - MULTIMEDIA SETTINGS
wrangler d1 execute eduadmin_db --file d1_sql/26_multimedia_settings.sql

# File 27 - PROMOTION HISTORY
wrangler d1 execute eduadmin_db --file d1_sql/27_promotion_history.sql

# File 28 - AUDIT LOGS
wrangler d1 execute eduadmin_db --file d1_sql/28_audit_logs.sql
```

**Output expected** setiap kali:
```
✅ Executed 1 commands against the database.
```

---

### **OPTION 2: Via Cloudflare Dashboard Console**

1. Login ke https://dash.cloudflare.com/
2. Masuk ke **Workers & Pages → D1 → eduadmin_db → Console**
3. Copy-paste content setiap file SQL satu per satu
4. Click **Execute** button
5. Ulangi untuk 28 file

---

### **OPTION 3: Via Browser Console (Jika sudah ada app running)**

```javascript
const TOKEN = localStorage.getItem('eduadmin_token');
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` };

// Atau request ke endpoint diagnostic jika sudah support SQL execution
```

---

## ✅ VERIFICATION SETELAH SELESAI

Jalankan command ini untuk verify semua tabel berhasil dibuat:

```powershell
wrangler d1 execute eduadmin_db --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

**Output expected** (28 tabel):
```
announcements
ai_api_keys
ai_providers
ai_system_settings
attendance
audit_logs
broadcasts
class_students
classes
expenses
grades
library_books
multimedia_settings
payment_transactions
profiles
promotion_history
safings_accounts
safings_transactions
schedule_periods
schedules
school_settings
staff
student_bills
subjects
subject_groups
tutoring_classes
```

✅ Jika semua 28 tabel muncul = BERHASIL!

---

## 🔑 TEST LOGIN

Setelah database ready:

1. Start dev server: `npm run dev`
2. Buka app: http://localhost:3000
3. Login dengan:
   - **Email**: `admin@eduadmin.com`
   - **Password**: `EduAdmin@2026!`

✅ Jika login berhasil = DATABASE SIAP DIGUNAKAN!

---

## 📊 SUMMARY

| Item | Details |
|------|---------|
| **Database ID** | `77d7d271-5515-4cd1-8865-5cd676d4752b` |
| **Total Tables** | 28 |
| **Total Files** | 28 SQL files |
| **Admin Username** | `admin@eduadmin.com` |
| **Admin Password** | `EduAdmin@2026!` |
| **Execution Method** | One file at a time via Wrangler CLI |
| **Total Execution Time** | ~2-3 minutes |

---

## 💡 TIPS

1. **Jangan skip** file `01_profiles.sql` - ini harus pertama karena berisi ADMIN USER
2. **Urutan penting** - execute files dalam urutan karena ada FOREIGN KEY relationships
3. **Jika ada error** - cek folder `d1_sql` apakah file sudah lengkap dan benar
4. **Backup before execute** - sebaiknya backup existing data dulu
5. **Copy-paste URL** di PowerShell mungkin ada masalah path, gunakan relative path atau full path

---

## 🎯 NEXT STEPS

1. ✅ Execute semua 28 file (2-3 menit)
2. ✅ Verify dengan query SELECT
3. ✅ Test login dengan admin credentials
4. ✅ Start development

Selamat! Database D1 Anda siap production! 🚀

---

**Last Updated**: May 22, 2026
**Version**: 1.0
**Status**: Ready to Execute
