import React, { useState } from 'react';
import { 
    Wallet, LayoutDashboard, Users, ArrowUpCircle, TrendingDown, 
    History, FileText, Plus, Search, Printer, List, X, Download, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSavings } from '../../hooks/useSavings';
import AddSaverModal from '../modals/AddSaverModal';

interface TabunganViewProps {
    students: any[];
    user: any;
}

const TabunganView: React.FC<TabunganViewProps> = ({ students, user }) => {
    const [savingsActiveTab, setSavingsActiveTab] = useState('dashboard'); // dashboard, data, setor, tarik, riwayat, rekap
    const { savingsData, setSavingsData, savingsTransactions, setSavingsTransactions, addSavingsTransaction } = useSavings();
    const [searchSavingsStudent, setSearchSavingsStudent] = useState('');
    const [selectedSavingsStudent, setSelectedSavingsStudent] = useState<any>(null);
    const [savingsAmount, setSavingsAmount] = useState(0);
    const [savingsNote, setSavingsNote] = useState('');
    const [showAddSaverModal, setShowAddSaverModal] = useState(false);
    const [newSaverId, setNewSaverId] = useState('');
    const [saverClassFilter, setSaverClassFilter] = useState('');

    const handleSavingsDeposit = async () => {
        if (!selectedSavingsStudent || savingsAmount <= 0) return;

        const result = await addSavingsTransaction({
            studentId: selectedSavingsStudent.studentId,
            accountId: selectedSavingsStudent.id,
            type: 'setor',
            amount: savingsAmount,
            date: new Date().toISOString().split('T')[0],
            description: savingsNote
        });

        if (result.success) {
            toast.success(`Setoran Rp ${savingsAmount.toLocaleString('id-ID')} berhasil disimpan!`);
        } else {
            toast.error(result.error || "Gagal menyimpan setoran");
        }
        setSelectedSavingsStudent(null);
        setSavingsAmount(0);
        setSavingsNote('');
        setSearchSavingsStudent('');
    };

    const handleSavingsWithdrawal = async () => {
        if (!selectedSavingsStudent || savingsAmount <= 0) return;
        if (savingsAmount > selectedSavingsStudent.saldo) {
            toast.error("Saldo tidak mencukupi!");
            return;
        }

        const result = await addSavingsTransaction({
            studentId: selectedSavingsStudent.studentId,
            accountId: selectedSavingsStudent.id,
            type: 'tarik',
            amount: savingsAmount,
            date: new Date().toISOString().split('T')[0],
            description: savingsNote
        });

        if (result.success) {
            toast.success(`Penarikan Rp ${savingsAmount.toLocaleString('id-ID')} berhasil diproses!`);
        } else {
            toast.error(result.error || "Gagal memproses penarikan");
        }
        setSelectedSavingsStudent(null);
        setSavingsAmount(0);
        setSavingsNote('');
        setSearchSavingsStudent('');
    };

    return (
        <div className="animate-in fade-in space-y-6">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                            <Wallet size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Tabungan Sekolah</h2>
                            <p className="text-slate-500 text-sm font-medium">Kelola simpanan dan tabungan siswa.</p>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                            { id: 'data', label: 'Data Tabungan', icon: <Users size={16} /> },
                            { id: 'setor', label: 'Setoran', icon: <ArrowUpCircle size={16} /> },
                            { id: 'tarik', label: 'Penarikan', icon: <TrendingDown size={16} /> },
                            { id: 'riwayat', label: 'Riwayat', icon: <History size={16} /> },
                            { id: 'rekap', label: 'Rekapitulasi', icon: <FileText size={16} /> },
                        ].map(tab => {
                            if (tab.id === 'data') {
                                return (
                                    <React.Fragment key="special-item-nasabah">
                                        <button
                                            onClick={() => setShowAddSaverModal(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-all shadow-sm mr-2"
                                        >
                                            <Plus size={16} />
                                            Tambah Nasabah
                                        </button>
                                        <button
                                            key={tab.id}
                                            onClick={() => setSavingsActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${savingsActiveTab === tab.id
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                                }`}
                                        >
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </button>
                                    </React.Fragment>
                                );
                            }
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSavingsActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${savingsActiveTab === tab.id
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 1. DASHBOARD RINGKASAN */}
            {savingsActiveTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-lg shadow-emerald-200 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Saldo Siswa</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {savingsData.reduce((acc, curr) => acc + curr.saldo, 0).toLocaleString('id-ID')}</h3>
                                <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                                    <Users size={12} /> {savingsData.length} Siswa Menabung
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-500 text-white p-5 rounded-3xl shadow-lg shadow-blue-200 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Setoran Hari Ini</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {savingsTransactions.filter(t => t.type === 'Setor' && t.date === new Date().toISOString().split('T')[0]).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}</h3>
                            </div>
                        </div>
                        <div className="bg-amber-500 text-white p-5 rounded-3xl shadow-lg shadow-amber-200 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">Penarikan Hari Ini</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {savingsTransactions.filter(t => t.type === 'Tarik' && t.date === new Date().toISOString().split('T')[0]).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. DATA TABUNGAN */}
            {savingsActiveTab === 'data' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Data Tabungan Siswa</h3>
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input placeholder="Cari Siswa..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b">Siswa</th>
                                    <th className="p-4 border-b">Kelas</th>
                                    <th className="p-4 border-b text-right">Saldo Saat Ini</th>
                                    <th className="p-4 border-b text-center">Status</th>
                                    <th className="p-4 border-b text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {savingsData.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">
                                            <div>{s.nama}</div>
                                            <div className="text-xs text-slate-400 font-normal">{s.nis}</div>
                                        </td>
                                        <td className="p-4 text-slate-600">{s.kelas}</td>
                                        <td className="p-4 text-right font-bold text-emerald-600">Rp {s.saldo.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => toast('Fitur Preview/Cetak Buku untuk ' + s.nama + ' akan muncul di sini.', { icon: '🖨️' })}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors"
                                                    title="Cetak Buku Tabungan"
                                                >
                                                    <Printer size={14} /> Cetak Buku
                                                </button>
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-bold transition-colors">
                                                    <List size={14} /> Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. SETORAN & PENARIKAN */}
            {(savingsActiveTab === 'setor' || savingsActiveTab === 'tarik') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                                {savingsActiveTab === 'setor' ? <ArrowUpCircle className="text-emerald-500" /> : <TrendingDown className="text-amber-500" />}
                                {savingsActiveTab === 'setor' ? 'Input Setoran Baru' : 'Input Penarikan Dana'}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Cari Siswa</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold"
                                            placeholder="Ketik Nama / NIS..."
                                            value={searchSavingsStudent}
                                            onChange={(e) => {
                                                setSearchSavingsStudent(e.target.value);
                                                if (!e.target.value) setSelectedSavingsStudent(null);
                                            }}
                                        />
                                    </div>
                                    {/* Search Results Dropdown */}
                                    {searchSavingsStudent && !selectedSavingsStudent && (
                                        <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                                            {savingsData.filter(s => s.nama.toLowerCase().includes(searchSavingsStudent.toLowerCase())).map(s => (
                                                <div key={s.id} onClick={() => setSelectedSavingsStudent(s)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{s.nama}</p>
                                                        <p className="text-xs text-slate-500">{s.kelas} • NIS: {s.nis}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400">Saldo</p>
                                                        <p className="font-bold text-emerald-600 text-sm">Rp {s.saldo.toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedSavingsStudent && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between animate-in fade-in">
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase opacity-70">Siswa Terpilih</p>
                                            <p className="font-bold text-slate-800 text-lg">{selectedSavingsStudent.nama}</p>
                                            <p className="text-sm text-slate-600">Kelas {selectedSavingsStudent.kelas} • Saldo: Rp {selectedSavingsStudent.saldo.toLocaleString('id-ID')}</p>
                                        </div>
                                        <button onClick={() => { setSelectedSavingsStudent(null); setSearchSavingsStudent(''); }} className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500"><X size={16} /></button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal</label>
                                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700"
                                            placeholder="0"
                                            value={savingsAmount}
                                            onChange={(e) => setSavingsAmount(parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan (Opsional)</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 min-h-[100px]"
                                        placeholder="Catatan tambahan..."
                                        value={savingsNote}
                                        onChange={(e) => setSavingsNote(e.target.value)}
                                    ></textarea>
                                </div>

                                <button
                                    onClick={savingsActiveTab === 'setor' ? handleSavingsDeposit : handleSavingsWithdrawal}
                                    disabled={!selectedSavingsStudent || savingsAmount <= 0}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${savingsActiveTab === 'setor' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {savingsActiveTab === 'setor' ? 'SIMPAN SETORAN' : 'PROSES PENARIKAN'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-700 mb-4">Informasi Penting</h4>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>Saldo akan langsung {savingsActiveTab === 'setor' ? 'bertambah' : 'berkurang'} setelah disimpan.</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span>Transaksi tidak dapat dihapus, hanya bisa dikoreksi oleh Admin.</span>
                                </li>
                                {savingsActiveTab === 'tarik' && (
                                    <li className="flex gap-2">
                                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span>Pastikan saldo siswa mencukupi sebelum penarikan.</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. RIWAYAT */}
            {savingsActiveTab === 'riwayat' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Riwayat Transaksi Tabungan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b">Tanggal</th>
                                    <th className="p-4 border-b">ID TRX</th>
                                    <th className="p-4 border-b">Siswa</th>
                                    <th className="p-4 border-b text-center">Jenis</th>
                                    <th className="p-4 border-b text-right">Nominal</th>
                                    <th className="p-4 border-b text-center">Petugas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {savingsTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-600">{t.date}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{t.id}</td>
                                        <td className="p-4 font-bold text-slate-700">{t.studentName}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'Setor' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.type}</span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-700">Rp {t.amount.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center text-slate-500">{t.officer}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 5. REKAPITULASI (REKAP) */}
            {savingsActiveTab === 'rekap' && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="font-bold text-xl text-slate-800">Laporan Rekapitulasi Harian</h3>
                            <p className="text-slate-500 text-sm">Ringkasan transaksi setoran dan penarikan per hari.</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                            <Download size={16} /> Unduh Excel / PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b">Tanggal</th>
                                    <th className="p-4 border-b text-right text-emerald-600">Total Setoran</th>
                                    <th className="p-4 border-b text-right text-amber-600">Total Penarikan</th>
                                    <th className="p-4 border-b text-right">Selisih (Net)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {(() => {
                                    const summary = savingsTransactions.reduce((acc, curr) => {
                                        if (!acc[curr.date]) acc[curr.date] = { setor: 0, tarik: 0 };
                                        if (curr.type === 'Setor') acc[curr.date].setor += curr.amount;
                                        if (curr.type === 'Tarik') acc[curr.date].tarik += curr.amount;
                                        return acc;
                                    }, {} as any);

                                    return Object.keys(summary).sort().reverse().map(date => (
                                        <tr key={date} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-bold text-slate-700">{date}</td>
                                            <td className="p-4 text-right font-bold text-emerald-600">Rp {summary[date].setor.toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-right font-bold text-amber-600">Rp {summary[date].tarik.toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-right font-bold text-slate-800">Rp {(summary[date].setor - summary[date].tarik).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Tambah Nasabah */}
            <AddSaverModal
                isOpen={showAddSaverModal}
                onClose={() => setShowAddSaverModal(false)}
                savingsData={savingsData}
                setSavingsData={setSavingsData}
                newSaverId={newSaverId}
                setNewSaverId={setNewSaverId}
                saverClassFilter={saverClassFilter}
                setSaverClassFilter={setSaverClassFilter}
            />
        </div>
    );
};

export default TabunganView;
