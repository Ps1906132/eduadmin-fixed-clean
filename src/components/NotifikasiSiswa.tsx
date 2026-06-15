import React from 'react';
import { Bell, Clock, ChevronLeft, CheckCircle } from 'lucide-react';

interface NotifikasiProps {
    onBack: () => void;
}

const NotifikasiSiswa: React.FC<NotifikasiProps> = ({ onBack }) => {
    // Dummy Data Notifikasi
    const notifications = [
        {
            id: 1,
            title: 'Pembayaran SPP Berhasil',
            message: 'Pembayaran SPP bulan Januari 2025 telah berhasil diverifikasi.',
            date: 'Hari ini',
            time: '10:30',
            type: 'success',
            read: false
        },
        {
            id: 2,
            title: 'Peringatan Hari Santri',
            message: 'Besok hari santri dimohon kepada siswa-siswi memakai pakaian islami.',
            date: 'Kemarin',
            time: '08:00',
            type: 'info',
            read: true
        },
        {
            id: 3,
            title: 'Jadwal Ujian Semester',
            message: 'Jadwal ujian semester ganjil telah terbit. Silakan cek menu Jadwal Ujian.',
            date: '20 Okt 2025',
            time: '14:15',
            type: 'alert',
            read: true
        }
    ];

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                    <Bell className="text-[#004AAD]" />
                    Notifikasi
                </h2>
            </div>

            {/* List Notifikasi */}
            <div className="space-y-4 overflow-y-auto pr-2 pb-20">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${notif.read
                                ? 'bg-white border-slate-100 opacity-80'
                                : 'bg-blue-50/50 border-blue-100 shadow-sm'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-sm ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                {notif.title}
                            </h3>
                            {!notif.read && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                            {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <Clock size={12} />
                                {notif.date} • {notif.time}
                            </div>
                            {notif.type === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Belum ada notifikasi baru</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotifikasiSiswa;
