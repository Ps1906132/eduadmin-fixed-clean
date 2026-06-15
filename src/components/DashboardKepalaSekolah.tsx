import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, FileText, Book, Tv,
    LogOut, User, Bell, ChevronRight,
    Users, TrendingUp, Calendar, CheckSquare
} from 'lucide-react';
import { schoolSettingsGlobal } from '../data/sharedData';
import { useStudents } from './DashboardSuperAdmin/hooks/useStudents';
import { useTeachers } from './DashboardSuperAdmin/hooks/useTeachers';
import { useClasses } from './DashboardSuperAdmin/hooks/useClasses';
import { useAnnouncements } from './DashboardSuperAdmin/hooks/useAnnouncements';

// Import Existing Components for Reusability
import AlQuranSiswa from './AlQuranSiswa';
import ChannelSekolahSiswa from './ChannelSekolahSiswa';
import Laporan from './Laporan';

interface DashboardKepalaSekolahProps {
    user: any;
    onLogout: () => void;
    schoolName?: string;
}

const DashboardKepalaSekolah: React.FC<DashboardKepalaSekolahProps> = ({ user, onLogout, schoolName }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeView, setActiveView] = useState('dashboard');
    const { students } = useStudents();
    const { teachers } = useTeachers();
    const { classes } = useClasses();
    const { announcements } = useAnnouncements();

    const [todayAttendancePct, setTodayAttendancePct] = useState<number | null>(null);
    const [todayAttendanceLabel, setTodayAttendanceLabel] = useState('Memuat...');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const token = localStorage.getItem('eduadmin_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        Promise.all([
            fetch(`/api/attendance?date=eq.${today}&select=status`, { headers }).then(r => r.json()),
        ]).then(([records]) => {
            if (Array.isArray(records) && records.length > 0) {
                const total = records.length;
                const hadir = records.filter((r: any) => r.status === 'hadir').length;
                const pct = Math.round((hadir / total) * 100);
                setTodayAttendancePct(pct);
                setTodayAttendanceLabel(`${pct}% (${hadir}/${total} hadir)`);
            } else {
                setTodayAttendancePct(0);
                setTodayAttendanceLabel('Belum ada data hari ini');
            }
        }).catch(() => {
            setTodayAttendancePct(null);
            setTodayAttendanceLabel('Gagal memuat');
        });
    }, []);

    // Menu Data
    const menuItems = [
        { id: 'dashboard', label: 'Monitor Sekolah', icon: <LayoutDashboard size={24} />, color: 'bg-blue-600' },
        { id: 'laporan', label: 'Laporan & Arsip', icon: <FileText size={24} />, color: 'bg-indigo-600' },
        { id: 'quran', label: 'Al Quran', icon: <Book size={24} />, color: 'bg-green-600' },
        { id: 'channel', label: 'Channel Sekolah', icon: <Tv size={24} />, color: 'bg-red-600' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar - Super Admin Style */}
            <aside className="bg-[#1E1B4B] flex flex-col transition-all duration-300 w-64 hidden md:flex rounded-r-[2rem] my-4 ml-4 shadow-2xl z-20">
                <div className="h-20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">KS</div>
                        <span className="text-white font-bold text-xl tracking-tight">KepSekView</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => (
                        <div key={item.id} onClick={() => setActiveView(item.id)} className={`
                            flex items-center gap-3 px-4 py-2.5 transition-all duration-300 font-medium relative group cursor-pointer text-sm
                            ${activeView === item.id
                                ? 'text-blue-800 bg-slate-50 rounded-l-full ml-4'
                                : 'text-blue-100 hover:text-white hover:bg-white/10 mx-4 rounded-xl'
                            }
                        `}>
                            <span className={activeView === item.id ? 'text-[#1E1B4B]' : ''}>{item.icon}</span>
                            <span className="truncate text-sm font-medium">{item.label}</span>
                            {/* Decorative Curve */}
                            {activeView === item.id && (
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
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header - Super Admin Style */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {menuItems.find(m => m.id === activeView)?.label}
                        </h2>
                        <p className="text-xs text-slate-500">{schoolName} • Kepala Sekolah</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="font-bold text-slate-800">{schoolSettingsGlobal.principal}</p>
                            <p className="text-xs text-slate-500">NIP. {schoolSettingsGlobal.nipPrincipal}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">

                    {activeView === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24} /></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Total Siswa</p>
                                            <h3 className="text-2xl font-bold text-slate-800">{students.length}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-green-600 font-bold flex items-center gap-1">
                                        <TrendingUp size={12} /> {students.length} Siswa aktif
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Users size={24} /></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Total Guru</p>
                                            <h3 className="text-2xl font-bold text-slate-800">{teachers.length}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500 font-bold flex items-center gap-1">
                                        <CheckSquare size={12} /> {classes.length} Rombel Terdata
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><CheckSquare size={24} /></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Kehadiran Siswa</p>
                                            <h3 className="text-2xl font-bold text-slate-800">{todayAttendancePct !== null ? `${todayAttendancePct}%` : '...'}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 font-bold flex items-center gap-1">
                                        <Calendar size={12} /> {todayAttendanceLabel}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Bell size={24} /></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Pengumuman Terbaru</p>
                                            <h3 className="text-2xl font-bold text-slate-800">{announcements.filter(a => a.status === 'Terbit').length}</h3>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400 font-bold flex items-center gap-1">
                                        <Calendar size={12} /> {announcements.filter(a => a.status === 'Terbit').length > 0 ? 'Ada pengumuman aktif' : 'Tidak ada pengumuman'}
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Pengumuman Pusat (Synced) */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                            <Bell size={20} className="text-blue-600" /> Informasi & Pengumuman Pusat
                                        </h3>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Live Sync</span>
                                    </div>
                                    <div className="space-y-4">
                                        {announcements.filter(a => a.status === 'Terbit').length === 0 ? (
                                            <p className="text-slate-400 italic text-center py-8">Belum ada pengumuman yang diterbitkan.</p>
                                        ) : (
                                            announcements.filter(a => a.status === 'Terbit').map((info) => (
                                                <div key={info.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <div className="w-1.5 h-auto bg-blue-600 rounded-full"></div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-slate-800 text-lg">{info.title}</h4>
                                                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500 font-mono">
                                                                {info.publishDate}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                                            {info.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                    </div>
                                </div>

                                {/* Quick Menu / Tools */}
                                <div className="bg-gradient-to-br from-[#004AAD] to-blue-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden h-fit">
                                    <h3 className="font-bold text-lg mb-6 relative z-10 border-b border-white/20 pb-4">Akses Cepat Kepala Sekolah</h3>
                                    <div className="space-y-3 relative z-10">
                                        <button onClick={() => setActiveView('laporan')} className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-3 transition-all">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><FileText size={20} /></div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm">Lihat Laporan</div>
                                                <div className="text-[10px] text-blue-200">Keuangan & Akademik</div>
                                            </div>
                                            <ChevronRight size={18} className="ml-auto opacity-50" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'laporan' && (
                        <div className="bg-white rounded-3xl p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
                            <Laporan />
                        </div>
                    )}

                    {/* Integrated Views */}
                    {activeView === 'quran' && <AlQuranSiswa onBack={() => setActiveView('dashboard')} />}
                    {activeView === 'channel' && <ChannelSekolahSiswa onBack={() => setActiveView('dashboard')} />}

                </main>
            </div>
        </div>
    );
};

export default DashboardKepalaSekolah;
