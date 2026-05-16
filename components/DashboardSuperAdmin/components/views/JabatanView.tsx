import React from 'react';
import { ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';

interface JabatanViewProps {
    positions: any[];
    handleAddPosition: () => void;
    handleEditItem: (item: any, type: string) => void;
    handleDeletePosition: (id: number) => void;
    setActiveView: (view: string) => void;
}

const JabatanView: React.FC<JabatanViewProps> = ({
    positions,
    handleAddPosition,
    handleEditItem,
    handleDeletePosition,
    setActiveView
}) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in slide-in-from-right flex flex-col">
            {/* Header Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('data_guru')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180 text-slate-500" /></button>
                    <h2 className="text-xl font-bold text-[#1E1B4B]">Kelola Jabatan</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAddPosition} className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-colors border border-purple-200 shadow-sm">
                        <Plus size={18} /> Tambah Jabatan
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Jabatan</th>
                            <th className="p-4 border-r border-slate-200">Kategori</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {positions.map((item, i) => (
                            <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                                <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                <td className="p-4 font-bold text-slate-700">{item.nama}</td>
                                <td className="p-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">{item.kategori}</span></td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handleEditItem(item, 'Jabatan')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Edit size={16} /></button>
                                    <button onClick={() => handleDeletePosition(item.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JabatanView;
