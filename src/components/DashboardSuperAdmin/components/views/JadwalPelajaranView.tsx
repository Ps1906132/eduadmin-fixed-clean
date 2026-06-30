import React, { useState } from 'react';
import { Calendar, Plus, Trash2, RotateCcw, Save, Megaphone, BookOpen, Settings, Star, X, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DAYS, MasterSchedule } from '../../types';
import { useSchedules } from '../../hooks/useSchedules';
import { useSchedulePeriods } from '../../hooks/useSchedulePeriods';

interface ScheduleItem {
    id: string;
    classId: string;
    day: string;
    period: number;
    subjectId: number | string;
    teacherId?: string;
    customName?: string;
}

interface JadwalPelajaranViewProps {
    classes: any[];
    subjects: any[];
    teacherAssignments: any[];
    teachers: any[];
    setConfirmModal: (modal: any) => void;
}

const JadwalPelajaranView: React.FC<JadwalPelajaranViewProps> = ({
    classes,
    subjects,
    teacherAssignments,
    teachers,
    setConfirmModal
}) => {
    const { schedules, setSchedules } = useSchedules();
    const { periods: schedulePeriods, addPeriod, deletePeriod } = useSchedulePeriods();
    const [activeScheduleId, setActiveScheduleId] = useState<number>(() => {
        const published = schedules.find((s: any) => s.status === 'published');
        return published?.id || (schedules[0]?.id || 1);
    });
    const [selectedJadwalClass, setSelectedJadwalClass] = useState<string>('1A');
    const [selectedJadwalLevel, setSelectedJadwalLevel] = useState<number>(1);
    const [draggedItem, setDraggedItem] = useState<{ type: string; id: number | string; name: string } | null>(null);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [newPeriodData, setNewPeriodData] = useState({ start: '', end: '' });
    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');

    const handleDragStart = (e: React.DragEvent, type: string, id: number | string, name: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id.toString());
        e.dataTransfer.setData('name', name);
        setDraggedItem({ type, id, name });
    };

    const handleScheduleDrop = (e: React.DragEvent, day: string, period: number) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const idStr = e.dataTransfer.getData('id');
        const name = e.dataTransfer.getData('name');

        let subjectId: number | string = idStr;
        if (type === 'subject') subjectId = parseInt(idStr);

        // Resolve teacherId from teacherAssignments
        let teacherId: string | undefined;
        if (type === 'subject') {
            const assignment = teacherAssignments.find((ta: any) =>
                ta.classNama === selectedJadwalClass && ta.subjectIds.includes(subjectId as number)
            );
            if (assignment) teacherId = assignment.teacherId;
        }

        const newItem: ScheduleItem = {
            id: Date.now().toString(),
            classId: selectedJadwalClass,
            day,
            period,
            subjectId: subjectId,
            teacherId,
            customName: type === 'custom' ? name : undefined
        };

        const newSchedules = schedules.map((s: any) => {
            if (s.id === activeScheduleId) {
                const filteredItems = s.items.filter((i: any) => !(i.classId === selectedJadwalClass && i.day === day && i.period === period));
                return { ...s, items: [...filteredItems, newItem] };
            }
            return s;
        });

        setSchedules(newSchedules);
        setDraggedItem(null);
    };

    const handleDeleteScheduleItem = (itemId: string) => {
        setSchedules(schedules.map((s: any) => {
            if (s.id === activeScheduleId) {
                return { ...s, items: s.items.filter((i: any) => i.id !== itemId) };
            }
            return s;
        }));
    };

    const getConflictingItem = (item: ScheduleItem) => {
        if (typeof item.subjectId === 'string') return null;

        const assignment = teacherAssignments.find((ta: any) => ta.classNama === item.classId && ta.subjectIds.includes(item.subjectId as number));
        if (!assignment) return null;

        const schedule = schedules.find((s: any) => s.id === activeScheduleId);
        if (!schedule) return null;

        return schedule.items.find((other: any) => {
            if (other.id === item.id) return false;
            if (other.day !== item.day || other.period !== item.period) return false;

            if (typeof other.subjectId === 'string') return false;
            const otherAssignment = teacherAssignments.find((ta: any) => ta.classNama === other.classId && ta.subjectIds.includes(other.subjectId as number));

            return otherAssignment?.teacherId === assignment.teacherId;
        });
    };

    const handlePublishSchedule = () => {
        setSchedules(schedules.map((s: any) => s.id === activeScheduleId ? { ...s, status: 'published' } : s));
        toast.success("Jadwal Berhasil Dipublikasikan!");
    };

    const handleDeleteSemester = () => {
        if (schedules.length <= 1) {
            toast.error("Tidak dapat menghapus semester terakhir. Minimal harus ada satu semester.");
            return;
        }

        setConfirmModal({
            show: true,
            message: "Apakah anda yakin ingin menghapus SEMESTER ini beserta seluruh jadwalnya? Tindakan ini tidak dapat dibatalkan.",
            onConfirm: () => {
                const newSchedules = schedules.filter((s: any) => s.id !== activeScheduleId);
                setSchedules(newSchedules);
                setActiveScheduleId(newSchedules[0].id);
                toast.success("Semester berhasil dihapus.");
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const handleResetClassSchedule = () => {
        setConfirmModal({
            show: true,
            message: `Reset semua jadwal untuk Kelas ${selectedJadwalClass} di semester ini?`,
            onConfirm: () => {
                setSchedules(schedules.map((s: any) => {
                    if (s.id === activeScheduleId) {
                        return { ...s, items: s.items.filter((i: any) => i.classId !== selectedJadwalClass) };
                    }
                    return s;
                }));
                toast.success(`Jadwal Kelas ${selectedJadwalClass} dikosongkan.`);
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const confirmAddTime = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPeriodData.start || !newPeriodData.end) {
            toast.error("Jam mulai dan selesai wajib diisi!");
            return;
        }

        const nextPeriodNumber = schedulePeriods.length > 0
            ? Math.max(...schedulePeriods.map(p => p.period_number)) + 1
            : 1;

        const result = await addPeriod(nextPeriodNumber, newPeriodData.start, newPeriodData.end);
        if (result.success) {
            setShowTimeModal(false);
            setNewPeriodData({ start: '', end: '' });
        }
    };

    const handleDailyInfoChange = (day: string, field: 'seragam' | 'catatan', value: string) => {
        setSchedules(schedules.map((s: any) => {
            if (s.id === activeScheduleId) {
                const existingInfoIndex = s.dailyInfos?.findIndex((info: any) => info.classId === selectedJadwalClass && info.day === day);
                let newDailyInfos = s.dailyInfos ? [...s.dailyInfos] : [];

                if (existingInfoIndex !== undefined && existingInfoIndex !== -1) {
                    newDailyInfos[existingInfoIndex] = { ...newDailyInfos[existingInfoIndex], [field]: value };
                } else {
                    newDailyInfos.push({ classId: selectedJadwalClass, day, [field]: value });
                }
                return { ...s, dailyInfos: newDailyInfos };
            }
            return s;
        }));
    };

    const confirmAddSemester = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSemesterName) {
            toast.error("Nama semester wajib diisi!");
            return;
        }

        const newSemester: MasterSchedule = {
            id: Date.now(),
            name: newSemesterName,
            status: 'draft',
            items: [],
            dailyInfos: []
        };

        setSchedules([...schedules, newSemester]);
        setActiveScheduleId(newSemester.id);
        setShowSemesterModal(false);
        setNewSemesterName('');
        toast.success(`Semester "${newSemesterName}" berhasil dibuat!`, {
            icon: '📅',
            style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
            }
        });
    };

    return (
        <>
            <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between mb-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-blue-600" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-[#1E1B4B]">Jadwal Pelajaran</h2>
                            <p className="text-slate-500 text-xs">Kelola jadwal per semester</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block ml-1 uppercase tracking-wider">Tingkat</span>
                        <select
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 font-bold outline-none focus:border-blue-500 w-20 transition-all hover:bg-white"
                            value={selectedJadwalLevel}
                            onChange={(e) => {
                                const newLevel = parseInt(e.target.value);
                                setSelectedJadwalLevel(newLevel);
                                const firstClass = classes.find((c: any) => c.tingkat === newLevel);
                                if (firstClass) setSelectedJadwalClass(firstClass.nama);
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-slate-50 rounded-xl px-2 py-1.5 border border-slate-200 flex items-center gap-2">
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Semester</span>
                                <select
                                    className="bg-transparent border-none outline-none font-bold text-slate-700 text-sm w-36 cursor-pointer"
                                    value={activeScheduleId}
                                    onChange={(e) => setActiveScheduleId(parseInt(e.target.value))}
                                >
                                    {schedules.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => setShowSemesterModal(true)}
                                    className="w-5 h-5 bg-blue-100/50 rounded flex items-center justify-center hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="Buat Semester Baru"
                                >
                                    <Plus size={12} />
                                </button>
                                <button
                                    onClick={handleDeleteSemester}
                                    className="w-5 h-5 bg-red-100/50 rounded flex items-center justify-center hover:bg-red-100 text-red-600 transition-colors"
                                    title="Hapus Semester Ini"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-xl px-3 py-1.5 border border-indigo-100">
                            <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider">Kelas</span>
                            <select
                                className="bg-transparent border-none outline-none font-bold text-indigo-800 text-sm w-20 cursor-pointer"
                                value={selectedJadwalClass}
                                onChange={(e) => setSelectedJadwalClass(e.target.value)}
                            >
                                {classes.filter((c: any) => c.tingkat == selectedJadwalLevel).map((c: any) => <option key={c.id} value={c.nama}>Kelas {c.nama}</option>)}
                            </select>
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-2"></div>

                        <button
                            onClick={handleResetClassSchedule}
                            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors border border-transparent hover:border-slate-200"
                            title="Reset Jadwal Kelas Ini"
                        >
                            <RotateCcw size={18} />
                        </button>

                        <button
                            onClick={() => {
                                setSchedules(schedules);
                                toast.success("Jadwal pelajaran berhasil disimpan ke server!");
                            }}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-200"
                        >
                            <Save size={18} /> Simpan
                        </button>

                        <button
                            onClick={handlePublishSchedule}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-green-200"
                        >
                            <Megaphone size={18} /> Publikasi
                        </button>
                    </div>
                </div>

                {/* Main Content: Left Draggables, Right Grid */}
                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Left: Resources */}
                    <div className="w-64 flex flex-col gap-4 overflow-y-auto pr-2 min-w-[250px] border-r border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={16} /> Mata Pelajaran</h3>
                            <div className="space-y-2">
                                {subjects.filter((s: any) => s.level === 'Semua Tingkat' || s.level.includes(selectedJadwalLevel.toString())).map((sub: any) => (
                                    <div
                                        key={sub.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, 'subject', sub.id, sub.name)}
                                        className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing flex justify-between items-center group transition-all hover:border-blue-300"
                                    >
                                        <span className="font-bold text-sm text-slate-700">{sub.name}</span>
                                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600">
                                            <Plus size={14} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-700 mt-4 mb-3 flex items-center gap-2"><Settings size={16} /> Lainnya</h3>
                            <div className="space-y-2">
                                {['Upacara', 'Istirahat', 'Senam', 'Ekstrakurikuler', 'Sholat Dhuha', 'Pulang'].map(custom => (
                                    <div
                                        key={custom}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, 'custom', custom, custom)}
                                        className="bg-orange-50 border border-orange-100 p-3 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing text-orange-700 font-bold text-sm flex justify-between items-center"
                                    >
                                        {custom}
                                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Star size={12} className="fill-orange-400 text-orange-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Grid */}
                    <div className="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-2xl relative shadow-inner">
                        <table className="w-full border-collapse">
                            <thead className="bg-[#F8FAFC] sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4 border-b border-r border-slate-200 text-slate-500 font-bold text-sm w-24">
                                        Waktu
                                        <button
                                            onClick={() => setShowTimeModal(true)}
                                            className="ml-2 w-5 h-5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded inline-flex items-center justify-center transition-colors" title="Tambah Waktu Manual"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </th>
                                    {DAYS.map(day => <th key={day} className="p-4 border-b border-r border-slate-200 text-center text-slate-700 font-extrabold text-sm uppercase tracking-wide">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {/* SERAGAM ROW */}
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <td className="p-2 border-r border-slate-200 text-xs font-bold text-slate-500 text-center uppercase">Seragam</td>
                                    {DAYS.map(day => {
                                        const currentSchedule = schedules.find((s: any) => s.id === activeScheduleId);
                                        const info = currentSchedule?.dailyInfos?.find((i: any) => i.classId === selectedJadwalClass && i.day === day);
                                        return (
                                            <td key={`seragam-${day}`} className="p-1 border-r border-slate-200">
                                                <input
                                                    type="text"
                                                    placeholder="Masukkan Seragam..."
                                                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-center outline-none focus:border-blue-400 focus:bg-blue-50 transition-colors"
                                                    value={info?.seragam || ''}
                                                    onChange={(e) => handleDailyInfoChange(day, 'seragam', e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>

                                {schedulePeriods.map((period: any) => (
                                    <tr key={period.id} className="border-b border-slate-200 last:border-0">
                                        <td className="p-2 border-r border-slate-200 bg-white text-xs font-medium text-slate-500 text-center group relative">
                                            <div className="bg-slate-100 rounded px-2 py-1 inline-block mb-1 font-bold text-slate-600">JP {period.period_number}</div>
                                            <div className="font-mono text-[10px]">{period.start_time} - {period.end_time}</div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Hapus slot waktu ini?')) {
                                                        deletePeriod(period.id);
                                                    }
                                                }}
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-400 rounded transition-all"
                                                title="Hapus Slot Waktu"
                                            >
                                                <X size={10} />
                                            </button>
                                        </td>
                                        {DAYS.map(day => {
                                            const currentSchedule = schedules.find((s: any) => s.id === activeScheduleId);
                                            const item = currentSchedule?.items.find((i: any) => i.classId === selectedJadwalClass && i.day === day && i.period === period.period_number);
                                            const conflict = item ? getConflictingItem(item) : null;

                                            return (
                                                <td
                                                    key={`${day}-${period.id}`}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleScheduleDrop(e, day, period.period_number)}
                                                    className={`p-1 border-r border-slate-200 min-w-[140px] h-28 relative transition-all duration-300 align-top ${item
                                                        ? (conflict ? 'bg-red-50' : 'bg-white')
                                                        : 'bg-slate-50/50 hover:bg-blue-50/30'
                                                        }`}
                                                >
                                                    {item ? (
                                                        <div className={`w-full h-full rounded-xl p-3 flex flex-col justify-between text-xs group relative shadow-sm border ${conflict ? 'border-red-200 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
                                                            <div className="flex-1">
                                                                <div className={`font-bold text-sm mb-1 leading-tight ${conflict ? 'text-red-800' : 'text-blue-800'}`}>
                                                                    {typeof item.subjectId === 'string'
                                                                        ? item.customName
                                                                        : subjects.find((s: any) => s.id === item.subjectId)?.name
                                                                    }
                                                                </div>
                                                                {typeof item.subjectId !== 'string' && (
                                                                    <div className={`text-[10px] ${conflict ? 'text-red-500' : 'text-blue-400'} mt-1 truncate`}>
                                                                        {(() => {
                                                                            const assign = teacherAssignments.find((ta: any) => ta.classNama === item.classId && ta.subjectIds.includes(item.subjectId as number));
                                                                            return assign ? teachers.find((t: any) => t.id === assign.teacherId)?.nama : 'Belum ada guru';
                                                                        })()}
                                                                    </div>
                                                                )}

                                                                {conflict && (
                                                                    <div className="mt-2 text-[10px] text-red-600 font-bold bg-white/60 px-2 py-1 rounded-lg flex flex-col gap-0.5 border border-red-100 animate-pulse">
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> BENTROK GURU
                                                                        </div>
                                                                        <div className="text-[9px] text-red-500/80 italic">Mengajar di Kelas {conflict.classId}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteScheduleItem(item.id)}
                                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-all transform hover:scale-110"
                                                                title="Hapus Jadwal"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>

                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-300 font-medium text-[10px] group-hover:border-blue-200 group-hover:text-blue-300 transition-colors pointer-events-none">
                                                            + Drop Sini
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {/* CATATAN ROW */}
                                <tr className="bg-slate-50/80 border-b border-slate-200">
                                    <td className="p-2 border-r border-slate-200 text-xs font-bold text-slate-500 text-center uppercase align-top pt-4">Catatan</td>
                                    {DAYS.map(day => {
                                        const currentSchedule = schedules.find((s: any) => s.id === activeScheduleId);
                                        const info = currentSchedule?.dailyInfos?.find((i: any) => i.classId === selectedJadwalClass && i.day === day);
                                        return (
                                            <td key={`catatan-${day}`} className="p-1 border-r border-slate-200">
                                                <textarea
                                                    placeholder="Catatan Harian..."
                                                    className="w-full h-24 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-blue-50 transition-colors resize-none"
                                                    value={info?.catatan || ''}
                                                    onChange={(e) => handleDailyInfoChange(day, 'catatan', e.target.value)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH WAKTU JADWAL */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-lg text-slate-800">Tambah Jam Pelajaran</h3>
                            <button onClick={() => setShowTimeModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={confirmAddTime} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        required
                                        value={newPeriodData.start}
                                        onChange={(e) => setNewPeriodData({ ...newPeriodData, start: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        required
                                        value={newPeriodData.end}
                                        onChange={(e) => setNewPeriodData({ ...newPeriodData, end: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowTimeModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Tambah</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH SEMESTER JADWAL */}
            {showSemesterModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">Tambah Semester</h3>
                            </div>
                            <button onClick={() => setShowSemesterModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={confirmAddSemester} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Semester / Tahun Ajaran</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Genap 2025/2026"
                                    value={newSemesterName}
                                    onChange={(e) => setNewSemesterName(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 leading-relaxed italic">
                                    Semester baru akan dimulai dengan jadwal kosong (Draft). Anda perlu mengatur ulang jadwal per kelas.
                                </p>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowSemesterModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                <button type="submit" className="flex-1 py-3 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Buat Semester</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default JadwalPelajaranView;
