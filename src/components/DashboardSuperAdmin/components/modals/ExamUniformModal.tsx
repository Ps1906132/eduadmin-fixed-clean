import React from 'react';
import { X, Shirt } from 'lucide-react';

interface ExamUniformModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDay: string | null;
    currentUniform: string;
    setExamDailyUniforms: (update: (prev: Record<string, string>) => Record<string, string>) => void;
    tempExamUniform: string;
    setTempExamUniform: (value: string) => void;
}

const ExamUniformModal: React.FC<ExamUniformModalProps> = ({
    isOpen,
    onClose,
    selectedDay,
    currentUniform,
    setExamDailyUniforms,
    tempExamUniform,
    setTempExamUniform
}) => {
    if (!isOpen || !selectedDay) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shirt size={20} className="text-indigo-600" />
                        <h3 className="text-lg font-bold text-slate-800">Seragam Hari {selectedDay}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <div className="p-6">
                    <label className="text-sm font-bold text-slate-600 block mb-2">Seragam yang dipakai:</label>
                    <input
                        type="text"
                        autoFocus
                        placeholder="Contoh: Putih Merah & Topi"
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={tempExamUniform}
                        onChange={e => setTempExamUniform(e.target.value)}
                    />
                    <div className="mt-3 flex gap-2 flex-wrap">
                        {['Putih Merah', 'Batik', 'Pramuka', 'Olahraga', 'Muslim'].map(opt => (
                            <button key={opt} onClick={() => setTempExamUniform(opt)} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                    <button onClick={() => {
                        if (selectedDay) {
                            setExamDailyUniforms(prev => ({ ...prev, [selectedDay]: tempExamUniform }));
                            onClose();
                        }
                    }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all text-sm">Simpan</button>
                </div>
            </div>
        </div>
    );
};

export default ExamUniformModal;
