import React, { useState } from 'react';
import {
    CalendarClock,
    BookOpenCheck,
    ClipboardList,
    Info,
    ArrowLeft,
    Plus,
    FileSpreadsheet,
    CloudUpload,
    ChevronDown,
    Save,
    Trash2,
    GripVertical,
    Clock,
    Shirt,
    X,
    Pencil,
    PanelLeftClose,
    PanelLeftOpen,
    Megaphone,
    FileText
} from 'lucide-react';

// Tipe data untuk Slot Jadwal
interface ScheduleSlot {
    id: string; // format: "Senin-0" (Hari-IndexJam)
    subject: string;
    teacher: string;
    color: string;
}

interface TimeSlot {
    id: number;
    start: string;
    end: string;
    label: string;
}

interface KelasItem {
    id: number;
    kode: string;
    nama: string;
    tingkat: string;
    paralel: string;
}

interface MapelItem {
    no: number;
    nama: string;
    kode: string;
    kelas: string;
    kelompok: string;
}

interface JadwalProps {
    kelasData?: KelasItem[];
    mapelData?: MapelItem[];
}

const Jadwal: React.FC<JadwalProps> = ({ kelasData = [], mapelData = [] }) => {
    const [activeView, setActiveView] = useState('menu');
    const [selectedKelas, setSelectedKelas] = useState(kelasData.length > 0 ? `${kelasData[0].tingkat} ${kelasData[0].paralel}` : '1 A');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // --- STATE UTAMA UNTUK JADWAL ---
    const [schedule, setSchedule] = useState<Record<string, ScheduleSlot>>({
        'Senin-0': { id: 'Senin-0', subject: 'Upacara Bendera', teacher: '-', color: 'bg-red-100 border-red-200 text-red-700' },
        'Senin-3': { id: 'Senin-3', subject: 'Istirahat', teacher: '-', color: 'bg-slate-100 border-slate-200 text-slate-600' },
    });

    // --- STATE UNTUK JADWAL UJIAN ---
    const [examSchedule, setExamSchedule] = useState<Record<string, ScheduleSlot>>({});
    const [examTimeSlots, setExamTimeSlots] = useState<TimeSlot[]>([
        { id: 0, start: '07:30', end: '09:00', label: 'Sesi Ujian 1' },
        { id: 1, start: '09:00', end: '09:30', label: 'Istirahat' },
        { id: 2, start: '09:30', end: '11:00', label: 'Sesi Ujian 2' },
    ]);

    // --- STATE UNTUK WAKTU & SERAGAM ---
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        { id: 0, start: '07:00', end: '07:45', label: 'Jam ke-1' },
        { id: 1, start: '07:45', end: '08:30', label: 'Jam ke-2' },
        { id: 2, start: '08:30', end: '09:15', label: 'Jam ke-3' },
        { id: 3, start: '09:15', end: '09:45', label: 'Jam ke-4 (Istirahat)' },
        { id: 4, start: '09:45', end: '10:30', label: 'Jam ke-5' },
    ]);

    // ... (dailyUniforms, modals, draggedItem remain same)

    const [dailyUniforms, setDailyUniforms] = useState<Record<string, string>>({
        'Senin': 'Putih Merah & Topi',
        'Selasa': 'Putih Merah',
        'Rabu': 'Batik Sekolah',
        'Kamis': 'Batik Bebas',
        'Jumat': 'Muslim / Koko',
        'Sabtu': 'Pramuka'
    });

    // --- STATE UNTUK CATATAN HARIAN ---
    const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({
        'Senin': '',
        'Selasa': '',
        'Rabu': '',
        'Kamis': '',
        'Jumat': '',
        'Sabtu': ''
    });

    // --- STATE UNTUK FILTER ---
    const [selectedTingkat, setSelectedTingkat] = useState('1');
    const [selectedSemester, setSelectedSemester] = useState('Ganjil');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2025/2026');

    // --- STATE UNTUK MODALS ---
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [newTime, setNewTime] = useState({ start: '', end: '', label: '' });

    const [isUniformModalOpen, setIsUniformModalOpen] = useState(false);
    const [selectedDayForUniform, setSelectedDayForUniform] = useState<string | null>(null);
    const [tempUniform, setTempUniform] = useState('');

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedDayForNote, setSelectedDayForNote] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState('');


    // --- STATE UNTUK ITEM DRAGGABLE ---
    const [draggedItem, setDraggedItem] = useState<{ subject: string, teacher: string, color: string } | null>(null);

    // --- KONFIGURASI CONSTANT ---
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Helper colors for dynamic subjects
    const colorPalette = [
        'bg-blue-100 border-blue-200 text-blue-700',
        'bg-emerald-100 border-emerald-200 text-emerald-700',
        'bg-violet-100 border-violet-200 text-violet-700',
        'bg-orange-100 border-orange-200 text-orange-700',
        'bg-lime-100 border-lime-200 text-lime-700',
        'bg-pink-100 border-pink-200 text-pink-700',
        'bg-teal-100 border-teal-200 text-teal-700',
        'bg-indigo-100 border-indigo-200 text-indigo-700',
        'bg-rose-100 border-rose-200 text-rose-700',
        'bg-cyan-100 border-cyan-200 text-cyan-700',
    ];

    // Daftar Mata Pelajaran (Palette) - Derived from Props or Default
    const subjectsPalette = mapelData.length > 0
        ? [
            ...mapelData.map((m, idx) => ({
                subject: m.nama,
                teacher: '-', // Default teacher
                color: colorPalette[idx % colorPalette.length]
            })),
            { subject: 'Upacara', teacher: '-', color: 'bg-red-100 border-red-200 text-red-700' },
            { subject: 'Istirahat', teacher: '-', color: 'bg-slate-100 border-slate-200 text-slate-600' }
        ]
        : [
            { subject: 'Matematika', teacher: 'Budi Santoso, S.Pd', color: 'bg-blue-100 border-blue-200 text-blue-700' },
            { subject: 'B. Indonesia', teacher: 'Siti Aminah, S.Pd', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
            { subject: 'IPA', teacher: 'Dewi Sartika, S.Pd', color: 'bg-violet-100 border-violet-200 text-violet-700' },
            { subject: 'IPS', teacher: 'Rudi Hartono, S.Pd', color: 'bg-orange-100 border-orange-200 text-orange-700' },
            { subject: 'PJOK', teacher: 'Joko Susilo, S.Pd', color: 'bg-lime-100 border-lime-200 text-lime-700' },
            { subject: 'Upacara', teacher: '-', color: 'bg-red-100 border-red-200 text-red-700' },
            { subject: 'Istirahat', teacher: '-', color: 'bg-slate-100 border-slate-200 text-slate-600' },
        ];

    const menuActions = [
        {
            id: 'jadwal-pelajaran',
            label: 'Jadwal Pelajaran',
            icon: <BookOpenCheck size={32} />,
            onClick: () => setActiveView('jadwal-pelajaran'),
            color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
        },
        {
            id: 'jadwal-ujian',
            label: 'Jadwal Ujian',
            icon: <ClipboardList size={32} />,
            onClick: () => setActiveView('jadwal-ujian'),
            color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
        }
    ];

    // Derived class options
    const classOptionsData = kelasData.length > 0 ? kelasData : [];

    // --- HANDLERS UTAMA ---

    // DRAG & DROP (GENERIC HELPERS)
    const handleDragStart = (item: typeof subjectsPalette[0]) => {
        setDraggedItem(item);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // Handler Lesson
    const handleDrop = (day: string, timeId: number) => {
        if (draggedItem) {
            const slotKey = `${day}-${timeId}`;
            setSchedule(prev => ({
                ...prev,
                [slotKey]: {
                    id: slotKey,
                    subject: draggedItem.subject,
                    teacher: draggedItem.teacher,
                    color: draggedItem.color
                }
            }));
            setDraggedItem(null);
        }
    };
    const handleRemoveSlot = (day: string, timeId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const slotKey = `${day}-${timeId}`;
        const newSchedule = { ...schedule };
        delete newSchedule[slotKey];
        setSchedule(newSchedule);
    };

    // Handler Exam
    const handleExamDrop = (day: string, timeId: number) => {
        if (draggedItem) {
            const slotKey = `${day}-${timeId}`;
            setExamSchedule(prev => ({
                ...prev,
                [slotKey]: {
                    id: slotKey,
                    subject: draggedItem.subject,
                    teacher: draggedItem.teacher,
                    color: draggedItem.color
                }
            }));
            setDraggedItem(null);
        }
    };
    const handleRemoveExamSlot = (day: string, timeId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const slotKey = `${day}-${timeId}`;
        const newSchedule = { ...examSchedule };
        delete newSchedule[slotKey];
        setExamSchedule(newSchedule);
    };
    const handleAddExamTimeSlot = () => {
        if (newTime.start && newTime.end) {
            const newId = examTimeSlots.length > 0 ? Math.max(...examTimeSlots.map(t => t.id)) + 1 : 0;
            setExamTimeSlots([...examTimeSlots, { id: newId, start: newTime.start, end: newTime.end, label: newTime.label || `Sesi ${newId + 1}` }]);
            setIsTimeModalOpen(false);
            setNewTime({ start: '', end: '', label: '' });
        }
    };
    const handleDeleteExamTimeSlot = (id: number) => {
        if (confirm('Hapus sesi ujian ini?')) {
            setExamTimeSlots(prev => prev.filter(t => t.id !== id));
        }
    }

    // WAKTU (JAM)
    const handleAddTimeSlot = () => {
        if (newTime.start && newTime.end) {
            const newId = timeSlots.length > 0 ? Math.max(...timeSlots.map(t => t.id)) + 1 : 0;
            setTimeSlots([...timeSlots, { id: newId, start: newTime.start, end: newTime.end, label: newTime.label || `Jam ke-${newId + 1}` }]);
            setIsTimeModalOpen(false);
            setNewTime({ start: '', end: '', label: '' });
        }
    };
    const handleDeleteTimeSlot = (id: number) => {
        if (confirm('Hapus jam pelajaran ini? Jadwal yang ada di jam ini akan hilang dari tampilan.')) {
            setTimeSlots(prev => prev.filter(t => t.id !== id));
        }
    }

    // SERAGAM
    const openUniformModal = (day: string) => {
        setSelectedDayForUniform(day);
        setTempUniform(dailyUniforms[day] || '');
        setIsUniformModalOpen(true);
    };
    const handleSaveUniform = () => {
        if (selectedDayForUniform) {
            setDailyUniforms(prev => ({ ...prev, [selectedDayForUniform]: tempUniform }));
            setIsUniformModalOpen(false);
        }
    };

    // CATATAN
    const openNoteModal = (day: string) => {
        setSelectedDayForNote(day);
        setTempNote(dailyNotes[day] || '');
        setIsNoteModalOpen(true);
    };
    const handleSaveNote = () => {
        if (selectedDayForNote) {
            setDailyNotes(prev => ({ ...prev, [selectedDayForNote]: tempNote }));
            setIsNoteModalOpen(false);
        }
    };

    // --- VIEW: JADWAL PELAJARAN ---
    if (activeView === 'jadwal-pelajaran') {
        return (
            <div className="animate-in slide-in-from-right duration-500 space-y-6 flex flex-col h-[calc(100vh-100px)] relative">
                {/* Header View */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveView('menu')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3 text-[#004AAD]">
                            <BookOpenCheck size={28} />
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Jadwal Pelajaran</h2>
                                <p className="text-xs text-slate-500">Drag & Drop mata pelajaran ke dalam tabel jadwal</p>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                ${isSidebarVisible ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                            `}
                            title={isSidebarVisible ? "Sembunyikan Panel Kontrol" : "Tampilkan Panel Kontrol"}
                        >
                            {isSidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                            <span>{isSidebarVisible ? 'Tutup Menu' : 'Buka Menu'}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-medium flex items-center gap-2">
                            <Info size={14} />
                            <span>Perubahan belum disimpan</span>
                        </div>
                        <button className="px-5 py-2.5 bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 flex items-center gap-2 font-bold text-sm">
                            <Save size={18} />
                            <span>Simpan Jadwal</span>
                        </button>
                    </div>
                </div>

                {/* Main Content: Split View */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">

                    {/* LEFT SIDEBAR: CONTROLS & PALETTE */}
                    <div className={`
                        flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ease-in-out
                        ${isSidebarVisible ? 'w-full lg:w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden absolute lg:relative'}
                    `}>

                        {/* Class Selector */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 min-w-[300px]">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Kelas</label>
                                <div className="relative">
                                    <select
                                        value={selectedKelas}
                                        onChange={(e) => setSelectedKelas(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#004AAD] appearance-none focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                    >
                                        {classOptionsData.length > 0 ? (
                                            classOptionsData.map((cls) => (
                                                <option key={cls.id} value={`${cls.tingkat} ${cls.paralel}`}>{cls.nama} ({cls.kode})</option>
                                            ))
                                        ) : (
                                            // Fallback if no data
                                            ['1 A', '1 B'].map(c => <option key={c} value={c}>Kelas {c}</option>)
                                        )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-xs text-blue-600 font-medium block mb-1">Wali Kelas</span>
                                <span className="text-sm font-bold text-slate-700">Siti Aminah, S.Pd</span>
                            </div>
                        </div>

                        {/* Draggable Subjects Palette */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <GripVertical size={16} className="text-slate-400" />
                                Daftar Mata Pelajaran
                            </h3>
                            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                {subjectsPalette.map((item, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(item)}
                                        className={`
                                            p-3 rounded-xl border cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none
                                            ${item.color} bg-opacity-50
                                        `}
                                    >
                                        <div className="font-bold text-sm">{item.subject}</div>
                                        <div className="text-xs opacity-80 truncate">{item.teacher}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 text-center">
                                    Klik dan tahan mata pelajaran di atas, lalu letakkan pada tabel di sebelah kanan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT AREA: SCHEDULE GRID */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                        <div className="overflow-auto custom-scrollbar flex-1 relative">
                            <table className="w-full text-left border-collapse relative">
                                <thead className="bg-[#f8fafc] sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        <th className="p-4 border-r border-b border-slate-200 min-w-[120px] w-[120px] bg-slate-50 bg-opacity-95 backdrop-blur-sm z-30 sticky left-0 text-center text-xs font-bold text-slate-500">Waktu</th>
                                        {days.map(day => (
                                            <th key={day} className="p-4 border-r border-b border-slate-200 min-w-[180px] bg-[#f8fafc] text-center group">
                                                <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">{day}</div>

                                                {/* Seragam Selector Button */}
                                                <button
                                                    onClick={() => openUniformModal(day)}
                                                    className={`
                                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all
                                                        ${dailyUniforms[day] ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-transparent hover:bg-slate-200'}
                                                    `}
                                                >
                                                    <Shirt size={12} />
                                                    <span className="truncate max-w-[120px]">{dailyUniforms[day] || 'Seragam?'}</span>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {timeSlots.map((slot) => (
                                        <tr key={slot.id}>
                                            <td className="p-2 border-r border-b border-slate-100 bg-slate-50 sticky left-0 z-10 text-center group/time relative">
                                                <div className="text-xs font-bold text-slate-700">{slot.start} - {slot.end}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{slot.label}</div>

                                                {/* Delete Time Slot Button (Hover) */}
                                                <button
                                                    onClick={() => handleDeleteTimeSlot(slot.id)}
                                                    className="absolute top-1 left-1 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                                                    title="Hapus Jam Ini"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </td>
                                            {days.map((day) => {
                                                const slotKey = `${day}-${slot.id}`;
                                                const scheduleItem = schedule[slotKey];

                                                return (
                                                    <td
                                                        key={slotKey}
                                                        onDragOver={handleDragOver}
                                                        onDrop={() => handleDrop(day, slot.id)}
                                                        className={`
                                                            p-1 border-r border-b border-slate-100 h-28 relative transition-colors
                                                            ${scheduleItem ? '' : 'hover:bg-blue-50'}
                                                        `}
                                                    >
                                                        {scheduleItem ? (
                                                            <div className={`
                                                                w-full h-full p-2.5 rounded-xl border flex flex-col justify-center relative group
                                                                ${scheduleItem.color}
                                                            `}>
                                                                <button
                                                                    onClick={(e) => handleRemoveSlot(day, slot.id, e)}
                                                                    className="absolute top-1 right-1 p-1 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white text-rose-500 transition-all z-10"
                                                                    title="Hapus"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                                <span className="font-bold text-sm leading-tight text-center">{scheduleItem.subject}</span>
                                                                {scheduleItem.teacher !== '-' && (
                                                                    <span className="text-[10px] text-center mt-1.5 opacity-80 leading-tight line-clamp-2">{scheduleItem.teacher}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                                                                <div className="text-[10px] text-slate-400 font-medium">Drop disini</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Add Time Slot Row */}
                                    <tr>
                                        <td className="p-2 border-r border-slate-100 bg-slate-50 sticky left-0 z-10 text-center">
                                            <button
                                                onClick={() => setIsTimeModalOpen(true)}
                                                className="w-full py-2 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#004AAD] hover:bg-blue-50 rounded-lg transition-all border border-dashed border-slate-300 hover:border-blue-300"
                                            >
                                                <Plus size={16} />
                                                <span className="text-[10px] font-bold">Tambah Jam</span>
                                            </button>
                                        </td>
                                        <td colSpan={6} className="bg-slate-50/30"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* MODAL: Add Time Slot */}
                {isTimeModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} className="text-[#004AAD]" />
                                    <h3 className="text-lg font-bold text-slate-800">Tambah Waktu</h3>
                                </div>
                                <button onClick={() => setIsTimeModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Jam Mulai</label>
                                        <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newTime.start} onChange={e => setNewTime({ ...newTime, start: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Jam Selesai</label>
                                        <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newTime.end} onChange={e => setNewTime({ ...newTime, end: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Label (Opsional)</label>
                                    <input type="text" placeholder="Contoh: Jam ke-1 / Istirahat" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newTime.label} onChange={e => setNewTime({ ...newTime, label: e.target.value })} />
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setIsTimeModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                                <button onClick={handleAddTimeSlot} className="px-4 py-2 bg-[#004AAD] text-white rounded-lg font-bold hover:bg-[#003380] transition-all text-sm">Tambah</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: Set Uniform */}
                {isUniformModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Shirt size={20} className="text-indigo-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Seragam Hari {selectedDayForUniform}</h3>
                                </div>
                                <button onClick={() => setIsUniformModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <div className="p-6">
                                <label className="text-sm font-bold text-slate-600 block mb-2">Seragam yang dipakai:</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Contoh: Putih Merah & Topi"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={tempUniform}
                                    onChange={e => setTempUniform(e.target.value)}
                                />
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {['Putih Merah', 'Batik', 'Pramuka', 'Olahraga', 'Muslim'].map(opt => (
                                        <button key={opt} onClick={() => setTempUniform(opt)} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setIsUniformModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                                <button onClick={handleSaveUniform} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Simpan</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }


    // --- VIEW: JADWAL UJIAN ---
    if (activeView === 'jadwal-ujian') {
        return (
            <div className="animate-in slide-in-from-right duration-500 space-y-6 flex flex-col h-[calc(100vh-100px)] relative">
                {/* Header View */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveView('menu')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3 text-[#004AAD]">
                            <ClipboardList size={28} />
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Jadwal Ujian</h2>
                                <p className="text-xs text-slate-500">Manajemen jadwal ujian dan pengawas</p>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                ${isSidebarVisible ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                            `}
                            title={isSidebarVisible ? "Sembunyikan Panel Kontrol" : "Tampilkan Panel Kontrol"}
                        >
                            {isSidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                            <span>{isSidebarVisible ? 'Tutup Menu' : 'Buka Menu'}</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-medium flex items-center gap-2">
                            <Info size={14} />
                            <span>Perubahan belum disimpan</span>
                        </div>
                        <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2 font-bold text-sm">
                            <Megaphone size={18} />
                            <span>Publikasi</span>
                        </button>
                        <button className="px-5 py-2.5 bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 flex items-center gap-2 font-bold text-sm">
                            <Save size={18} />
                            <span>Simpan Jadwal</span>
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600 whitespace-nowrap">TINGKAT:</label>
                        <select
                            value={selectedTingkat}
                            onChange={(e) => setSelectedTingkat(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                        >
                            {['1', '2', '3', '4', '5', '6'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600 whitespace-nowrap">SEMESTER:</label>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Tambah Semester">
                                <Plus size={14} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Hapus Semester">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-600 whitespace-nowrap">TAHUN AJARAN:</label>
                        <input
                            type="text"
                            value={selectedTahunAjaran}
                            onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD] w-32"
                            placeholder="2025/2026"
                        />
                    </div>
                </div>

                {/* Main Content: Split View */}
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative">

                    {/* LEFT SIDEBAR: CONTROLS & PALETTE */}
                    <div className={`
                        flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ease-in-out
                        ${isSidebarVisible ? 'w-full lg:w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden absolute lg:relative'}
                    `}>

                        {/* Class Selector */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 min-w-[300px]">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Kelas</label>
                                <div className="relative">
                                    <select
                                        value={selectedKelas}
                                        onChange={(e) => setSelectedKelas(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#004AAD] appearance-none focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                    >
                                        {classOptionsData.length > 0 ? (
                                            classOptionsData.map((cls) => (
                                                <option key={cls.id} value={`${cls.tingkat} ${cls.paralel}`}>{cls.nama} ({cls.kode})</option>
                                            ))
                                        ) : (
                                            // Fallback if no data
                                            ['1 A', '1 B'].map(c => <option key={c} value={c}>Kelas {c}</option>)
                                        )}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <span className="text-xs text-blue-600 font-medium block mb-1">Wali Kelas</span>
                                <span className="text-sm font-bold text-slate-700">Siti Aminah, S.Pd</span>
                            </div>
                        </div>

                        {/* Draggable Subjects Palette */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <GripVertical size={16} className="text-slate-400" />
                                Daftar Mata Pelajaran
                            </h3>
                            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                {subjectsPalette.map((item, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={() => handleDragStart(item)}
                                        className={`
                                            p-3 rounded-xl border cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none
                                            ${item.color} bg-opacity-50
                                        `}
                                    >
                                        <div className="font-bold text-sm">{item.subject}</div>
                                        <div className="text-xs opacity-80 truncate">{item.teacher}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 text-center">
                                    Klik dan tahan mata pelajaran di atas, lalu letakkan pada tabel di sebelah kanan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT AREA: SCHEDULE GRID */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                        <div className="overflow-auto custom-scrollbar flex-1 relative">
                            <table className="w-full text-left border-collapse relative">
                                <thead className="bg-[#f8fafc] sticky top-0 z-20 shadow-sm">
                                    <tr>
                                        <th className="p-4 border-r border-b border-slate-200 min-w-[120px] w-[120px] bg-slate-50 bg-opacity-95 backdrop-blur-sm z-30 sticky left-0 text-center text-xs font-bold text-slate-500">Waktu Ujian</th>
                                        {days.map(day => (
                                            <th key={day} className="p-4 border-r border-b border-slate-200 min-w-[180px] bg-[#f8fafc] text-center group">
                                                <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">{day}</div>

                                                {/* Seragam Selector Button */}
                                                <button
                                                    onClick={() => openUniformModal(day)}
                                                    className={`
                                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all
                                                        ${dailyUniforms[day] ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-transparent hover:bg-slate-200'}
                                                    `}
                                                >
                                                    <Shirt size={12} />
                                                    <span className="truncate max-w-[120px]">{dailyUniforms[day] || 'Seragam?'}</span>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {examTimeSlots.map((slot) => (
                                        <tr key={slot.id}>
                                            <td className="p-2 border-r border-b border-slate-100 bg-slate-50 sticky left-0 z-10 text-center group/time relative">
                                                <div className="text-xs font-bold text-slate-700">{slot.start} - {slot.end}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{slot.label}</div>

                                                {/* Delete Time Slot Button (Hover) */}
                                                <button
                                                    onClick={() => handleDeleteExamTimeSlot(slot.id)}
                                                    className="absolute top-1 left-1 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                                                    title="Hapus Sesi Ini"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </td>
                                            {days.map((day) => {
                                                const slotKey = `${day}-${slot.id}`;
                                                const scheduleItem = examSchedule[slotKey];

                                                return (
                                                    <td
                                                        key={slotKey}
                                                        onDragOver={handleDragOver}
                                                        onDrop={() => handleExamDrop(day, slot.id)}
                                                        className={`
                                                            p-1 border-r border-b border-slate-100 h-28 relative transition-colors
                                                            ${scheduleItem ? '' : 'hover:bg-blue-50'}
                                                        `}
                                                    >
                                                        {scheduleItem ? (
                                                            <div className={`
                                                                w-full h-full p-2.5 rounded-xl border flex flex-col justify-center relative group
                                                                ${scheduleItem.color}
                                                            `}>
                                                                <button
                                                                    onClick={(e) => handleRemoveExamSlot(day, slot.id, e)}
                                                                    className="absolute top-1 right-1 p-1 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white text-rose-500 transition-all z-10"
                                                                    title="Hapus"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                                <span className="font-bold text-sm leading-tight text-center">{scheduleItem.subject}</span>
                                                                {scheduleItem.teacher !== '-' && (
                                                                    <span className="text-[10px] text-center mt-1.5 opacity-80 leading-tight line-clamp-2">{scheduleItem.teacher}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                                                                <div className="text-[10px] text-slate-400 font-medium">Drop disini</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Add Time Slot Row */}
                                    <tr>
                                        <td className="p-2 border-r border-slate-100 bg-slate-50 sticky left-0 z-10 text-center">
                                            <button
                                                onClick={() => {
                                                    setNewTime({ start: '', end: '', label: 'Sesi Ujian' });
                                                    setIsTimeModalOpen(true);
                                                }}
                                                className="w-full py-2 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#004AAD] hover:bg-blue-50 rounded-lg transition-all border border-dashed border-slate-300 hover:border-blue-300"
                                            >
                                                <Plus size={16} />
                                                <span className="text-[10px] font-bold">Tambah Sesi</span>
                                            </button>
                                        </td>
                                        <td colSpan={6} className="bg-slate-50/30"></td>
                                    </tr>

                                    {/* CATATAN Row */}
                                    <tr>
                                        <td className="p-2 border-r border-slate-100 bg-slate-50 sticky left-0 z-10 text-center">
                                            <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                                                <FileText size={14} />
                                                <span>CATATAN</span>
                                            </div>
                                        </td>
                                        {days.map((day) => (
                                            <td key={day} className="p-2 border-r border-slate-100">
                                                <button
                                                    onClick={() => openNoteModal(day)}
                                                    className="w-full p-2 text-left text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all min-h-[60px]"
                                                >
                                                    {dailyNotes[day] ? (
                                                        <span className="line-clamp-3">{dailyNotes[day]}</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Catatan Harian...</span>
                                                    )}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* MODAL: Add Time Slot (Exam Context) */}
                {isTimeModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} className="text-[#004AAD]" />
                                    <h3 className="text-lg font-bold text-slate-800">Tambah Sesi Ujian</h3>
                                </div>
                                <button onClick={() => setIsTimeModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Jam Mulai</label>
                                        <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newTime.start} onChange={e => setNewTime({ ...newTime, start: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">Jam Selesai</label>
                                        <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newTime.end} onChange={e => setNewTime({ ...newTime, end: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Label (Opsional)</label>
                                    <input type="text" placeholder="Contoh: Sesi 1 / Istirahat" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={newTime.label} onChange={e => setNewTime({ ...newTime, label: e.target.value })} />
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setIsTimeModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                                <button onClick={handleAddExamTimeSlot} className="px-4 py-2 bg-[#004AAD] text-white rounded-lg font-bold hover:bg-[#003380] transition-all text-sm">Tambah</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: Set Uniform (Shared) */}
                {isUniformModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Shirt size={20} className="text-indigo-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Seragam Hari {selectedDayForUniform}</h3>
                                </div>
                                <button onClick={() => setIsUniformModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <div className="p-6">
                                <label className="text-sm font-bold text-slate-600 block mb-2">Seragam yang dipakai:</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Contoh: Putih Merah & Topi"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={tempUniform}
                                    onChange={e => setTempUniform(e.target.value)}
                                />
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {['Putih Merah', 'Batik', 'Pramuka', 'Olahraga', 'Muslim'].map(opt => (
                                        <button key={opt} onClick={() => setTempUniform(opt)} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setIsUniformModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                                <button onClick={handleSaveUniform} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Simpan</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: Set Note */}
                {isNoteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText size={20} className="text-indigo-600" />
                                    <h3 className="text-lg font-bold text-slate-800">Catatan Hari {selectedDayForNote}</h3>
                                </div>
                                <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                            </div>
                            <div className="p-6">
                                <label className="text-sm font-bold text-slate-600 block mb-2">Catatan Harian:</label>
                                <textarea
                                    autoFocus
                                    placeholder="Masukkan catatan untuk hari ini..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] resize-none"
                                    value={tempNote}
                                    onChange={e => setTempNote(e.target.value)}
                                />
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                                <button onClick={handleSaveNote} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Simpan</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- VIEW: MENU UTAMA ---
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex items-center gap-3 text-[#004AAD] border-b border-slate-200 pb-4">
                <CalendarClock size={24} className="stroke-[2.5]" />
                <h2 className="text-xl font-bold tracking-tight">Jadwal</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuActions.map((item) => (
                    <button key={item.id} onClick={item.onClick} className={`relative group flex items-center gap-4 p-5 rounded-2xl text-white ${item.color} shadow-lg shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 overflow-hidden`}>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">{React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 80 })}</div>
                        <div className="shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">{item.icon}</div>
                        <div className="text-left"><span className="text-sm font-bold leading-tight tracking-wide block">{item.label}</span></div>
                    </button>
                ))}
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 text-slate-500 max-w-2xl mt-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#004AAD]"><Info size={24} /></div>
                <div><p className="text-sm font-bold text-slate-800">Manajemen Jadwal Sekolah</p><p className="text-xs">Kelola jadwal pelajaran reguler dan jadwal ujian / evaluasi siswa di sini.</p></div>
            </div>
        </div>
    );
};

export default Jadwal;
