import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserCheck, Search, CheckCircle, XCircle, AlertCircle, CheckCircle2, Save, Users } from 'lucide-react';

import { useAttendance } from './DashboardSuperAdmin/hooks/useAttendance';

interface KehadiranSiswaGuruProps {
    onBack: () => void;
    user?: any;
}

const KehadiranSiswaGuru: React.FC<KehadiranSiswaGuruProps> = ({ onBack, user }) => {
    const { saveAttendanceBatch, saving } = useAttendance();
    const isWaliKelas = user?.role === 'Wali Kelas' || user?.jabatan === 'Guru Kelas' || !!user?.kelas;
    const [selectedClass, setSelectedClass] = useState(user?.kelas || '1A');
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');
    const [classesList, setClassesList] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resClasses, resStudents] = await Promise.all([
                    fetch('/api/classes', { headers }),
                    fetch('/api/students', { headers })
                ]);

                if (resClasses.ok) {
                    const data = await resClasses.json();
                    setClassesList(Array.isArray(data) ? data : []);
                }
                if (resStudents.ok) {
                    const data = await resStudents.json();
                    setStudents(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Failed to load data from D1:', e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [fetchingAttendance, setFetchingAttendance] = useState(false);

    useEffect(() => {
        const loadAttendance = async () => {
            setFetchingAttendance(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const res = await fetch(`/api/attendance?select=*`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setAttendanceData(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Failed to load attendance:', e);
            } finally {
                setFetchingAttendance(false);
            }
        };

        loadAttendance();
    }, []);

    const classStudents = students.filter((s: any) => s.kelas === selectedClass || s.class_id === selectedClass);
    const [searchQuery, setSearchQuery] = useState('');
    const todayStr = new Date().toISOString().split('T')[0];

    const handleUpdateStatus = (studentId: number, newStatus: string) => {
        const newData = [...attendanceData];
        const index = newData.findIndex((d: any) => d.student_id === studentId && d.date === todayStr);

        if (index >= 0) {
            newData[index] = { ...newData[index], status: newStatus };
        } else {
            newData.push({ student_id: studentId, date: todayStr, status: newStatus });
        }
        setAttendanceData(newData);
    };

    const getStudentStatus = (studentId: number) => {
        const record = attendanceData.find((d: any) => d.student_id === studentId && d.date === todayStr);
        return record?.status || '';
    };

    const statusList = ['H', 'S', 'I', 'A'];
    const statusColors: Record<string, string> = {
        H: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        S: 'bg-blue-100 text-blue-700 border-blue-300',
        I: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        A: 'bg-red-100 text-red-700 border-red-300',
    };
    const statusLabels: Record<string, string> = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpha' };

    const handleSaveAll = async () => {
        const todayRecords = attendanceData.filter((d: any) => d.date === todayStr);
        if (todayRecords.length === 0) {
            return;
        }

        const records = todayRecords.map((r: any) => ({
            studentId: r.student_id.toString(),
            classId: selectedClass,
            date: todayStr,
            status: r.status as 'H' | 'S' | 'I' | 'A',
            note: r.remarks || ''
        }));

        const result = await saveAttendanceBatch(records);
        if (result.success) {
            // already handled by hook
        }
    };

    const filteredStudents = classStudents.filter((s: any) =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis?.includes(searchQuery)
    );

    const todayAttendanceCount = attendanceData.filter((d: any) => d.date === todayStr).length;
    const totalStudents = classStudents.length;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg">Input Kehadiran Siswa</h3>
                        <p className="text-xs text-slate-500">{user?.nama || 'Guru'}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="flex-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold outline-none"
                    >
                        {classesList.map((c: any) => (
                            <option key={c.id || c.nama} value={c.nama || c.name}>{c.nama || c.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedSemester}
                        onChange={e => setSelectedSemester(e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-bold outline-none"
                    >
                        <option>1 (Ganjil)</option>
                        <option>2 (Genap)</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari siswa..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                    </div>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving || todayAttendanceCount === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <Save size={16} />
                        {saving ? 'Menyimpan...' : `Simpan (${todayAttendanceCount}/${totalStudents})`}
                    </button>
                </div>

                {todayAttendanceCount > 0 && todayAttendanceCount < totalStudents && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                        <AlertCircle size={14} />
                        <span className="font-bold">{totalStudents - todayAttendanceCount} siswa belum diisi</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {fetchingAttendance || loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                <div className="space-y-2">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <Users size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold">Tidak ada siswa</p>
                            <p className="text-sm">Tidak ditemukan siswa untuk kelas ini.</p>
                        </div>
                    ) : (
                        filteredStudents.map((student: any) => {
                            const currentStatus = getStudentStatus(student.id);
                            return (
                                <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors bg-white shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                            {student.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-800 text-sm truncate">{student.full_name || 'Tanpa Nama'}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{student.nis || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                        {statusList.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdateStatus(student.id, s)}
                                                className={`w-9 h-9 rounded-xl text-xs font-bold border-2 transition-all ${
                                                    currentStatus === s
                                                        ? `${statusColors[s]} shadow-sm scale-105`
                                                        : 'border-slate-200 text-slate-400 hover:border-slate-300 bg-slate-50'
                                                }`}
                                                title={statusLabels[s]}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default KehadiranSiswaGuru;