import React from 'react';
import { X, Clock } from 'lucide-react';

interface AddExamTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    newExamTime: { start: string; end: string };
    setNewExamTime: (time: { start: string; end: string }) => void;
    examTimeSlots: any[];
    setExamTimeSlots: (slots: any[]) => void;
}

const AddExamTimeModal: React.FC<AddExamTimeModalProps> = ({
    isOpen,
    onClose,
    newExamTime,
    setNewExamTime,
    examTimeSlots,
    setExamTimeSlots
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-[#004AAD]" />
                        <h3 className="text-lg font-bold text-slate-800">Tambah Sesi Ujian</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Jam Mulai</label>
                            <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newExamTime.start} onChange={e => setNewExamTime({ ...newExamTime, start: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Jam Selesai</label>
                            <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={newExamTime.end} onChange={e => setNewExamTime({ ...newExamTime, end: e.target.value })} />
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                    <button onClick={() => {
                        if (newExamTime.start && newExamTime.end) {
                            const newId = examTimeSlots.length > 0 ? Math.max(...examTimeSlots.map(t => t.id)) + 1 : 0;
                            setExamTimeSlots([...examTimeSlots, { id: newId, start: newExamTime.start, end: newExamTime.end }]);
                            onClose();
                            setNewExamTime({ start: '', end: '' });
                        }
                    }} className="px-4 py-2 bg-[#004AAD] text-white rounded-lg font-bold hover:bg-[#003380] transition-all text-sm">Tambah</button>
                </div>
            </div>
        </div>
    );
};

export default AddExamTimeModal;
