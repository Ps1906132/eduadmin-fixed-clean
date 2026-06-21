import { useState, useEffect, useCallback } from 'react';
import { teachersDataGlobal } from '../../../data/sharedData';
import { hashPassword } from '../../../utils/auth';
import { toast } from 'react-hot-toast';

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
        const token = localStorage.getItem('eduadmin_token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const profRes = await fetch('/api/profiles', { headers });
            if (!profRes.ok) throw new Error('Gagal mengambil data profil');
            const profiles = await profRes.json();

            const staffRes = await fetch('/api/staff', { headers });
            if (!staffRes.ok) throw new Error('Gagal mengambil data staff');
            const staff = await staffRes.json();

            const classRes = await fetch('/api/classes', { headers });
            const classes = classRes.ok ? await classRes.json() : [];

            if (profiles && staff) {
                const staffMap = new Map((staff as any[]).map((s: any) => [s.profile_id?.toString(), s]));
                const teacherClassMap = new Map();
                if (Array.isArray(classes)) {
                    classes.forEach((c: any) => {
                        if (c.teacher_id) teacherClassMap.set(c.teacher_id.toString(), c.name);
                    });
                }
                
                const mappedData: Teacher[] = (profiles as any[])
                    .filter((p: any) => ['guru', 'admin', 'kurikulum', 'keuangan', 'ks', 'wk', 'gm', 'operator'].includes(p.role))
                    .map((p: any) => {
                        const s = staffMap.get(p.id?.toString()) || {};
                        return {
                            id: p.id ? (isNaN(Number(p.id)) ? p.id : Number(p.id)) : Date.now(),
                            nama: p.full_name,
                            nip: s.nip || p.email?.split('@')[0] || `NIP-${p.id}`,
                            jabatan: s.position || (p.role === 'admin' ? 'Administrator' : 'Guru'),
                            mapel: s.department || '-',
                            wali: teacherClassMap.get(p.id?.toString()) || '-',
                            username: p.email ? p.email.split('@')[0] : p.full_name.toLowerCase().replace(/\s+/g, ''),
                            password: '••••••••',
                            role: p.role
                        };
                    });

                _setTeachers(mappedData);
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
                // Clear teacher_id from classes first
                await fetch(`/api/classes?teacher_id=eq.${id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ teacher_id: null })
                }).catch(() => null);
                const res1 = await fetch(`/api/staff?profile_id=eq.${id}`, { method: 'DELETE', headers });
                const res2 = await fetch(`/api/profiles?id=eq.${id}`, { method: 'DELETE', headers });
                if (!res1.ok || !res2.ok) throw new Error(`Failed to delete teacher ${id}`);
            }

            // 2. Handle Inserted:
            const inserted = nextList.filter(t => !currentIds.has(t.id.toString()));
            for (const teacher of inserted) {
                const profileId = teacher.id.toString();
                // Build email: if username already contains '@', use as-is; otherwise append domain
                const rawUsername = teacher.username || teacher.nama.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                const email = rawUsername.includes('@') ? rawUsername : `${rawUsername}@eduadmin.com`;

                // Map jabatan to valid DB role values
                const jabatanLower = (teacher.jabatan || '').toLowerCase();
                let dbRole: string;
                if (['admin', 'operator', 'kepala sekolah', 'wakil kepala'].some(k => jabatanLower.includes(k))) {
                    dbRole = 'admin';
                } else if (jabatanLower.includes('kurikulum')) {
                    dbRole = 'kurikulum';
                } else if (jabatanLower.includes('keuangan') || jabatanLower.includes('bendahara') || jabatanLower.includes('tata usaha')) {
                    dbRole = 'keuangan';
                } else if (jabatanLower.includes('wali kelas') || jabatanLower.includes('guru kelas')) {
                    dbRole = 'guru';
                } else {
                    dbRole = 'guru'; // Default for all teaching staff
                }

                const passwordPlain = teacher.password || (() => {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
                    let result = '';
                    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
                    return result;
                })();
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
                        role: dbRole,
                        password_hash: passwordHash,
                        is_active: 1
                    })
                });
                if (!res1.ok) {
                    const errText = await res1.text();
                    throw new Error(`Gagal membuat profil untuk ${teacher.nama}: ${errText}`);
                }

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
                if (!res2.ok) {
                    const errText2 = await res2.text();
                    throw new Error(`Gagal membuat data staff untuk ${teacher.nama}: ${errText2}`);
                }
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
                        const rawUsername2 = teacher.username || teacher.nama.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                        const email2 = rawUsername2.includes('@') ? rawUsername2 : `${rawUsername2}@eduadmin.com`;

                        // Map jabatan to valid DB role values
                        const jabatanLower2 = (teacher.jabatan || '').toLowerCase();
                        let dbRole2: string;
                        if (['admin', 'operator', 'kepala sekolah', 'wakil kepala'].some(k => jabatanLower2.includes(k))) {
                            dbRole2 = 'admin';
                        } else if (jabatanLower2.includes('kurikulum')) {
                            dbRole2 = 'kurikulum';
                        } else if (jabatanLower2.includes('keuangan') || jabatanLower2.includes('bendahara')) {
                            dbRole2 = 'keuangan';
                        } else if (jabatanLower2.includes('wali kelas') || jabatanLower2.includes('guru kelas')) {
                            dbRole2 = 'guru';
                        } else {
                            dbRole2 = 'guru';
                        }

                        const res1 = await fetch(`/api/profiles?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                full_name: teacher.nama,
                                role: dbRole2
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

                        // Handle Class Assignment (Wali Kelas) sync
                        if (current.wali !== teacher.wali) {
                            try {
                                // 1. Clear teacher from any class where they were previously wali
                                // We don't have the old class ID easily, but we can search for classes where teacher_id = idStr
                                await fetch(`/api/classes?teacher_id=eq.${idStr}`, {
                                    method: 'PATCH',
                                    headers,
                                    body: JSON.stringify({ teacher_id: null })
                                });

                                // 2. Assign teacher to new class if not '-'
                                if (teacher.wali !== '-') {
                                    // Find class ID by name
                                    const classRes = await fetch(`/api/classes?name=eq.${encodeURIComponent(teacher.wali)}`, { headers });
                                    if (classRes.ok) {
                                        const classData = await classRes.json();
                                        if (Array.isArray(classData) && classData.length > 0) {
                                            const classId = classData[0].id;
                                            await fetch(`/api/classes?id=eq.${classId}`, {
                                                method: 'PATCH',
                                                headers,
                                                body: JSON.stringify({ teacher_id: idStr })
                                            });
                                        }
                                    }
                                }
                            } catch (classErr) {
                                toast.error('Gagal sinkronisasi wali kelas');
                                console.warn('Gagal sinkronisasi wali kelas ke tabel classes:', classErr);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            // ROLLBACK: Restore previous state on error
            toast.error('Gagal menyimpan data guru ke server');
            console.error('Error syncing teacher changes to D1:', err);
            _setTeachers(prev);
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
