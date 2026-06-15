import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface JadwalBimbelGuruProps {
    onBack: () => void;
    user?: any;
    classes?: any[];
}

const JadwalBimbelGuru: React.FC<JadwalBimbelGuruProps> = ({ onBack, user, classes = [] }) => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const [selectedDay, setSelectedDay] = useState('Senin');

    const daySchedule = classes.filter(c => {
        const sched = c.schedule || '';
        return sched.toLowerCase().includes(selectedDay.toLowerCase());
    });

    const getHariColor = (hari: string) => {
        switch (hari) {
            case 'Senin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Selasa': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Rabu': return 'bg-green-100 text-green-700 border-green-200';
            case 'Kamis': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Jumat': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-text-700 border-slate-200';
        }
    };

    const parseScheduleTime = (schedule: string) => {
        const match = schedule.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
        return match ? match[1] : '--:--';
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Jadwal Mengajar {user?.nama ? user.nama.split(',')[0] : 'Saya'}
                </h2>
            </div>

            {/* Day Tabs */}
            <div className="px-4 md:px-6 pt-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                                selectedDay === day
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                {daySchedule.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold text-sm">Tidak ada jadwal</p>
                        <p className="text-xs mt-1">Tidak ada bimbel yang dijadwalkan pada hari ini.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {daySchedule.map((item: any) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'Selesai' ? 'bg-slate-300' : 'bg-blue-500'}`}></div>

                                <div className="flex items-start gap-4 pl-2">
                                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${getHariColor(selectedDay)} shrink-0`}>
                                        <span className="text-xs font-bold uppercase">{selectedDay.substring(0, 3)}</span>
                                        <span className="text-xl font-bold">{parseScheduleTime(item.schedule)}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-indigo-100 text-indigo-600">
                                                Bimbel
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">• {item.title}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.teacher}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                            <Clock size={14} /> <span>{item.schedule}</span>
                                        </div>
                                        {item.room && (
                                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                                <MapPin size={14} /> <span>{item.room}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JadwalBimbelGuru;
