import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { schedulesDataGlobal, subjectsDataGlobal, schedulePeriodsGlobal } from '../data/sharedData';

interface JadwalPelajaranProps {
    onBack: () => void;
    user?: any;
}

const JadwalPelajaran: React.FC<JadwalPelajaranProps> = ({ onBack, user }) => {
    const [selectedDay, setSelectedDay] = useState('Senin');
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];

    // Normalisasi nama kelas untuk perbandingan yang lebih akurat
    const normalizeClassName = (name: string) => {
        if (!name) return '';
        return name.toString().toLowerCase().replace(/kelas\s+/g, '').trim();
    };

    const studentClass = user?.studentClass || user?.kelas || '';
    const normalizedStudentClass = normalizeClassName(studentClass);

    // 1. Get Master Schedule (with API Sync)
    const [masterSchedule, setMasterSchedule] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('schedules_data_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.find((s: any) => s.status === 'published') || parsed[0] || schedulesDataGlobal[0];
            }
        }
        return schedulesDataGlobal.find(s => s.status === 'published') || schedulesDataGlobal[0];
    });

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('eduadmin_token');
                if (!token) return;
                const res = await fetch('/api/schedules', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const mappedItems = data.map(item => ({
                            id: item.id.toString(),
                            classId: item.class_id,
                            day: item.day_of_week,
                            period: parseInt(item.period_id) || 0,
                            subjectId: isNaN(Number(item.subject_id)) ? item.subject_id : Number(item.subject_id)
                        }));
                        setMasterSchedule((prev: any) => ({
                            ...prev,
                            items: mappedItems,
                            status: 'published'
                        }));
                    }
                }
            } catch (err) {
                console.error("Gagal sinkronisasi jadwal:", err);
            }
        };
        fetchSchedules();
    }, []);

    // 2. Filter Items for Class and Day (with normalization)
    const items = (masterSchedule?.items || [])
        .filter((item: any) => {
            const itemClass = normalizeClassName(item.classId);
            return itemClass === normalizedStudentClass && item.day === selectedDay;
        })
        .sort((a: any, b: any) => (a.period ?? 0) - (b.period ?? 0));

    // 3. Get Daily Info (Uniform & Notes)
    const dailyInfo = masterSchedule?.dailyInfos?.find((info: any) => {
        const infoClass = normalizeClassName(info.classId);
        return infoClass === normalizedStudentClass && info.day === selectedDay;
    });

    // Helper: Get Subject Name
    const getSubjectName = (subjectId: number | string, customName?: string) => {
        if (customName) return customName;
        if (subjectId === 'custom' && customName) return customName;

        const subject = subjectsDataGlobal.find(s => s.id === Number(subjectId));
        return subject ? subject.nama : 'Mata Pelajaran';
    };

    // Helper: Get Time Label
    const getTimeLabel = (periodId: number) => {
        const p = schedulePeriodsGlobal.find(period => period.id === periodId);
        return p ? `${p.start} - ${p.end}` : `Jam ke-${periodId}`;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header / Title inside the card */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Jadwal Pelajaran</h3>
                    <p className="text-xs text-slate-500">
                        Kelas {studentClass} • {masterSchedule.name}
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

                {/* Uniform Info */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-slate-700 w-20 flex-shrink-0">Seragam</span>
                        <div className="h-6 w-[1px] bg-slate-300"></div>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                            {dailyInfo?.seragam || 'Sesuaikan dengan tata tertib sekolah'}
                        </span>
                    </div>
                </div>

                {/* Schedule List */}
                <div className="space-y-3 mb-8">
                    {items.length > 0 ? (
                        items.map((item: { id?: string | number; period?: number; day?: string; subject?: string; subjectId?: string | number; customName?: string; teacher?: string }, index: number) => (
                            <div key={item.id} className="flex items-center bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors shadow-sm">
                                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded-lg text-sm mr-4 flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 flex-1">
                                    <div className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit mb-1 sm:mb-0">
                                        {getTimeLabel(item.period ?? 0)}
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        {getSubjectName(item.subjectId ?? '', item.customName)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">Belum ada jadwal untuk hari ini.</p>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Catatan</h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[100px]">
                        <p className="text-sm text-slate-600">
                            {dailyInfo?.catatan || 'Tidak ada catatan khusus.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JadwalPelajaran;
