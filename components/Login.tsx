import { useState, FC, FormEvent } from 'react';
import { User, Lock, ArrowRight, Flame } from 'lucide-react';
import { studentsDataGlobal, classesDataGlobal, teachersDataGlobal } from '../data/sharedData';
import { db } from '../src/lib/db';
import { verifyPassword } from '../utils/auth';
import { getErrorMessage } from '../utils/errorHandler';

interface LoginProps {
    onLogin: (role: string, userData: any) => void;
    schoolName?: string;
    logo?: string;
    bannerImage?: string;
}

const Login: FC<LoginProps> = ({ onLogin, schoolName, logo, bannerImage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mengambil Nama Sekolah/Yayasan dan Logo secara dinamis dari Identitas Sekolah (localStorage)
    const savedSettings = localStorage.getItem('school_settings_v10');
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
    const activeSchoolName = schoolName || parsedSettings?.name || "EduAdmin";
    const activeLogo = logo || parsedSettings?.logo || null;

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // --- DEVELOPMENT OFFLINE BYPASS ---
        // Menjamin 100% kesuksesan login ketika database backend (Supabase/D1) offline di lokal
        if (!import.meta.env.PROD) {
            const lowerUsername = username.trim().toLowerCase();
            if ((lowerUsername === 'admin@eduadmin.com' && password === 'EduAdmin@2026!') || 
                (lowerUsername === 'admin' && password === 'admin123')) {
                onLogin('admin', {
                    id: 999,
                    nama: "Super Admin (Offline)",
                    email: "admin@eduadmin.com",
                    role: "admin",
                    role_type: "admin",
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop'
                });
                setIsLoading(false);
                return;
            }
            if (lowerUsername === 'budikurikulum' && password === 'password123') {
                onLogin('kurikulum', {
                    id: 998,
                    nama: "Bpk. Budi (Offline)",
                    email: "kurikulum@eduadmin.com",
                    role: "kurikulum",
                    role_type: "kurikulum",
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop'
                });
                setIsLoading(false);
                return;
            }
            if (lowerUsername === 'tatausaha' && password === 'password123') {
                onLogin('keuangan', {
                    id: 997,
                    nama: "Ibu Siti (Offline)",
                    email: "keuangan@eduadmin.com",
                    role: "keuangan",
                    role_type: "keuangan",
                    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop'
                });
                setIsLoading(false);
                return;
            }
        }

        try {
            // ATTEMPT D1 DB LOGIN
            const res = await db.from('profiles').select('*').eq('email', username).single();

            if (res.data) {
                const profile = res.data;

                // Securely verify password using bcrypt
                const isValid = await verifyPassword(password, profile.password_hash || profile.password);

                if (isValid) {
                    onLogin(profile.role, {
                        id: profile.id,
                        nama: profile.full_name,
                        email: profile.email,
                        role: profile.role,
                        avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop'
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // If DB login fails or no user found, try legacy fallback
            handleLegacyLogin();
        } catch (err: any) {
            console.error("Login error:", err);
            setError(getErrorMessage(err));
            handleLegacyLogin();
        }
    };

    const handleLegacyLogin = async () => {
        // Hanya untuk DEMO/TESTING - batasi ke development mode
        if (import.meta.env.PROD) {
            setError('Username atau password salah');
            setIsLoading(false);
            return;
        }

        console.warn('⚠️ Menggunakan legacy fallback login - Hanya untuk Development');

        // Simulate network delay
        setTimeout(async () => {
            // 1. Check for Student/Parent Login
            const localStudents = localStorage.getItem('students_data_v10');
            const studentsSource = localStudents ? JSON.parse(localStudents) : studentsDataGlobal;

            const studentAccount = studentsSource.find((s: any) => s.nis === username || s.username === username);

            if (studentAccount) {
                // Verify against NIS or old stored password
                const isValid = await verifyPassword(password, studentAccount.nis);

                if (isValid) {
                    const localClasses = localStorage.getItem('classes_data_v10');
                    const classesSource = localClasses ? JSON.parse(localClasses) : classesDataGlobal;
                    const classInfo = classesSource.find((c: any) => c.nama === studentAccount.kelas);
                    const waliName = classInfo ? classInfo.wali : "Guru Wali";

                    onLogin('ot', {
                        nama: studentAccount.ayah || "Orang Tua Siswa",
                        role: 'Orang Tua',
                        studentName: studentAccount.nama,
                        studentClass: studentAccount.kelas,
                        studentNis: studentAccount.nis,
                        studentWali: waliName,
                        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop'
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Check for Staff/Teacher Login
            const localTeachers = localStorage.getItem('teachers_data_v10');
            const teachersSource = localTeachers ? JSON.parse(localTeachers) : teachersDataGlobal;

            const teacherAccount = teachersSource.find((t: any) =>
                (t.username === username || t.user === username)
            );

            if (teacherAccount) {
                const isValid = await verifyPassword(password, teacherAccount.password);

                if (isValid) {
                    let roleCode = 'gm';
                    const role = teacherAccount.role || teacherAccount.jabatan;

                    if (role === 'Wali Kelas' || role === 'Guru Kelas') roleCode = 'wk';
                    if (role === 'Guru Bimbel') roleCode = 'gb';
                    if (role === 'Kepala Sekolah') roleCode = 'ks';
                    if (['Wakil Kurikulum', 'Staff Tata Usaha', 'Operator Data', 'kurikulum', 'keuangan', 'multimedia'].includes(role)) roleCode = 'admin';

                    onLogin(roleCode, {
                        nama: teacherAccount.nama,
                        role: role,
                        nip: teacherAccount.nip,
                        mapel: teacherAccount.mapel,
                        kelas: teacherAccount.kelas || teacherAccount.wali,
                        avatar: teacherAccount.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&auto=format&fit=crop'
                    });
                    setIsLoading(false);
                    return;
                }
            }

            setError('Username atau password salah');
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F2FE] via-[#EFF6FF] to-[#DBEAFE] relative overflow-hidden flex items-center justify-center font-sans p-4 md:p-6">
            {/* Background Decoration - Animated Soft Blobs */}
            <div className="absolute top-[-100px] left-[-100px] w-72 h-72 rounded-full bg-[#1E3A8A]/5 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-[#3B82F6]/5 blur-3xl pointer-events-none"></div>

            {/* Main Login Card Container */}
            <div className="relative z-10 w-full max-w-[860px] bg-white rounded-[32px] shadow-2xl border border-blue-100/50 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Decorative Crescent on top-right of the card */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-b from-[#1E3A8A]/20 to-transparent rounded-bl-full pointer-events-none hidden md:block"></div>
                <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-[#1E3A8A] rounded-full opacity-10 pointer-events-none hidden md:block"></div>

                {/* LEFT SIDE PANEL: Brand Identity (Navy Blue Area with Curved Edge) */}
                <div className="w-full md:w-[42%] bg-gradient-to-br from-[#1E40AF] via-[#1E3A8A] to-[#172554] text-white flex flex-col justify-center items-center relative overflow-hidden p-8 py-12 md:py-16 md:rounded-r-[120px] shadow-lg md:shadow-xl">
                    {/* Inner glowing patterns */}
                    <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none opacity-60"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none"></div>

                    {/* Branding Logo & Text */}
                    <div className="flex flex-col items-center text-center relative z-10">
                        {/* White circular container for the logo */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300 group overflow-hidden border-4 border-blue-500/20">
                            {activeLogo ? (
                                <img src={activeLogo} alt="Logo" className="w-full h-full object-contain p-3" />
                            ) : (
                                <span className="font-extrabold text-black text-xl tracking-wider uppercase">Logo</span>
                            )}
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-black tracking-widest uppercase">
                            {activeSchoolName}
                        </h3>
                        <p className="text-blue-100/80 text-[10px] md:text-xs font-semibold uppercase tracking-wider mt-2 bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm border border-white/10">
                            Sistem Informasi Manajemen
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE PANEL: Authentication Form */}
                <div className="w-full md:w-[58%] bg-white flex flex-col justify-center px-6 py-10 md:px-14 md:py-12 relative">

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-2xl text-xs font-bold text-center border border-red-100 animate-in shake">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        
                        {/* Username Input Container */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#1E3A8A] tracking-wider pl-4 uppercase">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full pl-12 pr-6 py-3.5 bg-white text-slate-800 placeholder-[#94A3B8] rounded-full font-semibold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-300 border border-slate-200 focus:border-[#1E3A8A]/30"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input Container */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#1E3A8A] tracking-wider pl-4 uppercase">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-12 py-3.5 bg-white text-slate-800 placeholder-[#94A3B8] rounded-full font-semibold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all duration-300 border border-slate-200 focus:border-[#1E3A8A]/30"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-[#1E3A8A] transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto sm:px-16 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-bold py-3.5 px-12 rounded-full shadow-lg shadow-blue-800/10 hover:shadow-xl hover:shadow-blue-800/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        LOG IN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 text-center md:text-left">
                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
                            &copy; 2026 EduAdmin System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
