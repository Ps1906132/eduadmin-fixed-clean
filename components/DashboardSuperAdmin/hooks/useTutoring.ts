import { useState, useEffect } from 'react';
import { tutoringSubjectsGlobal, tutoringTeachersGlobal, updateTutoringSubjectsGlobal, updateTutoringTeachersGlobal } from '../../../data/sharedData';

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

export const useTutoring = () => {
    // 1. Load Data from LocalStorage with Global Fallback
    const [tutoringClasses, setTutoringClasses] = useState<TutoringClass[]>(() => {
        const saved = localStorage.getItem('tutoring_classes_v10');
        if (saved) return JSON.parse(saved);

        // Fallback or Initial Data
        return [
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
    });

    // 2. Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem('tutoring_classes_v10', JSON.stringify(tutoringClasses));
    }, [tutoringClasses]);

    // 3. Actions for Guru Bimbel
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
        updateClassInfo
    };
};
