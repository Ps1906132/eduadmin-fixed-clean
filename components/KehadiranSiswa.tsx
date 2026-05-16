import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { attendanceDataGlobal } from '../data/sharedData';

interface KehadiranSiswaProps {
    onBack: () => void;
    user?: any;
}

const KehadiranSiswa: React.FC<KehadiranSiswaProps> = ({ onBack, user }) => {
    // Current Month for display/filtering logic (simplified for now)
    const [selectedMonth, setSelectedMonth] = useState('Oktober 2025');

    // 1. Identify Student
    const studentName = user?.studentName || user?.nama || 'Ahmad Zaki';

    // 2. Filter Attendance Records from LocalStorage
    const [myAttendance, setMyAttendance] = useState<any[]>([]);

    useEffect(() => {
        const loadAttendance = () => {
            const rawData = localStorage.getItem('attendance_data_v2');
            let records: any[] = [];

            if (rawData) {
                try {
                    const parsed = JSON.parse(rawData);
                    if (Array.isArray(parsed)) {
                        records = parsed;
                    }
                } catch (e) {
                    console.error("Failed to parse attendance", e);
                }
            }

            // FILTER: Show only records for this student
            // We match by studentId (number) or studentName (string) if ID is missing in user context
            // Ideally match by ID.
            const myId = user?.studentId || (user?.nis ? parseInt(user.nis) : 0);

            // Allow matching by Name if ID fails (fallback for demo)
            const myName = user?.studentName || user?.nama;

            const myRecords = records.filter(rec => {
                // Check ID match
                if (rec.studentId && myId && rec.studentId === myId) return true;
                // Check Name match (fallback)
                if (rec.studentName && myName && rec.studentName.toLowerCase() === myName.toLowerCase()) return true;
                return false;
            });

            // If empty, try fallback to static Global data (only if strictly needed, but let's trust localStorage first)
            if (myRecords.length === 0 && attendanceDataGlobal.length > 0) {
                const staticRecs = attendanceDataGlobal.filter(rec =>
                    (rec.studentId === myId) ||
                    (rec.studentName && myName && rec.studentName.toLowerCase() === myName.toLowerCase())
                );
                setMyAttendance(staticRecs);
            } else {
                // Sort by date desc
                myRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setMyAttendance(myRecords);
            }
        };

        loadAttendance();
    }, [user, studentName]);

    // 3. Count Stats
    const countStatus = (status: string) => myAttendance.filter(r => r.status === status).length;

    // Summary Stats
    const stats = [
        { label: 'Hadir', value: countStatus('Hadir'), color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={20} /> },
        { label: 'Sakit', value: countStatus('Sakit'), color: 'bg-blue-100 text-blue-700', icon: <AlertCircle size={20} /> },
        { label: 'Izin', value: countStatus('Izin'), color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={20} /> },
        { label: 'Alpha', value: countStatus('Alpha'), color: 'bg-red-100 text-red-700', icon: <XCircle size={20} /> },
    ];

    const getStatusType = (status: string) => {
        if (status === 'Hadir') return 'present';
        if (status === 'Sakit') return 'sick';
        if (status === 'Izin') return 'permission';
        return 'alpha';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Hadir': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Sakit': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Izin': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Alpha': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'Hadir': return 'bg-emerald-100 text-emerald-700';
            case 'Sakit': return 'bg-blue-100 text-blue-700';
            case 'Izin': return 'bg-yellow-100 text-yellow-700';
            case 'Alpha': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Kehadiran Siswa</h3>
                    <p className="text-xs text-slate-500">{studentName}</p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {/* Month Selector */}
                <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <button className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Calendar size={18} className="text-blue-500" />
                        {selectedMonth}
                    </div>
                    <button className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Stats Grid */}
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

                {/* Attendance List */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Riwayat Kehadiran</h4>
                    <div className="space-y-3">
                        {myAttendance.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 italic text-sm">Belum ada data absensi</div>
                        ) : (
                            myAttendance.map((record, index) => (
                                <div key={record.id || index} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${getStatusColor(record.status)}`}>
                                            {record.status.substring(0, 1)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{record.date}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500`}>
                                                    {record.time || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(record.status)}`}>
                                        {record.status}
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
