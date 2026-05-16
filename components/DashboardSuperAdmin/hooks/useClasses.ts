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

            if (isDbConfigured()) {
                try {
                    db.from('classes')
                        .insert([{
                            name: nama,
                            grade_level: parseInt(tingkat),
                            is_active: true
                        }])
                        .select()
                        .then(({ data, error }: any) => {
                            if (error) throw error;
                            if (data) {
                                setClasses(prev => [...prev, {
                                    id: data[0].id,
                                    nama: data[0].name,
                                    tingkat: data[0].grade_level,
                                    paralel
                                }]);
                            }
                        });
                } catch (err) {
                    console.error('Error adding class to D1:', err);
                    setClasses(prev => [...prev, newClass]);
                }
            } else {
                setClasses(prev => [...prev, newClass]);
            }

            setShowAddClassModal(false);
            return true;
        }
        return false;
    };

    const handleDeleteClass = async (id: string | number) => {
        if (!confirm("Hapus kelas ini?")) return;

        if (isDbConfigured()) {
            try {
                db.from('classes')
                    .update({ is_active: false })
                    .eq('id', id)
                    .then(({ error }: any) => {
                        if (error) throw error;
                        setClasses(prev => prev.filter(c => c.id !== id));
                    });
            } catch (err) {
                console.error('Error deleting class from D1:', err);
            }
        } else {
            setClasses(prev => prev.filter(c => c.id !== id));
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
