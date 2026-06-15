import React, { useState, useEffect } from 'react';
import { ChevronRight, Wallet, ArrowUpCircle, ArrowDownCircle, History, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/db';
import type { SavingsData, SavingsTransaction } from '@/data/sharedData';

interface TabunganSiswaProps {
    onBack: () => void;
    user?: any;
}

const TabunganSiswa: React.FC<TabunganSiswaProps> = ({ onBack, user }) => {
    const [mySavings, setMySavings] = useState<SavingsData | null>(null);
    const [myTransactions, setMyTransactions] = useState<SavingsTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const studentId = user?.id || user?.studentId || '';
                if (!studentId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const resAccount = await fetch(`/api/savings_accounts?student_id=eq.${studentId}&select=*`, { headers });
                if (!resAccount.ok) {
                    throw new Error('Gagal memuat data tabungan');
                }
                const accounts = await resAccount.json();
                const account = accounts?.[0];

                if (account) {
                    const resStudent = await fetch(`/api/students?id=eq.${studentId}&select=*`, { headers });
                    const students = resStudent.ok ? await resStudent.json() : [];
                    const student = students?.[0] || {};

                    setMySavings({
                        id: account.id,
                        studentId: account.student_id,
                        nis: student.nis || '',
                        nama: student.full_name || user?.studentName || user?.nama || 'Siswa',
                        kelas: student.class_id || '',
                        saldo: account.balance,
                        status: account.status === 'active' ? 'Aktif' : 'Nonaktif'
                    });

                    const resTxs = await fetch(`/api/savings_transactions?savings_account_id=eq.${account.id}&select=*`, { headers });
                    if (resTxs.ok) {
                        const txs = await resTxs.json();
                        const mapped = txs.map((t: any) => ({
                            id: t.id,
                            studentId: t.student_id,
                            studentName: student.full_name || 'Siswa',
                            type: t.transaction_type === 'deposit' ? 'Setor' : 'Tarik',
                            amount: t.amount,
                            date: t.transaction_date || new Date().toISOString(),
                            description: t.description || '',
                            officer: t.recorded_by || 'Sistem'
                        }));
                        mapped.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setMyTransactions(mapped);
                    }
                }
            } catch (err: any) {
                toast.error('Gagal memuat data tabungan: ' + (err.message || 'Kesalahan jaringan'));
                console.error('Error loading savings:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    // Calculate Summary
    const totalDeposit = myTransactions
        .filter(t => t.type === 'Setor')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdraw = myTransactions
        .filter(t => t.type === 'Tarik')
        .reduce((sum, t) => sum + t.amount, 0);

    const summary = {
        balance: mySavings?.saldo || 0,
        totalDeposit: totalDeposit,
        totalWithdraw: totalWithdraw
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const [filter, setFilter] = useState<'all' | 'Setor' | 'Tarik'>('all');

    const filteredTransactions = myTransactions.filter(t => filter === 'all' || t.type === filter);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Tabungan Siswa</h3>
                    <p className="text-xs text-slate-500">{mySavings ? `${mySavings.nama} - ${mySavings.kelas}` : 'Data tidak ditemukan'}</p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                ) : (
                <>
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-pink-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Wallet size={20} />
                            <span className="text-sm font-medium">Saldo Tabungan</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-6">{formatCurrency(summary.balance)}</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-pink-100">
                                    <ArrowUpCircle size={14} />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">Total Masuk</span>
                                </div>
                                <p className="font-bold text-lg">{formatCurrency(summary.totalDeposit)}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-pink-100">
                                    <ArrowDownCircle size={14} />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">Total Keluar</span>
                                </div>
                                <p className="font-bold text-lg">{formatCurrency(summary.totalWithdraw)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter / Actions */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Semua Transaksi
                    </button>
                    <button
                        onClick={() => setFilter('Setor')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'Setor' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Pemasukan
                    </button>
                    <button
                        onClick={() => setFilter('Tarik')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${filter === 'Tarik' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Pengeluaran
                    </button>
                </div>

                {/* History List */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <History size={18} className="text-slate-500" />
                        Riwayat Transaksi
                    </h4>
                    <div className="space-y-3">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Belum ada transaksi</div>
                        ) : (
                            filteredTransactions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-pink-200 transition-colors shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'Setor' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                            {item.type === 'Setor' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 text-sm">{item.type === 'Setor' ? 'Setoran Tabungan' : 'Penarikan Saldo'}</h5>
                                            <p className="text-[10px] text-slate-500 font-medium">{item.date} • {item.officer}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-sm ${item.type === 'Setor' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>
                                        {item.type === 'Setor' ? '+' : '-'}{formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
};

export default TabunganSiswa;
