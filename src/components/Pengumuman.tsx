import React, { useState } from 'react';
import { useAnnouncements } from './DashboardSuperAdmin/hooks/useAnnouncements';
import toast from 'react-hot-toast';
import { Announcement } from '../data/sharedData';
import {
    Megaphone,
    Plus,
    List,
    Calendar,
    Users,
    Search,
    Edit3,
    Trash2,
    Eye,
    Send,
    FileText,
    Link as LinkIcon,
    Pin,
    X,
    CheckCircle,
    Clock,
    BookOpen,
    DollarSign,
    Smile,
    AlertCircle
} from 'lucide-react';

interface PengumumanProps {
    classes?: string[];
    user?: any;
}



const Pengumuman: React.FC<PengumumanProps> = ({ classes = [], user }) => {
    const role = user?.roleCode || user?.role || user?.role_type;
    const isKS = role?.toLowerCase() === 'ks';
    const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'create' | 'detail'>('dashboard');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

    const { announcements, setAnnouncements } = useAnnouncements();

    // Form State
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        category: 'Akademik',
        target: 'Semua',
        targetClass: 'Semua Kelas',
        content: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        attachments: []
    });

    // Helper functions
    const handleSave = (statusOverride?: 'Draft' | 'Terbit') => {
        if (!formData.title || !formData.content) {
            toast.error("Judul dan Isi pengumuman wajib diisi!");
            return;
        }

        const finalStatus = statusOverride || formData.status || 'Draft';
        const finalData = { ...formData, status: finalStatus };

        if (formData.id) {
            // Edit
            setAnnouncements(announcements.map(a => a.id === formData.id ? { ...a, ...finalData } as Announcement : a));
            toast.success("Pengumuman diperbarui!");
        } else {
            // New
            const newAnnouncement: Announcement = {
                ...finalData,
                id: Date.now(),
                viewers: 0,
                isPinned: false
            } as Announcement;
            setAnnouncements([newAnnouncement, ...announcements]);
            toast.success("Pengumuman berhasil diterbitkan!");
        }
        setActiveView('list');
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'Akademik',
            target: 'Semua',
            targetClass: 'Semua Kelas',
            content: '',
            publishDate: new Date().toISOString().split('T')[0],
            status: 'Draft',
            attachments: []
        });
        setSelectedAnnouncement(null);
    };

    const handleEdit = (item: Announcement) => {
        setFormData({ ...item });
        setActiveView('create');
    };

    const handleDelete = (id: number) => {
        if (confirm("Yakin ingin menghapus pengumuman ini?")) {
            setAnnouncements(announcements.filter(a => a.id !== id));
            toast.success("Pengumuman dihapus");
        }
    };

    const handleTogglePin = (id: number) => {
        setAnnouncements(announcements.map(a =>
            a.id === id ? { ...a, isPinned: !a.isPinned } : a
        ));
        toast.success("Status Pin diperbarui");
    };

    // --- DASHBOARD VIEW ---
    const renderDashboardView = () => {
        const stats = [
            { label: 'Total Pengumuman', value: announcements.length, icon: <Megaphone className="text-white" />, color: 'bg-blue-500' },
            { label: 'Terbit Hari Ini', value: announcements.filter(a => a.publishDate === new Date().toISOString().split('T')[0]).length, icon: <Calendar className="text-white" />, color: 'bg-emerald-500' },
            { label: 'Terjadwal', value: announcements.filter(a => a.status === 'Draft').length, icon: <Clock className="text-white" />, color: 'bg-amber-500' },
            { label: 'Kategori Aktif', value: new Set(announcements.map(a => a.category)).size, icon: <List className="text-white" />, color: 'bg-purple-500' },
        ];

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard Pengumuman</h2>
                        <p className="text-slate-500">Ringkasan aktivitas informasi sekolah.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/5 ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                                <p className="text-sm font-bold text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent View */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-700">Pengumuman Terakhir</h3>
                            <button onClick={() => setActiveView('list')} className="text-blue-600 font-bold text-sm hover:underline">Lihat Semua</button>
                        </div>
                        <div className="space-y-4">
                            {announcements.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer" onClick={() => { setSelectedAnnouncement(item); setActiveView('detail'); }}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${item.category === 'Akademik' ? 'bg-blue-100 text-blue-600' :
                                        item.category === 'Keuangan' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                        {item.category === 'Akademik' ? <BookOpen size={20} /> :
                                            item.category === 'Keuangan' ? <DollarSign size={20} /> :
                                                <Megaphone size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-slate-700 mb-1">{item.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${item.status === 'Terbit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2">{item.content}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {item.publishDate}</span>
                                            <span className="flex items-center gap-1"><Eye size={12} /> {item.viewers} Dilihat</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="bg-gradient-to-br from-[#1E1B4B] to-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-900/20">
                        <div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <Plus className="text-white" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Buat Pengumuman Baru</h3>
                            <p className="text-white/60 text-sm mb-6">Bagikan informasi penting kepada guru, siswa, atau wali murid dengan mudah.</p>
                        </div>
                        <button onClick={() => { resetForm(); setActiveView('create'); }} className="w-full py-3 bg-white text-[#1E1B4B] rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                            Mulai Buat
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- FORM VIEW ---
    const renderCreateView = () => {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-400" /></button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{formData.id ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h2>
                        <p className="text-slate-500 text-sm">Isi detail informasi yang akan dibagikan</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                    {/* Header Inputs */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pengumuman</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                            placeholder="Contoh: Jadwal Libur Semester Ganjil"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none cursor-pointer"
                            >
                                <option value="Akademik">Akademik</option>
                                <option value="Non Akademik">Non Akademik</option>
                                <option value="Keuangan">Keuangan</option>
                                <option value="Bimbingan Belajar">Bimbingan Belajar</option>
                                <option value="Libur & Kegiatan">Libur & Kegiatan Sekolah</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className={`w-full p-3 border border-slate-200 rounded-xl outline-none cursor-pointer font-bold ${formData.status === 'Terbit' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Terbit">Terbit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Tayang</label>
                                <input
                                    type="date"
                                    value={formData.publishDate}
                                    onChange={e => setFormData({ ...formData, publishDate: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Target Penerima</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                {(isKS ? ['Guru'] : ['Semua', 'Guru', 'Orang Tua']).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({ ...formData, target: t })}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.target === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kelas (Opsional)</label>
                            <select
                                value={formData.targetClass}
                                onChange={e => setFormData({ ...formData, targetClass: e.target.value })}
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none cursor-pointer"
                            >
                                <option value="Semua Kelas">Semua Kelas</option>
                                {classes.map((c, i) => (
                                    <option key={i} value={c}>{c}</option>
                                ))}
                                {/* Fallback if no classes passed */}
                                {classes.length === 0 && (
                                    <>
                                        <option value="1A">1A</option>
                                        <option value="1B">1B</option>
                                        <option value="2A">2A</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Isi Pengumuman</label>
                        <div className="relative">
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full h-64 p-5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-700 leading-relaxed"
                                placeholder="Tulis pengumuman lengkap di sini..."
                            ></textarea>
                            {/* SD Friendly Icons Helper */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                {['📅', '📚', '📌', '📢', '✅', '⚠️'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => setFormData({ ...formData, content: (formData.content || '') + emoji })}
                                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-transform hover:scale-110"
                                        title="Sisipkan Ikon"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <button onClick={() => setActiveView('dashboard')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                        <div className="flex-1 flex gap-3">
                            <button
                                onClick={() => handleSave('Draft')}
                                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                            >
                                <FileText size={18} /> Simpan Draft
                            </button>
                            <button
                                onClick={() => handleSave('Terbit')}
                                className="flex-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Send size={18} /> {formData.id ? 'Simpan & Publikasikan' : 'Publikasikan Sekarang'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- LIST VIEW ---
    const renderListView = () => {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Daftar Pengumuman</h2>
                        <p className="text-slate-500 text-sm">Kelola semua pengumuman yang telah dibuat.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveView('dashboard')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Dashboard</button>
                        <button onClick={() => { resetForm(); setActiveView('create'); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"><Plus size={18} /> Buat Baru</button>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Judul Pengumuman</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Tujuan</th>
                                    <th className="p-4">Kelas</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {announcements.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {item.isPinned && <Pin size={14} className="text-blue-500 fill-blue-500" />}
                                                <span className="font-bold text-slate-800">{item.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600">{item.target}</td>
                                        <td className="p-4 text-slate-600">{item.targetClass}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'Terbit' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{item.publishDate}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => { setSelectedAnnouncement(item); setActiveView('detail'); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Lihat"><Eye size={16} /></button>
                                                {!isKS && (
                                                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 size={16} /></button>
                                                )}
                                                {!isKS && (
                                                    <button onClick={() => handleTogglePin(item.id)} className={`p-2 hover:bg-amber-50 rounded-lg ${item.isPinned ? 'text-amber-500' : 'text-slate-400'}`} title="Pin"><Pin size={16} /></button>
                                                )}
                                                {!isKS && (
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {announcements.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">Belum ada pengumuman yang dibuat.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // --- DETAIL VIEW ---
    const renderDetailView = () => {
        if (!selectedAnnouncement) return null;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 p-8 relative">
                    <button onClick={() => { setSelectedAnnouncement(null); setActiveView('list'); }} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={24} />
                    </button>

                    <div className="mb-6">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
                            {selectedAnnouncement.category}
                        </span>
                        <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{selectedAnnouncement.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {selectedAnnouncement.publishDate}</span>
                            <span className="flex items-center gap-1"><Users size={14} /> {selectedAnnouncement.target} ({selectedAnnouncement.targetClass})</span>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                        <p className="whitespace-pre-wrap text-lg">{selectedAnnouncement.content}</p>
                    </div>

                    {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><LinkIcon size={16} /> Lampiran</h4>
                            <div className="flex flex-col gap-2">
                                {selectedAnnouncement.attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
                                        <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText size={18} /></div>
                                        <span className="font-medium text-slate-700 text-sm">{file.name}</span>
                                        <button className="ml-auto text-blue-600 text-sm font-bold hover:underline">Download</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={() => { setSelectedAnnouncement(null); setActiveView('list'); }} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto custom-scrollbar pb-10">
            {activeView === 'dashboard' && renderDashboardView()}
            {activeView === 'create' && renderCreateView()}
            {activeView === 'list' && renderListView()}
            {activeView === 'detail' && renderDetailView()}
        </div>
    );
};

export default Pengumuman;
