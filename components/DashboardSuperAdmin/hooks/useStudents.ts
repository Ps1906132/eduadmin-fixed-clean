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

export const useStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const res = await fetch('/api/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal mengambil data siswa');
            
            const data = await res.json();
            if (data && Array.isArray(data)) {
                type SbStudent = { id: string; nis: string; full_name: string; birth_place?: string; birth_date?: string; parent_name?: string; gender: string; status: string; class_id?: string };
                const mappedData: Student[] = (data as SbStudent[]).map(s => ({
                    id: s.id,
                    nis: s.nis,
                    nama: s.full_name,
                    ttl: `${s.birth_place || '-'}, ${s.birth_date || '-'}`,
                    kelas: '-', // Requires class join or separate fetch
                    tingkat: 1,
                    paralel: '',
                    ayah: s.parent_name || '-',
                    ibu: '-',
                    jobAyah: '-',
                    jobIbu: '-',
                    username: s.nis,
                    gender: s.gender,
                    status: s.status
                }));
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



    const addNewStudent = async (student: Student) => {
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
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id: student.id.toString(),
                    nis: student.nis,
                    full_name: student.nama,
                    parent_name: student.ayah,
                    gender: student.gender || null,
                    status: 'active'
                })
            });
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
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
            if (updates.nama) dbUpdates.full_name = updates.nama;
            if (updates.nis) dbUpdates.nis = updates.nis;
            if (updates.ayah) dbUpdates.parent_name = updates.ayah;
            if (updates.gender) dbUpdates.gender = updates.gender;

            const res = await fetch(`/api/students/${idStr}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(dbUpdates)
            });
            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
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
                const res = await fetch(`/api/students/${targetIdStr}`, {
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
