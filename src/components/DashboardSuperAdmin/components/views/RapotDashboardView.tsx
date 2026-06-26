import React from 'react';
import { 
    Book, Settings, Users, Edit, FileText, Archive, Printer, 
    TrendingUp, PieChart, Bell, Plus, Lock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RapotDashboardViewProps {
    setActiveView: (view: string) => void;
    classes: any[];
    students: any[];
    derivedClasses: any[];
    setSelectedClass: (className: string) => void;
}

const RapotDashboardView: React.FC<RapotDashboardViewProps> = ({
    setActiveView,
    classes,
    students,
    derivedClasses,
    setSelectedClass
}) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col overflow-y-auto custom-scrollbar">
            {/* Header: Info Aktif & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Book size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#1E1B4B]">Dashboard E-Rapor</h2>
                        <p className="text-slate-500 text-sm">Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear() + 1}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveView('rapot_settings')} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm" title="Pengaturan Rapor">
                        <Settings size={20} />
                    </button>
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer">
                        <option>{new Date().getFullYear()}/{new Date().getFullYear() + 1} Ganjil</option>
                        <option>{new Date().getFullYear()}/{new Date().getFullYear() + 1} Genap</option>
                    </select>
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer">
                        <option value="">Semua Kelas</option>
                        {classes.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                    </select>
                    <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer">
                        <option>Rapor Resmi (Diknas)</option>
                        <option>Rapor Yayasan</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Siswa', value: students.length, icon: <Users size={20} />, color: 'bg-blue-100 text-blue-600', sub: 'Siswa Aktif' },
                    { label: 'Rapor Terisi', value: '0%', icon: <Edit size={20} />, color: 'bg-amber-100 text-amber-600', sub: 'Dalam Proses' },
                    { label: 'Belum Lengkap', value: '0', icon: <FileText size={20} />, color: 'bg-rose-100 text-rose-600', sub: 'Siswa' },
                    { label: 'Rapor Terkunci', value: '0', icon: <Archive size={20} />, color: 'bg-purple-100 text-purple-600', sub: 'Sudah Final' },
                    { label: 'Siap Cetak', value: '0', icon: <Printer size={20} />, color: 'bg-emerald-100 text-emerald-600', sub: 'Rapor Final' },
                ].map((card, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            {idx === 1 && <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">Progress</span>}
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{card.label}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Progress Rapor per Kelas */}
                <div className="lg:col-span-2 bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-500" /> Progress Input Nilai
                        </h3>
                        <button onClick={() => setActiveView('rapot_print')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800">Cetak Rapor</button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {derivedClasses.length === 0 ? (
                            <p className="text-slate-400 text-center italic py-10">Belum ada kelas</p>
                        ) : derivedClasses.map((cls) => {
                            const progress = 0;
                            const color = 'bg-slate-300';

                            return (
                                <div key={cls.id} className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => { setSelectedClass(cls.nama); setActiveView('rapot_print'); }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                {cls.nama}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700 leading-tight">Kelas {cls.nama}</h4>
                                                <p className="text-xs text-slate-400">{cls.siswa} Siswa • Wali: {cls.wali.split(',')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-lg text-slate-800">{progress}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Charts & Notifications */}
                <div className="flex flex-col gap-6">
                    {/* Simple Chart */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex-1">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <PieChart size={18} className="text-purple-500" /> Tipe Rapor
                        </h3>
                        <div className="flex items-center justify-center py-4">
                            <div className="w-40 h-40 rounded-full relative" style={{ background: 'conic-gradient(#e2e8f0 0% 100%)' }}>
                                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                    <span className="text-2xl font-bold text-slate-700">0</span>
                                    <span className="text-xs text-slate-400">Rapor Siswa</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                                <span className="text-xs font-bold text-slate-600">0% Resmi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                                <span className="text-xs font-bold text-slate-600">0% Yayasan</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications / Status */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Bell size={18} className="text-slate-400" /> Pemberitahuan
                                <span className="flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] w-5 h-5 rounded-full shadow-sm">0</span>
                            </h3>
                        </div>
                        <div className="space-y-3 h-32 flex flex-col items-center justify-center text-slate-400">
                            <Bell size={32} className="mb-2 opacity-50" />
                            <p className="text-xs">Belum ada pemberitahuan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveView('nilai')} className="flex items-center justify-center gap-3 p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200 group">
                    <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                    <span>Input Nilai</span>
                </button>
                <button onClick={() => setActiveView('rapot_print')} className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all font-bold group">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-emerald-50 transition-colors"><Printer size={20} /></div>
                    <span>Cetak Rapor</span>
                </button>
                <button onClick={() => toast("Mengunci Nilai...", { icon: '🔒' })} className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-purple-500 hover:text-purple-600 transition-all font-bold group">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-purple-50 transition-colors"><Lock size={20} /></div>
                    <span>Kunci Nilai</span>
                </button>
                <button onClick={() => setActiveView('rapot_print')} className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all font-bold group">
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-50 transition-colors"><div className="rotate-90"><Archive size={20} /></div></div>
                    <span>Cetak Massal</span>
                </button>
            </div>
        </div>
    );
};

export default RapotDashboardView;
