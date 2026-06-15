import { useState, useEffect, useCallback } from 'react';
import {
    broadcastsDataGlobal,
    updateBroadcastsGlobal,
    multimediaSettingsGlobal,
    updateMultimediaSettingsGlobal,
    Broadcast
} from '../../../data/sharedData';

export const useMultimedia = () => {
    const [loading, setLoading] = useState(false);

    const [broadcasts, _setBroadcasts] = useState<Broadcast[]>(broadcastsDataGlobal);

    const [channelSettings, _setChannelSettings] = useState(multimediaSettingsGlobal);

    // Fetch from D1
    const fetchMultimedia = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [broadcastsRes, settingsRes] = await Promise.all([
                fetch('/api/broadcasts', { headers }),
                fetch('/api/multimedia_settings', { headers })
            ]);

            if (broadcastsRes.ok) {
                const broadcastsData = await broadcastsRes.json();
                if (Array.isArray(broadcastsData) && broadcastsData.length > 0) {
                    const mappedBroadcasts: Broadcast[] = broadcastsData.map(b => ({
                        id: b.id ? (isNaN(Number(b.id)) ? b.id : Number(b.id)) : Date.now(),
                        title: b.title,
                        url: b.url,
                        description: b.description || '',
                        category: b.category || 'Edukasi',
                        status: b.status || 'Draft',
                        date: b.date || new Date().toLocaleDateString('id-ID')
                    }));
                    _setBroadcasts(mappedBroadcasts);
                    updateBroadcastsGlobal(mappedBroadcasts);
                }
            }

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                if (Array.isArray(settingsData) && settingsData.length > 0) {
                    const activeSettings = settingsData[0]; // singleton row
                    const mappedSettings = {
                        name: activeSettings.name || 'Chanel Utama SDNI',
                        autoplay: activeSettings.autoplay === 1 || activeSettings.autoplay === true,
                        mode: activeSettings.mode || 'manual'
                    };
                    _setChannelSettings(mappedSettings);
                    updateMultimediaSettingsGlobal(mappedSettings);
                }
            }
        } catch (err) {
            console.error('Error fetching multimedia data from D1:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMultimedia();
    }, [fetchMultimedia]);

    // Background sync to Cloudflare D1 (Broadcasts)
    const syncBroadcasts = async (prev: Broadcast[], next: Broadcast[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const currentIds = new Set(prev.map(b => b.id.toString()));
            const nextIds = new Set(next.map(b => b.id.toString()));

            // 1. Handle Deleted
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/broadcasts?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 2. Handle Inserted
            const inserted = next.filter(b => !currentIds.has(b.id.toString()));
            for (const item of inserted) {
                await fetch('/api/broadcasts', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: item.id.toString(),
                        title: item.title,
                        url: item.url,
                        description: item.description,
                        category: item.category,
                        status: item.status,
                        date: item.date
                    })
                });
            }

            // 3. Handle Updated
            const prevMap = new Map(prev.map(b => [b.id.toString(), b]));
            for (const item of next) {
                const idStr = item.id.toString();
                const current = prevMap.get(idStr);
                if (current) {
                    const hasChanged =
                        current.title !== item.title ||
                        current.url !== item.url ||
                        current.description !== item.description ||
                        current.category !== item.category ||
                        current.status !== item.status ||
                        current.date !== item.date;

                    if (hasChanged) {
                        await fetch(`/api/broadcasts?id=eq.${idStr}`, {
                            method: 'PATCH',
                            headers,
                            body: JSON.stringify({
                                title: item.title,
                                url: item.url,
                                description: item.description,
                                category: item.category,
                                status: item.status,
                                date: item.date
                            })
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Failed to sync broadcasts with D1:', err);
        }
    };

    // Background sync to Cloudflare D1 (Settings)
    const syncChannelSettings = async (next: any) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Singleton update to id = 'singleton'
            const res = await fetch(`/api/multimedia_settings?id=eq.singleton`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    name: next.name,
                    autoplay: next.autoplay ? 1 : 0,
                    mode: next.mode
                })
            });

            // If updating failed (because row does not exist yet), try to insert it
            let shouldInsert = res.status === 404 || res.status === 400;
            if (res.ok) {
                const resData = await res.clone().json().catch(() => null);
                const changes = resData?.meta?.changes ?? resData?.changes;
                if (changes === 0) {
                    shouldInsert = true;
                }
            }

            if (shouldInsert) {
                await fetch('/api/multimedia_settings', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        id: 'singleton',
                        name: next.name,
                        autoplay: next.autoplay ? 1 : 0,
                        mode: next.mode
                    })
                });
            }
        } catch (err) {
            console.error('Failed to sync channel settings with D1:', err);
        }
    };

    const setBroadcasts = useCallback((val: Broadcast[] | ((prev: Broadcast[]) => Broadcast[])) => {
        _setBroadcasts(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            updateBroadcastsGlobal(next);
            syncBroadcasts(prev, next);
            return next;
        });
    }, []);

    const setChannelSettings = useCallback((val: any | ((prev: any) => any)) => {
        _setChannelSettings(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            updateMultimediaSettingsGlobal(next);
            syncChannelSettings(next);
            return next;
        });
    }, []);

    return {
        broadcasts,
        setBroadcasts,
        channelSettings,
        setChannelSettings,
        loading,
        refreshMultimedia: fetchMultimedia
    };
};
