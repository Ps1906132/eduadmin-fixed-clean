import React from 'react';
import {
    LogOut,
    Menu,
    Home,
    Users,
    UserCog,
    School,
    BookOpen,
    Calendar,
    CirclePlus,
    ClipboardList,
    BarChart2,
    Book,
    TrendingUp,
    Wallet,
    ArrowUpCircle,
    BookHeart,
    Megaphone,
    FileText,
    Video,
    Settings
} from 'lucide-react';
import { MenuItem } from '../types';
import { schoolSettingsGlobal } from '../../../data/sharedData';

interface SidebarProps {
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    onLogout: () => void;
    user?: any;
}

const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Beranda', icon: <Home size={20} /> },
    { id: 'data_siswa', label: 'Data Siswa dan kelas', icon: <Users size={20} /> },
    { id: 'data_guru', label: 'Data Guru & Staff', icon: <UserCog size={20} /> },
    { id: 'kelas_wali', label: 'Kelas dan wali kelas', icon: <School size={20} /> },
    { id: 'mapel', label: 'Mata Pelajaran', icon: <BookOpen size={20} /> },
    { id: 'jadwal', label: 'Jadwal', icon: <Calendar size={20} /> },
    { id: 'absen', label: 'Absen', icon: <CirclePlus size={20} /> },
    { id: 'ujian', label: 'Jadwal Ujian', icon: <ClipboardList size={20} /> },
    { id: 'nilai', label: 'Manajemen Nilai', icon: <BarChart2 size={20} /> },
    { id: 'rapot', label: 'Rapot', icon: <Book size={20} /> },
    { id: 'keuangan', label: 'Keuangan Sekolah', icon: <TrendingUp size={20} /> },
    { id: 'tabungan', label: 'Tabungan Siswa', icon: <Wallet size={20} /> },
    { id: 'naik_kelas', label: 'Naik Kelas', icon: <ArrowUpCircle size={20} /> },
    { id: 'bimbingan_belajar', label: 'Bimbingan belajar (les)', icon: <BookHeart size={20} /> },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone size={20} /> },
    { id: 'laporan', label: 'Laporan', icon: <FileText size={20} /> },
    { id: 'multimedia', label: 'Manajemen Multimedia', icon: <Video size={20} /> },
    { id: 'ai_management', label: 'Manajemen AI', icon: <BookHeart size={20} /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView,
    onLogout,
    user
}) => {
    // Filter Menu Items based on Role (Jabatan)
    const filteredMenuItems = React.useMemo(() => {
        const rawRole = (user?.role || user?.role_type || user?.roleCode || '').toLowerCase();

        // Admin / Super Admin / Operator Data (9 Modul Admin Utama)
        if (rawRole === 'admin' || rawRole === 'super admin' || rawRole === 'operator data') {
            return menuItems.filter(item =>
                ['dashboard', 'data_siswa', 'data_guru', 'kelas_wali', 'mapel', 'bimbingan_belajar', 'pengumuman', 'multimedia', 'ai_management', 'settings'].includes(item.id)
            );
        }

        // Kurikulum / Wakil Kurikulum (6 Modul Akademik Utama)
        if (rawRole === 'kurikulum' || rawRole === 'wakil kurikulum') {
            return menuItems.filter(item =>
                ['dashboard', 'jadwal', 'absen', 'ujian', 'nilai', 'rapot', 'naik_kelas'].includes(item.id)
            );
        }

        // Keuangan / Staff Tata Usaha (3 Modul Keuangan Utama)
        if (rawRole === 'keuangan' || rawRole === 'staff tata usaha') {
            return menuItems.filter(item =>
                ['dashboard', 'keuangan', 'tabungan', 'laporan'].includes(item.id)
            );
        }

        // Multimedia
        if (rawRole === 'multimedia') {
            return menuItems.filter(item =>
                ['dashboard', 'multimedia', 'ai_management'].includes(item.id)
            );
        }

        // Default to all for safety or fallback
        return menuItems;
    }, [user]);

    const getLinkClass = (id: string) => {
        const base = "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 font-medium relative group cursor-pointer text-sm";
        if (activeView === id || (id === 'data_siswa' && ['tambah_kelas_view', 'upload_siswa_view', 'upload_perkelas_view', 'upload_kelas_satu_view'].includes(activeView))) {
            return `${base} text-blue-800 bg-slate-50 rounded-l-full ml-4`;
        }
        return `${base} text-blue-100 hover:text-white hover:bg-white/10 mx-4 rounded-xl`;
    };

    return (
        <aside className={`bg-[#1E3A8A] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex rounded-r-[2rem] my-4 ml-4 shadow-2xl z-20`}>
            <div className="h-20 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1E3A8A] font-bold text-lg backdrop-blur-sm overflow-hidden border border-white/20">
                        {schoolSettingsGlobal.logo ? (
                            <img src={schoolSettingsGlobal.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            "EA"
                        )}
                    </div>
                    {isSidebarOpen && <span className="text-white font-bold text-sm tracking-tight leading-tight">{schoolSettingsGlobal.name || "EduAdmin"}</span>}
                </div>
                {isSidebarOpen && <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white"><Menu size={24} /></button>}
                {!isSidebarOpen && <button onClick={() => setSidebarOpen(true)} className="absolute left-[70px] top-8 bg-[#1E3A8A] p-2 rounded-r-xl shadow-md text-white z-50"><Menu size={20} /></button>}
            </div>

            <nav className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar">
                {filteredMenuItems.map((item) => (
                    <div key={item.id} onClick={() => setActiveView(item.id)} className={getLinkClass(item.id)}>
                        <span className={activeView === item.id || (item.id === 'data_siswa' && ['tambah_kelas_view', 'upload_siswa_view', 'upload_perkelas_view', 'upload_kelas_satu_view'].includes(activeView)) ? 'text-[#1E3A8A]' : ''}>{item.icon}</span>
                        {isSidebarOpen && <span className="truncate text-sm font-medium">{item.label}</span>}
                        {isSidebarOpen && item.id === 'pengumuman' && (
                            <span className="ml-auto flex items-center justify-center bg-red-500 text-white text-[10px] w-5 h-5 rounded-full font-bold animate-pulse shadow-sm">0</span>
                        )}
                        {/* Decorative Curve */}
                        {(activeView === item.id || (item.id === 'data_siswa' && ['tambah_kelas_view', 'upload_siswa_view', 'upload_perkelas_view', 'upload_kelas_satu_view'].includes(activeView))) && (
                            <>
                                <div className="absolute right-0 -top-8 w-8 h-8 bg-transparent rounded-br-full shadow-[5px_5px_0_5px_#F8FAFC]"></div>
                                <div className="absolute right-0 -bottom-8 w-8 h-8 bg-transparent rounded-tr-full shadow-[5px_-5px_0_5px_#F8FAFC]"></div>
                            </>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-6">
                <button onClick={onLogout} className="flex items-center gap-3 text-red-300 hover:text-red-100 transition-colors text-sm">
                    <LogOut size={18} /> {isSidebarOpen && "Logout"}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
