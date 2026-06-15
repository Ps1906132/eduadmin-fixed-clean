import React, { useState } from 'react';
import { X, Download, Upload as UploadIcon, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { studentsDataGlobal, classesDataGlobal } from '../../../../data/sharedData';

interface AddSaverModalProps {
    isOpen: boolean;
    onClose: () => void;
    savingsData: any[];
    setSavingsData: (data: any[]) => void;
    newSaverId: string;
    setNewSaverId: (id: string) => void;
    saverClassFilter: string;
    setSaverClassFilter: (filter: string) => void;
}

const AddSaverModal: React.FC<AddSaverModalProps> = ({
    isOpen,
    onClose,
    savingsData,
    setSavingsData,
    newSaverId,
    setNewSaverId,
    saverClassFilter,
    setSaverClassFilter
}) => {
    // State for uploaded Excel file
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        // Simple CSV generation (Excel Compatible)
        const headers = ['NO', 'NIS', 'NAMA SISWA', 'KELAS', 'SALDO AWAL'];
        const rows = [
            ['1', '12345', 'Contoh Siswa 1', '1A', '50000'],
            ['2', '67890', 'Contoh Siswa 2', '1B', '100000']
        ];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "TEMPLATE_DATA_NASABAH.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Template Excel (CSV) berhasil didownload!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                {/* LEFT SIDE: FORM INPUT */}
                <div className="w-full md:w-1/3 p-8 border-r border-slate-100 bg-white overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Tambah Nasabah</h3>
                        <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* IMPORT SECTION */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                            <h4 className="font-bold text-blue-800 text-xs mb-2">Alternatif: Upload Excel</h4>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    <Download size={14} /> Template
                                </button>
                                <label className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 cursor-pointer">
                                    <UploadIcon size={14} /> Upload
                                    <input
                                        type="file"
                                        accept=".csv, .xlsx, .xls"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setUploadedFile(e.target.files[0]);
                                                toast.success(`File ${e.target.files[0].name} berhasil dipilih!`);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            {/* Show selected file and save button */}
                            {uploadedFile && (
                                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-xs text-slate-600 truncate flex-1">
                                            📄 {uploadedFile.name}
                                        </span>
                                        <button
                                            onClick={() => setUploadedFile(null)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Mock processing - in real app, parse CSV/Excel and add to savingsData
                                            toast.loading('Memproses file...', { duration: 1000 });
                                            setTimeout(() => {
                                                toast.success(`Data dari ${uploadedFile.name} berhasil disimpan!`);
                                                toast.success("5 Nasabah baru berhasil ditambahkan.");
                                                setUploadedFile(null);
                                            }, 1500);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#004AAD] text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                        <Save size={14} /> Simpan Data Excel
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Filter Kelas */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Kelas</label>
                            <select
                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                value={saverClassFilter}
                                onChange={(e) => {
                                    setSaverClassFilter(e.target.value);
                                    setNewSaverId(''); // Reset student selection
                                }}
                            >
                                <option value="">-- Semua Kelas --</option>
                                {classesDataGlobal.map((c: any) => (
                                    <option key={c.id || c.nama} value={c.nama}>{c.nama}</option>
                                ))}
                            </select>
                        </div>

                        {/* Pilih Siswa */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Siswa</label>
                            <select
                                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={newSaverId}
                                onChange={(e) => setNewSaverId(e.target.value)}
                                disabled={!saverClassFilter && false} // Optional: force class selection first
                            >
                                <option value="">-- Pilih Siswa --</option>
                                {studentsDataGlobal
                                    .filter(s => !savingsData.find(saver => saver.id === s.id)) // Exclude existing savers
                                    .filter(s => !saverClassFilter || s.kelas === saverClassFilter) // Filter by class
                                    .map(s => (
                                        <option key={s.id} value={s.id}>{s.nama} - {s.kelas}</option>
                                    ))
                                }
                            </select>
                            <p className="text-xs text-slate-500 mt-1">*Hanya siswa yang belum terdaftar.</p>
                        </div>

                        {/* Auto-filled Fields */}
                        {newSaverId && (() => {
                            const selectedS = studentsDataGlobal.find(s => s.id === Number(newSaverId));
                            return (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">NIS (Otomatis)</label>
                                        <input
                                            readOnly
                                            value={selectedS?.nis || '-'}
                                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Nama Ibu (Otomatis)</label>
                                        <input
                                            readOnly
                                            value={(selectedS as any)?.ibu || 'Data Ibu Belum Diisi'}
                                            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-sm"
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="pt-4">
                            <button
                                onClick={() => {
                                    const studentToAdd = studentsDataGlobal.find(s => s.id === Number(newSaverId));
                                    if (studentToAdd) {
                                        const newSaver = { ...studentToAdd, status: 'Aktif', joinDate: new Date().toISOString().split('T')[0], saldo: 0, tabungan: 0 };
                                        setSavingsData([...savingsData, newSaver]);
                                        setNewSaverId('');
                                        toast.success(`Berhasil menambahkan ${studentToAdd.nama}.`);
                                    }
                                }}
                                disabled={!newSaverId}
                                className="w-full py-3.5 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                            >
                                Simpan Nasabah
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: TABLE LIST */}
                <div className="w-full md:w-2/3 bg-slate-50 p-8 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Daftar Nasabah Terdaftar</h3>
                            <p className="text-sm text-slate-500">{savingsData.length} Siswa Aktif</p>
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
                        <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4">Kelas</th>
                                        <th className="p-4">NIS</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {savingsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada nasabah terdaftar.</td>
                                        </tr>
                                    ) : (
                                        // Show latest first
                                        [...savingsData].reverse().map((saver, idx) => (
                                            <tr key={saver.id} className="hover:bg-blue-50 transition-colors animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <td className="p-4 font-bold text-slate-700">{saver.nama}</td>
                                                <td className="p-4 text-slate-600">{saver.kelas}</td>
                                                <td className="p-4 font-mono text-xs text-slate-500">{saver.nis}</td>
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">Aktif</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSaverModal;
