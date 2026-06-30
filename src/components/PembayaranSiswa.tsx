import React, { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, History, Receipt, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mapBillStatus, isUnpaid, isPaid } from '../lib/rbac/statusMapping';

interface PembayaranSiswaProps {
    onBack: () => void;
    user?: any;
}

function formatDateSafe(dateStr: string | null | undefined): { date: string; month: string; year: string } {
    if (!dateStr) return { date: '-', month: '', year: '' };
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { date: dateStr, month: '', year: '' };
        return {
            date: dateStr,
            month: d.toLocaleString('id-ID', { month: 'long' }),
            year: d.getFullYear().toString(),
        };
    } catch {
        return { date: dateStr || '-', month: '', year: '' };
    }
}

const PembayaranSiswa: React.FC<PembayaranSiswaProps> = ({ onBack, user }) => {
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [unpaidBills, setUnpaidBills] = useState<any[]>([]);
    const [paidBills, setPaidBills] = useState<any[]>([]);
    const [totalLimit, setTotalLimit] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFinanceData = async () => {
            setLoading(true);
            try {
                const studentId = user?.studentId;
                if (!studentId) {
                    toast.error('Data siswa tidak ditemukan');
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('eduadmin_token');
                if (!token) {
                    toast.error('Sesi login habis, silakan login ulang');
                    setLoading(false);
                    return;
                }
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resBills, resPayments, resPaymentTypes] = await Promise.all([
                    fetch(`/api/student_bills?student_id=eq.${studentId}&select=*`, { headers }),
                    fetch(`/api/payment_transactions?student_id=eq.${studentId}&select=*`, { headers }),
                    fetch('/api/payment_types', { headers })
                ]);

                if (resPaymentTypes.ok) {
                    const types = await resPaymentTypes.json();
                    if (Array.isArray(types)) {
                        const sppType = types.find((pt: any) =>
                            pt.name?.toLowerCase().includes('spp')
                        );
                        if (sppType?.amount) setTotalLimit(sppType.amount);
                    }
                }

                if (resBills.ok) {
                    const bills = await resBills.json();
                    if (Array.isArray(bills)) {
                        setUnpaidBills(
                            bills.filter((b: any) => isUnpaid(b.status)).map((b: any) => ({
                                id: b.id,
                                title: b.payment_name,
                                amount: b.amount,
                                deadline: b.due_date || '',
                                status: mapBillStatus(b.status)
                            }))
                        );
                        setPaidBills(
                            bills.filter((b: any) => isPaid(b.status))
                        );
                    }
                } else {
                    toast.error('Gagal memuat data tagihan');
                }

                if (resPayments.ok) {
                    const payments = await resPayments.json();
                    if (Array.isArray(payments)) {
                        payments.sort((a: any, b: any) => {
                            const da = a.transaction_date || a.payment_date || '';
                            const db = b.transaction_date || b.payment_date || '';
                            return new Date(db).getTime() - new Date(da).getTime();
                        });
                        setHistoryData(
                            payments.map((p: any) => {
                                const fmt = formatDateSafe(p.transaction_date || p.payment_date);
                                return {
                                    amount: p.amount,
                                    date: fmt.date,
                                    type: p.type || p.payment_method || 'Pembayaran',
                                    method: p.payment_method || 'Tunai',
                                    status: 'Lunas',
                                    month: fmt.month,
                                    year: fmt.year,
                                    studentName: p.student_name || user?.studentName || user?.nama || ''
                                };
                            })
                        );
                    }
                } else {
                    toast.error('Gagal memuat riwayat pembayaran');
                }
            } catch (e) {
                console.error('Failed to load payment data from D1:', e);
                toast.error('Gagal memuat data pembayaran');
            } finally {
                setLoading(false);
            }
        };

        loadFinanceData();
    }, [user]);

    const summary = {
        totalLimit,
        totalPaid: paidBills.reduce((acc, curr) => acc + (curr.amount || 0), 0),
        outstanding: unpaidBills.reduce((acc, curr) => acc + (curr.amount || 0), 0)
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Informasi Pembayaran</h3>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                <>
                <div className="bg-gradient-to-br from-[#004AAD] to-[#0066CC] rounded-3xl p-6 text-white mb-8 shadow-lg shadow-blue-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-medium mb-1">Total Limit Pembayaran (Tahun Ajaran)</p>
                        <h2 className="text-3xl font-bold mb-6">
                            {totalLimit > 0 ? formatCurrency(totalLimit) : 'Belum diatur'}
                        </h2>

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

                <div className="mb-8">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <Receipt size={18} className="text-orange-500" />
                        Rincian Tagihan Belum Lunas
                    </h4>
                    <div className="space-y-3">
                        {unpaidBills.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-4">Tidak ada tagihan yang belum dibayar.</p>
                        ) : (
                            unpaidBills.map((bill) => (
                                <div key={bill.id} className="border border-orange-100 bg-orange-50/30 rounded-2xl p-4 flex justify-between items-center">
                                    <div>
                                        <h5 className="font-bold text-slate-800 text-sm">{bill.title}</h5>
                                        {bill.deadline && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={12} className="text-orange-500" />
                                                <span className="text-[10px] text-orange-600 font-medium">Jatuh Tempo: {bill.deadline}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#004AAD]">{formatCurrency(bill.amount)}</p>
                                        <span className="text-[10px] text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-bold">{bill.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

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
                                                <h5 className="font-bold text-slate-800 text-sm">{record.type} {record.month && record.year ? `- ${record.month} ${record.year}` : ''}</h5>
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
                </>
                )}
            </div>
        </div>
    );
};

export default PembayaranSiswa;
