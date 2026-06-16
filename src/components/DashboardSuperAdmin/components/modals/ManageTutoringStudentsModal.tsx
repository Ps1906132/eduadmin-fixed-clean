import React, { useState } from 'react';
import { X, Search, Plus, Trash2, User, Filter } from 'lucide-react';

interface ManageTutoringStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tutoringGroup: any; // The teacher/class object
    allStudents: any[];
    enrolledStudents: any[]; // List of student IDs or objects enrolled
    onAddStudent: (studentId: number) => void;
    onRemoveStudent: (studentId: number) => void;
    filterClassId?: string; // Filter available students by class
}

const ManageTutoringStudentsModal: React.FC<ManageTutoringStudentsModalProps> = ({
    isOpen, onClose, tutoringGroup, allStudents = [], enrolledStudents = [], onAddStudent, onRemoveStudent, filterClassId
}) => {
    const [search, setSearch] = useState('');
    const [useClassFilter, setUseClassFilter] = useState(!!filterClassId);

    if (!isOpen || !tutoringGroup) return null;

    const studentsList = Array.isArray(allStudents) ? allStudents : [];
    const enrolledList = Array.isArray(enrolledStudents) ? enrolledStudents : [];
    const activeFilterClass = useClassFilter && filterClassId ? filterClassId : null;

    // Filter students who are NOT enrolled yet
    const availableStudents = studentsList.filter(s =>
        s && s.id !== undefined &&
        !enrolledList.includes(s.id) &&
        (!activeFilterClass || (s.kelas || '').toString() === activeFilterClass) &&
        (((s.nama || '').toLowerCase().includes(search.toLowerCase())) ||
         ((s.kelas || '').toLowerCase().includes(search.toLowerCase())))
    );

    // Get full objects of enrolled students
    const validEnrolled = studentsList.filter(s => s && s.id !== undefined && enrolledList.includes(s.id));

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl scale-100 animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">Kelola Siswa Bimbingan</h3>
                        <p className="text-slate-500 text-sm">
                            Pengajar: <span className="font-bold text-blue-600">{tutoringGroup.name || tutoringGroup.nama || '-'}</span> | Mapel: {tutoringGroup.subjectName || tutoringGroup.subject || '-'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Available Students */}
                    <div className="flex-1 p-6 border-r border-slate-100 flex flex-col">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" /> Tambah Siswa
                        </h4>
                        {filterClassId && (
                            <div className="flex items-center gap-2 mb-3">
                                <button
                                    onClick={() => setUseClassFilter(!useClassFilter)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        useClassFilter
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                >
                                    <Filter size={14} />
                                    {useClassFilter ? `Kelas ${filterClassId}` : 'Semua Kelas'}
                                </button>
                            </div>
                        )}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau kelas..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {availableStudents.length === 0 ? (
                                <div className="text-center text-slate-400 py-10">
                                    <User size={40} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Tidak ada siswa ditemukan</p>
                                </div>
                            ) : (
                                availableStudents.map(student => (
                                    <div
                                        key={student.id}
                                        className="group p-4 border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all flex justify-between items-center cursor-pointer"
                                        onClick={() => onAddStudent(student.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                                {(student.nama || 'S').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{student.nama || 'Tanpa Nama'}</div>
                                                <div className="text-xs text-slate-500">Kelas {student.kelas || '-'}</div>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                            <Plus size={18} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Enrolled Students */}
                    <div className="flex-1 p-6 flex flex-col bg-slate-50/30">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <User size={20} className="text-emerald-600" /> Siswa Terdaftar ({validEnrolled.length})
                        </h4>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {validEnrolled.length === 0 ? (
                                <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                                    <User size={40} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm px-10">Pilih siswa dari daftar sebelah kiri untuk didaftarkan ke bimbingan ini</p>
                                </div>
                            ) : (
                                validEnrolled.map(student => (
                                    <div key={student.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                                                {(student.nama || 'S').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{student.nama || 'Tanpa Nama'}</div>
                                                <div className="text-xs text-slate-500">Kelas {student.kelas || '-'}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemoveStudent(student.id)}
                                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            title="Hapus dari bimbingan"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                    <button onClick={onClose} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200">
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageTutoringStudentsModal;
