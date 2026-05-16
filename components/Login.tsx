import { useState, FC, FormEvent } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
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

const Login: FC<LoginProps> = ({ onLogin, schoolName = "NAMA SEKOLAH", logo, bannerImage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

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
                    if (['Wakil Kurikulum', 'Staff Tata Usaha', 'Operator Data'].includes(role)) roleCode = 'admin';

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
        <div className="min-h-screen w-full bg-[#E0F2FE] relative overflow-hidden flex items-center justify-center font-sans">
            {/* Background Decoration - Animated Bubbles */}
            <div className="absolute top-[-50px] left-[-50px] w-40 h-40 rounded-full border-[6px] border-[#BFDBFE] opacity-60 animate-bounce duration-[3000ms]"></div>
            <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-[#BFDBFE] opacity-40 animate-pulse duration-[4000ms]"></div>
            <div className="absolute top-40 right-[40%] w-16 h-16 rounded-full border-[4px] border-[#93C5FD] opacity-50 animate-bounce duration-[5000ms]"></div>
            <div className="absolute bottom-[-20px] left-[30%] w-32 h-32 rounded-full border-[8px] border-[#BFDBFE] opacity-30 animate-pulse duration-[3500ms]"></div>

            {/* Additional Bubble Animations */}
            <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-white/20 animate-ping duration-[3000ms]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-blue-300/30 animate-bounce duration-[6000ms]"></div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-[420px] px-6">
                <div className="bg-[#93C5FD]/10 backdrop-blur-md p-2 rounded-[40px] shadow-2xl border border-white/20">
                    <div className="bg-[#BFDBFE] rounded-[35px] p-8 md:p-12 shadow-inner border border-white/50 relative overflow-hidden">

                        {/* Glass Reflections */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

                        {/* Logo Area */}
                        <div className="flex flex-col items-center mb-8 relative z-10">
                            <div className="w-24 h-24 rounded-full border-2 border-slate-700 flex items-center justify-center bg-white mb-4 shadow-lg group hover:scale-105 transition-transform duration-300 overflow-hidden">
                                {logo ? (
                                    <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-slate-800 text-xl tracking-widest group-hover:tracking-[0.2em] transition-all">Logo</span>
                                )}
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight text-center leading-tight">
                                {schoolName}
                            </h2>
                            <p className="text-slate-600 text-xs font-medium mt-1">Sistem Informasi Manajemen</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                            {error && (
                                <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-200 animate-in shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/60 border border-white/40 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all font-medium text-sm"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-3.5 bg-white/60 border border-white/40 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all font-medium text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 group text-sm"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        LOGIN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-slate-500 font-medium">
                                &copy; 2025 EduAdmin System. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
