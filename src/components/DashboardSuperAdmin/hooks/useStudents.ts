import React, { useState, useEffect, useCallback } from 'react';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { addStudent as addStudentToShared } from '../../../data/sharedData';
import { toast } from 'react-hot-toast';

/**
 * Parse file (CSV/XLSX) into array of string arrays (rows).
 * Uses SheetJS for both CSV and Excel to correctly handle quoted fields with commas.
 */
export const parseFileToRows = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) { resolve([]); return; }

                const ext = file.name.split('.').pop()?.toLowerCase();
                if (ext === 'xlsx' || ext === 'xls') {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonRows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
                    const rows = jsonRows
                        .map(row => row.map(cell => String(cell ?? '').trim()))
                        .filter(row => row.some(cell => cell !== ''));
                    resolve(rows);
                } else {
                    const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
                    const workbook = XLSX.read(text, { type: 'string', raw: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonRows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
                    const rows = jsonRows
                        .map(row => row.map(cell => String(cell ?? '').trim()))
                        .filter(row => row.some(cell => cell !== ''));
                    resolve(rows);
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsText(file);
    });
};

/**
 * Parse a CSV/XLSX row into a Student object.
 * Auto-detects format:
 *   - 14+ cols with "NISN" header → newest format (NISN + TTL split)
 *   - 13+ cols with "Tempat Lahir" header → new format (TTL split)
 *   - 12 cols or "Tempat Tanggal Lahir" header → old format (TTL combined)
 */
const parseRowToStudent = (cols: string[], idx: number, isOldFormat: boolean, hasNisn: boolean): Student => {
    if (hasNisn) {
        // NEWEST FORMAT (14 cols): NIS,NISN,Nama,Tempat Lahir,Tanggal Lahir,Kelas,Tingkat,Paralel,Ayah,Ibu,JobAyah,JobIbu,HP,Username
        const tempatLahir = cols[3] || '';
        const tanggalLahir = cols[4] || '';
        const ttl = tempatLahir && tanggalLahir ? `${tempatLahir}, ${tanggalLahir}` : tempatLahir || tanggalLahir || '';
        return {
            id: `temp-${Date.now()}-${idx}`,
            nis: cols[0] || '',
            nisn: cols[1] || '',
            nama: cols[2] || '',
            ttl,
            kelas: cols[5] || '',
            tingkat: parseInt(cols[6] || '1'),
            paralel: cols[7] || 'A',
            ayah: cols[8] || '',
            ibu: cols[9] || '',
            jobAyah: cols[10] || '',
            jobIbu: cols[11] || '',
            username: cols[13] || cols[0] || '',
            noHp: cols[12] || ''
        };
    } else if (isOldFormat) {
        // OLD FORMAT (12 cols): NIS,Nama,Tempat Tanggal Lahir,Kelas,Tingkat,Paralel,Ayah,Ibu,JobAyah,JobIbu,HP,Username
        const ttlRaw = cols[2] || '';
        return {
            id: `temp-${Date.now()}-${idx}`,
            nis: cols[0] || '',
            nama: cols[1] || '',
            ttl: ttlRaw,
            kelas: cols[3] || '',
            tingkat: parseInt(cols[4] || '1'),
            paralel: cols[5] || 'A',
            ayah: cols[6] || '',
            ibu: cols[7] || '',
            jobAyah: cols[8] || '',
            jobIbu: cols[9] || '',
            username: cols[11] || cols[0] || '',
            noHp: cols[10] || ''
        };
    } else {
        // NEW FORMAT (13 cols): NIS,Nama,Tempat Lahir,Tanggal Lahir,Kelas,Tingkat,Paralel,Ayah,Ibu,JobAyah,JobIbu,HP,Username
        const tempatLahir = cols[2] || '';
        const tanggalLahir = cols[3] || '';
        const ttl = tempatLahir && tanggalLahir ? `${tempatLahir}, ${tanggalLahir}` : tempatLahir || tanggalLahir || '';
        return {
            id: `temp-${Date.now()}-${idx}`,
            nis: cols[0] || '',
            nama: cols[1] || '',
            ttl,
            kelas: cols[4] || '',
            tingkat: parseInt(cols[5] || '1'),
            paralel: cols[6] || 'A',
            ayah: cols[7] || '',
            ibu: cols[8] || '',
            jobAyah: cols[9] || '',
            jobIbu: cols[10] || '',
            username: cols[12] || cols[0] || '',
            noHp: cols[11] || ''
        };
    }
};

