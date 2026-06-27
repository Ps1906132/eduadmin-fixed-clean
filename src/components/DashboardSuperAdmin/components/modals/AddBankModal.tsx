import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    newBankAccount: { bank: string; number: string; name: string };
    setNewBankAccount: (account: { bank: string; number: string; name: string }) => void;
    onAdd: (bankAccount: { bank: string; number: string; name: string; is_active: boolean }) => Promise<{ success: boolean; error?: string }>;
}

const AddBankModal: React.FC<AddBankModalProps> = ({
    isOpen,
    onClose,
    newBankAccount,
    setNewBankAccount,
    onAdd
}) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-[#1E1B4B]">Tambah Rekening</h3>
                    <button onClick={onClose} disabled={loading}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nama Bank</label>
                        <input
                            placeholder="Contoh: BNI, Mandiri, BSI"
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                            value={newBankAccount.bank}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, bank: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Rekening</label>
                        <input
                            placeholder="Contoh: 123-456-7890"
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                            value={newBankAccount.number}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, number: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Atas Nama</label>
                        <input
                            placeholder="Contoh: Yayasan Sekolah..."
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                            value={newBankAccount.name}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, name: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={async () => {
                            if (newBankAccount.bank && newBankAccount.number) {
                                setLoading(true);
                                const result = await onAdd({
                                    bank: newBankAccount.bank,
                                    number: newBankAccount.number,
                                    name: newBankAccount.name,
                                    is_active: true
                                });
                                setLoading(false);
                                if (result.success) {
                                    setNewBankAccount({ bank: '', number: '', name: '' });
                                    onClose();
                                    toast.success("Rekening berhasil ditambahkan.");
                                } else {
                                    toast.error(result.error || "Gagal menyimpan rekening");
                                }
                            } else {
                                toast.error("Mohon lengkapi data bank dan nomor rekening.");
                            }
                        }}
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 mt-2 shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Rekening'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBankModal;
