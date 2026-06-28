import { useState, useEffect, FC } from 'react';
import {
    ChevronRight,
    BookOpen,
    ExternalLink,
    FileText,
    HelpCircle,
    Layout
} from 'lucide-react';

interface LatihanSoalSiswaProps {
    onBack: () => void;
    user?: any;
    userClass?: string;
}

const LatihanSoalSiswa: FC<LatihanSoalSiswaProps> = ({ onBack, user, userClass }) => {
    const [activeTab, setActiveTab] = useState<'materi' | 'latihan'>('materi');
    const [selectedLatihan, setSelectedLatihan] = useState<any | null>(null);
    const [materiList, setMateriList] = useState<any[]>([]);
    const [latihanList, setLatihanList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvedClass, setResolvedClass] = useState(userClass || '');

    useEffect(() => {
        const resolveClass = async () => {
            if (userClass) {
                setResolvedClass(userClass);
                return;
            }
            if (!user?.id && !user?.student_id) return;

            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const studentId = user?.student_id || user?.id;
                const csRes = await fetch(`/api/class_students?student_id=eq.${studentId}&is_active=eq.1`, { headers });
                if (csRes.ok) {
                    const csData = await csRes.json();
                    if (Array.isArray(csData) && csData.length > 0) {
                        const classId = csData[0].class_id;
                        const classRes = await fetch(`/api/classes?id=eq.${classId}`, { headers });
                        if (classRes.ok) {
                            const classData = await classRes.json();
                            if (Array.isArray(classData) && classData.length > 0) {
                                setResolvedClass(classData[0].id);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to resolve class:', e);
            }
        };
        resolveClass();
    }, [user, userClass]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('eduadmin_token');
            if (!token) { setLoading(false); return; }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [materiRes, latihanRes] = await Promise.all([
                    fetch('/api/materi?status=eq.Terbit', { headers }),
                    fetch('/api/latihan_soal?status=eq.Terbit', { headers })
                ]);

                if (materiRes.ok) {
                    const data = await materiRes.json();
                    if (Array.isArray(data)) {
                        setMateriList(data.map((a: any) => ({
                            id: a.id,
                            title: a.title,
                            classId: a.class_id,
                            subjectId: a.subject_id || '',
                            subjectName: a.subject_name || '',
                            driveLink: a.drive_link,
                            publishDate: a.publish_date,
                            status: a.status,
                        })));
                    }
                }

                if (latihanRes.ok) {
                    const data = await latihanRes.json();
                    if (Array.isArray(data)) {
                        setLatihanList(data.map((a: any) => {
                            let questions: any[] = [];
                            try {
                                if (typeof a.questions === 'string') questions = JSON.parse(a.questions);
                                else if (Array.isArray(a.questions)) questions = a.questions;
                            } catch (_) {}
                            return {
                                id: a.id,
                                title: a.title,
                                classId: a.class_id,
                                subjectId: a.subject_id || '',
                                subjectName: a.subject_name || '',
                                type: a.type || 'PG',
                                questions,
                                publishDate: a.publish_date,
                                status: a.status,
                            };
                        }));
                    }
                }
            } catch (err) {
                console.error('Gagal memuat materi/latihan:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredMateri = materiList.filter(m => m.classId === resolvedClass);
    const filteredLatihan = latihanList.filter(l => l.classId === resolvedClass);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={selectedLatihan ? () => setSelectedLatihan(null) : onBack} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-500">
                        <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Materi & Latihan</h3>
                        {resolvedClass && <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Kelas {resolvedClass}</p>}
                    </div>
                </div>
                {!selectedLatihan && (
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button onClick={() => setActiveTab('materi')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'materi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Materi</button>
                        <button onClick={() => setActiveTab('latihan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'latihan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Latihan</button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {loading ? (
                    <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm font-bold">Memuat data...</p>
                    </div>
                ) : selectedLatihan ? (
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
                                {selectedLatihan.subjectName && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{selectedLatihan.subjectName}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {selectedLatihan.questions.map((q: any, idx: number) => (
                                <div key={q.id || idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100"></div>
                                    <div className="flex gap-4">
                                        <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700 leading-relaxed mb-4">{q.question}</p>

                                            {selectedLatihan.type === 'PG' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt: string, optIdx: number) => (
                                                        <div key={optIdx} className="p-3 rounded-2xl border bg-slate-50 border-slate-100 flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white border border-slate-200 text-slate-400">
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-500">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                                    <h5 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Tipe Jawaban: Uraian</h5>
                                                    <p className="text-xs text-amber-800 leading-relaxed italic">
                                                        Siswa menjawab secara uraian/tertulis.
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
                    <div className="space-y-4 animate-in fade-in">
                        {filteredMateri.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <BookOpen size={48} className="mb-3 opacity-20" />
                                <p className="text-sm font-bold">Belum ada materi untuk kelas ini.</p>
                            </div>
                        ) : (
                            filteredMateri.map((item: any) => (
                                <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.subjectName && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{item.subjectName}</span>}
                                            <span className="text-[10px] font-bold text-slate-400">Publikasi: {item.publishDate}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <a href={item.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100">
                                                <ExternalLink size={14} /> Buka Materi (Drive)
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        {filteredLatihan.length === 0 ? (
                            <div className="h-60 flex flex-col items-center justify-center text-slate-300">
                                <HelpCircle size={48} className="mb-3 opacity-20" />
                                <p className="text-sm font-bold">Belum ada latihan untuk kelas ini.</p>
                            </div>
                        ) : (
                            filteredLatihan.map((item: any) => (
                                <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <HelpCircle size={28} />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'PG' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>{item.type}</span>
                                            {item.subjectName && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{item.subjectName}</span>}
                                            <span className="text-[10px] font-bold text-slate-400">Publikasi: {item.publishDate}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors uppercase">{item.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-medium">{item.questions.length} Pertanyaan</p>
                                        <div className="mt-4">
                                            <button onClick={() => setSelectedLatihan(item)} className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm shadow-emerald-100">
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
