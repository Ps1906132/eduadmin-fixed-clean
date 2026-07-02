import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle, XCircle, SkipForward, Users, ArrowRight } from 'lucide-react';

interface SyncParentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSync: () => Promise<{ success: number; failed: number; skipped: number; total: number }>;
}

type SyncStage = 'confirm' | 'syncing' | 'done';

const SyncParentModal: React.FC<SyncParentModalProps> = ({ isOpen, onClose, onSync }) => {
    const [stage, setStage] = useState<SyncStage>('confirm');
    const [result, setResult] = useState<{ success: number; failed: number; skipped: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStage('confirm');
            setResult(null);
            setError(null);
        }
    }, [isOpen]);

    const handleStart = async () => {
        setStage('syncing');
        setError(null);
        try {
            const res = await onSync();
            setResult(res);
            setStage('done');
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
            setStage('done');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* CONFIRM STAGE */}
                {stage === 'confirm' && (
                    <>
                        <div className="p-8 pb-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={24} className="text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-800">Sinkronisasi Akun Orang Tua</h3>
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                        Proses ini akan membuat akun login orang tua untuk semua siswa yang belum memiliki akun.
                                    </p>
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-xs font-bold text-blue-700 mb-2">YANG AKAN DIBUAT:</p>
                                        <ul className="text-xs text-blue-600 space-y-1.5">
                                            <li className="flex items-start gap-2">
                                                <ArrowRight size={12} className="mt-0.5 shrink-0" />
                                                <span>Profile login: <strong>ortu_{`{NIS}`}</strong> / password = <strong>NIS</strong></span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <ArrowRight size={12} className="mt-0.5 shrink-0" />
                                                <span>Tautan akun orang tua ke data siswa</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3">
                                        Siswa yang sudah memiliki akun akan dilewati.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm">
                                Batal
                            </button>
                            <button onClick={handleStart} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 text-sm flex items-center justify-center gap-2">
                                <Users size={16} /> Mulai Sinkronisasi
                            </button>
                        </div>
                    </>
                )}

                {/* SYNCING STAGE */}
                {stage === 'syncing' && (
                    <div className="p-8">
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                                    <Loader2 size={40} className="text-purple-500 animate-spin" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                    <Users size={12} className="text-white" />
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg text-slate-800">Memproses...</h3>
                                <p className="text-sm text-slate-500 mt-1">Membuat akun orang tua untuk siswa</p>
                            </div>
                            <div className="w-full max-w-xs">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Mohon tunggu, jangan tutup halaman ini</p>
                        </div>
                    </div>
                )}

                {/* DONE STAGE */}
                {stage === 'done' && (
                    <>
                        <div className="p-8 pb-6">
                            {error ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                        <XCircle size={32} className="text-red-500" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg text-slate-800">Gagal</h3>
                                        <p className="text-sm text-red-500 mt-1">{error}</p>
                                    </div>
                                </div>
                            ) : result ? (
                                <>
                                    <div className="flex flex-col items-center gap-3 py-2">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.failed > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                                            {result.failed > 0
                                                ? <AlertTriangle size={32} className="text-amber-500" />
                                                : <CheckCircle size={32} className="text-green-500" />
                                            }
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-bold text-lg text-slate-800">
                                                {result.failed > 0 ? 'Selesai dengan Peringatan' : 'Sinkronisasi Berhasil'}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Diproses dari {result.total} siswa</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <CheckCircle size={16} className="text-green-500" />
                                                <p className="text-2xl font-bold text-green-600">{result.success}</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-wider">Berhasil</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <SkipForward size={16} className="text-slate-400" />
                                                <p className="text-2xl font-bold text-slate-500">{result.skipped}</p>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Sudah Ada</p>
                                        </div>
                                        <div className={`rounded-xl p-4 text-center border ${result.failed > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <XCircle size={16} className={result.failed > 0 ? 'text-red-500' : 'text-slate-300'} />
                                                <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-600' : 'text-slate-300'}`}>{result.failed}</p>
                                            </div>
                                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${result.failed > 0 ? 'text-red-600' : 'text-slate-300'}`}>Gagal</p>
                                        </div>
                                    </div>

                                    {result.failed > 0 && (
                                        <p className="text-xs text-amber-600 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            Sebagian siswa gagal diproses. Coba ulangi untuk siswa yang gagal, atau periksa log konsol.
                                        </p>
                                    )}
                                </>
                            ) : null}
                        </div>
                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm">
                                Tutup
                            </button>
                            {result && result.failed > 0 && (
                                <button onClick={handleStart} className="flex-1 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 text-sm flex items-center justify-center gap-2">
                                    <Loader2 size={16} /> Ulangi
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default SyncParentModal;
