import React, { useState, useEffect } from 'react';
import {
    Calendar,
    BookOpen,
    FileText,
    UserCheck,
    CreditCard,
    PiggyBank,
    GraduationCap,
    PenTool,
    Book,
    Tv,
    Bot,
    Gamepad2,
    Bell,
    Home,
    User,
    LogOut,
    ChevronRight,
    Search,
    Wallet
} from 'lucide-react';

import JadwalPelajaran from './JadwalPelajaran';
import JadwalUjian from './JadwalUjian';
import HasilBelajar from './HasilBelajar';
import KehadiranSiswa from './KehadiranSiswa';
import PembayaranSiswa from './PembayaranSiswa';
import TabunganSiswa from './TabunganSiswa';
import BimbinganBelajarSiswa from './BimbinganBelajarSiswa';
import LatihanSoalSiswa from './LatihanSoalSiswa';
import AlQuranSiswa from './AlQuranSiswa';
import ChannelSekolahSiswa from './ChannelSekolahSiswa';
import BelajarAISiswa from './BelajarAISiswa';
import GameEdukasiSiswa from './GameEdukasiSiswa';
import ProfilAkun from './ProfilAkun';
import NotifikasiSiswa from './NotifikasiSiswa';
import PerpustakaanSiswa from './PerpustakaanSiswa';

interface DashboardOrangTuaProps {
    user: any;
    onLogout: () => void;
    schoolName?: string;
}

import { announcementDataGlobal } from '../data/sharedData';

// ... (imports)

