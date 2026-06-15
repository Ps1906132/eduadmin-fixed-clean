import React, { useState } from 'react';
import { ChevronRight, BookOpen, Clock, MapPin, User, Calendar, PlayCircle, FileText, PenTool, Youtube, ArrowLeft, Download } from 'lucide-react';

interface BimbinganSiswaProps {
    onBack: () => void;
}

const BimbinganSiswa: React.FC<BimbinganSiswaProps> = ({ onBack }) => {
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

    // Mock Data for Tutoring Programs
    const myClasses = [
        {
            id: 1,
            subject: 'Matematika - Persiapan Olimpiade',
            tutor: 'Bpk. Hendra Mathematics',
            schedule: 'Senin & Kamis, 16:00 - 17:30',
            room: 'Ruang 3B',
            status: 'Aktif',
            nextSession: 'Senin, 27 Okt',
            description: 'Kelas intensif persiapan olimpiade matematika tingkat kota untuk siswa kelas 5-6.'
        },
        {
            id: 2,
            subject: 'English Club Conversation',
            tutor: 'Ms. Sarah Johnson',
            schedule: 'Rabu, 15:30 - 17:00',
            room: 'Lab Bahasa 1',
            status: 'Aktif',
            nextSession: 'Rabu, 29 Okt',
            description: 'Active speaking class for confident communication.'
        }
    ];

    // Mock Content Data (Syllabus/Meetings)
    const classContents: { [key: number]: any[] } = {
        1: [
            {
                id: 101,
                title: 'Pertemuan 1: Aljabar Dasar & Pola Bilangan',
                date: 'Senin, 13 Okt 2025',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Example embedded link
                materialUrl: '#',
                exerciseUrl: '#',
                description: 'Pengenalan konsep aljabar dasar dan mencari pola dalam barisan bilangan.',
                completed: true
            },
            {
                id: 102,
                title: 'Pertemuan 2: Geometri Bangun Datar',
                date: 'Kamis, 16 Okt 2025',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                materialUrl: '#',
                exerciseUrl: '#',
                description: 'Membedah sifat-sifat bangun datar dan trik menghitung luas/keliling cepat.',
                completed: true
            },
            {
                id: 103,
                title: 'Pertemuan 3: Logika Matematika',
                date: 'Senin, 20 Okt 2025',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                materialUrl: '#',
                exerciseUrl: '#',
                description: 'Latihan soal logika dan penalaran matematika.',
                completed: false
            }
        ],
        2: [
            {
                id: 201,
                title: 'Meeting 1: Introduction & Greetings',
                date: 'Rabu, 15 Okt 2025',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                materialUrl: '#',
                exerciseUrl: '#',
                description: 'Basic conversation starters and formal/informal greetings.',
                completed: true
            }
        ]
    };

    const availableClasses = [
        {
            id: 3,
            subject: 'Kelas Coding untuk Anak (Scratch)',
            tutor: 'Kak Dimas Tech',
            schedule: 'Jumat, 15:00 - 16:30',
            slots: 5,
            price: 'Gratis'
        },
        {
            id: 4,
            subject: 'Tahsin Al-Quran Intensif',
            tutor: 'Ustadz Ahmad',
            schedule: 'Sabtu, 08:00 - 09:30',
            slots: 12,
            price: 'Gratis'
        }
    ];

    const getSelectedClass = () => myClasses.find(c => c.id === selectedClassId);
    const getSelectedSession = () => {
        if (!selectedClassId) return null;
        return classContents[selectedClassId]?.find(s => s.id === selectedSessionId);
    };

    // --- RENDER VIEW: SESSION DETAIL ---
    if (selectedSessionId && selectedClassId) {
        const session = getSelectedSession();
        const cls = getSelectedClass();
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50">
                    <button onClick={() => setSelectedSessionId(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div className="flex-1">
                        <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">{cls?.subject}</span>
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{session?.title}</h3>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Video Section */}
                    <div className="mb-8">
                        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <Youtube size={18} className="text-red-600" />
                            Video Pembelajaran
                        </h4>
                        <div className="aspect-video w-full bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                            <iframe
                                width="100%"
                                height="100%"
                                src={session?.videoUrl}
                                title="Video Pembelajaran"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                        {session?.description}
                    </p>

                    {/* Resources Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <a href={session?.materialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors group cursor-pointer">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-800 text-sm">Materi Pelajaran</h5>
                                <p className="text-xs text-slate-500">Download PDF (Google Drive)</p>
                            </div>
                            <Download size={18} className="ml-auto text-blue-400" />
                        </a>

                        <a href={session?.exerciseUrl} className="flex items-center gap-4 p-4 rounded-2xl border border-violet-100 bg-violet-50/50 hover:bg-violet-50 transition-colors group cursor-pointer">
                            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PenTool size={24} />
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-800 text-sm">Latihan Soal</h5>
                                <p className="text-xs text-slate-500">Kerjakan Kuis Online</p>
                            </div>
                            <ChevronRight size={18} className="ml-auto text-violet-400" />
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    // --- RENDER VIEW: CLASS DETAIL ---
    if (selectedClassId) {
        const cls = getSelectedClass();
        const sessions = classContents[selectedClassId] || [];

        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-violet-50/30">
                    <button onClick={() => setSelectedClassId(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{cls?.subject}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <User size={12} /> {cls?.tutor}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6 p-4 bg-violet-50 rounded-2xl border border-violet-100 text-sm text-slate-700 leading-relaxed">
                        {cls?.description}
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-violet-500" />
                        Daftar Materi & Pertemuan
                    </h4>

                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSessionId(session.id)}
                                className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 transition-all group"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${session.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {session.completed ? <PlayCircle size={20} fill="currentColor" className="opacity-20 translate-x-[1px]" /> : <Clock size={20} />}
                                    {session.completed && <div className="absolute"><PlayCircle size={20} /></div>}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors">{session.title}</h5>
                                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                        <Calendar size={10} /> {session.date}
                                    </p>
                                </div>
                                <div className="p-1 rounded-full bg-slate-50 text-slate-300 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </button>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Belum ada materi yang diunggah.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER VIEW: MAIN LIST ---
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Bimbingan Belajar</h3>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {/* My Active Classes */}
                <div className="mb-8">
                    <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <BookOpen size={18} className="text-violet-500" />
                        Kelas Saya
                    </h4>
                    <div className="space-y-4">
                        {myClasses.map((cls) => (
                            <div
                                key={cls.id}
                                onClick={() => setSelectedClassId(cls.id)}
                                className="bg-violet-50 rounded-2xl p-4 border border-violet-100 cursor-pointer hover:shadow-md hover:border-violet-300 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white text-violet-600 p-2 rounded-full shadow-sm">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <h5 className="font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{cls.subject}</h5>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{cls.status}</span>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-violet-400" />
                                        <span>{cls.tutor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-violet-400" />
                                        <span>{cls.schedule}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-violet-400" />
                                        <span>{cls.room}</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-violet-100 flex items-center gap-2 text-xs font-medium text-violet-700">
                                    <Calendar size={14} />
                                    Sesi Berikutnya: {cls.nextSession}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Classes */}
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-4">Program Tersedia</h4>
                    <div className="space-y-3">
                        {availableClasses.map((cls) => (
                            <div key={cls.id} className="border border-slate-200 rounded-2xl p-4 flex justify-between items-center group hover:border-violet-200 transition-colors">
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">{cls.subject}</h5>
                                    <p className="text-xs text-slate-500 mt-1">{cls.tutor}</p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{cls.schedule}</span>
                                        <span className="text-emerald-600">{cls.price}</span>
                                    </div>
                                </div>
                                <button className="bg-slate-900 text-white p-2 rounded-xl hover:bg-violet-600 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BimbinganSiswa;
