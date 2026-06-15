
import React, { useState } from 'react';
import {
    LayoutDashboard, Files as FilesIcon, FileText, CreditCard, TrendingDown,
    Wallet, Printer, Settings, Calendar, Plus, X, ArrowUpCircle, UserCheck,
    CheckCircle, List, ArrowRight, Download, Search, Megaphone, Trash2, Edit, TrendingUp, Upload as UploadIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFinance } from '../../hooks/useFinance';
import { schoolSettingsGlobal } from '../../../../data/sharedData';
import LaporanView from './LaporanView';
import AddBankModal from '../modals/AddBankModal';
import AddPaymentTypeModal from '../modals/AddPaymentTypeModal';
import EditPaymentTypeModal from '../modals/EditPaymentTypeModal';
import EditYearModal from '../modals/EditYearModal';

interface KeuanganViewProps {
    students: any[];
    user?: any;
}

const KeuanganView: React.FC<KeuanganViewProps> = ({ students: rawStudents, user }) => {
    const students = Array.isArray(rawStudents) ? rawStudents : [];
    const role = user?.roleCode || user?.role || user?.role_type;
    const lowerRole = role?.toLowerCase();
    const isKeuangan = !role || lowerRole.includes('keuangan') || lowerRole.includes('tata usaha');

    // --- KEUANGAN STATE ---
    const [financeActiveTab, setFinanceActiveTab] = useState('dashboard'); // dashboard, data, tagihan, pembayaran, pengeluaran, kas, laporan, pengaturan

    // --- FINANCIAL DATA STATE (Using Custom Hook) ---
    const {
        financialYear,
        setFinancialYear,
        cashAccounts,
        setCashAccounts,
        paymentTypes,
        setPaymentTypes,
        studentBills,
        setStudentBills,
        expenses,
        setExpenses,
        paymentHistory,
        setPaymentHistory,
    } = useFinance();

    // Finance Helper States
    const [showAddPaymentTypeModal, setShowAddPaymentTypeModal] = useState(false);
    const [showEditPaymentTypeModal, setShowEditPaymentTypeModal] = useState(false);
    const [showEditYearModal, setShowEditYearModal] = useState(false);
    const [editingPaymentType, setEditingPaymentType] = useState<any>(null);
    const [newPaymentType, setNewPaymentType] = useState({ name: '', type: 'BULANAN', amount: 0, category: 'Lainnya' });
    const [searchStudentForPayment, setSearchStudentForPayment] = useState('');
    const [selectedStudentForPay, setSelectedStudentForPay] = useState<any>(null);
    const [selectedBillIds, setSelectedBillIds] = useState<(string | number)[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('Tunai');

    const [newExpense, setNewExpense] = useState({ date: '', description: '', category: 'Operasional', amount: 0 });

    // --- FINANCE SETTINGS STATE ---
    const [financeSettings, setFinanceSettings] = useState({
        treasurerName: '',
        receiptFooter: 'Harap simpan bukti pembayaran ini sebagai alat bukti yang sah.',
        waTemplate: 'Assalamualaikum Bapak/Ibu Wali Murid, kami informasikan tagihan SPP bulan ini sebesar *{nominal}*. Terima kasih.'
    });

    // State for uploaded Bill Excel file
    const [uploadedBillFile, setUploadedBillFile] = useState<File | null>(null);

    const handleDownloadBillTemplate = () => {
        // Simple CSV generation for Bill Template
        const headers = ['NO', 'NIS', 'NAMA SISWA', 'KELAS', 'JENIS TAGIHAN', 'NOMINAL', 'BULAN/TAHUN'];
        const rows = [
            ['1', '12345', 'Contoh Siswa 1', '1A', 'SPP', '150000', 'Maret 2026'],
            ['2', '67890', 'Contoh Siswa 2', '1B', 'Uang Gedung', '500000', '-']
        ];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "TEMPLATE_IMPORT_TAGIHAN.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Template Excel (CSV) berhasil didownload!");
    };
    const [expenseCategories, setExpenseCategories] = useState(['Operasional Sekolah', 'Honor Guru/Staff', 'ATK & Fotokopi', 'Konsumsi', 'Pembangunan & Sarpras', 'Listrik & Internet']);
    const [newExpenseCategory, setNewExpenseCategory] = useState('');
    const [schoolBankAccounts, setSchoolBankAccounts] = useState<any[]>([]);
    const [newBankAccount, setNewBankAccount] = useState({ bank: '', number: '', name: '' });
    const [showAddBankModal, setShowAddBankModal] = useState(false);

    // Handlers
    const handleGenerateBills = () => {
        if (students.length === 0) {
            toast.error("Data siswa kosong!");
            return;
        }

        const newBills = students.map(s => ({
            id: Date.now() + Math.random(),
            studentId: s.id,
            studentName: s.nama,
            class: s.kelas,
            paymentName: 'SPP Februari 2026',
            period: 'Februari 2026',
            amount: 150000,
            status: 'Belum Lunas'
        }));
        setStudentBills([...studentBills, ...newBills]);
        toast.success("Tagihan berhasil digenerate untuk " + students.length + " siswa!");
    };

    const handlePayBill = (bill: any) => {
        const student = students.find(s => s.id === bill.studentId);
        if (student) {
            setSelectedStudentForPay(student);
            setFinanceActiveTab('pembayaran');
            setSelectedBillIds([bill.id]);
        }
    };

    const handleSavingsDeposit = () => {
        toast.success('Simulasi Setoran Berhasil');
    };

    const handleSavingsWithdrawal = () => {
        toast.success('Simulasi Penarikan Berhasil');
    };

    return (
        <div className="animate-in fade-in space-y-6">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                            <TrendingUp size={24} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Keuangan Sekolah</h2>
                            <p className="text-slate-500 text-sm font-medium">Kelola SPP, tagihan, dan arus kas sekolah.</p>
                        </div>
                    </div>

                    {/* Scrollable Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                            { id: 'data', label: 'Data Dasar', icon: <FilesIcon size={16} /> },
                            { id: 'tagihan', label: 'Tagihan Siswa', icon: <FileText size={16} /> },
                            { id: 'pembayaran', label: 'Pembayaran', icon: <CreditCard size={16} /> },
                            { id: 'pengeluaran', label: 'Pengeluaran', icon: <TrendingDown size={16} /> },
                            { id: 'kas', label: 'Kas & Saldo', icon: <Wallet size={16} /> },
                            { id: 'laporan', label: 'Laporan', icon: <Printer size={16} /> },
                            { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setFinanceActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${financeActiveTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
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

            {/* --- TAB CONTENT --- */}

            {/* 1. DASHBOARD RINGKASAN */}
            {financeActiveTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-lg shadow-emerald-200 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Saldo Kas Saat Ini</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {cashAccounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString('id-ID')}</h3>
                                <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                                    <ArrowUpCircle size={12} /> Real-time
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-500 text-white p-5 rounded-3xl shadow-lg shadow-blue-200 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Pemasukan (Bulan Ini)</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {paymentHistory.filter(p => p.status === 'Lunas').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('id-ID')}</h3>
                                <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                                    Histori Pembayaran
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-500 text-white p-5 rounded-3xl shadow-lg shadow-amber-200 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <p className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">Pengeluaran (Bulan Ini)</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('id-ID')}</h3>
                                <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                                    Operasional & Gaji
                                </div>
                            </div>
                        </div>
                        <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-lg shadow-rose-200 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-bl-[4rem] transition-all group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <p className="text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">Total Tunggakan</p>
                                <h3 className="text-3xl font-bold mb-2">Rp {studentBills.filter(b => b.status !== 'Lunas').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('id-ID')}</h3>
                                <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg">
                                    {studentBills.filter(b => b.status !== 'Lunas').length} Tagihan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Shortcuts */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {isKeuangan && (
                            <>
                                <button onClick={() => setFinanceActiveTab('pembayaran')} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                    <span className="font-bold text-slate-700 text-sm">Terima Pembayaran</span>
                                </button>
                                <button onClick={() => setFinanceActiveTab('tagihan')} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                                    <span className="font-bold text-slate-700 text-sm">Buat Tagihan SPP</span>
                                </button>
                                <button onClick={() => setFinanceActiveTab('pengeluaran')} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><TrendingDown size={24} /></div>
                                    <span className="font-bold text-slate-700 text-sm">Catat Pengeluaran</span>
                                </button>
                            </>
                        )}
                        <button onClick={() => setFinanceActiveTab('laporan')} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Printer size={24} /></div>
                            <span className="font-bold text-slate-700 text-sm">Cetak Laporan</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 2. DATA DASAR */}
            {financeActiveTab === 'data' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tahun Ajaran */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-blue-500" /> Tahun Ajaran Aktif</h3>
                                {isKeuangan && (
                                    <button onClick={() => setShowEditYearModal(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">Ubah</button>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                <p className="text-2xl font-bold text-slate-800">{financialYear}</p>
                                <p className="text-sm text-slate-500">Semester Ganjil</p>
                            </div>
                        </div>
 
                        {/* Rekening / Kas */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Wallet size={20} className="text-emerald-500" /> Akun Kas / Bank</h3>
                                {isKeuangan && (
                                    <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+ Tambah</button>
                                )}
                            </div>
                            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                                {cashAccounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${acc.type === 'KAS' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {acc.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-sm">{acc.name}</p>
                                                <p className="text-xs text-slate-400">{acc.number}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-800">Rp {(acc.balance / 1000000).toFixed(1)}M</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
 
                    {/* Jenis Pembayaran Lists */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Jenis Pembayaran & Tarif</h3>
                                <p className="text-sm text-slate-400">Atur komponen biaya sekolah per kelas.</p>
                            </div>
                            {isKeuangan && (
                                <button onClick={() => setShowAddPaymentTypeModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                    + Tambah Jenis
                                </button>
                            )}
                        </div>
 
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="p-3 text-sm font-bold text-slate-500">Nama Pembayaran</th>
                                        <th className="p-3 text-sm font-bold text-slate-500">Tipe</th>
                                        <th className="p-3 text-sm font-bold text-slate-500">Tarif (Default)</th>
                                        {isKeuangan && <th className="p-3 text-sm font-bold text-slate-500 text-center">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentTypes.map((type) => (
                                        <tr key={type.id} className="group hover:bg-slate-50 transition-colors">
                                            <td className="p-3">
                                                <div className="font-bold text-slate-700">{type.name}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${type.type === 'BULANAN' ? 'bg-blue-100 text-blue-700' : type.type === 'TAHUNAN' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {type.type}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-slate-600">Rp {type.amount.toLocaleString('id-ID')}</td>
                                            {isKeuangan && (
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPaymentType(type);
                                                            setShowEditPaymentTypeModal(true);
                                                        }}
                                                        className="text-slate-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. TAGIHAN */}
            {financeActiveTab === 'tagihan' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">Generate Tagihan SPP</h3>
                            <p className="text-sm text-slate-500">Buat tagihan otomatis untuk seluruh siswa aktif.</p>
                        </div>
                        <div className="flex gap-3">
                            <select className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 text-sm outline-none">
                                <option>Februari 2026</option>
                                <option>Maret 2026</option>
                                <option>April 2026</option>
                            </select>
                            {isKeuangan ? (
                                <button onClick={handleGenerateBills} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                                    Generate Sekarang
                                </button>
                            ) : (
                                <button disabled className="px-6 py-2 bg-slate-300 text-white rounded-xl font-bold cursor-not-allowed">
                                    Generate Sekarang
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Import Section */}
                    {isKeuangan && (
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-blue-800 text-sm">Import Data Tagihan (Excel)</h4>
                                    <p className="text-xs text-blue-600">Gunakan fitur ini untuk upload tagihan massal dari file Excel.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownloadBillTemplate}
                                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        <Download size={16} /> Template
                                    </button>
                                    <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 cursor-pointer">
                                        <UploadIcon size={16} /> Pilih File
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setUploadedBillFile(e.target.files[0]);
                                                    toast.success(`File ${e.target.files[0].name} terpilih!`);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Show selected file and save button */}
                            {uploadedBillFile && (
                                <div className="mt-4 p-4 bg-white rounded-2xl border border-blue-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText size={20} className="text-blue-600" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-bold text-slate-700 truncate">{uploadedBillFile.name}</p>
                                                <p className="text-[10px] text-slate-400">{(uploadedBillFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setUploadedBillFile(null)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const loadingToast = toast.loading('Memproses data tagihan...');
                                            // Mock processing
                                            setTimeout(() => {
                                                toast.dismiss(loadingToast);
                                                handleGenerateBills(); // Reuse generate logic as mock import
                                                toast.success(`Berhasil mengimport data tagihan dari ${uploadedBillFile.name}`);
                                                setUploadedBillFile(null);
                                            }, 1500);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                    >
                                        <CheckCircle size={18} /> Simpan Data Tagihan
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Table Tagihan */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Daftar Tagihan Siswa</h3>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input placeholder="Cari Siswa..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b">Siswa</th>
                                    <th className="p-4 border-b text-center">Kelas</th>
                                    <th className="p-4 border-b">Jenis Tagihan</th>
                                    <th className="p-4 border-b">Bulan/Tahun</th>
                                    <th className="p-4 border-b text-right">Nominal</th>
                                    <th className="p-4 border-b text-center">Status</th>
                                    <th className="p-4 border-b text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {studentBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{bill.studentName}</td>
                                        <td className="p-4 text-center text-slate-500">{bill.class}</td>
                                        <td className="p-4 text-slate-600">{bill.paymentName}</td>
                                        <td className="p-4 text-slate-600">{bill.period}</td>
                                        <td className="p-4 text-right font-mono text-slate-700">Rp {bill.amount.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            {bill.status === 'Lunas' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">Lunas</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">Belum Lunas</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {bill.status !== 'Lunas' ? (
                                                isKeuangan ? (
                                                    <button onClick={() => handlePayBill(bill)} className="text-blue-600 hover:underline font-bold text-xs">Bayar</button>
                                                ) : (
                                                    <button disabled className="text-slate-400 font-bold text-xs cursor-not-allowed">Belum Lunas</button>
                                                )
                                            ) : (
                                                <button className="text-slate-400 hover:text-blue-500 font-bold text-xs">Cetak</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. PEMBAYARAN (IMPORTANT) */}
            {financeActiveTab === 'pembayaran' && (
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <h3 className="font-bold text-2xl text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200"><CreditCard size={24} /></div>
                            Transaksi Pembayaran Baru
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                            {/* Step 1: Cari Siswa */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-500 uppercase">1. Cari Data Siswa</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ketik Nama / NIS..."
                                        value={searchStudentForPayment}
                                        onChange={(e) => {
                                            setSearchStudentForPayment(e.target.value);
                                            // Auto-select student if exact match found
                                            const student = students.find(s =>
                                                s.nama.toLowerCase().includes(e.target.value.toLowerCase()) ||
                                                s.nis.includes(e.target.value)
                                            );
                                            if (student && (student.nama.toLowerCase() === e.target.value.toLowerCase() || student.nis === e.target.value)) {
                                                setSelectedStudentForPay(student);
                                            }
                                        }}
                                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-lg"
                                    />
                                </div>
                                {/* Dynamic Student Result */}
                                {selectedStudentForPay ? (
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 border border-blue-200">
                                            {selectedStudentForPay.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{selectedStudentForPay.nama}</h4>
                                            <p className="text-xs text-blue-600 font-bold">Kelas {selectedStudentForPay.kelas} • NIS: {selectedStudentForPay.nis}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-400">
                                        <p className="text-sm">Masukkan nama atau NIS siswa</p>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Pilih Tagihan */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-500 uppercase">2. Pilih Tagihan (Belum Lunas)</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedStudentForPay ? (
                                        studentBills
                                            .filter(bill => bill.studentId === selectedStudentForPay.id && bill.status === 'Belum Lunas')
                                            .map(bill => (
                                                <div
                                                    key={bill.id}
                                                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedBillIds.includes(bill.id)
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-blue-400 bg-white'
                                                        }`}
                                                    onClick={() => {
                                                        if (selectedBillIds.includes(bill.id)) {
                                                            setSelectedBillIds(selectedBillIds.filter(id => id !== bill.id));
                                                        } else {
                                                            setSelectedBillIds([...selectedBillIds, bill.id]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700">{bill.paymentName}</span>
                                                        <span className="font-bold text-slate-800">Rp {bill.amount.toLocaleString('id-ID')}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400">{bill.period}</p>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-400">
                                            <p className="text-sm">Pilih siswa terlebih dahulu</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Konfirmasi & Bayar */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-500 uppercase">3. Metode & Eksekusi</label>
                                <div className="p-5 bg-slate-800 rounded-2xl text-white">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
                                        <span>Total Bayar</span>
                                        <span className="text-2xl font-bold text-emerald-400">
                                            Rp {studentBills
                                                .filter(bill => selectedBillIds.includes(bill.id))
                                                .reduce((total, bill) => total + bill.amount, 0)
                                                .toLocaleString('id-ID')}
                                            ,-
                                        </span>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payMethod"
                                                value="Tunai"
                                                checked={paymentMethod === 'Tunai'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 accent-emerald-500"
                                            />
                                            <span className="text-sm font-medium">Tunai / Cash</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payMethod"
                                                value="Transfer"
                                                checked={paymentMethod === 'Transfer'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 accent-emerald-500"
                                            />
                                            <span className="text-sm font-medium">Transfer Bank</span>
                                        </label>
                                    </div>
                                    {isKeuangan ? (
                                        <button
                                            onClick={() => {
                                                if (selectedBillIds.length > 0 && selectedStudentForPay) {
                                                    // Process payment
                                                    const updatedBills = studentBills.map(bill =>
                                                        selectedBillIds.includes(bill.id)
                                                            ? { ...bill, status: 'Lunas' as const }
                                                            : bill
                                                    );
                                                    setStudentBills(updatedBills);

                                                    // Add to Payment History for Global Sync
                                                    const paidBills = studentBills.filter(bill => selectedBillIds.includes(bill.id));
                                                    const newHistoryRecords = paidBills.map(bill => ({
                                                        id: Date.now() + Math.random(),
                                                        studentId: selectedStudentForPay.id,
                                                        studentName: selectedStudentForPay.nama,
                                                        paymentName: bill.paymentName,
                                                        amount: bill.amount,
                                                        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                                                        method: paymentMethod,
                                                        status: 'Lunas',
                                                        month: bill.period.split(' ')[0],
                                                        year: bill.period.split(' ')[1]
                                                    }));

                                                    setPaymentHistory([...newHistoryRecords, ...paymentHistory]);

                                                    toast.success(`Pembayaran berhasil untuk ${selectedBillIds.length} tagihan!`);
                                                    setSelectedBillIds([]);
                                                    setSelectedStudentForPay(null);
                                                    setSearchStudentForPayment('');
                                                } else {
                                                    toast.error('Pilih siswa dan tagihan terlebih dahulu!');
                                                }
                                            }}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/50"
                                        >
                                            PROSES PEMBAYARAN
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-3 bg-slate-600 text-slate-400 font-bold rounded-xl cursor-not-allowed"
                                        >
                                            PROSES PEMBAYARAN (READ-ONLY)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Transaksi Terakhir */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-3">Riwayat Transaksi Terakhir</h4>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Siswa</th>
                                        <th className="p-3">Pembayaran</th>
                                        <th className="p-3 text-right">Nominal</th>
                                        <th className="p-3 text-center">Cetak</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paymentHistory.slice(0, 5).map((record, i) => (
                                        <tr key={i}>
                                            <td className="p-3 font-mono text-xs text-slate-500">TRX-{String(record.id).slice(-4)}</td>
                                            <td className="p-3 font-medium">{record.studentName}</td>
                                            <td className="p-3">{record.paymentName}</td>
                                            <td className="p-3 text-right font-bold text-emerald-600">Rp {record.amount.toLocaleString('id-ID')}</td>
                                            <td className="p-3 text-center"><button className="text-slate-400 hover:text-blue-500"><Printer size={14} /></button></td>
                                        </tr>
                                    ))}
                                    {paymentHistory.length === 0 && (
                                        <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">Belum ada transaksi pembayaran.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. PENGELUARAN */}
            {financeActiveTab === 'pengeluaran' && (
                <div className="space-y-6">
                    {/* Catat Pengeluaran Baru */}
                    {isKeuangan && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Catat Pengeluaran Baru</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500"
                                    >
                                        <option>Operasional Sekolah</option>
                                        <option>Honor Guru/Staff</option>
                                        <option>ATK & Fotokopi</option>
                                        <option>Konsumsi</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Beli Kertas A4"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newExpense.amount || ''}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseInt(e.target.value) || 0 })}
                                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            if (newExpense.amount > 0 && newExpense.description) {
                                                const exp = {
                                                    id: Date.now(),
                                                    date: newExpense.date || new Date().toISOString().split('T')[0],
                                                    description: newExpense.description,
                                                    category: newExpense.category,
                                                    amount: newExpense.amount,
                                                    proof: 'file.jpg' // mock
                                                };
                                                setExpenses([exp, ...expenses]);
                                                setNewExpense({ date: '', description: '', category: 'Operasional', amount: 0 });
                                                toast.success("Pengeluaran berhasil disimpan!");
                                            } else {
                                                toast.error("Mohon isi keterangan dan nominal!");
                                            }
                                        }}
                                        className="w-full p-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Pengeluaran */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Daftar Pengeluaran Bulan Ini</h3>
                            <span className="font-bold text-amber-600 text-lg">Total: Rp {expenses.reduce((acc, cur) => acc + cur.amount, 0).toLocaleString('id-ID')}</span>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
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
                                    <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">Belum ada data pengeluaran bulan ini.</td></tr>
                                ) : (
                                    expenses.map((exp) => (
                                        <tr key={exp.id}>
                                            <td className="p-3 text-slate-600">{exp.date}</td>
                                            <td className="p-3 font-medium text-slate-800">{exp.description}</td>
                                            <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">{exp.category}</span></td>
                                            <td className="p-3 text-right font-bold text-slate-800">Rp {exp.amount.toLocaleString('id-ID')}</td>
                                            <td className="p-3 text-center text-blue-500 text-xs hover:underline cursor-pointer">Lihat</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 6. KAS & SALDO */}
            {financeActiveTab === 'kas' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><ArrowUpCircle size={32} /></div>
                            <h3 className="text-xl font-bold text-slate-800">Total Pemasukan</h3>
                            <p className="text-3xl font-bold text-emerald-500 mt-2">
                                Rp {paymentHistory.filter(p => p.status === 'Lunas').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Tahun Ajaran Ini</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-64 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4"><TrendingDown size={32} /></div>
                            <h3 className="text-xl font-bold text-slate-800">Total Pengeluaran</h3>
                            <p className="text-3xl font-bold text-amber-500 mt-2">
                                Rp {expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">Tahun Ajaran Ini</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-blue-200 shadow-lg text-center">
                        <h3 className="text-lg font-bold text-slate-600 mb-2">SALDO AKHIR (Real-time)</h3>
                        <p className="text-5xl font-bold text-[#1E1B4B]">
                            Rp {cashAccounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-slate-400 mt-4">Merupakan selisih total pemasukan dan pengeluaran.</p>
                    </div>
                </div>
            )}

            {/* 7. LAPORAN */}
            {financeActiveTab === 'laporan' && (
                <div className="animate-in fade-in">
                    <LaporanView />
                </div>
            )}

            {/* 8. PENGATURAN KEUANGAN */}
            {financeActiveTab === 'pengaturan' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                    {/* KOLOM KIRI */}
                    <div className="space-y-8">
                        {/* Kuitansi & Bendahara */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><UserCheck size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Personalisasi Kuitansi</h3>
                                    <p className="text-sm text-slate-500">Data yang tampil di bukti pembayaran.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Bendahara / Staff Keuangan</label>
                                    <input
                                        type="text"
                                        value={financeSettings.treasurerName}
                                        onChange={(e) => setFinanceSettings({ ...financeSettings, treasurerName: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Footer Kuitansi</label>
                                    <textarea
                                        value={financeSettings.receiptFooter}
                                        onChange={(e) => setFinanceSettings({ ...financeSettings, receiptFooter: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 font-medium"
                                    ></textarea>
                                </div>
                                <button onClick={() => toast.success("Pengaturan kuitansi disimpan!")} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>

                        {/* Rekening Bank */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><CreditCard size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800">Rekening Sekolah</h3>
                                        <p className="text-sm text-slate-500">Opsi pembayaran transfer.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAddBankModal(true)}
                                    className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold transition-colors"
                                >
                                    + Tambah
                                </button>
                            </div>
                            <div className="space-y-3">
                                {schoolBankAccounts.map(acc => (
                                    <div key={acc.id} className="p-4 border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-emerald-300 transition-colors bg-slate-50">
                                        <div>
                                            <p className="font-bold text-emerald-700">{acc.bank} - {acc.number}</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase">{acc.name}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSchoolBankAccounts(schoolBankAccounts.filter(a => a.id !== acc.id));
                                                toast.success("Rekening dihapus.");
                                            }}
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {schoolBankAccounts.length === 0 && <p className="text-slate-400 italic text-center text-sm py-4">Belum ada rekening terdaftar.</p>}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN */}
                    <div className="space-y-8">
                        {/* Kategori Pengeluaran */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><FilesIcon size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800">Kategori Pengeluaran</h3>
                                    <p className="text-sm text-slate-500">Kelola master data kategori.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Nama Kategori Baru..."
                                    value={newExpenseCategory}
                                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                                    className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newExpenseCategory) {
                                            setExpenseCategories([...expenseCategories, newExpenseCategory]);
                                            setNewExpenseCategory('');
                                            toast.success("Kategori ditambahkan!");
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newExpenseCategory) {
                                            setExpenseCategories([...expenseCategories, newExpenseCategory]);
                                            setNewExpenseCategory('');
                                            toast.success("Kategori ditambahkan!");
                                        }
                                    }}
                                    className="bg-amber-500 text-white px-4 rounded-xl font-bold hover:bg-amber-600"
                                >
                                    <Plus />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {expenseCategories.map((cat, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold border border-slate-200 flex items-center gap-2 group">
                                        {cat}
                                        <button
                                            onClick={() => setExpenseCategories(expenseCategories.filter((_, i) => i !== idx))}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Notifikasi WA */}

                    </div>
                </div>
            )}

            {/* MODALS */}
            {showAddPaymentTypeModal && (
                <AddPaymentTypeModal
                    isOpen={showAddPaymentTypeModal}
                    onClose={() => setShowAddPaymentTypeModal(false)}
                    paymentTypes={paymentTypes}
                    setPaymentTypes={setPaymentTypes}
                    newPaymentType={newPaymentType}
                    setNewPaymentType={setNewPaymentType}
                />
            )}

            {showEditPaymentTypeModal && editingPaymentType && (
                <EditPaymentTypeModal
                    isOpen={showEditPaymentTypeModal}
                    onClose={() => setShowEditPaymentTypeModal(false)}
                    editingPaymentType={editingPaymentType}
                    setEditingPaymentType={setEditingPaymentType}
                    paymentTypes={paymentTypes}
                    setPaymentTypes={setPaymentTypes}
                />
            )}

            {showEditYearModal && (
                <EditYearModal
                    isOpen={showEditYearModal}
                    onClose={() => setShowEditYearModal(false)}
                    financialYear={financialYear}
                    setFinancialYear={setFinancialYear}
                />
            )}

            {showAddBankModal && (
                <AddBankModal
                    isOpen={showAddBankModal}
                    onClose={() => setShowAddBankModal(false)}
                    newBankAccount={newBankAccount}
                    setNewBankAccount={setNewBankAccount}
                    schoolBankAccounts={schoolBankAccounts}
                    setSchoolBankAccounts={setSchoolBankAccounts}
                />
            )}
        </div>
    );
};

export default KeuanganView;
