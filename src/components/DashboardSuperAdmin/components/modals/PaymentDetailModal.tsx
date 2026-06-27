import React from 'react';
import { X, FileText, Printer, Download } from 'lucide-react';

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: string;
        name: string;
        nis: string;
        class: string;
    } | null;
    bills: any[];
    installments: any[];
    paymentHistory: any[];
    onPrint?: () => void;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
    isOpen,
    onClose,
    student,
    bills,
    installments,
    paymentHistory,
    onPrint
}) => {
    if (!isOpen || !student) return null;

    const studentBills = bills.filter(b => b.studentId === student.id);
    const totalBills = studentBills.reduce((sum, b) => sum + b.amount, 0);
    const paidBills = studentBills.filter(b => b.status === 'Lunas');
    const unpaidBills = studentBills.filter(b => b.status !== 'Lunas');
    const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0);
    const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

    const studentPayments = paymentHistory.filter((p: any) => p.student_id === student.id);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                                <p className="text-slate-500">NIS: {student.nis} | Kelas: {student.class}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {onPrint && (
                                <button
                                    onClick={onPrint}
                                    className="p-2 bg-white rounded-xl hover:bg-slate-100 transition-colors"
                                    title="Cetak"
                                >
                                    <Printer size={20} className="text-slate-600" />
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
                                <X size={24} className="text-slate-400 hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-600 mb-1">Total Tagihan</p>
                            <p className="text-2xl font-bold text-blue-700">{studentBills.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                            <p className="text-xs font-bold text-green-600 mb-1">Lunas</p>
                            <p className="text-2xl font-bold text-green-700">{paidBills.length}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <p className="text-xs font-bold text-red-600 mb-1">Belum Lunas</p>
                            <p className="text-2xl font-bold text-red-700">{unpaidBills.length}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <p className="text-xs font-bold text-amber-600 mb-1">Sisa Bayar</p>
                            <p className="text-xl font-bold text-amber-700">Rp {totalUnpaid.toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    {/* Bills Table */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-blue-500" />
                            Daftar Tagihan
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="p-3">Jenis Tagihan</th>
                                        <th className="p-3">Periode</th>
                                        <th className="p-3 text-right">Nominal</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentBills.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                                Belum ada tagihan
                                            </td>
                                        </tr>
                                    ) : (
                                        studentBills.map((bill) => (
                                            <tr key={bill.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium text-slate-700">{bill.paymentName}</td>
                                                <td className="p-3 text-slate-600">{bill.period}</td>
                                                <td className="p-3 text-right font-mono text-slate-700">
                                                    Rp {bill.amount.toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {bill.status === 'Lunas' ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                                                            Lunas
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">
                                                            Belum Lunas
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment History */}
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-green-500" />
                            Riwayat Pembayaran
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="p-3">Tanggal</th>
                                        <th className="p-3">Jenis</th>
                                        <th className="p-3 text-right">Nominal</th>
                                        <th className="p-3">Metode</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {studentPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                                Belum ada riwayat pembayaran
                                            </td>
                                        </tr>
                                    ) : (
                                        studentPayments.slice(0, 10).map((payment: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-3 text-slate-600">{payment.payment_date || payment.transaction_date}</td>
                                                <td className="p-3 font-medium text-slate-700">{payment.type || payment.notes}</td>
                                                <td className="p-3 text-right font-mono text-green-600">
                                                    + Rp {(payment.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-3 text-slate-600">{payment.payment_method || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailModal;
