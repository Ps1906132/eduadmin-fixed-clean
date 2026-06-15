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

import { tutoringEnrollmentsGlobal, updateTutoringEnrollmentsGlobal } from '../../../data/sharedData';

export interface TutoringEnrollment {
    id: string;
    studentId: string;
    studentName: string;
    classId: number;
    className: string;
    enrollmentDate: string;
    status: 'Menunggu' | 'Aktif' | 'Selesai';
}

export const useTutoring = () => {
    const [loading, setLoading] = useState(false);
    const [tutoringClasses, _setTutoringClasses] = useState<TutoringClass[]>(initialTutoringClasses);

    const [enrollments, _setEnrollments] = useState<TutoringEnrollment[]>(tutoringEnrollmentsGlobal);

    // Background sync Enrollments to Cloudflare D1
    const syncEnrollments = useCallback(async (next: TutoringEnrollment[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Fetch current to determine upsert/delete
            const res = await fetch('/api/tutoring_enrollments', { headers });
            const current = res.ok ? await res.json() : [];
            const currentIds = new Set((current as any[]).map(e => e.id.toString()));
            const nextIds = new Set(next.map(e => e.id.toString()));

            // 1. Delete
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/tutoring_enrollments?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 2. Upsert
            for (const item of next) {
                const idStr = item.id.toString();
                const body = {
                    id: idStr,
                    student_id: item.studentId.toString(),
                    tutoring_class_id: item.classId.toString(),
                    enrollment_date: item.enrollmentDate,
                    status: item.status
                };

                if (currentIds.has(idStr)) {
                    await fetch(`/api/tutoring_enrollments?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/tutoring_enrollments', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                }
            }
        } catch (err) {
            console.error('Failed to sync tutoring enrollments with D1:', err);
        }
    }, []);

    // Background sync Tutoring Classes to Cloudflare D1
    const syncTutoringClasses = useCallback(async (prev: TutoringClass[], next: TutoringClass[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const prevIds = new Set(prev.map(c => c.id.toString()));
            const nextIds = new Set(next.map(c => c.id.toString()));

            // 1. Delete
            const deletedIds = [...prevIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/tutoring_classes?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 2. Upsert
            for (const item of next) {
                const idStr = item.id.toString();
                const body = {
                    id: idStr,
                    name: item.title,
                    teacher_id: item.teacher,
                    schedule: item.schedule,
                    room: item.room,
                    status: item.status,
                    description: item.description,
                    sessions: JSON.stringify(item.sessions || [])
                };

                if (prevIds.has(idStr)) {
                    await fetch(`/api/tutoring_classes?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/tutoring_classes', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
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

            const [classesRes, enrollRes] = await Promise.all([
                fetch('/api/tutoring_classes', { headers }),
                fetch('/api/tutoring_enrollments', { headers })
            ]);

            if (classesRes.ok) {
                const data = await classesRes.json();
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
                    } else {
                        // D1 is completely empty! Let's seed initial data
                        console.log('Seeding initial tutoring classes to D1...');
                        await syncTutoringClasses([], initialTutoringClasses);
                        _setTutoringClasses(initialTutoringClasses);
                    }
                }
            }

            if (enrollRes.ok) {
                const data = await enrollRes.json();
                if (data && Array.isArray(data)) {
                    const mapped: TutoringEnrollment[] = data.map(e => ({
                        id: e.id.toString(),
                        studentId: e.student_id,
                        studentName: e.studentName || `Siswa ${e.student_id}`, // Joined in API or fallback
                        classId: parseInt(e.tutoring_class_id),
                        className: e.className || 'Kelas Bimbel',
                        enrollmentDate: e.enrollment_date,
                        status: e.status
                    }));
                    _setEnrollments(mapped);
                    updateTutoringEnrollmentsGlobal(mapped);
                }
            }
        } catch (err) {
            console.error('Error fetching tutoring data from D1:', err);
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
            syncTutoringClasses(prev, next);
            return next;
        });
    }, [syncTutoringClasses]);

    const setEnrollments = useCallback((val: TutoringEnrollment[] | ((prev: TutoringEnrollment[]) => TutoringEnrollment[])) => {
        _setEnrollments(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            updateTutoringEnrollmentsGlobal(next);
            syncEnrollments(next);
            return next;
        });
    }, [syncEnrollments]);

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
        enrollments,
        setEnrollments,
        addSession,
        updateClassInfo,
        loading,
        refreshTutoringClasses: fetchTutoringClasses
    };
};
