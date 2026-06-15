import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    ChevronDown,
    Search,
    Clock,
    Save,
    Check,
    CheckCircle,
    UserCheck,
    Info,
    Filter
} from 'lucide-react';

import { useAttendance } from './DashboardSuperAdmin/hooks/useAttendance';

interface Student {
    no: number;
    nis: string;
    nama: string;
    gender: string;
    id?: string | number; // Added id
}

interface KelasItem {
    id: number;
    kode: string;
    nama: string;
}

type AttendanceStatus = 'H' | 'S' | 'I' | 'A';
type AssessmentValue = 'A' | 'B' | 'C' | 'D' | '';

interface AbsenProps {
    kelasData: KelasItem[];
    studentsData: Record<string, Student[]>;
    attendanceData: Record<string, Record<string, AttendanceStatus>>;
    setAttendanceData: React.Dispatch<React.SetStateAction<Record<string, Record<string, AttendanceStatus>>>>;

}

const Absen: React.FC<AbsenProps> = ({
    kelasData,
    studentsData,
    attendanceData,
    setAttendanceData,

}) => {
    const { saveAttendanceBatch, saving } = useAttendance();
    const [selectedClassRaw, setSelectedClassRaw] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

    // Helper for composite key
    const getStorageKey = () => `${selectedClassRaw}_${currentDate}`;
    const storageKey = getStorageKey();

    // Derived state from props
    const attendance = attendanceData[storageKey] || {};


    // Helper Setters
    const setAttendance = (newVal: any) => {
        setAttendanceData(prev => ({
            ...prev,
            [storageKey]: typeof newVal === 'function' ? newVal(prev[storageKey] || {}) : newVal
        }));
    };


    // Batch Control State
    const [batchSettings, setBatchSettings] = useState<{
        attendance: AttendanceStatus;
    }>({
        attendance: 'H'
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Initialize selected class if data exists
    useEffect(() => {
        if (kelasData.length > 0 && !selectedClassRaw) {
            setSelectedClassRaw(kelasData[0].nama);
        }
    }, [kelasData, selectedClassRaw]);

    const currentStudents = studentsData[selectedClassRaw] || [];

    // Filter students
    const filteredStudents = currentStudents.filter(s =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm)
    );

    // Initialize attendance and assessments for current students if not set
    useEffect(() => {
        const initialAttendance: Record<string, AttendanceStatus> = {};


        currentStudents.forEach(s => {
            if (!attendance[s.nis]) initialAttendance[s.nis] = 'H';
            // Default assessments are empty, user must set them
        });

        // Only update if we have new students or missing data
        if (Object.keys(attendance).length < currentStudents.length) {
            setAttendance((prev: Record<string, AttendanceStatus>) => ({ ...initialAttendance, ...prev }));
        }
    }, [selectedClassRaw, currentStudents.length]);

    const handleStatusChange = (nis: string, status: AttendanceStatus) => {
        setAttendance((prev: Record<string, AttendanceStatus>) => ({ ...prev, [nis]: status }));

        // If not present (H), clear assessments automatically
        if (status !== 'H') {
            // Logic removed
        }

        setIsSaved(false);
    };



    const handleBatchApply = (nis: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(nis)) {
            newSelected.delete(nis);
        } else {
            newSelected.add(nis);
        }
        setSelectedIds(newSelected);
    };

    const handleBatchApplyAll = () => {
        if (filteredStudents.every(s => selectedIds.has(s.nis))) {
            setSelectedIds(new Set());
        } else {
            const newSelected = new Set(filteredStudents.map(s => s.nis));
            setSelectedIds(newSelected);
        }
    };

    const handleSave = async () => {
        // Map records for API sync
        const recordsToSync = currentStudents.map(student => ({
            studentId: (student.id || student.nis).toString(),
            classId: selectedClassRaw,
            date: currentDate,
            status: attendance[student.nis] || 'H',
            note: ''
        }));

        if (recordsToSync.length === 0) return;

        const result = await saveAttendanceBatch(recordsToSync);
        
        if (result.success) {
            console.log('Absensi berhasil disinkronkan ke server');
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } else {
            alert(`Gagal sinkronisasi: ${result.error}`);
        }
    };

    // Calculate counts for summary
    const counts = {
        H: 0, S: 0, I: 0, A: 0
    };
    Object.values(attendance).forEach(status => {
        const statusKey = status as AttendanceStatus;
        if (statusKey) counts[statusKey]++;
    });


    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header: Title & Class/Date Selectors */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3 text-[#004AAD]">
                    <UserCheck size={32} />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Absensi & Penilaian</h2>
                        <p className="text-sm text-slate-500">Rekap kehadiran dan penilaian adab/akhlak siswa.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedClassRaw}
                            onChange={(e) => setSelectedClassRaw(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD] appearance-none cursor-pointer hover:bg-slate-50"
                        >
                            {kelasData.map((k) => (
                                <option key={k.id} value={k.nama}>{k.nama}</option>
                            ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Users size={18} />
                        </div>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>

                    <div className="relative min-w-[200px]">
                        <input
                            type="date"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Calendar size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">

                {/* Right Side: Main Content */}
                <div className="w-full">

                    {/* Control Panel Area */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 mb-6 shadow-sm">

                        {/* Batch Settings Row */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {/* Kehadiran Batch */}
                            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm pr-2">
                                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kehadiran</span>
                                <div className="flex gap-1">
                                    {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map(s => (
                                        batchSettings.attendance === s && (
                                            <button
                                                key={s}
                                                className="w-8 h-8 rounded-lg bg-[#0f172a] text-white font-bold text-sm shadow-md"
                                            >
                                                {s}
                                            </button>
                                        )
                                    ))}
                                    <div className="flex ml-2 gap-1">
                                        {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).filter(s => s !== batchSettings.attendance).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setBatchSettings(prev => ({ ...prev, attendance: s }))}
                                                className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 text-xs font-bold transition-all"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Action Row */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <button
                                onClick={handleSave}
                                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95
                                    ${isSaved
                                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20 ring-2 ring-rose-600 ring-offset-2'
                                        : 'bg-[#004AAD] text-white hover:bg-[#003380] shadow-blue-500/20'}`}
                            >
                                <Save size={18} />
                                <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                            </button>

                            <button
                                onClick={handleBatchApplyAll}
                                className={`px-6 py-3 border rounded-xl font-bold active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2
                                    ${filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.nis))
                                        ? 'bg-[#004AAD] text-white border-[#004AAD]'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                <CheckCircle size={18} className={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.nis)) ? 'text-white' : 'text-slate-400'} />
                                <span>Pilih Semua</span>
                            </button>

                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Cari nama siswa atau NIS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                />
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Information Summary (Visible only when Saved) */}
                        {isSaved && (
                            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="flex items-center gap-3 text-slate-700">
                                    <Info size={20} className="text-[#004AAD]" />
                                    <span className="font-bold text-lg">
                                        {(() => {
                                            const [y, m, d] = currentDate.split('-').map(Number);
                                            return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            });
                                        })()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100/50 text-emerald-800 rounded-xl border border-emerald-100">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-sm font-bold">Hadir: {counts.H}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-100/50 text-rose-800 rounded-xl border border-rose-100">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                        <span className="text-sm font-bold">Tidak Hadir: {counts.S + counts.I + counts.A}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">No</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[200px]">Siswa</th>
                                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-64">Kehadiran</th>

                                <th className="px-6 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24 text-center">Pilih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => {
                                    const att = attendance[student.nis];


                                    const isSelected = selectedIds.has(student.nis);
                                    const isPresent = att === 'H';

                                    return (
                                        <tr key={student.nis} className={`transition-colors group ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}>
                                            <td className="px-6 py-4 text-center text-slate-400 text-sm font-medium">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-700">{student.nama}</div>
                                                <div className="text-[11px] text-slate-400 font-mono">{student.nis}</div>
                                            </td>

                                            {/* Individual Attendance Control */}
                                            <td className="px-6 py-4">
                                                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 justify-between gap-1">
                                                    {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(student.nis, status)}
                                                            className={`
                                                                w-8 h-8 rounded-md text-xs font-bold transition-all flex items-center justify-center
                                                                ${attendance[student.nis] === status
                                                                    ? 'bg-white shadow-sm ring-1 ring-black/5 text-emerald-600 scale-105'
                                                                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-200/50'}
                                                                ${attendance[student.nis] === status && status === 'H' ? 'text-emerald-600' : ''}
                                                                ${attendance[student.nis] === status && status === 'S' ? 'text-blue-600' : ''}
                                                                ${attendance[student.nis] === status && status === 'I' ? 'text-amber-600' : ''}
                                                                ${attendance[student.nis] === status && status === 'A' ? 'text-rose-600' : ''}
                                                            `}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>



                                            {/* Selection Checkbox */}
                                            <td className="px-6 py-4 text-center">
                                                <div
                                                    onClick={() => handleBatchApply(student.nis)}
                                                    title={isSelected ? "Batalkan pilihan" : "Pilih dan terapkan batch"}
                                                    className={`
                                                        w-10 h-10 rounded-xl border-2 mx-auto cursor-pointer transition-all flex items-center justify-center active:scale-95
                                                        ${isSelected
                                                            ? 'bg-[#004AAD] border-[#004AAD] text-white shadow-md shadow-blue-500/30'
                                                            : 'border-slate-200 text-transparent hover:border-[#004AAD] hover:bg-blue-50 hover:text-[#004AAD]'}
                                                    `}
                                                >
                                                    <Check size={20} className={isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'} strokeWidth={3} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        {currentStudents.length === 0 ? "Tidak ada siswa di kelas ini." : "Mencari siswa..."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Absen;
