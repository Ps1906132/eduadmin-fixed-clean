import React, { useMemo, useState, useEffect } from 'react';
import { Users, School, UploadCloud, FolderPlus, UserPlus, CreditCard, GraduationCap, BarChart3, TrendingUp } from 'lucide-react';

interface DataSiswaViewProps {
    setActiveView: (view: string) => void;
    user?: any;
    students?: any[];
    classes?: any[];
}

const DataSiswaView: React.FC<DataSiswaViewProps> = ({ setActiveView, user, students = [], classes = [] }) => {
    const role = user?.roleCode || user?.role || user?.role_type;
    const isKS = role?.toLowerCase() === 'ks';

    // ── Student Statistics (for KS) ──────────────────────────
    const [selectedTingkat, setSelectedTingkat] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // ── Fetch finance data (for KS status filter) ──
    const [unpaidStudentIds, setUnpaidStudentIds] = useState<Set<string | number>>(new Set());
    useEffect(() => {
        if (!isKS) return;
        const token = localStorage.getItem('eduadmin_token');
        fetch('/api/student_bills', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then((data: any[]) => {
                const bills = Array.isArray(data) ? data : [];
                const unpaid = new Set<string | number>();
                bills.forEach((b: any) => {
                    if (b.status !== 'Lunas' && b.status !== 'paid') {
                        unpaid.add(b.studentId || b.student_id);
                    }
                });
                setUnpaidStudentIds(unpaid);
            })
            .catch(() => setUnpaidStudentIds(new Set()));
    }, [isKS]);

    const stats = useMemo(() => {
        const byTingkat: Record<string, number> = {};
        let total = 0;
        students.forEach((s: any) => {
            const t = s.tingkat || s.kelas?.replace(/[^0-9]/g, '') || '?';
            byTingkat[t] = (byTingkat[t] || 0) + 1;
            total++;
        });
        const filtered = students.filter((s: any) => {
            const t = s.tingkat || s.kelas?.replace(/[^0-9]/g, '') || '?';
            if (selectedTingkat && t !== selectedTingkat) return false;
            if (selectedStatus === 'tuntas') return !unpaidStudentIds.has(s.id);
            if (selectedStatus === 'tidak_tuntas') return unpaidStudentIds.has(s.id);
            return true;
        });
        return { byTingkat, total, filtered };
    }, [students, selectedTingkat, selectedStatus, unpaidStudentIds]);

    if (isKS) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in fade-in flex flex-col overflow-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Users size={28} className="text-blue-800" />
                    <h2 className="text-2xl font-bold text-[#1E1B4B]">Data Siswa</h2>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border border-blue-100/50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl border border-orange-100/50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Kelas</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{classes.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border border-purple-100/50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata/Kelas</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{classes.length ? Math.round(stats.total / classes.length) : 0}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <label className="text-sm font-bold text-slate-600">Filter Kelas:</label>
                    <select
                        value={selectedTingkat}
                        onChange={(e) => setSelectedTingkat(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                    >
                        <option value="">Semua Kelas</option>
                        {Object.keys(stats.byTingkat).sort().map(t => (
                            <option key={t} value={t}>Kelas {t}</option>
                        ))}
                    </select>
                    <label className="text-sm font-bold text-slate-600 ml-2">Status SPP:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="tuntas">Tuntas</option>
                        <option value="tidak_tuntas">Tidak Tuntas</option>
                    </select>
                    <span className="text-xs text-slate-400">({stats.filtered.length} siswa ditampilkan)</span>
                </div>

                {/* Per-Tingkat Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(stats.byTingkat).sort(([a], [b]) => Number(a) - Number(b)).map(([tingkat, count]) => (
                        <div key={tingkat} className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedTingkat === tingkat ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                            onClick={() => setSelectedTingkat(selectedTingkat === tingkat ? '' : tingkat)}>
                            <div className="flex items-center gap-2">
                                <GraduationCap size={18} className="text-slate-400" />
                                <span className="font-bold text-slate-700">Kelas {tingkat}</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
                            <p className="text-xs text-slate-400">Siswa</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Non-KS: Admin CRUD Navigation ───────────────────────
    return (
        <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in fade-in flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <Users size={28} className="text-blue-800" />
                <h2 className="text-2xl font-bold text-[#1E1B4B]">Data Siswa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <button onClick={() => setActiveView('tambah_kelas_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-blue-50 hover:bg-blue-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-blue-200">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><School size={32} /></div>
                    <span className="font-bold text-lg text-blue-900">Tambah Kelas</span>
                </button>
                <button onClick={() => setActiveView('upload_siswa_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-indigo-50 hover:bg-indigo-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-indigo-200">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UploadCloud size={32} /></div>
                    <span className="font-bold text-lg text-indigo-900">Upload Data Siswa</span>
                </button>
                <button onClick={() => setActiveView('upload_perkelas_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-orange-50 hover:bg-orange-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-orange-200">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><FolderPlus size={32} /></div>
                    <span className="font-bold text-lg text-orange-900">Upload Perkelas</span>
                </button>
                <button onClick={() => setActiveView('upload_kelas_satu_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-green-50 hover:bg-green-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-green-200">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
                    <span className="font-bold text-lg text-green-900">Upload Siswa Baru</span>
                </button>
                <button onClick={() => setActiveView('cetak_kartu_login')} className="flex flex-col items-center justify-center gap-3 p-8 bg-purple-50 hover:bg-purple-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-purple-200">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><CreditCard size={32} /></div>
                    <span className="font-bold text-lg text-purple-900">Cetak Kartu Login</span>
                </button>
            </div>

            {/* Quick Stats Summary (for all roles) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Siswa</p>
                    <p className="text-2xl font-bold text-slate-800">{students.length}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Kelas</p>
                    <p className="text-2xl font-bold text-slate-800">{classes.length}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase">Rata-rata/Kelas</p>
                    <p className="text-2xl font-bold text-slate-800">{classes.length ? Math.round(students.length / classes.length) : 0}</p>
                </div>
            </div>
        </div>
    );
};

export default DataSiswaView;
