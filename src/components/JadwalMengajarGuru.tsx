import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react';

interface JadwalMengajarGuruProps {
    onBack: () => void;
    user?: any;
}

interface ScheduleEntry {
    id: string;
    day: string;
    period: number;
    subjectName: string;
    className: string;
    startTime: string;
    endTime: string;
    room: string;
}

const JadwalMengajarGuru: React.FC<JadwalMengajarGuruProps> = ({ onBack, user }) => {
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date().getDay();
    const currentDayIndex = today === 0 ? 5 : today - 1;
    const [dayOrder, setDayOrder] = useState<number>(currentDayIndex + 1);

    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true);
            try {
                const teacherId = user?.id;
                if (!teacherId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('eduadmin_token');
                if (!token) { setLoading(false); return; }
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch schedules + subjects + classes + periods in parallel
                const [schRes, subjRes, clsRes, perRes] = await Promise.all([
                    fetch('/api/schedules?is_published=eq.1', { headers }),
                    fetch('/api/subjects', { headers }),
                    fetch('/api/classes', { headers }),
                    fetch('/api/schedule_periods', { headers }),
                ]);

                const schData = schRes.ok ? await schRes.json() : [];
                const subjects = subjRes.ok ? await subjRes.json() : [];
                const classes = clsRes.ok ? await clsRes.json() : [];
                const periods = perRes.ok ? await perRes.json() : [];

                // Build lookup maps
                const subjectMap: Record<string, string> = {};
                subjects.forEach((s: any) => { subjectMap[s.id?.toString()] = s.name || s.nama; });

                const classMap: Record<string, string> = {};
                classes.forEach((c: any) => { classMap[c.id?.toString()] = c.name || c.nama || c.id; });

                // period_id stored as "1", "2", etc. — build array index by period number
                const periodTimes: Record<number, { start: string; end: string }> = {};
                periods.forEach((p: any) => {
                    const num = typeof p.period_number === 'number' ? p.period_number : parseInt(String(p.id)?.replace('per-', ''));
                    if (!isNaN(num)) {
                        periodTimes[num] = { start: p.start_time || '07:00', end: p.end_time || '08:00' };
                    }
                });

                // Filter flat rows by teacher_id
                const rows = Array.isArray(schData) ? schData : [];
                const myEntries: ScheduleEntry[] = rows
                    .filter((r: any) => r.teacher_id === teacherId)
                    .map((r: any) => {
                        const periodNum = parseInt(String(r.period_id)?.replace('per-', '')) || 0;
                        const pt = periodTimes[periodNum];
                        return {
                            id: r.id?.toString() || '',
                            day: r.day_of_week || '',
                            period: periodNum,
                            subjectName: subjectMap[r.subject_id?.toString()] || r.subject_id || '-',
                            className: classMap[r.class_id?.toString()] || r.class_id || '-',
                            startTime: pt?.start || '--:--',
                            endTime: pt?.end || '--:--',
                            room: r.room || '',
                        };
                    });

                setSchedule(myEntries);
            } catch (e) {
                console.error('Failed to load schedule from D1:', e);
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [user]);

    const daySchedule = schedule
        .filter((s) => s.day === days[dayOrder - 1])
        .sort((a, b) => a.period - b.period);

    const formatTime = (time: string) => {
        if (!time) return '--:--';
        return time.substring(0, 5);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Jadwal Mengajar</h3>
                    <p className="text-xs text-slate-500">{user?.nama || 'Guru'}</p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                <>
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {days.map((day, i) => (
                        <button
                            key={day}
                            onClick={() => setDayOrder(i + 1)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                                dayOrder === i + 1
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {daySchedule.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold text-sm">Tidak ada jadwal</p>
                            <p className="text-xs mt-1">Tidak ada mata pelajaran yang dijadwalkan pada hari ini.</p>
                        </div>
                    ) : (
                        daySchedule.map((item) => (
                            <div key={item.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-slate-800 text-base">{item.subjectName}</h4>
                                    <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">{item.className}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} className="text-blue-500" />
                                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} className="text-blue-500" />
                                        {item.room || 'Ruang Kelas'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default JadwalMengajarGuru;