import React, { useState } from 'react';
import {
    BookOpen,
    Calendar,
    Users,
    GraduationCap,
    FileText,
    CheckSquare,
    BarChart2,
    Settings,
    Clock,
    Plus,
    Search,
    Download
} from 'lucide-react';
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';

const BimbinganBelajar: React.FC = () => {
    const [activeTab, setActiveTab] = useState('jadwal');

    // Navigation Menu
    const menuItems = [
        { id: 'jadwal', label: 'Jadwal Les', icon: <Calendar size={20} />, color: 'blue' },
        { id: 'guru', label: 'Guru Pengajar', icon: <GraduationCap size={20} />, color: 'emerald' },
        { id: 'siswa', label: 'Siswa Peserta', icon: <Users size={20} />, color: 'amber' },
        { id: 'materi', label: 'Materi & Modul', icon: <BookOpen size={20} />, color: 'violet' },
        { id: 'absensi', label: 'Absensi Les', icon: <CheckSquare size={20} />, color: 'rose' },
        { id: 'laporan', label: 'Laporan Kemajuan', icon: <BarChart2 size={20} />, color: 'cyan' },
        { id: 'pengaturan', label: 'Pengaturan Les', icon: <Settings size={20} />, color: 'slate' },
    ];

    // Mock Data
    const scheduleData = [
        { day: 'Senin', time: '14:00 - 15:30', subject: 'Matematika Dasar', teacher: 'Pak Budi', room: 'R. 1A', students: 12 },
        { day: 'Senin', time: '16:00 - 17:30', subject: 'Bahasa Inggris', teacher: 'Mrs. Sarah', room: 'R. 1B', students: 15 },
        { day: 'Rabu', time: '14:00 - 15:30', subject: 'Calistung', teacher: 'Bu Ani', room: 'R. 2A', students: 8 },
        { day: 'Jumat', time: '13:30 - 15:00', subject: 'Tahfidz Intensif', teacher: 'Ust. Hasan', room: 'Musholla', students: 20 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <BookOpen size={24} className="text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Bimbingan Belajar (Les)</h2>
                                <p className="text-slate-500 text-sm font-medium">Kelola jadwal, peserta, dan materi program bimbingan belajar tambahan.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                                <Plus size={18} /> Buat Jadwal Baru
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {menuItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200
                                        ${isActive
                                            ? `bg-indigo-600 text-white shadow-lg shadow-indigo-200`
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }
                                    `}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[500px] p-6 md:p-8">

                {/* JADWAL TAB */}
                {activeTab === 'jadwal' && (
                    <div className="space-y-6">
                        <div className="flex gap-4 mb-4">
                            <input type="text" placeholder="Cari pelajaran atau guru..." className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                            <select className="p-3 border border-slate-300 rounded-xl bg-white">
                                <option>Semua Hari</option>
                                <option>Senin</option>
                                <option>Selasa</option>
                                <option>Rabu</option>
                                <option>Kamis</option>
                                <option>Jumat</option>
                                <option>Sabtu</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scheduleData.map((item, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-blue-50/30 transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                                    <div className="pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{item.day}</span>
                                            <div className="flex items-center gap-1 text-slate-500 text-sm font-semibold">
                                                <Clock size={14} />
                                                {item.time}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-1">{item.subject}</h3>
                                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-2">
                                            <GraduationCap size={16} /> {item.teacher}
                                        </p>
                                        <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-100">
                                            <span className="text-slate-600 font-medium">{item.room}</span>
                                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                                                <Users size={14} /> {item.students} Peserta
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Card */}
                            <button className="border-2 border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all h-full min-h-[180px]">
                                <Plus size={48} className="mb-2 opacity-50" />
                                <span className="font-bold">Tambah Jadwal</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* GURU TAB */}
                {activeTab === 'guru' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 transition-colors">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Nama Guru {i}</h4>
                                    <p className="text-sm text-slate-500">Spesialisasi: Matematika & IPA</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Aktif</span>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">12 Jam/Minggu</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SISWA TAB */}
                {activeTab === 'siswa' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-full text-amber-500 shadow-sm">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-900">Total Peserta Les</h3>
                                    <p className="text-amber-700/80">45 Siswa Aktif</p>
                                </div>
                            </div>
                            <button className="bg-white text-amber-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-100 border border-amber-200">
                                Kelola Peserta
                            </button>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Nama Siswa</th>
                                        <th className="p-4">Kelas</th>
                                        <th className="p-4">Program Les</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <tr key={s} className="hover:bg-slate-50">
                                            <td className="p-4 font-medium text-slate-800">Siswa Peserta {s}</td>
                                            <td className="p-4 text-slate-500">Kelas {s < 3 ? '1' : '2'}</td>
                                            <td className="p-4 text-slate-600">Paket Lengkap (Mat + BI)</td>
                                            <td className="p-4"><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Aktif</span></td>
                                            <td className="p-4 text-center text-blue-600 hover:underline cursor-pointer font-bold">Detail</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MATERI TAB */}
                {activeTab === 'materi' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['Modul Matematika Dasar', 'Latihan Soal IPA', 'Flashcard Bahasa Inggris'].map((m, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow group cursor-pointer">
                                <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen size={32} />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">{m}</h4>
                                <p className="text-sm text-slate-500 mb-4">Diunggah: 20 Juni 2025</p>
                                <button className="mt-auto flex items-center gap-2 text-violet-600 font-bold text-sm hover:underline">
                                    <Download size={16} /> Unduh Materi
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY/PLACEHOLDER TABS */}
                {['absensi', 'laporan', 'pengaturan'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200">
                        <Settings size={48} className="mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-slate-600 capitalize">Menu {activeTab.replace(/-/g, ' ')}</h3>
                        <p>Fitur ini akan segera tersedia.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Icon for User placeholder (if needed, but Lucide has User)
const User = ({ size = 24, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

export default BimbinganBelajar;
