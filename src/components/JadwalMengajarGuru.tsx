import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react';

interface JadwalMengajarGuruProps {
    onBack: () => void;
    user?: any;
}

const JadwalMengajarGuru: React.FC<JadwalMengajarGuruProps> = ({ onBack, user }) => {
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dayOrder, setDayOrder] = useState<number>(1);

    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true);
            try {
                const teacherName = user?.nama || '';
                const teacherId = user?.id;
                if (!teacherName && !teacherId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const res = await fetch('/api/schedules?status=eq.published', { headers });
                if (res.ok) {
                    const schedules = await res.json();
                    const activeSchedule = Array.isArray(schedules) ? schedules[0] : null;

                    if (activeSchedule?.entries) {
                        const myEntries = activeSchedule.entries.filter((e: any) =>
                            e.teacherName === teacherName || e.teacherId === teacherId
                        );
                        setSchedule(myEntries);
                    }
                }
            } catch (e) {
                console.error('Failed to load schedule from D1:', e);
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [user]);

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const today = new Date().getDay();
    const currentDayIndex = today === 0 ? 5 : today - 1;

    const daySchedule = schedule.filter((s: any) => s.day === days[dayOrder - 1]);

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
                        daySchedule.map((item: any, idx: number) => (
                            <div key={idx} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-bold text-slate-800 text-base">{item.subject || item.subjectName || '-'}</h4>
                                    <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">{item.className || item.class || '-'}</span>
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