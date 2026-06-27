import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

interface ReceiptProps {
    schoolName?: string;
    schoolAddress?: string;
    schoolPhone?: string;
    schoolLogo?: string;
    transaction: {
        id: string;
        date: string;
        studentName: string;
        studentNis: string;
        studentClass: string;
        paymentName: string;
        amount: number;
        paymentMethod: string;
        status: string;
    };
    treasurerName?: string;
    treasurerTitle?: string;
    receiptFooter?: string;
}

const PrintPaymentReceipt: React.FC<ReceiptProps> = ({
    schoolName = 'SMK NU WEDA',
    schoolAddress = 'Jl. Contoh No. 123, Kota',
    schoolPhone = '(021) 1234567',
    schoolLogo,
    transaction,
    treasurerName = 'Bendahara Sekolah',
    treasurerTitle = 'Bendahara',
    receiptFooter = 'Harap simpan bukti pembayaran ini sebagai alat bukti yang sah.'
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = componentRef.current;
        if (printContent) {
            const printArea = printContent.innerHTML;
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(`
                    <html>
                    <head>
                        <title>Kuitansi Pembayaran</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: A4; margin: 15mm; }
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                        </style>
                    </head>
                    <body class="p-6 bg-white">
                        ${printArea}
                    </body>
                    </html>
                `);
                doc.close();
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    document.body.removeChild(iframe);
                }, 500);
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <>
            {/* Print Button */}
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
                <Printer size={18} />
                Cetak Kuitansi
            </button>

            {/* Printable Content (Hidden) */}
            <div ref={componentRef} className="hidden">
                <div className="max-w-[210mm] mx-auto bg-white p-8">
                    {/* Header */}
                    <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                        {schoolLogo && (
                            <img src={schoolLogo} alt="Logo Sekolah" className="w-20 h-20 mx-auto mb-3" />
                        )}
                        <h1 className="text-2xl font-bold text-slate-800">{schoolName}</h1>
                        <p className="text-sm text-slate-600">{schoolAddress}</p>
                        <p className="text-sm text-slate-600">Telp: {schoolPhone}</p>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-300 pb-2 inline-block px-8">
                            BUKTI PEMBAYARAN
                        </h2>
                    </div>

                    {/* Transaction Info */}
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-600">No. Transaksi</span>
                            <span className="font-bold text-slate-800">{transaction.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Tanggal</span>
                            <span className="font-bold text-slate-800">{formatDate(transaction.date)}</span>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-600 mb-2">PEMBAYAR DARI</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-slate-600">Nama</span>
                                <p className="font-bold text-slate-800">{transaction.studentName}</p>
                            </div>
                            <div>
                                <span className="text-slate-600">NIS</span>
                                <p className="font-bold text-slate-800">{transaction.studentNis}</p>
                            </div>
                            <div>
                                <span className="text-slate-600">Kelas</span>
                                <p className="font-bold text-slate-800">{transaction.studentClass}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-600 mb-3">RINCIAN PEMBAYARAN</h3>
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="p-3 text-left border border-slate-300 text-sm font-bold">Keterangan</th>
                                    <th className="p-3 text-right border border-slate-300 text-sm font-bold">Nominal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 border border-slate-300">{transaction.paymentName}</td>
                                    <td className="p-3 text-right border border-slate-300 font-mono font-bold">{formatCurrency(transaction.amount)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50">
                                    <td className="p-3 border border-slate-300 font-bold">TOTAL BAYAR</td>
                                    <td className="p-3 text-right border border-slate-300 font-mono font-bold text-lg">{formatCurrency(transaction.amount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Metode Pembayaran</span>
                            <span className="font-bold text-slate-800">{transaction.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mb-8 text-center">
                        <span className={`px-6 py-2 rounded-full font-bold text-lg ${transaction.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            Status: {transaction.status === 'success' ? 'LUNAS ✓' : 'PENDING'}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-slate-600 mb-8 border-t border-slate-300 pt-4">
                        {receiptFooter}
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between mt-12">
                        <div className="text-center">
                            <div className="h-16 border-b border-slate-400 mb-2"></div>
                            <p className="font-bold text-slate-800">{treasurerName}</p>
                            <p className="text-sm text-slate-600">{treasurerTitle}</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 border-b border-slate-400 mb-2"></div>
                            <p className="font-bold text-slate-800">Kepala Sekolah</p>
                            <p className="text-sm text-slate-600">{schoolName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintPaymentReceipt;
