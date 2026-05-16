import { useState, useEffect, useCallback } from 'react';
import { teachersDataGlobal } from '../../../data/sharedData';
import { db, isConfigured as isDbConfigured } from '../../../src/lib/db';

export interface Teacher {
    id: string | number;
    nama: string;
    nip: string;
    jabatan: string;
    mapel: string;
    wali: string;
    username: string;
    password: string;
    avatar?: string;
}

export const useTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>(() => {
        const saved = localStorage.getItem('teachers_data_v10');
        return saved ? JSON.parse(saved) : teachersDataGlobal;
    });
    const [loading, setLoading] = useState(false);

    const fetchTeachers = useCallback(async () => {
        if (!isDbConfigured()) return;

        setLoading(true);
        try {
            // Simple fetch from staff table
            db.from('staff').select('*').then(({ data, error }: any) => {
                if (error) throw error;

                if (data && data.length > 0) {
                    const mappedData: Teacher[] = data.map((s: any) => ({
                        id: s.id,
                        nip: s.employee_number,
                        nama: 'Staff User', // Profiles join not handled in simple bridge yet
                        jabatan: s.position,
                        mapel: '-',
                        wali: '-',
                        username: s.employee_number,
                        password: '-'
                    }));
                    setTeachers(mappedData);
                    localStorage.setItem('teachers_data_v10', JSON.stringify(mappedData));
                }
            });
        } catch (err) {
            console.error('Error fetching teachers from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('teachers_data_v10', JSON.stringify(teachers));
        }
    }, [teachers, loading]);

    const addTeacher = async (newTeacher: Teacher) => {
        setTeachers(prev => [newTeacher, ...prev]);
        // Supabase implementation would require creating a profile first, then staff record
    };

    return {
        teachers,
        setTeachers,
        loading,
        addTeacher,
        refreshTeachers: fetchTeachers
    };
};
