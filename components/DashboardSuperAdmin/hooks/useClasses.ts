import { useState, useEffect, useCallback } from 'react';
import { classesDataGlobal } from '../../../data/sharedData';

export interface Class {
    id: string | number;
    nama: string;
    tingkat: number;
    paralel: string;
}

export const useClasses = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddClassModal, setShowAddClassModal] = useState(false);

    // Fetch from D1
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/classes', { headers });
            if (!res.ok) throw new Error('Gagal mengambil data kelas');

            const data = await res.json();
            if (data && Array.isArray(data)) {
                const mappedData: Class[] = (data as any[]).map(c => ({
                    id: c.id ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) : Date.now(),
                    nama: c.name,
                    tingkat: c.grade_level,
                    paralel: c.name.replace(/[0-9]/g, '') || 'A'
                }));
                setClasses(mappedData);
                localStorage.setItem('classes_data_v11', JSON.stringify(mappedData));
            }
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleAddClass = async (tingkat: string, paralel: string, customName?: string) => {
        const nama = customName || `${tingkat}${paralel}`;
        if (tingkat && paralel) {
            const tempId = Date.now();
            const newClass = {
                id: tempId,
                nama,
                tingkat: parseInt(tingkat),
                paralel
            };

            // Optimistic UI update
            setClasses(prev => [...prev, newClass]);
            setShowAddClassModal(false);

            // Sync to D1 in background
            try {
                const token = localStorage.getItem('eduadmin_token');
                const res = await fetch('/api/classes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: nama,
                        grade_level: parseInt(tingkat),
                        is_active: 1
                    })
                });

                if (!res.ok) {
                    console.warn('D1 sync gagal (offline mode), kelas disimpan lokal:', await res.text());
                    return true;
                }
                
                // Fetch to get database assigned IDs
                fetchClasses();
            } catch (err) {
                console.warn('D1 tidak tersedia, kelas disimpan lokal saja:', err);
            }

            return true;
        }
        return false;
    };

    const handleDeleteClass = async (id: string | number) => {
        if (!confirm("Hapus kelas ini?")) return;

        // Optimistic UI update
        setClasses(prev => prev.filter(c => c.id !== id));

        // Sync to D1
        try {
            const token = localStorage.getItem('eduadmin_token');
            const res = await fetch(`/api/classes?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                console.warn('D1 delete sync gagal:', await res.text());
            }
        } catch (err) {
            console.warn('D1 tidak tersedia, hapus disimpan lokal saja:', err);
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