/**
 * Detect if CSV is old format (12 cols, TTL combined) or new format (13 cols, TTL split).
 * Returns { isOldFormat, hasNisn } to support 3 formats:
 *   - 14+ cols with "NISN" header → newest format
 *   - 13+ cols with "Tempat Lahir" header → new format
 *   - 12 cols or "Tempat Tanggal Lahir" header → old format
 */
export const detectOldFormat = (headerCols: string[]): { isOldFormat: boolean; hasNisn: boolean } => {
    const headerText = headerCols.join(',').toLowerCase();
    const hasNisn = headerCols.some(h => h.toLowerCase().includes('nisn'));
    if (hasNisn) return { isOldFormat: false, hasNisn: true };
    if (headerText.includes('tempat tanggal lahir')) return { isOldFormat: true, hasNisn: false };
    if (headerCols.length <= 12) return { isOldFormat: true, hasNisn: false };
    return { isOldFormat: false, hasNisn: false };
};

export interface Student {
    id: string | number;
    nis: string;
    nisn?: string;
    nama: string;
    ttl: string;
    kelas: string;
    tingkat: number;
    paralel: string;
    ayah: string;
    ibu: string;
    jobAyah: string;
    jobIbu: string;
    username: string;
    noHp?: string;
    // Optional fields for compatibility
    gender?: string;
    sppStatus?: string;
    tabungan?: number;
    status?: string;
}

const indonesianDateToISO = (dateStr: string) => {
    if (!dateStr) return null;
    const trimmed = dateStr.trim();
    
    // If it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    const months: Record<string, string> = {
        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };
    
    // Try splitting by space or hyphen or slash
    const parts = trimmed.split(/[\s\-\/]+/);
    if (parts.length !== 3) return null;
    
    let day, month, year;
    
    if (months[parts[1]]) {
        // Format: DD Month YYYY
        day = parts[0].padStart(2, '0');
        month = months[parts[1]];
        year = parts[2];
    } else if (months[parts[0]]) {
        // Format: Month DD YYYY
        month = months[parts[0]];
        day = parts[1].padStart(2, '0');
        year = parts[2];
    } else if (/^\d{1,2}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1])) {
        // Format: DD-MM-YYYY
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
    } else {
        return null;
    }
    
    return month ? `${year}-${month}-${day}` : null;
};

