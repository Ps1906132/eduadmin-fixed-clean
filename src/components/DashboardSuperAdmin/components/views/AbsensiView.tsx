import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CirclePlus, UserCog, ChevronLeft, ChevronRight, CheckSquare, Search, Save, Loader2, BarChart3, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAttendance } from '../../hooks/useAttendance';
import { AttendanceRecord, attendanceDataGlobal } from '../../../../data/sharedData';

interface AbsensiViewProps {
    students: any[];
    classes: any[];
    subjects: any[];
    user?: any;
}

const AbsensiView: React.FC<AbsensiViewProps> = ({
    students,
    classes,
    subjects,
    user
}) => {
    const roleCode = (user?.roleCode || user?.role || '').toLowerCase();
    const isKurikulum = roleCode === 'kurikulum';

    if (isKurikulum) {
        return <AbsensiRekap students={students} classes={classes} />;
    }

    return <AbsensiInput students={students} classes={classes} subjects={subjects} />;
};

/* ============================================================
   KOMPONEN INPUT ABSENSI (untuk Admin / Guru)
   ============================================================ */
const AbsensiInput: React.FC<{ students: any[]; classes: any[]; subjects: any[] }> = ({
    students, classes, subjects
}) => {
    const { saveAttendanceBatch, saving } = useAttendance();
    const [absenDate, setAbsenDate] = useState<Date>(new Date());
    const [absenClass, setAbsenClass] = useState<string>('1A');
    const [absenMode, setAbsenMode] = useState<'today' | 'history'>('today');
    const [absenSearchQuery, setAbsenSearchQuery] = useState('');
    const [absenSemester, setAbsenSemester] = useState('Ganjil');
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(
        Array.isArray(attendanceDataGlobal) ? attendanceDataGlobal : []
    );

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

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-end">
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

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</label>
                        <select className="h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-blue-500 min-w-[200px]">
                            <option value="">Pilih Pelajaran...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            <option value="tematik">Tematik (Bahasa, IPA, IPS)</option>
                        </select>
                    </div>

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

                    <div className="flex bg-slate-200 p-1 rounded-lg self-end ml-auto">
                        <button onClick={() => setAbsenMode('today')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${absenMode === 'today' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Hari Ini</button>
                        <button onClick={() => setAbsenMode('history')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${absenMode === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Histori</button>
                    </div>
                </div>

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
                                    e.target.value = '';
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
                                const allChecked = filteredStudents.every(s => ((attendanceData.find(d => d.studentId === s.id && d.date === currentDateStr) as any)?.checked));

                                const newAttendanceData = [...attendanceData];

                                filteredStudents.forEach(student => {
                                    const existingIndex = newAttendanceData.findIndex(d => d.studentId === student.id && d.date === currentDateStr);
                                    if (existingIndex >= 0) {
                                        newAttendanceData[existingIndex] = { ...newAttendanceData[existingIndex], checked: !allChecked } as any;
                                    } else {
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

/* ============================================================
   KOMPONEN REKAP ABSENSI (untuk Kurikulum — view-only)
   Fetch data dari D1: /api/attendance
   ============================================================ */
const AbsensiRekap: React.FC<{ students: any[]; classes: any[] }> = ({
    students, classes
}) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.nama || '');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);

    // Fetch attendance from D1
    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) {
                toast.error('Sesi berakhir, silakan login kembali');
                return;
            }
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch('/api/attendance?select=*', { headers });
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((r: any) => ({
                    studentId: r.student_id,
                    date: r.date,
                    status: r.status,
                }));
                setAttendanceData(mapped);
            } else {
                toast.error('Gagal memuat data kehadiran');
            }
        } catch (err) {
            toast.error('Gagal memuat data kehadiran');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

    const classStudents = useMemo(() =>
        students.filter((s: any) => s.kelas === selectedClass),
        [students, selectedClass]
    );

    const filteredAttendance = useMemo(() =>
        attendanceData.filter(a =>
            a.date && a.date.startsWith(selectedMonth) &&
            classStudents.some((s: any) => s.id === a.studentId)
        ),
        [attendanceData, selectedMonth, classStudents]
    );

    const stats = useMemo(() => {
        const total = classStudents.length;
        const records = filteredAttendance;
        const totalEntries = records.length || 1; // avoid div by zero

        const hadir = records.filter((r: any) => r.status === 'hadir').length;
        const sakit = records.filter((r: any) => r.status === 'sakit').length;
        const izin = records.filter((r: any) => r.status === 'izin').length;
        const alfa = records.filter((r: any) => r.status === 'alpa').length;

        return { total, totalEntries, hadir, sakit, izin, alfa };
    }, [classStudents, filteredAttendance]);

    const perStudentStats = useMemo(() => {
        return classStudents.map((s: any) => {
            const records = filteredAttendance.filter((r: any) => r.studentId === s.id);
            const hadir = records.filter((r: any) => r.status === 'hadir').length;
            const sakit = records.filter((r: any) => r.status === 'sakit').length;
            const izin = records.filter((r: any) => r.status === 'izin').length;
            const alfa = records.filter((r: any) => r.status === 'alpa').length;
            const total = hadir + sakit + izin + alfa;
            const pctHadir = total > 0 ? Math.round((hadir / total) * 100) : 0;
            return { ...s, hadir, sakit, izin, alfa, total, pctHadir };
        }).filter((s: any) => s.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [classStudents, filteredAttendance, searchQuery]);

    const months = useMemo(() => {
        const arr: string[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        return arr;
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <BarChart3 size={28} className="text-blue-600" />
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1B4B]">Rekap Absensi</h2>
                        <p className="text-slate-500 text-sm">Memuat data dari database...</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-500">Memuat data absensi...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={28} className="text-blue-600" />
                        <div>
                            <h2 className="text-xl font-bold text-[#1E1B4B]">Rekap Absensi</h2>
                            <p className="text-slate-500 text-sm">Statistik kehadiran siswa per kelas (view-only) — dari database</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kelas</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
                        >
                            {classes.map((c: any) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Bulan</label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white"
                        >
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1" />

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Siswa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 w-48 md:w-64"
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: 'Total Siswa', value: stats.total, icon: <Users size={20} />, color: 'bg-blue-100 text-blue-600' },
                        { label: 'Hadir', value: `${stats.totalEntries > 0 ? Math.round((stats.hadir / stats.totalEntries) * 100) : 0}%`, icon: <TrendingUp size={20} />, color: 'bg-green-100 text-green-600' },
                        { label: 'Sakit', value: `${stats.totalEntries > 0 ? Math.round((stats.sakit / stats.totalEntries) * 100) : 0}%`, icon: <Clock size={20} />, color: 'bg-blue-100 text-blue-600' },
                        { label: 'Izin', value: `${stats.totalEntries > 0 ? Math.round((stats.izin / stats.totalEntries) * 100) : 0}%`, icon: <AlertTriangle size={20} />, color: 'bg-orange-100 text-orange-600' },
                        { label: 'Alfa', value: `${stats.totalEntries > 0 ? Math.round((stats.alfa / stats.totalEntries) * 100) : 0}%`, icon: <AlertTriangle size={20} />, color: 'bg-red-100 text-red-600' },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{card.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Per-student Table */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 shadow-inner bg-slate-50 relative">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] text-slate-700 font-bold sticky top-0 z-10 shadow-sm border-b border-slate-200">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-12">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Siswa</th>
                            <th className="p-4 border-r border-slate-200 text-center w-16">Hadir</th>
                            <th className="p-4 border-r border-slate-200 text-center w-16">Sakit</th>
                            <th className="p-4 border-r border-slate-200 text-center w-16">Izin</th>
                            <th className="p-4 border-r border-slate-200 text-center w-16">Alfa</th>
                            <th className="p-4 border-r border-slate-200 text-center w-16">Total</th>
                            <th className="p-4 text-center w-24">% Hadir</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {perStudentStats.map((s: any, i: number) => (
                            <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-3 text-center text-slate-500 font-medium">{i + 1}</td>
                                <td className="p-3 font-bold text-slate-700">{s.nama}</td>
                                <td className="p-3 text-center font-bold text-green-600">{s.hadir}</td>
                                <td className="p-3 text-center text-blue-600">{s.sakit}</td>
                                <td className="p-3 text-center text-orange-600">{s.izin}</td>
                                <td className="p-3 text-center text-red-600">{s.alfa}</td>
                                <td className="p-3 text-center text-slate-600">{s.total}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        s.pctHadir >= 90 ? 'bg-green-100 text-green-700' :
                                        s.pctHadir >= 75 ? 'bg-blue-100 text-blue-700' :
                                        s.pctHadir >= 50 ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {s.pctHadir}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {perStudentStats.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-400">
                                    Belum ada data absensi untuk periode ini
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AbsensiView;
