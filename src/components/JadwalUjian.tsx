import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { examsDataGlobal, classesDataGlobal, subjectsDataGlobal } from '../data/sharedData';

interface JadwalUjianProps {
    onBack: () => void;
    user?: any;
}

const JadwalUjian: React.FC<JadwalUjianProps> = ({ onBack, user }) => {
    const [selectedDay, setSelectedDay] = useState('Senin');
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];

    const studentClass = user?.studentClass || user?.kelas || '1A';

    // 1. Get Master Exam Schedule (with API Sync)
    const [masterExam, setMasterExam] = useState(() => {
        return examsDataGlobal.find(e => e.status === 'published') || examsDataGlobal[0];
    });

    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu', 'Minggu'];

    const getDayName = (dateStr: string) => {
        if (!dateStr) return '';
        if (dayNames.includes(dateStr)) return dateStr; // Already a day name
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1] || ''; // JS Sunday=0 → Monday=0
        } catch (_) {
            return dateStr;
        }
    };

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const token = localStorage.getItem('eduadmin_token');
                if (!token) return;
                const headers = { 'Authorization': `Bearer ${token}` };

                const [examRes, classRes, subjRes, profRes] = await Promise.all([
                    fetch('/api/exam_schedules', { headers }),
                    fetch('/api/classes', { headers }),
                    fetch('/api/subjects', { headers }),
                    fetch('/api/profiles', { headers })
                ]);

                if (examRes.ok) {
                    const data = await examRes.json();
                    const classData = classRes.ok ? await classRes.json() : [];
                    const subjData = subjRes.ok ? await subjRes.json() : [];
                    const profData = profRes.ok ? await profRes.json() : [];

                    const classMap = new Map();
                    classData.forEach((c: any) => classMap.set(c.id?.toString(), c.name));
                    const subjectMap = new Map();
                    subjData.forEach((s: any) => subjectMap.set(s.id?.toString(), s.name));
                    const teacherMap = new Map();
                    profData.forEach((p: any) => teacherMap.set(p.id?.toString(), p.full_name));

                    if (Array.isArray(data) && data.length > 0) {
                        const mappedItems = data.map(item => ({
                            id: item.id.toString(),
                            examId: item.exam_id?.toString() || '',
                            classId: classMap.get(item.class_id?.toString()) || item.class_id,
                            day: getDayName(item.exam_date),
                            timeSlotId: 0,
                            subjectName: subjectMap.get(item.subject_id?.toString()) || 'Mata Pelajaran',
                            teacherName: teacherMap.get(item.teacher_id?.toString()) || '-'
                        }));
                        setMasterExam((prev: any) => ({
                            ...prev,
                            items: mappedItems,
                            status: 'published'
                        }));
                    }
                }
            } catch (err) {
                console.error("Gagal sinkronisasi jadwal ujian:", err);
            }
        };
        fetchExams();
    }, []);
    
    // 2. Filter Items for Class and Day
    const items = masterExam ? masterExam.items
        .filter(item => item.classId === studentClass && item.day === selectedDay)
        .sort((a, b) => a.timeSlotId - b.timeSlotId) : [];

    // 3. Get Daily Info (Uniform & Notes from standard or specific exam notes)
    // Exam schedule has 'dailyNotes'. Uniform might be standard or specific. 
    // For now, we use a placeholder or check if MasterExamSchedule has daily uniform info.
    // The current MasterExamSchedule interface only has dailyNotes.
    const dailyNote = masterExam?.dailyNotes?.[selectedDay];

    // Helper: Get Time Label
    const getTimeLabel = (slotId: number) => {
        if (!masterExam) return '-';
        const slot = masterExam.timeSlots.find(s => s.id === slotId);
        return slot ? `${slot.start} - ${slot.end}` : `Sesi ${slotId + 1}`;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header / Title inside the card */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Jadwal Ujian</h3>
                    <p className="text-xs text-slate-500">
                        Kelas {studentClass} • {masterExam ? `${masterExam.type} ${masterExam.semester} ${masterExam.year}` : 'Tidak ada jadwal aktif'}
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedDay === day
                                ? 'bg-[#004AAD] text-white border-[#004AAD] shadow-md shadow-blue-500/20'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Uniform Info (Static or Dynamic if added later) */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-slate-700 w-20 flex-shrink-0">Seragam</span>
                        <div className="h-6 w-[1px] bg-slate-300"></div>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                            Sesuaikan dengan tata tertib ujian sekolah
                        </span>
                    </div>
                </div>

                {/* Schedule List */}
                <div className="space-y-3 mb-8">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={item.id} className="flex items-center bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors shadow-sm">
                                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded-lg text-sm mr-4 flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-1">
                                    <div className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit mb-1 sm:mb-0">
                                        {getTimeLabel(item.timeSlotId)}
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        {item.subjectName}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">Tidak ada ujian pada hari ini.</p>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Catatan Ujian</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[100px]">
                        <p className="text-sm text-slate-600">
                            {dailyNote || 'Harap membawa Kartu Ujian dan alat tulis lengkap. Dilarang membawa HP ke dalam ruang ujian.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JadwalUjian;
