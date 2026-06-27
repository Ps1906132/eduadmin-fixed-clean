import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AcademicYear {
    id: string;
    name: string;
    is_active: boolean;
}

interface PaymentTypeClass {
    id?: string;
    payment_type_id: string;
    academic_year_id: string;
    custom_amount: number;
}

interface ClassAmountModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentType: {
        id: string;
        name: string;
        amount: number;
    } | null;
    academicYears: AcademicYear[];
    existingAmounts: PaymentTypeClass[];
    onSave: (paymentTypeId: string, academicYearId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
}

const ClassAmountModal: React.FC<ClassAmountModalProps> = ({
    isOpen,
    onClose,
    paymentType,
    academicYears,
    existingAmounts,
    onSave
}) => {
    const [loading, setLoading] = useState(false);
    const [amounts, setAmounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (paymentType) {
            const initialAmounts: Record<string, number> = {};
            academicYears.forEach(year => {
                const existing = existingAmounts.find(
                    a => a.payment_type_id === paymentType.id && a.academic_year_id === year.id
                );
                initialAmounts[year.id] = existing ? existing.custom_amount : paymentType.amount;
            });
            setAmounts(initialAmounts);
        }
    }, [paymentType, academicYears, existingAmounts]);

    if (!isOpen || !paymentType) return null;

    const handleSave = async () => {
        setLoading(true);
        let successCount = 0;

        for (const year of academicYears) {
            const amount = amounts[year.id];
            if (amount !== undefined && amount !== paymentType.amount) {
                const result = await onSave(paymentType.id, year.id, amount);
                if (result.success) successCount++;
            }
        }

        setLoading(false);

        if (successCount > 0) {
            toast.success(`Nominal berhasil diperbarui untuk ${successCount} tahun ajaran`);
            onClose();
        } else {
            toast.success('Tidak ada perubahan');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{paymentType.name}</h2>
                            <p className="text-sm text-slate-500">Nominal per Tahun Ajaran</p>
                        </div>
                        <button onClick={onClose} disabled={loading}>
                            <X size={24} className="text-slate-400 hover:text-red-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-700">
                            <span className="font-bold">Default:</span> Rp {paymentType.amount.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            Ubah nominal per tahun ajaran jika diperlukan
                        </p>
                    </div>

                    <div className="space-y-3">
                        {academicYears.map(year => (
                            <div key={year.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <p className="font-bold text-slate-700">{year.name}</p>
                                    {year.is_active && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                            Aktif
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Rp</span>
                                    <input
                                        type="number"
                                        value={amounts[year.id] || ''}
                                        onChange={(e) => setAmounts({
                                            ...amounts,
                                            [year.id]: parseInt(e.target.value) || paymentType.amount
                                        })}
                                        className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-right font-mono text-sm focus:border-purple-500 outline-none"
                                        min="0"
                                        disabled={loading}
                                    />
                                </div>
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
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassAmountModal;
