import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AddBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    newBankAccount: { bank: string; number: string; name: string };
    setNewBankAccount: (account: { bank: string; number: string; name: string }) => void;
    schoolBankAccounts: any[];
    setSchoolBankAccounts: (accounts: any[]) => void;
}

const AddBankModal: React.FC<AddBankModalProps> = ({
    isOpen,
    onClose,
    newBankAccount,
    setNewBankAccount,
    schoolBankAccounts,
    setSchoolBankAccounts
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-[#1E1B4B]">Tambah Rekening</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nama Bank</label>
                        <input
                            placeholder="Contoh: BNI, Mandiri, BSI"
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                            value={newBankAccount.bank}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, bank: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nomor Rekening</label>
                        <input
                            placeholder="Contoh: 123-456-7890"
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                            value={newBankAccount.number}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, number: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Atas Nama</label>
                        <input
                            placeholder="Contoh: Yayasan Sekolah..."
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500"
                            value={newBankAccount.name}
                            onChange={(e) => setNewBankAccount({ ...newBankAccount, name: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (newBankAccount.bank && newBankAccount.number) {
                                setSchoolBankAccounts([...schoolBankAccounts, { id: Date.now(), ...newBankAccount }]);
                                setNewBankAccount({ bank: '', number: '', name: '' });
                                onClose();
                                toast.success("Rekening berhasil ditambahkan.");
                            } else {
                                toast.error("Mohon lengkapi data bank dan nomor rekening.");
                            }
                        }}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 mt-2 shadow-lg shadow-emerald-200"
                    >
                        Simpan Rekening
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBankModal;
