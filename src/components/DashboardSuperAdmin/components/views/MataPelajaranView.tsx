import React from 'react';
import { ChevronRight, Plus, UserPlus, Trash2, Edit } from 'lucide-react';

interface MataPelajaranViewProps {
    mapelViewMode: 'master' | 'plotting';
    setMapelViewMode: (mode: 'master' | 'plotting') => void;
    teacherAssignments: any[];
    setTeacherAssignments: (assignments: any[]) => void;
    teachers: any[];
    subjects: any[];
    handleAddGroup: () => void;
    setShowSubjectModal: (show: boolean) => void;
    setShowPlottingModal: (show: boolean) => void;
    handleEditItem: (item: any, type: string) => void;
    setActiveView: (view: string) => void;
    handleDeleteSubject?: (id: number | string) => void;
}

const MataPelajaranView: React.FC<MataPelajaranViewProps> = ({
    mapelViewMode,
    setMapelViewMode,
    teacherAssignments,
    setTeacherAssignments,
    teachers,
    subjects,
    handleAddGroup,
    setShowSubjectModal,
    setShowPlottingModal,
    handleEditItem,
    setActiveView,
    handleDeleteSubject
}) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in slide-in-from-right flex flex-col">
            {/* Header Buttons */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                <button onClick={() => setActiveView('data_guru')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180 text-slate-500" /></button>
                <div>
                    <h2 className="text-xl font-bold text-[#1E1B4B]">Kelola Mata Pelajaran</h2>
                    <p className="text-slate-500 text-sm">Atur mata pelajaran dan pengampunya</p>
                </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setMapelViewMode('plotting')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mapelViewMode === 'plotting' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Plotting Guru</button>
                <button onClick={() => setMapelViewMode('master')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mapelViewMode === 'master' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Data Master Mapel</button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
                {mapelViewMode === 'master' ? (
                    <>
                        <button onClick={handleAddGroup} className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm">
                            <Plus size={18} /> Kelompok
                        </button>
                        <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            <Plus size={18} /> Tambah Mapel
                        </button>
                    </>
                ) : (
                    <button onClick={() => setShowPlottingModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        <UserPlus size={18} /> Plotting Guru
                    </button>
                )}
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50 mt-4">
                {mapelViewMode === 'plotting' ? (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                                <th className="p-4 border-r border-slate-200">Nama Guru Pengampu</th>
                                <th className="p-4 border-r border-slate-200">NIP</th>
                                <th className="p-4 border-r border-slate-200 text-center">Untuk Kelas</th>
                                <th className="p-4 border-r border-slate-200">Mata Pelajaran yang Diampu</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {Array.isArray(teacherAssignments) && teacherAssignments.map((assign, i) => {
                                const guru = Array.isArray(teachers) ? teachers.find(t => t.id === assign.teacherId) : null;
                                const mapelNames = (Array.isArray(assign.subjectIds) && Array.isArray(subjects))
                                    ? assign.subjectIds.map((sid: any) => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(', ')
                                    : '-';

                                return (
                                    <tr key={assign.id || i} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                        <td className="p-4 font-bold text-slate-800">{guru?.nama || 'Unknown'}</td>
                                        <td className="p-4 font-mono text-slate-600">{guru?.nip || '-'}</td>
                                        <td className="p-4 text-center font-bold text-blue-700 bg-blue-50/50 rounded">{assign.classNama}</td>
                                        <td className="p-4 text-slate-700 whitespace-normal max-w-xs">{mapelNames}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button onClick={() => {
                                                if (confirm('Hapus plotting ini?')) {
                                                    setTeacherAssignments(teacherAssignments.filter(a => a.id !== assign.id));
                                                }
                                            }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                                <th className="p-4 border-r border-slate-200">Nama Mata Pelajaran</th>
                                <th className="p-4 border-r border-slate-200">Kode</th>
                                <th className="p-4 border-r border-slate-200">Tingkat</th>
                                <th className="p-4 border-r border-slate-200">Kelompok</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {subjects.map((mapel, i) => (
                                <tr key={mapel.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                    <td className="p-4 font-bold text-slate-800">{mapel.name}</td>
                                    <td className="p-4 font-mono text-slate-600">{mapel.code}</td>
                                    <td className="p-4 text-slate-600">{mapel.level}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">{mapel.group}</span></td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => handleEditItem(mapel, 'Mata Pelajaran')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteSubject && handleDeleteSubject(mapel.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MataPelajaranView;
