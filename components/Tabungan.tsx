import React, { useState } from 'react';
import {
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    History,
    FileText,
    Settings,
    LayoutDashboard,
    Search,
    CreditCard,
    Printer,
    Download,
    User,
    Calendar,

    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    Users,
    Plus,
    X
} from 'lucide-react';
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';
import { studentsDataGlobal } from '../data/sharedData';
import { useSavings } from './DashboardSuperAdmin/hooks/useSavings';
import { toast } from 'react-hot-toast';

const Tabungan: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedStudent, setSelectedStudent] = useState('');

    // --- CONNECT TO HOOK ---
    const { savingsData, setSavingsData, savingsTransactions, setSavingsTransactions } = useSavings();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newSaverId, setNewSaverId] = useState('');

    // --- TRANSACTION FORM STATE ---
    const [trxForm, setTrxForm] = useState({
        studentId: '', // ID or NIS
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    const resetForm = () => setTrxForm({ studentId: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });

    // --- ACTIONS ---
    const handleSaveNasabah = () => {
        const studentToAdd = studentsDataGlobal.find(s => s.id === Number(newSaverId));
        if (studentToAdd) {
            // Check if already exists
            if (savingsData.find(s => s.id === studentToAdd.id)) {
                toast.error('Siswa sudah terdaftar sebagai nasabah!');
                return;
            }

            const newSaver = {
                id: studentToAdd.id,
                nis: studentToAdd.nis,
                studentName: studentToAdd.nama,
                class: studentToAdd.kelas,
                balance: 0,
                status: 'Aktif'
            };

            setSavingsData([...savingsData, newSaver]);
            toast.success('Nasabah berhasil ditambahkan secara lokal');
            setShowAddModal(false);
            setNewSaverId('');
        }
    };

    const { 
        savingsData, 
        savingsTransactions, 
        addSavingsTransaction 
    } = useSavings();

    const handleTransaction = async (type: 'Setor' | 'Tarik') => {
        if (!trxForm.studentId || !trxForm.amount) {
            toast.error('Mohon lengkapi data transaksi');
            return;
        }

        const amount = Number(trxForm.amount);
        if (amount <= 0) {
            toast.error('Nominal harus lebih dari 0');
            return;
        }

        const saver = savingsData.find(s => 
            s.studentName.toLowerCase().includes(trxForm.studentId.toLowerCase()) || 
            s.nis === trxForm.studentId ||
            s.studentId.toString() === trxForm.studentId
        );

        if (!saver) {
            toast.error('Nasabah tidak ditemukan!');
            return;
        }

        if (type === 'Tarik' && (saver.balance || 0) < amount) {
            toast.error('Saldo tidak mencukupi!');
            return;
        }

        const res = await addSavingsTransaction({
            studentId: saver.studentId,
            accountId: saver.id,
            type: type === 'Setor' ? 'setor' : 'tarik',
            amount: amount,
            date: trxForm.date,
            description: trxForm.note
        });

        if (res.success) {
            toast.success(`Transaksi ${type} berhasil disinkronkan ke server!`);
            resetForm();
        } else {
            toast.error(res.error || `Gagal memproses transaksi ${type}`);
        }
    };


    // Navigation Menu
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, color: 'blue' },
        { id: 'nasabah', label: 'Data Tabungan', icon: <User size={20} />, color: 'purple' },
        { id: 'setor', label: 'Setor Tunai', icon: <ArrowUpCircle size={20} />, color: 'emerald' },
        { id: 'tarik', label: 'Penarikan', icon: <ArrowDownCircle size={20} />, color: 'rose' },
        { id: 'riwayat', label: 'Riwayat', icon: <History size={20} />, color: 'amber' },
        { id: 'laporan', label: 'Rekapitulasi', icon: <FileText size={20} />, color: 'violet' },
        { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={20} />, color: 'slate' },
    ];


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100">
                                <Wallet size={24} className="text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Tabungan Siswa</h2>
                                <p className="text-slate-500 text-sm font-medium">Kelola data tabungan, setoran, dan penarikan siswa.</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {menuItems.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-200'
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

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-x-auto flex gap-1 sticky top-0 z-10">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const colorClass = getColorClasses(item.color as ColorName);

                    if (item.id === 'nasabah') {
                        return (
                            <React.Fragment key="special-item-nasabah">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap bg-[#004AAD] text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200 mr-1"
                                >
                                    <Plus size={18} />
                                    Tambah Nasabah
                                </button>
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
                            </React.Fragment>
                        );
                    }

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

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Total Saldo Seluruh Siswa</p>
                                        <h3 className="text-2xl font-extrabold text-slate-800">Rp {savingsData.reduce((acc, curr) => acc + curr.saldo, 0).toLocaleString('id-ID')}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Pemasukan (Total)</p>
                                        <h3 className="text-2xl font-extrabold text-slate-800">+ Rp {savingsTransactions.filter(t => t.type === 'Setor').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                                        <TrendingDown size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500">Penarikan (Total)</p>
                                        <h3 className="text-2xl font-extrabold text-slate-800">- Rp {savingsTransactions.filter(t => t.type === 'Tarik').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Transaksi Terkini</h3>
                                <button className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua</button>
                            </div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">ID Transaksi</th>
                                            <th className="p-4">Tanggal</th>
                                            <th className="p-4">Siswa</th>
                                            <th className="p-4">Tipe</th>
                                            <th className="p-4 text-right">Nominal</th>
                                            <th className="p-4 text-right">Saldo Akhir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {savingsTransactions.slice(0, 5).map((trx) => (
                                            <tr key={trx.id} className="hover:bg-slate-50/50">
                                                <td className="p-4 font-mono text-slate-500">{trx.id}</td>
                                                <td className="p-4">{trx.date}</td>
                                                <td className="p-4 font-medium text-slate-700">{trx.studentName}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${trx.type === 'Setor' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {trx.type}
                                                    </span>
                                                </td>
                                                <td className={`p-4 text-right font-bold ${trx.type === 'Setor' ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                    {trx.type === 'Setor' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-700">
                                                    -
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* DATA TABUNGAN (NASABAH) TAB */}
                {activeTab === 'nasabah' && (
                    <div className="space-y-6">
                        {/* Title & Actions Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <h3 className="text-lg font-bold text-slate-800">Data Tabungan Siswa</h3>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {/* Search Bar */}
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Cari Siswa..."
                                    />
                                </div>

                                {/* Add Button Removed */}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="py-3 pr-4">Siswa</th>
                                        <th className="py-3 px-4">Kelas</th>
                                        <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 pl-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {savingsData.map((saver) => (
                                        <tr key={saver.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-4">
                                                <div>
                                                    <div className="font-bold text-slate-700">{saver.nama}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{saver.nis}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500 font-medium">{saver.kelas}</td>
                                            <td className="py-4 px-4 text-right font-bold text-emerald-600">
                                                Rp {saver.saldo?.toLocaleString('id-ID') || 0}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${saver.status === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {saver.status || 'Aktif'}
                                                </span>
                                            </td>
                                            <td className="py-4 pl-4 text-right">
                                                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                                                    Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {savingsData.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada data nasabah.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ADD NASABAH MODAL (Tetap sama) */}
                        {showAddModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">Tambah Nasabah Baru</h3>
                                        <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Siswa</label>
                                            <select
                                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                value={newSaverId}
                                                onChange={(e) => setNewSaverId(e.target.value)}
                                            >
                                                <option value="">-- Pilih Siswa --</option>
                                                {studentsDataGlobal
                                                    .filter(s => !savingsData.find(saver => saver.id === s.id))
                                                    .map(s => (
                                                        <option key={s.id} value={s.id}>{s.nama} - {s.kelas} ({s.nis})</option>
                                                    ))
                                                }
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1">*Hanya siswa yang belum menjadi nasabah yang muncul.</p>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={handleSaveNasabah}
                                                disabled={!newSaverId}
                                                className="w-full py-3 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Simpan Nasabah
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SETOR TUNAI TAB */}
                {activeTab === 'setor' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
                            <div className="p-4 bg-white rounded-full text-emerald-600 shadow-sm">
                                <ArrowUpCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-emerald-800">Setor Tunai</h3>
                                <p className="text-emerald-600/80">Input penerimaan tabungan dari siswa.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Cari Siswa</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Ketik Nama atau NIS..."
                                        value={trxForm.studentId}
                                        onChange={(e) => setTrxForm({ ...trxForm, studentId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal</label>
                                    <input type="date" className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50" defaultValue="2025-06-20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-600 text-lg"
                                        placeholder="0"
                                        value={trxForm.amount}
                                        onChange={(e) => setTrxForm({ ...trxForm, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                                    placeholder="Keterangan tambahan..."
                                    value={trxForm.note}
                                    onChange={(e) => setTrxForm({ ...trxForm, note: e.target.value })}
                                />
                            </div>

                            <button onClick={() => handleTransaction('Setor')} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                                Simpan Setoran
                            </button>
                        </div>
                    </div>
                )}

                {/* PENARIKAN TAB */}
                {activeTab === 'tarik' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4">
                            <div className="p-4 bg-white rounded-full text-rose-600 shadow-sm">
                                <ArrowDownCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-rose-800">Penarikan Tunai</h3>
                                <p className="text-rose-600/80">Input pengambilan tabungan oleh siswa.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Cari Siswa</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                                        placeholder="Ketik Nama atau NIS..."
                                        value={trxForm.studentId}
                                        onChange={(e) => setTrxForm({ ...trxForm, studentId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal</label>
                                    <input type="date" className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50" defaultValue="2025-06-20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-rose-600 text-lg"
                                        placeholder="0"
                                        value={trxForm.amount}
                                        onChange={(e) => setTrxForm({ ...trxForm, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Catatan (Opsional)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none h-24"
                                    placeholder="Keterangan penarikan..."
                                    value={trxForm.note}
                                    onChange={(e) => setTrxForm({ ...trxForm, note: e.target.value })}
                                />
                            </div>

                            <button onClick={() => handleTransaction('Tarik')} className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
                                Proses Penarikan
                            </button>
                        </div>
                    </div>
                )}

                {/* RIWAYAT TAB */}
                {activeTab === 'riwayat' && (
                    <div className="space-y-6">
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-10 p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Cari transaksi..."
                                />
                            </div>
                            <input type="date" className="p-3 border border-slate-300 rounded-xl bg-slate-50" />
                            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Filter</button>
                            <button className="px-4 py-2 bg-[#004AAD] text-white rounded-xl font-bold flex items-center gap-2">
                                <Download size={18} /> Export
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-slate-400">
                            <History size={48} className="mb-4 opacity-50" />
                            <p>Menampilkan semua riwayat transaksi tabungan.</p>
                            <p className="text-sm">Gunakan filter di atas untuk mencari transaksi spesifik.</p>
                        </div>
                    </div>
                )}

                {/* LAPORAN & PENGATURAN PLACEHOLDERS */}
                {['laporan', 'pengaturan'].includes(activeTab) && (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Settings size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-slate-600 capitalize">Menu {activeTab}</h3>
                        <p>Fitur ini akan segera tersedia.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Tabungan;
