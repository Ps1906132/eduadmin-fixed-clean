import React from 'react';
import {
    ChevronRight, Download, UploadCloud, UserPlus, Save, Edit, Trash2
} from 'lucide-react';

interface TeacherDataViewProps {
    teachers: any[];
    setTeachers: (teachers: any[]) => void;
    positions: any[];
    setActiveView: (view: string) => void;
    handleDownloadTemplate: () => void;
    handleUploadClick: () => void;
    handleAddTeacher: () => void;
    handleSaveData: () => void;
    handleEditItem: (item: any, type: string) => void;
    handleDeleteTeacher: (id: number) => void;
    classes?: any[];
}

const TeacherDataView: React.FC<TeacherDataViewProps> = ({
    teachers,
    setTeachers,
    positions,
    setActiveView,
    handleDownloadTemplate,
    handleUploadClick,
    handleAddTeacher,
    handleSaveData,
    handleEditItem,
    handleDeleteTeacher,
    classes
}) => {
    const classOptions = classes && classes.length > 0
        ? classes.map((c: any) => c.nama)
        : ['1A', '1B', '2A', '2B', '3A', '3B'];

    return (
        <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in slide-in-from-right flex flex-col">
            {/* Header Buttons */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('data_guru')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180 text-slate-500" /></button>
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1B4B]">Kelola Data Guru & Staff</h2>
                        <p className="text-slate-400 text-sm">Kelola akun, jabatan, dan penugasan guru</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                        <Download size={18} /> Template
                    </button>
                    <button onClick={handleUploadClick} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                        <UploadCloud size={18} /> Upload
                    </button>
                    <button onClick={handleAddTeacher} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm">
                        <UserPlus size={18} /> Tambah Guru
                    </button>
                    <button onClick={handleSaveData} className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                        <Save size={18} /> Simpan
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-12">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Lengkap</th>
                            <th className="p-4 border-r border-slate-200">NIP</th>
                            <th className="p-4 border-r border-slate-200 min-w-[200px]">Jabatan</th>

                            <th className="p-4 border-r border-slate-200 min-w-[150px]">Wali Kelas</th>
                            <th className="p-4 border-r border-slate-200">Username</th>
                            <th className="p-4 border-r border-slate-200">Password</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {teachers.map((guru, i) => (
                            <tr key={guru.id} className="hover:bg-green-50/50 transition-colors">
                                <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                <td className="p-4 font-bold text-slate-700">{guru.nama}</td>
                                <td className="p-4 font-mono text-slate-600">{guru.nip}</td>
                                {/* DROPDOWN JABATAN */}
                                <td className="p-4">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-green-500 cursor-pointer"
                                        defaultValue={guru.jabatan}
                                        onChange={(e) => {
                                            const newTeachers = [...teachers];
                                            newTeachers[i].jabatan = e.target.value;
                                            setTeachers(newTeachers);
                                        }}
                                    >
                                        {positions.map(p => (
                                            <option key={p.id} value={p.nama}>{p.nama}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* DROPDOWN WALI KELAS */}
                                <td className="p-4 hover:bg-slate-50">
                                    <select className="w-full bg-transparent border-none outline-none text-slate-700 font-bold cursor-pointer disabled:opacity-30"
                                        defaultValue={guru.wali}
                                        disabled={['Kepala Sekolah', 'Staff Tata Usaha', 'Operator Data'].includes(guru.jabatan)}
                                        onChange={(e) => {
                                            const newTeachers = [...teachers];
                                            newTeachers[i].wali = e.target.value;
                                            setTeachers(newTeachers);
                                        }}
                                    >
                                        <option value="-">-</option>
                                        {classOptions.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-slate-600">{guru.username}</td>
                                <td className="p-4 text-slate-600 font-mono text-sm bg-slate-50 px-2 rounded border border-slate-100">{guru.password}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handleEditItem(guru, 'Data Guru')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteTeacher(guru.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherDataView;
