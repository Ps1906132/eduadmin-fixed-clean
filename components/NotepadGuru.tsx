import React, { useState } from 'react';
import { ChevronLeft, StickyNote, Plus, Trash2 } from 'lucide-react';

interface NotepadGuruProps {
    onBack: () => void;
}

const NotepadGuru: React.FC<NotepadGuruProps> = ({ onBack }) => {
    const [notes, setNotes] = useState([
        { id: 1, title: 'Rencana Rapat Wali Murid', content: 'Membahas persiapan ujian akhir semester...', color: 'bg-yellow-100', date: '2025-10-20' },
        { id: 2, title: 'Ide Lomba Kelas', content: 'Lomba kebersihan dan menghias kelas...', color: 'bg-blue-100', date: '2025-10-22' },
    ]);

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
                <button className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200">
                    <Plus size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <div key={note.id} className={`${note.color} p-5 rounded-2xl shadow-sm relative group hover:-translate-y-1 transition-transform duration-300`}>
                            <h3 className="font-bold text-slate-800 mb-2">{note.title}</h3>
                            <p className="text-sm text-slate-700 leading-relaxed min-h-[60px]">{note.content}</p>
                            <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center text-xs text-slate-500">
                                <span>{note.date}</span>
                                <button className="p-1.5 hover:bg-white/50 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Placeholder */}
                    <button className="border-2 border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-all min-h-[150px]">
                        <Plus size={32} />
                        <span className="font-bold text-sm">Tambah Catatan Baru</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotepadGuru;
