import React from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface JadwalBimbelGuruProps {
    onBack: () => void;
    user?: any;
}

const JadwalBimbelGuru: React.FC<JadwalBimbelGuruProps> = ({ onBack, user }) => {
    // Dummy Data Jadwal Bimbel
    const jadwal = [
        { id: 1, hari: 'Senin', jam: '14:00 - 15:30', tipe: 'Privat', siswa: 'Ahmad Dahlan', mapel: 'Matematika', status: 'Selesai' },
        { id: 2, hari: 'Senin', jam: '16:00 - 17:30', tipe: 'Kelompok', siswa: 'Kelas 5 (5 Siswa)', mapel: 'Tematik', status: 'Akan Datang' },
        { id: 3, hari: 'Selasa', jam: '14:00 - 15:30', tipe: 'Privat', siswa: 'Budi Santoso', mapel: 'B. Inggris', status: 'Akan Datang' },
        { id: 4, hari: 'Rabu', jam: '16:00 - 17:30', tipe: 'Kelompok', siswa: 'Kelas 6 (Persiapan US)', mapel: 'Matematika', status: 'Akan Datang' },
        { id: 5, hari: 'Kamis', jam: '15:30 - 17:00', tipe: 'Privat', siswa: 'Citra Kirana', mapel: 'Calistung', status: 'Akan Datang' },
    ];

    const getHariColor = (hari: string) => {
        switch (hari) {
            case 'Senin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Selasa': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Rabu': return 'bg-green-100 text-green-700 border-green-200';
            case 'Kamis': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Jumat': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Jadwal Mengajar {user?.nama ? user.nama.split(',')[0] : 'Saya'}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                <div className="grid gap-4">
                    {jadwal.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                            {/* Status Indicator Stripe */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'Selesai' ? 'bg-slate-300' : 'bg-blue-500'}`}></div>

                            <div className="flex items-start gap-4 pl-2">
                                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${getHariColor(item.hari)} shrink-0`}>
                                    <span className="text-xs font-bold uppercase">{item.hari.substring(0, 3)}</span>
                                    <span className="text-xl font-bold">{item.jam.substring(0, 2)}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${item.tipe === 'Privat' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.tipe}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">• {item.mapel}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.siswa}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                        <Clock size={14} /> <span>{item.jam}</span>
                                    </div>
                                </div>
                            </div>

                            <button className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${item.status === 'Selesai' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
                                {item.status === 'Selesai' ? 'Selesai' : 'Mulai Sesi'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JadwalBimbelGuru;
