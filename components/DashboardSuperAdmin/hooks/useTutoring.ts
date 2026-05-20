import { useState, useEffect, useCallback } from 'react';

export interface TutoringSession {
    id: number;
    title: string;
    date: string;
    youtubeId: string;
    driveLink: string;
    meetingLink?: string;
    quizQuestions?: any[];
}

export interface TutoringClass {
    id: number;
    title: string;
    teacher: string;
    schedule: string;
    room: string;
    status: string;
    description: string;
    sessions: TutoringSession[];
}

const initialTutoringClasses: TutoringClass[] = [
    {
        id: 1,
        title: 'Matematika - Persiapan Olimpiade',
        teacher: 'Bpk. Hendra Mathematics',
        schedule: 'Senin & Kamis, 16:00 - 17:30',
        room: 'Ruang 3B',
        status: 'Aktif',
        description: 'Berkokus pada pemecahan masalah logika dan analisis tingkat lanjut.',
        sessions: []
    }
];

export const useTutoring = () => {
    const [loading, setLoading] = useState(false);
    const [tutoringClasses, _setTutoringClasses] = useState<TutoringClass[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('tutoring_classes_v10');
            if (saved) return JSON.parse(saved);
        }
        return initialTutoringClasses;
    });

    // Background sync to Cloudflare D1
    const syncTutoringClasses = useCallback(async (prev: TutoringClass[], next: TutoringClass[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const currentIds = new Set(prev.map(c => c.id.toString()));
            const nextIds = new Set(next.map(c => c.id.toString()));

            // 1. Handle Deleted
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/tutoring_classes?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 2. Handle Inserted
            const inserted = next.filter(c => !currentIds.has(c.id.toString()));
            for (const item of inserted) {
                const computedSubject = item.title.includes('-') ? item.title.split('-')[0].trim() : 'Bimbel';
                await fetch('/api/tutoring_classes', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: item.id.toString(),
                        name: item.title,
                        teacher_id: item.teacher,
                        subject: computedSubject,
                        schedule: item.schedule,
                        room: item.room,
                        status: item.status,
                        description: item.description,
                        sessions: JSON.stringify(item.sessions || []),
                        is_active: 1
                    })
                });
            }

            // 3. Handle Updated
            const prevMap = new Map(prev.map(c => [c.id.toString(), c]));
            for (const item of next) {
                const idStr = item.id.toString();
                const current = prevMap.get(idStr);
                if (current) {
                    const hasChanged =
                        current.title !== item.title ||
                        current.teacher !== item.teacher ||
                        current.schedule !== item.schedule ||
                        current.room !== item.room ||
                        current.status !== item.status ||
                        current.description !== item.description ||
                        JSON.stringify(current.sessions) !== JSON.stringify(item.sessions);

                    if (hasChanged) {
                        const computedSubject = item.title.includes('-') ? item.title.split('-')[0].trim() : 'Bimbel';
                        await fetch(`/api/tutoring_classes?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                name: item.title,
                                teacher_id: item.teacher,
                                subject: computedSubject,
                                schedule: item.schedule,
                                room: item.room,
                                status: item.status,
                                description: item.description,
                                sessions: JSON.stringify(item.sessions || [])
                            })
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Failed to sync tutoring classes with D1:', err);
        }
    }, []);

    // Fetch from D1
    const fetchTutoringClasses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/tutoring_classes', { headers });
            if (!res.ok) throw new Error('Gagal mengambil data kelas bimbel');

            const data = await res.json();
            if (data && Array.isArray(data)) {
                if (data.length > 0) {
                    const mappedData: TutoringClass[] = (data as any[]).map(c => {
                        let parsedSessions: TutoringSession[] = [];
                        try {
                            if (c.sessions) {
                                parsedSessions = typeof c.sessions === 'string' ? JSON.parse(c.sessions) : c.sessions;
                            }
                        } catch (err) {
                            console.error('Failed to parse sessions for tutoring class', c.id, err);
                        }
                        return {
                            id: c.id ? (isNaN(Number(c.id)) ? c.id : Number(c.id)) as number : Date.now(),
                            title: c.name || '',
                            teacher: c.teacher_id || '',
                            schedule: c.schedule || '',
                            room: c.room || '',
                            status: c.status || 'Aktif',
                            description: c.description || '',
                            sessions: parsedSessions
                        };
                    });
                    _setTutoringClasses(mappedData);
                    localStorage.setItem('tutoring_classes_v10', JSON.stringify(mappedData));
                } else {
                    // D1 is completely empty! Let's seed initial data
                    console.log('Seeding initial tutoring classes to D1...');
                    await syncTutoringClasses([], initialTutoringClasses);
                    _setTutoringClasses(initialTutoringClasses);
                    localStorage.setItem('tutoring_classes_v10', JSON.stringify(initialTutoringClasses));
                }
            }
        } catch (err) {
            console.error('Error fetching tutoring classes from D1:', err);
        } finally {
            setLoading(false);
        }
    }, [syncTutoringClasses]);

    useEffect(() => {
        fetchTutoringClasses();
    }, [fetchTutoringClasses]);

    const setTutoringClasses = useCallback((val: TutoringClass[] | ((prev: TutoringClass[]) => TutoringClass[])) => {
        _setTutoringClasses(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            localStorage.setItem('tutoring_classes_v10', JSON.stringify(next));
            syncTutoringClasses(prev, next);
            return next;
        });
    }, [syncTutoringClasses]);

    // Actions for Guru Bimbel
    const addSession = (classId: number, session: TutoringSession) => {
        setTutoringClasses(prev => prev.map(cls =>
            cls.id === classId
                ? { ...cls, sessions: [session, ...cls.sessions] }
                : cls
        ));
    };

    const updateClassInfo = (classId: number, info: Partial<TutoringClass>) => {
        setTutoringClasses(prev => prev.map(cls =>
            cls.id === classId ? { ...cls, ...info } : cls
        ));
    };

    return {
        tutoringClasses,
        setTutoringClasses,
        addSession,
        updateClassInfo,
        loading,
        refreshTutoringClasses: fetchTutoringClasses
    };
};
