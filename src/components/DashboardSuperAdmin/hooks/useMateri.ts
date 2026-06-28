import { useState, useEffect, useCallback } from 'react';
import { MateriItem, LatihanItem, updateMateriDataGlobal, updateLatihanDataGlobal } from '../../../data/sharedData';

interface UseMateriReturn {
    materi: MateriItem[];
    latihan: LatihanItem[];
    loading: boolean;
    refreshMateri: () => Promise<void>;
    refreshLatihan: () => Promise<void>;
    createMateri: (item: Omit<MateriItem, 'id' | 'publishDate'>) => Promise<void>;
    deleteMateri: (id: number) => Promise<void>;
    createLatihan: (item: Omit<LatihanItem, 'id' | 'publishDate'>) => Promise<void>;
    deleteLatihan: (id: number) => Promise<void>;
}

function mapMateriFromApi(a: any): MateriItem {
    return {
        id: a.id ? (isNaN(Number(a.id)) ? a.id : Number(a.id)) : Date.now(),
        title: a.title,
        classId: a.class_id,
        subjectId: a.subject_id || '',
        subjectName: a.subject_name || '',
        driveLink: a.drive_link,
        publishDate: a.publish_date,
        status: (a.status || 'Draft') as 'Terbit' | 'Draft',
    };
}

function mapLatihanFromApi(a: any): LatihanItem {
    let questions: any[] = [];
    try {
        if (typeof a.questions === 'string') questions = JSON.parse(a.questions);
        else if (Array.isArray(a.questions)) questions = a.questions;
    } catch (_) { questions = []; }
    return {
        id: a.id ? (isNaN(Number(a.id)) ? a.id : Number(a.id)) : Date.now(),
        title: a.title,
        classId: a.class_id,
        subjectId: a.subject_id || '',
        subjectName: a.subject_name || '',
        type: (a.type || 'PG') as 'PG' | 'Essay',
        questions,
        publishDate: a.publish_date,
        status: (a.status || 'Draft') as 'Terbit' | 'Draft',
    };
}

function mapMateriToApi(item: MateriItem, teacherId?: string) {
    return {
        id: item.id.toString(),
        title: item.title,
        class_id: item.classId,
        subject_id: item.subjectId || null,
        subject_name: item.subjectName || '',
        teacher_id: teacherId || null,
        drive_link: item.driveLink,
        publish_date: item.publishDate,
        status: item.status,
        created_by: teacherId || null,
    };
}

function mapLatihanToApi(item: LatihanItem, teacherId?: string) {
    return {
        id: item.id.toString(),
        title: item.title,
        class_id: item.classId,
        subject_id: item.subjectId || null,
        subject_name: item.subjectName || '',
        teacher_id: teacherId || null,
        type: item.type,
        questions: JSON.stringify(item.questions),
        publish_date: item.publishDate,
        status: item.status,
        created_by: teacherId || null,
    };
}

function getHeaders() {
    const token = localStorage.getItem('eduadmin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export const useMateri = (teacherId?: string): UseMateriReturn => {
    const [materi, setMateri] = useState<MateriItem[]>([]);
    const [latihan, setLatihan] = useState<LatihanItem[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshMateri = useCallback(async () => {
        setLoading(true);
        try {
            const url = teacherId
                ? `/api/materi?teacher_id=eq.${teacherId}&order=created_at&dir=desc`
                : '/api/materi?order=created_at&dir=desc';
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) throw new Error('Gagal mengambil data materi');
            const data = await res.json();
            if (Array.isArray(data)) {
                const mapped = data.map(mapMateriFromApi);
                setMateri(mapped);
                updateMateriDataGlobal(mapped);
            }
        } catch (err) {
            console.error('Error fetching materi:', err);
        } finally {
            setLoading(false);
        }
    }, [teacherId]);

    const refreshLatihan = useCallback(async () => {
        setLoading(true);
        try {
            const url = teacherId
                ? `/api/latihan_soal?teacher_id=eq.${teacherId}&order=created_at&dir=desc`
                : '/api/latihan_soal?order=created_at&dir=desc';
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) throw new Error('Gagal mengambil data latihan');
            const data = await res.json();
            if (Array.isArray(data)) {
                const mapped = data.map(mapLatihanFromApi);
                setLatihan(mapped);
                updateLatihanDataGlobal(mapped);
            }
        } catch (err) {
            console.error('Error fetching latihan:', err);
        } finally {
            setLoading(false);
        }
    }, [teacherId]);

    useEffect(() => {
        refreshMateri();
        refreshLatihan();
    }, [refreshMateri, refreshLatihan]);

    const createMateri = useCallback(async (item: Omit<MateriItem, 'id' | 'publishDate'>) => {
        const newItem: MateriItem = {
            ...item,
            id: Date.now(),
            publishDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        try {
            const res = await fetch('/api/materi', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(mapMateriToApi(newItem, teacherId)),
            });
            if (!res.ok) throw new Error('Gagal menyimpan materi');
            await refreshMateri();
        } catch (err) {
            console.error('Error creating materi:', err);
            throw err;
        }
    }, [refreshMateri, teacherId]);

    const deleteMateri = useCallback(async (id: number) => {
        try {
            const res = await fetch(`/api/materi?id=eq.${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error('Gagal menghapus materi');
            setMateri(prev => prev.filter(m => m.id !== id));
            updateMateriDataGlobal(materi.filter(m => m.id !== id));
        } catch (err) {
            console.error('Error deleting materi:', err);
            throw err;
        }
    }, [materi]);

    const createLatihan = useCallback(async (item: Omit<LatihanItem, 'id' | 'publishDate'>) => {
        const newItem: LatihanItem = {
            ...item,
            id: Date.now(),
            publishDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        try {
            const res = await fetch('/api/latihan_soal', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(mapLatihanToApi(newItem, teacherId)),
            });
            if (!res.ok) throw new Error('Gagal menyimpan latihan');
            await refreshLatihan();
        } catch (err) {
            console.error('Error creating latihan:', err);
            throw err;
        }
    }, [refreshLatihan, teacherId]);

    const deleteLatihan = useCallback(async (id: number) => {
        try {
            const res = await fetch(`/api/latihan_soal?id=eq.${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (!res.ok) throw new Error('Gagal menghapus latihan');
            setLatihan(prev => prev.filter(l => l.id !== id));
            updateLatihanDataGlobal(latihan.filter(l => l.id !== id));
        } catch (err) {
            console.error('Error deleting latihan:', err);
            throw err;
        }
    }, [latihan]);

    return {
        materi,
        latihan,
        loading,
        refreshMateri,
        refreshLatihan,
        createMateri,
        deleteMateri,
        createLatihan,
        deleteLatihan,
    };
};
