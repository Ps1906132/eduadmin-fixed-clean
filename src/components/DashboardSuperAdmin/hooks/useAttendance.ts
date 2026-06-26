import { useState, useCallback } from 'react';
import { hasPermission } from '../../../lib/rbac/permissionMatrix';
import { toast } from 'react-hot-toast';

const STATUS_MAP: Record<string, string> = {
    'H': 'hadir',
    'S': 'sakit',
    'I': 'izin',
    'A': 'alpa'
};

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

interface AttendanceSaveRecord {
    studentId: string;
    classId: string;
    date: string;
    status: 'H' | 'S' | 'I' | 'A';
    note?: string;
}

export const useAttendance = () => {
    const [saving, setSaving] = useState(false);

    const saveAttendanceBatch = useCallback(async (
        records: AttendanceSaveRecord[]
    ): Promise<{ success: boolean; error?: string }> => {
        if (records.length === 0) return { success: true };

        // Permission check
        const role = getCurrentUserRole();
        if (!role || !hasPermission(role as any, 'absen', 'UPDATE')) {
            toast.error('Anda tidak memiliki akses untuk mengubah data absensi');
            return { success: false, error: 'Permission denied' };
        }

        setSaving(true);
        const token = localStorage.getItem('eduadmin_token');
        const authHeader = { 'Authorization': `Bearer ${token}` };
        const classId = records[0].classId;
        const date = records[0].date;

        try {
            // Hapus data lama untuk class+date ini agar tidak duplikat
            await fetch(`/api/attendance?class_id=eq.${classId}&date=eq.${date}`, {
                method: 'DELETE',
                headers: authHeader
            });

            // Batch insert semua record sekaligus
            const insertData = records.map(rec => ({
                id: `att-${date}-${rec.studentId}`,
                student_id: rec.studentId,
                class_id: classId,
                date: rec.date,
                status: STATUS_MAP[rec.status] || 'hadir',
                remarks: rec.note || null
            }));

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { ...authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify(insertData)
            });

            if (!res.ok) {
                const errText = await res.text();
                return { success: false, error: `Gagal menyimpan ke server: ${errText}` };
            }

            return { success: true };
        } catch (err: any) {
            if (err.message?.includes('fetch') || err.name === 'TypeError') {
                return { success: false, error: 'Backend tidak merespons. Pastikan Wrangler/API berjalan di port 8788.' };
            }
            return { success: false, error: err.message || 'Gagal menyimpan absensi.' };
        } finally {
            setSaving(false);
        }
    }, []);

    return { saveAttendanceBatch, saving };
};
