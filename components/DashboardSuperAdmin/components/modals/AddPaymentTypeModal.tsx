import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddPaymentTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentTypes: any[];
    setPaymentTypes: (types: any[]) => void;
    newPaymentType: any;
    setNewPaymentType: (type: any) => void;
}

const AddPaymentTypeModal: React.FC<AddPaymentTypeModalProps> = ({
    isOpen,
    onClose,
    paymentTypes,
    setPaymentTypes,
    setNewPaymentType
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-2xl font-bold text-[#1E1B4B]">Tambah Jenis Pembayaran</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get('paymentName') as string;
                    const type = formData.get('paymentType') as string;
                    const amount = parseInt(formData.get('paymentAmount') as string);

                    if (name && type && amount > 0) {
                        const newType = {
                            id: Date.now(),
                            name,
                            type,
                            amount,
                            category: 'Lainnya'
                        };
                        setPaymentTypes([...paymentTypes, newType]);
                        toast.success("Jenis pembayaran berhasil ditambahkan!");
                        onClose();
                        setNewPaymentType({ name: '', type: 'BULANAN', amount: 0, category: 'Lainnya' });
                    }
                }} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nama Pembayaran</label>
                        <input
                            type="text"
                            name="paymentName"
                            required
                            placeholder="Contoh: SPP Bulanan"
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tipe Pembayaran</label>
                        <select
                            name="paymentType"
                            required
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                        >
                            <option value="BULANAN">Bulanan</option>
                            <option value="TAHUNAN">Tahunan</option>
                            <option value="SEKALI">Sekali Bayar</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tarif Default (Rp)</label>
                        <input
                            type="number"
                            name="paymentAmount"
                            required
                            min="0"
                            placeholder="150000"
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-medium text-slate-800"
                        />
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

export default AddPaymentTypeModal;
