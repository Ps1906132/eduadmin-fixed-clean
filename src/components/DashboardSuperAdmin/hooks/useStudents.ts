import React, { useState, useEffect, useCallback } from 'react';
import bcrypt from 'bcryptjs';
import { addStudent as addStudentToShared } from '../../../data/sharedData';
import { toast } from 'react-hot-toast';

export interface Student {
    id: string | number;
    nis: string;
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
                        const paralel = (c.name || '').replace(/[0-9\s]/g, '').trim() || 'A';
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
        // ✅ BACKUP original data for rollback
        const backupStudents = students;
        
        // ✅ Optimistic update — update UI dulu
        const updatedStudents = [...students, student];
        setStudents(updatedStudents);
        addStudentToShared(student);

        // Sync ke D1 via API
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            
            const ttlParts = student.ttl?.split(', ') || [];
            const birth_place = ttlParts[0] || null;
            const birth_date = indonesianDateToISO(ttlParts[1]);

            // 1. Create Profile first for authentication
            let profileId = `prof-std-${student.nis}`;
            const password = student.password || student.nis;
            const passwordHash = bcrypt.hashSync(password, 10);

            const profRes = await fetch('/api/profiles', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: profileId,
                    email: student.nis,
                    full_name: student.nama,
                    password_hash: passwordHash,
                    role: 'ortu',
                    is_active: 1
                })
            }).catch(() => null);

            if (!profRes || !profRes.ok) {
                console.warn('Profile creation failed, student will be created without profile link');
                profileId = null as any;
            }

            // 2. Insert student record (only valid columns matching D1 schema)
            const res = await fetch('/api/students', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: student.id.toString(),
                    profile_id: profileId,
                    nis: student.nis,
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
            setStudents(backupStudents);
            alert(`Gagal menambah siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const updateStudent = async (id: string | number, updates: Partial<Student>) => {
        const idStr = id.toString();

        // ✅ BACKUP original data for rollback
        const backupStudents = students;

        // ✅ Optimistic update — update UI dulu
        const updatedStudents = students.map(s => s.id.toString() === idStr ? { ...s, ...updates } : s);
        setStudents(updatedStudents);

        try {
            const token = localStorage.getItem('eduadmin_token');
            const dbUpdates: any = {};
            if (updates.nama !== undefined) dbUpdates.full_name = updates.nama;
            if (updates.nis !== undefined) dbUpdates.nis = updates.nis;
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

            // Ensure profile exists on update as well
            if (updates.nis || updates.nama) {
                try {
                    const studentData = students.find(s => s.id.toString() === idStr);
                    const nis = updates.nis || studentData?.nis;
                    const nama = updates.nama || studentData?.nama;
                    
                    if (nis) {
                        let profileId = `prof-std-${nis}`;
                        const password = nis; // Default to NIS
                        const passwordHash = bcrypt.hashSync(password, 10);
                        
                        await fetch('/api/profiles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                id: profileId,
                                email: nis,
                                full_name: nama || 'Student',
                                password_hash: passwordHash,
                                role: 'ortu',
                                is_active: 1
                            })
                        }).catch(() => null); // Ignore if exists
                        
                        dbUpdates.profile_id = profileId;
                    }
                } catch (profErr) {
                    console.warn('Failed to ensure profile on update:', profErr);
                }
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
            setStudents(backupStudents);
            alert(`Gagal update siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            
            // ✅ BACKUP original data for rollback
            const backupStudents = students;
            
            // ✅ Optimistic update — hapus dari UI dulu
            const updatedStudents = students.filter(s => s.id.toString() !== targetIdStr);
            setStudents(updatedStudents);

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
                setStudents(backupStudents);
                alert(`Gagal menghapus siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ["NIS", "Nama Lengkap", "Tempat Tanggal Lahir", "Kelas", "Tingkat", "Paralel", "Nama Ayah", "Nama Ibu", "Pekerjaan Ayah", "Pekerjaan Ibu", "No HP (WA)", "Username"];
        const csvContent = headers.join(",") + "\n" + 
            "2025001,Asep Irama,\"Bandung, 10 Maret 2012\",1 A,1,A,Sule,Susi,Wiraswasta,IRT,08123456789,asep001";
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
        input.accept = '.csv, .txt';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                if (!text) return;

                const lines = text.split('\n').filter(l => l.trim() !== '');
                if (lines.length <= 1) return;

                const parsedData: Student[] = lines.slice(1).map((line, idx) => {
                    // Handle quoted CSV values correctly
                    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
                    return {
                        id: `temp-${Date.now()}-${idx}`,
                        nis: cols[0] || '',
                        nama: cols[1] || '',
                        ttl: cols[2] || '',
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
                }).filter(s => s.nis && s.nama);

                if (parsedData.length > 0) {
                    setStudents(prev => [...prev, ...parsedData]);
                    alert(`Berhasil memuat ${parsedData.length} data siswa! Klik Simpan untuk mensinkronisasi ke database.`);
                }
            };
            reader.readAsText(file);
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
            alert("Tidak ada data baru untuk disimpan.");
            setLoading(false);
            return;
        }

        for (const student of newStudents) {
            try {
                // Change temp ID to real ID based on NIS or timestamp
                const realId = `std-${student.nis}-${Date.now()}`;
                await addNewStudent({ ...student, id: realId });
                successCount++;
            } catch (err) {
                toast.error(`Gagal simpan siswa ${student.nama}`);
                console.error(`Gagal simpan siswa ${student.nama}:`, err);
                failCount++;
            }
        }

        setLoading(false);
        alert(`Selesai! ${successCount} siswa berhasil disimpan, ${failCount} gagal.`);
        fetchStudents(); // Refresh data from server
    };

    return {
        students,
        setStudents,
        loading,
        addNewStudent,
        updateStudent,
        updateStudents,
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
