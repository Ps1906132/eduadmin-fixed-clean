import React, { useState } from 'react';
import { ChevronLeft, FolderInput, Save, TrendingUp, Award, ClipboardList } from 'lucide-react';

interface InputNilaiBimbelGuruProps {
    onBack: () => void;
}

const InputNilaiBimbelGuru: React.FC<InputNilaiBimbelGuruProps> = ({ onBack }) => {
    const [siswa, setSiswa] = useState('Ahmad Dahlan');
    const [tipeLaporan, setTipeLaporan] = useState('tryout');

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <FolderInput className="text-indigo-500" size={20} />
                        Input Perkembangan
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">

                {/* Siswa Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Pilih Siswa Bimbel</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={siswa}
                        onChange={(e) => setSiswa(e.target.value)}
                    >
                        <option>Ahmad Dahlan (Privat)</option>
                        <option>Budi Santoso (Privat)</option>
                    </select>
                </div>

                {/* Tipe Laporan Tabs */}
                <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
                    <button
                        onClick={() => setTipeLaporan('tryout')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipeLaporan === 'tryout' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ClipboardList size={16} /> Nilai Tryout
                    </button>
                    <button
                        onClick={() => setTipeLaporan('progress')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipeLaporan === 'progress' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <TrendingUp size={16} /> Progres Bulanan
                    </button>
                </div>

                {tipeLaporan === 'tryout' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="text-yellow-500" size={20} />
                                Hasil Tryout / Latihan
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Judul Latihan / TO</label>
                                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="Contoh: Tryout Matematika Bab 3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nilai (0-100)</label>
                                        <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-center" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                        <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-green-500" size={20} />
                                Evaluasi Bulanan
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bulan</label>
                                    <input type="month" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Catatan Perkembangan</label>
                                    <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed" placeholder="Tuliskan perkembangan siswa selama bulan ini..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Rekomendasi Belajar</label>
                                    <textarea rows={2} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed" placeholder="Saran materi yang perlu diulang..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-700/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <Save size={20} />
                        Simpan Laporan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputNilaiBimbelGuru;
