import React, { useState, useEffect, useCallback } from 'react';
import { addStudent as addStudentToShared } from '../../../data/sharedData';

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
    // Optional fields for compatibility
    gender?: string;
    sppStatus?: string;
    tabungan?: number;
}

const indonesianDateToISO = (dateStr: string) => {
    if (!dateStr) return null;
    const months: Record<string, string> = {
        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length !== 3) return null;
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = parts[2];
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
                // Try loading from localStorage cache if no token
                const saved = localStorage.getItem('students_data_v11');
                if (saved) setStudents(JSON.parse(saved));
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
                            const d = new Date(s.birth_date);
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
                // ✅ SYNC to localStorage for offline fallback
                localStorage.setItem('students_data_v11', JSON.stringify(mappedData));
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            // ✅ FALLBACK to localStorage if API fails
            try {
                const saved = localStorage.getItem('students_data_v11');
                if (saved) {
                    const fallbackData = JSON.parse(saved);
                    setStudents(fallbackData);
                    console.log('Loaded students from localStorage cache');
                }
            } catch (cacheErr) {
                console.error('Failed to load from cache:', cacheErr);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);



    const addNewStudent = async (student: Student & { classId?: string; noHp?: string }) => {
        // ✅ BACKUP original data for rollback
        const backupStudents = students;
        
        // ✅ Optimistic update — update UI dulu
        const updatedStudents = [...students, student];
        setStudents(updatedStudents);
        addStudentToShared(student);

        // ✅ PERSIST to localStorage immediately
        localStorage.setItem('students_data_v11', JSON.stringify(updatedStudents));

        // Sync ke D1 via API
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            
            const ttlParts = student.ttl?.split(', ') || [];
            const birth_place = ttlParts[0] || null;
            const birth_date = indonesianDateToISO(ttlParts[1]);

            // Insert student record (only valid columns matching D1 schema)
            const res = await fetch('/api/students', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: student.id.toString(),
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
                    // Get active academic year from localStorage or use default
                    const academicYearId = localStorage.getItem('active_academic_year_id') || 'ay-2025-2026';
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
                        console.warn('Gagal menyimpan kelas siswa (class_students):', await csRes.text());
                    }
                } catch (csErr) {
                    console.warn('Gagal sync class_students:', csErr);
                }
            }
        } catch (err) {
            // ✅ ROLLBACK jika API gagal
            console.error('Error adding student to D1:', err);
            setStudents(backupStudents);
            localStorage.setItem('students_data_v11', JSON.stringify(backupStudents));
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

        // ✅ PERSIST to localStorage immediately
        localStorage.setItem('students_data_v11', JSON.stringify(updatedStudents));

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
            
            if (updates.ttl !== undefined) {
                const ttlParts = updates.ttl.split(', ');
                dbUpdates.birth_place = ttlParts[0] || null;
                dbUpdates.birth_date = indonesianDateToISO(ttlParts[1]);
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
                                        const academicYearId = localStorage.getItem('active_academic_year_id') || 'ay-2025-2026';
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
                                    }
                                }
                            }
                        }
                    }
                } catch (csErr) {
                    console.warn('Gagal update class_students:', csErr);
                }
            }
        } catch (err) {
            // ✅ ROLLBACK jika API gagal
            console.error('Error updating student in D1:', err);
            setStudents(backupStudents);
            localStorage.setItem('students_data_v11', JSON.stringify(backupStudents));
            alert(`Gagal update siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };
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
                                        const academicYearId = localStorage.getItem('active_academic_year_id') || 'ay-2025-2026';
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
                                    }
                                }
                            }
                        }
                    }
                } catch (csErr) {
                    console.warn('Gagal update class_students:', csErr);
                }
            }
        } catch (err) {
            // ✅ ROLLBACK jika API gagal
            console.error('Error updating student in D1:', err);
            setStudents(backupStudents);
            localStorage.setItem('students_data_v11', JSON.stringify(backupStudents));
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

            // ✅ PERSIST to localStorage immediately
            localStorage.setItem('students_data_v11', JSON.stringify(updatedStudents));

            try {
                const token = localStorage.getItem('eduadmin_token');
                const res = await fetch(`/api/students?id=eq.${targetIdStr}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    throw new Error(`API Error: ${res.status}`);
                }
            } catch (err) {
                // ✅ ROLLBACK jika API gagal
                console.error('Error deleting student from D1:', err);
                setStudents(backupStudents);
                localStorage.setItem('students_data_v11', JSON.stringify(backupStudents));
                alert(`Gagal menghapus siswa: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }
    };

    const handleDownloadTemplate = () => {
        alert("Mengunduh template Excel...");
    };

    const handleUploadClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .xls, .csv';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) alert(`File ${file.name} terpilih! Klik Simpan untuk memproses.`);
        };
        input.click();
    };

    const handleSaveData = () => {
        alert("Data berhasil disimpan ke database!");
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
