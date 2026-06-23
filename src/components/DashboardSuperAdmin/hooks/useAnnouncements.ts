import { useState, useEffect, useCallback } from 'react';
import { announcementDataGlobal, updateAnnouncementsGlobal, Announcement } from '../../../data/sharedData';

export const useAnnouncements = () => {
    const [announcements, _setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch from D1
    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/announcements', { headers });
            if (!res.ok) throw new Error('Gagal mengambil data pengumuman');

            const data = await res.json();
            if (data && Array.isArray(data)) {
                const mappedData: Announcement[] = (data as any[]).map(a => ({
                    id: a.id ? (isNaN(Number(a.id)) ? a.id : Number(a.id)) : Date.now(),
                    title: a.title,
                    category: a.category || 'Umum',
                    target: a.target || 'Semua',
                    targetClass: a.target_class || 'Semua Kelas',
                    content: a.content,
                    publishDate: a.publish_date || new Date().toISOString().split('T')[0],
                    endDate: a.end_date || undefined,
                    status: (a.status || 'Draft') as 'Draft' | 'Terbit',
                    isPinned: a.is_pinned === 1 || a.is_pinned === true,
                    viewers: Number(a.viewers || 0),
                    attachments: [] // Schema doesn't store attachments directly yet
                }));
                _setAnnouncements(mappedData);
                updateAnnouncementsGlobal(mappedData);
            }
        } catch (err) {
            console.error('Error fetching announcements from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Background sync to Cloudflare D1
    const syncAnnouncements = async (prev: Announcement[], nextList: Announcement[]) => {
        updateAnnouncementsGlobal(nextList);

        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Get current user ID for created_by / updated_by
            const localUser = localStorage.getItem('eduadmin_user');
            const currentUser = localUser ? JSON.parse(localUser) : null;
            const userId = currentUser?.id || 'admin-001';

            const currentIds = new Set(prev.map(a => a.id.toString()));
            const nextIds = new Set(nextList.map(a => a.id.toString()));

            // 1. Handle Deleted
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/announcements?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 2. Handle Inserted
            const inserted = nextList.filter(a => !currentIds.has(a.id.toString()));
            for (const item of inserted) {
                await fetch('/api/announcements', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: item.id.toString(),
                        title: item.title,
                        category: item.category,
                        target: item.target,
                        target_class: item.targetClass,
                        content: item.content,
                        publish_date: item.publishDate,
                        end_date: item.endDate || null,
                        status: item.status,
                        is_pinned: item.isPinned ? 1 : 0,
                        viewers: item.viewers,
                        created_by: userId
                    })
                });
            }

            // 3. Handle Updated
            const prevMap = new Map(prev.map(a => [a.id.toString(), a]));
            for (const item of nextList) {
                const idStr = item.id.toString();
                const current = prevMap.get(idStr);
                if (current) {
                    const hasChanged =
                        current.title !== item.title ||
                        current.category !== item.category ||
                        current.target !== item.target ||
                        current.targetClass !== item.targetClass ||
                        current.content !== item.content ||
                        current.publishDate !== item.publishDate ||
                        current.endDate !== item.endDate ||
                        current.status !== item.status ||
                        current.isPinned !== item.isPinned ||
                        current.viewers !== item.viewers;

                    if (hasChanged) {
                        await fetch(`/api/announcements?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                title: item.title,
                                category: item.category,
                                target: item.target,
                                target_class: item.targetClass,
                                content: item.content,
                                publish_date: item.publishDate,
                                end_date: item.endDate || null,
                                status: item.status,
                                is_pinned: item.isPinned ? 1 : 0,
                                viewers: item.viewers,
                                updated_at: new Date().toISOString()
                            })
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error syncing announcements to D1:', err);
        }
    };

    const setAnnouncements = useCallback((value: React.SetStateAction<Announcement[]>) => {
        _setAnnouncements(prev => {
            const nextList = typeof value === 'function' ? (value as Function)(prev) : value;
            syncAnnouncements(prev, nextList);
            return nextList;
        });
    }, []);

    return {
        announcements,
        setAnnouncements,
        loading,
        refreshAnnouncements: fetchAnnouncements
    };
};
