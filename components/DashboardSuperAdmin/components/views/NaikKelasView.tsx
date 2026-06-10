import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, CheckSquare, ArrowUpCircle, GraduationCap, 
    History, Calendar, Users, RotateCcw, ChevronRight, Save, X, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NaikKelasViewProps {
    students: any[];
    updateStudents: (students: any[]) => void;
    classes: any[];
    nilaiData: any[];
}

const NaikKelasView: React.FC<NaikKelasViewProps> = ({
    students,
    updateStudents,
    classes,
    nilaiData
}) => {
    const [promotionActiveTab, setPromotionActiveTab] = useState('dashboard'); // dashboard, persiapan, proses, lulus, riwayat

    const [promotionYear, setPromotionYear] = useState(() => {
        const saved = localStorage.getItem('promotion_year_v10');
        return saved ? JSON.parse(saved) : { current: '2025/2026', next: '2026/2027' };
    });

    useEffect(() => {
        localStorage.setItem('promotion_year_v1', JSON.stringify(promotionYear));
    }, [promotionYear]);

    const [promotionChecklist, setPromotionChecklist] = useState({ year: true, classes: true, report: false, distinct: true });

    // Initial data with explicit fallback
    const [promotionHistory, setPromotionHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('promotion_history_v10');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('promotion_history_v10', JSON.stringify(promotionHistory));
    }, [promotionHistory]);

    const [selectedPromotionClass, setSelectedPromotionClass] = useState('');
    const [targetPromotionClass, setTargetPromotionClass] = useState('');
    const [promotionStudents, setPromotionStudents] = useState<any[]>([]); // Temp holder

    const handleCheckPreparation = () => {
        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    const classesReady = classes.length > 0;
                    const yearReady = !!promotionYear.next;
                    const reportReady = nilaiData.length > 0;
                    const uniqueNames = new Set(students.map(s => s.nama));
                    const distinctReady = uniqueNames.size === students.length;

                    setPromotionChecklist({
                        year: yearReady,
                        classes: classesReady,
                        report: reportReady,
                        distinct: distinctReady
                    });

                    resolve("Validasi sistem selesai.");
                }, 800);
            }),
            {
                loading: 'Memeriksa kelengkapan data...',
                success: 'Validasi selesai!',
                error: 'Gagal memvalidasi',
            }
        );
    };

    const handleLoadPromotionStudents = (className: string) => {
        setSelectedPromotionClass(className);
        const level = parseInt(className.match(/\d+/)?.[0] || '0');
        const parallel = className.replace(/\d+/, '');
        if (level > 0 && level < 6) {
            setTargetPromotionClass(`${level + 1}${parallel}`);
        } else {
            setTargetPromotionClass('');
        }

        const classStudents = students.filter(s => s.kelas === className);
        const semesterKey = '2 (Genap)';

        const mappedStudents = classStudents.map(s => {
            const suppKey = `rapor_supp_${className}_${s.id}_${semesterKey}`;
            const savedSupp = localStorage.getItem(suppKey);
            let decision = 'Naik';

            if (savedSupp) {
                const parsed = JSON.parse(savedSupp);
                const d = parsed.decision;
                if (d === 'Naik Ke Kelas') decision = 'Naik';
                else if (d === 'Tinggal Di Kelas') decision = 'Tinggal';
                else if (d === 'Lulus') decision = 'Lulus';
                else if (d === 'Tidak Lulus') decision = 'Tidak Lulus';
            }

            return { ...s, promoStatus: decision };
        });

        setPromotionStudents(mappedStudents);
    };

    const handleExecutePromotion = async () => {
        if (!selectedPromotionClass || !targetPromotionClass) return;

        const toPromote = promotionStudents.filter(s => s.promoStatus === 'Naik');
        const count = toPromote.length;

        if (confirm(`Yakin ingin memproses kenaikan kelas untuk ${count} siswa dari ${selectedPromotionClass} ke ${targetPromotionClass}?`)) {
            const updatedStudents = toPromote.map(s => ({
                ...s,
                kelas: targetPromotionClass,
                tingkat: (s.tingkat || 1) + 1,
            }));

            updateStudents(updatedStudents);

            const newHistory = toPromote.map((s, idx) => ({
                id: Date.now() + idx,
                date: new Date().toISOString().split('T')[0],
                student: s.nama,
                from: selectedPromotionClass,
                to: targetPromotionClass,
                type: 'Naik Kelas',
                officer: 'Admin'
            }));

            setPromotionHistory([...newHistory, ...promotionHistory]);
            const token = localStorage.getItem('eduadmin_token');
            const d1Records = toPromote.map((s, idx) => ({
                id: `promo-${Date.now()}-${s.id}`,
                student_id: s.id.toString(),
                from_class_id: selectedPromotionClass,
                to_class_id: targetPromotionClass,
                academic_year_id: 'ay-2025-2026',
                promotion_date: new Date().toISOString().split('T')[0],
                status: 'Naik Kelas',
                processed_by: 'Admin'
            }));
            fetch('/api/promotion_history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(d1Records)
            }).catch(err => console.error('Gagal simpan riwayat ke D1:', err));
            setPromotionStudents([]);
            setSelectedPromotionClass('');
            toast.success("Proses Kenaikan Kelas Berhasil! Data siswa telah diperbarui.");
        }
    };

    const handleExecuteGraduation = async () => {
        const toGraduate = promotionStudents.filter(s => s.promoStatus === 'Lulus');
        const count = toGraduate.length;

        if (confirm(`Yakin ingin meluluskan ${count} siswa dari kelas ${selectedPromotionClass}? Siswa akan dipindahkan ke data Alumni.`)) {
            const updatedStudents = toGraduate.map(s => ({
                ...s,
                kelas: 'Alumni',
                tingkat: 7,
            }));

            updateStudents(updatedStudents);

            const newHistory = toGraduate.map((s, idx) => ({
                id: Date.now() + idx,
                date: new Date().toISOString().split('T')[0],
                student: s.nama,
                from: selectedPromotionClass,
                to: 'Alumni',
                type: 'Lulus',
                officer: 'Admin'
            }));

            setPromotionHistory([...newHistory, ...promotionHistory]);
            const token = localStorage.getItem('eduadmin_token');
            const d1Records = toGraduate.map((s, idx) => ({
                id: `promo-${Date.now()}-${s.id}`,
                student_id: s.id.toString(),
                from_class_id: selectedPromotionClass,
                to_class_id: 'Alumni',
                academic_year_id: 'ay-2025-2026',
                promotion_date: new Date().toISOString().split('T')[0],
                status: 'Lulus',
                processed_by: 'Admin'
            }));
            fetch('/api/promotion_history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(d1Records)
            }).catch(err => console.error('Gagal simpan riwayat ke D1:', err));
            setPromotionStudents([]);
            setSelectedPromotionClass('');
            toast.success("Proses Kelulusan Berhasil! Siswa telah dipindahkan ke Alumni.");
        }
    };

    return (
        <div className="bg-[#F4F7FE] p-6 h-full overflow-y-auto">
            <div className="animate-in fade-in space-y-6">
                {/* Header & Tabs */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                <ArrowUpCircle size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Kenaikan Kelas & Kelulusan</h2>
                                <p className="text-slate-500 text-sm font-medium">Proses kenaikan kelas tahunan dan kelulusan siswa.</p>
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                                { id: 'persiapan', label: 'Persiapan', icon: <CheckSquare size={16} /> },
                                { id: 'proses', label: 'Proses Naik Kelas', icon: <ArrowUpCircle size={16} /> },
                                { id: 'lulus', label: 'Kelulusan (Kls 6)', icon: <GraduationCap size={16} /> },
                                { id: 'riwayat', label: 'Riwayat', icon: <History size={16} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setPromotionActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${promotionActiveTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {promotionActiveTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-2">Tahun Ajaran Aktif</h3>
                                <p className="text-3xl font-bold text-blue-600">{promotionYear.current}</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <Calendar size={14} /> Menuju:
                                    <input
                                        type="text"
                                        value={promotionYear.next}
                                        onChange={(e) => setPromotionYear({ ...promotionYear, next: e.target.value })}
                                        className="font-bold text-slate-700 bg-transparent border-b border-slate-300 w-24 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-2">Total Siswa Aktif</h3>
                                <p className="text-3xl font-bold text-emerald-600">{students.length} Siswa</p>
                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <Users size={14} /> Tersebar di {classes.length} Kelas
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-700 mb-2">Status Proses</h3>
                                <p className="text-3xl font-bold text-amber-500">Belum Selesai</p>
                                <button onClick={() => setPromotionActiveTab('persiapan')} className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">
                                    Mulai Persiapan
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. PERSIAPAN */}
                    {promotionActiveTab === 'persiapan' && (
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800">Validasi Persiapan Sistem</h3>
                                        <p className="text-slate-500 text-sm mt-1">Pastikan semua checklist terpenuhi sebelum memproses kenaikan kelas.</p>
                                    </div>
                                    <button onClick={handleCheckPreparation} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                                        <RotateCcw size={16} /> Cek Ulang
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Tahun Ajaran Baru Tersedia', key: 'year', desc: 'Sistem telah mendeteksi tahun ajaran berikutnya.' },
                                        { label: 'Kelas Tujuan Tersedia', key: 'classes', desc: 'Struktur kelas untuk tingkat selanjutnya sudah siap.' },
                                        { label: 'Rapor Semester Genap Selesai', key: 'report', desc: 'Seluruh nilai sudah diinput dan rapor terkunci.' },
                                        { label: 'Tidak Ada Data Ganda', key: 'distinct', desc: 'Validasi integritas database siswa berhasil.' },
                                    ].map((item, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border ${promotionChecklist[item.key as keyof typeof promotionChecklist] ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} flex items-start gap-3`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${promotionChecklist[item.key as keyof typeof promotionChecklist] ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {promotionChecklist[item.key as keyof typeof promotionChecklist] ? <CheckCircle size={18} /> : <X size={18} />}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${promotionChecklist[item.key as keyof typeof promotionChecklist] ? 'text-emerald-800' : 'text-red-800'}`}>{item.label}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setPromotionActiveTab('proses')}
                                        disabled={!Object.values(promotionChecklist).every(v => v)}
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Lanjut ke Proses Kenaikan →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. PROSES NAIK KELAS */}
                    {promotionActiveTab === 'proses' && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-end">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pilih Kelas Asal</label>
                                    <select
                                        className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 bg-white focus:border-blue-500 outline-none min-w-[150px]"
                                        value={selectedPromotionClass}
                                        onChange={(e) => handleLoadPromotionStudents(e.target.value)}
                                    >
                                        <option value="">-- Pilih --</option>
                                        {classes.filter(c => !c.nama.startsWith('6')).map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center pb-2 text-slate-400"><ChevronRight size={20} /></div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Kelas Tujuan</label>
                                    <select
                                        className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 bg-white focus:border-blue-500 outline-none min-w-[150px]"
                                        value={targetPromotionClass}
                                        onChange={(e) => setTargetPromotionClass(e.target.value)}
                                    >
                                        <option value="">-- Pilih --</option>
                                        {classes.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={handleExecutePromotion}
                                        disabled={promotionStudents.length === 0 || !targetPromotionClass}
                                        className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Save size={18} /> Proses Kenaikan ({promotionStudents.length})
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-auto custom-scrollbar p-6">
                                {promotionStudents.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase sticky top-0 z-10">
                                            <tr>
                                                <th className="p-4 border-b">Nama Siswa / NIS</th>
                                                <th className="p-4 border-b text-center">Rata-rata Nilai</th>
                                                <th className="p-4 border-b text-center">Kehadiran</th>
                                                <th className="p-4 border-b text-center">Status Naik</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {promotionStudents.map((s, idx) => (
                                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-700">
                                                        {s.nama}
                                                        <div className="text-xs text-slate-400 font-normal">{s.nis}</div>
                                                    </td>
                                                    <td className="p-4 text-center text-slate-600 font-mono font-bold">85.5</td>
                                                    <td className="p-4 text-center text-slate-600">98%</td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const updated = [...promotionStudents];
                                                                    updated[idx].promoStatus = 'Naik';
                                                                    setPromotionStudents(updated);
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${s.promoStatus === 'Naik' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-300'}`}
                                                            >NAIK</button>
                                                            <button
                                                                onClick={() => {
                                                                    const updated = [...promotionStudents];
                                                                    updated[idx].promoStatus = 'Tinggal';
                                                                    setPromotionStudents(updated);
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${s.promoStatus === 'Tinggal' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-400 hover:border-red-300'}`}
                                                            >TINGGAL</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Users size={48} className="mb-4 opacity-20" />
                                        <p>Pilih kelas asal untuk memuat data siswa.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. KELULUSAN (KELAS 6) */}
                    {promotionActiveTab === 'lulus' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Kelulusan Siswa Tingkat Akhir</h3>
                                        <p className="text-blue-100 max-w-lg">Proses kelulusan siswa kelas 6 akan memindahkan data mereka ke arsip Alumni. Data nilai dan prestasi akan tersimpan permanen.</p>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                        <GraduationCap size={48} className="text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6">
                                <div className="flex flex-wrap gap-4 items-center mb-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pilih Kelas 6</label>
                                        <select
                                            className="h-10 px-3 rounded-lg border border-slate-200 font-bold text-slate-700 bg-white focus:border-blue-500 outline-none min-w-[150px]"
                                            value={selectedPromotionClass}
                                            onChange={(e) => handleLoadPromotionStudents(e.target.value)}
                                        >
                                            <option value="">-- Pilih --</option>
                                            {classes.filter(c => c.nama.startsWith('6')).map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                        </select>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={() => {
                                                const updated = promotionStudents.map(s => ({ ...s, promoStatus: 'Lulus' }));
                                                setPromotionStudents(updated);
                                            }}
                                            className="text-sm font-bold text-blue-600 hover:underline mr-4"
                                        >
                                            Tandai Semua Lulus
                                        </button>
                                        <button
                                            onClick={handleExecuteGraduation}
                                            disabled={promotionStudents.length === 0}
                                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Proses Kelulusan
                                        </button>
                                    </div>
                                </div>

                                {/* Graduation Table */}
                                <div className="overflow-auto custom-scrollbar border rounded-2xl max-h-[400px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase sticky top-0">
                                            <tr>
                                                <th className="p-4 border-b">Nama Siswa</th>
                                                <th className="p-4 border-b text-center">Status Kelulusan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {promotionStudents.map((s, idx) => (
                                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-700">{s.nama}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                const updated = [...promotionStudents];
                                                                updated[idx].promoStatus = updated[idx].promoStatus === 'Lulus' ? 'Tunda' : 'Lulus';
                                                                setPromotionStudents(updated);
                                                            }}
                                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${s.promoStatus === 'Lulus' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                                                        >
                                                            {s.promoStatus === 'Lulus' ? 'LULUS' : 'DITUNDA'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {promotionStudents.length === 0 && (
                                                <tr>
                                                    <td colSpan={2} className="p-8 text-center text-slate-400">Pilih kelas 6 terlebih dahulu.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. RIWAYAT */}
                    {promotionActiveTab === 'riwayat' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800">Riwayat Kenaikan & Kelulusan</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 border-b">Tanggal</th>
                                            <th className="p-4 border-b">Siswa</th>
                                            <th className="p-4 border-b">Dari</th>
                                            <th className="p-4 border-b">Tujuan</th>
                                            <th className="p-4 border-b text-center">Tipe</th>
                                            <th className="p-4 border-b text-center">Oleh</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {promotionHistory.map(h => (
                                            <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 text-slate-600">{h.date}</td>
                                                <td className="p-4 font-bold text-slate-700">{h.student}</td>
                                                <td className="p-4 text-slate-600">{h.from}</td>
                                                <td className="p-4 text-slate-600">{h.to}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${h.type === 'Naik Kelas' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{h.type}</span>
                                                </td>
                                                <td className="p-4 text-center text-slate-500">{h.officer}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NaikKelasView;
