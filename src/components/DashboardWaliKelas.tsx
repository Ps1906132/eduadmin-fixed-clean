import React, { useState, useEffect } from 'react';
import { useAnnouncements } from './DashboardSuperAdmin/hooks/useAnnouncements';
import {
    Calendar,
    UserCheck,
    FolderInput,
    BookOpen,
    Book,
    Tv,
    Bot,
    Gamepad2,
    StickyNote,
    Bell,
    Home,
    User,
    LogOut,
    ChevronRight,
    Megaphone,
    Search,
    FileSpreadsheet,
    FileText
} from 'lucide-react';

import AlQuranSiswa from './AlQuranSiswa';
import ChannelSekolahSiswa from './ChannelSekolahSiswa';
import BelajarAISiswa from './BelajarAISiswa';
import NotifikasiSiswa from './NotifikasiSiswa';
import JadwalMengajarGuru from './JadwalMengajarGuru';
import JadwalUjian from './JadwalUjian';
import KehadiranSiswaGuru from './KehadiranSiswaGuru';
import InputNilaiGuru from './InputNilaiGuru';
import MateriLatihanGuru from './MateriLatihanGuru';
import NotepadGuru from './NotepadGuru';
import ProfilGuru from './ProfilGuru';
import InformasiWaliKelas from './InformasiWaliKelas';
import RapotSiswa from './RapotSiswa';
import RaporSettingsView from './DashboardSuperAdmin/components/views/RaporSettingsView';

interface DashboardWaliKelasProps {
    user: any;
    onLogout: () => void;
    schoolName?: string;
}

