import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    financialYear: string;
    setFinancialYear: (year: string) => void;
}

const EditYearModal: React.FC<EditYearModalProps> = ({
    isOpen,
    onClose,
    financialYear,
    setFinancialYear
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-[#1E1B4B]">Ubah Tahun Ajaran</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newYear = formData.get('academicYear') as string;
                    if (newYear) {
                        setFinancialYear(newYear);
                        toast.success("Tahun ajaran berhasil diperbarui!");
                        onClose();
                    }
                }} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Ajaran</label>
                        <input
                            type="text"
                            name="academicYear"
                            required
                            placeholder="Contoh: 2025/2026"
                            defaultValue={financialYear}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                        />
                        <p className="text-xs text-slate-400 mt-2 ml-1">Format: YYYY/YYYY (contoh: 2025/2026)</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditYearModal;
