import React, { useState } from 'react';
import { User, Camera, LogOut, Save, MapPin, Calendar, Edit2, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfilAkunProps {
    user: any;
    onLogout: () => void;
    onBack: () => void;
}

const ProfilAkun: React.FC<ProfilAkunProps> = ({ user, onLogout, onBack }) => {
    const [namaAyah, setNamaAyah] = useState(user?.parentName || '');
    const [namaIbu, setNamaIbu] = useState(user?.motherName || '');
    const [namaAnak, setNamaAnak] = useState(user?.studentName || '');
    const [tempatLahir, setTempatLahir] = useState(user?.birthPlace || '');
    const [tanggalLahir, setTanggalLahir] = useState(user?.birthDate || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
    const [saving, setSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) { toast.error('Sesi habis, silakan login ulang'); return; }
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

            // Update parent name in profiles table
            if (namaAyah && namaAyah !== user?.parentName) {
                const profileRes = await fetch(`/api/profiles?id=eq.${user?.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ full_name: namaAyah })
                });
                if (!profileRes.ok) throw new Error('Gagal update profil');
            }

            // Update parent_name in students table if we have studentId
            const studentId = user?.studentId;
            if (studentId) {
                const updateData: any = {};
                if (namaAyah) updateData.parent_name = namaAyah;
                if (namaIbu) updateData.mother_name = namaIbu;

                if (Object.keys(updateData).length > 0) {
                    const studentRes = await fetch(`/api/students?id=eq.${studentId}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify(updateData)
                    });
                    if (!studentRes.ok) throw new Error('Gagal update data siswa');
                }
            }

            toast.success('Profil berhasil disimpan!');
        } catch (err) {
            toast.error('Gagal menyimpan profil');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                    <User className="text-[#004AAD]" />
                    Profil Akun
                </h2>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#004AAD] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform disabled:opacity-50">
                    <Save size={16} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-400 to-blue-600 opacity-10"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative group cursor-pointer mb-6">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-[#004AAD] text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <div className="w-full space-y-4">
                            <h3 className="font-bold text-slate-800 text-lg text-center mb-2">Data Orang Tua</h3>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Nama Ayah</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-500 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">A</div>
                                    <input type="text" value={namaAyah} onChange={(e) => setNamaAyah(e.target.value)}
                                        className="bg-transparent w-full outline-none font-medium text-slate-700" placeholder="Nama Ayah" />
                                    <Edit2 size={14} className="text-slate-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Nama Ibu</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-pink-500 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs shrink-0">I</div>
                                    <input type="text" value={namaIbu} onChange={(e) => setNamaIbu(e.target.value)}
                                        className="bg-transparent w-full outline-none font-medium text-slate-700" placeholder="Nama Ibu" />
                                    <Edit2 size={14} className="text-slate-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <UserCheck size={20} className="text-[#004AAD]" />
                        Data Siswa
                    </h3>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Nama Siswa</label>
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <User size={18} className="text-slate-400" />
                                    <input type="text" value={namaAnak} onChange={(e) => setNamaAnak(e.target.value)}
                                        className="bg-transparent w-full outline-none font-bold text-slate-700" readOnly />
                                    <Edit2 size={14} className="text-slate-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Tempat Lahir</label>
                                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <MapPin size={16} className="text-slate-400" />
                                        <input type="text" value={tempatLahir} readOnly
                                            className="bg-transparent w-full outline-none font-medium text-slate-700 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Tanggal Lahir</label>
                                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <Calendar size={16} className="text-slate-400" />
                                        <input type="text" value={tanggalLahir} readOnly
                                            className="bg-transparent w-full outline-none font-medium text-slate-700 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 mt-8 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 hover:scale-[1.02] active:scale-95 transition-all border border-red-100 shadow-sm">
                    <LogOut size={20} />
                    Keluar dari Aplikasi
                </button>

                <div className="text-center text-xs text-slate-400 font-medium pt-4">
                    Versi Aplikasi 1.0.5 <br />
                    &copy; 2025 EduAdmin Sekolah
                </div>
            </div>
        </div>
    );
};

export default ProfilAkun;
