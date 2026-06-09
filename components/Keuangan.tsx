import React, { useState } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PieChart,
    Calendar,
    Settings,
    History,
    Bell,
    DollarSign,
    CreditCard,
    Building,
    Activity,
    FileText,
    Download,
    Filter,
    Plus,
    Users,
    AlertCircle,
    CheckCircle2,
    Shield,
    Database,
    Clock
} from 'lucide-react';
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';
import { studentsDataGlobal, paymentHistoryGlobal } from '../data/sharedData';
import { toast } from 'react-hot-toast';

import { useFinance } from './DashboardSuperAdmin/hooks/useFinance';

const Keuangan: React.FC = () => {
    const [activeTab, setActiveTab] = useState('penerimaan');
    const { 
        paymentHistory: payments, 
        expenses, 
        addPayment, 
        addExpense,
        refreshFinance 
    } = useFinance();

    // Mapping API data to UI format if needed
    const mappedPayments = (payments || []).map((p: any) => ({
        id: p.id,
        date: p.payment_date,
        studentName: p.studentName || (p.student_id ? `Siswa ${p.student_id}` : 'Umum'),
        type: p.type || 'SPP',
        amount: p.amount,
        status: 'Lunas',
        method: p.notes
    }));

    const mappedExpenses = (expenses || []).map((e: any) => ({
        id: e.id,
        date: e.date,
        description: e.description,
        category: e.category,
        amount: e.amount,
        proof: e.proof
    }));

    // --- FORM STATES ---
    // Penerimaan
    const [incomeForm, setIncomeForm] = useState({
        studentId: '', // ID or NIS
        studentName: '',
        date: new Date().toISOString().split('T')[0],
        category: 'SPP',
        amount: '', // string for input
        method: 'Tunai',
        note: ''
    });
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    // Pengeluaran
    const [expenseForm, setExpenseForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Operasional',
        description: '',
        amount: '',
        proof: '-'
    });

    // --- HANDLERS ---
    const handleAddIncome = async () => {
        if (!incomeForm.amount || (!selectedStudent && incomeForm.category === 'SPP')) {
            toast.error('Mohon lengkapi data penerimaan!');
            return;
        }

        const res = await addPayment({
            studentId: selectedStudent?.id || null,
            amount: Number(incomeForm.amount),
            type: incomeForm.category,
            date: incomeForm.date,
            method: incomeForm.method
        });

        if (res.success) {
            toast.success('Penerimaan berhasil dicatat dan disinkronkan!');
            setIncomeForm({ ...incomeForm, amount: '', note: '' });
            setSelectedStudent(null);
            setSearchStudent('');
        } else {
            toast.error(res.error || 'Gagal menyimpan transaksi');
        }
    };

    const handleAddExpense = async () => {
        if (!expenseForm.amount || !expenseForm.description) {
            toast.error('Mohon lengkapi data pengeluaran!');
            return;
        }

        const res = await addExpense({
            ...expenseForm,
            amount: Number(expenseForm.amount)
        });

        if (res.success) {
            toast.success('Pengeluaran berhasil dicatat dan disinkronkan!');
            setExpenseForm({ ...expenseForm, description: '', amount: '' });
        } else {
            toast.error(res.error || 'Gagal menyimpan pengeluaran');
        }
    };

    // Calculate Summaries
    const totalIncome = mappedPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalExpense = mappedExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    // Navigation Menu Items
    const menuItems = [
        { id: 'penerimaan', label: 'Penerimaan', icon: <TrendingUp size={20} />, color: 'emerald' },
        { id: 'pengeluaran', label: 'Pengeluaran', icon: <TrendingDown size={20} />, color: 'rose' },
        { id: 'laporan', label: 'Laporan', icon: <PieChart size={20} />, color: 'blue' },
        { id: 'anggaran', label: 'Anggaran', icon: <Calendar size={20} />, color: 'violet' },
        { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={20} />, color: 'slate' },
        { id: 'histori', label: 'Histori & Audit', icon: <History size={20} />, color: 'amber' },
        { id: 'notifikasi', label: 'Notifikasi', icon: <Bell size={20} />, color: 'cyan' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Wallet className="text-[#004AAD]" size={32} />
                        Keuangan Sekolah
                    </h2>
                    <p className="text-slate-500 mt-1">Kelola arus kas, anggaran, dan laporan keuangan sekolah secara terpadu.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-[#004AAD] hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20">
                        <Plus size={18} /> Transaksi Baru
                    </button>
                    <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2">
                        <Download size={18} /> Export Laporan
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-x-auto flex gap-1 sticky top-0 z-10">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const colorClass = getColorClasses(item.color as ColorName);
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200
                                ${isActive
                                    ? `${colorClass.bg50} ${colorClass.text700} shadow-sm ring-1 ${colorClass.ring200}`
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }
                            `}
                        >
                            <span className={isActive ? colorClass.text600 : ''}>{item.icon}</span>
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[500px] p-6 md:p-8">

                {/* PENERIMAAN */}
                {activeTab === 'penerimaan' && (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <p className="text-emerald-600 font-bold text-sm uppercase">Total Penerimaan</p>
                                <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">Rp {totalIncome.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                <p className="text-rose-600 font-bold text-sm uppercase">Total Pengeluaran</p>
                                <h3 className="text-2xl font-extrabold text-rose-800 mt-1">Rp {totalExpense.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-blue-600 font-bold text-sm uppercase">Saldo Akhir</p>
                                <h3 className="text-2xl font-extrabold text-blue-800 mt-1">Rp {balance.toLocaleString('id-ID')}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Input Form */}
                            <div className="lg:col-span-1 border border-slate-200 rounded-[2rem] p-6 h-fit bg-slate-50/50">
                                <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                                    <Plus className="bg-emerald-100 text-emerald-600 rounded-lg p-1" size={28} />
                                    Input Penerimaan
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700"
                                            value={incomeForm.date}
                                            onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                        <select
                                            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700"
                                            value={incomeForm.category}
                                            onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                                        >
                                            <option value="SPP">SPP Bulanan</option>
                                            <option value="Uang Gedung">Uang Gedung</option>
                                            <option value="Seragam">Seragam</option>
                                            <option value="Buku">Buku LKS</option>
                                            <option value="Donasi">Donasi / Infaq</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>

                                    {/* Student Search */}
                                    {(incomeForm.category !== 'Donasi' && incomeForm.category !== 'Lainnya') && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Cari Siswa</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700 placeholder:font-normal"
                                                    placeholder="Nama / NIS..."
                                                    value={searchStudent}
                                                    onChange={(e) => {
                                                        setSearchStudent(e.target.value);
                                                        setSelectedStudent(null);
                                                    }}
                                                />
                                                {searchStudent && !selectedStudent && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-1 max-h-48 overflow-y-auto z-20">
                                                        {studentsDataGlobal.filter(s => s.nama.toLowerCase().includes(searchStudent.toLowerCase())).map(s => (
                                                            <div
                                                                key={s.id}
                                                                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                                                                onClick={() => {
                                                                    setSelectedStudent(s);
                                                                    setSearchStudent(s.nama);
                                                                    setIncomeForm({ ...incomeForm, studentName: s.nama, studentId: String(s.id) });
                                                                }}
                                                            >
                                                                <p className="font-bold text-sm text-slate-800">{s.nama}</p>
                                                                <p className="text-xs text-slate-500">{s.kelas} • {s.nis}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-600 text-lg"
                                            placeholder="0"
                                            value={incomeForm.amount}
                                            onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Metode Pembayaran</label>
                                        <div className="flex gap-2">
                                            {['Tunai', 'Transfer'].map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setIncomeForm({ ...incomeForm, method: m })}
                                                    className={`flex-1 py-2 rounded-lg font-bold text-xs border ${incomeForm.method === m ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white border-slate-300 text-slate-500'}`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddIncome}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 mt-4"
                                    >
                                        Simpan Transaksi
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-slate-800">Riwayat Penerimaan</h3>
                                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                        Lihat Semua
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                                            <tr>
                                                <th className="p-4">Tanggal</th>
                                                <th className="p-4">Siswa / Sumber</th>
                                                <th className="p-4">Kategori</th>
                                                <th className="p-4 text-right">Nominal</th>
                                                <th className="p-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {payments.slice(0, 10).map((pay: any) => (
                                                <tr key={pay.id} className="hover:bg-slate-50">
                                                    <td className="p-4 text-slate-500">
                                                        {typeof pay.date === 'string' && pay.date.includes('-') ? pay.date : pay.date}
                                                    </td>
                                                    <td className="p-4 font-bold text-slate-700">{pay.studentName}</td>
                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{pay.type}</span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-emerald-600">Rp {pay.amount.toLocaleString('id-ID')}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{pay.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {payments.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada data penerimaan.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PENGELUARAN */}
                {activeTab === 'pengeluaran' && (
                    <div className="space-y-6">
                        {/* Input Expense */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Catat Pengeluaran Baru</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={expenseForm.date}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                    <select
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-rose-500"
                                    >
                                        <option>Operasional</option>
                                        <option>Honor Guru/Staff</option>
                                        <option>ATK & Fotokopi</option>
                                        <option>Konsumsi</option>
                                        <option>Perbaikan</option>
                                        <option>Lainnya</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Beli Kertas A4"
                                        value={expenseForm.description}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-rose-500 font-mono text-rose-600 font-bold"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleAddExpense}
                                        className="w-full p-2.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Data Pengeluaran */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Daftar Pengeluaran</h3>
                                <span className="font-bold text-rose-600 text-lg">Total: Rp {totalExpense.toLocaleString('id-ID')}</span>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="p-3">Tanggal</th>
                                        <th className="p-3">Keterangan</th>
                                        <th className="p-3">Kategori</th>
                                        <th className="p-3 text-right">Nominal</th>
                                        <th className="p-3 text-center">Bukti</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">Belum ada data pengeluaran.</td></tr>
                                    ) : (
                                        expenses.map((exp: any) => (
                                            <tr key={exp.id}>
                                                <td className="p-3 text-slate-600">{exp.date}</td>
                                                <td className="p-3 font-medium text-slate-800">{exp.description}</td>
                                                <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">{exp.category}</span></td>
                                                <td className="p-3 text-right font-bold text-rose-600">Rp {exp.amount.toLocaleString('id-ID')}</td>
                                                <td className="p-3 text-center text-blue-500 text-xs hover:underline cursor-pointer">Lihat</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* LAPORAN */}
                {activeTab === 'laporan' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'Arus Kas', icon: <Activity />, desc: 'Laporan Cash Flow Bulanan' },
                                { title: 'Neraca & Laba Rugi', icon: <FileText />, desc: 'Posisi Keuangan Sekolah' },
                                { title: 'Rekap SPP per Kelas', icon: <Users />, desc: 'Status Pembayaran Siswa' },
                                { title: 'Anggaran vs Realisasi', icon: <PieChart />, desc: 'Evaluasi Kinerja Keuangan' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-6 rounded-2xl border border-slate-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ANGGARAN */}
                {activeTab === 'anggaran' && (
                    <div className="space-y-6">
                        <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 mb-6">
                            <h3 className="text-lg font-bold text-violet-800 mb-2">Tahun Anggaran 2024/2025</h3>
                            <div className="w-full bg-violet-200 rounded-full h-4 overflow-hidden">
                                <div className="bg-violet-500 h-full rounded-full w-[65%]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-violet-600 mt-2">
                                <span>Realisasi: 65%</span>
                                <span>Target: 100%</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['Rencana Tahunan', 'Monitoring Realisasi', 'Revisi Anggaran'].map((label, idx) => (
                                <button key={idx} className="p-4 bg-white border border-slate-200 rounded-xl hover:bg-violet-50 hover:text-violet-700 font-bold text-slate-600 transition-colors text-left flex items-center justify-between">
                                    {label}
                                    <Calendar size={18} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* PENGATURAN */}
                {activeTab === 'pengaturan' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'Tarif & Biaya', icon: <DollarSign />, color: 'slate' },
                            { title: 'Metode Pembayaran', icon: <CreditCard />, color: 'slate' },
                            { title: 'Rekening Bank', icon: <Building />, color: 'slate' },
                            { title: 'Role & Hak Akses', icon: <Shield />, color: 'slate' },
                        ].map((item, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* HISTORI & AUDIT */}
                {activeTab === 'histori' && (
                    <div className="space-y-4">
                        {[
                            { title: 'Riwayat Transaksi', icon: <History />, desc: 'Log lengkap semua transaksi masuk dan keluar' },
                            { title: 'Backup Data', icon: <Database />, desc: 'Amankan data keuangan secara berkala' },
                            { title: 'Log Aktivitas', icon: <Activity />, desc: 'Pantau siapa melakukan apa' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-200 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">{item.title}</h4>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                                <Clock size={16} className="text-slate-400" />
                            </div>
                        ))}
                    </div>
                )}

                {/* NOTIFIKASI */}
                {activeTab === 'notifikasi' && (
                    <div className="space-y-4">
                        {[
                            { title: 'Jatuh Tempo SPP', count: 0, color: 'rose' },
                            { title: 'Alert Anggaran (Warning)', count: 0, color: 'amber' },
                            { title: 'Konfirmasi Pembayaran Transfer', count: 0, color: 'emerald' },
                        ].map((item, idx) => {
                            const notifColorClass = getColorClasses(item.color as ColorName);
                            return (
                                <div key={idx} className={`p-4 border ${notifColorClass.border200} ${notifColorClass.bg50} rounded-xl flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className={notifColorClass.text600} />
                                        <span className={`font-bold ${notifColorClass.text800}`}>{item.title}</span>
                                    </div>
                                    <span className={`bg-white px-3 py-1 rounded-full text-xs font-black ${notifColorClass.text600} shadow-sm`}>{item.count} Pending</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Icon component needed for some items
const BookOpen = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

export default Keuangan;
