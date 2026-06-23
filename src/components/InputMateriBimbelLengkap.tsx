import React, { useState } from 'react';
import { ChevronLeft, Plus, Video, FileText, HelpCircle, Save, Trash2, Edit2, PlayCircle, CheckCircle, Book, Link } from 'lucide-react';
import { useTutoring } from './DashboardSuperAdmin/hooks/useTutoring';
import { toast } from 'react-hot-toast';

interface InputMateriBimbelLengkapProps {
    onBack: () => void;
    classes: any[];
}

const InputMateriBimbelLengkap: React.FC<InputMateriBimbelLengkapProps> = ({ onBack, classes }) => {
    const { addSession } = useTutoring();
    const [view, setView] = useState('list');

    // Form States
    const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
    const [sessionTitle, setSessionTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [materialLink, setMaterialLink] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    // Quiz Builder State
    const [questions, setQuestions] = useState<any[]>([
        { id: 1, type: 'pg', question: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [savingCbt, setSavingCbt] = useState(false);

    const handleSave = async () => {
        if (!selectedClassId || !sessionTitle) {
            toast.error("Mohon pilih kelas dan isi judul sesi");
            return;
        }

        const newSession = {
            id: Date.now(),
            title: sessionTitle,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            youtubeId: videoUrl,
            driveLink: materialLink,
            meetingLink: meetingLink,
            quizQuestions: questions
        };

        addSession(Number(selectedClassId), newSession);

        // Simpan soal quiz ke tabel exam_questions agar bisa dibaca CBTSiswa
        const validQuestions = questions.filter((q: any) => q.question?.trim());
        if (validQuestions.length > 0) {
            setSavingCbt(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };
                const examId = newSession.id.toString();

                await Promise.all(validQuestions.map(async (q: any, i: number) => {
                    const body: Record<string, any> = {
                        id: `eq-${examId}-${i}`,
                        exam_id: examId,
                        question_number: i + 1,
                        question_text: q.question,
                        question_type: q.type === 'essay' ? 'essay' : 'pg',
                        points: 1
                    };
                    if (q.type === 'pg' || !q.type) {
                        body.option_a = q.options?.[0] || '';
                        body.option_b = q.options?.[1] || '';
                        body.option_c = q.options?.[2] || '';
                        body.option_d = q.options?.[3] || '';
                    }
                    const res = await fetch('/api/exam_questions', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                    if (!res.ok) {
                        const err = await res.text();
                        console.error(`Gagal simpan soal #${i + 1}:`, err);
                    }
                }));
            } catch (e) {
                console.error('Gagal simpan soal quiz ke exam_questions:', e);
            } finally {
                setSavingCbt(false);
            }
        }

        toast.success("Sesi Bimbel berhasil diterbitkan!");
        setView('list');

        // Reset Form
        setSessionTitle('');
        setVideoUrl('');
        setMaterialLink('');
        setMeetingLink('');
        setQuestions([{ id: 1, type: 'pg', question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const addQuestion = () => {
        setQuestions([...questions, { id: Date.now(), type: 'pg', question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const currentClass = classes.find(c => c.id === Number(selectedClassId));

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button
                    onClick={() => {
                        if (view !== 'list') setView('list');
                        else onBack();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800">
                        {view === 'list' ? 'Kelola Materi & Latihan' : 'Buat Sesi Baru'}
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">

                {view === 'list' ? (
                    <div className="space-y-6">
                        <button
                            onClick={() => setView('create_session')}
                            className="w-full py-4 bg-[#004AAD] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Buat Sesi Pembelajaran Baru
                        </button>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Book size={18} className="text-[#004AAD]" />
                                Daftar Sesi Aktif per Kelas
                            </h3>
                            {classes.map((cls) => (
                                <div key={cls.id} className="space-y-3">
                                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold w-fit">
                                        {cls.title}
                                    </div>
                                    {cls.sessions.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic pl-2">Belum ada sesi di kelas ini.</p>
                                    ) : (
                                        cls.sessions.map((session: any, sIdx: number) => (
                                            <div key={session.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors ml-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 text-[#004AAD] rounded-xl flex items-center justify-center font-bold text-sm">
                                                        {sIdx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{session.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1"><Video size={10} /> {session.youtubeId ? 'Ada Video' : 'No Video'}</span>
                                                            <span className="flex items-center gap-1"><FileText size={10} /> {session.driveLink ? 'Ada Materi' : 'No Materi'}</span>
                                                            <span className="flex items-center gap-1"><Link size={10} className="text-blue-500" /> {session.meetingLink ? 'Ada Zoom/Meet' : 'No Meet'}</span>
                                                            <span className="flex items-center gap-1"><HelpCircle size={10} /> {session.quizQuestions?.length || 0} Soal</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-10">

                        {/* 0. Pilih Kelas */}
                        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm bg-blue-50/30">
                            <label className="block text-sm font-bold text-blue-800 mb-2">Pilih Program Kelas</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                                className="w-full p-3 bg-white border border-blue-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        {/* 1. Detail Sesi */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-[#004AAD]">
                                <PlayCircle size={24} />
                                <h3 className="font-bold text-lg">1. Detail Sesi</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Judul Materi / Pertemuan</label>
                                    <input
                                        type="text"
                                        value={sessionTitle}
                                        onChange={(e) => setSessionTitle(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20"
                                        placeholder="Contoh: Pertemuan 3 - Geometri Ruang"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Link Video YouTube (Embed ID)</label>
                                    <div className="flex gap-2">
                                        <div className="p-3 bg-slate-100 rounded-xl text-slate-500 font-mono text-xs select-none flex items-center">youtube.com/embed/</div>
                                        <input
                                            type="text"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20"
                                            placeholder="dQw4w9WgXcQ"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Link Materi (Google Drive)</label>
                                    <input
                                        type="text"
                                        value={materialLink}
                                        onChange={(e) => setMaterialLink(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-blue-600 underline text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20"
                                        placeholder="https://drive.google.com/file/d/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1 flex items-center gap-1 text-blue-600">
                                        <Link size={14} /> Link Zoom / Google Meet
                                    </label>
                                    <input
                                        type="text"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Builder Kuis / Latihan */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-orange-500">
                                    <HelpCircle size={24} />
                                    <h3 className="font-bold text-lg">2. Buat Latihan Soal (CBT)</h3>
                                </div>
                                <button
                                    onClick={addQuestion}
                                    className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors flex items-center gap-1"
                                >
                                    <Plus size={14} /> Tambah Soal
                                </button>
                            </div>

                            <div className="space-y-6">
                                {questions.map((q, qIdx) => (
                                    <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 relative group">
                                        <button
                                            onClick={() => handleDeleteQuestion(qIdx)}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="font-bold text-slate-400">#{qIdx + 1}</span>
                                            <select
                                                value={q.type}
                                                onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                                                className="p-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 focus:outline-none"
                                            >
                                                <option value="pg">Pilihan Ganda</option>
                                                <option value="essay">Essay / Uraian</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <textarea
                                                value={q.question}
                                                onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                                placeholder="Tulis pertanyaan disini..."
                                                rows={2}
                                            ></textarea>
                                        </div>

                                        {q.type === 'pg' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt: string, oIdx: number) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                                                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${q.correctAnswer === oIdx
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'bg-white border-slate-300 text-slate-400 hover:border-green-300'
                                                                }`}
                                                        >
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                            className={`flex-1 p-2 rounded-lg border text-sm focus:outline-none ${q.correctAnswer === oIdx ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 bg-white'
                                                                }`}
                                                            placeholder={`Pilihan ${String.fromCharCode(65 + oIdx)}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 pb-8">
                            <button
                                onClick={handleSave}
                                disabled={savingCbt}
                                className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} /> {savingCbt ? 'Menyimpan Soal...' : 'Simpan Sesi & Terbitkan'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputMateriBimbelLengkap;
