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

            // Fetch exams master
            const examsRes = await fetch('/api/exams', { headers });
            const examsData = examsRes.ok ? await examsRes.json() : [];

            // Fetch exam_schedules items
            const schedRes = await fetch('/api/exam_schedules', { headers });
            const schedData = schedRes.ok ? await schedRes.json() : [];

            // Fetch subjects & profiles for name resolution
            const [subjRes, profRes] = await Promise.all([
                fetch('/api/subjects', { headers }),
                fetch('/api/profiles', { headers }),
            ]);
            const subjects = subjRes.ok ? await subjRes.json() : [];
            const profiles = profRes.ok ? await profRes.json() : [];

            const subjectMap = new Map<string, string>();
            subjects.forEach((s: any) => { subjectMap.set(s.id?.toString(), s.name || s.nama); });
            const teacherMap = new Map<string, string>();
            profiles.forEach((p: any) => { teacherMap.set(p.id?.toString(), p.full_name || p.nama); });

            if (examsData && Array.isArray(examsData) && examsData.length > 0) {
                const currentYear = new Date().getFullYear();

                // Group schedule items by exam_id
                const itemsByExam: Record<string, ExamScheduleItem[]> = {};
                schedData.forEach((item: any) => {
                    const examId = item.exam_id;
                    if (!itemsByExam[examId]) itemsByExam[examId] = [];
                    itemsByExam[examId].push({
                        id: item.id.toString(),
                        examId: parseInt(examId) || 1,
                        classId: item.class_id,
                        day: item.exam_date || '',
                        timeSlotId: 0,
                        subjectId: item.subject_id || '',
                        subjectName: subjectMap.get(item.subject_id?.toString()) || 'Mata Pelajaran',
                        teacherId: item.teacher_id || '',
                        teacherName: teacherMap.get(item.teacher_id?.toString()) || '-',
                        color: 'bg-blue-100 border-blue-200 text-blue-700'
                    });
                });

                // Build time slots from unique start_time/end_time combos
                const slotMap = new Map<string, number>();
                const timeSlots: { id: number; start: string; end: string }[] = [];
                schedData.forEach((item: any) => {
                    const key = `${item.start_time}-${item.end_time}`;
                    if (!slotMap.has(key)) {
                        const idx = timeSlots.length;
                        slotMap.set(key, idx);
                        timeSlots.push({ id: idx, start: item.start_time || '08:00', end: item.end_time || '10:00' });
                    }
                });

                // Map exam rows to MasterExamSchedule
                const finalExams: MasterExamSchedule[] = examsData.map((exam: any) => ({
                    id: parseInt(exam.id) || exam.id,
                    type: exam.type || 'UTS',
                    semester: exam.semester === 1 ? 'Ganjil' : exam.semester === 2 ? 'Genap' : 'Ganjil',
                    year: exam.academic_year_id || `${currentYear}/${currentYear + 1}`,
                    status: exam.status || 'draft',
                    items: itemsByExam[exam.id] || [],
                    timeSlots: timeSlots.length > 0 ? timeSlots : [
                        { id: 0, start: '07:30', end: '09:00' },
                        { id: 1, start: '09:00', end: '09:30' },
                        { id: 2, start: '09:30', end: '11:00' },
                    ],
                    dailyNotes: {},
                    dailyUniforms: {}
                }));

                setExamSchedules(finalExams);
                updateExamsDataGlobal(finalExams);
            } else {
                // No exams in D1 — use local defaults
                setExamSchedules(examsDataGlobal);
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
        if (!role || !hasPermission(role as any, 'jadwal-ujian', 'UPDATE')) {
            toast.error('Anda tidak memiliki akses untuk mengubah jadwal ujian');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            // Sync master exams to /api/exams
            const examsRes = await fetch('/api/exams', { headers });
            const currentExams = examsRes.ok ? await examsRes.json() : [];
            const currentExamIds = new Set(currentExams.map((e: any) => e.id.toString()));

            for (const exam of newExams) {
                const examIdStr = exam.id.toString();
                const examBody = {
                    id: examIdStr,
                    name: `${exam.type} ${exam.semester} ${exam.year}`,
                    type: exam.type,
                    academic_year_id: exam.year,
                    semester: exam.semester === 'Ganjil' ? 1 : 2,
                    status: exam.status
                };

                if (currentExamIds.has(examIdStr)) {
                    await fetch(`/api/exams?id=eq.${examIdStr}`, {
                        method: 'PATCH', headers, body: JSON.stringify(examBody)
                    });
                } else {
                    await fetch('/api/exams', {
                        method: 'POST', headers, body: JSON.stringify(examBody)
                    });
                }
            }

            // Sync schedule items to /api/exam_schedules
            const schedRes = await fetch('/api/exam_schedules', { headers });
            const currentSched = schedRes.ok ? await schedRes.json() : [];
            const currentSchedIds = new Set(currentSched.map((s: any) => s.id.toString()));

            // Collect all items from all exams
            const allItems: { id: string; examId: string; classId: string; day: string; timeSlotId: number; subjectId: string; subjectName: string; teacherId: string; teacherName: string }[] = [];
            for (const exam of newExams) {
                for (const item of exam.items) {
                    allItems.push({
                        id: item.id,
                        examId: exam.id.toString(),
                        classId: item.classId,
                        day: item.day,
                        timeSlotId: item.timeSlotId,
                        subjectId: item.subjectId || '',
                        subjectName: item.subjectName,
                        teacherId: item.teacherId || '',
                        teacherName: item.teacherName || '-'
                    });
                }
            }
            const nextSchedIds = new Set(allItems.map((i: any) => i.id.toString()));

            // Delete items no longer present
            const deletedIds = [...currentSchedIds].filter((id: string) => !nextSchedIds.has(id));
            for (const id of deletedIds) {
                await fetch(`/api/exam_schedules?id=eq.${id}`, { method: 'DELETE', headers });
            }

            // Upsert items
            for (const item of allItems) {
                const timeSlot = newExams.find(e => e.id.toString() === item.examId)?.timeSlots.find(ts => ts.id === item.timeSlotId);
                const body = {
                    id: item.id,
                    exam_id: item.examId,
                    class_id: item.classId,
                    subject_id: item.subjectId || item.subjectName,
                    teacher_id: item.teacherId || null,
                    exam_date: item.day,
                    start_time: timeSlot?.start || '08:00',
                    end_time: timeSlot?.end || '10:00'
                };

                if (currentSchedIds.has(item.id)) {
                    await fetch(`/api/exam_schedules?id=eq.${item.id}`, {
                        method: 'PATCH', headers, body: JSON.stringify(body)
                    });
                } else {
                    await fetch('/api/exam_schedules', {
                        method: 'POST', headers, body: JSON.stringify(body)
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
