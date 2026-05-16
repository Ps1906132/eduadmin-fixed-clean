import { useState, FC } from 'react';
import {
    ChevronRight,
    BookOpen,
    ExternalLink,
    FileText,
    HelpCircle,
    Calendar,
    ArrowRight,
    Star,
    AlertCircle,
    Layout
} from 'lucide-react';
import {
    materiDataGlobal,
    latihanDataGlobal,
    MateriItem,
    LatihanItem,
    QuestionPG,
    QuestionEssay
} from '../data/sharedData';

interface LatihanSoalSiswaProps {
    onBack: () => void;
    userClass?: string;
}

const LatihanSoalSiswa: FC<LatihanSoalSiswaProps> = ({ onBack, userClass = "5A" }) => {
    const [activeTab, setActiveTab] = useState<'materi' | 'latihan'>('materi');
    const [selectedLatihan, setSelectedLatihan] = useState<LatihanItem | null>(null);

    // Filter data based on student class
    const filteredMateri = materiDataGlobal.filter(m => m.classId === userClass && m.status === 'Terbit');
    const filteredLatihan = latihanDataGlobal.filter(l => l.classId === userClass && l.status === 'Terbit');

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={selectedLatihan ? () => setSelectedLatihan(null) : onBack} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-500">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Materi & Latihan</h3>
                        <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Kelas {userClass}</p>
                    </div>
                </div>
                {!selectedLatihan && (
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('materi')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'materi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            Materi
                        </button>
                        <button
                            onClick={() => setActiveTab('latihan')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'latihan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            Latihan
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {selectedLatihan ? (
                    // VIEW: LATIHAN DETAIL (ESSAY/PG VIEWER FOR PARENTS)
                    <div className="animate-in fade-in duration-300">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
                            <h4 className="font-bold text-slate-800 text-lg mb-2">{selectedLatihan.title}</h4>
                            <div className="flex flex-wrap gap-3">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${selectedLatihan.type === 'PG' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                    Tipe: {selectedLatihan.type === 'Essay' ? 'Esai (Uraian)' : 'Pilihan Ganda'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    {selectedLatihan.questions.length} Pertanyaan
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {selectedLatihan.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100"></div>
                                    <div className="flex gap-4">
                                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 leading-relaxed mb-4">{q.question}</p>

                                            {selectedLatihan.type === 'PG' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {(q as QuestionPG).options.map((opt, optIdx) => (
                                                        <div key={optIdx} className={`p-3 rounded-2xl border flex items-center gap-3 ${(q as QuestionPG).correctAnswer === optIdx ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${(q as QuestionPG).correctAnswer === optIdx ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <span className={`text-xs font-medium ${(q as QuestionPG).correctAnswer === optIdx ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                                    <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Kunci / Saran Jawaban:</h5>
                                                    <p className="text-xs text-amber-800 leading-relaxed italic">
                                                        {(q as QuestionEssay).sampleAnswer || 'Belum ada saran jawaban.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'materi' ? (
                    // VIEW: LIST MATERI
                    <div className="space-y-4 animate-in fade-in">
                        {filteredMateri.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <BookOpen size={48} className="mb-3 opacity-20" />
                                <p className="text-sm font-bold">Belum ada materi untuk kelas ini.</p>
                            </div>
                        ) : (
                            filteredMateri.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{item.subjectName}</span>
                                            <span className="text-[10px] font-bold text-slate-400">Publikasi: {item.publishDate}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <a
                                                href={item.driveLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100"
                                            >
                                                <ExternalLink size={14} /> Buka Materi (Drive)
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // VIEW: LIST LATIHAN
                    <div className="space-y-4 animate-in fade-in">
                        {filteredLatihan.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <HelpCircle size={48} className="mb-3 opacity-20" />
                                <p className="text-sm font-bold">Belum ada latihan untuk kelas ini.</p>
                            </div>
                        ) : (
                            filteredLatihan.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <HelpCircle size={28} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'PG' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">Publikasi: {item.publishDate}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors uppercase">{item.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">{item.questions.length} Pertanyaan</p>
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setSelectedLatihan(item)}
                                                className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100"
                                            >
                                                <Layout size={14} /> Lihat Detail Soal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatihanSoalSiswa;
