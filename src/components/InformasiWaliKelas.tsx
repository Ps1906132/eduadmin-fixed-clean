import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Users, Phone, User, Briefcase } from 'lucide-react';

interface InformasiWaliKelasProps {
    onBack: () => void;
    user?: any;
}

const InformasiWaliKelas: React.FC<InformasiWaliKelasProps> = ({ onBack, user }) => {
    const [classStudentsMap, setClassStudentsMap] = useState<Record<string, string[]>>({});
    const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});
    const [classList, setClassList] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resClasses, resStudents, resClassStudents, resSchedules] = await Promise.all([
                    fetch('/api/classes', { headers }),
                    fetch('/api/students', { headers }),
                    fetch('/api/class_students?is_active=eq.1', { headers }),
                    fetch(`/api/schedules?teacher_id=eq.${user?.id || ''}`, { headers }),
                ]);

                const allClasses: any[] = resClasses.ok ? (await resClasses.json()) : [];
                const allStudents: any[] = resStudents.ok ? (await resStudents.json()) : [];
                const allClassStudents: any[] = resClassStudents.ok ? (await resClassStudents.json()) : [];
                const schedules: any[] = resSchedules.ok ? (await resSchedules.json()) : [];

                const scheduleClassIds = new Set(schedules.map((s: any) => s.class_id));
                const waliClassIds = new Set(allClasses.filter((c: any) => c.teacher_id === user?.id).map((c: any) => c.id));
                const teacherClassIds = new Set([...scheduleClassIds, ...waliClassIds]);
                const filteredClasses = allClasses.filter((c: any) => teacherClassIds.has(c.id));
                setClassList(filteredClasses);

                const studentsMap: Record<string, any> = {};
                allStudents.forEach((s: any) => { studentsMap[s.id] = s; });

                const classStudentsMap: Record<string, string[]> = {};
                allClassStudents.forEach((cs: any) => {
                    if (!classStudentsMap[cs.class_id]) classStudentsMap[cs.class_id] = [];
                    classStudentsMap[cs.class_id].push(cs.student_id);
                });

                setClassStudentsMap(classStudentsMap);
                setStudentsMap(studentsMap);

                if (filteredClasses.length > 0 && !selectedClass) {
                    const defaultClass = filteredClasses.find((c: any) => c.teacher_id === user?.id) || filteredClasses[0];
                    setSelectedClass(defaultClass.id);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id]);

    const classStudentIds: string[] = classStudentsMap[selectedClass] || [];
    const classStudents = classStudentIds.map((sid: string) => studentsMap[sid]).filter(Boolean);

    const filteredStudents = classStudents.filter((s: any) =>
        (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis || '').includes(searchQuery)
    );

    const selectedClassName = classList.find((c: any) => c.id === selectedClass)?.name || '';

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
                            {(s.full_name || '?').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-lg truncate">{s.full_name}</h3>
                            <p className="text-xs text-slate-500">NIS: {s.nis || '-'} • Kelas {selectedClassName}</p>
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
                                <p className="font-bold text-slate-800 text-sm">{selectedClassName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Jenis Kelamin</p>
                                <p className="font-bold text-slate-800 text-sm">{s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tempat Lahir</p>
                                <p className="font-bold text-slate-800 text-sm">{s.birth_place || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir</p>
                                <p className="font-bold text-slate-800 text-sm">{s.birth_date || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-5 border border-orange-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users size={14} /> Data Orang Tua
                        </h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={12} /> Nama Ayah / Wali</p>
                                <p className="font-bold text-slate-800 text-sm">{s.parent_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Briefcase size={12} /> Pekerjaan Ayah</p>
                                <p className="font-bold text-slate-800 text-sm">{s.parent_job || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><User size={12} /> Nama Ibu</p>
                                <p className="font-bold text-slate-800 text-sm">{s.mother_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Briefcase size={12} /> Pekerjaan Ibu</p>
                                <p className="font-bold text-slate-800 text-sm">{s.mother_job || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Alamat</p>
                                <p className="font-bold text-slate-800 text-sm">{s.address || '-'}</p>
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
                                    <p className="font-bold text-slate-800 text-sm">{s.phone || '-'}</p>
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
                            {selectedClassName ? `${selectedClassName} — ${classStudents.length} siswa` : 'Pilih kelas'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mb-3">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold outline-none"
                    >
                        {classList.length === 0 && <option value="">Tidak ada kelas</option>}
                        {classList.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
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
                        <p className="text-sm">Tidak ditemukan siswa untuk kelas ini.</p>
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
                                        {(student.full_name || '?').charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                            {student.full_name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-medium">NIS: {student.nis || '-'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400">{student.parent_name || '-'}</p>
                                        <p className="text-[10px] text-slate-300">{student.phone || ''}</p>
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
