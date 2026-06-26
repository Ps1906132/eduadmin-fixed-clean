import { useState, useEffect, useCallback } from 'react';
import { MasterExamSchedule, ExamScheduleItem, examsDataGlobal, updateExamsDataGlobal } from '../../../data/sharedData';
import { hasPermission } from '../../../lib/rbac/permissionMatrix';
import { toast } from 'react-hot-toast';

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

export const useExams = () => {
    const [loading, setLoading] = useState(false);
    const [examSchedules, setExamSchedules] = useState<MasterExamSchedule[]>(examsDataGlobal);

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return;
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch('/api/exam_schedules', { headers });
            if (!res.ok) throw new Error('Gagal mengambil data jadwal ujian');

            const data = await res.json();
            if (data && Array.isArray(data)) {
                if (data.length > 0) {
                    // Map normalized rows back to ExamScheduleItem format
                    const mappedItems: ExamScheduleItem[] = data.map(item => ({
                        id: item.id.toString(),
                        examId: parseInt(item.exam_id) || 1,
                        classId: item.class_id,
                        day: item.exam_date, // Re-using exam_date as day for simple mapping
                        timeSlotId: 0, // Fallback
                        subjectName: item.subject_id, // Subject ID used as name for now
                        teacherName: item.teacher_id
                    }));

                    const currentYear = new Date().getFullYear();
                    const baseExam = examsDataGlobal[0] || { 
                        id: 1, type: 'UTS', semester: 'Ganjil', year: `${currentYear}/${currentYear + 1}`, 
                        status: 'published', items: [], timeSlots: [] 
                    };

                    const updatedExam: MasterExamSchedule = {
                        ...baseExam,
                        items: mappedItems,
                        status: 'published'
                    };

                    const finalExams = [updatedExam];
                    setExamSchedules(finalExams);
                    updateExamsDataGlobal(finalExams);
                }
            }
        } catch (err) {
            toast.error('Gagal memuat data jadwal ujian');
        } finally {
            setLoading(false);
        }
    }, []);

    const syncExams = useCallback(async (newExams: MasterExamSchedule[]) => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;

        // Permission check
        const role = getCurrentUserRole();
        if (!role || !hasPermission(role, 'jadwal-ujian', 'UPDATE')) {
            toast.error('Anda tidak memiliki akses untuk mengubah jadwal ujian');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const activeExam = newExams.find(e => e.status === 'published') || newExams[0];
            if (!activeExam) return;

            const res = await fetch('/api/exam_schedules', { headers });
            const currentData = res.ok ? await res.json() : [];
            const currentIds = new Set((currentData as any[]).map(d => d.id.toString()));
            const nextIds = new Set(activeExam.items.map(i => i.id.toString()));

            const deletedIds = [...currentIds].filter(id => !nextIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/exam_schedules?id=eq.${id}`, { method: 'DELETE', headers });
            }

            for (const item of activeExam.items) {
                const idStr = item.id.toString();
                const body = {
                    id: idStr,
                    exam_id: activeExam.id.toString(),
                    class_id: item.classId,
                    subject_id: item.subjectName,
                    teacher_id: item.teacherName || null,
                    exam_date: item.day,
                    start_time: '08:00', // Default
                    end_time: '10:00' // Default
                };

                if (currentIds.has(idStr)) {
                    await fetch(`/api/exam_schedules?id=eq.${idStr}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/exam_schedules', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                }
            }
        } catch (err) {
            toast.error('Gagal menyinkronkan jadwal ujian');
        }
    }, []);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const updateExams = (val: MasterExamSchedule[] | ((prev: MasterExamSchedule[]) => MasterExamSchedule[])) => {
        setExamSchedules(prev => {
            const next = typeof val === 'function' ? val(prev) : val;
            updateExamsDataGlobal(next);
            syncExams(next);
            return next;
        });
    };

    return {
        examSchedules,
        setExamSchedules: updateExams,
        loading,
        refreshExams: fetchExams
    };
};
