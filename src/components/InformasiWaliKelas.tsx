import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Users, Phone, User, Mail, Briefcase } from 'lucide-react';

interface InformasiWaliKelasProps {
    onBack: () => void;
    user?: any;
}

const InformasiWaliKelas: React.FC<InformasiWaliKelasProps> = ({ onBack, user }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const waliKelas = user?.kelas || '';

    useEffect(() => {
        if (!waliKelas) { setLoading(false); return; }

        const loadStudents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const res = await fetch('/api/students', { headers });
                if (res.ok) {
                    const data = await res.json();
                    const filtered = Array.isArray(data) ? data.filter((s: any) => s.kelas === waliKelas) : [];
                    setStudents(filtered);
                }
            } catch (e) {
                console.error('Failed to load students:', e);
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, [waliKelas]);

    const filteredStudents = students.filter((s: any) =>
        (s.full_name || s.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis || '').includes(searchQuery)
    );

    if (selectedStudent) {
        const s = selectedStudent;
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                            {(s.full_name || s.nama || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-lg truncate">{s.full_name || s.nama}</h3>
                            <p className="text-xs text-slate-500">NIS: {s.nis || '-'} • Kelas {s.kelas || waliKelas}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-blue-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={14} /> Data Siswa
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">NIS</p>
                                <p className="font-bold text-slate-800 text-sm">{s.nis || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">NISN</p>
                                <p className="font-bold text-slate-800 text-sm">{s.nisn || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Kelas</p>
                                <p className="font-bold text-slate-800 text-sm">{s.kelas || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</p>
                                <p className="font-bold text-slate-800 text-sm">{s.tempat_lahir || s.tempatLahir || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</p>
                                <p className="font-bold text-slate-800 text-sm">{s.tanggal_lahir || s.tanggalLahir || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-5 border border-orange-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users size={14} /> Data Orang Tua
                        </h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={12} /> Nama Ayah</p>
                                <p className="font-bold text-slate-800 text-sm">{s.parent_name || s.nama_ayah || s.namaAyah || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Briefcase size={12} /> Pekerjaan Ayah</p>
                                <p className="font-bold text-slate-800 text-sm">{s.pekerjaan_ayah || s.pekerjaanAyah || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={12} /> Nama Ibu</p>
                                <p className="font-bold text-slate-800 text-sm">{s.mother_name || s.nama_ibu || s.namaIbu || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Briefcase size={12} /> Pekerjaan Ibu</p>
                                <p className="font-bold text-slate-800 text-sm">{s.pekerjaan_ibu || s.pekerjaanIbu || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Mail size={12} /> Alamat</p>
                                <p className="font-bold text-slate-800 text-sm">{s.alamat || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Phone size={14} /> Kontak
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">No. Handphone / WhatsApp</p>
                                    <p className="font-bold text-slate-800 text-sm">{s.no_hp || s.noHp || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg">Informasi Siswa</h3>
                        <p className="text-xs text-slate-500">
                            {waliKelas ? `Kelas ${waliKelas} — ${students.length} siswa` : 'Wali Kelas'}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari siswa..."
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">Tidak ada siswa</p>
                        <p className="text-sm">Belum ada siswa terdaftar di kelas ini.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredStudents.map((student: any) => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white shadow-sm group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                        {(student.full_name || student.nama || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                            {student.full_name || student.nama}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">NIS: {student.nis || '-'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400">{student.parent_name || student.namaAyah || '-'}</p>
                                        <p className="text-[10px] text-slate-300">{student.no_hp || student.noHp || ''}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformasiWaliKelas;
