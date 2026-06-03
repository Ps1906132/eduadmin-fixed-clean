import { useState, useEffect, useCallback } from 'react';
import { teachersDataGlobal } from '../../../data/sharedData';
import { hashPassword } from '../../../utils/auth';

export interface Teacher {
    id: string | number;
    nama: string;
    nip: string;
    jabatan: string;
    mapel: string;
    wali: string;
    username: string;
    password: string;
    avatar?: string;
    role?: string;
}

export const useTeachers = () => {
    const [teachers, _setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const profRes = await fetch('/api/profiles', { headers });
            if (!profRes.ok) throw new Error('Gagal mengambil data profil');
            const profiles = await profRes.json();

            const staffRes = await fetch('/api/staff', { headers });
            if (!staffRes.ok) throw new Error('Gagal mengambil data staff');
            const staff = await staffRes.json();

            if (profiles && staff) {
                const staffMap = new Map((staff as any[]).map((s: any) => [s.profile_id?.toString(), s]));
                
                const mappedData: Teacher[] = (profiles as any[])
                    .filter((p: any) => ['ks', 'wk', 'gb', 'gm', 'admin'].includes(p.role))
                    .map((p: any) => {
                        const s = staffMap.get(p.id?.toString()) || {};
                        return {
                            id: p.id ? (isNaN(Number(p.id)) ? p.id : Number(p.id)) : Date.now(),
                            nama: p.full_name,
                            nip: s.nip || p.email?.split('@')[0] || `NIP-${p.id}`,
                            jabatan: s.position || (p.role === 'ks' ? 'Kepala Sekolah' : 'Guru'),
                            mapel: s.department || '-',
                            wali: '-', // Wali is resolved via class assignments in DB
                            username: p.email ? p.email.split('@')[0] : p.full_name.toLowerCase().replace(/\s+/g, ''),
                            password: p.password_hash || 'password123',
                            role: p.role
                        };
                    });

                _setTeachers(mappedData);
                localStorage.setItem('teachers_data_v11', JSON.stringify(mappedData));
            }
        } catch (err) {
            console.error('Error fetching teachers from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // Handle updates and sync to Cloudflare D1
    const syncChanges = async (prev: Teacher[], nextList: Teacher[]) => {
        // ✅ PERSIST to localStorage immediately
        localStorage.setItem('teachers_data_v11', JSON.stringify(nextList));

        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const currentIds = new Set(prev.map(t => t.id.toString()));
            const nextIds = new Set(nextList.map(t => t.id.toString()));

            // 1. Handle Deleted:
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                const res1 = await fetch(`/api/staff?profile_id=eq.${id}`, { method: 'DELETE', headers });
                const res2 = await fetch(`/api/profiles?id=eq.${id}`, { method: 'DELETE', headers });
                if (!res1.ok || !res2.ok) throw new Error(`Failed to delete teacher ${id}`);
            }

            // 2. Handle Inserted:
            const inserted = nextList.filter(t => !currentIds.has(t.id.toString()));
            for (const teacher of inserted) {
                const profileId = teacher.id.toString();
                const email = teacher.username + '@eduadmin.com';
                const rawRole = (teacher.role || teacher.jabatan || 'gm').toLowerCase();
                let role = 'gm';
                if (rawRole.includes('kepala sekolah')) role = 'ks';
                else if (rawRole.includes('wali kelas') || rawRole.includes('guru kelas')) role = 'wk';
                else if (rawRole.includes('bimbel') || rawRole.includes('guru bimbel')) role = 'gb';
                else if (['admin', 'kurikulum', 'keuangan', 'multimedia', 'operator'].some(r => rawRole.includes(r))) role = 'admin';

                const passwordPlain = teacher.password || 'password123';
                const passwordHash = /^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(passwordPlain)
                    ? passwordPlain
                    : await hashPassword(passwordPlain);

                const res1 = await fetch('/api/profiles', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: profileId,
                        email,
                        full_name: teacher.nama,
                        role,
                        password_hash: passwordHash,
                        is_active: 1
                    })
                });
                if (!res1.ok) throw new Error(`Failed to create profile for ${teacher.nama}`);

                const res2 = await fetch('/api/staff', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: profileId,
                        profile_id: profileId,
                        nip: teacher.nip,
                        position: teacher.jabatan,
                        department: teacher.mapel || 'Umum',
                        is_active: 1
                    })
                });
                if (!res2.ok) throw new Error(`Failed to create staff record for ${teacher.nama}`);
            }

            // 3. Handle Updated:
            const prevMap = new Map(prev.map(t => [t.id.toString(), t]));
            for (const teacher of nextList) {
                const idStr = teacher.id.toString();
                const current = prevMap.get(idStr);
                if (current) {
                    const hasChanged =
                        current.nama !== teacher.nama ||
                        current.nip !== teacher.nip ||
                        current.jabatan !== teacher.jabatan ||
                        current.mapel !== teacher.mapel ||
                        current.username !== teacher.username ||
                        current.role !== teacher.role ||
                        current.password !== teacher.password ||
                        current.wali !== teacher.wali;

                    if (hasChanged) {
                        const email = teacher.username + '@eduadmin.com';
                        const rawRole = (teacher.role || teacher.jabatan || 'gm').toLowerCase();
                        let role = 'gm';
                        if (rawRole.includes('kepala sekolah')) role = 'ks';
                        else if (rawRole.includes('wali kelas') || rawRole.includes('guru kelas')) role = 'wk';
                        else if (rawRole.includes('bimbel') || rawRole.includes('guru bimbel')) role = 'gb';
                        else if (['admin', 'kurikulum', 'keuangan', 'multimedia', 'operator'].some(r => rawRole.includes(r))) role = 'admin';

                        const res1 = await fetch(`/api/profiles?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                full_name: teacher.nama,
                                role
                            })
                        });
                        if (!res1.ok) throw new Error(`Failed to update profile for ${teacher.nama}`);

                        const res2 = await fetch(`/api/staff?profile_id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                nip: teacher.nip,
                                position: teacher.jabatan,
                                department: teacher.mapel
                            })
                        });
                        if (!res2.ok) throw new Error(`Failed to update staff record for ${teacher.nama}`);
                    }
                }
            }
        } catch (err) {
            // ✅ ROLLBACK: Restore previous state and localStorage on error
            console.error('Error syncing teacher changes to D1:', err);
            _setTeachers(prev);  // ← Restore state
            localStorage.setItem('teachers_data_v11', JSON.stringify(prev));  // ← Restore localStorage
            alert(`Gagal menyimpan data guru: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const setTeachers = useCallback((value: React.SetStateAction<Teacher[]>) => {
        _setTeachers(prev => {
            const nextList = typeof value === 'function' ? (value as Function)(prev) : value;
            syncChanges(prev, nextList);
            return nextList;
        });
    }, []);

    const addTeacher = async (newTeacher: Teacher) => {
        setTeachers(prev => [newTeacher, ...prev]);
    };

    return {
        teachers,
        setTeachers,
        loading,
        addTeacher,
        refreshTeachers: fetchTeachers
    };
};
