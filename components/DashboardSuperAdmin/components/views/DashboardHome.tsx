import React from 'react';
import {
    Users,
    UserCog,
    School,
    UserCheck,
    Bell,
    Info,
    Calendar,
    Megaphone,
    BookOpen,
    Zap,
    BarChart2,
    UserPlus
} from 'lucide-react';
import { studentsDataGlobal, teachersDataGlobal, classesDataGlobal } from '../../../../data/sharedData';

interface DashboardHomeProps {
    students: any[];
    setActiveView: (view: string) => void;
    user?: any;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ students, setActiveView, user }) => {
    const role = user?.role || user?.role_type || user?.roleCode || '';
    const lowerRole = role.toLowerCase();

    let quickAccessItems = [
        { label: 'Input Nilai', icon: <BarChart2 size={24} />, color: 'bg-indigo-50 text-indigo-600', link: 'nilai' },
        { label: 'Absensi Siswa', icon: <UserCheck size={24} />, color: 'bg-rose-50 text-rose-600', link: 'absen' },
        { label: 'Jadwal Kelas', icon: <Calendar size={24} />, color: 'bg-emerald-50 text-emerald-600', link: 'jadwal' },
        { label: 'Siswa Baru', icon: <UserPlus size={24} />, color: 'bg-cyan-50 text-cyan-600', link: 'data_siswa' },
    ];

    if (lowerRole.includes('kurikulum')) {
        quickAccessItems = [
            { label: 'Input Nilai', icon: <BarChart2 size={24} />, color: 'bg-indigo-50 text-indigo-600', link: 'nilai' },
            { label: 'Jadwal Kelas', icon: <Calendar size={24} />, color: 'bg-emerald-50 text-emerald-600', link: 'jadwal' },
            { label: 'Rapor Siswa', icon: <BookOpen size={24} />, color: 'bg-rose-50 text-rose-600', link: 'rapor' },
            { label: 'Mata Pelajaran', icon: <School size={24} />, color: 'bg-amber-50 text-amber-600', link: 'tambah_mapel_view' },
        ];
    } else if (lowerRole.includes('tata usaha') || lowerRole.includes('keuangan')) {
        quickAccessItems = [
            { label: 'Kelola Keuangan', icon: <BarChart2 size={24} />, color: 'bg-emerald-50 text-emerald-600', link: 'keuangan' },
            { label: 'Tagihan Siswa', icon: <Zap size={24} />, color: 'bg-amber-50 text-amber-600', link: 'keuangan' },
            { label: 'Data Siswa', icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600', link: 'data_siswa' },
            { label: 'Laporan Keuangan', icon: <BookOpen size={24} />, color: 'bg-indigo-50 text-indigo-600', link: 'keuangan' },
        ];
    } else if (lowerRole.includes('multimedia')) {
        quickAccessItems = [
            { label: 'Multimedia Studio', icon: <Zap size={24} />, color: 'bg-purple-50 text-purple-600', link: 'multimedia' },
            { label: 'Broadcast Sekolah', icon: <Megaphone size={24} />, color: 'bg-rose-50 text-rose-600', link: 'pengumuman' },
            { label: 'Bimbingan Belajar', icon: <BookOpen size={24} />, color: 'bg-blue-50 text-blue-600', link: 'tutoring' },
            { label: 'Identitas Sekolah', icon: <Info size={24} />, color: 'bg-slate-50 text-slate-600', link: 'settings' },
        ];
    } else {
        // Admin / Operator Data / Default
        quickAccessItems = [
            { label: 'Siswa Baru', icon: <UserPlus size={24} />, color: 'bg-cyan-50 text-cyan-600', link: 'data_siswa' },
            { label: 'Data Guru & Staff', icon: <UserCog size={24} />, color: 'bg-indigo-50 text-indigo-600', link: 'data_guru' },
            { label: 'Kelas & Wali', icon: <School size={24} />, color: 'bg-orange-50 text-orange-600', link: 'tambah_kelas_view' },
            { label: 'Pengaturan', icon: <Info size={24} />, color: 'bg-slate-50 text-slate-600', link: 'settings' },
        ];
    }

    return (
        <div className="animate-in fade-in space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Siswa */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-3xl shadow-sm border border-blue-100/50 relative hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-700 text-sm">Total Siswa</h3>
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"><Users size={18} /></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">{students?.length || 0}</span>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Aktif</p>
                    </div>
                </div>

                {/* Card 2: Data Guru */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-3xl shadow-sm border border-indigo-100/50 relative hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-700 text-sm">Data Guru</h3>
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-indigo-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors"><UserCog size={18} /></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">{teachersDataGlobal?.length || 0}</span>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Pengajar</p>
                    </div>
                </div>

                {/* Card 3: Total Kelas */}
                <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-3xl shadow-sm border border-orange-100/50 relative hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-700 text-sm">Total Kelas</h3>
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-orange-500 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors"><School size={18} /></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">{classesDataGlobal?.length || 0}</span>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Rombel</p>
                    </div>
                </div>

                {/* Card 4: Jumlah Kehadiran (was Pemasukan) */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-3xl shadow-sm border border-emerald-100/50 relative hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-700 text-sm">Jumlah Kehadiran</h3>
                        <div className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-500 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors"><UserCheck size={18} /></div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-800 tracking-tight">0%</span>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Hadir Hari Ini</p>
                    </div>
                </div>
            </div>

            {/* New Section: Notifikasi & Akses Cepat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto min-h-[24rem]">
                {/* Notifikasi */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/50 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Bell className="text-red-500" size={20} /> Pemberitahuan
                            <span className="flex items-center justify-center bg-red-500 text-white text-[10px] w-5 h-5 rounded-full animate-pulse shadow-sm shadow-red-200">0</span>
                        </h3>
                        <button className="text-xs font-bold text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer">Lihat Semua</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {/* Empty state for notifications */}
                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                            <Bell size={48} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">Belum ada pemberitahuan baru</p>
                        </div>
                    </div>
                </div>

                {/* Akses Cepat */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/50 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <Zap className="text-amber-500" size={20} /> Akses Cepat
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {quickAccessItems.map((item, idx) => (
                            <button key={idx} onClick={() => setActiveView(item.link)} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-slate-100 hover:shadow-md cursor-pointer transition-all hover:bg-slate-50 group h-32">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <span className="text-xs font-bold text-slate-600 text-center">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
