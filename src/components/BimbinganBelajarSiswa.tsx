import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, MapPin, User, BookOpen, ChevronRight, PlayCircle, FileText, Video, Download, Link, CheckCircle, XCircle, AlertCircle, TrendingUp, Award } from 'lucide-react';
import CBTSiswa from './CBTSiswa';
import { useTutoring } from './DashboardSuperAdmin/hooks/useTutoring';

interface BimbinganBelajarSiswaProps {
    onBack: () => void;
    user?: any;
}

const BimbinganBelajarSiswa: React.FC<BimbinganBelajarSiswaProps> = ({ onBack, user }) => {
    const { tutoringClasses } = useTutoring();
    const [view, setView] = useState<'list' | 'detail' | 'session'>('list');
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showCBT, setShowCBT] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState<{ hadir: number; sakit: number; izin: number; alpa: number }>({ hadir: 0, sakit: 0, izin: 0, alpa: 0 });
    const [latestProgress, setLatestProgress] = useState<any[]>([]);

    // Filter classes if user info exists (Simulasi: Siswa hanya lihat kelas mereka)
    // Untuk demo, kita tampilkan semua kelas yang 'Aktif'
    const classes = tutoringClasses;

    const studentId = user?.studentId;

    const fetchBimbelData = async (clsId: number) => {
        if (!studentId) return;
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [attRes, progRes] = await Promise.all([
                fetch(`/api/bimbel_attendance?student_id=eq.${studentId}&tutoring_class_id=eq.${clsId}`, { headers }),
                fetch(`/api/bimbel_progress?student_id=eq.${studentId}&tutoring_class_id=eq.${clsId}`, { headers })
            ]);

            if (attRes.ok) {
                const attData = await attRes.json();
                const records = Array.isArray(attData) ? attData : [];
                const stats = { hadir: 0, sakit: 0, izin: 0, alpa: 0 };
                records.forEach((r: any) => {
                    if (r.status in stats) stats[r.status as keyof typeof stats]++;
                });
                setAttendanceStats(stats);
            }

            if (progRes.ok) {
                const progData = await progRes.json();
                setLatestProgress(Array.isArray(progData) ? progData.slice(-3).reverse() : []);
            }
        } catch (e) {
            console.error('Failed to fetch bimbel data:', e);
        }
    };

    const handleClassClick = (cls: any) => {
        setSelectedClass(cls);
        setView('detail');
        fetchBimbelData(cls.id);
    };

    const handleSessionClick = (session: any) => {
        setSelectedSession(session);
        setView('session');
    };

    if (showCBT) {
        return <CBTSiswa onBack={() => setShowCBT(false)} title={selectedSession?.title || 'Latihan Soal'} sessionId={selectedSession?.exam_id || selectedSession?.id || ''} />;
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button
                    onClick={() => {
                        if (view === 'session') setView('detail');
                        else if (view === 'detail') setView('list');
                        else onBack();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <h2 className="font-bold text-lg text-slate-800">
                    {view === 'list' ? 'Bimbingan Belajar' : selectedClass?.title}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">

                {view === 'list' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                            <BookOpen className="text-[#004AAD]" size={20} />
                            <h3>Kelas Saya</h3>
                        </div>

                        <div className="space-y-4">
                            {classes.map((cls) => (
                                <div
                                    key={cls.id}
                                    onClick={() => handleClassClick(cls)}
                                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <span className="absolute top-5 right-5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        {cls.status}
                                    </span>

                                    <h4 className="font-bold text-slate-800 text-lg pr-16 mb-3 group-hover:text-[#004AAD] transition-colors">
                                        {cls.title}
                                    </h4>

                                    <div className="space-y-2 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            <span>{cls.teacher}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>{cls.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span>{cls.room}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-[#004AAD]">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Sesi Berikutnya: {cls.sessions && cls.sessions.length > 0 ? cls.sessions[0].date : 'Belum ada jadwal'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'detail' && selectedClass && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        {/* Class Info Box */}
                        <div className="bg-[#f8faff] p-6 rounded-3xl border border-blue-100 text-center space-y-2">
                            <h3 className="font-bold text-slate-800 text-xl">{selectedClass.title}</h3>
                            <p className="text-slate-500 text-sm">{selectedClass.teacher}</p>
                        </div>

                        {/* Description */}
                        <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 text-slate-700 text-sm leading-relaxed">
                            {selectedClass.description}
                        </div>

                        {/* Attendance Stats */}
                        {studentId && (
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    Kehadiran
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Hadir', count: attendanceStats.hadir, color: 'green' },
                                        { label: 'Sakit', count: attendanceStats.sakit, color: 'yellow' },
                                        { label: 'Izin', count: attendanceStats.izin, color: 'blue' },
                                        { label: 'Alpa', count: attendanceStats.alpa, color: 'red' },
                                    ].map(({ label, count, color }) => (
                                        <div key={label} className={`bg-${color}-50 p-3 rounded-xl text-center border border-${color}-100`}>
                                            <span className={`text-xl font-bold text-${color}-600 block`}>{count}</span>
                                            <span className={`text-[10px] font-bold text-${color}-500`}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Latest Progress */}
                        {latestProgress.length > 0 && (
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-indigo-500" />
                                    Perkembangan Terbaru
                                </h4>
                                <div className="space-y-2">
                                    {latestProgress.map((p: any) => (
                                        <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm text-slate-700">
                                                    {p.report_type === 'tryout' ? p.title : `Evaluasi ${p.month}`}
                                                </span>
                                                {p.score && (
                                                    <span className="font-bold text-lg text-indigo-600">{p.score}</span>
                                                )}
                                            </div>
                                            {p.notes && <p className="text-xs text-slate-600">{p.notes}</p>}
                                            {p.recommendation && (
                                                <p className="text-xs text-indigo-500 mt-1">Rekomendasi: {p.recommendation}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 mt-1">{p.score_date || p.month}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sessions List */}
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-[#004AAD]" />
                                Daftar Materi & Pertemuan
                            </h4>
                            <div className="space-y-3">
                                {selectedClass.sessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSessionClick(session)}
                                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 cursor-pointer group transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                            <PlayCircle size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-slate-800 text-sm group-hover:text-[#004AAD] transition-colors">{session.title}</h5>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {session.date}
                                                </span>
                                                {session.meetingLink && (
                                                    <span className="flex items-center gap-1 text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-blue-200">
                                                        <Video size={10} /> LIVE MEET
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-[#004AAD]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'session' && selectedSession && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        {/* Video Player Container */}
                        <div className="bg-black rounded-3xl overflow-hidden shadow-lg aspect-video relative">
                            <iframe
                                className="w-full h-full absolute top-0 left-0"
                                src={`https://www.youtube.com/embed/${selectedSession.youtubeId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-xl">{selectedSession.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock size={16} /> <span>{selectedSession.date}</span>
                            </div>

                            {/* Meeting Link Button */}
                            {selectedSession.meetingLink && (
                                <a
                                    href={selectedSession.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-[#004AAD] border border-blue-700 hover:bg-blue-800 transition-all p-4 rounded-xl flex items-center gap-3 text-white shadow-lg shadow-blue-200 group animate-bounce-subtle"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                        <Video size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm">Join Zoom / Google Meet</h4>
                                        <p className="text-xs text-blue-100">Klik untuk bergabung ke pertemuan daring</p>
                                    </div>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}

                            {/* Materi Button */}
                            <a
                                href={selectedSession.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors p-4 rounded-xl flex items-center gap-3 text-indigo-700 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Materi Pembelajaran (PDF)</h4>
                                    <p className="text-xs text-indigo-500">Klik untuk melihat materi di Google Drive</p>
                                </div>
                                <ChevronRight size={18} />
                            </a>

                            {/* Latihan Soal Button */}
                            {/* Latihan Soal Button */}
                            <button
                                onClick={() => setShowCBT(true)}
                                className="block w-full text-left bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors p-4 rounded-xl flex items-center gap-3 text-orange-700 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
                                    <PlayCircle size={20} className="fill-orange-500 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Latihan Soal / Kuis</h4>
                                    <p className="text-xs text-orange-500">Kerjakan soal latihan untuk pertemuan ini</p>
                                </div>
                                <div className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-orange-600 shadow-sm border border-orange-100">
                                    Mulai
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BimbinganBelajarSiswa;
