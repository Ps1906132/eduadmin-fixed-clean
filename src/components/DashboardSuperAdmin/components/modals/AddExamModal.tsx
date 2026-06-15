import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MasterExamSchedule } from '../../../../data/sharedData';

interface AddExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    newExamData: any;
    setNewExamData: (data: any) => void;
    examSchedules: MasterExamSchedule[];
    setExamSchedules: (schedules: MasterExamSchedule[]) => void;
    setActiveExamId: (id: number) => void;
}

const AddExamModal: React.FC<AddExamModalProps> = ({
    isOpen,
    onClose,
    newExamData,
    setNewExamData,
    examSchedules,
    setExamSchedules,
    setActiveExamId
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-800">Tambah Jadwal Ujian Baru</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jenis Ujian</label>
                        <select
                            value={newExamData.type}
                            onChange={(e) => setNewExamData({ ...newExamData, type: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="UTS">UTS (Ujian Tengah Semester)</option>
                            <option value="UAS">UAS (Ujian Akhir Semester)</option>
                            <option value="PAS">PAS (Penilaian Akhir Semester)</option>
                            <option value="PAT">PAT (Penilaian Akhir Tahun)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tahun Ajaran</label>
                        <input
                            value={newExamData.year}
                            onChange={(e) => setNewExamData({ ...newExamData, year: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
                            placeholder="Contoh: 2025/2026"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Semester</label>
                        <select
                            value={newExamData.semester}
                            onChange={(e) => setNewExamData({ ...newExamData, semester: e.target.value })}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="Ganjil">Semester Ganjil</option>
                            <option value="Genap">Semester Genap</option>
                        </select>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                        <button onClick={() => {
                            const newId = Date.now();
                            const examToAdd: MasterExamSchedule = { ...newExamData, id: newId };
                            setExamSchedules([...examSchedules, examToAdd]);
                            setActiveExamId(newId);
                            onClose();
                            toast.success("Jadwal Ujian baru berhasil dibuat!");
                        }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Simpan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddExamModal;
