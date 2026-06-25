import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
    BarChart3,
    Users,
    Wallet,
    TrendingUp,
    TrendingDown,
    BookOpen,
    CheckCircle,
    AlertTriangle,
    GraduationCap,
} from 'lucide-react';
import { useFinance } from './DashboardSuperAdmin/hooks/useFinance';

interface LaporanProps {
    user?: any;
    students?: any[];
    classes?: any[];
}

const Laporan: React.FC<LaporanProps> = ({ user, students, classes }) => {
    const roleCode = (user?.roleCode || user?.role || '').toLowerCase();
    const isKurikulum = roleCode === 'kurikulum';
    const isKS = roleCode === 'ks';

    if (isKurikulum || isKS) {
        return <LaporanAkademik user={user} students={students || []} classes={classes || []} />;
    }

    return <LaporanKeuangan />;
};

/* ============================================================
   LAPORAN AKADEMIK (untuk Kurikulum / KS)
   Data fetched from D1: /api/grades, /api/attendance
   ============================================================ */
export const LaporanAkademik: React.FC<{ user?: any; students: any[]; classes: any[] }> = ({ user, students, classes }) => {
    const [selectedClass, setSelectedClass] = useState(classes[0]?.nama || '');
    const [selectedSemester, setSelectedSemester] = useState('Ganjil');
    const [loading, setLoading] = useState(true);

    // D1 data
    const [gradesFromDB, setGradesFromDB] = useState<any[]>([]);
    const [attendanceFromDB, setAttendanceFromDB] = useState<any[]>([]);

    const token = localStorage.getItem('eduadmin_token');

    // Fetch grades + attendance from D1
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [gradesRes, attRes] = await Promise.all([
                fetch('/api/grades?select=*', { headers }),
                fetch('/api/attendance?select=*', { headers }),
            ]);
            if (gradesRes.ok) setGradesFromDB(await gradesRes.json());
            if (attRes.ok) setAttendanceFromDB(await attRes.json());
        } catch {
            toast.error('Gagal memuat data laporan');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const classStudents = useMemo(() =>
        students.filter((s: any) => !selectedClass || s.kelas === selectedClass),
        [students, selectedClass]
    );

    const totalKelas = useMemo(() => new Set(students.map((s: any) => s.kelas)).size, [students]);

    // --- Attendance stats from D1 ---
    const attendanceStats = useMemo(() => {
        // Find student IDs in current view
        const studentIds = new Set(classStudents.map((s: any) => s.id));
        const records = attendanceFromDB.filter((a: any) => studentIds.has(a.student_id));
        const total = records.length || 1;
        const hadir = records.filter((r: any) => r.status === 'hadir').length;
        return {
            totalRecords: records.length,
            pctHadir: Math.round((hadir / total) * 100),
        };
    }, [classStudents, attendanceFromDB]);

    // --- Grade stats from D1 (global for summary card) ---
    const gradeStats = useMemo(() => {
        const studentIds = new Set(classStudents.map((s: any) => s.id));
        const records = gradesFromDB.filter((g: any) => studentIds.has(g.student_id));
        let totalScore = 0;
        let count = 0;
        records.forEach((g: any) => {
            const val = parseFloat(g.grade_value);
            if (!isNaN(val) && val > 0) { totalScore += val; count++; }
        });
        return {
            avgScore: count > 0 ? Math.round(totalScore / count) : 0,
            studentsWithData: count,
        };
    }, [classStudents, gradesFromDB]);

    // --- Per-class breakdown: attendance + grades from D1 ---
    const classBreakdown = useMemo(() => {
        const kelasList = selectedClass
            ? [selectedClass]
            : [...new Set(students.map((s: any) => s.kelas))];

        return kelasList.map(kelas => {
            const siswa = students.filter((s: any) => s.kelas === kelas);
            const siswaIds = new Set(siswa.map((s: any) => s.id));

            // Attendance per class
            const attRecords = attendanceFromDB.filter((a: any) => siswaIds.has(a.student_id));
            const totalAtt = attRecords.length || 1;
            const hadirAtt = attRecords.filter((r: any) => r.status === 'hadir').length;
            const pctHadir = Math.round((hadirAtt / totalAtt) * 100);

            // Grades per class
            const gradeRecords = gradesFromDB.filter((g: any) => siswaIds.has(g.student_id));
            let totalScore = 0;
            let gradeCount = 0;
            gradeRecords.forEach((g: any) => {
                const val = parseFloat(g.grade_value);
                if (!isNaN(val) && val > 0) { totalScore += val; gradeCount++; }
            });
            const avgNilai = gradeCount > 0 ? Math.round(totalScore / gradeCount) : 0;

            return { kelas, jumlahSiswa: siswa.length, pctHadir, avgNilai, gradeCount };
        });
    }, [students, selectedClass, attendanceFromDB, gradesFromDB]);

    if (loading) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <GraduationCap size={28} className="text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Laporan Akademik</h2>
                        <p className="text-slate-500 text-sm">Memuat data dari database...</p>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-500">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <GraduationCap size={28} className="text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Monitor Nilai</h2>
                        <p className="text-slate-500 text-sm">Statistik hasil belajar dan kehadiran per kelas (dari database)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="h-10 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white text-sm"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map((c: any) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                    </select>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="h-10 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500 bg-white text-sm"
                    >
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Siswa', value: classStudents.length, icon: <Users size={24} />, bg: 'bg-blue-500' },
                    { label: 'Jumlah Kelas', value: totalKelas, icon: <BookOpen size={24} />, bg: 'bg-emerald-500' },
                    { label: 'Rata-rata Kehadiran', value: `${attendanceStats.pctHadir}%`, icon: <CheckCircle size={24} />, bg: 'bg-green-500' },
                    { label: 'Rata-rata Nilai', value: gradeStats.avgScore > 0 ? gradeStats.avgScore : '-', icon: <BarChart3 size={24} />, bg: 'bg-purple-500' },
                ].map((card, i) => (
                    <div key={i} className={`${card.bg} text-white p-6 rounded-3xl shadow-lg relative overflow-hidden`}>
                        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem]"></div>
                        <div className="relative z-10">
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
                            <h3 className="text-3xl font-bold">{card.value}</h3>
                            <div className="mt-2 text-white/60">{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-class Breakdown Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex-1 overflow-auto">
                <h3 className="font-bold text-lg text-slate-800 mb-4">Rincian per Kelas</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="p-3 text-slate-600 font-bold">Kelas</th>
                            <th className="p-3 text-slate-600 font-bold text-center">Jumlah Siswa</th>
                            <th className="p-3 text-slate-600 font-bold text-center">% Hadir</th>
                            <th className="p-3 text-slate-600 font-bold text-center">Rata-rata Nilai</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classBreakdown.map((row) => (
                            <tr key={row.kelas} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-bold text-slate-800">Kelas {row.kelas}</td>
                                <td className="p-3 text-center text-slate-600">{row.jumlahSiswa}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        row.pctHadir >= 90 ? 'bg-green-100 text-green-700' :
                                        row.pctHadir >= 75 ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>{row.pctHadir}%</span>
                                </td>
                                <td className="p-3 text-center text-slate-600">{row.avgNilai > 0 ? row.avgNilai : '-'}</td>
                            </tr>
                        ))}
                        {classBreakdown.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400 italic">Tidak ada data kelas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ============================================================
   LAPORAN KEUANGAN (untuk Admin / KS / Keuangan)
   ============================================================ */
const LaporanKeuangan: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ringkasan');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Navigation Items - Phase 1 Only
    const tabs = [
        { id: 'ringkasan', label: 'Ringkasan', icon: <BarChart3 size={18} /> },
        { id: 'labaRugi', label: 'Laba Rugi', icon: <Wallet size={18} /> },
        { id: 'piutang', label: 'Piutang Siswa', icon: <Users size={18} /> },
    ];

    // Real Data from Hook
    const { studentBills, expenses, cashAccounts } = useFinance();

    // Calculations
    const totalIncome = studentBills
        .filter(b => b.status === 'Lunas')
        .reduce((sum, b) => sum + b.amount, 0);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = cashAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalPiutang = studentBills
        .filter(b => b.status === 'Belum Lunas')
        .reduce((sum, b) => sum + b.amount, 0);

    const piutangStudents = studentBills.filter(b => b.status === 'Belum Lunas');
    const uniquePiutangStudents = Array.from(new Set(piutangStudents.map(b => b.studentId))).length;

    // Helper to format currency
    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Phase 1: Ringkasan Keuangan
    const RingkasanView = () => (
        <div className="space-y-6 animate-in fade-in">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg shadow-emerald-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Pendapatan</p>
                        <h3 className="text-2xl font-bold mb-2">{formatIDR(totalIncome)}</h3>
                        <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                            <TrendingUp size={14} /> Terverifikasi
                        </div>
                    </div>
                </div>

                <div className="bg-red-500 text-white p-6 rounded-3xl shadow-lg shadow-red-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <p className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
                        <h3 className="text-2xl font-bold mb-2">{formatIDR(totalExpense)}</h3>
                        <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                            <TrendingDown size={14} /> Terdata
                        </div>
                    </div>
                </div>

                <div className="bg-blue-500 text-white p-6 rounded-3xl shadow-lg shadow-blue-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Saldo Kas</p>
                        <h3 className="text-2xl font-bold mb-2">{formatIDR(totalBalance)}</h3>
                        <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                            <Wallet size={14} /> Aktif
                        </div>
                    </div>
                </div>

                <div className="bg-amber-500 text-white p-6 rounded-3xl shadow-lg shadow-amber-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">Total Piutang</p>
                        <h3 className="text-2xl font-bold mb-2">{formatIDR(totalPiutang)}</h3>
                        <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                            <Users size={14} /> {uniquePiutangStudents} siswa
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Rate */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800">Tingkat Penagihan SPP</h3>
                    <span className="text-sm text-slate-500">Bulan Ini</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Collection Rate</span>
                            <span className="font-bold text-emerald-600">
                                {studentBills.length > 0 ? ((studentBills.filter(b => b.status === 'Lunas').length / studentBills.length) * 100).toFixed(1) : 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${studentBills.length > 0 ? (studentBills.filter(b => b.status === 'Lunas').length / studentBills.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">{new Set(studentBills.map(b => b.studentId)).size}</div>
                        <div className="text-xs text-slate-500">Siswa Tertagih</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Phase 1: Laba Rugi
    const LabaRugiView = () => (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Laporan Laba Rugi Sederhana</h3>
                <p className="text-slate-500">Periode: {selectedYear}/{selectedYear + 1}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pendapatan */}
                <div>
                    <h4 className="font-bold text-lg text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-100">PENDAPATAN (PENERIMAAN)</h4>
                    <div className="space-y-3">
                        {Array.from(new Set(studentBills.map(b => b.type || 'Lainnya'))).map(type => {
                            const typeTotal = studentBills
                                .filter(b => b.status === 'Lunas' && (b.type || 'Lainnya') === type)
                                .reduce((sum, b) => sum + b.amount, 0);
                            return (
                                <div key={type} className="flex justify-between items-center">
                                    <span className="text-slate-700">{type}</span>
                                    <span className="font-mono font-bold text-sm">{formatIDR(typeTotal)}</span>
                                </div>
                            );
                        })}
                        <div className="pt-3 mt-3 border-t-2 border-emerald-100">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-600">Total Pendapatan</span>
                                <span className="font-mono font-bold text-emerald-600 text-lg">{formatIDR(totalIncome)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pengeluaran */}
                <div>
                    <h4 className="font-bold text-lg text-red-600 mb-4 pb-2 border-b-2 border-red-100">PENGELUARAN (BIAYA)</h4>
                    <div className="space-y-3">
                        {Array.from(new Set(expenses.map(e => e.category))).map(cat => {
                            const catTotal = expenses
                                .filter(e => e.category === cat)
                                .reduce((sum, e) => sum + e.amount, 0);
                            return (
                                <div key={cat} className="flex justify-between items-center">
                                    <span className="text-slate-700">{cat}</span>
                                    <span className="font-mono font-bold text-sm">{formatIDR(catTotal)}</span>
                                </div>
                            );
                        })}
                        <div className="pt-3 mt-3 border-t-2 border-red-100">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-red-600">Total Pengeluaran</span>
                                <span className="font-mono font-bold text-red-600 text-lg">{formatIDR(totalExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Laba Bersih */}
            <div className="mt-8 pt-6 border-t-2 border-slate-200">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-slate-800">SURPLUS / DEFISIT</span>
                    <span className={`text-2xl font-bold font-mono ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatIDR(totalIncome - totalExpense)}
                    </span>
                </div>
            </div>
        </div>
    );

    // Phase 1: Piutang Siswa
    const PiutangView = () => (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Laporan Piutang Siswa</h3>
                    <p className="text-slate-500">Daftar tagihan yang belum terselesaikan.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Piutang</p>
                    <p className="text-2xl font-bold text-red-600">{formatIDR(totalPiutang)}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="p-4 text-left font-bold text-slate-700">Nama Siswa</th>
                            <th className="p-4 text-center font-bold text-slate-700">Kelas</th>
                            <th className="p-4 text-left font-bold text-slate-700">Jenis Tagihan</th>
                            <th className="p-4 text-right font-bold text-slate-700">Sisa Piutang</th>
                            <th className="p-4 text-center font-bold text-slate-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {piutangStudents.map((bill) => (
                            <tr key={bill.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-800">{bill.studentName}</td>
                                <td className="p-4 text-center text-slate-600">{bill.class}</td>
                                <td className="p-4 text-slate-600">{bill.paymentName}</td>
                                <td className="p-4 text-right font-mono font-bold text-red-600">{formatIDR(bill.amount)}</td>
                                <td className="p-4 text-center">
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wider">Belum Lunas</span>
                                </td>
                            </tr>
                        ))}
                        {piutangStudents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">Tidak ada piutang siswa saat ini.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pusat Laporan Keuangan</h2>
                    <p className="text-slate-500 text-sm">Tahun Ajaran Aktif: <span className="font-bold text-blue-600">{selectedYear}/{selectedYear + 1}</span></p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <span className="pl-3 text-xs font-bold text-slate-400 uppercase mr-1">Tahun:</span>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent font-bold text-slate-700 text-sm outline-none cursor-pointer py-1 pr-2"
                    >
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                    </select>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex overflow-x-auto gap-1 mb-6 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Render */}
            <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
                {activeTab === 'ringkasan' && <RingkasanView />}
                {activeTab === 'labaRugi' && <LabaRugiView />}
                {activeTab === 'piutang' && <PiutangView />}
            </div>
        </div>
    );
};

export default Laporan;
