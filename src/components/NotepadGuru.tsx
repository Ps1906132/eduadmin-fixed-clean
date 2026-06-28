import React, { useState, useEffect } from 'react';
import { ChevronLeft, StickyNote, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotepadGuruProps {
    onBack: () => void;
    user?: any;
}

const COLORS = ['bg-yellow-100', 'bg-blue-100', 'bg-green-100', 'bg-pink-100', 'bg-purple-100', 'bg-orange-100'];

const NotepadGuru: React.FC<NotepadGuruProps> = ({ onBack, user }) => {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token || !user?.id) { setLoading(false); return; }
            const res = await fetch(`/api/teacher_notes?teacher_id=eq.${user.id}&order=created_at.desc`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotes(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Gagal memuat catatan:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [user?.id]);

    const handleAddNote = async () => {
        if (!newTitle.trim()) { toast.error('Judul catatan harus diisi'); return; }
        if (!user?.id) { toast.error('User tidak ditemukan'); return; }
        setSaving(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const res = await fetch('/api/teacher_notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: noteId,
                    teacher_id: user.id,
                    title: newTitle.trim(),
                    content: newContent.trim(),
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                }),
            });
            if (res.ok) {
                toast.success('Catatan ditambahkan!');
                setNewTitle('');
                setNewContent('');
                setShowForm(false);
                await fetchNotes();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.error || 'Gagal menambahkan catatan');
            }
        } catch {
            toast.error('Gagal menambahkan catatan');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            const token = localStorage.getItem('eduadmin_token');
            const res = await fetch(`/api/teacher_notes?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Catatan dihapus');
                setNotes(prev => prev.filter(n => n.id !== id));
            } else {
                toast.error('Gagal menghapus catatan');
            }
        } catch {
            toast.error('Gagal menghapus catatan');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <StickyNote className="text-amber-500" size={20} />
                        Notepad Guru
                    </h2>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`p-2 rounded-full transition-colors shadow-lg ${showForm ? 'bg-slate-500 text-white shadow-slate-200' : 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600'}`}
                >
                    <Plus size={20} className={`transition-transform ${showForm ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="p-4 border-b border-slate-100 bg-amber-50/50 animate-in slide-in-from-top duration-200">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Judul catatan..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                        />
                        <textarea
                            placeholder="Isi catatan..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all resize-none"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddNote}
                                disabled={saving || !newTitle.trim()}
                                className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                onClick={() => { setShowForm(false); setNewTitle(''); setNewContent(''); }}
                                className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-3" />
                        <p className="text-sm">Memuat catatan...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <StickyNote size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold text-sm">Belum ada catatan</p>
                        <p className="text-xs mt-1">Tekan tombol + untuk menambah catatan baru</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {notes.map((note) => (
                            <div key={note.id} className={`${note.color || 'bg-yellow-100'} p-5 rounded-2xl shadow-sm relative group hover:-translate-y-1 transition-transform duration-300`}>
                                <h3 className="font-bold text-slate-800 mb-2">{note.title}</h3>
                                <p className="text-sm text-slate-700 leading-relaxed min-h-[60px] whitespace-pre-wrap">{note.content || '-'}</p>
                                <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center text-xs text-slate-500">
                                    <span>{formatDate(note.created_at)}</span>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="p-1.5 hover:bg-white/50 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Placeholder */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="border-2 border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all min-h-[150px]"
                        >
                            <Plus size={32} />
                            <span className="font-bold text-sm">Tambah Catatan Baru</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotepadGuru;
