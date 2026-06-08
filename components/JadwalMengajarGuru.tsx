import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react';
import { schedulesDataGlobal, subjectsDataGlobal, schedulePeriodsGlobal } from '../data/sharedData';

interface JadwalMengajarGuruProps {
    onBack: () => void;
    user?: any;
}

const JadwalMengajarGuru: React.FC<JadwalMengajarGuruProps> = ({ onBack, user }) => {
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');

    // Logic to Get Real Schedule from Global Data
    const getTeacherSchedule = () => {
        const teacherName = user?.nama || '';
        if (!teacherName) return [];

        // 1. Get Teacher Assignments from localStorage (Plotting data)
        const savedAssignments = localStorage.getItem('teacher_assignments_v2');
        const teacherAssignments = savedAssignments ? JSON.parse(savedAssignments) : [];

        // 2. Identify which classes and subjects are assigned to this teacher
        const myAssignments = teacherAssignments.filter((ta: any) => {
            return ta.teacherName === teacherName || ta.teacherId === user?.id;
        });

        // 3. Get Published Schedule from localStorage or Fallback
        let publishedSchedule = null;
        if (typeof window !== 'undefined') {
            const savedSchedules = localStorage.getItem('schedules_data_v2');
            if (savedSchedules) {
                const parsed = JSON.parse(savedSchedules);
                publishedSchedule = parsed.find((s: any) => s.status === 'published') || parsed[0];
            }
        }
        
        if (!publishedSchedule) {
            publishedSchedule = schedulesDataGlobal.find(s => s.status === 'published') || schedulesDataGlobal[0];
        }

        if (!publishedSchedule) return [];

        // 4. Map the schedule items
        const results: any[] = [];

        publishedSchedule.items.forEach((item: any) => {
            // Check if this item matches teacher's assignment
            const isMyMapel = myAssignments.some((ta: any) =>
                ta.classNama === item.classId && ta.subjectIds.includes(Number(item.subjectId))
            );

            if (isMyMapel) {
                const periodInfo = schedulePeriodsGlobal.find(p => p.id === item.period);
                const subjectInfo = subjectsDataGlobal.find(s => s.id === Number(item.subjectId));

                results.push({
                    id: item.id,
                    hari: item.day,
                    jam: periodInfo ? `${periodInfo.start} - ${periodInfo.end}` : `Jam ke-${item.period}`,
                    kelas: item.classId,
                    mapel: subjectInfo?.nama || item.customName || 'Mata Pelajaran',
                    ruang: `R. ${item.classId}`
                });
            }
        });

        // Sort by Day then Time
        const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return results.sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari);
            if (dayDiff !== 0) return dayDiff;
            return a.jam.localeCompare(b.jam);
        });
    };

    const jadwal = getTeacherSchedule();

    const getHariColor = (hari: string) => {
        switch (hari) {
            case 'Senin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Selasa': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Rabu': return 'bg-green-100 text-green-700 border-green-200';
            case 'Kamis': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Jumat': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
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
                    Jadwal Mengajar
                </h2>
            </div>
            <div className="flex gap-2 p-4 pb-0">
                <div className="bg-white border rounded-xl px-4 py-2 text-sm font-bold text-blue-600 flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Semester:</span>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-transparent border-none outline-none focus:ring-0 cursor-pointer pr-1"
                    >
                        <option>1 (Ganjil)</option>
                        <option>2 (Genap)</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                <div className="grid gap-4">
                    {jadwal.length > 0 ? (
                        jadwal.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${getHariColor(item.hari)} shrink-0`}>
                                        <span className="text-xs font-bold uppercase">{item.hari.substring(0, 3)}</span>
                                        <span className="text-lg font-bold">{item.hari === 'Senin' ? '1' : item.hari === 'Selasa' ? '2' : item.hari === 'Rabu' ? '3' : item.hari === 'Kamis' ? '4' : '5'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{item.mapel}</h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">Kelas {item.kelas}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {item.jam}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm md:text-right md:justify-end pl-20 md:pl-0">
                                    <MapPin size={16} />
                                    <span>{item.ruang}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar size={40} className="text-slate-300" />
                            </div>
                            <h3 className="font-bold text-slate-800">Belum Ada Jadwal</h3>
                            <p className="text-sm text-slate-500 text-center max-w-xs px-6">
                                Anda belum memiliki jadwal mengajar yang diatur oleh Admin untuk semester ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default JadwalMengajarGuru;
