import React from 'react';
import { UserCog, BookOpen, Award, UserPlus } from 'lucide-react';

interface GuruStaffViewProps {
    setActiveView: (view: string) => void;
}

const GuruStaffView: React.FC<GuruStaffViewProps> = ({ setActiveView }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <UserCog size={28} className="text-blue-800" />
                <h2 className="text-xl font-bold text-[#1E1B4B]">Data Guru & Staff</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <button onClick={() => setActiveView('tambah_mapel_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-blue-50 hover:bg-blue-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-blue-200">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><BookOpen size={32} /></div>
                    <span className="font-bold text-lg text-blue-900">Tambah Mata Pelajaran</span>
                </button>
                <button onClick={() => setActiveView('tambah_jabatan_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-purple-50 hover:bg-purple-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-purple-200">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Award size={32} /></div>
                    <span className="font-bold text-lg text-purple-900">Tambah Jabatan</span>
                </button>
                <button onClick={() => setActiveView('tambah_guru_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-green-50 hover:bg-green-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-green-200">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
                    <span className="font-bold text-lg text-green-900">Tambah Data Guru</span>
                </button>
            </div>
        </div>
    );
};

export default GuruStaffView;
