import React, { useRef, useState } from 'react';
import { ArrowLeft, Printer, Search, Download, AlertCircle } from 'lucide-react';
interface CetakKartuLoginViewProps {
    setActiveView: (view: string) => void;
    students: any[];
    classes: any[];
    user?: any;
}

const CetakKartuLoginView: React.FC<CetakKartuLoginViewProps> = ({ setActiveView, students, classes, user }) => {
    // Guard: KS tidak boleh mengakses cetak kartu (kredensial login siswa)
    const role = user?.roleCode || user?.role || user?.role_type;
    const isKS = role?.toLowerCase() === 'ks';

    if (isKS) {
        return (
            <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in fade-in flex flex-col items-center justify-center">
                <AlertCircle size={64} className="text-red-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Akses Dibatasi</h2>
                <p className="text-slate-500 text-center mb-6 max-w-md">
                    Anda tidak memiliki izin untuk mengakses halaman ini. Cetak Kartu Login hanya tersedia untuk Administrator.
                </p>
                <button
                    onClick={() => setActiveView('data_siswa')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    <ArrowLeft size={18} /> Kembali ke Data Siswa
                </button>
            </div>
        );
    }

    const componentRef = useRef<HTMLDivElement>(null);
    const [selectedClass, setSelectedClass] = useState('Semua Kelas');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter students using live props
    const filteredStudents = students.filter(s => {
        const matchClass = selectedClass === 'Semua Kelas' || s.kelas === selectedClass;
        const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.nis.includes(searchQuery);
        return matchClass && matchSearch;
    });

    const uniqueClasses = ['Semua Kelas', ...classes.map(c => c.nama).sort()];

    const handlePrint = () => {
        const printContent = componentRef.current;
        if (printContent) {
            const printArea = printContent.innerHTML;
            const originalContents = document.body.innerHTML;

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
                        <title>Cetak Kartu Login</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                @page { size: A4; margin: 10mm; }
                                body { -webkit-print-color-adjust: exact; }
                                .card-container { page-break-inside: avoid; }
                            }
                        </style>
                    </head>
                    <body class="p-4 bg-white">
                        <h1 class="text-2xl font-bold text-center mb-6 uppercase">Kartu Login Siswa & Orang Tua</h1>
                        <div class="grid grid-cols-2 gap-4">
                            ${printArea}
                        </div>
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

    return (
        <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in fade-in flex flex-col">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:hidden">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={() => setActiveView('data_siswa')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="text-slate-600" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Cetak Kartu Login</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari Siswa..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {uniqueClasses.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <Printer size={18} /> Cetak Kartu
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="max-w-[210mm] mx-auto bg-white p-[10mm] shadow-xl min-h-[297mm]">
                    <div ref={componentRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredStudents.map((s, idx) => (
                            <div key={idx} className="border-2 border-slate-800 rounded-xl p-0 overflow-hidden card-container flex flex-col bg-white relative">
                                {/* Header Kartu */}
                                <div className="bg-slate-800 text-white p-3 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-800 font-bold text-xs">LOGO</div>
                                        <div>
                                            <h3 className="font-bold text-sm leading-tight uppercase">Kartu Akses Siswa</h3>
                                            <p className="text-[10px] opacity-80">SD Normal Islam Samarinda</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">KELAS {s.kelas}</p>
                                    </div>
                                </div>

                                {/* Body Kartu */}
                                <div className="p-4 flex gap-4">
                                    {/* Foto Placeholder */}
                                    <div className="w-20 h-24 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                                        <span className="text-[10px] text-center px-1">Foto 3x4</span>
                                    </div>

                                    {/* Data */}
                                    <div className="flex-1 space-y-2 text-sm">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nama Siswa</p>
                                            <p className="font-bold text-slate-800 leading-tight">{s.nama}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NIS / Username</p>
                                                <p className="font-mono bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-bold">{s.nis}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password</p>
                                                <p className="font-mono bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-bold">{s.nis}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-dashed border-slate-300">
                                            <p className="text-[10px] text-slate-500 italic">
                                                * Gunakan NIS sebagai Username dan Password untuk Login
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 text-slate-400 italic">
                            Tidak ada data siswa ditemukan untuk kriteria ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CetakKartuLoginView;
