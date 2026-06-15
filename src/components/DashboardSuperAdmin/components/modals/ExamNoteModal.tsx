import React from 'react';
import { X, FileText } from 'lucide-react';

interface ExamNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDay: string | null;
    setExamDailyNotes: (update: (prev: Record<string, string>) => Record<string, string>) => void;
    tempExamNote: string;
    setTempExamNote: (value: string) => void;
}

const ExamNoteModal: React.FC<ExamNoteModalProps> = ({
    isOpen,
    onClose,
    selectedDay,
    setExamDailyNotes,
    tempExamNote,
    setTempExamNote
}) => {
    if (!isOpen || !selectedDay) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-800">Catatan Hari {selectedDay}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <div className="p-6">
                    <label className="text-sm font-bold text-slate-600 block mb-2">Catatan Harian:</label>
                    <textarea
                        autoFocus
                        placeholder="Masukkan catatan untuk hari ini..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] resize-none"
                        value={tempExamNote}
                        onChange={e => setTempExamNote(e.target.value)}
                    />
                </div>
                <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                    <button onClick={() => {
                        if (selectedDay) {
                            setExamDailyNotes(prev => ({ ...prev, [selectedDay]: tempExamNote }));
                            onClose();
                        }
                    }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Simpan</button>
                </div>
            </div>
        </div>
    );
};

export default ExamNoteModal;
