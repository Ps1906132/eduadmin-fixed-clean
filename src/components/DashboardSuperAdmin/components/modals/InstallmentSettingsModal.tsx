import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Installment {
    installment_no: number;
    amount: number;
    due_date: string;
}

interface InstallmentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    billId: string;
    totalAmount: number;
    existingInstallments?: any[];
    onSave: (billId: string, installments: Installment[]) => Promise<{ success: boolean; error?: string }>;
}

const InstallmentSettingsModal: React.FC<InstallmentSettingsModalProps> = ({
    isOpen,
    onClose,
    billId,
    totalAmount,
    existingInstallments = [],
    onSave
}) => {
    const [loading, setLoading] = useState(false);
    const [installments, setInstallments] = useState<Installment[]>([]);

    useEffect(() => {
        if (existingInstallments.length > 0) {
            setInstallments(existingInstallments.map((i, idx) => ({
                installment_no: i.installment_no || idx + 1,
                amount: i.amount,
                due_date: i.due_date
            })));
        } else {
            // Default: 5 cicilan
            const defaultCount = 5;
            const amountPerInstallment = Math.floor(totalAmount / defaultCount);
            const remainder = totalAmount % defaultCount;
            
            const newInstallments: Installment[] = [];
            const today = new Date();
            
            for (let i = 0; i < defaultCount; i++) {
                const dueDate = new Date(today);
                dueDate.setMonth(dueDate.getMonth() + i + 1);
                
                newInstallments.push({
                    installment_no: i + 1,
                    amount: i === 0 ? amountPerInstallment + remainder : amountPerInstallment,
                    due_date: dueDate.toISOString().split('T')[0]
                });
            }
            setInstallments(newInstallments);
        }
    }, [existingInstallments, totalAmount]);

    if (!isOpen) return null;

    const addInstallment = () => {
        const lastInstallment = installments[installments.length - 1];
        const newNo = installments.length + 1;
        
        const newDate = new Date(lastInstallment?.due_date || new Date());
        newDate.setMonth(newDate.getMonth() + 1);
        
        setInstallments([
            ...installments,
            {
                installment_no: newNo,
                amount: 0,
                due_date: newDate.toISOString().split('T')[0]
            }
        ]);
    };

    const removeInstallment = (index: number) => {
        if (installments.length <= 1) {
            toast.error('Minimal harus ada 1 cicilan');
            return;
        }
        const newInstallments = installments.filter((_, i) => i !== index);
        // Recalculate installment numbers
        setInstallments(newInstallments.map((inst, idx) => ({
            ...inst,
            installment_no: idx + 1
        })));
    };

    const updateInstallment = (index: number, field: keyof Installment, value: any) => {
        const newInstallments = [...installments];
        newInstallments[index] = { ...newInstallments[index], [field]: value };
        setInstallments(newInstallments);
    };

    const distributeAmount = () => {
        const count = installments.length;
        if (count === 0) return;
        
        const amountPerInstallment = Math.floor(totalAmount / count);
        const remainder = totalAmount % count;
        
        setInstallments(installments.map((inst, idx) => ({
            ...inst,
            amount: idx === 0 ? amountPerInstallment + remainder : amountPerInstallment
        })));
        
        toast.success('Nominal sudah dibagi rata');
    };

    const totalDistributed = installments.reduce((sum, i) => sum + i.amount, 0);
    const isValid = totalDistributed === totalAmount && installments.every(i => i.amount > 0 && i.due_date);

    const handleSave = async () => {
        if (!isValid) {
            toast.error('Total cicilan harus sama dengan total tagihan');
            return;
        }

        setLoading(true);
        const result = await onSave(billId, installments);
        setLoading(false);

        if (result.success) {
            toast.success('Pengaturan cicilan berhasil disimpan!');
            onClose();
        } else {
            toast.error(result.error || 'Gagal menyimpan pengaturan');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
                                <Calendar size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Pengaturan Cicilan</h2>
                                <p className="text-sm text-slate-500">Total: Rp {totalAmount.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} disabled={loading}>
                            <X size={24} className="text-slate-400 hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-600">
                            {installments.length} cicilan | Total: Rp {totalDistributed.toLocaleString('id-ID')}
                            {totalDistributed !== totalAmount && (
                                <span className="text-red-500 ml-2">
                                    (Selisih: Rp {(totalAmount - totalDistributed).toLocaleString('id-ID')})
                                </span>
                            )}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={distributeAmount}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                            >
                                Bagi Rata
                            </button>
                            <button
                                onClick={addInstallment}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Tambah
                            </button>
                        </div>
                    </div>

                    {/* Installments List */}
                    <div className="space-y-3">
                        {installments.map((inst, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                                    {inst.installment_no}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            value={inst.amount || ''}
                                            onChange={(e) => updateInstallment(idx, 'amount', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:border-blue-500 outline-none"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Jatuh Tempo</label>
                                        <input
                                            type="date"
                                            value={inst.due_date}
                                            onChange={(e) => updateInstallment(idx, 'due_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeInstallment(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !isValid}
                        className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
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
            </div>
        </div>
    );
};

export default InstallmentSettingsModal;
