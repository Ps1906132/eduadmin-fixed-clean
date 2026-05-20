import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, Save, Zap, RotateCcw, FolderPlus, Plus, 
    GripVertical, Shirt, X, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MasterExamSchedule, ExamScheduleItem } from '../../../../data/sharedData';
import { Period } from '../../types';
import AddExamModal from '../modals/AddExamModal';
import ExamUniformModal from '../modals/ExamUniformModal';
import AddExamTimeModal from '../modals/AddExamTimeModal';
import ExamNoteModal from '../modals/ExamNoteModal';

interface JadwalUjianViewProps {
    examSchedules: MasterExamSchedule[];
    setExamSchedules: React.Dispatch<React.SetStateAction<MasterExamSchedule[]>>;
    activeExamId: number | null;
    setActiveExamId: (id: number | null) => void;
    subjects: any[];
    derivedClasses: any[];
    setConfirmModal: (modal: any) => void;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const JadwalUjianView: React.FC<JadwalUjianViewProps> = ({
    examSchedules,
    setExamSchedules,
    activeExamId,
    setActiveExamId,
    subjects,
    derivedClasses,
    setConfirmModal
}) => {
    const [selectedExamTingkat, setSelectedExamTingkat] = useState<string>('1');
    const [selectedExamClass, setSelectedExamClass] = useState<string>('');

    // Set default class based on selected tingkat
    useEffect(() => {
        const filtered = derivedClasses.filter(c => c.tingkat?.toString() === selectedExamTingkat);
        if (filtered.length > 0) {
            setSelectedExamClass(filtered[0].nama);
        } else {
            setSelectedExamClass('');
        }
    }, [selectedExamTingkat, derivedClasses]);

    const [showExamModal, setShowExamModal] = useState(false);
    const [newExamData, setNewExamData] = useState<MasterExamSchedule>({
        id: 0,
        type: 'UTS',
        semester: 'Ganjil',
        year: '2025/2026',
        status: 'draft',
        items: [],
        timeSlots: []
    });

    const [examScheduleItems, setExamScheduleItems] = useState<Record<string, { subject: string; teacher: string; color: string }>>({});
    const [examTimeSlots, setExamTimeSlots] = useState<Period[]>([
        { id: 0, start: '07:30', end: '09:00' },
        { id: 1, start: '09:00', end: '09:30' },
        { id: 2, start: '09:30', end: '11:00' },
    ]);
    const [examDailyUniforms, setExamDailyUniforms] = useState<Record<string, string>>({
        'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': ''
    });
    const [examDailyNotes, setExamDailyNotes] = useState<Record<string, string>>({
        'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': ''
    });
    const [examDraggedItem, setExamDraggedItem] = useState<{ subject: string; teacher: string; color: string } | null>(null);
    const [showExamTimeModal, setShowExamTimeModal] = useState(false);
    const [showExamUniformModal, setShowExamUniformModal] = useState(false);
    const [showExamNoteModal, setShowExamNoteModal] = useState(false);
    const [selectedDayForExamUniform, setSelectedDayForExamUniform] = useState<string | null>(null);
    const [selectedDayForExamNote, setSelectedDayForExamNote] = useState<string | null>(null);
    const [tempExamUniform, setTempExamUniform] = useState('');
    const [tempExamNote, setTempExamNote] = useState('');
    const [newExamTime, setNewExamTime] = useState({ start: '', end: '' });

    // 1. Sync Load: Master -> Local State
    useEffect(() => {
        const activeExam = examSchedules.find(e => e.id === activeExamId);
        if (activeExam) {
            // Load Time Slots
            const masterTimeSlots = activeExam.timeSlots || [];
            if (JSON.stringify(masterTimeSlots) !== JSON.stringify(examTimeSlots)) {
                setExamTimeSlots(masterTimeSlots);
            }

            // Load Items for Class
            const classItems = activeExam.items.filter(item => item.classId === selectedExamClass);
            const newMap: Record<string, any> = {};
            classItems.forEach(item => {
                newMap[`${item.day}-${item.timeSlotId}`] = {
                    subject: item.subjectName,
                    teacher: item.teacherName || '-',
                    color: item.color || 'bg-blue-100 border-blue-200 text-blue-700'
                };
            });

            if (JSON.stringify(newMap) !== JSON.stringify(examScheduleItems)) {
                setExamScheduleItems(newMap);
            }

            // Load Notes
            const masterNotes = activeExam.dailyNotes || { 'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': '' };
            if (JSON.stringify(masterNotes) !== JSON.stringify(examDailyNotes)) {
                setExamDailyNotes(masterNotes);
            }

            // Load Uniforms
            const masterUniforms = activeExam.dailyUniforms || { 'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': '' };
            if (JSON.stringify(masterUniforms) !== JSON.stringify(examDailyUniforms)) {
                setExamDailyUniforms(masterUniforms);
            }
        } else if (activeExamId === null) {
            // Reset local states if no exam is selected
            if (Object.keys(examScheduleItems).length > 0) setExamScheduleItems({});
            if (examTimeSlots.length > 0) setExamTimeSlots([]);
        }
    }, [activeExamId, selectedExamClass, examSchedules]);

    // 2. Sync Save: Local State -> Master
    useEffect(() => {
        if (!activeExamId) return;

        setExamSchedules(prevSchedules => {
            const currentExam = prevSchedules.find(e => e.id === activeExamId);
            if (!currentExam) return prevSchedules;

            const currentExamId = activeExamId;
            const newClassItems: ExamScheduleItem[] = Object.entries(examScheduleItems).map(([key, data]: [string, any]) => {
                const [day, slotIdStr] = key.split('-');
                return {
                    id: `e-${currentExamId}-${selectedExamClass}-${key}`,
                    examId: currentExamId,
                    classId: selectedExamClass,
                    day,
                    timeSlotId: parseInt(slotIdStr),
                    subjectName: data.subject,
                    teacherName: data.teacher,
                    color: data.color
                };
            });

            const otherClassItems = currentExam.items.filter(it => it.classId !== selectedExamClass);
            const allItems = [...otherClassItems, ...newClassItems];

            const isItemsChanged = JSON.stringify(allItems) !== JSON.stringify(currentExam.items);
            const isSlotsChanged = JSON.stringify(examTimeSlots) !== JSON.stringify(currentExam.timeSlots);
            const isNotesChanged = JSON.stringify(examDailyNotes) !== JSON.stringify(currentExam.dailyNotes);
            const isUniformsChanged = JSON.stringify(examDailyUniforms) !== JSON.stringify(currentExam.dailyUniforms);

            if (!isItemsChanged && !isSlotsChanged && !isNotesChanged && !isUniformsChanged) {
                return prevSchedules;
            }

            return prevSchedules.map(exam => {
                if (exam.id === activeExamId) {
                    return {
                        ...exam,
                        items: allItems,
                        timeSlots: examTimeSlots,
                        dailyNotes: examDailyNotes,
                        dailyUniforms: examDailyUniforms
                    };
                }
                return exam;
            });
        });
    }, [examScheduleItems, examTimeSlots, examDailyNotes, examDailyUniforms, activeExamId, selectedExamClass]);

    return (
        <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
            {/* Header & Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                <div className="flex items-center gap-3">
                    <ClipboardList size={28} className="text-blue-600" />
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1B4B]">Jadwal Ujian</h2>
                        <p className="text-slate-500 text-sm">Kelola jadwal pelaksanaan ujian sekolah.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        if (!activeExamId) return;
                        toast.success("Konfigurasi Jadwal Ujian berhasil disimpan!");
                    }} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        <Save size={16} /> Simpan
                    </button>
                    <button onClick={() => {
                        if (!activeExamId) return;
                        setExamSchedules(prev => prev.map(ex => ex.id === activeExamId ? { ...ex, status: 'published' } : ex));
                        toast.success("Jadwal Ujian berhasil dipublikasikan! Siswa dan Orang Tua kini dapat melihat jadwal ini.", { icon: '🚀' });
                    }} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                        <Zap size={16} /> Publikasi
                    </button>
                    <button onClick={() => {
                        setConfirmModal({
                            show: true,
                            message: 'Apakah anda yakin ingin mereset/menghapus semua jadwal ujian?',
                            onConfirm: () => {
                                setExamSchedules([]);
                                toast.success("Jadwal ujian berhasil direset.");
                                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
                            }
                        });
                    }} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100">
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={() => setShowExamModal(true)} className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shadow-lg">
                        <FolderPlus size={16} /> Tambah Jenis
                    </button>
                </div>
            </div>

            {/* Active Exam Selector & Info */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 mb-2 flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pilih Jadwal Ujian</label>
                    <select
                        value={activeExamId || ''}
                        onChange={(e) => setActiveExamId(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm outline-none focus:border-blue-500"
                    >
                        {examSchedules.length === 0 ? <option value="">Belum ada jadwal ujian</option> : null}
                        {examSchedules.map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.type} - {exam.semester} {exam.year}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Semester</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm">
                        {activeExamId ? examSchedules.find(e => e.id === activeExamId)?.semester : '-'}
                    </div>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tahun Ajaran</label>
                    <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm">
                        {activeExamId ? examSchedules.find(e => e.id === activeExamId)?.year : '-'}
                    </div>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
                    <div className="flex items-center gap-2 h-9">
                        {activeExamId ? (
                            examSchedules.find(e => e.id === activeExamId)?.status === 'published' ? (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                                    <CheckCircleIcon /> TERBIT
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                                    <EditIcon /> DRAFT
                                </span>
                            )
                        ) : '-'}
                    </div>
                </div>
            </div>

            {/* Schedule Grid - Tabel Jadwal Ujian */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                {/* Filter Section */}
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-600 whitespace-nowrap">TINGKAT:</label>
                        <select
                            value={selectedExamTingkat}
                            onChange={(e) => setSelectedExamTingkat(e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-[#004AAD] focus:outline-none"
                        >
                            {['1', '2', '3', '4', '5', '6'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-600 whitespace-nowrap">KELAS:</label>
                        <select
                            value={selectedExamClass}
                            onChange={(e) => setSelectedExamClass(e.target.value)}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-[#004AAD] focus:outline-none"
                        >
                            {derivedClasses.filter(c => c.tingkat?.toString() === selectedExamTingkat).map(c => (
                                <option key={c.id} value={c.nama}>{c.nama}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Table Area */}
                {activeExamId ? (
                    <div className="flex-1 flex gap-3 overflow-hidden">
                        {/* Left Sidebar - Mata Pelajaran */}
                        <div className="w-64 bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col shrink-0">
                            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <GripVertical size={14} className="text-slate-400" />
                                Daftar Mata Pelajaran
                            </h3>
                            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                                {subjects.map((subj) => {
                                    const colorClasses = [
                                        'bg-blue-100 border-blue-200 text-blue-700',
                                        'bg-emerald-100 border-emerald-200 text-emerald-700',
                                        'bg-violet-100 border-violet-200 text-violet-700',
                                        'bg-orange-100 border-orange-200 text-orange-700',
                                        'bg-lime-100 border-lime-200 text-lime-700',
                                    ];
                                    const color = colorClasses[Number(subj.id) % colorClasses.length];
                                    return (
                                        <div
                                            key={subj.id}
                                            draggable
                                            onDragStart={() => setExamDraggedItem({ subject: subj.name, teacher: '-', color })}
                                            className={`p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${color} bg-opacity-50`}
                                        >
                                            <div className="font-bold text-xs">{subj.name}</div>
                                            <div className="text-[10px] opacity-80 truncate">-</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Area - Schedule Grid */}
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                            <div className="overflow-auto flex-1 relative">
                                <table className="w-full text-left border-collapse relative">
                                    <thead className="bg-[#f8fafc] sticky top-0 z-20 shadow-sm">
                                        <tr>
                                            <th className="p-2 border-r border-b border-slate-200 min-w-[100px] w-[100px] bg-slate-50 bg-opacity-95 backdrop-blur-sm z-30 sticky left-0 text-center">
                                                <span className="text-xs font-bold text-slate-500 block mb-1">Waktu Ujian</span>
                                                <button
                                                    onClick={() => {
                                                        setNewExamTime({ start: '', end: '' });
                                                        setShowExamTimeModal(true);
                                                    }}
                                                    className="mx-auto w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm border border-green-200"
                                                    title="Tambah Waktu Ujian Manual"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </th>
                                            {DAYS.map(day => (
                                                <th key={day} className="px-4 py-8 h-28 border-r border-b border-slate-200 min-w-[180px] bg-[#f8fafc] text-center">
                                                    <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">{day}</div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDayForExamUniform(day);
                                                            setTempExamUniform(examDailyUniforms[day] || '');
                                                            setShowExamUniformModal(true);
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${examDailyUniforms[day] ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-transparent hover:bg-slate-200'}`}
                                                    >
                                                        <Shirt size={12} />
                                                        <span className="truncate max-w-[120px]">{examDailyUniforms[day] || 'Seragam?'}</span>
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
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Hapus sesi ujian ini?')) {
                                                                setExamTimeSlots(prev => prev.filter(t => t.id !== slot.id));
                                                            }
                                                        }}
                                                        className="absolute top-1 left-1 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover/time:opacity-100"
                                                        title="Hapus Sesi Ini"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </td>
                                                {DAYS.map((day) => {
                                                    const slotKey = `${day}-${slot.id}`;
                                                    const scheduleItem = examScheduleItems[slotKey];
                                                    return (
                                                        <td
                                                            key={slotKey}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={() => {
                                                                if (examDraggedItem) {
                                                                    setExamScheduleItems(prev => ({
                                                                        ...prev,
                                                                        [slotKey]: examDraggedItem
                                                                    }));
                                                                    setExamDraggedItem(null);
                                                                }
                                                            }}
                                                            className={`p-1 border-r border-b border-slate-100 h-36 relative transition-colors ${scheduleItem ? '' : 'hover:bg-blue-50'}`}
                                                        >
                                                            {scheduleItem ? (
                                                                <div className={`w-full h-full p-2.5 rounded-xl border flex flex-col justify-center relative group ${scheduleItem.color}`}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newItems = { ...examScheduleItems };
                                                                            delete newItems[slotKey];
                                                                            setExamScheduleItems(newItems);
                                                                        }}
                                                                        className="absolute top-1 right-1 p-1 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white text-rose-500 transition-all z-10 opacity-0 group-hover:opacity-100"
                                                                        title="Hapus"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                    <span className="font-bold text-sm leading-tight text-center">{scheduleItem.subject}</span>
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
                                                        setNewExamTime({ start: '', end: '' });
                                                        setShowExamTimeModal(true);
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
                                            {DAYS.map((day) => (
                                                <td key={day} className="p-2 border-r border-slate-100">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDayForExamNote(day);
                                                            setTempExamNote(examDailyNotes[day] || '');
                                                            setShowExamNoteModal(true);
                                                        }}
                                                        className="w-full p-2 text-left text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all min-h-[60px]"
                                                    >
                                                        {examDailyNotes[day] ? (
                                                            <span className="line-clamp-3">{examDailyNotes[day]}</span>
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
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <FolderPlus size={64} className="mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-500">Belum ada Jadwal Ujian</h3>
                        <p className="text-sm text-center max-w-sm mt-2">Silakan buat jadwal ujian baru dengan menekan tombol "Tambah Jenis Ujian" di atas.</p>
                    </div>
                )}
            </div>

            {/* Modals inside Ujian View */}
            <AddExamModal
                isOpen={showExamModal}
                onClose={() => setShowExamModal(false)}
                newExamData={newExamData}
                setNewExamData={setNewExamData}
                examSchedules={examSchedules}
                setExamSchedules={setExamSchedules}
                setActiveExamId={setActiveExamId}
            />

            <ExamUniformModal
                isOpen={showExamUniformModal}
                onClose={() => setShowExamUniformModal(false)}
                selectedDay={selectedDayForExamUniform}
                tempUniform={tempExamUniform}
                setTempUniform={setTempExamUniform}
                examDailyUniforms={examDailyUniforms}
                setExamDailyUniforms={setExamDailyUniforms}
            />

            <AddExamTimeModal
                isOpen={showExamTimeModal}
                onClose={() => setShowExamTimeModal(false)}
                newExamTime={newExamTime}
                setNewExamTime={setNewExamTime}
                examTimeSlots={examTimeSlots}
                setExamTimeSlots={setExamTimeSlots}
            />

            <ExamNoteModal
                isOpen={showExamNoteModal}
                onClose={() => setShowExamNoteModal(false)}
                selectedDay={selectedDayForExamNote}
                tempNote={tempExamNote}
                setTempNote={setTempNote}
                examDailyNotes={examDailyNotes}
                setExamDailyNotes={setExamDailyNotes}
            />
        </div>
    );
};

// Simple inline helper icons to keep dependencies self-contained
const CheckCircleIcon = () => (
    <svg className="w-3 h-3 text-emerald-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-3 h-3 text-amber-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

export default JadwalUjianView;
