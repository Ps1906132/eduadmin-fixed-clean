import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    Video,
    Play,
    Pause,
    Plus,
    Settings,
    Edit,
    Trash2,
    Youtube,
    CheckCircle2,
    MonitorPlay,
    Radio,
    Save,
    X,
    Image,
    AlertCircle,
    LayoutDashboard,
    ListVideo
} from 'lucide-react';
import { useMultimedia } from './DashboardSuperAdmin/hooks/useMultimedia';
import { Broadcast } from '../data/sharedData';



interface MultimediaProps {
    user?: any;
}

const Multimedia: React.FC<MultimediaProps> = ({ user }) => {
    const role = user?.roleCode || user?.role || user?.role_type;
    const isKS = role?.toLowerCase() === 'ks';
    const [activeTab, setActiveTab] = useState('dashboard');
    const { broadcasts, setBroadcasts, channelSettings, setChannelSettings } = useMultimedia();

    const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(1); // ID 1 is active by default
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Broadcast>>({
        title: '', url: '', description: '', category: 'Edukasi', status: 'Draft'
    });

    // Helpers
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handlePlay = (id: number) => {
        setBroadcasts(broadcasts.map(b => ({
            ...b,
            status: b.id === id ? 'Active' : (b.status === 'Active' ? 'Draft' : b.status) // Deactivate others if needed, though req says "1 video active" conceptually
        })));
        setCurrentPlayingId(id);
    };

    const handleStop = () => {
        setCurrentPlayingId(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus siaran ini?')) {
            setBroadcasts(broadcasts.filter(b => b.id !== id));
            if (currentPlayingId === id) setCurrentPlayingId(null);
        }
    };

    const handleSaveBroadcast = () => {
        if (!formData.title || !formData.url) {
            toast.error("Judul dan Link YouTube wajib diisi!");
            return;
        }

        // Simple YouTube URL validation
        if (!getYoutubeId(formData.url)) {
            toast.error("Link YouTube tidak valid!");
            return;
        }

        if (editMode && formData.id) {
            setBroadcasts(broadcasts.map(b => b.id === formData.id ? { ...b, ...formData } as Broadcast : b));
        } else {
            const newBroadcast: Broadcast = {
                id: Date.now(),
                title: formData.title || '',
                url: formData.url || '',
                description: formData.description || '',
                category: formData.category as any,
                status: formData.status as any || 'Draft',
                date: new Date().toISOString().split('T')[0]
            };
            setBroadcasts([newBroadcast, ...broadcasts]);
        }
        setIsFormOpen(false);
        setEditMode(false);
        setFormData({ title: '', url: '', description: '', category: 'Edukasi', status: 'Draft' });
    };

    const openEdit = (broadcast: Broadcast) => {
        setFormData(broadcast);
        setEditMode(true);
        setIsFormOpen(true);
    };

    // Sub-components
    const DashboardView = () => {
        const activeVideo = broadcasts.find(b => b.id === currentPlayingId);
        const ytid = activeVideo ? getYoutubeId(activeVideo.url) : null;

        return (
            <div className="space-y-8 animate-in fade-in">
                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <MonitorPlay size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Nama Channel</p>
                            <h3 className="text-lg font-black text-slate-800 truncate max-w-[150px]">{channelSettings.name}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <ListVideo size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Video Aktif</p>
                            <h3 className="text-2xl font-black text-slate-800">{broadcasts.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentPlayingId ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Radio size={24} className={currentPlayingId ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Status</p>
                            <h3 className={`text-xl font-black ${currentPlayingId ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {currentPlayingId ? 'Sedang Memutar' : 'Tidak Ada Siaran'}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Main Player Replacement - Removed the actual video iframe for performance */}
                <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 border-dashed relative aspect-[21/9] flex items-center justify-center group">
                    <div className="flex flex-col items-center justify-center text-slate-500 text-center gap-2 p-8">
                        {activeVideo ? (
                            <>
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                    <Radio size={32} />
                                </div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight">SIARAN SEDANG BERLANGSUNG</h4>
                                <p className="text-sm text-slate-500 max-w-md font-medium">Video "{activeVideo.title}" sedang ditayangkan di portal siswa. Preview Player dinonaktifkan untuk mengoptimalkan kinerja sistem Admin.</p>
                                <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest border border-rose-200">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                    ON AIR: {activeVideo.title}
                                </div>
                            </>
                        ) : (
                            <>
                                <MonitorPlay size={48} className="mb-2 opacity-30" />
                                <h4 className="text-lg font-bold text-slate-400">TIDAK ADA SIARAN AKTIF</h4>
                                <p className="text-xs text-slate-400">Aktifkan siaran melalui menu Kelola Siaran.</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4">
                    {!isKS && (
                        <button onClick={() => { setIsFormOpen(true); setEditMode(false); setFormData({ category: 'Edukasi', status: 'Draft' }); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                            <Plus size={20} /> Tambah Siaran Baru
                        </button>
                    )}
                    <button onClick={() => setActiveTab('siaran')} className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                        <ListVideo size={20} /> Kelola Daftar Siaran
                    </button>
                </div>
            </div>
        );
    };

    const SiaranListView = () => (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><ListVideo size={20} /> Daftar Siaran</h3>
                {!isKS && (
                    <button onClick={() => { setIsFormOpen(true); setEditMode(false); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                        <Plus size={16} /> Tambah
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                            <th className="p-4 w-16 text-center">No</th>
                            <th className="p-4">Judul Siaran</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Link YouTube</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {broadcasts.map((b, idx) => (
                            <tr key={b.id} className={`group transition-colors ${currentPlayingId === b.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                <td className="p-4 text-center text-slate-500 font-bold">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{b.title}</div>
                                    <div className="text-xs text-slate-400 capitalize">{b.date} &bull; {b.description}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold
                                        ${b.category === 'Edukasi' ? 'bg-emerald-100 text-emerald-700' :
                                            b.category === 'Pengumuman' ? 'bg-amber-100 text-amber-700' :
                                                'bg-violet-100 text-violet-700'}
                                    `}>
                                        {b.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <a href={b.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                                        <Youtube size={14} /> Link Video
                                    </a>
                                </td>
                                <td className="p-4 text-center">
                                    {currentPlayingId === b.id ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold animate-pulse">
                                            <Radio size={12} /> ON AIR
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs font-bold">OFFLINE</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {isKS ? (
                                        <span className="text-xs text-slate-400 italic">Read Only</span>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            {currentPlayingId === b.id ? (
                                                <button onClick={handleStop} title="Stop Siaran" className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                                                    <Pause size={16} fill="currentColor" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handlePlay(b.id)} title="Putar Siaran" className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition">
                                                    <Play size={16} fill="currentColor" />
                                                </button>
                                            )}
                                            <button onClick={() => openEdit(b)} title="Edit" className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(b.id)} title="Hapus" className="p-2 bg-white border border-slate-200 text-rose-500 rounded-lg hover:bg-rose-50 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {broadcasts.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium bg-slate-50">Belum ada siaran. Tambahkan siaran baru.</div>
                )}
            </div>
        </div>
    );

    const SettingsView = () => (
        <div className="space-y-6 animate-in fade-in max-w-2xl">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100">
                    <Settings size={24} className="text-slate-400" /> Pengaturan Studio
                </h3>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Channel Sekolah</label>
                    <input
                        type="text"
                        value={channelSettings.name}
                        onChange={(e) => setChannelSettings({ ...channelSettings, name: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo Channel</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                            <Image size={32} className="text-slate-400" />
                        </div>
                        <button className="text-blue-600 text-sm font-bold hover:underline">Ganti Logo</button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <label className="block text-sm font-bold text-slate-700">Autoplay Video</label>
                        <p className="text-xs text-slate-500">Video langsung diputar saat dashboard dibuka.</p>
                    </div>
                    <button
                        onClick={() => setChannelSettings({ ...channelSettings, autoplay: !channelSettings.autoplay })}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${channelSettings.autoplay ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${channelSettings.autoplay ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button
                        onClick={() => toast.success("Pengaturan studio berhasil disimpan!")}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                    >
                        <Save size={18} /> Simpan Pengaturan
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header Tab */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Video className="text-rose-600" /> Studio Channel Sekolahku
                    </h2>
                    <p className="text-slate-500 text-sm">Pusat penyiaran dan konten multimedia sekolah.</p>
                </div>
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                        { id: 'siaran', label: 'Kelola Siaran', icon: <ListVideo size={18} /> },
                        ...(!isKS ? [{ id: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> }] : []),
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === item.id ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'siaran' && <SiaranListView />}
                {activeTab === 'settings' && <SettingsView />}
            </div>

            {/* Modal Form */}
            {!isKS && isFormOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 lg:p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">{editMode ? 'Edit Siaran' : 'Tambah Siaran Baru'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Judul Siaran</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Upacara Bendera Senin"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Link YouTube</label>
                                <div className="relative">
                                    <Youtube className="absolute left-3 top-3.5 text-red-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="https://youtube.com/..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Pastikan link valid dan video bersifat Publik/Unlisted.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                    >
                                        <option value="Edukasi">Edukasi</option>
                                        <option value="Pengumuman">Pengumuman</option>
                                        <option value="Kegiatan">Kegiatan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Status Awal</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                                    >
                                        <option value="Draft">Draft (Simpan Dulu)</option>
                                        <option value="Active">Langsung Tayang (Active)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Batal</button>
                            <button onClick={handleSaveBroadcast} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
                                <Save size={18} /> Simpan Siaran
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Multimedia;
