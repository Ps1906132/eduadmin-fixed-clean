import React from 'react';
import { School, Edit, Trash2 } from 'lucide-react';

interface KelasWaliViewProps {
    derivedClasses: any[];
    onEditClass: (kelas: any) => void;
    onDeleteClass: (id: number) => void;
}

const KelasWaliView: React.FC<KelasWaliViewProps> = ({
    derivedClasses,
    onEditClass,
    onDeleteClass
}) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in fade-in flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <School size={28} className="text-blue-800" />
                <h2 className="text-xl font-bold text-[#1E1B4B]">Data Kelas & Wali kelas</h2>
            </div>

            <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Kelas</th>
                            <th className="p-4 border-r border-slate-200 text-center">Tingkat</th>
                            <th className="p-4 border-r border-slate-200 text-center">Paralel</th>
                            <th className="p-4 border-r border-slate-200">Wali Kelas</th>
                            <th className="p-4 border-r border-slate-200 text-center">Jumlah Siswa</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {derivedClasses.map((kelas, i) => (
                            <tr key={kelas.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                <td className="p-4 font-bold text-slate-800">{kelas.nama}</td>
                                <td className="p-4 text-center text-slate-600">{kelas.tingkat}</td>
                                <td className="p-4 text-center text-slate-600">{kelas.paralel}</td>
                                <td className="p-4">
                                    {kelas.wali === 'Belum Ditentukan' ? (
                                        <span className="text-red-500 italic text-xs font-bold bg-red-50 px-2 py-1 rounded-md">Belum Ada</span>
                                    ) : (
                                        <span className="text-slate-700 font-medium">{kelas.wali}</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{kelas.siswa} Siswa</span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => onEditClass(kelas)} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg group tooltip-trigger relative">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => onDeleteClass(kelas.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KelasWaliView;
