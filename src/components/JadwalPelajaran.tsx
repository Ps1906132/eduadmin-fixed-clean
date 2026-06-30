import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subjectsDataGlobal } from '../data/sharedData';

interface JadwalPelajaranProps {
    onBack: () => void;
    user?: any;
}

const JadwalPelajaran: React.FC<JadwalPelajaranProps> = ({ onBack, user }) => {
    const [selectedDay, setSelectedDay] = useState('Senin');
    const [loading, setLoading] = useState(true);
    const [schedulePeriods, setSchedulePeriods] = useState<any[]>([]);
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat", 'Sabtu'];

    const normalizeClassName = (name: string) => {
        if (!name) return '';
        return name.toString().toLowerCase().replace(/kelas\s+/g, '').trim();
    };

    const studentClass = user?.studentClass || user?.kelas || '';
    const normalizedStudentClass = normalizeClassName(studentClass);

    const [masterSchedule, setMasterSchedule] = useState<any>(() => {
        return { id: 1, name: 'Jadwal Pelajaran', status: 'published', items: [], dailyInfos: [] };
    });

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const headers = { 'Authorization': `Bearer ${token}` };

                const [schedRes, classRes, subjRes, periodsRes] = await Promise.all([
                    fetch('/api/schedules', { headers }),
                    fetch('/api/classes', { headers }),
                    fetch('/api/subjects', { headers }),
                    fetch('/api/schedule_periods', { headers })
                ]);

                if (periodsRes.ok) {
                    const periodsData = await periodsRes.json();
                    if (Array.isArray(periodsData)) {
                        setSchedulePeriods(periodsData);
                    }
                }

                if (schedRes.ok && classRes.ok) {
                    const schedData = await schedRes.json();
                    const classData = classRes.ok ? await classRes.json() : [];
                    const subjData = subjRes.ok ? await subjRes.json() : [];

                    const classMap = new Map();
                    if (Array.isArray(classData)) {
                        classData.forEach((c: any) => classMap.set(c.id?.toString(), c.name));
                    }
                    const subjectMap = new Map();
                    if (Array.isArray(subjData)) {
                        subjData.forEach((s: any) => subjectMap.set(s.id?.toString(), s.name));
                    }

                    const periodsData = periodsRes.ok ? await periodsRes.json() : [];
                    const periodMap = new Map();
                    if (Array.isArray(periodsData)) {
                        periodsData.forEach((p: any) => periodMap.set(p.id?.toString(), p.period_number));
                    }

                    if (Array.isArray(schedData)) {
                        const mappedItems = schedData.map((item: any) => ({
                            id: item.id.toString(),
                            classId: classMap.get(item.class_id?.toString()) || item.class_id,
                            day: item.day_of_week,
                            period: periodMap.get(item.period_id?.toString()) || 0,
                            subjectId: item.subject_id?.toString(),
                            subjectName: subjectMap.get(item.subject_id?.toString()) || 'Mata Pelajaran'
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
                toast.error('Gagal memuat jadwal pelajaran');
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const items = (masterSchedule?.items || [])
        .filter((item: any) => {
            const itemClass = normalizeClassName(item.classId);
            return itemClass === normalizedStudentClass && item.day === selectedDay;
        })
        .sort((a: any, b: any) => (a.period ?? 0) - (b.period ?? 0));

    const dailyInfo = masterSchedule?.dailyInfos?.find((info: any) => {
        const infoClass = normalizeClassName(info.classId);
        return infoClass === normalizedStudentClass && info.day === selectedDay;
    });

    const getSubjectName = (subjectId: number | string, customName?: string) => {
        if (customName) return customName;
        if (subjectId === 'custom' && customName) return customName;

        const item = Array.isArray(masterSchedule?.items) ? masterSchedule.items.find((i: any) => i.subjectId === subjectId?.toString()) : null;
        if (item?.subjectName && item.subjectName !== 'Mata Pelajaran') return item.subjectName;

        const subject = subjectsDataGlobal.find((s: any) => s.id === Number(subjectId));
        return subject ? subject.nama : 'Mata Pelajaran';
    };

    const getTimeLabel = (periodNumber: number) => {
        const p = schedulePeriods.find((period: any) => period.period_number === periodNumber);
        if (p) {
            const label = p.label || `Jam ke-${periodNumber}`;
            return `${label} (${p.start_time} - ${p.end_time})`;
        }
        return `Jam ke-${periodNumber}`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg">Jadwal Pelajaran</h3>
                        <p className="text-xs text-slate-500">Memuat data...</p>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004AAD]"></div>
                    <span className="ml-3 text-sm text-slate-500">Memuat jadwal pelajaran...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Jadwal Pelajaran</h3>
                    <p className="text-xs text-slate-500">
                        Kelas {studentClass.replace(/^Kelas\s+/i, '')} • {masterSchedule.name}
                    </p>
                </div>
            </div>

            <div className="p-6">
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

                <div className="mb-6">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <span className="text-sm font-bold text-slate-700 w-20 flex-shrink-0">Seragam</span>
                        <div className="h-6 w-[1px] bg-slate-300"></div>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                            {dailyInfo?.seragam || 'Sesuaikan dengan tata tertib sekolah'}
                        </span>
                    </div>
                </div>

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
