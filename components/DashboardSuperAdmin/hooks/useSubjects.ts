import { useState, useEffect, useCallback } from 'react';
import { subjectsDataGlobal } from '../../../data/sharedData';
import { db, isConfigured as isDbConfigured } from '../../../src/lib/db';

export interface SubjectGroup {
    id: string | number;
    name: string;
}

export interface Subject {
    id: string | number;
    name: string;
    code: string;
    level: string;
    group: string;
    color?: string;
}

const initialSubjectGroups: SubjectGroup[] = [
    { id: 1, name: 'Wajib A' },
    { id: 2, name: 'Wajib B' },
    { id: 3, name: 'Muatan Lokal' }
];

export const useSubjects = () => {
    const [loading, setLoading] = useState(false);
    const [subjectGroups, setSubjectGroups] = useState<SubjectGroup[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('subject_groups_v10');
            if (saved) return JSON.parse(saved);
        }
        return initialSubjectGroups;
    });

    const [subjects, setSubjects] = useState<Subject[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('subjects_data_v10');
            if (saved) return JSON.parse(saved);
        }
        return subjectsDataGlobal;
    });

    const fetchSubjects = useCallback(async () => {
        if (!isDbConfigured()) return;

        setLoading(true);
        try {
            const groupsPromise = new Promise((resolve) => {
                db.from('subject_groups').select('*').then(resolve);
            });
            const subjectsPromise = new Promise((resolve) => {
                db.from('subjects').select('*').then(resolve);
            });

            const [groupsRes, subjectsRes]: any = await Promise.all([groupsPromise, subjectsPromise]);

            if (groupsRes.data && groupsRes.data.length > 0) {
                const mappedGroups = (groupsRes.data as { id: number; name: string }[]).map(g => ({
                    id: g.id,
                    name: g.name
                }));
                setSubjectGroups(mappedGroups);
                localStorage.setItem('subject_groups_v10', JSON.stringify(mappedGroups));
            }

            if (subjectsRes.data && subjectsRes.data.length > 0) {
                type SbSubject2 = { id: string; name: string; code: string; group_id: string };
                const mappedSubjects = (subjectsRes.data as SbSubject2[]).map(s => ({
                    id: s.id,
                    name: s.name,
                    code: s.code,
                    level: 'Kelas 1',
                    group: 'Umum' // Joins not handled in simple bridge yet
                }));
                setSubjects(mappedSubjects as any);
                localStorage.setItem('subjects_data_v10', JSON.stringify(mappedSubjects));
            }
        } catch (err) {
            console.error('Error fetching subjects from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('subject_groups_v10', JSON.stringify(subjectGroups));
        }
    }, [subjectGroups, loading]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('subjects_data_v10', JSON.stringify(subjects));
        }
    }, [subjects, loading]);

    return {
        subjectGroups,
        setSubjectGroups,
        subjects,
        setSubjects,
        loading,
        refreshSubjects: fetchSubjects
    };
};
