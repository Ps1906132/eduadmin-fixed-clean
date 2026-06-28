import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users, Search, BookOpen, Calendar, ArrowLeft, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface KelasKuProps {
    onBack: () => void;
    user?: any;
}

const statusColors: Record<string, string> = {
    hadir: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    sakit: 'bg-blue-100 text-blue-700 border-blue-300',
    izin: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    alpa: 'bg-red-100 text-red-700 border-red-300',
};

const statusIcons: Record<string, React.ReactNode> = {
    hadir: <CheckCircle2 size={14} />,
    sakit: <AlertCircle size={14} />,
    izin: <HelpCircle size={14} />,
    alpa: <XCircle size={14} />,
};

const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    sakit: 'Sakit',
    izin: 'Izin',
    alpa: 'Alpha',
};

const KelasKu: React.FC<KelasKuProps> = ({ onBack, user }) => {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { Authorization: `Bearer ${token}` };

                const [resClasses, resClassStudents, resStudents] = await Promise.all([
                    fetch(`/api/classes?teacher_id=eq.${user.id}&is_active=eq.1`, { headers }),
                    fetch('/api/class_students?is_active=eq.1', { headers }),
                    fetch('/api/students', { headers }),
                ]);

                let classesData: any[] = [];
                if (resClasses.ok) {
                    const data = await resClasses.json();
                    classesData = Array.isArray(data) ? data : [];
                    setClasses(classesData);
                }

                let classStudentsData: any[] = [];
                if (resClassStudents.ok) {
                    const data = await resClassStudents.json();
                    classStudentsData = Array.isArray(data) ? data : [];
                }

                let studentsData: any[] = [];
                if (resStudents.ok) {
                    const data = await resStudents.json();
                    studentsData = Array.isArray(data) ? data : [];
                }

                const classIds = classesData.map((c: any) => c.id);
                const classStudentIds = classStudentsData
                    .filter((cs: any) => classIds.includes(cs.class_id))
                    .map((cs: any) => cs.student_id);

                const filteredStudents = studentsData.filter((s: any) => classStudentIds.includes(s.id));
                setStudents(filteredStudents);

                if (classesData.length > 0) {
                    setSelectedClassId(classesData[0].id);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    useEffect(() => {
        if (!selectedClassId) {
            setAttendanceData([]);
            return;
        }

        const fetchAttendance = async () => {
            try {
                const token = localStorage.getItem('eduadmin_token');
                const res = await fetch(`/api/attendance?class_id=eq.${selectedClassId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setAttendanceData(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Failed to load attendance:', e);
            }
        };

        fetchAttendance();
    }, [selectedClassId]);

    const currentClass = classes.find((c: any) => c.id === selectedClassId);

    const getStudentStats = (studentId: string) => {
        const records = attendanceData.filter(
            (a: any) => a.student_id === studentId
        );
        return {
            hadir: records.filter((r: any) => r.status === 'hadir').length,
            sakit: records.filter((r: any) => r.status === 'sakit').length,
            izin: records.filter((r: any) => r.status === 'izin').length,
            alpa: records.filter((r: any) => r.status === 'alpa').length,
            total: records.length,
        };
    };

    const getStudentDetailAttendance = (studentId: string) => {
        return attendanceData
            .filter((a: any) => a.student_id === studentId)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const filteredStudents = students.filter((s: any) =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis?.includes(searchQuery) ||
        s.nisn?.includes(searchQuery)
    );

    if (selectedStudent) {
        const detailAttendance = getStudentDetailAttendance(selectedStudent.id);
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                            {selectedStudent.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-lg truncate">{selectedStudent.full_name || 'Tanpa Nama'}</h3>
                            <p className="text-xs text-slate-500">NIS: {selectedStudent.nis || '-'} {currentClass ? `• ${currentClass.name}` : ''}</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {detailAttendance.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">Belum ada data absensi</p>
                            <p className="text-sm">Riwayat kehadiran siswa akan tampil di sini.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {detailAttendance.map((record: any) => (
                                <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusColors[record.status] || 'bg-slate-100 text-slate-500'}`}>
                                            {statusIcons[record.status] || <HelpCircle size={14} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{statusLabels[record.status] || record.status}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(record.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {record.remarks && (
                                        <span className="text-xs text-slate-400 italic max-w-[120px] text-right truncate">{record.remarks}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                        <h3 className="font-bold text-slate-800 text-lg">Kelas Ku</h3>
                        <p className="text-xs text-slate-500">{user?.nama || 'Wali Kelas'}</p>
                    </div>
                </div>

                {classes.length > 1 && (
                    <select
                        value={selectedClassId}
                        onChange={e => {
                            setSelectedClassId(e.target.value);
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold outline-none mb-3"
                    >
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}

                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari siswa..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                </div>

                {currentClass && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
                        <BookOpen size={14} />
                        <span className="font-medium">{currentClass.name}</span>
                        <span className="text-slate-300">•</span>
                        <span>{filteredStudents.length} siswa</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <Users size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-bold">Tidak ada siswa</p>
                                <p className="text-sm">Belum ada siswa terdaftar di kelas ini.</p>
                            </div>
                        ) : (
                            filteredStudents.map((student: any) => {
                                const stats = getStudentStats(student.id);
                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white shadow-sm group"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                {student.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                                    {student.full_name || 'Tanpa Nama'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium">NIS: {student.nis || '-'}</p>
                                            </div>
                                        </div>
                                        {stats.total > 0 ? (
                                            <div className="flex gap-2">
                                                {(['hadir', 'sakit', 'izin', 'alpa'] as const).map(status => (
                                                    <span
                                                        key={status}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColors[status] || 'bg-slate-50 text-slate-400 border-slate-200'}`}
                                                    >
                                                        {statusIcons[status]}
                                                        {stats[status]}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Calendar size={12} />
                                                Belum ada absensi
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KelasKu;
