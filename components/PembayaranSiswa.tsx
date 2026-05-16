import React, { useState } from 'react';
import { ChevronRight, CreditCard, History, Receipt, Calendar, CheckCircle, Clock } from 'lucide-react';
import { paymentHistoryGlobal } from '../data/sharedData';

interface PembayaranSiswaProps {
    onBack: () => void;
    user?: any; // Add user prop
}

const PembayaranSiswa: React.FC<PembayaranSiswaProps> = ({ onBack, user }) => {
    // --- SYNC DATA ---
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [unpaidBills, setUnpaidBills] = useState<any[]>([]);

    React.useEffect(() => {
        const loadFinanceData = () => {
            const studentName = user?.studentName || user?.nama;

            // 1. Load History (Sync with Admin v10)
            const rawHistory = localStorage.getItem('payments_data_v10');
            const allHistory = rawHistory ? JSON.parse(rawHistory) : paymentHistoryGlobal;
            const myHistory = allHistory.filter((p: any) =>
                p.studentName === studentName || String(p.studentId) === String(user?.id)
            );
            myHistory.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistoryData(myHistory);

            // 2. Load Bills from Admin useFinance (Sync with Admin v10)
            const rawBills = localStorage.getItem('finance_student_bills_v10');
            if (rawBills) {
                const allBills = JSON.parse(rawBills);
                const myUnpaid = allBills.filter((b: any) =>
                    (b.studentName === studentName || String(b.studentId) === String(user?.id)) &&
                    b.status !== 'Lunas'
                ).map((b: any) => ({
                    id: b.id,
                    title: b.paymentName,
                    amount: b.amount,
                    deadline: b.dueDate || '10 ' + b.period.split(' ')[0] + ' ' + b.period.split(' ')[1],
                    status: 'Belum Lunas'
                }));
                setUnpaidBills(myUnpaid);
            } else {
                setUnpaidBills([]);
            }
        };

        loadFinanceData();
    }, [user]);

    // Summary calculation
    const summary = {
        totalLimit: 5000000,
        totalPaid: historyData.reduce((acc, curr) => acc + (curr.amount || 0), 0),
        outstanding: unpaidBills.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Informasi Pembayaran (Live Sync)</h3>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] rounded-3xl p-6 text-white mb-8 shadow-lg shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-medium mb-1">Total Limit Pembayaran (Tahun Ajaran)</p>
                        <h2 className="text-3xl font-bold mb-6">{formatCurrency(summary.totalLimit)}</h2>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-[10px] text-blue-100 mb-1">Sudah Dibayar</p>
                                <p className="font-bold text-lg">{formatCurrency(summary.totalPaid)}</p>
                            </div>
                            <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                                <p className="text-[10px] text-blue-100 mb-1">Sisa Tagihan</p>
                                <p className="font-bold text-lg text-yellow-300">{formatCurrency(summary.outstanding)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unpaid Bills */}
                <div className="mb-8">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <Receipt size={18} className="text-orange-500" />
                        Rincian Tagihan Belum Lunas
                    </h4>
                    <div className="space-y-3">
                        {unpaidBills.map((bill) => (
                            <div key={bill.id} className="border border-orange-100 bg-orange-50/30 rounded-2xl p-4 flex justify-between items-center">
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">{bill.title}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={12} className="text-orange-500" />
                                        <span className="text-[10px] text-orange-600 font-medium">Jatuh Tempo: {bill.deadline}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#004AAD]">{formatCurrency(bill.amount)}</p>
                                    <span className="text-[10px] text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-bold">Unpaid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <History size={18} className="text-emerald-500" />
                        Riwayat Pembayaran
                    </h4>
                    <div className="space-y-4">
                        {historyData.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-4">Belum ada riwayat pembayaran.</p>
                        ) : (
                            historyData.map((record, idx) => (
                                <div key={idx} className="relative pl-6 pb-4 border-l border-slate-200 last:border-0 last:pb-0">
                                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-emerald-50"></div>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">{record.type || 'Pembayaran'} {record.month && record.year ? `- ${record.month} ${record.year}` : ''}</h5>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{record.method}</p>
                                                <p className="text-[10px] text-blue-500 font-bold">{record.studentName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">{formatCurrency(record.amount)}</p>
                                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">{record.status}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 border-t border-slate-50 pt-2 mt-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {record.date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PembayaranSiswa;
