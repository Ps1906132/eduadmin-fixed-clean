import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export interface SchedulePeriod {
    id: string;
    period_number: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    label: string;
    academic_year_id: string;
    is_active: number;
}

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

export const useSchedulePeriods = () => {
    const [periods, setPeriods] = useState<SchedulePeriod[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPeriods = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/schedule_periods?is_active=eq.1&order=period_number', { headers });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPeriods(data);
                }
            }
        } catch (err) {
            console.error('Error fetching schedule periods:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    const addPeriod = async (periodNumber: number, startTime: string, endTime: string, label?: string) => {
        const role = getCurrentUserRole();
        if (role !== 'kurikulum' && role !== 'admin') {
            toast.error('Anda tidak memiliki hak akses untuk menambah jam pelajaran');
            return { success: false };
        }

        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return { success: false };

            const ayRes = await fetch('/api/academic_years?is_active=eq.1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let academicYearId = '';
            if (ayRes.ok) {
                const ayData = await ayRes.json();
                if (Array.isArray(ayData) && ayData.length > 0) {
                    academicYearId = ayData[0].id;
                }
            }

            const durationStart = startTime.split(':').map(Number);
            const durationEnd = endTime.split(':').map(Number);
            const durationMinutes = (durationEnd[0] * 60 + durationEnd[1]) - (durationStart[0] * 60 + durationStart[1]);

            const newId = `per-${periodNumber}`;
            const body = {
                id: newId,
                period_number: periodNumber,
                start_time: startTime,
                end_time: endTime,
                duration_minutes: durationMinutes > 0 ? durationMinutes : 45,
                label: label || `Jam ke-${periodNumber}`,
                academic_year_id: academicYearId,
                is_active: 1
            };

            const res = await fetch('/api/schedule_periods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                await fetchPeriods();
                toast.success('Jam pelajaran berhasil ditambahkan!');
                return { success: true };
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || 'Gagal menambahkan jam pelajaran');
                return { success: false };
            }
        } catch (err) {
            console.error('Error adding period:', err);
            toast.error('Gagal menambahkan jam pelajaran');
            return { success: false };
        }
    };

    const deletePeriod = async (id: string) => {
        const role = getCurrentUserRole();
        if (role !== 'kurikulum' && role !== 'admin') {
            toast.error('Anda tidak memiliki hak akses untuk menghapus jam pelajaran');
            return { success: false };
        }

        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return { success: false };

            const res = await fetch(`/api/schedule_periods?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchPeriods();
                toast.success('Jam pelajaran berhasil dihapus!');
                return { success: true };
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || 'Gagal menghapus jam pelajaran');
                return { success: false };
            }
        } catch (err) {
            console.error('Error deleting period:', err);
            toast.error('Gagal menghapus jam pelajaran');
            return { success: false };
        }
    };

    return {
        periods,
        loading,
        addPeriod,
        deletePeriod,
        refetch: fetchPeriods
    };
};
