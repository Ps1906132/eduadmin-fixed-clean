import { useState, useEffect, useCallback } from 'react';
import { MateriItem, LatihanItem, QuestionPG, QuestionEssay, updateMateriDataGlobal, updateLatihanDataGlobal } from '../../../data/sharedData';

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
        subjectName: a.subject_name || '',
        driveLink: a.drive_link,
        publishDate: a.publish_date,
        status: (a.status || 'Draft') as 'Terbit' | 'Draft',
    };
}

function mapLatihanFromApi(a: any): LatihanItem {
    let questions: (QuestionPG | QuestionEssay)[] = [];
    try {
        if (typeof a.questions === 'string') {
            questions = JSON.parse(a.questions);
        } else if (Array.isArray(a.questions)) {
            questions = a.questions;
        }
    } catch (_) {
        questions = [];
    }
    return {
        id: a.id ? (isNaN(Number(a.id)) ? a.id : Number(a.id)) : Date.now(),
        title: a.title,
        classId: a.class_id,
        subjectName: a.subject_name || '',
        type: (a.type || 'PG') as 'PG' | 'Essay',
        questions,
        publishDate: a.publish_date,
        status: (a.status || 'Draft') as 'Terbit' | 'Draft',
    };
}

function mapMateriToApi(item: MateriItem) {
    return {
        id: item.id.toString(),
        title: item.title,
        class_id: item.classId,
        subject_name: item.subjectName,
        drive_link: item.driveLink,
        publish_date: item.publishDate,
        status: item.status,
    };
}

function mapLatihanToApi(item: LatihanItem) {
    return {
        id: item.id.toString(),
        title: item.title,
        class_id: item.classId,
        subject_name: item.subjectName,
        type: item.type,
        questions: JSON.stringify(item.questions),
        publish_date: item.publishDate,
        status: item.status,
    };
}

function getHeaders() {
    const token = localStorage.getItem('eduadmin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

export const useMateri = (): UseMateriReturn => {
    const [materi, setMateri] = useState<MateriItem[]>([]);
    const [latihan, setLatihan] = useState<LatihanItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch materi from D1
    const refreshMateri = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/materi?order=created_at&dir=desc', { headers: getHeaders() });
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
    }, []);

    // Fetch latihan from D1
    const refreshLatihan = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/latihan_soal?order=created_at&dir=desc', { headers: getHeaders() });
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
    }, []);

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
                body: JSON.stringify(mapMateriToApi(newItem)),
            });
            if (!res.ok) throw new Error('Gagal menyimpan materi');
            await refreshMateri();
        } catch (err) {
            console.error('Error creating materi:', err);
            throw err;
        }
    }, [refreshMateri]);

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
                body: JSON.stringify(mapLatihanToApi(newItem)),
            });
            if (!res.ok) throw new Error('Gagal menyimpan latihan');
            await refreshLatihan();
        } catch (err) {
            console.error('Error creating latihan:', err);
            throw err;
        }
    }, [refreshLatihan]);

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
