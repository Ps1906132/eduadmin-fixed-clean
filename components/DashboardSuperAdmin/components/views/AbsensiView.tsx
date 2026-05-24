import { AttendanceRecord } from '../../../../data/sharedData';
import React from 'react';
import { CirclePlus, UserCog, ChevronLeft, ChevronRight, CheckSquare, Search, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAttendance } from '../../hooks/useAttendance';

// AttendanceRecord imported from sharedData

interface AbsensiViewProps {
    activeView: string;
    absenClass: string;
    setAbsenClass: (value: string) => void;
    absenSemester: string;
    setAbsenSemester: (value: string) => void;
    absenDate: Date;
    setAbsenDate: (date: Date) => void;
    absenMode: 'today' | 'history';
    setAbsenMode: (mode: 'today' | 'history') => void;
    absenSearchQuery: string;
    setAbsenSearchQuery: (query: string) => void;
    attendanceData: AttendanceRecord[];
    setAttendanceData: (data: AttendanceRecord[]) => void;
    students: any[];
    classes: any[];
    subjects: any[];
}

const AbsensiView: React.FC<AbsensiViewProps> = ({
    activeView,
    absenClass,
    setAbsenClass,
    absenSemester,
    setAbsenSemester,
    absenDate,
    setAbsenDate,
    absenMode,
    setAbsenMode,
    absenSearchQuery,
    setAbsenSearchQuery,
    attendanceData,
    setAttendanceData,
    students,
    classes,
    subjects
}) => {
    const { saveAttendanceBatch, saving } = useAttendance();

    const handleSave = async () => {
        const currentDateStr = absenDate.toISOString().split('T')[0];
        const currentClass = classes.find((c: any) => c.nama === absenClass);

        if (!currentClass) {
            toast.error('Kelas tidak ditemukan');
            return;
        }

        const classStudents = students.filter((s: any) => s.kelas === absenClass);
        if (classStudents.length === 0) {
            toast.error('Tidak ada siswa di kelas ini');
            return;
        }

        const records = classStudents.map((student: any) => {
            const existing = (attendanceData as any[]).find(
                d => d.studentId === student.id && d.date === currentDateStr
            ) as any;
            return {
                studentId: student.id.toString(),
                classId: currentClass.id.toString(),
                date: currentDateStr,
                status: (existing?.status || 'H') as 'H' | 'S' | 'I' | 'A',
                note: existing?.note || ''
            };
        });

        const result = await saveAttendanceBatch(records);
        if (result.success) {
            toast.success(`Absensi kelas ${absenClass} tanggal ${currentDateStr} berhasil disimpan!`);
        } else {
            toast.error(result.error || 'Gagal menyimpan absensi');
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col">
            {/* Header and Controls */}
            <div className="flex flex-col gap-6 mb-6">
                {/* Title & Teacher Info */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <CirclePlus size={28} className="text-blue-600" />
                        <div>
                            <h2 className="text-xl font-bold text-[#1E1B4B]">Absensi Siswa</h2>
                            <p className="text-slate-500 text-sm">Kelola data kehadiran siswa harian</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                        <UserCog size={16} className="text-blue-600" />
                        <span className="font-bold text-blue-800 text-sm">Admin Sekolah</span>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-end">
                    {/* Class Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kelas</label>
                        <select
                            value={absenClass}
                            onChange={(e) => setAbsenClass(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
                        >
                            {classes.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                        </select>
                    </div>

                    {/* Subject Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</label>
                        <select
                            className="h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-blue-500 min-w-[200px]"
                        >
                            <option value="">Pilih Pelajaran...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            <option value="tematik">Tematik (Bahasa, IPA, IPS)</option>
                        </select>
                    </div>

                    {/* Semester Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Semester</label>
                        <select
                            value={absenSemester}
                            onChange={(e) => setAbsenSemester(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="Ganjil">Ganjil</option>
                            <option value="Genap">Genap</option>
                        </select>
                    </div>

                    {/* Date Navigator */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                        <div className="flex items-center gap-2">
                            <button onClick={() => {
                                const d = new Date(absenDate);
                                d.setDate(d.getDate() - 1);
                                setAbsenDate(d);
                            }} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronLeft size={18} /></button>

                            <input
                                type="date"
                                value={absenDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const parts = e.target.value.split('-');
                                        // Construct date in local time to avoid timezone offsets
                                        const newDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                        setAbsenDate(newDate);
                                    }
                                }}
                                className="h-10 px-4 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-700 text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all min-w-[160px] cursor-pointer"
                            />

                            <button onClick={() => {
                                const d = new Date(absenDate);
                                d.setDate(d.getDate() + 1);
                                setAbsenDate(d);
                            }} className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    {/* Mode Switch */}
                    <div className="flex bg-slate-200 p-1 rounded-lg self-end ml-auto">
                        <button onClick={() => setAbsenMode('today')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${absenMode === 'today' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Hari Ini</button>
                        <button onClick={() => setAbsenMode('history')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${absenMode === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Histori</button>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    const currentDateStr = absenDate.toISOString().split('T')[0];
                                    const filteredStudents = students.filter(s => s.kelas === absenClass);
                                    const newAttendanceData = [...attendanceData];

                                    filteredStudents.forEach(student => {
                                        const existingIndex = newAttendanceData.findIndex(d => d.studentId === student.id && d.date === currentDateStr);
                                        if (existingIndex >= 0) {
                                            newAttendanceData[existingIndex] = { ...newAttendanceData[existingIndex], status: e.target.value as any };
                                        } else {
                                            // Create new properly typed record
                                            newAttendanceData.push({
                                                id: `att-${Date.now()}-${student.id}`,
                                                studentId: student.id,
                                                studentName: student.nama,
                                                classId: student.kelas,
                                                date: currentDateStr,
                                                status: e.target.value as any,
                                                note: '',
                                                checked: false
                                            });
                                        }
                                    });
                                    setAttendanceData(newAttendanceData);
                                    e.target.value = ''; // Reset select
                                }
                            }}
                            className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 bg-white min-w-[140px]"
                        >
                            <option value="">Status Cepat...</option>
                            <option value="H">Hadir (H)</option>
                            <option value="S">Sakit (S)</option>
                            <option value="I">Izin (I)</option>
                            <option value="A">Alfa (A)</option>
                        </select>


                        <button
                            onClick={() => {
                                const currentDateStr = absenDate.toISOString().split('T')[0];
                                const filteredStudents = students.filter(s => s.kelas === absenClass);
                                // Find if all displayed students are checked FOR THIS DATE
                                const allChecked = filteredStudents.every(s => ((attendanceData.find(d => d.studentId === s.id && d.date === currentDateStr) as any)?.checked));

                                const newAttendanceData = [...attendanceData];

                                filteredStudents.forEach(student => {
                                    const existingIndex = newAttendanceData.findIndex(d => d.studentId === student.id && d.date === currentDateStr);
                                    if (existingIndex >= 0) {
                                        newAttendanceData[existingIndex] = { ...newAttendanceData[existingIndex], checked: !allChecked } as any;
                                    } else {
                                        // Initialize if strictly checking before data exists
                                        newAttendanceData.push({
                                            id: `att-${Date.now()}-${student.id}`,
                                            studentId: student.id,
                                            studentName: student.nama,
                                            classId: student.kelas,
                                            date: currentDateStr,
                                            status: 'H',
                                            note: '',
                                            checked: !allChecked
                                        });
                                    }
                                });
                                setAttendanceData(newAttendanceData);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 border border-blue-100 h-10"
                        >
                            <CheckSquare size={16} /> <span className="hidden md:inline">Centang Semua</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari Siswa..."
                                value={absenSearchQuery}
                                onChange={(e) => setAbsenSearchQuery(e.target.value)}
                                className="h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 w-48 md:w-64"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {saving
                                ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                                : <><Save size={18} /> Simpan</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 shadow-inner bg-slate-50 relative">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] text-slate-700 font-bold sticky top-0 z-10 shadow-sm border-b border-slate-200">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Siswa</th>
                            <th className="p-4 border-r border-slate-200 text-center w-40">Kehadiran</th>

                            <th className="p-4 border-r border-slate-200 min-w-[200px]">Catatan</th>
                            <th className="p-4 text-center w-16"><CheckSquare size={16} className="mx-auto text-slate-400" /></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {students.filter(s => s.kelas === absenClass).filter(s => s.nama.toLowerCase().includes(absenSearchQuery.toLowerCase())).map((student, i) => {
                            // Get current data or default
                            const currentDateStr = absenDate.toISOString().split('T')[0];
                            const data = (attendanceData.find(d => d.studentId === student.id && d.date === currentDateStr) || { status: 'H', note: '', checked: false }) as any;

                            const updateStudentData = (field: string, value: any) => {
                                const newAttendanceData = [...attendanceData];
                                const index = newAttendanceData.findIndex(d => d.studentId === student.id && d.date === currentDateStr);
                                if (index >= 0) {
                                    newAttendanceData[index] = { ...newAttendanceData[index], [field]: value };
                                } else {
                                    newAttendanceData.push({
                                        id: `att-${Date.now()}-${student.id}`,
                                        studentId: student.id,
                                        studentName: student.nama,
                                        classId: student.kelas,
                                        date: currentDateStr,
                                        status: field === 'status' ? value : 'H',
                                        note: field === 'note' ? value : '',
                                        checked: field === 'checked' ? value : false
                                    });
                                }
                                setAttendanceData(newAttendanceData);
                            };

                            return (
                                <tr key={student.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="p-3 text-center text-slate-500 font-medium group-hover:text-blue-600">{i + 1}</td>
                                    <td className="p-3 font-bold text-slate-700">{student.nama}</td>
                                    <td className="p-3 text-center">
                                        <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1 border border-slate-200">
                                            {['H', 'S', 'I', 'A'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStudentData('status', status)}
                                                    className={`w-7 h-7 rounded-md font-bold text-xs transition-all ${data.status === status
                                                        ? (status === 'H' ? 'bg-white text-green-600 shadow-sm ring-1 ring-green-100' :
                                                            status === 'S' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100' :
                                                                status === 'I' ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100' :
                                                                    'bg-white text-red-600 shadow-sm ring-1 ring-red-100')
                                                        : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        <input
                                            type="text"
                                            value={data.note}
                                            onChange={(e) => updateStudentData('note', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-blue-400 transition-colors"
                                            placeholder="Catatan..."
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={data.checked}
                                            onChange={(e) => updateStudentData('checked', e.target.checked)}
                                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AbsensiView;
