import React, { useState, useEffect } from 'react';
import { Bell, Clock, ChevronLeft, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface NotifikasiProps {
    onBack: () => void;
    user?: any;
}

const NotifikasiSiswa: React.FC<NotifikasiProps> = ({ onBack, user }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('eduadmin_token');
                if (!token) { setLoading(false); return; }

                const res = await fetch('/api/announcements', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const mapped = data
                            .filter((a: any) => a.status === 'Terbit')
                            .filter((a: any) =>
                                a.target === 'Semua' ||
                                a.target === 'Orang Tua' ||
                                a.target === 'Siswa'
                            )
                            .map((a: any) => {
                                let type = 'info';
                                const titleNorm = (a.title || '').toLowerCase();
                                const contentNorm = (a.content || '').toLowerCase();
                                if (titleNorm.includes('peringatan') || contentNorm.includes('peringatan')) type = 'alert';
                                if (titleNorm.includes('berhasil') || contentNorm.includes('berhasil')) type = 'success';
                                if (titleNorm.includes('pembayaran') || contentNorm.includes('pembayaran')) type = 'success';

                                return {
                                    id: a.id,
                                    title: a.title || 'Informasi',
                                    message: a.content || '',
                                    date: a.publishDate || a.created_at?.split('T')[0] || '-',
                                    time: '',
                                    type,
                                    read: true
                                };
                            });

                        const sorted = mapped.sort((a, b) => {
                            if (a.date > b.date) return -1;
                            if (a.date < b.date) return 1;
                            return 0;
                        });

                        setNotifications(sorted);
                    }
                }
            } catch (err) {
                console.error('Gagal memuat notifikasi:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'alert': return <AlertTriangle size={14} className="text-red-500" />;
            default: return <Info size={14} className="text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm h-full flex flex-col items-center justify-center">
                <p className="text-slate-400">Memuat notifikasi...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                    <Bell className="text-[#004AAD]" />
                    Notifikasi
                </h2>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 pb-20">
                {notifications.map((notif) => (
                    <div key={notif.id}
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${notif.read ? 'bg-white border-slate-100 opacity-80' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-sm ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                {notif.title}
                            </h3>
                            {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <Clock size={12} />
                                {notif.date}
                            </div>
                            {getTypeIcon(notif.type)}
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Belum ada notifikasi</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotifikasiSiswa;
