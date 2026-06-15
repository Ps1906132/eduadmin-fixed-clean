import React, { useState } from 'react';
import {
    ArrowUpCircle,
    History,
    Settings,
    CheckCircle2,
    Users,
    AlertTriangle,
    Download,
    ArrowRight
} from 'lucide-react';
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';

const NaikKelas: React.FC = () => {
    const [activeTab, setActiveTab] = useState('proses');

    // Navigation Menu
    const menuItems = [
        { id: 'proses', label: 'Proses Naik Kelas', icon: <ArrowUpCircle size={20} />, color: 'blue' },
        { id: 'riwayat', label: 'Riwayat Naik Kelas', icon: <History size={20} />, color: 'amber' },
        { id: 'pengaturan', label: 'Pengaturan Naik Kelas', icon: <Settings size={20} />, color: 'slate' },
    ];

    // Mock Data for "Proses" Table
    const promotionRules = [
        { current: 'Kelas 1', action: 'Pindah ke Kelas 2', type: 'promotion' },
        { current: 'Kelas 2', action: 'Pindah ke Kelas 3', type: 'promotion' },
        { current: 'Kelas 3', action: 'Pindah ke Kelas 4', type: 'promotion' },
        { current: 'Kelas 4', action: 'Pindah ke Kelas 5', type: 'promotion' },
        { current: 'Kelas 5', action: 'Pindah ke Kelas 6', type: 'promotion' },
        { current: 'Kelas 6', action: 'Status diubah menjadi Alumni', type: 'graduation' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                <ArrowUpCircle size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Kenaikan Kelas & Kelulusan</h2>
                                <p className="text-slate-500 text-sm font-medium">Kelola proses kenaikan tingkat siswa dan kelulusan alumni.</p>
                            </div>
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
                                            ? `bg-blue-600 text-white shadow-lg shadow-blue-200`
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

                {/* PROSES TAB */}
                {activeTab === 'proses' && (
                    <div className="space-y-8">
                        {/* Info Card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-blue-800">Perhatian Sebelum Memproses</h3>
                                <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
                                    Pastikan seluruh nilai rapot telah selesai diinput dan difinalisasi. Proses ini akan memindahkan siswa ke tingkat selanjutnya secara otomatis berdasarkan aturan di bawah ini. Data siswa yang ada di kelas akhir akan dipindahkan ke data Alumni.
                                </p>
                            </div>
                        </div>

                        {/* Rules Table */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 w-1/3">Kelas Saat Ini</th>
                                        <th className="p-4 w-2/3 flex justify-between items-center">
                                            Aksi yang Dilakukan
                                            <Download size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {promotionRules.map((rule, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-4 font-bold text-slate-700 bg-slate-50/30">
                                                {rule.current}
                                            </td>
                                            <td className="p-4">
                                                {rule.type === 'promotion' ? (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <ArrowRight size={16} className="text-blue-500" />
                                                        {rule.action}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                                            {rule.action}
                                                        </div>
                                                        <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs text-slate-500 border border-slate-200">
                                                            class_id = NULL <br />
                                                            graduation_year = [tahun saat ini]
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button className="bg-[#004AAD] hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                                <ArrowUpCircle size={20} />
                                Jalankan Proses Kenaikan Kelas
                            </button>
                        </div>
                    </div>
                )}

                {/* RIWAYAT TAB */}
                {activeTab === 'riwayat' && (
                    <div className="flex flex-col items-center justify-center h-96 text-center text-slate-400">
                        <History size={64} className="mb-4 opacity-50 text-amber-300" />
                        <h3 className="text-xl font-bold text-slate-600">Belum Ada Riwayat</h3>
                        <p className="max-w-md mx-auto mt-2 text-slate-400">
                            Riwayat proses kenaikan kelas akan muncul di sini setelah Anda melakukan proses kenaikan kelas untuk pertama kalinya.
                        </p>
                    </div>
                )}

                {/* PENGATURAN TAB */}
                {activeTab === 'pengaturan' && (
                    <div className="max-w-2xl space-y-6">
                        <div className="p-4 border border-slate-200 rounded-xl">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Settings size={20} className="text-slate-500" />
                                Konfigurasi Kenaikan
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Tahun Ajaran Baru Otomatis</p>
                                        <p className="text-xs text-slate-500">Buat tahun ajaran baru setelah proses selesai</p>
                                    </div>
                                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">Arsipkan Data Kelas Lama</p>
                                        <p className="text-xs text-slate-500">Simpan data kelas sebelumnya sebagai arsip</p>
                                    </div>
                                    <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default NaikKelas;
