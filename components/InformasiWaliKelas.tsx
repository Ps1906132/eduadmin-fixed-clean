import React, { useState } from 'react';
import { ChevronLeft, Megaphone, Plus, Trash2, Edit, Calendar, Clock, X, Send } from 'lucide-react';

interface InformasiWaliKelasProps {
    onBack: () => void;
}

const InformasiWaliKelas: React.FC<InformasiWaliKelasProps> = ({ onBack }) => {
    // Dummy Data Pengumuman
    const [infos, setInfos] = useState<any[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const handleSave = () => {
        if (!newTitle || !newContent) return;

        const newInfo = {
            id: Date.now(),
            title: newTitle,
            content: newContent,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            active: true
        };

        setInfos([newInfo, ...infos]);
        setIsCreating(false);
        setNewTitle('');
        setNewContent('');
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus informasi ini?')) {
            setInfos(infos.filter(info => info.id !== id));
        }
    };

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-20">
                <button onClick={onBack} className="p-2 md:p-2.5 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-500">
                    <ChevronLeft size={22} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-base md:text-xl text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 md:p-2 bg-orange-50 rounded-lg md:rounded-xl">
                            <Megaphone className="text-orange-600 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        Informasi Kelas
                    </h2>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 active:scale-95"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">Buat Info</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20">
                {infos.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                        <Megaphone size={64} className="opacity-10 mb-4" />
                        <p className="font-bold">Belum ada informasi kelas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {infos.map((info) => (
                            <div key={info.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-xl transition-colors group-hover:bg-orange-600 group-hover:text-white">
                                            <Megaphone size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={10} /> {info.date}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(info.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-800 text-base mb-2 group-hover:text-orange-600 transition-colors uppercase leading-tight">{info.title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{info.content}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                        <Clock size={12} /> {info.time} WIB
                                    </div>
                                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Detail Info</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL: BUAT INFORMASI BARU */}
            {isCreating && (
                <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[400px] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Buat Info Baru</h3>
                                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Judul Informasi</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Contoh: Pengumuman Besok"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Isi Informasi</label>
                                    <textarea
                                        rows={4}
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                        placeholder="Tuliskan isi informasi di sini..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1">Batal</button>
                                <button onClick={handleSave} className="flex-1 py-3.5 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2 text-sm order-1 sm:order-2">
                                    <Send size={16} /> Publikasikan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InformasiWaliKelas;
