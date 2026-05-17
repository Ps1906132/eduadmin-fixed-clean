import { useState, useEffect, useCallback } from 'react';
import { classesDataGlobal } from '../../../data/sharedData';
import { db, isConfigured as isDbConfigured } from '../../../src/lib/db';

export interface Class {
    id: string | number;
    nama: string;
    tingkat: number;
    paralel: string;
}

export const useClasses = () => {
    const [classes, setClasses] = useState<Class[]>(() => {
        const saved = localStorage.getItem('classes_data_v10');
        return saved ? JSON.parse(saved) : classesDataGlobal;
    });
    const [loading, setLoading] = useState(false);

    // Fetch from D1
    const fetchClasses = useCallback(async () => {
        if (!isDbConfigured()) return;

        setLoading(true);
        try {
            db.from('classes')
                .select('*')
                .then(({ data, error }: any) => {
                    if (error) throw error;

                    if (data && data.length > 0) {
                        const mappedData: Class[] = (data as { id: number; name: string; grade_level: number }[]).map(c => ({
                            id: c.id,
                            nama: c.name,
                            tingkat: c.grade_level,
                            paralel: c.name.replace(/[0-9]/g, '') || 'A'
                        }));
                        setClasses(mappedData);
                        localStorage.setItem('classes_data_v10', JSON.stringify(mappedData));
                    }
                });
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Save fallback to LocalStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('classes_data_v10', JSON.stringify(classes));
        }
    }, [classes, loading]);

    const [showAddClassModal, setShowAddClassModal] = useState(false);

    const handleAddClass = async (tingkat: string, paralel: string, customName?: string) => {
        const nama = customName || `${tingkat}${paralel}`;
        if (tingkat && paralel) {
            const newClass = {
                id: Date.now(),
                nama,
                tingkat: parseInt(tingkat),
                paralel
            };

            // BUG FIX: Update state lokal DULU (offline-first)
            // Sebelumnya: isDbConfigured() selalu true → coba D1 → gagal dalam .then()
            // → throw tidak tertangkap → setClasses tidak pernah dipanggil → kelas tidak muncul
            setClasses(prev => [...prev, newClass]);
            setShowAddClassModal(false);

            // Sync ke D1 di background
            if (isDbConfigured()) {
                try {
                    const { data, error } = await db.from('classes').insert([{
                        name: nama,
                        grade_level: parseInt(tingkat),
                        is_active: true
                    }]).select() as any;

                    if (error) {
                        console.warn('D1 sync gagal (offline mode), kelas disimpan lokal:', error);
                        return true;
                    }
                    // Jika D1 beri ID baru, update state
                    if (data?.[0]?.id && data[0].id !== newClass.id) {
                        setClasses(prev => prev.map(c =>
                            c.id === newClass.id ? { ...c, id: data[0].id } : c
                        ));
                    }
                } catch (err) {
                    console.warn('D1 tidak tersedia, kelas disimpan lokal saja:', err);
                }
            }

            return true;
        }
        return false;
    };

    const handleDeleteClass = async (id: string | number) => {
        if (!confirm("Hapus kelas ini?")) return;

        // BUG FIX: Hapus dari state lokal dulu (offline-first)
        setClasses(prev => prev.filter(c => c.id !== id));

        // Sync ke D1 di background
        if (isDbConfigured()) {
            try {
                const { error } = await db.from('classes').update({ is_active: false }).eq('id', id) as any;
                if (error) console.warn('D1 delete sync gagal:', error);
            } catch (err) {
                console.warn('D1 tidak tersedia, hapus disimpan lokal saja:', err);
            }
        }
    };

    return {
        classes,
        setClasses,
        loading,
        showAddClassModal,
        setShowAddClassModal,
        handleAddClass,
        handleDeleteClass,
        refreshClasses: fetchClasses
    };
};
