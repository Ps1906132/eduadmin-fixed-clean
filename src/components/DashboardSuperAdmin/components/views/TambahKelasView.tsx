import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus, Trash2, Edit, AlertTriangle, X, Loader2 } from 'lucide-react';

// ─── Tipe return handleDeleteClass harus sesuai dengan useClasses hook ────────
type DeleteResult = { success: boolean; error?: string };

interface TambahKelasViewProps {
    setActiveView: (view: string) => void;
    classes: any[];
    setClasses: (classes: any[]) => void;
    teachers: any[];
    students: any[];
    setShowAddClassModal: (show: boolean) => void;
    user?: any;
    /** Opsional: jika tidak di-pass, fallback ke penghapusan lokal */
    handleDeleteClass?: (id: string | number) => Promise<DeleteResult>;
    handleEditClass?: (cls: any) => void;
}

const TambahKelasView: React.FC<TambahKelasViewProps> = ({
    setActiveView,
    classes,
    setClasses,
    teachers,
    students,
    setShowAddClassModal,
    user,
    handleDeleteClass,
    handleEditClass
}) => {
    const role = user?.roleCode || user?.role || user?.role_type;
    const isKS = role?.toLowerCase() === 'ks';
    const [visibleCount, setVisibleCount] = useState<number>(20);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // ── Derived: gabungkan data kelas dengan wali dan jumlah siswa ────────────
    const derivedClasses = useMemo(() => {
        return classes.map(cls => {
            const waliGuru = teachers.find((t: any) => t.wali === cls.nama);
            const studentCount = students.filter((s: any) => s.kelas === cls.nama).length;
            return {
                ...cls,
                wali: waliGuru ? waliGuru.nama : 'Belum Ditentukan',
                siswa: studentCount
            };
        });
    }, [classes, teachers, students]);

    const sortedClasses = useMemo(() => {
        return [...derivedClasses].sort((a: any, b: any) => {
            const ta = parseInt(a.tingkat) || 0;
            const tb = parseInt(b.tingkat) || 0;
            return ta - tb;
        });
    }, [derivedClasses]);

    const displayedClasses = useMemo(() => {
        return sortedClasses.slice(0, visibleCount);
    }, [sortedClasses, visibleCount]);

    // ─────────────────────────────────────────────────────────────────────────
    //  HANDLER HAPUS — dengan await + error handling yang benar
    // ─────────────────────────────────────────────────────────────────────────
    const handleDeleteClassLocal = async (id: any) => {
        if (deletingId === id) return; // cegah double-klik
        setDeleteError(null);
        setDeletingId(id);

        try {
            if (handleDeleteClass) {
                // ── Gunakan handler D1 dari useClasses hook ──
                const result: DeleteResult = await handleDeleteClass(id);
                if (!result.success && result.error) {
                    setDeleteError(result.error);
                    return; // Jangan tutup modal konfirmasi
                }
            } else {
                // ── Fallback: hapus dari state lokal + localStorage ──
                const updatedClasses = classes.filter(
                    (c: any) => c.id.toString() !== id.toString()
                );
                setClasses(updatedClasses);
                localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
            }
            // Berhasil → tutup modal konfirmasi
            setConfirmDeleteId(null);
            setDeleteError(null);
        } catch (err) {
            console.error('[TambahKelasView] handleDeleteClassLocal error:', err);
            setDeleteError('Terjadi kesalahan tidak terduga saat menghapus kelas.');
        } finally {
            setDeletingId(null);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
        <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in slide-in-from-right flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView('data_siswa')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Kembali ke Data Siswa"
                    >
                        <ChevronRight className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Manajemen Kelas</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Total {sortedClasses.length} kelas terdaftar</p>
                    </div>
                </div>
                {!isKS && (
                    <button
                        onClick={() => setShowAddClassModal(true)}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} /> Buat Kelas
                    </button>
                )}
            </div>

            {/* Table Container dengan Scroll */}
            <div className="flex-1 flex flex-col min-h-0 border border-slate-100 rounded-3xl overflow-hidden">

                {/* Scrollable Table Area */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-center font-bold text-slate-700 border-r border-slate-100 text-sm w-16">No</th>
                                <th className="p-4 font-bold text-slate-700 border-r border-slate-100 text-sm">Nama Kelas</th>
                                <th className="p-4 font-bold text-slate-700 border-r border-slate-100 text-sm">Tingkat</th>
                                <th className="p-4 font-bold text-slate-700 border-r border-slate-100 text-sm">Paralel</th>
                                <th className="p-4 text-center font-bold text-slate-700 text-sm w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedClasses.length > 0 ? (
                                displayedClasses.map((cls: any, index: number) => (
                                    <tr
                                        key={cls.id}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-4 text-center text-slate-500 border-r border-slate-50">{index + 1}</td>
                                        <td className="p-4 font-bold text-slate-700 border-r border-slate-50">{cls.nama}</td>
                                        <td className="p-4 text-slate-600 border-r border-slate-50">
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                                                Kelas {cls.tingkat}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 border-r border-slate-50">{cls.paralel}</td>
                                        <td className="p-4 text-center">
                                            {isKS ? (
                                                <span className="text-xs text-slate-400 italic">Read Only</span>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    {handleEditClass && (
                                                        <button
                                                            onClick={() => handleEditClass(cls)}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Edit Kelas"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setDeleteError(null); setConfirmDeleteId(cls.id); }}
                                                        disabled={deletingId === cls.id}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Hapus Kelas"
                                                    >
                                                        {deletingId === cls.id
                                                            ? <Loader2 size={18} className="animate-spin" />
                                                            : <Trash2 size={18} />
                                                        }
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                <Plus size={24} />
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm">Belum ada data kelas</p>
                                            {!isKS && <p className="text-xs text-slate-400">Klik tombol "Buat Kelas" untuk menambahkan kelas baru</p>}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer controls */}
                <div className="border-t border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-bold">Menampilkan</span>{' '}
                        <span className="font-bold text-blue-600">{displayedClasses.length}</span>{' '}
                        <span className="font-bold">dari</span>{' '}
                        <span className="font-bold text-blue-600">{sortedClasses.length}</span>{' '}
                        <span className="font-bold">kelas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-slate-600">Tampilkan:</label>
                        <select
                            value={visibleCount}
                            onChange={(e) => setVisibleCount(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                            <option value={40}>40</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            MODAL: KONFIRMASI HAPUS KELAS
            Ditampilkan di luar div utama agar tidak ter-clip oleh overflow
        ══════════════════════════════════════════════════════════════════════ */}
        {!isKS && confirmDeleteId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => { if (!deletingId) { setConfirmDeleteId(null); setDeleteError(null); } }}
                />
                <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-base">Hapus Kelas</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Kelas yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
                            </p>
                        </div>
                        {!deletingId && (
                            <button
                                onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Error dari D1 (misal FK constraint) */}
                    {deleteError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium leading-relaxed">
                            <strong>Gagal:</strong> {deleteError}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                            disabled={!!deletingId}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => handleDeleteClassLocal(confirmDeleteId)}
                            disabled={deletingId === confirmDeleteId}
                            className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {deletingId === confirmDeleteId ? (
                                <><Loader2 size={16} className="animate-spin" /> Menghapus...</>
                            ) : (
                                'Ya, Hapus'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default TambahKelasView;
