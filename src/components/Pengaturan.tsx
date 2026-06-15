import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    Settings,
    School,
    MapPin,
    Upload,
    Calendar,
    User,
    UserCog,
    Palette,
    Save,
    Image as ImageIcon,
    Shield,
    History,
    Lock,
    Eye,
    EyeOff,
    Monitor,
    Moon,
    Sun,
    Globe,
    FileText,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Database
} from 'lucide-react';
import { schoolSettingsGlobal, teachersDataGlobal, updateTeachersGlobal } from '@/data/sharedData';
import { migrateLocalStorageToD1 } from '@/lib/migrateToD1';
import { hashPassword, verifyPassword } from '@/utils/auth';
import { db } from '@/lib/db';

const D1MigratorView: React.FC = () => {
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<any>(null);
    const [forceReset, setForceReset] = useState(true);

    const handleStartMigration = async () => {
        setIsMigrating(true);
        const toastId = toast.loading(forceReset ? 'Membersihkan database dan melakukan migrasi data...' : 'Melakukan migrasi data dari LocalStorage ke Cloudflare D1...');
        try {
            const result = await migrateLocalStorageToD1(forceReset);
            setIsMigrating(false);
            setMigrationResult(result);
            if (result.success) {
                toast.success(result.message, { id: toastId });
            } else {
                toast.error(result.message, { id: toastId });
            }
        } catch (error: any) {
            setIsMigrating(false);
            toast.error(`Terjadi kesalahan sistem: ${error.message || error}`, { id: toastId });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                    <Database className="text-blue-600 animate-pulse" /> Migrasi Database Cloudflare D1
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 mb-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-blue-200 text-blue-600 flex-shrink-0 shadow-sm">
                            <Database size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1">Pindahkan Data ke Cloudflare D1</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Fitur ini akan membaca seluruh data yang tersimpan di browser Anda (LocalStorage) meliputi:
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                                <li>Data Guru dan Profil Akun</li>
                                <li>Data Kelas dan Walinya</li>
                                <li>Data Siswa Aktif</li>
                                <li>Data Tagihan Keuangan & Pengeluaran Sekolah</li>
                            </ul>
                            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                                Seluruh data tersebut akan disinkronkan langsung ke basis data terpusat Cloudflare D1 SQLite.
                            </p>
                        </div>
                    </div>
                </div>

                {!migrationResult && (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-3xl text-center">
                        <AlertCircle className="text-amber-500 mb-3" size={32} />
                        <h5 className="font-bold text-slate-700 mb-1">Perhatian Sebelum Migrasi</h5>
                        <p className="text-slate-500 text-xs max-w-md mb-6 leading-relaxed">
                            Pastikan Anda memiliki koneksi internet yang stabil selama proses migrasi berlangsung. Proses ini tidak akan menghapus data lokal di browser Anda.
                        </p>
                        
                        <div className="flex items-center gap-3 mb-6 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
                            <input
                                type="checkbox"
                                id="forceReset"
                                checked={forceReset}
                                onChange={(e) => setForceReset(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="forceReset" className="text-xs text-slate-700 font-bold cursor-pointer select-none">
                                Bersihkan database D1 sebelum migrasi (Sangat Direkomendasikan untuk memperbaiki data yang corrupt)
                            </label>
                        </div>

                        <button
                            onClick={handleStartMigration}
                            disabled={isMigrating}
                            className={`px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center gap-3 ${
                                isMigrating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                            }`}
                        >
                            <RefreshCw size={18} className={isMigrating ? 'animate-spin' : ''} />
                            {isMigrating ? 'Sedang Memindahkan Data...' : 'Mulai Migrasi Data Sekarang'}
                        </button>
                    </div>
                )}

                {migrationResult && (
                    <div className={`p-6 border rounded-3xl animate-in zoom-in-95 duration-300 ${
                        migrationResult.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                    }`}>
                        <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                migrationResult.success ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-500 text-white shadow-lg shadow-red-100'
                            }`}>
                                {migrationResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${migrationResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                                    {migrationResult.success ? 'Migrasi Berhasil!' : 'Migrasi Gagal'}
                                </h4>
                                <p className={`text-sm mt-1 font-medium ${migrationResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {migrationResult.message}
                                </p>

                                {migrationResult.success && migrationResult.details && (
                                    <div className="mt-4 bg-white/65 border border-emerald-100/50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profil User</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.profiles}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Guru/Staff</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.staff}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kelas</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.classes}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Siswa</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.students}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tagihan SPP</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.bills}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-emerald-50 shadow-sm text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengeluaran</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">{migrationResult.details.expenses}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => setMigrationResult(null)}
                                    className="mt-6 px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                                >
                                    Ulangi Migrasi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PengaturanProps {
    schoolSettings: any;
    setSchoolSettings: (settings: any) => void;
}

const Pengaturan: React.FC<PengaturanProps> = ({ schoolSettings, setSchoolSettings }) => {
    const [activeTab, setActiveTab] = useState('profil');
    const [isLoading, setIsLoading] = useState(false);

    // 1. PROFIL SEKOLAH & 2. UPLOAD LOGO
    const [schoolProfile, setSchoolProfile] = useState({
        name: schoolSettings?.name || '',
        address: schoolSettings?.address || '',
        accreditation: schoolSettings?.accreditation || 'A',
        principal: schoolSettings?.principal || '',
        academicYear: schoolSettings?.academicYear || '2025/2026',
        status: schoolSettings?.status || 'Swasta',
        logo: schoolSettings?.logo || null as string | null,
        icon: schoolSettings?.icon || null as string | null
    });

    // 3. AKUN ADMINISTRATOR
    const [adminProfile, setAdminProfile] = useState(() => {
        const localUser = localStorage.getItem('eduadmin_user');
        const user = localUser ? JSON.parse(localUser) : null;
        
        return {
            id: user?.id || 'admin-001',
            name: user?.full_name || user?.nama || 'Administrator',
            username: user?.email || user?.username || 'admin',
            email: user?.email || '',
            role: user?.role || 'Administrator',
            isActive: true
        };
    });

    // 4. KEAMANAN
    const [security, setSecurity] = useState({
        oldPass: '',
        newPass: '',
        confirmPass: '',
        showPass: false
    });

    // 6. RIWAYAT PERUBAHAN
    const [logs, setLogs] = useState<any[]>([]);

    // Load Initial Data from D1
    useEffect(() => {
        const loadD1Data = async () => {
            setIsLoading(true);
            try {
                // Load School Settings
                const { data: settings, error: sError } = await db.from('school_settings').select('*').eq('id', 'settings-school').single();
                if (settings && !sError) {
                    setSchoolProfile(prev => ({
                        ...prev,
                        name: settings.school_name || prev.name,
                        address: settings.school_address || prev.address,
                        principal: settings.principal_name || prev.principal,
                        logo: settings.logo_url || prev.logo,
                        // Update fields if they exist in DB (diagnosed they might be missing)
                        accreditation: (settings as any).accreditation || prev.accreditation,
                        status: (settings as any).school_status || prev.status,
                        icon: (settings as any).icon_url || prev.icon
                    }));
                }

                // Load Admin Profile
                const { data: profile, error: pError } = await db.from('profiles').select('*').eq('id', adminProfile.id).single();
                if (profile && !pError) {
                    setAdminProfile(prev => ({
                        ...prev,
                        name: profile.full_name,
                        username: profile.email,
                        email: profile.email,
                        role: profile.role,
                        isActive: profile.is_active === 1
                    }));
                }

                // Load Logs from D1
                const { data: d1Logs, error: lError } = await db.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
                if (d1Logs && !lError) {
                    const mappedLogs = d1Logs.map((l: any) => ({
                        date: new Date(l.timestamp).toLocaleString('id-ID'),
                        admin: l.user_role || 'Admin',
                        action: l.action
                    }));
                    setLogs(mappedLogs);
                } else {
                    // Fallback to localStorage if D1 fails or empty
                    const saved = localStorage.getItem('audit_logs_v10');
                    if (saved) setLogs(JSON.parse(saved));
                }
            } catch (err) {
                console.error("Failed to load D1 data", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadD1Data();
    }, [adminProfile.id]);

    // Helpers
    const addLog = async (action: string, table?: string, recordId?: string) => {
        const timestamp = new Date().toISOString();
        const newLogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: timestamp,
            user_id: adminProfile.id,
            user_role: adminProfile.role,
            module: 'PENGATURAN',
            action: action,
            table_name: table || 'school_settings',
            record_id: recordId || 'settings-school',
            status: 'SUCCESS'
        };

        // Save to D1
        try {
            await db.from('audit_logs').insert(newLogEntry);
        } catch (e) {
            console.error("Failed to save audit log to D1", e);
        }

        // UI Update
        const newLogUI = {
            date: new Date().toLocaleString('id-ID'),
            admin: adminProfile.name,
            action: action
        };
        setLogs(prev => [newLogUI, ...prev].slice(0, 50));
    };

    const handleSaveProfil = async () => {
        const newSettings = {
            ...schoolSettings,
            name: schoolProfile.name,
            address: schoolProfile.address,
            accreditation: schoolProfile.accreditation,
            principal: schoolProfile.principal,
            academicYear: schoolProfile.academicYear,
            status: schoolProfile.status,
            logo: schoolProfile.logo,
            icon: schoolProfile.icon
        };

        try {
            // Update D1 - Only fields known to exist in schema
            const updateData: any = {
                school_name: schoolProfile.name,
                school_address: schoolProfile.address,
                principal_name: schoolProfile.principal,
                logo_url: schoolProfile.logo,
                updated_at: new Date().toISOString()
            };

            // Attempt to add extra fields (wrapped in try-catch if db layer doesn't handle missing columns)
            // But usually we just send what we think is there.
            // Diagnosis: icon_url, accreditation, school_status might be missing from D1.
            
            await db.from('school_settings').update(updateData).eq('id', 'settings-school');

            // Sync to Global
            Object.assign(schoolSettingsGlobal, {
                name: schoolProfile.name,
                address: schoolProfile.address,
                principal: schoolProfile.principal,
                academicYear: schoolProfile.academicYear,
                logo: schoolProfile.logo,
                icon: schoolProfile.icon
            });

            if (typeof setSchoolSettings === 'function') {
                setSchoolSettings(newSettings);
            }

            toast.success('Profil sekolah berhasil disimpan!');
            addLog('Update profil sekolah', 'school_settings', 'settings-school');
        } catch (error) {
            toast.error('Gagal menyimpan ke database cloud.');
            console.error(error);
        }
    };

    const handleSaveAdmin = async () => {
        try {
            // Update D1 Profiles
            await db.from('profiles').update({
                full_name: adminProfile.name,
                email: adminProfile.email,
                updated_at: new Date().toISOString()
            }).eq('id', adminProfile.id);

            // Update LocalStorage Legacy
            const localTeachers = localStorage.getItem('teachers_data_v11');
            const teachers = localTeachers ? JSON.parse(localTeachers) : [...teachersDataGlobal];
            
            const updatedTeachers = teachers.map((t: any) => 
                t.id === adminProfile.id ? { 
                    ...t, 
                    nama: adminProfile.name, 
                    username: adminProfile.username,
                    email: adminProfile.email 
                } : t
            );

            localStorage.setItem('teachers_data_v11', JSON.stringify(updatedTeachers));
            updateTeachersGlobal(updatedTeachers);
            
            toast.success('Data administrator berhasil diperbarui!');
            addLog('Update data administrator', 'profiles', adminProfile.id);
        } catch (error) {
            toast.error('Gagal memperbarui data admin di cloud.');
        }
    };

    const handlePasswordChange = async () => {
        if (!security.oldPass || !security.newPass) {
            toast.error('Mohon isi password lama dan baru!');
            return;
        }

        if (security.newPass !== security.confirmPass) {
            toast.error('Konfirmasi password tidak cocok!');
            return;
        }

        if (security.newPass.length < 8) {
            toast.error('Password baru minimal 8 karakter!');
            return;
        }

        try {
            const { data: profile } = await db.from('profiles').select('password_hash').eq('id', adminProfile.id).single();
            
            if (!profile) {
                toast.error('Akun admin tidak ditemukan!');
                return;
            }

            const isOldCorrect = await verifyPassword(security.oldPass, profile.password_hash);
            if (!isOldCorrect) {
                toast.error('Password lama salah!');
                return;
            }

            const hashed = await hashPassword(security.newPass);
            
            await db.from('profiles').update({
                password_hash: hashed,
                updated_at: new Date().toISOString()
            }).eq('id', adminProfile.id);

            // Update Local Legacy
            const localTeachers = localStorage.getItem('teachers_data_v11');
            const teachers = localTeachers ? JSON.parse(localTeachers) : [...teachersDataGlobal];
            const updatedTeachers = teachers.map((t: any) => 
                t.id === adminProfile.id ? { ...t, password: hashed } : t
            );

            localStorage.setItem('teachers_data_v11', JSON.stringify(updatedTeachers));
            updateTeachersGlobal(updatedTeachers);

            toast.success('Password berhasil diubah!');
            setSecurity({ ...security, oldPass: '', newPass: '', confirmPass: '' });
            addLog('Ubah password akun', 'profiles', adminProfile.id);
        } catch (error) {
            toast.error('Gagal mengubah password.');
        }
    };

    const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height *= maxWidth / width));
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxWidth) {
                            width = Math.round((width *= maxWidth / height));
                            height = maxWidth;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'icon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            toast.error('Ukuran file terlalu besar (Max 1MB)');
            return;
        }

        try {
            const compressed = await compressImage(file, type === 'logo' ? 500 : 128, 0.8);
            setSchoolProfile(prev => ({ ...prev, [type]: compressed }));
            toast.success(`${type === 'logo' ? 'Logo' : 'Ikon'} berhasil diupload!`);
        } catch (error) {
            // Fallback to base64 if compression fails
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSchoolProfile(prev => ({ ...prev, [type]: reader.result as string }));
                toast.success(`${type === 'logo' ? 'Logo' : 'Ikon'} berhasil diupload!`);
            };
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profil':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <ImageIcon className="text-blue-600" /> Logo & Ikon Aplikasi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 flex items-center gap-4">
                                    <div className="w-24 h-24 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                        {schoolProfile.logo ? (
                                            <img src={schoolProfile.logo} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <School size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm">Logo Sekolah</h4>
                                        <p className="text-[10px] text-slate-500 mb-2">Max: 1MB (PNG/JPG)</p>
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors text-xs">
                                            <Upload size={14} /> Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                        </label>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                                        {schoolProfile.icon ? (
                                            <img src={schoolProfile.icon} alt="Icon" className="w-full h-full object-contain" />
                                        ) : (
                                            <Monitor size={24} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm">Ikon (Favicon)</h4>
                                        <p className="text-[10px] text-slate-500 mb-2">Max: 512x512 (PNG)</p>
                                        <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors text-xs">
                                            <Upload size={14} /> Upload
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'icon')} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <School className="text-blue-600" /> Identitas Sekolah
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Sekolah / Yayasan</label>
                                    <input
                                        type="text"
                                        value={schoolProfile.name}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, name: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Sekolah</label>
                                    <textarea
                                        value={schoolProfile.address}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, address: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-24 resize-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Akreditasi</label>
                                    <select
                                        value={schoolProfile.accreditation}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, accreditation: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white cursor-pointer"
                                    >
                                        <option value="A">A (Unggul)</option>
                                        <option value="B">B (Baik)</option>
                                        <option value="C">C (Cukup)</option>
                                        <option value="Belum">Belum Terakreditasi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Status Sekolah</label>
                                    <select
                                        value={schoolProfile.status}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, status: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white cursor-pointer"
                                    >
                                        <option value="Negeri">Negeri</option>
                                        <option value="Swasta">Swasta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Kepala Sekolah</label>
                                    <input
                                        type="text"
                                        value={schoolProfile.principal}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, principal: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Ajaran Aktif</label>
                                    <input
                                        type="text"
                                        value={schoolProfile.academicYear}
                                        onChange={(e) => setSchoolProfile({ ...schoolProfile, academicYear: e.target.value })}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        placeholder="YYYY/YYYY"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button onClick={() => (window as any).setShowKopPreview(true)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2">
                                <FileText size={18} /> Preview Kop Laporan
                            </button>
                            <button 
                                onClick={() => setSchoolProfile({
                                    name: schoolSettings?.name || '',
                                    address: schoolSettings?.address || '',
                                    accreditation: schoolSettings?.accreditation || 'A',
                                    principal: schoolSettings?.principal || '',
                                    academicYear: schoolSettings?.academicYear || '2025/2026',
                                    status: schoolSettings?.status || 'Swasta',
                                    logo: schoolSettings?.logo || null,
                                    icon: schoolSettings?.icon || null
                                })}
                                className="ml-auto px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                            >
                                Reset
                            </button>
                            <button onClick={handleSaveProfil} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2">
                                <Save size={18} /> Simpan Profil
                            </button>
                        </div>
                    </div>
                );

            case 'admin':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <UserCog className="text-blue-600" /> Akun Administrator
                            </h3>
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-shrink-0 text-center space-y-3">
                                        <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center mx-auto overflow-hidden">
                                            <User size={48} className="text-slate-300" />
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 hover:underline">Ganti Foto Profil</button>
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Nama Administrator</label>
                                            <input
                                                type="text"
                                                value={adminProfile.name}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Username (Email)</label>
                                            <input
                                                type="text"
                                                value={adminProfile.username}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, username: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-100"
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Cadangan</label>
                                            <input
                                                type="email"
                                                value={adminProfile.email}
                                                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end border-t border-slate-100 pt-6">
                            <button onClick={handleSaveAdmin} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2">
                                <Save size={18} /> Simpan Data Admin
                            </button>
                        </div>
                    </div>
                );

            case 'keamanan':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <Lock className="text-blue-600" /> Keamanan Akun
                            </h3>
                            <div className="max-w-xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Password Lama</label>
                                        <div className="relative">
                                            <input
                                                type={security.showPass ? 'text' : 'password'}
                                                value={security.oldPass}
                                                onChange={(e) => setSecurity({ ...security, oldPass: e.target.value })}
                                                className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                placeholder="Masukkan password saat ini"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={security.showPass ? 'text' : 'password'}
                                                value={security.newPass}
                                                onChange={(e) => setSecurity({ ...security, newPass: e.target.value })}
                                                className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                placeholder="Minimal 8 karakter"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={security.showPass ? 'text' : 'password'}
                                                value={security.confirmPass}
                                                onChange={(e) => setSecurity({ ...security, confirmPass: e.target.value })}
                                                className="w-full p-3 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                placeholder="Ulangi password baru"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setSecurity({ ...security, showPass: !security.showPass })}
                                            className="text-sm font-bold text-slate-600 flex items-center gap-2 hover:text-slate-800"
                                        >
                                            {security.showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                            {security.showPass ? 'Sembunyikan Password' : 'Lihat Password'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-100">
                                    <button onClick={handlePasswordChange} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2">
                                        <CheckCircle2 size={18} /> Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'riwayat':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                                <History className="text-blue-600" /> Riwayat Perubahan
                            </h3>
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-4">Waktu</th>
                                            <th className="p-4">Admin</th>
                                            <th className="p-4">Aktivitas Perubahan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.map((log, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-4 font-mono text-slate-600">{log.date}</td>
                                                <td className="p-4 font-bold text-slate-700">{log.admin}</td>
                                                <td className="p-4 text-slate-700">{log.action}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {logs.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">Belum ada riwayat perubahan.</div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'migrasi':
                return <D1MigratorView />;

            default:
                return null;
        }
    };

    // Kop Preview Modal State
    const [showKopPreview, setShowKopPreview] = useState(false);
    useEffect(() => {
        (window as any).setShowKopPreview = setShowKopPreview;
    }, []);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                {[
                    { id: 'profil', label: 'Profil Sekolah', icon: <School size={18} /> },
                    { id: 'admin', label: 'Akun Administrator', icon: <UserCog size={18} /> },
                    { id: 'keamanan', label: 'Keamanan Akun', icon: <Shield size={18} /> },
                    { id: 'migrasi', label: 'Migrasi Database D1', icon: <RefreshCw size={18} /> },
                    { id: 'riwayat', label: 'Riwayat Perubahan', icon: <History size={18} /> },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id
                            ? 'bg-[#004AAD] text-white shadow-md shadow-blue-900/20'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 h-fit min-h-[500px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <RefreshCw size={40} className="text-blue-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">Memuat pengaturan dari cloud...</p>
                    </div>
                ) : renderTabContent()}
            </div>

            {/* Modal Preview Kop Laporan */}
            {showKopPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowKopPreview(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="text-blue-600" /> Preview Kop Laporan
                        </h3>
                        <div className="border border-slate-200 rounded-xl p-6 bg-white">
                            <div className="flex items-center gap-4 border-b-2 border-slate-800 pb-4">
                                {schoolProfile.logo ? (
                                    <img src={schoolProfile.logo} alt="Logo" className="w-20 h-20 object-contain" />
                                ) : (
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <School size={32} className="text-slate-300" />
                                    </div>
                                )}
                                <div className="text-center flex-1">
                                    <h2 className="text-lg font-bold text-slate-800 uppercase leading-tight">{schoolProfile.name || 'NAMA SEKOLAH'}</h2>
                                    <p className="text-[10px] text-slate-600 mt-1">{schoolProfile.address || 'Alamat Sekolah'}</p>
                                    <div className="flex justify-center gap-4 mt-1">
                                        <p className="text-[9px] text-slate-500 font-bold">Akreditasi: {schoolProfile.accreditation}</p>
                                        <p className="text-[9px] text-slate-500 font-bold">Status: {schoolProfile.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setShowKopPreview(false)} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
                                Tutup Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pengaturan;
