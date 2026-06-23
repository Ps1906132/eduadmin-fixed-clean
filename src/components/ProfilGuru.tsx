import React, { useState, useRef } from 'react';
import { ChevronLeft, Camera, LogOut, Save, User, BookOpen, Hash, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfilGuruProps {
    user: any;
    onBack: () => void;
    onLogout: () => void;
    nipOverride?: string;
    mapelOverride?: string;
}

const ProfilGuru: React.FC<ProfilGuruProps> = ({ user, onBack, onLogout, nipOverride, mapelOverride }) => {
    // Local state for editing
    const [nama, setNama] = useState(user?.nama || 'Guru');
    const [nip, setNip] = useState(user?.nip || nipOverride || '');
    const [mapel, setMapel] = useState(user?.mapel || mapelOverride || '');

    // File upload ref
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatar, setAvatar] = useState(user?.avatar || null);

    // Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword) { toast.error('Password saat ini harus diisi'); return; }
        if (!newPassword) { toast.error('Password baru harus diisi'); return; }
        if (newPassword.length < 6) { toast.error('Password baru minimal 6 karakter'); return; }
        if (newPassword !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }

        setSavingPassword(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    user_id: user?.id,
                    current_password: currentPassword,
                    new_password: newPassword,
                }),
            });

            if (res.ok) {
                toast.success('Password berhasil diubah!');
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err?.message || 'Gagal mengubah password');
            }
        } catch {
            toast.error('Koneksi gagal. Coba lagi.');
        } finally {
            setSavingPassword(false);
        }
    };

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

                    {/* Ganti Password */}
                    <div className="border-t border-slate-100 pt-6">
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-[#004AAD] transition-colors w-full text-left"
                        >
                            <Lock size={16} className="text-slate-400" />
                            {showPasswordForm ? 'Tutup' : 'Ganti Password'}
                            <ChevronLeft size={16} className={`ml-auto transition-transform ${showPasswordForm ? 'rotate-90' : '-rotate-90'}`} />
                        </button>

                        {showPasswordForm && (
                            <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-200">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Password Saat Ini</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPw ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 focus:border-[#004AAD] transition-all pr-10"
                                            placeholder="Masukkan password saat ini"
                                        />
                                        <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPw ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 focus:border-[#004AAD] transition-all pr-10"
                                            placeholder="Minimal 6 karakter"
                                        />
                                        <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Konfirmasi Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPw ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 focus:border-[#004AAD] transition-all pr-10"
                                            placeholder="Ulangi password baru"
                                        />
                                        <button onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={savingPassword}
                                    className="w-full bg-[#004AAD] text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Lock size={16} />
                                    {savingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
                                </button>
                            </div>
                        )}
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