const DashboardWaliKelas: React.FC<DashboardWaliKelasProps> = ({ user, onLogout, schoolName = "SD Normal Islam Samarinda" }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeView, setActiveView] = useState<'home' | 'jadwal' | 'ujian' | 'kehadiran' | 'nilai' | 'deskripsi' | 'raport' | 'latihan' | 'quran' | 'channel' | 'ai' | 'informasi' | 'notepad' | 'notifikasi' | 'profile'>('home');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Menu Items Data
    const menuItems = [
        { id: 'jadwal', label: 'Jadwal Mengajar', icon: <Calendar size={24} />, color: 'bg-blue-500' },
        { id: 'ujian', label: 'Jadwal Ujian', icon: <FileText size={24} />, color: 'bg-indigo-500' },
        { id: 'kehadiran', label: 'Absensi Siswa', icon: <UserCheck size={24} />, color: 'bg-teal-500' },
        { id: 'nilai', label: 'Input Nilai', icon: <FolderInput size={24} />, color: 'bg-indigo-500' },
        { id: 'deskripsi', label: 'Master Deskripsi', icon: <FileText size={24} />, color: 'bg-amber-600' },
        { id: 'raport', label: 'E-Rapor', icon: <FileSpreadsheet size={24} />, color: 'bg-emerald-600' },
        { id: 'latihan', label: 'Materi dan Latihan', icon: <BookOpen size={24} />, color: 'bg-rose-500' },
        { id: 'quran', label: 'Al Quran', icon: <Book size={24} />, color: 'bg-green-600' },
        { id: 'channel', label: 'Channel sekolah ku', icon: <Tv size={24} />, color: 'bg-red-600' },
        { id: 'ai', label: 'Belajar dengan ku', icon: <Bot size={24} />, color: 'bg-cyan-500' },
        { id: 'notepad', label: 'Notepad', icon: <StickyNote size={24} />, color: 'bg-amber-500' },
        { id: 'informasi', label: 'Informasi', icon: <Megaphone size={24} />, color: 'bg-orange-500' },
    ];

    const { announcements } = useAnnouncements();

    return (
        <div className="h-screen bg-[#E0F2FE] font-sans flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="fixed top-[-50px] left-[-50px] w-40 h-40 rounded-full border-[6px] border-[#BFDBFE] opacity-60 pointer-events-none"></div>
            <div className="fixed top-20 right-[-20px] w-24 h-24 rounded-full bg-[#BFDBFE] opacity-40 pointer-events-none"></div>

            {/* Header Section */}
            <div className="flex-none bg-[#004AAD] text-white rounded-b-[24px] shadow-md relative z-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="px-5 pt-4 pb-2">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-white" />
                                )}
                            </div>
                            <div>
                                <p className="text-blue-100 text-[10px] font-medium leading-none mb-0.5">Assalamualaikum,</p>
                                <h2 className="text-base font-bold leading-tight">{user?.nama || 'Guru Wali Kelas'}</h2>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-blue-200 opacity-90">NIP: {user?.nip || '-'}</p>
                            <div className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                                {user?.kelas ? `Wali Kelas ${user.kelas}` : 'Wali Kelas'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-800/30 backdrop-blur-md px-5 py-2 flex justify-between items-center text-[10px] font-medium border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-white/80">Selamat Mengajar!</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white">{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span className="text-blue-200">•</span>
                        <span className="text-blue-200 font-mono">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8 w-full max-w-7xl mx-auto pb-28 sm:pb-28 scrollbar-hide">
                {activeView === 'home' ? (
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Left Column: Menu Items */}
                        <div className="flex-1">
                            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-sm">
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 lg:hidden">
                                    <Home size={20} className="text-[#004AAD]" />
                                    Menu Utama
                                </h3>
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-10">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (item.id === 'jadwal') setActiveView('jadwal');
                                                else if (item.id === 'ujian') setActiveView('ujian');
                                                else if (item.id === 'kehadiran') setActiveView('kehadiran');
                                                else if (item.id === 'nilai') setActiveView('nilai');
                                                else if (item.id === 'deskripsi') setActiveView('deskripsi');
                                                else if (item.id === 'raport') setActiveView('raport');
                                                else if (item.id === 'latihan') setActiveView('latihan');
                                                else if (item.id === 'notepad') setActiveView('notepad');
                                                else if (item.id === 'informasi') setActiveView('informasi');
                                                else if (item.id === 'quran') setActiveView('quran');
                                                else if (item.id === 'channel') setActiveView('channel');
                                                else if (item.id === 'ai') setActiveView('ai');
                                            }}
                                            className="flex flex-col items-center gap-3 group w-full"
                                        >
                                            <div className={`w-14 h-14 md:w-16 md:h-16 ${item.color} rounded-2xl md:rounded-3xl shadow-lg shadow-blue-900/5 text-white flex items-center justify-center transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                {React.cloneElement(item.icon as any, { size: 28 })}
                                            </div>
                                            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 text-center leading-tight group-hover:text-[#004AAD] transition-colors line-clamp-2 w-full">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Announcements */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="sticky top-8">
                                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                    <Bell size={20} className="text-[#004AAD]" strokeWidth={2.5} />
                                    Informasi Sekolah
                                </h3>
                                <div className="space-y-4">
                                    {announcements
                                        .filter(a => a.status === 'Terbit')
                                        .filter(a => a.target === 'Semua' || a.target === 'Guru')
                                        .map((info) => (
                                            <div key={info.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                                <div className="flex gap-3 mb-2 relative z-10">
                                                    <div className="w-1.5 rounded-full bg-[#004AAD] h-5 mt-0.5"></div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 group-hover:text-[#004AAD] transition-colors">{info.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{info.publishDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed pl-4.5 mb-4 relative z-10 line-clamp-3">
                                                    {info.content}
                                                </p>
                                                <div className="flex items-center justify-end pl-4.5 relative z-10">
                                                    <button className="text-[#004AAD] text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                                        Selengkapnya <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1">
                        {activeView === 'jadwal' ? (
                            <JadwalMengajarGuru user={user} onBack={() => setActiveView('home')} />
                        ) : activeView === 'ujian' ? (
                            <JadwalUjian onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'kehadiran' ? (
                            <KehadiranSiswaGuru user={user} onBack={() => setActiveView('home')} />
                        ) : activeView === 'nilai' ? (
                            <InputNilaiGuru user={user} onBack={() => setActiveView('home')} />
                        ) : activeView === 'deskripsi' ? (
                            <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
                                <RaporSettingsView setActiveView={() => setActiveView('home')} showOnlyDeskripsi={true} />
                            </div>
                        ) : activeView === 'raport' ? (
                            <RapotSiswa onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'latihan' ? (
                            <MateriLatihanGuru user={user} onBack={() => setActiveView('home')} />
                        ) : activeView === 'notepad' ? (
                            <NotepadGuru onBack={() => setActiveView('home')} />
                        ) : activeView === 'informasi' ? (
                            <InformasiWaliKelas onBack={() => setActiveView('home')} />
                        ) : activeView === 'quran' ? (
                            <AlQuranSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'channel' ? (
                            <ChannelSekolahSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'ai' ? (
                            <BelajarAISiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'notifikasi' ? (
                            <NotifikasiSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'profile' ? (
                            <ProfilGuru user={user} onBack={() => setActiveView('home')} onLogout={onLogout} />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <div className="flex-none bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-6 sm:pb-3 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50">
                <div className="flex justify-around items-center max-w-lg mx-auto">
                    <button
                        onClick={() => setActiveView('home')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'home' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Home size={22} fill={activeView === 'home' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-bold">Beranda</span>
                        {activeView === 'home' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>
                    <button
                        onClick={() => setActiveView('jadwal')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'jadwal' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calendar size={22} fill={activeView === 'jadwal' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-medium text-center leading-none">Jadwal</span>
                        {activeView === 'jadwal' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>
                    <button
                        onClick={() => setActiveView('notifikasi')}
                        className="relative -top-6 group"
                    >
                        <div className={`p-4 rounded-full shadow-xl shadow-blue-900/30 group-hover:scale-105 transition-transform flex items-center justify-center ${activeView === 'notifikasi' ? 'bg-white text-[#004AAD] border-4 border-[#004AAD]' : 'bg-[#004AAD] text-white'}`}>
                            <Bell size={24} fill="currentColor" />
                        </div>
                        {activeView !== 'notifikasi' && (
                            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#004AAD]"></span>
                        )}
                        <span className={`text-[10px] font-medium absolute -bottom-4 left-1/2 -translate-x-1/2 ${activeView === 'notifikasi' ? 'text-[#004AAD] font-bold' : 'text-slate-500'}`}>Notifikasi</span>
                    </button>
                    <button
                        onClick={() => setActiveView('profile')}
                        className={`flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors ${activeView === 'profile' ? 'text-[#004AAD]' : ''}`}
                    >
                        <User size={22} fill={activeView === 'profile' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-medium">Akun</span>
                        {activeView === 'profile' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardWaliKelas;
