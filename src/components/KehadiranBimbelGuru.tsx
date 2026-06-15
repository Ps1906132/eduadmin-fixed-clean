import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, UserCheck, Search, CheckCircle, XCircle, AlertCircle, Users, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface KehadiranBimbelGuruProps {
    onBack: () => void;
    classes?: any[];
    enrollments?: any[];
}

const STATUS_MAP: Record<string, string> = {
    'hadir': 'hadir',
    'sakit': 'sakit',
    'izin': 'izin',
    'alpa': 'alpa'
};

const KehadiranBimbelGuru: React.FC<KehadiranBimbelGuruProps> = ({ onBack, classes = [], enrollments = [] }) => {
    const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 0);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
    const [notesMap, setNotesMap] = useState<Record<string, string>>({});
    const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const todayStr = new Date().toISOString().split('T')[0];

    const selectedClassEnrollments = enrollments.filter(e => e.classId === selectedClassId);

    const loadAttendance = useCallback(async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const res = await fetch(`/api/bimbel_attendance?tutoring_class_id=eq.${selectedClassId}&date=eq.${todayStr}`, { headers });
            if (res.ok) {
                const data = await res.json();
                const records = Array.isArray(data) ? data : [];
                setExistingAttendance(records);

                const map: Record<string, string> = {};
                const notes: Record<string, string> = {};
                records.forEach((r: any) => {
                    map[r.student_id] = r.status;
                    if (r.notes) notes[r.student_id] = r.notes;
                });
                setAttendanceMap(map);
                setNotesMap(notes);
            }
        } catch (e) {
            console.error('Failed to load bimbel attendance:', e);
        } finally {
            setLoading(false);
        }
    }, [selectedClassId, todayStr]);

    useEffect(() => {
        loadAttendance();
    }, [loadAttendance]);

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    };

    const handleNoteChange = (studentId: string, note: string) => {
        setNotesMap(prev => ({ ...prev, [studentId]: note }));
    };

    const handleSave = async () => {
        if (!selectedClassId || selectedClassEnrollments.length === 0) {
            toast.error('Tidak ada data untuk disimpan');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const records = selectedClassEnrollments.map(e => ({
                id: `batt-${todayStr}-${e.studentId}`,
                enrollment_id: e.id,
                tutoring_class_id: selectedClassId.toString(),
                student_id: e.studentId,
                date: todayStr,
                status: STATUS_MAP[attendanceMap[e.studentId]] || 'hadir',
                notes: notesMap[e.studentId] || null
            }));

            await fetch(`/api/bimbel_attendance?tutoring_class_id=eq.${selectedClassId}&date=eq.${todayStr}`, {
                method: 'DELETE',
                headers
            });

            const res = await fetch('/api/bimbel_attendance', {
                method: 'POST',
                headers,
                body: JSON.stringify(records)
            });

            if (res.ok) {
                toast.success('Absensi bimbel berhasil disimpan!');
                loadAttendance();
            } else {
                const err = await res.text();
                toast.error('Gagal menyimpan: ' + err);
            }
        } catch (e) {
            toast.error('Gagal menyimpan absensi');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <UserCheck className="text-teal-500" size={20} />
                        Kehadiran Les
                    </h2>
                </div>
                <div className="bg-teal-50 text-teal-600 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1">
                    <Users size={14} /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                {/* Class Selector */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Pilih Kelas Bimbel</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                    >
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {selectedClassEnrollments.length === 0 ? (
                                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                                    <Users size={40} className="mx-auto mb-3 text-slate-300" />
                                    <p className="font-bold text-slate-400">Belum ada siswa terdaftar</p>
                                    <p className="text-xs text-slate-400 mt-1">Tidak ada enrollment untuk kelas ini.</p>
                                </div>
                            ) : (
                                selectedClassEnrollments.map((enrollment: any) => {
                                    const studentId = enrollment.studentId;
                                    const currentStatus = attendanceMap[studentId] || 'hadir';
                                    return (
                                        <div key={enrollment.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                                        {enrollment.studentName?.substring(0, 1) || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg">{enrollment.studentName || `Siswa #${studentId}`}</h3>
                                                        <p className="text-xs text-slate-400">ID: {studentId}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                {[
                                                    { key: 'hadir', label: 'Hadir', icon: CheckCircle, color: 'green' },
                                                    { key: 'izin', label: 'Izin/Sakit', icon: AlertCircle, color: 'yellow' },
                                                    { key: 'alpa', label: 'Tanpa Ket.', icon: XCircle, color: 'red' },
                                                ].map(({ key, label, icon: Icon, color }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => handleStatusChange(studentId, key)}
                                                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 transition-all ${
                                                            currentStatus === key
                                                                ? `border-${color}-500 bg-${color}-50 text-${color}-600`
                                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                                        }`}
                                                    >
                                                        <Icon size={24} className={currentStatus === key ? `fill-${color}-500 text-white` : ''} />
                                                        <span className="text-xs font-bold">{label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Catatan Perkembangan (Opsional)</label>
                                                <textarea
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                                    rows={2}
                                                    placeholder="Catatan khusus untuk sesi ini..."
                                                    value={notesMap[studentId] || ''}
                                                    onChange={(e) => handleNoteChange(studentId, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {selectedClassEnrollments.length > 0 && (
                            <div className="mt-8">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-teal-700/20 hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {saving ? 'Menyimpan...' : 'Simpan Absensi Bimbel'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default KehadiranBimbelGuru;
