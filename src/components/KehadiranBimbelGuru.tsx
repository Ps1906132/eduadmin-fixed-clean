import React, { useState } from 'react';
import { ChevronLeft, UserCheck, Search, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

interface KehadiranBimbelGuruProps {
    onBack: () => void;
}

const KehadiranBimbelGuru: React.FC<KehadiranBimbelGuruProps> = ({ onBack }) => {
    const [sesi, setSesi] = useState('Privat - Ahmad Dahlan');

    // Dummy Data Siswa Bimbel (Bisa satu untuk privat, atau banyak untuk kelompok)
    const siswaList = [
        { id: 1, nama: 'Ahmad Dahlan', status: 'Hadir', catatan: 'Semangat belajar tinggi' },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <UserCheck className="text-teal-500" size={20} />
                        Kehadiran Les
                    </h2>
                </div>
                <div className="bg-teal-50 text-teal-600 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1">
                    <Users size={14} /> {sesi.split('-')[0]}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">

                {/* Sesi Selector */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Pilih Sesi Bimbel</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        value={sesi}
                        onChange={(e) => setSesi(e.target.value)}
                    >
                        <option>Privat - Ahmad Dahlan (14:00)</option>
                        <option>Kelompok - Kelas 5 (16:00)</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {siswaList.map((siswa) => (
                        <div key={siswa.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                        {siswa.nama.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{siswa.nama}</h3>
                                        <p className="text-xs text-slate-400">ID: SIS-2025-001</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <button className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${siswa.status === 'Hadir' ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 bg-white text-slate-400 hover:border-green-200'}`}>
                                    <CheckCircle size={24} className={siswa.status === 'Hadir' ? 'fill-green-500 text-white' : ''} />
                                    <span className="text-xs font-bold">Hadir</span>
                                </button>
                                <button className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${siswa.status === 'Izin' ? 'border-yellow-500 bg-yellow-50 text-yellow-600' : 'border-slate-100 bg-white text-slate-400 hover:border-yellow-200'}`}>
                                    <AlertCircle size={24} className={siswa.status === 'Izin' ? 'fill-yellow-500 text-white' : ''} />
                                    <span className="text-xs font-bold">Izin/Sakit</span>
                                </button>
                                <button className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${siswa.status === 'Alpa' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-white text-slate-400 hover:border-red-200'}`}>
                                    <XCircle size={24} className={siswa.status === 'Alpa' ? 'fill-red-500 text-white' : ''} />
                                    <span className="text-xs font-bold">Tanpa Ket.</span>
                                </button>
                            </div>

                            {/* Catatan Sesi */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Catatan Perkembangan (Opsional)</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    rows={2}
                                    placeholder="Catatan khusus untuk sesi ini..."
                                    defaultValue={siswa.catatan}
                                ></textarea>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <button className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition-colors">
                        Simpan Absensi Bimbel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KehadiranBimbelGuru;