const DashboardOrangTua: React.FC<DashboardOrangTuaProps> = ({ user, onLogout, schoolName = "SD IT EduAdmin" }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeView, setActiveView] = useState<'home' | 'jadwal' | 'ujian' | 'hasil' | 'absen' | 'bayar' | 'tabungan' | 'bimbingan' | 'latihan' | 'quran' | 'channel' | 'ai' | 'game' | 'perpus' | 'profile' | 'notifikasi'>('home');

    // Sync Announcements
    const [announcements, setAnnouncements] = useState(announcementDataGlobal);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Polling for announcement updates
        const dataTimer = setInterval(() => {
            setAnnouncements([...announcementDataGlobal]);
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(dataTimer);
        };
    }, []);

    // Menu Items Data
    const menuItems = [
        { id: 'jadwal', label: 'Jadwal Pelajaran', icon: <Calendar size={24} />, color: 'bg-blue-500' },
        { id: 'ujian', label: 'Jadwal Ujian', icon: <FileText size={24} />, color: 'bg-indigo-500' },
        { id: 'hasil', label: 'Hasil Belajar', icon: <GraduationCap size={24} />, color: 'bg-emerald-500' },
        { id: 'absen', label: 'Kehadiran', icon: <UserCheck size={24} />, color: 'bg-teal-500' },
        { id: 'bayar', label: 'Pembayaran', icon: <CreditCard size={24} />, color: 'bg-orange-500' },
        { id: 'tabungan', label: 'Tabungan', icon: <Wallet size={24} />, color: 'bg-pink-500' },
        { id: 'bimbingan', label: 'Bimbingan Belajar', icon: <BookOpen size={24} />, color: 'bg-violet-500' },
        { id: 'latihan', label: 'Materi dan Latihan', icon: <PenTool size={24} />, color: 'bg-rose-500' },
        { id: 'quran', label: 'Al Quran', icon: <Book size={24} />, color: 'bg-green-600' },
        { id: 'channel', label: 'Channel Sekolah', icon: <Tv size={24} />, color: 'bg-red-600' },
        { id: 'ai', label: 'Belajar AI', icon: <Bot size={24} />, color: 'bg-cyan-500' },
        { id: 'perpus', label: 'Perpustakaan', icon: <BookOpen size={24} />, color: 'bg-amber-500' },
        { id: 'game', label: 'Game Edukasi', icon: <Gamepad2 size={24} />, color: 'bg-purple-500' },
    ];

    return (
        <div className="h-screen bg-[#E0F2FE] font-sans flex flex-col relative overflow-hidden">
            {/* Background Decoration - Bubbles (Consistent with Login) */}
            <div className="fixed top-[-50px] left-[-50px] w-40 h-40 rounded-full border-[6px] border-[#BFDBFE] opacity-60 pointer-events-none"></div>
            <div className="fixed top-20 right-[-20px] w-24 h-24 rounded-full bg-[#BFDBFE] opacity-40 pointer-events-none"></div>

            {/* Header Section */}
            {/* Header Section Compact */}
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
                                <h2 className="text-base font-bold leading-tight">{user?.nama || 'Orang Tua Siswa'}</h2>
                            </div>
                        </div>
                        {/* Compact Date/Time in Header Top instead of bottom bar if possible, or keep compact bottom bar */}
                        <div className="text-right">
                            <p className="text-[10px] text-blue-200 opacity-90">{user?.studentName || 'Ananda Tercinta'}</p>
                            <div className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                                {user?.studentClass ? `Kelas ${user.studentClass}` : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Bar Compact */}
                <div className="bg-blue-800/30 backdrop-blur-md px-5 py-2 flex justify-between items-center text-[10px] font-medium border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-200">Wali Kelas:</span>
                        <span className="text-white font-semibold">{user?.studentWali || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-white">{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span className="text-blue-200">•</span>
                        <span className="text-blue-200 font-mono">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative z-10 p-4 md:p-8 w-full max-w-7xl mx-auto pb-28 sm:pb-28 scrollbar-hide">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left Column: Main Content Area */}
                    <div className="flex-1">
                        {activeView === 'home' ? (
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
                                                else if (item.id === 'hasil') setActiveView('hasil');
                                                else if (item.id === 'absen') setActiveView('absen');
                                                else if (item.id === 'bayar') setActiveView('bayar');
                                                else if (item.id === 'tabungan') setActiveView('tabungan');
                                                else if (item.id === 'bimbingan') setActiveView('bimbingan');
                                                else if (item.id === 'latihan') setActiveView('latihan');
                                                else if (item.id === 'quran') setActiveView('quran');
                                                else if (item.id === 'channel') setActiveView('channel');
                                                else if (item.id === 'ai') setActiveView('ai');
                                                else if (item.id === 'game') setActiveView('game');
                                                else if (item.id === 'perpus') setActiveView('perpus');
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
                        ) : activeView === 'jadwal' ? (
                            <JadwalPelajaran onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'ujian' ? (
                            <JadwalUjian onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'hasil' ? (
                            <HasilBelajar onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'absen' ? (
                            <KehadiranSiswa onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'bayar' ? (
                            <PembayaranSiswa onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'tabungan' ? (
                            <TabunganSiswa onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'bimbingan' ? (
                            <BimbinganBelajarSiswa onBack={() => setActiveView('home')} user={user} />
                        ) : activeView === 'latihan' ? (
                            <LatihanSoalSiswa onBack={() => setActiveView('home')} userClass={user?.studentClass || '5A'} />
                        ) : activeView === 'quran' ? (
                            <AlQuranSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'channel' ? (
                            <ChannelSekolahSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'ai' ? (
                            <BelajarAISiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'profile' ? (
                            <ProfilAkun user={user} onLogout={onLogout} onBack={() => setActiveView('home')} />
                        ) : activeView === 'notifikasi' ? (
                            <NotifikasiSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'game' ? (
                            <GameEdukasiSiswa onBack={() => setActiveView('home')} />
                        ) : activeView === 'perpus' ? (
                            <PerpustakaanSiswa onBack={() => setActiveView('home')} />
                        ) : null}
                    </div>

                    {/* Right Column: Announcements - Only show on Home */}
                    {activeView === 'home' && (
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="sticky top-8">
                                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                    <Bell size={20} className="text-[#004AAD]" strokeWidth={2.5} />
                                    Informasi Sekolah
                                </h3>
                                <div className="space-y-4">
                                    {announcements
                                        .filter(a => a.status === 'Terbit')
                                        .filter(a => a.target === 'Semua' || a.target === 'Orang Tua')
                                        .filter(a => a.targetClass === 'Semua Kelas' || a.targetClass === user.studentClass)
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
                    )}
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="flex-none bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-3 pb-6 sm:pb-3 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-50">
                <div className="flex justify-around items-center max-w-lg mx-auto">
                    {/* Beranda */}
                    <button
                        onClick={() => setActiveView('home')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'home' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Home size={22} fill={activeView === 'home' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-bold">Beranda</span>
                        {activeView === 'home' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>

                    {/* Tabungan */}
                    <button
                        onClick={() => setActiveView('tabungan')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'tabungan' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Wallet size={22} fill={activeView === 'tabungan' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-medium">Tabungan</span>
                        {activeView === 'tabungan' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>

                    {/* Notifikasi (Center Layout) */}
                    <button
                        onClick={() => setActiveView('notifikasi')}
                        className="relative -top-6 group"
                    >
                        <div className={`p-4 rounded-full shadow-xl shadow-blue-900/30 group-hover:scale-105 transition-transform flex items-center justify-center ${activeView === 'notifikasi' ? 'bg-white text-[#004AAD] border-4 border-[#004AAD]' : 'bg-[#004AAD] text-white'}`}>
                            <Bell size={24} fill="currentColor" />
                        </div>
                        {/* Fake notification dot */}
                        {activeView !== 'notifikasi' && (
                            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#004AAD]"></span>
                        )}
                        <span className={`text-[10px] font-medium absolute -bottom-4 left-1/2 -translate-x-1/2 ${activeView === 'notifikasi' ? 'text-[#004AAD] font-bold' : 'text-slate-500'}`}>Notifikasi</span>
                    </button>

                    {/* Agenda */}
                    <button
                        onClick={() => setActiveView('jadwal')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'jadwal' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calendar size={22} fill={activeView === 'jadwal' ? "currentColor" : "none"} />
                        <span className="text-[10px] font-medium">Agenda</span>
                        {activeView === 'jadwal' && <div className="w-1 h-1 bg-[#004AAD] rounded-full mt-0.5"></div>}
                    </button>

                    {/* Akun */}
                    <button
                        onClick={() => setActiveView('profile')}
                        className={`flex flex-col items-center gap-1 transition-colors ${activeView === 'profile' ? 'text-[#004AAD]' : 'text-slate-400 hover:text-slate-600'}`}
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

export default DashboardOrangTua;
