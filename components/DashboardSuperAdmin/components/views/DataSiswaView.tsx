import React from 'react';
import { Users, School, UploadCloud, FolderPlus, UserPlus, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSiswaViewProps {
    setActiveView: (view: string) => void;
}

const DataSiswaView: React.FC<DataSiswaViewProps> = ({ setActiveView }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-sm animate-in fade-in flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <Users size={28} className="text-blue-800" />
                <h2 className="text-2xl font-bold text-[#1E1B4B]">Data Siswa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <button onClick={() => setActiveView('tambah_kelas_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-blue-50 hover:bg-blue-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-blue-200">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><School size={32} /></div>
                    <span className="font-bold text-lg text-blue-900">Tambah Kelas</span>
                </button>
                <button onClick={() => setActiveView('upload_siswa_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-indigo-50 hover:bg-indigo-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-indigo-200">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UploadCloud size={32} /></div>
                    <span className="font-bold text-lg text-indigo-900">Upload Data Siswa</span>
                </button>
                <button onClick={() => setActiveView('upload_perkelas_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-orange-50 hover:bg-orange-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-orange-200">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><FolderPlus size={32} /></div>
                    <span className="font-bold text-lg text-orange-900">Upload Perkelas</span>
                </button>
                <button onClick={() => setActiveView('upload_kelas_satu_view')} className="flex flex-col items-center justify-center gap-3 p-8 bg-green-50 hover:bg-green-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-green-200">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
                    <span className="font-bold text-lg text-green-900">Upload Siswa Baru</span>
                </button>
                <button onClick={() => setActiveView('cetak_kartu_login')} className="flex flex-col items-center justify-center gap-3 p-8 bg-purple-50 hover:bg-purple-100 rounded-[2.5rem] transition-all group border-2 border-transparent hover:border-purple-200">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><CreditCard size={32} /></div>
                    <span className="font-bold text-lg text-purple-900">Cetak Kartu Login</span>
                </button>
            </div>
        </div>
    );
};

export default DataSiswaView;
