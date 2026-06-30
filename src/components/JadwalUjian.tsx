import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface JadwalUjianProps {
    onBack: () => void;
    user?: any;
}

interface ExamItem {
    id: string;
    examId: string;
    examType: string;
    classId: string;
    className: string;
    day: string;
    date: string;
    startTime: string;
    endTime: string;
    subjectName: string;
    room: string;
    notes: string;
}

const JadwalUjian: React.FC<JadwalUjianProps> = ({ onBack, user }) => {
    const [selectedDay, setSelectedDay] = useState('Senin');
    const [examItems, setExamItems] = useState<ExamItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [examTitle, setExamTitle] = useState('');
    const [dailyNote, setDailyNote] = useState('');
    const [myClassIds, setMyClassIds] = useState<Set<string>>(new Set());
    const [publishedExams, setPublishedExams] = useState<any[]>([]);
    const [activeExamIdx, setActiveExamIdx] = useState(0);
    const [allSchedData, setAllSchedData] = useState<any[]>([]);
    const [classMap, setClassMap] = useState<Record<string, string>>({});
    const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
    const [dailyNotesMap, setDailyNotesMap] = useState<Record<string, string>>({});
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const getDayName = (dateStr: string) => {
        if (!dateStr) return '';
        if (dayNames.includes(dateStr)) return dateStr;
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1] || '';
        } catch (_) {
            return dateStr;
        }
    };

    const buildItemsForExam = (exam: any, schedData: any[], classMapRef: Record<string, string>, subjectMapRef: Record<string, string>) => {
        return schedData
            .filter((s: any) => s.exam_id === exam.id)
            .map((s: any) => {
                const cid = s.class_id?.toString() || '';
                return {
                    id: s.id?.toString() || '',
                    examId: s.exam_id?.toString() || '',
                    examType: exam.type || '',
                    classId: cid,
                    className: classMapRef[cid] || cid,
                    day: getDayName(s.exam_date),
                    date: s.exam_date || '',
                    startTime: s.start_time || '08:00',
                    endTime: s.end_time || '10:00',
                    subjectName: subjectMapRef[s.subject_id?.toString()] || s.subject_id || '-',
                    room: s.room || '',
                    notes: s.notes || '',
                };
            });
    };

    const switchExam = (idx: number) => {
        setActiveExamIdx(idx);
    };

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                if (!token) { setLoading(false); return; }
                const headers = { 'Authorization': `Bearer ${token}` };

                const teacherId = user?.id;

                const [examRes, schedRes, clsRes, subjRes, schedByTeacherRes] = await Promise.all([
                    fetch('/api/exams?status=eq.published', { headers }),
                    fetch('/api/exam_schedules', { headers }),
                    fetch('/api/classes', { headers }),
                    fetch('/api/subjects', { headers }),
                    teacherId ? fetch(`/api/schedules?teacher_id=eq.${teacherId}`, { headers }) : Promise.resolve({ ok: false } as Response),
                ]);

                const exams = examRes.ok ? await examRes.json() : [];
                const schedData = schedRes.ok ? await schedRes.json() : [];
                const classes = clsRes.ok ? await clsRes.json() : [];
                const subjects = subjRes.ok ? await subjRes.json() : [];

                const classMapLocal: Record<string, string> = {};
                classes.forEach((c: any) => { classMapLocal[c.id?.toString()] = c.name || c.id; });

                const subjectMapLocal: Record<string, string> = {};
                subjects.forEach((s: any) => { subjectMapLocal[s.id?.toString()] = s.name; });

                setClassMap(classMapLocal);
                setSubjectMap(subjectMapLocal);
                setAllSchedData(schedData);

                // Build daily notes map from exam.daily_notes
                const notesMap: Record<string, string> = {};
                exams.forEach((e: any) => {
                    try {
                        if (e.daily_notes) notesMap[e.id] = JSON.parse(e.daily_notes);
                    } catch (_) {}
                });
                setDailyNotesMap(notesMap);

                const teacherClassIds = new Set<string>();
                classes.forEach((c: any) => {
                    if (c.teacher_id === teacherId) teacherClassIds.add(c.id);
                });
                if (schedByTeacherRes.ok) {
                    const schedByTeacher = await schedByTeacherRes.json();
                    if (Array.isArray(schedByTeacher)) {
                        schedByTeacher.forEach((s: any) => {
                            if (s.class_id) teacherClassIds.add(s.class_id);
                        });
                    }
                }
                setMyClassIds(teacherClassIds);

                const activeExam = exams.find((e: any) => e.status === 'published') || exams[0];
                if (!activeExam) { setLoading(false); return; }

                setPublishedExams(exams.filter((e: any) => e.status === 'published'));

                const items = buildItemsForExam(activeExam, schedData, classMapLocal, subjectMapLocal);
                setExamItems(items);
                setExamTitle(`${activeExam.type || 'Ujian'} — ${activeExam.semester === 1 ? 'Ganjil' : 'Genap'}`);

                // Set initial daily note from dailyNotesMap
                const examNotes: any = notesMap[activeExam.id];
                if (examNotes !== null && examNotes !== undefined && typeof examNotes === 'object') {
                    const firstDay = items.length > 0 ? items[0].day : '';
                    setDailyNote(examNotes[firstDay] || '');
                }
            } catch (err) {
                console.error("Gagal memuat jadwal ujian:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [user]);

    // Rebuild items when switching exams
    useEffect(() => {
        if (publishedExams.length === 0 || allSchedData.length === 0) return;
        const exam = publishedExams[activeExamIdx];
        if (!exam) return;

        setExamTitle(`${exam.type || 'Ujian'} — ${exam.semester === 1 ? 'Ganjil' : 'Genap'}`);

        const items: ExamItem[] = allSchedData
            .filter((s: any) => s.exam_id === exam.id)
            .map((s: any) => {
                const cid = s.class_id?.toString() || '';
                return {
                    id: s.id?.toString() || '',
                    examId: s.exam_id?.toString() || '',
                    examType: exam.type || '',
                    classId: cid,
                    className: classMap[cid] || cid,
                    day: getDayName(s.exam_date),
                    date: s.exam_date || '',
                    startTime: s.start_time || '08:00',
                    endTime: s.end_time || '10:00',
                    subjectName: subjectMap[s.subject_id?.toString()] || s.subject_id || '-',
                    room: s.room || '',
                    notes: s.notes || '',
                };
            });

        setExamItems(items);

        // Load daily notes from exam (JSON per day)
        const rawNotes = dailyNotesMap[exam.id];
        if (rawNotes) {
            try {
                const parsed = typeof rawNotes === 'string' ? JSON.parse(rawNotes) : rawNotes;
                setDailyNote(parsed[selectedDay] || '');
            } catch (_) {
                setDailyNote('');
            }
        } else {
            setDailyNote('');
        }
    }, [activeExamIdx, publishedExams, allSchedData, classMap, subjectMap, dailyNotesMap, selectedDay]);

    const filteredItems = examItems.filter((item) => {
        if (item.day !== selectedDay) return false;
        if (!user?.id) return true;
        if (myClassIds.size === 0) return true;
        return myClassIds.has(item.classId);
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Jadwal Ujian</h3>
                    <p className="text-xs text-slate-500">{examTitle || 'Memuat data...'}</p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {publishedExams.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                                {publishedExams.map((exam, idx) => (
                                    <button
                                        key={exam.id}
                                        onClick={() => switchExam(idx)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                            idx === activeExamIdx
                                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        {exam.type} — {exam.semester === 1 ? 'Ganjil' : 'Genap'}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                                        selectedDay === day
                                            ? 'bg-[#004AAD] text-white border-[#004AAD] shadow-md shadow-blue-500/20'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 mb-8">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <div key={item.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-slate-800 text-base">{item.subjectName}</h4>
                                            <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">{item.className}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <span className="font-mono">{item.startTime} - {item.endTime}</span>
                                            </span>
                                            {item.room && (
                                                <span className="flex items-center gap-1">
                                                    <span>Ruangan: {item.room}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-400">
                                    <p className="font-bold text-sm">Tidak ada ujian</p>
                                    <p className="text-xs mt-1">Tidak ada jadwal ujian pada hari {selectedDay}.</p>
                                </div>
                            )}
                        </div>

                        {dailyNote && (
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-2">Catatan Ujian</h4>
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                    <p className="text-sm text-slate-600">{dailyNote}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JadwalUjian;
