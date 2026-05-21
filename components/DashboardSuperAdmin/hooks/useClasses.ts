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
                const mappedData: Class[] = (data as any[]).map((c, idx) => ({
                    id: c.id ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) : `fallback-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                    nama: c.name,
                    tingkat: c.grade_level,
                    paralel: c.name.replace(/[0-9]/g, '') || 'A'
                }));
                setClasses(mappedData);
                localStorage.setItem('classes_data_v11', JSON.stringify(mappedData));
            }
        } catch (err) {
            console.error('Error fetching classes:', err);
            
            // Fallback: Try to load from localStorage
            try {
                const cachedData = localStorage.getItem('classes_data_v11');
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    if (Array.isArray(parsedData)) {
                        setClasses(parsedData);
                        console.warn('Menggunakan data kelas dari cache lokal');
                        return;
                    }
                }
            } catch (cacheErr) {
                console.error('Error loading from cache:', cacheErr);
            }
            
            // If both API and cache fail, use empty array
            setClasses([]);
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
            const updatedClasses = [...classes, newClass];
            setClasses(updatedClasses);
            
            // Update localStorage immediately
            localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
            
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
                        id: tempId.toString(),
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

        // Store original data for rollback in case of error
        const originalClasses = classes;
        
        // Optimistic UI update
        const updatedClasses = classes.filter(c => c.id !== id);
        setClasses(updatedClasses);

        // Sync to D1 and localStorage
        try {
            const token = localStorage.getItem('eduadmin_token');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const res = await fetch(`/api/classes?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!res.ok) {
                const errorMsg = await res.text();
                console.error('D1 delete sync gagal:', errorMsg);
                // Rollback on API failure
                setClasses(originalClasses);
                alert('Gagal menghapus kelas. Pastikan Backend API berjalan di port 8788.');
                return;
            }
            
            // SUCCESS: Update localStorage dengan data terbaru
            localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
            
            // Refetch from D1 to ensure consistency
            fetchClasses();
        } catch (err: any) {
            clearTimeout(0);
            console.error('Delete class error:', err);
            
            // Restore original data if error occurs
            setClasses(originalClasses);
            
            // Better error messaging based on error type
            if (err.name === 'AbortError') {
                alert('Backend tidak merespons (timeout). Pastikan Wrangler/API sedang berjalan di port 8788.');
            } else if (err.message?.includes('CORS')) {
                alert('CORS error: Periksa konfigurasi backend.');
            } else {
                alert('Gagal menghapus kelas. Periksa koneksi ke backend API.');
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
