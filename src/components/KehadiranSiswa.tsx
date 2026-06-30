import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Calendar, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface KehadiranSiswaProps {
    onBack: () => void;
    user?: any;
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const KehadiranSiswa: React.FC<KehadiranSiswaProps> = ({ onBack, user }) => {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);
    const [myAttendance, setMyAttendance] = useState<any[]>([]);

    useEffect(() => {
        const loadAttendance = async () => {
            setLoading(true);
            try {
                const studentId = user?.studentId || user?.id || (user?.nis ? parseInt(user.nis) : 0);
                if (!studentId) {
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const res = await fetch(`/api/attendance?student_id=eq.${studentId}&select=*`, { headers });
                if (res.ok) {
                    const records = await res.json();
                    if (Array.isArray(records)) {
                        setMyAttendance(records.map((r: any) => ({
                            studentId: r.student_id,
                            studentName: r.student_name || '',
                            date: r.date,
                            status: r.status,
                            note: r.remarks || ''
                        })));
                    }
                }
            } catch (e) {
                console.error("Failed to load attendance from D1:", e);
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, [user]);

    const filteredAttendance = useMemo(() => {
        const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        return myAttendance.filter(r => r.date?.startsWith(prefix));
    }, [myAttendance, selectedMonth, selectedYear]);

    const countStatus = (status: string) => filteredAttendance.filter(r => r.status === status).length;

    const stats = [
        { label: 'Hadir', value: countStatus('hadir'), color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={20} /> },
        { label: 'Sakit', value: countStatus('sakit'), color: 'bg-blue-100 text-blue-700', icon: <AlertCircle size={20} /> },
        { label: 'Izin', value: countStatus('izin'), color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={20} /> },
        { label: 'Alpha', value: countStatus('alpa'), color: 'bg-red-100 text-red-700', icon: <XCircle size={20} /> },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'hadir': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'sakit': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'izin': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'alpa': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'hadir': return 'bg-emerald-100 text-emerald-700';
            case 'sakit': return 'bg-blue-100 text-blue-700';
            case 'izin': return 'bg-yellow-100 text-yellow-700';
            case 'alpa': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'hadir': return 'Hadir';
            case 'sakit': return 'Sakit';
            case 'izin': return 'Izin';
            case 'alpa': return 'Alpha';
            default: return status;
        }
    };

    const getInitial = (status: string) => {
        switch (status) {
            case 'hadir': return 'H';
            case 'sakit': return 'S';
            case 'izin': return 'I';
            case 'alpa': return 'A';
            default: return '-';
        }
    };

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Kehadiran Siswa</h3>
                    <p className="text-xs text-slate-500">{user?.studentName || user?.nama || ''}</p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Calendar size={18} className="text-blue-500" />
                        {MONTHS_ID[selectedMonth]} {selectedYear}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {stats.map((item, index) => (
                        <div key={index} className={`p-4 rounded-2xl ${item.color.replace('text', 'bg').replace('100', '50')} border border-slate-100`}>
                            <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center mb-3`}>
                                {item.icon}
                            </div>
                            <p className="text-2xl font-bold text-slate-800">{item.value}</p>
                            <p className="text-xs font-medium opacity-80">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Riwayat Kehadiran</h4>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Memuat data...</div>
                        ) : filteredAttendance.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Belum ada data absensi</div>
                        ) : (
                            filteredAttendance.map((record, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${getStatusColor(record.status)}`}>
                                            {getInitial(record.status)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{record.date}</p>
                                            {record.note && (
                                                <p className="text-xs text-slate-500 mt-1">{record.note}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(record.status)}`}>
                                        {getStatusLabel(record.status)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KehadiranSiswa;
