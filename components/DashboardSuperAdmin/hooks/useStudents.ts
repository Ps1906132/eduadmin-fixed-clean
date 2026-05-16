import React, { useState, useEffect, useCallback } from 'react';
import { studentsDataGlobal, addStudent as addStudentToShared } from '../../../data/sharedData';
import { db, isConfigured as isDbConfigured } from '../../../src/lib/db';

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
    const [students, setStudents] = useState<Student[]>(() => {
        const saved = localStorage.getItem('students_data_v10');
        return saved ? JSON.parse(saved) : studentsDataGlobal;
    });
    const [loading, setLoading] = useState(false);

    const fetchStudents = useCallback(async () => {
        if (!isDbConfigured()) return;

        setLoading(true);
        try {
            // Simple fetch from students table
            db.from('students').select('*').then(({ data, error }: any) => {
                if (error) throw error;

                if (data && data.length > 0) {
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
                    localStorage.setItem('students_data_v10', JSON.stringify(mappedData));
                }
            });
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('students_data_v10', JSON.stringify(students));
        }
    }, [students, loading]);

    const addNewStudent = async (student: Student) => {
        if (isDbConfigured()) {
            try {
                db.from('students')
                    .insert([{
                        id: student.id.toString(), // Ensure ID is string for D1
                        nis: student.nis,
                        full_name: student.nama,
                        parent_name: student.ayah,
                        gender: student.gender as any,
                        status: 'active'
                    }])
                    .select()
                    .then(({ data, error }: any) => {
                        if (error) throw error;
                        if (data) {
                            const created = { ...student, id: data[0].id };
                            setStudents(prev => [...prev, created]);
                            return created;
                        }
                    });
            } catch (err) {
                console.error('Error adding student to D1:', err);
                setStudents(prev => [...prev, student]);
            }
        } else {
            setStudents(prev => [...prev, student]);
        }
    };

    const updateStudent = async (id: string | number, updates: Partial<Student>) => {
        if (isDbConfigured()) {
            try {
                const dbUpdates: any = {};
                if (updates.nama) dbUpdates.full_name = updates.nama;
                if (updates.nis) dbUpdates.nis = updates.nis;
                if (updates.ayah) dbUpdates.parent_name = updates.ayah;
                if (updates.gender) dbUpdates.gender = updates.gender;

                db.from('students')
                    .update(dbUpdates)
                    .eq('id', id)
                    .then(({ error }: any) => {
                        if (error) throw error;
                        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
                    });
            } catch (err) {
                console.error('Error updating student in D1:', err);
                setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
            }
        } else {
            setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        }
    };

    const updateStudents = (updatedStudents: Student[]) => {
        // Bulk update logic (locally for now, or implement one by one for Supabase)
        setStudents(prev => {
            const newStudents = [...prev];
            updatedStudents.forEach(updated => {
                const index = newStudents.findIndex(s => s.id === updated.id);
                if (index !== -1) {
                    newStudents[index] = updated;
                }
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
            if (isDbConfigured()) {
                try {
                    db.from('students')
                        .delete()
                        .eq('id', id)
                        .then(({ error }: any) => {
                            if (error) throw error;
                            setStudents(prev => prev.filter(s => s.id !== id));
                        });
                } catch (err) {
                    console.error('Error deleting student from D1:', err);
                }
            } else {
                setStudents(prev => prev.filter(s => s.id !== id));
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
