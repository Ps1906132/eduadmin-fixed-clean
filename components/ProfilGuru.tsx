import React, { useState, useRef } from 'react';
import { ChevronLeft, Camera, LogOut, Save, User, BookOpen, Hash, MapPin } from 'lucide-react';

interface ProfilGuruProps {
    user: any;
    onBack: () => void;
    onLogout: () => void;
}

const ProfilGuru: React.FC<ProfilGuruProps> = ({ user, onBack, onLogout }) => {
    // Local state for editing
    const [nama, setNama] = useState(user?.nama || 'Guru Mata Pelajaran');
    const [nip, setNip] = useState(user?.nip || '19850712 201001 1 009');
    const [mapel, setMapel] = useState(user?.mapel || 'Pendidikan Agama Islam'); // Bisa jadi array nanti

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatar, setAvatar] = useState(user?.avatar || null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="font-bold text-lg text-slate-800">Profil Saya</h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 pb-20">
                {/* Profile Header (Foto) */}
                <div className="bg-white p-6 border-b border-slate-100 flex flex-col items-center">
                    <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-100 flex items-center justify-center">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-400" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 bg-[#004AAD] text-white rounded-full border-2 border-white shadow-sm hover:bg-blue-700 transition-colors">
                            <Camera size={16} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="text-xs text-slate-400">Ketuk untuk mengganti foto</p>
                </div>

                {/* Form Edit */}
                <div className="p-6 space-y-6">
                    {/* Nama Lengkap */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User size={16} className="text-[#004AAD]" />
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 focus:border-[#004AAD] transition-all"
                        />
                    </div>

                    {/* NIP */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Hash size={16} className="text-[#004AAD]" />
                            Nomor Induk Pegawai (NIP)
                        </label>
                        <input
                            type="text"
                            value={nip}
                            onChange={(e) => setNip(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-mono text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 focus:border-[#004AAD] transition-all"
                        />
                    </div>

                    {/* Mata Pelajaran */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <BookOpen size={16} className="text-[#004AAD]" />
                            Mata Pelajaran Diampu
                        </label>
                        {/* Contoh List Mapel - Bisa dibuat array dynamic input */}
                        <div className="bg-white border border-slate-200 rounded-xl p-2 space-y-2">
                            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <input
                                    type="text"
                                    value={mapel}
                                    onChange={(e) => setMapel(e.target.value)}
                                    className="bg-transparent border-none text-sm font-bold text-slate-700 w-full focus:outline-none"
                                />
                            </div>
                            {/* Placeholder for adding more */}
                            <button className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
                                + Tambah Mapel Lain
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-3 z-20">
                <button className="w-full bg-[#004AAD] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                    <Save size={18} />
                    Simpan Perubahan
                </button>

                <button
                    onClick={onLogout}
                    className="w-full bg-red-50 text-red-600 py-3.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
                >
                    <LogOut size={18} />
                    Keluar Aplikasi
                </button>
            </div>
        </div>
    );
};

export default ProfilGuru;
