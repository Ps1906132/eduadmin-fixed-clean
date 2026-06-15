import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Heart, Share2, MessageCircle, Send } from 'lucide-react';
import { broadcastsDataGlobal, multimediaSettingsGlobal, Broadcast } from '../data/sharedData';

interface ChannelSekolahSiswaProps {
    onBack: () => void;
}

const ChannelSekolahSiswa: React.FC<ChannelSekolahSiswaProps> = ({ onBack }) => {

    // --- SYNC WITH LOCAL STORAGE (SIMULATING REAL-TIME) ---
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>(broadcastsDataGlobal);
    const [settings, setSettings] = useState(multimediaSettingsGlobal);

    useEffect(() => {
        // Load initially from localStorage if exists
        const savedBroadcasts = localStorage.getItem('broadcasts_data_v10');
        const savedSettings = localStorage.getItem('multimedia_settings_v10');

        if (savedBroadcasts) setBroadcasts(JSON.parse(savedBroadcasts));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        // Periodically check for updates (Polling simulation)
        const interval = setInterval(() => {
            const b = localStorage.getItem('broadcasts_data_v10');
            const s = localStorage.getItem('multimedia_settings_v10');
            if (b) setBroadcasts(JSON.parse(b));
            if (s) setSettings(JSON.parse(s));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const activeBroadcast = broadcasts.find(b => b.status === 'Active') || broadcasts[0];

    // Helper to get YouTube ID
    const getYoutubeId = (url: string) => {
        if (!url) return 'jfKfPfyJRdk'; // Default fallback
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : 'jfKfPfyJRdk';
    };

    const VIDEO_ID = getYoutubeId(activeBroadcast?.url);

    const [viewerCount, setViewerCount] = useState(124);

    // Simulate viewer count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setViewerCount(prev => prev + Math.floor(Math.random() * 5) - 2);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-[calc(100vh-250px)] md:h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-900 text-white">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </div>
                    <div>
                        <h3 className="font-black text-sm md:text-base leading-none tracking-tight">LIVE: {settings.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">{viewerCount} MATA MEMANDANG</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main Content: Video Player */}
                <div className="flex-1 bg-black flex flex-col overflow-y-auto relative custom-scrollbar">
                    <div className="w-full aspect-video bg-black shadow-lg relative z-20 shrink-0 sticky top-0 group">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=${settings.autoplay ? 1 : 0}&rel=0&modestbranding=1`}
                            title="Live Stream Sekolah"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="p-6 md:p-8 bg-white min-h-[300px]">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded uppercase tracking-widest">LIVE</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{activeBroadcast?.category || 'KATEGORI'}</span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">{activeBroadcast?.title || 'Menyiapkan Siaran...'}</h1>

                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-8 border-b border-slate-100 pb-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                ))}
                            </div>
                            <span className="font-bold text-slate-400">Dimulai pada {activeBroadcast?.date || '-'}</span>
                        </div>

                        <div className="prose prose-slate prose-sm max-w-none">
                            <h4 className="font-bold text-slate-800 mb-2">Deskripsi Siaran:</h4>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {activeBroadcast?.description || 'Tidak ada deskripsi tambahan untuk siaran ini.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar: YouTube Live Chat Embed */}
                <div className="lg:w-80 w-full bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[450px] lg:h-auto shrink-0 relative">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <MessageCircle size={14} className="text-blue-600" /> Live Chat
                        </span>
                    </div>
                    <div className="flex-1 bg-white relative">
                        <iframe
                            src={`https://www.youtube.com/live_chat?v=${VIDEO_ID}&embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                        {/* Fallback/Note if chat fails to load on localhost */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 text-center p-8 bg-slate-50">
                            <MessageCircle size={32} className="text-slate-200 mb-4" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Membuat Koneksi Chat...<br />
                                <span className="lowercase font-medium text-slate-300 mt-2 block">(Fitur Chat membutuhkan domain yang terverifikasi di YouTube Console)</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelSekolahSiswa;
