
import React, { useState, useEffect } from 'react';
import {
    School,
    Users,
    ChevronDown,
    Search,
    User,
    GraduationCap
} from 'lucide-react';

interface KelasItem {
    id: number;
    kode: string;
    nama: string;
    wali: string;
    waliNip: string;
}

interface KelasWaliProps {
    kelasData: KelasItem[];
    studentsData: Record<string, Array<{ no: number; nis: string; nama: string; gender: string }>>;
}

const KelasWali: React.FC<KelasWaliProps> = ({ kelasData, studentsData }) => {
    const [selectedClassRaw, setSelectedClassRaw] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Initialize selected class if data exists
    useEffect(() => {
        if (kelasData.length > 0 && !selectedClassRaw) {
            setSelectedClassRaw(kelasData[0].nama);
        }
    }, [kelasData, selectedClassRaw]);

    const currentClassInfo = kelasData.find(c => c.nama === selectedClassRaw);
    const currentStudents = studentsData[selectedClassRaw] || [];

    // Filter students
    const filteredStudents = currentStudents.filter(s =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm)
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3 text-[#004AAD]">
                    <School size={32} />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Kelas & Wali Kelas</h2>
                        <p className="text-sm text-slate-500">Lihat daftar siswa dan wali kelas untuk setiap rombongan belajar.</p>
                    </div>
                </div>

                {/* Class Selector */}
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedClassRaw}
                        onChange={(e) => setSelectedClassRaw(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent appearance-none cursor-pointer transition-all hover:bg-slate-50"
                    >
                        {kelasData.map((cls) => (
                            <option key={cls.id} value={cls.nama}>{cls.nama}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Wali Kelas Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-[#004AAD] to-[#003380] rounded-3xl p-6 text-white shadow-lg sticky top-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <GraduationCap size={24} />
                            </div>
                            <span className="font-bold text-lg">Wali Kelas</span>
                        </div>

                        <div className="text-center py-4">
                            <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-md border-4 border-white/10">
                                <User size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">{currentClassInfo?.wali || '-'}</h3>
                            <p className="text-blue-200 text-sm font-mono mb-4">{currentClassInfo?.waliNip ? `NIP: ${currentClassInfo.waliNip}` : 'Belum ada Wali Kelas'}</p>

                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-xs text-blue-200 uppercase tracking-wider font-bold mb-1">Total Siswa</p>
                                <p className="text-2xl font-bold">{currentStudents.length} Siswa</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        {/* Table Toolbar */}
                        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                                <Users size={20} className="text-[#004AAD]" />
                                Daftar Siswa {selectedClassRaw}
                            </h3>

                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Cari siswa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent transition-all"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 w-16 text-center">No</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">NIS / NISN</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Siswa</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">L/P</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, idx) => (
                                            <tr key={student.nis} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-slate-600 border-r border-slate-50">{student.nis}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{student.nama}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-600 text-center">
                                                    <span className={`px-2 py-1 rounded-md text-xs ${student.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                        {student.gender}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                {currentStudents.length === 0 ? "Tidak ada data siswa untuk kelas ini." : "Tidak ditemukan siswa yang cocok."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                            Menampilkan data siswa tahun ajaran 2024/2025
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default KelasWali;
