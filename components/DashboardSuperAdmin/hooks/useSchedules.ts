import { useState, useEffect, useCallback } from 'react';
import { MasterSchedule, ScheduleItem, DailyScheduleInfo, schedulesDataGlobal, updateSchedulesDataGlobal } from '../../../data/sharedData';

export const useSchedules = () => {
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<MasterSchedule[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('schedules_data_v2');
            if (saved) return JSON.parse(saved);
        }
        return schedulesDataGlobal;
    });

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/schedules', { headers });
            if (!res.ok) throw new Error('Gagal mengambil data jadwal');

            const data = await res.json();
            if (data && Array.isArray(data)) {
                // Map normalized rows back to MasterSchedule format
                // Since we don't have a 'master_schedule' table, we'll group by academic_year_id or similar
                // For now, we'll assume a single main schedule or reconstruct based on existing data
                
                if (data.length > 0) {
                    // Reconstruct items
                    const mappedItems: ScheduleItem[] = data.map(item => ({
                        id: item.id.toString(),
                        classId: item.class_id,
                        day: item.day_of_week,
                        period: parseInt(item.period_id) || 0,
                        subjectId: isNaN(Number(item.subject_id)) ? item.subject_id : Number(item.subject_id)
                    }));

                    // Reconstruct MasterSchedule
                    // Note: We might lose some metadata (name, dailyInfos) if not stored in D1.
                    // We'll merge with existing local metadata if possible.
                    const existingSchedules = JSON.parse(localStorage.getItem('schedules_data_v2') || '[]');
                    const baseSchedule = existingSchedules[0] || schedulesDataGlobal[0] || { id: 1, name: 'Jadwal Pelajaran', status: 'published', items: [], dailyInfos: [] };

                    const updatedSchedule: MasterSchedule = {
                        ...baseSchedule,
                        items: mappedItems,
                        status: 'published' // Default to published for API data
                    };

                    const finalSchedules = [updatedSchedule];
                    setSchedules(finalSchedules);
                    updateSchedulesDataGlobal(finalSchedules);
                    localStorage.setItem('schedules_data_v2', JSON.stringify(finalSchedules));
                }
            }
        } catch (err) {
            console.error('Error fetching schedules from API:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const syncSchedules = useCallback(async (newSchedules: MasterSchedule[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // For now, we sync the FIRST (active) schedule's items to the 'schedules' table
            const activeSchedule = newSchedules.find(s => s.status === 'published') || newSchedules[0];
            if (!activeSchedule) return;

            // 1. Get current items from API to determine what to delete/update
            const res = await fetch('/api/schedules', { headers });
            const currentData = res.ok ? await res.json() : [];
            const currentIds = new Set((currentData as any[]).map(d => d.id.toString()));
            const nextIds = new Set(activeSchedule.items.map(i => i.id.toString()));

            // 2. Delete items no longer in schedule
            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/schedules?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // 3. Upsert items
            for (const item of activeSchedule.items) {
                const idStr = item.id.toString();
                const body = {
                    id: idStr,
                    class_id: item.classId,
                    subject_id: item.subjectId.toString(),
                    day_of_week: item.day,
                    period_id: item.period.toString(),
                    academic_year_id: 'ay-2025-2026', // Fallback or dynamic
                    is_active: 1
                };

                if (currentIds.has(idStr)) {
                    await fetch(`/api/schedules?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/schedules', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                }
            }
        } catch (err) {
            console.error('Failed to sync schedules with API:', err);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const updateSchedules = (val: MasterSchedule[] | ((prev: MasterSchedule[]) => MasterSchedule[])) => {
        setSchedules(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            localStorage.setItem('schedules_data_v2', JSON.stringify(next));
            updateSchedulesDataGlobal(next);
            syncSchedules(next);
            return next;
        });
    };

    return {
        schedules,
        setSchedules: updateSchedules,
        loading,
        refreshSchedules: fetchSchedules
    };
};