export const useStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch students and class assignments in parallel
            const [studentRes, classStudentRes, classRes] = await Promise.all([
                fetch('/api/students', { headers }),
                fetch('/api/class_students', { headers }).catch(() => null),
                fetch('/api/classes', { headers }).catch(() => null)
            ]);

            if (!studentRes.ok) throw new Error('Gagal mengambil data siswa');
            
            const data = await studentRes.json();

            // Build class lookup maps
            let classStudentMap: Record<string, string> = {}; // studentId -> classId
            let classNameMap: Record<string, { name: string; grade: number; paralel: string }> = {};

            if (classStudentRes && classStudentRes.ok) {
                const csData = await classStudentRes.json();
                if (Array.isArray(csData)) {
                    csData.forEach((cs: any) => {
                        classStudentMap[cs.student_id?.toString()] = cs.class_id?.toString();
                    });
                }
            }

            if (classRes && classRes.ok) {
                const clData = await classRes.json();
                if (Array.isArray(clData)) {
                    clData.forEach((c: any) => {
                        // Extract paralel from class name
                        // "Kelas 1A" -> "A", "1 A" -> "A", "1A" -> "A", "Kelas 2B" -> "B"
                        const rawName = (c.name || '').trim();
                        const cleaned = rawName.replace(/kelas\s*/i, '').replace(/\s+/g, '').toUpperCase();
                        // Last character(s) that are letters = paralel
                        const paralelMatch = cleaned.match(/[A-Z]+$/);
                        const paralel = paralelMatch ? paralelMatch[0] : 'A';
                        classNameMap[c.id?.toString()] = {
                            name: c.name || '-',
                            grade: Number(c.grade_level) || 1,
                            paralel
                        };
                    });
                }
            }

            if (data && Array.isArray(data)) {
                type SbStudent = { id: string; nis: string; full_name: string; birth_place?: string; birth_date?: string; parent_name?: string; mother_name?: string; parent_job?: string; mother_job?: string; phone?: string; gender: string; status: string; class_id?: string; username?: string; };
                const mappedData: Student[] = (data as SbStudent[]).map(s => {
                    const classId = classStudentMap[s.id?.toString()] || s.class_id || '';
                    const classInfo = classNameMap[classId] || { name: '-', grade: 1, paralel: '' };
                    
                    // Convert ISO date back to Indonesian for UI
                    let formattedDate = s.birth_date || '-';
                    if (s.birth_date && s.birth_date.includes('-')) {
                        try {
                            // Use T00:00:00 to avoid timezone shifts
                            const d = new Date(s.birth_date + 'T00:00:00');
                            formattedDate = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                        } catch (e) {}
                    }

                    return {
                        id: s.id,
                        nis: s.nis,
                        nama: s.full_name,
                        ttl: `${s.birth_place || '-'}${formattedDate !== '-' ? ', ' + formattedDate : ''}`,
                        kelas: classInfo.name,
                        tingkat: classInfo.grade,
                        paralel: classInfo.paralel,
                        ayah: s.parent_name || '-',
                        ibu: s.mother_name || '-',
                        jobAyah: s.parent_job || '-',
                        jobIbu: s.mother_job || '-',
                        username: s.username || s.nis,
                        gender: s.gender,
                        status: s.status
                    };
                });
                setStudents(mappedData);
            }
        } catch (err) {
            toast.error('Gagal memuat data siswa');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);



    const addNewStudent = async (student: Student & { classId?: string; noHp?: string; password?: string }) => {
        // ✅ Optimistic update — use functional updater to avoid stale closure
        setStudents(prev => [...prev, student]);
        addStudentToShared(student);

        // Sync ke D1 via API
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            
            const ttlParts = student.ttl?.split(', ') || [];
            const birth_place = ttlParts[0] || null;
            const birth_date = indonesianDateToISO(ttlParts[1]);

            // 1. Student profile tidak dibuat — login menggunakan parent profile (prof-ortu-{NIS})
            let profileId = null;

            // 2. Insert student record (only valid columns matching D1 schema)
            const res = await fetch('/api/students', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: student.id.toString(),
                    profile_id: profileId,
                    nis: student.nis,
                    nisn: student.nisn || null,
                    full_name: student.nama,
                    birth_place,
                    birth_date,
                    parent_name: student.ayah || null,
                    mother_name: student.ibu || null,
                    parent_job: student.jobAyah || null,
                    mother_job: student.jobIbu || null,
                    phone: (student as any).noHp || null,
                    gender: student.gender || null,
                    status: 'active',
                    enrollment_date: new Date().toISOString().split('T')[0]
                })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`API Error ${res.status}: ${errText}`);
            }

            // Also insert into class_students if classId provided
            const classId = (student as any).classId;
            if (classId) {
                try {
                    let academicYearId: string | null = null;
                    try {
                        let ayRes = await fetch('/api/academic_years?is_active=eq.1', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (ayRes.ok) {
                            const ayData = await ayRes.json();
                            if (Array.isArray(ayData) && ayData.length > 0) {
                                academicYearId = ayData[0].id;
                            }
                        }
                        if (!academicYearId) {
                            ayRes = await fetch('/api/academic_years?order=start_date.desc&limit=1', {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (ayRes.ok) {
                                const ayData = await ayRes.json();
                                if (Array.isArray(ayData) && ayData.length > 0) {
                                    academicYearId = ayData[0].id;
                                }
                            }
                        }
                    } catch (ayErr) {
                        console.warn('Gagal mengambil tahun ajaran:', ayErr);
                    }

                    if (!academicYearId) {
                        toast.error('Tahun ajaran tidak ditemukan. Buat tahun ajaran di Pengaturan terlebih dahulu.');
                    } else {
                        const csRes = await fetch('/api/class_students', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                id: `cs-${student.id}-${classId}`,
                                student_id: student.id.toString(),
                                class_id: classId.toString(),
                                academic_year_id: academicYearId,
                                enrollment_date: new Date().toISOString().split('T')[0],
                                is_active: 1
                            })
                        });
                        if (!csRes.ok) {
                            const errText = await csRes.text();
                            console.warn('Gagal menyimpan kelas siswa (class_students):', errText);
                            toast.error('Siswa tersimpan tetapi gagal menautkan ke kelas');
                        }
                    }
                } catch (csErr) {
                    console.warn('Gagal sync class_students:', csErr);
                    toast.error('Gagal menautkan siswa ke kelas');
                }
            }

            // 3. Create parent profile for authentication
            const parentPassword = student.password || student.nis;
            const parentPasswordHash = bcrypt.hashSync(parentPassword, 10);
            const parentProfileId = `prof-ortu-${student.nis}`;
            const parentUsername = `ortu_${student.nis}`;

            const parentProfRes = await fetch('/api/profiles', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: parentProfileId,
                    email: parentUsername,
                    full_name: student.ayah || student.ibu || `Orang Tua ${student.nama}`,
                    password_hash: parentPasswordHash,
                    role: 'ortu',
                    is_active: 1
                })
            }).catch(() => null);

            if (parentProfRes && parentProfRes.ok) {
                // Link parent to student via parent_students
                const psRes = await fetch('/api/parent_students', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: `ps-${student.id}-${parentProfileId}`,
                        parent_id: parentProfileId,
                        student_id: student.id.toString()
                    })
                }).catch(() => null);

                if (!psRes || !psRes.ok) {
                    console.warn('Gagal menautkan orang tua ke siswa');
                    toast.error('Akun orang tua dibuat tetapi gagal ditautkan ke siswa');
                }
            } else {
                console.warn('Parent profile creation failed, parent login may not work');
            }
        } catch (err) {
            toast.error('Gagal menambah siswa');
            console.error('Error adding student to D1:', err);
            await fetchStudents();
            toast.error(`Gagal menambah siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const updateStudent = async (id: string | number, updates: Partial<Student>) => {
        const idStr = id.toString();

        // ✅ Optimistic update — use functional updater
        setStudents(prev => prev.map(s => s.id.toString() === idStr ? { ...s, ...updates } : s));

        try {
            const token = localStorage.getItem('eduadmin_token');
            const dbUpdates: any = {};
            if (updates.nama !== undefined) dbUpdates.full_name = updates.nama;
            if (updates.nis !== undefined) dbUpdates.nis = updates.nis;
            if (updates.nisn !== undefined) dbUpdates.nisn = updates.nisn || null;
            if (updates.ayah !== undefined) dbUpdates.parent_name = updates.ayah;
            if (updates.ibu !== undefined) dbUpdates.mother_name = updates.ibu;
            if (updates.jobAyah !== undefined) dbUpdates.parent_job = updates.jobAyah;
            if (updates.jobIbu !== undefined) dbUpdates.mother_job = updates.jobIbu;
            if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
            if (updates.noHp !== undefined) dbUpdates.phone = updates.noHp;
            
            if (updates.ttl !== undefined) {
                const ttlParts = updates.ttl.split(', ');
                dbUpdates.birth_place = ttlParts[0] || null;
                dbUpdates.birth_date = indonesianDateToISO(ttlParts[1]);
            }

            // Student profile tidak dibuat — login menggunakan parent profile
            if (updates.nis || updates.nama) {
                dbUpdates.profile_id = null;
            }

            const res = await fetch(`/api/students?id=eq.${idStr}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dbUpdates)
            });
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
            }

            // If class-related fields are updated, also update class_students table
            if (updates.kelas) {
                try {
                    // Get the student's current class assignment
                    const csRes = await fetch(`/api/class_students?student_id=eq.${idStr}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (csRes.ok) {
                        const csData = await csRes.json();
                        if (Array.isArray(csData) && csData.length > 0) {
                            // Update existing class assignment
                            const currentCs = csData[0];
                            // Find the new class ID based on class name
                            const classRes = await fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
                            if (classRes.ok) {
                                const classData = await classRes.json();
                                if (Array.isArray(classData)) {
                                    const newClass = classData.find((c: any) => c.name === updates.kelas);
                                    if (newClass) {
                                        await fetch(`/api/class_students?id=eq.${currentCs.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                            body: JSON.stringify({ class_id: newClass.id.toString() })
                                        });
                                    }
                                }
                            }
                        } else {
                            // No existing class assignment, create new one
                            const classRes = await fetch('/api/classes', { headers: { 'Authorization': `Bearer ${token}` } });
                            if (classRes.ok) {
                                const classData = await classRes.json();
                                if (Array.isArray(classData)) {
                                    const newClass = classData.find((c: any) => c.name === updates.kelas);
                                    if (newClass) {
                                        let academicYearId: string | null = null;
                                        try {
                                            let ayRes = await fetch('/api/academic_years?is_active=eq.1', {
                                                headers: { 'Authorization': `Bearer ${token}` }
                                            });
                                            if (ayRes.ok) {
                                                const ayData = await ayRes.json();
                                                if (Array.isArray(ayData) && ayData.length > 0) {
                                                    academicYearId = ayData[0].id;
                                                }
                                            }
                                            if (!academicYearId) {
                                                ayRes = await fetch('/api/academic_years?order=start_date.desc&limit=1', {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (ayRes.ok) {
                                                    const ayData = await ayRes.json();
                                                    if (Array.isArray(ayData) && ayData.length > 0) {
                                                        academicYearId = ayData[0].id;
                                                    }
                                                }
                                            }
                                        } catch (ayErr) {
                                            console.warn('Gagal mengambil tahun ajaran:', ayErr);
                                        }

                                        if (academicYearId) {
                                            await fetch('/api/class_students', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                body: JSON.stringify({
                                                    id: `cs-${idStr}-${newClass.id}`,
                                                    student_id: idStr,
                                                    class_id: newClass.id.toString(),
                                                    academic_year_id: academicYearId,
                                                    enrollment_date: new Date().toISOString().split('T')[0],
                                                    is_active: 1
                                                })
                                            });
                                        } else {
                                            toast.error('Tahun ajaran tidak ditemukan. Tidak dapat menautkan siswa ke kelas.');
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (csErr) {
                    console.warn('Gagal update class_students:', csErr);
                }
            }

            // Sync parent profile on any update (upsert — creates if not exists)
            const studentData = students.find(s => s.id.toString() === idStr);
            const nis = updates.nis || studentData?.nis;
            if (nis) {
                const parentProfileId = `prof-ortu-${nis}`;
                const parentUsername = `ortu_${nis}`;
                const parentName = updates.ayah || studentData?.ayah || updates.ibu || studentData?.ibu || `Orang Tua ${studentData?.nama || ''}`;

                const parentProfRes = await fetch('/api/profiles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id: parentProfileId,
                        email: parentUsername,
                        full_name: parentName,
                        role: 'ortu',
                        is_active: 1
                    })
                }).catch(() => null);

                if (parentProfRes && parentProfRes.ok) {
                    const psRes = await fetch('/api/parent_students', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            id: `ps-${idStr}-${parentProfileId}`,
                            parent_id: parentProfileId,
                            student_id: idStr
                        })
                    }).catch(() => null);

                    if (!psRes || !psRes.ok) {
                        console.warn('Gagal menautkan orang tua ke siswa saat update');
                    }
                }
            }
        } catch (err) {
            toast.error('Gagal memperbarui data siswa');
            console.error('Error updating student in D1:', err);
            await fetchStudents();
            toast.error(`Gagal update siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const updateStudents = (updatedStudents: Student[]) => {
        setStudents(prev => {
            const newStudents = [...prev];
            updatedStudents.forEach(updated => {
                const index = newStudents.findIndex(s => s.id.toString() === updated.id.toString());
                if (index !== -1) newStudents[index] = updated;
            });
            return newStudents;
        });
    };

    /**
     * Persist class/tingkat changes for multiple students to D1.
     * Used by NaikKelasView for promotion and graduation.
     * Updates both `students` table (kelas, tingkat) and `class_students` table (class_id).
     */
    const persistStudentClassUpdates = async (
        updates: Array<{ studentId: string | number; newKelas: string; newTingkat: number }>
    ): Promise<{ success: boolean; error?: string }> => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return { success: false, error: 'Token tidak ditemukan' };

        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

        // Backup for rollback
        const backupStudents = students;

        // Optimistic update UI
        setStudents(prev => {
            const newStudents = [...prev];
            updates.forEach(u => {
                const idx = newStudents.findIndex(s => s.id.toString() === u.studentId.toString());
                if (idx !== -1) {
                    newStudents[idx] = { ...newStudents[idx], kelas: u.newKelas, tingkat: u.newTingkat };
                }
            });
            return newStudents;
        });

        try {
            // Fetch all classes to build name->id map
            let classNameToId: Record<string, string> = {};
            try {
                const classRes = await fetch('/api/classes', { headers });
                if (classRes.ok) {
                    const classData = await classRes.json();
                    if (Array.isArray(classData)) {
                        classData.forEach((c: any) => {
                            classNameToId[c.name?.toString()] = c.id?.toString();
                        });
                    }
                }
            } catch (e) {
                console.warn('Gagal fetch classes untuk mapping:', e);
            }

            // Fetch current class_students for each student
            const studentIds = updates.map(u => u.studentId.toString());
            const csMap: Record<string, any> = {}; // studentId -> class_student record
            try {
                for (const sid of studentIds) {
                    const csRes = await fetch(`/api/class_students?student_id=eq.${sid}`, { headers });
                    if (csRes.ok) {
                        const csData = await csRes.json();
                        if (Array.isArray(csData) && csData.length > 0) {
                            csMap[sid] = csData[0];
                        }
                    }
                }
            } catch (e) {
                console.warn('Gagal fetch class_students:', e);
            }

            // Process each student update
            const errors: string[] = [];
            for (const u of updates) {
                const sid = u.studentId.toString();
                try {
                    // 1. PATCH students table (kelas & tingkat via class mapping)
                    // Note: students table may not have 'kelas' column directly —
                    // the kelas info comes from class_students + classes join.
                    // We update class_students to point to the new class.

                    const newClassId = classNameToId[u.newKelas];

                    if (csMap[sid]) {
                        // Update existing class_students record
                        if (newClassId) {
                            const patchRes = await fetch(`/api/class_students?id=eq.${csMap[sid].id}`, {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify({ class_id: newClassId })
                            });
                            if (!patchRes.ok) {
                                errors.push(`Gagal update class_students untuk siswa ${sid}`);
                            }
                        }
                    } else if (newClassId) {
                        // No existing record — create new class_students
                        let academicYearId: string | null = null;
                        try {
                            let ayRes = await fetch('/api/academic_years?is_active=eq.1', { headers });
                            if (ayRes.ok) {
                                const ayData = await ayRes.json();
                                if (Array.isArray(ayData) && ayData.length > 0) academicYearId = ayData[0].id;
                            }
                            if (!academicYearId) {
                                ayRes = await fetch('/api/academic_years?order=start_date.desc&limit=1', { headers });
                                if (ayRes.ok) {
                                    const ayData = await ayRes.json();
                                    if (Array.isArray(ayData) && ayData.length > 0) academicYearId = ayData[0].id;
                                }
                            }
                        } catch (e) { /* skip */ }

                        if (academicYearId) {
                            const postRes = await fetch('/api/class_students', {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    id: `cs-${sid}-${newClassId}`,
                                    student_id: sid,
                                    class_id: newClassId,
                                    academic_year_id: academicYearId,
                                    enrollment_date: new Date().toISOString().split('T')[0],
                                    is_active: 1
                                })
                            });
                            if (!postRes.ok) {
                                errors.push(`Gagal membuat class_students baru untuk siswa ${sid}`);
                            }
                        }
                    }
                } catch (singleErr) {
                    errors.push(`Error updating siswa ${sid}: ${singleErr}`);
                }
            }

            if (errors.length > 0) {
                console.error('Beberapa update gagal:', errors);
                return { success: false, error: errors.join('; ') };
            }

            return { success: true };
        } catch (err) {
            // Rollback UI on total failure
            setStudents(backupStudents);
            const msg = err instanceof Error ? err.message : 'Unknown error';
            console.error('persistStudentClassUpdates error:', err);
            return { success: false, error: msg };
        }
    };


    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

    const handleViewStudent = (studentData: any) => {
        setSelectedStudent(studentData);
        setModalMode('view');
        setShowAddStudentModal(true);
    };

    const handleAddStudent = () => {
        setSelectedStudent({
            nis: '', nama: '', ttl: '', kelas: '1A', tingkat: 1, paralel: '',
            ayah: '', ibu: '', jobAyah: '', jobIbu: '', username: '', password: ''
        });
        setModalMode('add');
        setShowAddStudentModal(true);
    };

    const handleEditStudent = (studentData: any) => {
        setSelectedStudent(studentData);
        setModalMode('edit');
        setShowAddStudentModal(true);
    };

    const handleDelete = async (student: any) => {
        const id = student.id;
        const name = student.nama;
        if (confirm(`Apakah Anda yakin ingin menghapus data ${name}?`)) {
            const targetIdStr = id.toString();
            
            // ✅ Optimistic update — use functional updater
            setStudents(prev => prev.filter(s => s.id.toString() !== targetIdStr));

            try {
                const token = localStorage.getItem('eduadmin_token');

                // Clean up parent_students and parent profile
                try {
                    const psRes = await fetch(`/api/parent_students?student_id=eq.${targetIdStr}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (psRes.ok) {
                        const psData = await psRes.json();
                        if (Array.isArray(psData) && psData.length > 0) {
                            for (const ps of psData) {
                                await fetch(`/api/parent_students?id=eq.${ps.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (ps.parent_id) {
                                    await fetch(`/api/profiles?id=eq.${ps.parent_id}`, {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    }).catch(() => null);
                                }
                            }
                        }
                    }
                } catch (cleanupErr) {
                    console.warn('Gagal membersihkan data orang tua:', cleanupErr);
                }

                // Clean up class_students
                try {
                    await fetch(`/api/class_students?student_id=eq.${targetIdStr}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (csErr) {
                    console.warn('Gagal membersihkan class_students:', csErr);
                }

                const res = await fetch(`/api/students?id=eq.${targetIdStr}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    throw new Error(`API Error: ${res.status}`);
                }
            } catch (err) {
                toast.error('Gagal menghapus siswa');
                console.error('Error deleting student from D1:', err);
                await fetchStudents();
                toast.error(`Gagal menghapus siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["NIS", "NISN", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", "Kelas", "Tingkat", "Paralel", "Nama Ayah", "Nama Ibu", "Pekerjaan Ayah", "Pekerjaan Ibu", "No HP (WA)", "Username"];
        const csvContent = headers.join(",") + "\n" + 
            "2025001,0081234567,Asep Irama,Bandung,10 Maret 2012,Kelas 1A,1,A,Sule,Susi,Wiraswasta,IRT,08123456789,asep001";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "template_siswa_lengkap.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.txt,.xlsx,.xls';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const rows = await parseFileToRows(file);
                if (rows.length <= 1) return;

                const headerCols = rows[0];
                const { isOldFormat, hasNisn } = detectOldFormat(headerCols);

                const parsedData: Student[] = rows.slice(1).map((cols, idx) => {
                    return parseRowToStudent(cols, idx, isOldFormat, hasNisn);
                }).filter(s => s.nis && s.nama);

                if (parsedData.length > 0) {
                    setStudents(prev => [...prev, ...parsedData]);
                    toast.success(`Berhasil memuat ${parsedData.length} data siswa! Klik Simpan untuk menyimpan ke database.`, { duration: 5000 });
                }
            } catch (err) {
                toast.error(`Gagal membaca file: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        };
        input.click();
    };

    const handleSaveData = async () => {
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        // Only save students that have temporary IDs (newly uploaded)
        const newStudents = students.filter(s => s.id.toString().startsWith('temp-'));
        
        if (newStudents.length === 0) {
            toast("Tidak ada data baru untuk disimpan.", { icon: 'ℹ️' });
            setLoading(false);
            return;
        }

        // Remove temp students from state first (will be re-added with real IDs)
        setStudents(prev => prev.filter(s => !s.id.toString().startsWith('temp-')));

        // Fetch classes to resolve classId from class name
        let classMap: Record<string, string> = {};
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const classRes = await fetch('/api/classes', { headers });
            if (classRes.ok) {
                const classData = await classRes.json();
                if (Array.isArray(classData)) {
                    classData.forEach((c: any) => {
                        // Store multiple normalized forms for flexible matching
                        const rawName = (c.name || '').trim();
                        // "Kelas 1A" -> "1A", "1 A" -> "1A", "1A" -> "1A"
                        const normalized = rawName.replace(/kelas\s*/i, '').replace(/\s+/g, '').toUpperCase();
                        if (normalized) {
                            classMap[normalized] = c.id?.toString();
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Gagal fetch kelas untuk resolve classId:', e);
        }

        for (const student of newStudents) {
            try {
                const realId = `std-${student.nis}-${Date.now()}`;
                // Resolve classId from kelas name - flexible matching
                // "1 A" -> "1A", "Kelas 1A" -> "1A", "1A" -> "1A"
                const rawKelas = (student.kelas || '').trim();
                const normalizedKelas = rawKelas.replace(/kelas\s*/i, '').replace(/\s+/g, '').toUpperCase();
                const classId = classMap[normalizedKelas] || undefined;
                await addNewStudent({ ...student, id: realId, classId });
                successCount++;
            } catch (err) {
                toast.error(`Gagal simpan siswa ${student.nama}`);
                console.error(`Gagal simpan siswa ${student.nama}:`, err);
                failCount++;
            }
        }

        setLoading(false);
        if (failCount > 0) {
            toast.success(`${successCount} siswa berhasil disimpan.`, { duration: 4000 });
            toast.error(`${failCount} siswa gagal disimpan.`, { duration: 4000 });
        } else {
            toast.success(`${successCount} siswa berhasil disimpan ke database!`, { duration: 4000 });
        }
        await fetchStudents(); // Refresh data from server
    };

    return {
        students,
        setStudents,
        loading,
        addNewStudent,
        updateStudent,
        updateStudents,
        persistStudentClassUpdates,
        selectedStudent,
        setSelectedStudent,
        showAddStudentModal,
        setShowAddStudentModal,
        modalMode,
        setModalMode,
        handleViewStudent,
        handleAddStudent,
        handleEditStudent,
        handleDelete,
        handleDownloadTemplate,
        handleUploadClick,
        handleSaveData,
        refreshStudents: fetchStudents
    };
};
