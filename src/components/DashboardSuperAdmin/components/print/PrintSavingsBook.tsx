import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

interface PrintSavingsBookProps {
    schoolName?: string;
    schoolAddress?: string;
    schoolLogo?: string;
    student: {
        name: string;
        nis: string;
        class: string;
        accountNumber?: string;
        balance: number;
    };
    transactions: any[];
    printDate?: string;
}

const PrintSavingsBook: React.FC<PrintSavingsBookProps> = ({
    schoolName = 'SMK NU WEDA',
    schoolAddress = 'Jl. Contoh No. 123, Kota',
    schoolLogo,
    student,
    transactions,
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
                        <title>Buku Tabungan</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: A4; margin: 15mm; }
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
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

    const totalDeposits = transactions
        .filter(t => t.type === 'Setor' || t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
        .filter(t => t.type === 'Tarik' || t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <>
            {/* Print Button */}
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
                <Printer size={18} />
                Cetak Buku Tabungan
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
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-300 pb-2 inline-block px-8">
                            BUKU TABUNGAN
                        </h2>
                    </div>

                    {/* Student Info */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-slate-600">Nama Siswa</span>
                                <p className="font-bold text-slate-800">{student.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">NIS</span>
                                <p className="font-bold text-slate-800">{student.nis}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">Kelas</span>
                                <p className="font-bold text-slate-800">{student.class}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-600">No. Rekening</span>
                                <p className="font-bold text-slate-800">{student.accountNumber || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-center">
                            <p className="text-sm text-emerald-600">SALDO SAAT INI</p>
                            <p className="text-3xl font-bold text-emerald-700">{formatCurrency(student.balance)}</p>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="mb-6">
                        <h3 className="font-bold text-slate-800 mb-3">RIWAYAT TRANSAKSI</h3>
                        <table>
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="text-center">No</th>
                                    <th>Tanggal</th>
                                    <th>Keterangan</th>
                                    <th className="text-right">Setor</th>
                                    <th className="text-right">Tarik</th>
                                    <th className="text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-slate-400 italic">Belum ada transaksi</td>
                                    </tr>
                                ) : (
                                    transactions.map((t, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td>{formatDate(t.date)}</td>
                                            <td>{t.description || t.notes || '-'}</td>
                                            <td className="text-right font-mono text-green-600">
                                                {(t.type === 'Setor' || t.type === 'deposit') ? formatCurrency(t.amount) : '-'}
                                            </td>
                                            <td className="text-right font-mono text-red-600">
                                                {(t.type === 'Tarik' || t.type === 'withdrawal') ? formatCurrency(t.amount) : '-'}
                                            </td>
                                            <td className="text-right font-mono font-bold">
                                                {formatCurrency(t.balanceAfter || 0)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-600">TOTAL SETORAN</p>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(totalDeposits)}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-600">TOTAL PENARIKAN</p>
                            <p className="text-xl font-bold text-red-700">{formatCurrency(totalWithdrawals)}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-slate-600 border-t border-slate-300 pt-4">
                        <p>Dicetak pada: {printDate}</p>
                        <p className="mt-1">Buku ini adalah bukti resmi tabungan siswa di {schoolName}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintSavingsBook;
