import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

interface PrintSavingsHistoryProps {
    schoolName?: string;
    schoolAddress?: string;
    schoolLogo?: string;
    transactions: any[];
    dateRange: {
        from: string;
        to: string;
    };
    printDate?: string;
}

const PrintSavingsHistory: React.FC<PrintSavingsHistoryProps> = ({
    schoolName = 'SMK NU WEDA',
    schoolAddress = 'Jl. Contoh No. 123, Kota',
    schoolLogo,
    transactions,
    dateRange,
    printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
                        <title>Riwayat Tabungan</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: A4 landscape; margin: 15mm; }
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; font-size: 12px; }
                            th { background-color: #f8fafc; font-weight: bold; }
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
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        return tDate >= from && tDate <= to;
    });

    // Calculate totals
    const totalDeposits = filteredTransactions
        .filter(t => t.type === 'Setor' || t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = filteredTransactions
        .filter(t => t.type === 'Tarik' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <>
            {/* Print Button */}
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
                <Printer size={18} />
                Cetak Riwayat
            </button>

            {/* Printable Content (Hidden) */}
            <div ref={componentRef} className="hidden">
                <div className="max-w-[297mm] mx-auto bg-white p-8">
                    {/* Header */}
                    <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                        {schoolLogo && (
                            <img src={schoolLogo} alt="Logo Sekolah" className="w-20 h-20 mx-auto mb-3" />
                        )}
                        <h1 className="text-2xl font-bold text-slate-800">{schoolName}</h1>
                        <p className="text-sm text-slate-600">{schoolAddress}</p>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-300 pb-2 inline-block px-8">
                            RIWAYAT TRANSAKSI TABUNGAN
                        </h2>
                        <p className="text-sm text-slate-600 mt-2">
                            Periode: {formatFullDate(dateRange.from)} - {formatFullDate(dateRange.to)}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 grid grid-cols-4 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                            <p className="text-xs text-blue-600">Total Transaksi</p>
                            <p className="font-bold text-blue-700">{filteredTransactions.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                            <p className="text-xs text-green-600">Total Setoran</p>
                            <p className="font-bold text-green-700">{formatCurrency(totalDeposits)}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
                            <p className="text-xs text-red-600">Total Penarikan</p>
                            <p className="font-bold text-red-700">{formatCurrency(totalWithdrawals)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                            <p className="text-xs text-purple-600">Selisih (Net)</p>
                            <p className="font-bold text-purple-700">{formatCurrency(totalDeposits - totalWithdrawals)}</p>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="mb-6">
                        <table>
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="text-center">No</th>
                                    <th>Tanggal</th>
                                    <th>Nama Siswa</th>
                                    <th>Kelas</th>
                                    <th>Jenis</th>
                                    <th className="text-right">Nominal</th>
                                    <th className="text-right">Saldo Akhir</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center text-slate-400 italic">
                                            Tidak ada transaksi dalam periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((t, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td>{formatDate(t.date)}</td>
                                            <td>{t.studentName || '-'}</td>
                                            <td>{t.studentClass || '-'}</td>
                                            <td>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    (t.type === 'Setor' || t.type === 'deposit') 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {t.type === 'Setor' || t.type === 'deposit' ? 'SETOR' : 'TARIK'}
                                                </span>
                                            </td>
                                            <td className={`text-right font-mono ${
                                                (t.type === 'Setor' || t.type === 'deposit') 
                                                    ? 'text-green-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {(t.type === 'Setor' || t.type === 'deposit') ? '+' : '-'} {formatCurrency(t.amount)}
                                            </td>
                                            <td className="text-right font-mono font-bold">
                                                {formatCurrency(t.balanceAfter || 0)}
                                            </td>
                                            <td>{t.description || t.notes || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary */}
                    <div className="flex justify-between items-center border-t border-slate-300 pt-4">
                        <div className="text-sm text-slate-600">
                            <p>Dicetak pada: {printDate}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-bold text-slate-800">TOTAL SETOR: {formatCurrency(totalDeposits)}</p>
                            <p className="font-bold text-slate-800">TOTAL TARIK: {formatCurrency(totalWithdrawals)}</p>
                            <p className="font-bold text-purple-700">NET: {formatCurrency(totalDeposits - totalWithdrawals)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintSavingsHistory;
