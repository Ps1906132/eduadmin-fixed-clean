# EduAdmin - Supabase Database Schema

## 📋 Overview

Schema database lengkap untuk sistem EduAdmin - Sistem Manajemen Sekolah berbasis Supabase. Schema ini mencakup semua fitur utama sistem manajemen sekolah modern.

## 🏗️ Database Structure

### Core Tables

#### 1. **Authentication & Users**
- `profiles` - User profiles (extends Supabase auth)
- `staff` - Staff details

#### 2. **Academic Structure**
- `academic_years` - Tahun akademik
- `subject_groups` - Kelompok mata pelajaran
- `subjects` - Mata pelajaran
- `classes` - Kelas
- `students` - Data siswa

#### 3. **Academic Management**
- `schedules` - Jadwal pelajaran
- `attendance` - Absensi siswa
- `grades` - Nilai siswa
- `report_cards` - Rapot siswa

#### 4. **Finance Management**
- `cash_accounts` - Rekening kas
- `payment_types` - Jenis pembayaran
- `student_bills` - Tagihan siswa
- `payment_transactions` - Transaksi pembayaran
- `expenses` - Pengeluaran

#### 5. **Savings Management**
- `savings_accounts` - Rekening tabungan siswa
- `savings_transactions` - Transaksi tabungan

#### 6. **Communication**
- `announcements` - Pengumuman
- `notifications` - Notifikasi

#### 7. **Library & Multimedia**
- `library_books` - Koleksi perpustakaan
- `book_borrowings` - Peminjaman buku
- `multimedia_content` - Konten multimedia

## 🚀 Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Wait for setup completion

### 2. Configure Database

1. Open Supabase SQL Editor
2. Copy and paste the entire `supabase_schema.sql` content
3. Execute the SQL script

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Configure site URL and redirect URLs
3. Set up authentication providers if needed

### 4. Environment Variables

Update your `.env.local` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Basic policies included
- ⚠️ **Customize policies** according to your security requirements

### User Roles
- `admin` - Super Administrator
- `ks` - Kepala Sekolah
- `gm` - Guru Mata Pelajaran
- `wk` - Wali Kelas
- `gb` - Guru Bimbel
- `ot` - Orang Tua

## 📊 Key Features

### Automatic Features
- ✅ Auto-updating timestamps
- ✅ Student bill status updates
- ✅ Balance calculations for savings
- ✅ Attendance tracking

### Performance Optimizations
- ✅ Strategic indexes
- ✅ Optimized queries
- ✅ Database views for common operations

### Data Integrity
- ✅ Foreign key constraints
- ✅ Check constraints
- ✅ Unique constraints
- ✅ Enum types for consistency

## 🔄 Data Migration

### From Current Hardcoded Data

1. **Students**: Migrate from `studentsDataGlobal`
2. **Staff**: Migrate from `stafList`
3. **Subjects**: Migrate from `subjectGroups` and `subjects`
4. **Classes**: Migrate from `classes` data
5. **Finance**: Migrate from localStorage data

### Migration Scripts

Create migration scripts in Supabase SQL Editor:

```sql
-- Example: Migrate students
INSERT INTO public.students (
    nis, nisn, full_name, gender, birth_date, birth_place,
    address, phone, email, parent_name, parent_phone, parent_email,
    enrollment_date, class_id
)
SELECT
    nis, nisn, nama, jenis_kelamin, tanggal_lahir, tempat_lahir,
    alamat, telepon, email, nama_ortu, telepon_ortu, email_ortu,
    tanggal_masuk, class_id
FROM migration.students_temp;
```

## 📈 Database Views

### Available Views

1. **`student_overview`** - Comprehensive student information
2. **`financial_summary`** - Income/expense summary for last 30 days

### Usage Examples

```sql
-- Get student overview
SELECT * FROM public.student_overview WHERE class_name = '1A';

-- Get financial summary
SELECT * FROM public.financial_summary
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date;
```

## 🔧 Maintenance

### Regular Tasks

1. **Update Academic Year**: Set new active academic year annually
2. **Archive Old Data**: Move historical data to archive tables
3. **Update Balances**: Recalculate account balances periodically
4. **Clean Notifications**: Remove old read notifications

### Backup Strategy

1. **Automatic Backups**: Supabase provides automatic daily backups
2. **Manual Exports**: Use Supabase dashboard for manual exports
3. **Point-in-time Recovery**: Available for 7 days

## 🚨 Important Notes

### Security Considerations
- **Review RLS Policies**: Current policies are basic - customize for your needs
- **API Keys**: Never expose service role key in client-side code
- **File Storage**: Configure Supabase Storage for file uploads

### Performance Considerations
- **Indexes**: Monitor query performance and add indexes as needed
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider caching frequently accessed data

### Data Privacy
- **GDPR Compliance**: Implement data deletion policies
- **Audit Logs**: Track sensitive data changes
- **Encryption**: Sensitive data is automatically encrypted by Supabase

## 🆘 Troubleshooting

### Common Issues

1. **RLS Blocking Queries**
   - Check user authentication
   - Verify RLS policies
   - Use service role for admin operations

2. **Foreign Key Violations**
   - Ensure data dependencies exist
   - Check data import order
   - Use transactions for bulk inserts

3. **Performance Issues**
   - Check query execution plans
   - Add missing indexes
   - Optimize complex queries

## 📞 Support

For issues with this schema:
1. Check Supabase documentation
2. Review PostgreSQL error messages
3. Test queries in Supabase SQL Editor
4. Check application logs for detailed errors

---

**Last Updated:** January 26, 2026
**Schema Version:** 1.0.0