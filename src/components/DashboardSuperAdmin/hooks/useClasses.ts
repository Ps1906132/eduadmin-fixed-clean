import { useState, useEffect, useCallback } from 'react';
import { classesDataGlobal } from '../../../data/sharedData';
import { toast } from 'react-hot-toast';

export interface Class {
    id: string | number;
    nama: string;
    tingkat: number;
    paralel: string;
    wali?: string;
    teacher_id?: string;
}

export const useClasses = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const fetchClasses = useCallback(async () => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [res, profRes] = await Promise.all([
                fetch('/api/classes', { headers }),
                fetch('/api/profiles?role=eq.guru', { headers }).catch(() => null)
            ]);

            // Token expired / tidak valid → arahkan ke login
            if (res.status === 401) {
                console.warn('[useClasses] Token expired atau tidak valid (401). Mengarahkan ke login...');
                window.dispatchEvent(new CustomEvent('auth:expired'));
                throw new Error('UNAUTHORIZED');
            }

            if (!res.ok) throw new Error(`HTTP_${res.status}`);

            const data = await res.json();
            const profiles = profRes && profRes.ok ? await profRes.json() : [];
            const profMap = new Map((profiles as any[]).map(p => [p.id.toString(), p.full_name]));

            if (data && Array.isArray(data)) {
                const mappedData: Class[] = (data as any[]).map((c, idx) => ({
                    id: c.id ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) : `fallback-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                    nama: c.name,
                    tingkat: Number(c.grade_level) || 1,
                    paralel: c.name.replace(/[0-9]/g, '') || 'A',
                    teacher_id: c.teacher_id,
                    wali: c.teacher_id ? (profMap.get(c.teacher_id.toString()) || '-') : '-'
                }));
                setClasses(mappedData);
                setIsOfflineMode(false);
            }
        } catch (err: any) {
            // Jangan fallback ke cache jika token expired
            if (err.message === 'UNAUTHORIZED') {
                setClasses([]);
                setLoading(false);
                return;
            }

            toast.error('Gagal memuat data kelas');
            console.error('Error fetching classes:', err);

            setClasses([]);
            setIsOfflineMode(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const syncChanges = async (prev: Class[], nextList: Class[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const prevMap = new Map(prev.map(c => [c.id.toString(), c]));
            for (const cls of nextList) {
                const idStr = cls.id.toString();
                const current = prevMap.get(idStr);
                
                // We only handle UPDATES here, as ADD and DELETE have their own methods
                // NOTE: teacher_id (wali kelas) is managed by useTeachers.ts syncChanges — single source of truth
                if (current && (current.nama !== cls.nama || current.tingkat !== cls.tingkat)) {
                    await fetch(`/api/classes?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            name: cls.nama,
                            grade_level: cls.tingkat
                        })
                    });
                }
            }
        } catch (err) {
            toast.error('Gagal sinkronisasi data kelas');
            console.error('Error syncing class changes:', err);
        }
    };

    const _setClasses = useCallback((value: React.SetStateAction<Class[]>) => {
        setClasses(prev => {
            const nextList = typeof value === 'function' ? (value as Function)(prev) : value;
            syncChanges(prev, nextList);
            return nextList;
        });
    }, []);

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

            setShowAddClassModal(false);

            // Sync to D1 in background
            try {
                const token = localStorage.getItem('eduadmin_token');
                const academicYearId = 'ay-2025-2026';
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
                                toast.error('Gagal membuat tahun ajaran');
                                console.warn('Gagal membuat academic_year:', await insertAyRes.text());
                            }
                        }
                    }
                } catch (ayErr) {
                    toast.error('Gagal cek/insert tahun ajaran');
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
                    toast.error('Sinkronisasi kelas gagal, disimpan lokal');
                    console.warn('D1 sync gagal (offline mode), kelas disimpan lokal:', await res.text());
                    return true;
                }

                // Fetch to get database assigned IDs
                fetchClasses();
            } catch (err) {
                toast.error('Server tidak tersedia, kelas disimpan lokal');
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
                toast.error('Gagal menghapus kelas di server');
                console.error(`D1 delete gagal [HTTP ${res.status}]:`, errorMsg || '(no body)');

                if (res.status === 500) {
                    const isFKError = errorMsg.toLowerCase().includes('foreign key') ||
                                     errorMsg.toLowerCase().includes('constraint');
                    setClasses(originalClasses);
                    return {
                        success: false,
                        error: isFKError
                            ? 'Kelas tidak dapat dihapus karena masih memiliki data terkait (siswa/jadwal/absensi). Hapus data terkait terlebih dahulu.'
                            : `Gagal menghapus kelas di server (HTTP ${res.status}). Pastikan Backend API berjalan.`
                    };
                }

                setClasses(originalClasses);
                return { success: false, error: `Gagal menghapus kelas (HTTP ${res.status}).` };
            }

            try { fetchClasses(); } catch (_) {}
            return { success: true };
        } catch (err: any) {
            toast.error('Gagal menghapus kelas');
            console.error('Delete class error:', err);

            if (err.name === 'AbortError') {
                toast.error('Koneksi timeout');
                console.warn('Backend timeout.');
                return { success: true };
            }

            if (err.message?.includes('fetch') || err.message?.includes('network')) {
                toast.error('Backend tidak tersedia');
                console.warn('Backend tidak tersedia.');
                return { success: true };
            }

            setClasses(originalClasses);
            return { success: false, error: 'Gagal menghapus kelas. Periksa koneksi ke backend API.' };
        }
    };

    return {
        classes,
        setClasses: _setClasses,
        loading,
        showAddClassModal,
        setShowAddClassModal,
        handleAddClass,
        handleDeleteClass,
        refreshClasses: fetchClasses
    };
};
