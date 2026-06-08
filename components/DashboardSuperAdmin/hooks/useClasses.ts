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
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Fetch from D1
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                // Try loading from localStorage if no token
                try {
                    const cachedData = localStorage.getItem('classes_data_v11');
                    if (cachedData) {
                        const parsedData = JSON.parse(cachedData);
                        if (Array.isArray(parsedData) && parsedData.length > 0) {
                            setClasses(parsedData);
                            setIsOfflineMode(true);
                            console.warn('Menggunakan data kelas dari cache lokal (no token)');
                            setLoading(false);
                            return;
                        }
                    }
                } catch (cacheErr) {
                    console.error('Error loading from cache:', cacheErr);
                }
                throw new Error('NO_TOKEN');
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/classes', { headers });

            // Token expired / tidak valid → arahkan ke login
            if (res.status === 401) {
                console.warn('[useClasses] Token expired atau tidak valid (401). Mengarahkan ke login...');
                window.dispatchEvent(new CustomEvent('auth:expired'));
                throw new Error('UNAUTHORIZED');
            }

            if (!res.ok) throw new Error(`HTTP_${res.status}`);

            const data = await res.json();
            if (data && Array.isArray(data)) {
                const mappedData: Class[] = (data as any[]).map((c, idx) => ({
                    id: c.id ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) : `fallback-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                    nama: c.name,
                    tingkat: Number(c.grade_level) || 1,
                    paralel: c.name.replace(/[0-9]/g, '') || 'A'
                }));
                setClasses(mappedData);
                setIsOfflineMode(false);
                localStorage.setItem('classes_data_v11', JSON.stringify(mappedData));
            }
        } catch (err: any) {
            // Jangan fallback ke cache jika token expired
            if (err.message === 'UNAUTHORIZED') {
                setClasses([]);
                setLoading(false);
                return;
            }

            console.error('Error fetching classes:', err);

            // Fallback: Try to load from localStorage
            try {
                const cachedData = localStorage.getItem('classes_data_v11');
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    if (Array.isArray(parsedData)) {
                        setClasses(parsedData);
                        setIsOfflineMode(true);
                        console.warn('Menggunakan data kelas dari cache lokal (offline mode)');
                        setLoading(false);
                        return;
                    }
                }
            } catch (cacheErr) {
                console.error('Error loading from cache:', cacheErr);
            }

            // If both API and cache fail, use empty array
            setClasses([]);
            setIsOfflineMode(false);
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
                // Ambil academic_year_id aktif dari localStorage atau gunakan default
                const cachedAcademicYear = localStorage.getItem('active_academic_year_id') || 'ay-2025-2026';

                // ✅ FIX: Ensure academic_year exists before inserting class
                // Cek apakah academic_year sudah ada di D1
                let academicYearId = cachedAcademicYear;
                try {
                    const checkRes = await fetch(`/api/academic_years?id=eq.${academicYearId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (checkRes.ok) {
                        const checkData = await checkRes.json();
                        // Jika belum ada, insert academic_year baru
                        if (!Array.isArray(checkData) || checkData.length === 0) {
                            const insertAyRes = await fetch('/api/academic_years', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    id: academicYearId,
                                    name: '2025/2026 - Semester 1',
                                    start_date: '2025-07-01',
                                    end_date: '2025-12-31',
                                    semester: 1,
                                    is_active: 1
                                })
                            });
                            if (!insertAyRes.ok) {
                                console.warn('Gagal membuat academic_year:', await insertAyRes.text());
                            }
                        }
                    }
                } catch (ayErr) {
                    console.warn('Gagal cek/insert academic_year:', ayErr);
                }

                // Sekarang insert class dengan academic_year_id yang sudah dijamin ada
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
                        academic_year_id: academicYearId,
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

    const handleDeleteClass = async (id: string | number): Promise<{ success: boolean; error?: string }> => {
        const originalClasses = classes;
        const updatedClasses = classes.filter(c => c.id !== id);

        // Optimistic UI update
        setClasses(updatedClasses);

        try {
            const token = localStorage.getItem('eduadmin_token');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(`/api/classes?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                let errorMsg = '';
                try { errorMsg = await res.text(); } catch (_) {}
                console.error(`D1 delete gagal [HTTP ${res.status}]:`, errorMsg || '(no body)');

                // Jika 500 karena foreign key constraint, beri pesan spesifik
                if (res.status === 500) {
                    const isFKError = errorMsg.toLowerCase().includes('foreign key') ||
                                     errorMsg.toLowerCase().includes('constraint');
                    setClasses(originalClasses);
                    localStorage.setItem('classes_data_v11', JSON.stringify(originalClasses));
                    return {
                        success: false,
                        error: isFKError
                            ? 'Kelas tidak dapat dihapus karena masih memiliki data terkait (siswa/jadwal/absensi). Hapus data terkait terlebih dahulu.'
                            : `Gagal menghapus kelas di server (HTTP ${res.status}). Pastikan Backend API berjalan.`
                    };
                }

                setClasses(originalClasses);
                localStorage.setItem('classes_data_v11', JSON.stringify(originalClasses));
                return { success: false, error: `Gagal menghapus kelas (HTTP ${res.status}).` };
            }

            // Berhasil (200/204) — update localStorage dan refresh
            localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
            // Jangan re-fetch jika data berasal dari cache lokal saja
            try { fetchClasses(); } catch (_) {}
            return { success: true };
        } catch (err: any) {
            console.error('Delete class error:', err);

            if (err.name === 'AbortError') {
                // Backend timeout — tetap hapus dari UI lokal (offline mode)
                localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
                console.warn('Backend timeout, kelas dihapus dari cache lokal saja.');
                return { success: true }; // Anggap sukses secara lokal
            }

            // Jika backend tidak dapat dihubungi sama sekali, hapus lokal saja
            if (err.message?.includes('fetch') || err.message?.includes('network')) {
                localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
                console.warn('Backend tidak tersedia, kelas dihapus dari cache lokal saja.');
                return { success: true };
            }

            setClasses(originalClasses);
            localStorage.setItem('classes_data_v11', JSON.stringify(originalClasses));
            return { success: false, error: 'Gagal menghapus kelas. Periksa koneksi ke backend API.' };
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
