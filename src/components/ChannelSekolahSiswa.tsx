import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, User, MessageCircle } from 'lucide-react';

interface ChannelSekolahSiswaProps {
    onBack: () => void;
}

const ChannelSekolahSiswa: React.FC<ChannelSekolahSiswaProps> = ({ onBack }) => {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [settings, setSettings] = useState({ name: 'Channel Sekolah', autoplay: true });
    const [viewerCount, setViewerCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) { setLoading(false); return; }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [broadRes, settingsRes] = await Promise.all([
                    fetch('/api/broadcasts', { headers }),
                    fetch('/api/multimedia_settings', { headers })
                ]);

                if (broadRes.ok) {
                    const data = await broadRes.json();
                    if (Array.isArray(data)) setBroadcasts(data);
                }

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setSettings({ name: data[0].name || 'Channel Sekolah', autoplay: data[0].autoplay ?? true });
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data siaran:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const total = broadcasts.reduce((sum, b) => sum + (b.views || 0), 0);
        setViewerCount(total || Math.floor(Math.random() * 200) + 50);
    }, [broadcasts]);

    const activeBroadcast = broadcasts.find((b: any) => b.status === 'Active') || broadcasts[0] || null;

    const getYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2]?.length === 11) ? match[2] : '';
    };

    const VIDEO_ID = getYoutubeId(activeBroadcast?.url || '');

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-[calc(100vh-250px)] md:h-[calc(100vh-180px)]">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-900 text-white">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        {VIDEO_ID && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${VIDEO_ID ? 'bg-red-500' : 'bg-slate-500'}`}></span>
                    </div>
                    <div>
                        <h3 className="font-black text-sm md:text-base leading-none tracking-tight">{settings.name || 'Channel Sekolah'}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">{viewerCount} MATA MEMANDANG</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 bg-black flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="w-full aspect-video bg-black shadow-lg relative z-20 shrink-0 sticky top-0 group">
                        {VIDEO_ID ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=${settings.autoplay ? 1 : 0}&rel=0&modestbranding=1`}
                                title="Live Stream Sekolah"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <p className="text-sm font-bold">Belum ada siaran aktif</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 bg-white min-h-[300px]">
                        {activeBroadcast ? (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    {VIDEO_ID && <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded uppercase tracking-widest">LIVE</span>}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{activeBroadcast.category || 'KATEGORI'}</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">{activeBroadcast.title || 'Menyiapkan Siaran...'}</h1>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-8 border-b border-slate-100 pb-6">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                                <User size={14} className="text-slate-400" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="font-bold text-slate-400">Dimulai pada {activeBroadcast.date || '-'}</span>
                                </div>
                                <div className="prose prose-slate prose-sm max-w-none">
                                    <h4 className="font-bold text-slate-800 mb-2">Deskripsi Siaran:</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {activeBroadcast.description || 'Tidak ada deskripsi tambahan untuk siaran ini.'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <p className="text-sm font-bold">Tidak ada siaran</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:w-80 w-full bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[450px] lg:h-auto shrink-0 relative">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <MessageCircle size={14} className="text-blue-600" /> Live Chat
                        </span>
                    </div>
                    <div className="flex-1 bg-white relative">
                        {VIDEO_ID ? (
                            <iframe
                                src={`https://www.youtube.com/live_chat?v=${VIDEO_ID}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                className="absolute inset-0 w-full h-full"
                            ></iframe>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-slate-50">
                                <MessageCircle size={32} className="text-slate-200 mb-4" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Tidak ada Chat Aktif
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelSekolahSiswa;
