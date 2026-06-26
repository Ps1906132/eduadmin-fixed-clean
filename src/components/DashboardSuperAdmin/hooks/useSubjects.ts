import { useState, useEffect, useCallback } from 'react';
import { subjectsDataGlobal } from '../../../data/sharedData';
import { toast } from 'react-hot-toast';
import { hasPermission } from '../../../lib/rbac/permissionMatrix';

/** Get current user role from localStorage */
const getCurrentUserRole = (): string | null => {
    try {
        const raw = localStorage.getItem('eduadmin_user');
        if (!raw) return null;
        const user = JSON.parse(raw);
        return (user?.roleCode || user?.role || user?.role_type || '').toLowerCase() || null;
    } catch {
        return null;
    }
};

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
    { id: 'sg-001', name: 'Matematika & IPA' },
    { id: 'sg-002', name: 'Bahasa & Sastra' },
    { id: 'sg-003', name: 'IPS & PKN' },
    { id: 'sg-004', name: 'Olahraga & Seni' }
];

export const useSubjects = () => {
    const [loading, setLoading] = useState(false);
    
    const [subjectGroups, _setSubjectGroups] = useState<SubjectGroup[]>(initialSubjectGroups);

    const [subjects, _setSubjects] = useState<Subject[]>(subjectsDataGlobal);

    // Fetch from D1
    const fetchSubjects = useCallback(async () => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [groupsRes, subjectsRes] = await Promise.all([
                fetch('/api/subject_groups', { headers }),
                fetch('/api/subjects', { headers })
            ]);

            if (groupsRes.ok) {
                const groupsData = await groupsRes.json();
                if (Array.isArray(groupsData) && groupsData.length > 0) {
                    const mappedGroups: SubjectGroup[] = groupsData.map(g => ({
                        id: g.id ? (isNaN(Number(g.id)) ? g.id : Number(g.id)) : Date.now(),
                        name: g.name
                    }));
                    _setSubjectGroups(mappedGroups);
                }
            }

            if (subjectsRes.ok) {
                const subjectsData = await subjectsRes.json();
                if (Array.isArray(subjectsData) && subjectsData.length > 0) {
                    const mappedSubjects: Subject[] = subjectsData.map(s => ({
                        id: s.id ? (isNaN(Number(s.id)) ? s.id : Number(s.id)) : Date.now(),
                        name: s.name,
                        code: s.code,
                        level: s.description || 'Kelas 1',
                        group: s.subject_group_id || 'Umum',
                        color: s.color || undefined
                    }));
                    _setSubjects(mappedSubjects);
                }
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

    // Background sync to Cloudflare D1 (Subject Groups)
    const syncSubjectGroups = async (prev: SubjectGroup[], next: SubjectGroup[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;

        // Permission check
        const role = getCurrentUserRole();
        if (!role || !hasPermission(role, 'mata-pelajaran', 'UPDATE')) {
            toast.error('Anda tidak memiliki akses untuk mengubah kelompok mata pelajaran');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const currentIds = new Set(prev.map(g => g.id.toString()));
            const nextIds = new Set(next.map(g => g.id.toString()));

            // 1. Handle Deleted
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                const res = await fetch(`/api/subject_groups?id=eq.${id}`, { method: 'DELETE', headers });
                if (!res.ok) throw new Error(`Failed to delete subject group ${id}`);
            }

            // 2. Handle Inserted
            const inserted = next.filter(g => !currentIds.has(g.id.toString()));
            for (const item of inserted) {
                const res = await fetch('/api/subject_groups', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: item.id.toString(),
                        name: item.name,
                        description: 'Group'
                    })
                });
                if (!res.ok) throw new Error(`Failed to create subject group ${item.name}`);
            }

            // 3. Handle Updated
            const prevMap = new Map(prev.map(g => [g.id.toString(), g]));
            for (const item of next) {
                const idStr = item.id.toString();
                const current = prevMap.get(idStr);
                if (current && current.name !== item.name) {
                    const res = await fetch(`/api/subject_groups?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            name: item.name
                        })
                    });
                    if (!res.ok) throw new Error(`Failed to update subject group ${item.name}`);
                }
            }
        } catch (err) {
            // ✅ ROLLBACK on error
            toast.error('Gagal menyimpan kelompok mata pelajaran');
            console.error('Failed to sync subject groups with D1:', err);
            _setSubjectGroups(prev);
        }
    };

    // Background sync to Cloudflare D1 (Subjects)
    const syncSubjects = async (prev: Subject[], next: Subject[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;

        // Permission check
        const role = getCurrentUserRole();
        if (!role || !hasPermission(role, 'mata-pelajaran', 'UPDATE')) {
            toast.error('Anda tidak memiliki akses untuk mengubah mata pelajaran');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const currentIds = new Set(prev.map(s => s.id.toString()));
            const nextIds = new Set(next.map(s => s.id.toString()));

            // 1. Handle Deleted
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                const res = await fetch(`/api/subjects?id=eq.${id}`, { method: 'DELETE', headers });
                if (!res.ok) throw new Error(`Failed to delete subject ${id}`);
            }

            // 2. Handle Inserted
            const inserted = next.filter(s => !currentIds.has(s.id.toString()));
            for (const item of inserted) {
                const res = await fetch('/api/subjects', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: item.id.toString().startsWith('subj-') ? item.id.toString() : `subj-${Date.now()}`,
                        code: item.code || `SBJ-${Date.now()}`,
                        name: item.name,
                        subject_group_id: item.group,
                        description: item.level || 'Kelas 1',
                        credits: 2,
                        is_active: 1
                    })
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to create subject ${item.name}: ${errorText}`);
                }
            }

            // 3. Handle Updated
            const prevMap = new Map(prev.map(s => [s.id.toString(), s]));
            for (const item of next) {
                const idStr = item.id.toString();
                const current = prevMap.get(idStr);
                if (current) {
                    const hasChanged =
                        current.name !== item.name ||
                        current.code !== item.code ||
                        current.group !== item.group ||
                        current.level !== item.level;

                    if (hasChanged) {
                        const res = await fetch(`/api/subjects?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                code: item.code,
                                name: item.name,
                                subject_group_id: item.group,
                                description: item.level
                            })
                        });
                        if (!res.ok) throw new Error(`Failed to update subject ${item.name}`);
                    }
                }
            }
        } catch (err) {
            // ✅ ROLLBACK on error
            toast.error('Gagal menyimpan mata pelajaran');
            console.error('Failed to sync subjects with D1:', err);
            _setSubjects(prev);
        }
    };

    const setSubjectGroups = useCallback((val: SubjectGroup[] | ((prev: SubjectGroup[]) => SubjectGroup[])) => {
        _setSubjectGroups(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            syncSubjectGroups(prev, next);
            return next;
        });
    }, []);

    const setSubjects = useCallback((val: Subject[] | ((prev: Subject[]) => Subject[])) => {
        _setSubjects(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            syncSubjects(prev, next);
            return next;
        });
    }, []);

    return {
        subjectGroups,
        setSubjectGroups,
        subjects,
        setSubjects,
        loading,
        refreshSubjects: fetchSubjects
    };
};
