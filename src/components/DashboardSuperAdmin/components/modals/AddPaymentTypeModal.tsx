import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddPaymentTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (paymentType: {
        name: string;
        type: string;
        amount: number;
        category: string;
        is_active: boolean;
    }) => Promise<{ success: boolean; error?: string }>;
}

const AddPaymentTypeModal: React.FC<AddPaymentTypeModalProps> = ({
    isOpen,
    onClose,
    onAdd
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'BULANAN',
        amount: 0,
        category: 'Lainnya'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || formData.amount <= 0) {
            toast.error('Mohon isi nama dan nominal dengan benar');
            return;
        }

        setLoading(true);
        const result = await onAdd({
            ...formData,
            is_active: true
        });
        setLoading(false);

        if (result.success) {
            toast.success('Jenis pembayaran berhasil ditambahkan!');
            setFormData({ name: '', type: 'BULANAN', amount: 0, category: 'Lainnya' });
            onClose();
        } else {
            toast.error(result.error || 'Gagal menyimpan data');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-[#1E1B4B]">Tambah Jenis Pembayaran</h3>
                    <button onClick={onClose} disabled={loading}>
                        <X size={24} className="text-slate-400 hover:text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pembayaran</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: SPP Bulanan, Uang Pangkal"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Pembayaran</label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                            disabled={loading}
                        >
                            <option value="BULANAN">Bulanan (SPP)</option>
                            <option value="TAHUNAN">Tahunan</option>
                            <option value="SEKALI">Sekali Bayar</option>
                            <option value="CICILAN">Cicilan (Uang Pangkal)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            placeholder="150000"
                            value={formData.amount || ''}
                            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                        <input
                            type="text"
                            placeholder="Contoh: SPP, Bangunan, Seragam"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPaymentTypeModal;
