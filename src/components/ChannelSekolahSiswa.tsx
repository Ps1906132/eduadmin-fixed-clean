import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, MessageCircle } from 'lucide-react';

interface ChannelSekolahSiswaProps {
    onBack: () => void;
}

interface VideoItem {
    id: string;
    title: string;
    youtubeUrl: string;
    thumbnail: string;
    description: string;
}

interface AnnouncementItem {
    id: string;
    title: string;
    content: string;
    category: string;
    status: string;
    publishDate: string;
    viewers: number;
}

const ChannelSekolahSiswa: React.FC<ChannelSekolahSiswaProps> = ({ onBack }) => {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
    const [settings, setSettings] = useState({ name: 'Channel Sekolah', autoplay: true });
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) { setLoading(false); return; }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [settingsRes, videosRes, announcementsRes] = await Promise.all([
                    fetch('/api/multimedia_settings', { headers }),
                    fetch('/api/multimedia_videos?is_active=eq.1&order=sort_order.asc', { headers }),
                    fetch('/api/announcements?status=eq.Terbit&order=publish_date.desc', { headers }),
                ]);

                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setSettings({ name: data[0].name || 'Channel Sekolah', autoplay: data[0].autoplay === 1 });
                    }
                }

                if (videosRes.ok) {
                    const data = await videosRes.json();
                    if (Array.isArray(data)) {
                        const mapped: VideoItem[] = data.map((v: any) => ({
                            id: v.id || '',
                            title: v.title || '',
                            youtubeUrl: v.youtube_url || '',
                            thumbnail: v.thumbnail || '',
                            description: v.description || '',
                        }));
                        setVideos(mapped);
                        if (mapped.length > 0) setSelectedVideo(mapped[0]);
                    }
                }

                if (announcementsRes.ok) {
                    const data = await announcementsRes.json();
                    if (Array.isArray(data)) {
                        setAnnouncements(data.map((a: any) => ({
                            id: a.id || '',
                            title: a.title || '',
                            content: a.content || '',
                            category: a.category || '',
                            status: a.status || '',
                            publishDate: a.publish_date || '',
                            viewers: a.viewers || 0,
                        })));
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data channel:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getYoutubeId = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2]?.length === 11) ? match[2] : '';
    };

    const activeVideo = selectedVideo || videos[0] || null;
    const VIDEO_ID = getYoutubeId(activeVideo?.youtubeUrl || '');

    const totalViewers = announcements.reduce((sum, a) => sum + a.viewers, 0);

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
                        <h3 className="font-black text-sm md:text-base leading-none tracking-tight">{settings.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold">{totalViewers} MATA MEMANDANG</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-1 bg-black flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="w-full aspect-video bg-black shadow-lg relative z-20 shrink-0 sticky top-0">
                        {VIDEO_ID ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=${settings.autoplay ? 1 : 0}&rel=0&modestbranding=1`}
                                title={activeVideo?.title || 'Channel Sekolah'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                                <p className="text-sm font-bold">Belum ada video aktif</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 bg-white min-h-[300px]">
                        {activeVideo ? (
                            <>
                                <div className="flex items-center gap-2 mb-3">
                                    {VIDEO_ID && <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-black rounded uppercase tracking-widest">LIVE</span>}
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">VIDEO</span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-4">{activeVideo.title}</h1>
                                <div className="prose prose-slate prose-sm max-w-none">
                                    <h4 className="font-bold text-slate-800 mb-2">Deskripsi:</h4>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {activeVideo.description || 'Tidak ada deskripsi tambahan.'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <p className="text-sm font-bold">Tidak ada video</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:w-80 w-full bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-[450px] lg:h-auto shrink-0">
                    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <MessageCircle size={14} className="text-blue-600" /> Video Lainnya
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {videos.length > 0 ? (
                            <div className="p-2 space-y-2">
                                {videos.map((video) => (
                                    <button
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`w-full text-left p-3 rounded-xl transition-all ${
                                            selectedVideo?.id === video.id
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'bg-white border border-slate-100 hover:border-blue-200'
                                        }`}
                                    >
                                        <p className="text-xs font-bold text-slate-800 truncate">{video.title}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 truncate">{video.description || 'Tanpa deskripsi'}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-slate-50">
                                <MessageCircle size={32} className="text-slate-200 mb-4" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Belum ada video
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
