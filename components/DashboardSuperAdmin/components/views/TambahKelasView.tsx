import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus, Trash2, Edit } from 'lucide-react';

interface TambahKelasViewProps {
    setActiveView: (view: string) => void;
    classes: any[];
    setClasses: (classes: any[]) => void;
    teachers: any[];
    students: any[];
    setShowAddClassModal: (show: boolean) => void;
    handleDeleteClass?: (id: string | number) => void;
    handleEditClass?: (cls: any) => void;
}

const TambahKelasView: React.FC<TambahKelasViewProps> = ({
    setActiveView,
    classes,
    setClasses,
    teachers,
    students,
    setShowAddClassModal,
    handleDeleteClass,
    handleEditClass
}) => {
    const [visibleCount, setVisibleCount] = useState<number>(20);
    const [deletingId, setDeletingId] = useState<string | number | null>(null);

    const derivedClasses = useMemo(() => {
        return classes.map(cls => {
            // Find teacher who is assigned as wali for this class
            const waliGuru = teachers.find(t => t.wali === cls.nama);
            // Count students in this class
            const studentCount = students.filter(s => s.kelas === cls.nama).length;

            return {
                ...cls,
                wali: waliGuru ? waliGuru.nama : 'Belum Ditentukan',
                siswa: studentCount
            };
        });
    }, [classes, teachers, students]);

    const sortedClasses = useMemo(() => {
        return derivedClasses.sort((a: any, b: any) => a.tingkat - b.tingkat);
    }, [derivedClasses]);

    const displayedClasses = useMemo(() => {
        return sortedClasses.slice(0, visibleCount);
    }, [sortedClasses, visibleCount]);

    const handleDeleteClassLocal = async (id: any) => {
        // Prevent double-click
        if (deletingId === id) return;
        
        setDeletingId(id);
        try {
            if (handleDeleteClass) {
                // handleDeleteClass sudah include confirmation dialog
                await handleDeleteClass(id);
            } else {
                // Fallback jika handleDeleteClass tidak ada
                if (confirm("Hapus kelas ini?")) {
                    const updatedClasses = classes.filter(c => c.id.toString() !== id.toString());
                    setClasses(updatedClasses);
                    // Update localStorage jika tidak ada handleDeleteClass
                    localStorage.setItem('classes_data_v11', JSON.stringify(updatedClasses));
                }
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in slide-in-from-right flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('data_siswa')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180" /></button>
                    <h2 className="text-xl font-bold">Tambahkan Kelas</h2>
                </div>
                <button onClick={() => setShowAddClassModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2"><Plus size={18} /> Buat Kelas</button>
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
                                    <tr key={cls.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-center text-slate-500 border-r border-slate-50">{index + 1}</td>
                                        <td className="p-4 font-bold text-slate-700 border-r border-slate-50">{cls.nama}</td>
                                        <td className="p-4 text-slate-600 border-r border-slate-50">{cls.tingkat}</td>
                                        <td className="p-4 text-slate-600 border-r border-slate-50">{cls.paralel}</td>
                                        <td className="p-4 text-center">
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
                                                    onClick={() => handleDeleteClassLocal(cls.id)}
                                                    disabled={deletingId === cls.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Hapus Kelas"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Belum ada data kelas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer controls */}
                <div className="border-t border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        <span className="font-bold">Menampilkan</span> <span className="font-bold text-blue-600">{displayedClasses.length}</span> <span className="font-bold">dari</span> <span className="font-bold text-blue-600">{sortedClasses.length}</span> <span className="font-bold">kelas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-slate-600">Pilih Jumlah terlihat:</label>
                        <select 
                            value={visibleCount}
                            onChange={(e) => setVisibleCount(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer"
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
    );
};

export default TambahKelasView;
