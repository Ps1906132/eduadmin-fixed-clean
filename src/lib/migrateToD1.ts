import { db } from './db';
import { hashPassword } from '../../utils/auth';

export interface MigrationStatus {
  success: boolean;
  message: string;
  details?: {
    profiles: number;
    staff: number;
    classes: number;
    students: number;
    bills: number;
    expenses: number;
  };
}

export async function migrateLocalStorageToD1(forceReset = false): Promise<MigrationStatus> {
  const details = {
    profiles: 0,
    staff: 0,
    classes: 0,
    students: 0,
    bills: 0,
    expenses: 0
  };

  try {
    if (forceReset) {
      // Clear relevant tables in D1 to avoid duplication/corruption
      await db.from('student_bills').delete().neq('id', 'none');
      await db.from('expenses').delete().neq('id', 'none');
      await db.from('students').delete().neq('id', 'none');
      await db.from('classes').delete().neq('id', 'none');
      await db.from('staff').delete().neq('id', 'none');
      await db.from('profiles').delete().neq('email', 'admin@eduadmin.com');
    }
    // 1. Migrate Teachers & Staff -> profiles & staff tables
    const teachersRaw = localStorage.getItem('teachers_data_v11') || localStorage.getItem('teachers_data_v10');
    const teachers = teachersRaw ? JSON.parse(teachersRaw) : [];
    
    // Track staff IDs by their name for homeroom assignment
    const staffNameToIdMap: Record<string, string> = {};

    for (const teacher of teachers) {
      const email = teacher.email || `${teacher.username || 'staff' + Math.floor(Math.random() * 1000)}@eduadmin.com`;
      const id = teacher.id ? teacher.id.toString() : `prof-staff-${Math.random().toString(36).substring(2, 9)}`;
      
      // Let's create profile
      const rawRole = (teacher.role || teacher.jabatan || 'gm').toLowerCase();
      let role = 'gm';
      if (rawRole.includes('kepala sekolah')) role = 'ks';
      else if (rawRole.includes('wali kelas') || rawRole.includes('guru kelas')) role = 'wk';
      else if (rawRole.includes('bimbel') || rawRole.includes('guru bimbel')) role = 'gb';
      else if (['admin', 'kurikulum', 'keuangan', 'multimedia', 'operator'].some(r => rawRole.includes(r))) role = 'admin';

      const passwordPlain = teacher.password || 'password123';
      // Hash password if not already hashed
      const passwordHash = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(passwordPlain)
        ? passwordPlain
        : await hashPassword(passwordPlain);

      // Check if profile already exists in DB
      const { data: existingProfile } = await db.from('profiles').select('id').eq('email', email).single();
      
      let profileId = id;
      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        await db.from('profiles').insert([{
          id: profileId,
          email,
          full_name: teacher.nama || 'Nama Guru',
          role,
          avatar_url: teacher.avatar || null,
          password_hash: passwordHash, // Store inside D1
          is_active: 1
        }]);
        details.profiles++;
      }

      staffNameToIdMap[teacher.nama] = profileId;

      // Create staff record
      const { data: existingStaff } = await db.from('staff').select('id').eq('profile_id', profileId).single();
      if (!existingStaff) {
        await db.from('staff').insert([{
          id: profileId, // use same UUID
          profile_id: profileId,
          nip: teacher.nip || `NIP-${Math.floor(Math.random() * 1000000)}`,
          position: teacher.jabatan || 'Guru',
          department: teacher.mapel || 'Umum',
          is_active: 1
        }]);
        details.staff++;
      }
    }

    // 2. Migrate Classes -> classes table
    const classesRaw = localStorage.getItem('classes_data_v11') || localStorage.getItem('classes_data_v10');
    const classes = classesRaw ? JSON.parse(classesRaw) : [];
    const classNameToIdMap: Record<string, string> = {};

    for (const cls of classes) {
      const id = cls.id ? cls.id.toString() : `class-${Math.random().toString(36).substring(2, 9)}`;
      const homeroomTeacherId = cls.wali ? (staffNameToIdMap[cls.wali] || null) : null;
      
      const { data: existingClass } = await db.from('classes').select('id').eq('name', cls.nama).single();
      
      let classId = id;
      if (existingClass) {
        classId = existingClass.id;
      } else {
        await db.from('classes').insert([{
          id: classId,
          name: cls.nama,
          grade_level: parseInt(cls.tingkat) || 1,
          academic_year_id: 'ay-2024-2025',
          homeroom_teacher_id: homeroomTeacherId,
          capacity: parseInt(cls.kuota) || 30,
          is_active: 1
        }]);
        details.classes++;
      }
      classNameToIdMap[cls.nama] = classId;
    }

    // 3. Migrate Students -> profiles & students tables
    const studentsRaw = localStorage.getItem('students_data_v11') || localStorage.getItem('students_data_v10');
    const students = studentsRaw ? JSON.parse(studentsRaw) : [];
    const studentOldIdToNewIdMap: Record<string, string> = {};

    for (const student of students) {
      const email = student.email || `${student.nis || 'student' + Math.floor(Math.random() * 100000)}@eduadmin.com`;
      const id = student.id ? student.id.toString() : `prof-stud-${Math.random().toString(36).substring(2, 9)}`;
      const classId = classNameToIdMap[student.kelas] || null;

      const { data: existingStudentProfile } = await db.from('profiles').select('id').eq('email', email).single();
      
      let profileId = id;
      if (existingStudentProfile) {
        profileId = existingStudentProfile.id;
      } else {
        await db.from('profiles').insert([{
          id: profileId,
          email,
          full_name: student.nama,
          role: 'ot', // default role parent
          is_active: 1
        }]);
        details.profiles++;
      }

      studentOldIdToNewIdMap[student.id] = profileId;

      const { data: existingStudent } = await db.from('students').select('id').eq('profile_id', profileId).single();
      if (!existingStudent) {
        await db.from('students').insert([{
          id: profileId,
          profile_id: profileId,
          nis: student.nis || `NIS-${Math.floor(Math.random() * 10000)}`,
          full_name: student.nama,
          gender: student.gender || 'L',
          parent_name: student.ayah || student.ibu || 'Orang Tua',
          class_id: classId,
          status: 'active'
        }]);
        details.students++;
      }
    }

    // 4. Migrate Bills & Expenses -> student_bills & expenses tables
    const billsRaw = localStorage.getItem('finance_student_bills_v10');
    const bills = billsRaw ? JSON.parse(billsRaw) : [];

    for (const bill of bills) {
      const studentId = studentOldIdToNewIdMap[bill.studentId] || bill.studentId;
      const { data: existingBill } = await db.from('student_bills').select('id').eq('id', bill.id.toString()).single();

      if (!existingBill) {
        await db.from('student_bills').insert([{
          id: bill.id.toString(),
          student_id: studentId,
          payment_type_id: bill.paymentName,
          amount: bill.amount,
          status: bill.status === 'Lunas' ? 'paid' : 'unpaid'
        }]);
        details.bills++;
      }
    }

    const expensesRaw = localStorage.getItem('finance_expenses_v10');
    const expenses = expensesRaw ? JSON.parse(expensesRaw) : [];

    for (const exp of expenses) {
      const { data: existingExpense } = await db.from('expenses').select('id').eq('id', exp.id.toString()).single();

      if (!existingExpense) {
        await db.from('expenses').insert([{
          id: exp.id.toString(),
          category: exp.category,
          amount: exp.amount,
          expense_date: exp.date || new Date().toISOString().split('T')[0],
          description: exp.description
        }]);
        details.expenses++;
      }
    }

    return {
      success: true,
      message: 'Migrasi data dari LocalStorage ke Cloudflare D1 berhasil diselesaikan!',
      details
    };
  } catch (error: any) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migrasi gagal: ${error.message || 'Kesalahan tidak diketahui'}`
    };
  }
}
