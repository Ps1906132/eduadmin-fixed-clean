import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Save, Loader2 } from 'lucide-react';

interface Question {
    id: string;
    exam_id: string;
    question_number: number;
    question_text: string;
    question_type: 'pg' | 'essay';
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    points: number;
}

interface CBTSiswaProps {
    onBack: () => void;
    title: string;
    sessionId: string;
}

const CBTSiswa: React.FC<CBTSiswaProps> = ({ onBack, title, sessionId }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{ total_score: number; correct_count: number; total_questions: number } | null>(null);

    useEffect(() => {
        loadQuestions();
    }, []);

    const getToken = () => localStorage.getItem('eduadmin_token');

    const loadQuestions = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const res = await fetch(`/api/exam_questions?exam_id=eq.${sessionId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error('Gagal memuat soal');
            const data = await res.json();
            if (!data || data.length === 0) throw new Error('Tidak ada soal untuk ujian ini');
            setQuestions(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (val: string) => {
        setAnswers({ ...answers, [questions[currentQuestion].id]: val });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (!confirm('Apakah Anda yakin ingin mengumpulkan jawaban?')) return;
        setSaving(true);
        try {
            const token = getToken();
            const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
                id: `ans-${sessionId}-${questionId}`,
                session_id: sessionId,
                question_id: questionId,
                student_id: sessionId.split('-')[0],
                answer
            }));

            // Save answers
            const saveRes = await fetch('/api/exam_answers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(answerRecords)
            });

            if (!saveRes.ok) {
                const errData = await saveRes.json();
                throw new Error(errData.error || 'Gagal menyimpan jawaban');
            }

            // Grade the exam
            const gradeRes = await fetch(`/api/exam_sessions/${sessionId}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!gradeRes.ok) {
                const errData = await gradeRes.json();
                throw new Error(errData.error || 'Gagal memproses nilai');
            }

            const gradeData = await gradeRes.json();
            setResult({
                total_score: gradeData.total_score,
                correct_count: gradeData.correct_count,
                total_questions: gradeData.total_questions
            });
            setIsFinished(true);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-full bg-white rounded-3xl">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#004AAD] mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Memuat soal...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full bg-white rounded-3xl text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">Gagal Memuat Soal</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button onClick={loadQuestions} className="bg-[#004AAD] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Coba Lagi</button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full bg-white rounded-3xl text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Latihan Selesai!</h2>
                {result && (
                    <div className="mb-8 space-y-2">
                        <p className="text-4xl font-bold text-[#004AAD]">{result.total_score}<span className="text-lg text-slate-400">/100</span></p>
                        <p className="text-slate-600">{result.correct_count} dari {result.total_questions} soal benar</p>
                    </div>
                )}
                <button onClick={onBack} className="bg-[#004AAD] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    Kembali ke Materi
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200">
            <div className="bg-[#004AAD] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    <Clock size={16} />
                    <span className="font-mono font-bold">{questions.length} Soal</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-[#004AAD] rounded-lg text-sm font-bold">
                                Soal No. {currentQuestion + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {questions[currentQuestion].question_type === 'pg' ? 'Pilihan Ganda' : 'Essay / Uraian'}
                            </span>
                        </div>

                        <p className="text-slate-800 text-lg font-medium leading-relaxed mb-8">
                            {questions[currentQuestion].question_text}
                        </p>

                        {questions[currentQuestion].question_type === 'pg' ? (
                            <div className="space-y-3">
                                {['A', 'B', 'C', 'D'].map((label, idx) => {
                                    const optKey = `option_${label.toLowerCase()}` as keyof Question;
                                    const opt = questions[currentQuestion][optKey] as string;
                                    if (!opt) return null;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(String(idx))}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 group ${answers[questions[currentQuestion].id] === String(idx)
                                                    ? 'border-[#004AAD] bg-blue-50 text-[#004AAD]'
                                                    : 'border-slate-100 hover:border-blue-200 text-slate-700'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${answers[questions[currentQuestion].id] === String(idx)
                                                    ? 'bg-[#004AAD] text-white border-[#004AAD]'
                                                    : 'bg-white text-slate-400 border-slate-200 group-hover:border-blue-200'
                                                }`}>
                                                {label}
                                            </div>
                                            <span className="font-medium">{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <textarea
                                value={answers[questions[currentQuestion].id] || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 min-h-[200px]"
                                placeholder="Ketik jawaban Anda di sini..."
                            />
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={handlePrev}
                            disabled={currentQuestion === 0}
                            className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold disabled:opacity-50 hover:text-[#004AAD] transition-colors"
                        >
                            <ChevronLeft size={20} /> Sebelumnya
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200 disabled:opacity-60"
                            >
                                {saving ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Selesai & Kumpulkan</>}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Selanjutnya <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-72 bg-slate-50 border-l border-slate-200 p-6 hidden md:flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Navigasi Soal</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`h-10 rounded-lg font-bold text-sm transition-all border-b-2 ${currentQuestion === idx
                                        ? 'bg-[#004AAD] text-white border-blue-800'
                                        : answers[q.id] !== undefined
                                            ? 'bg-blue-100 text-[#004AAD] border-blue-200'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto space-y-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#004AAD] rounded-sm"></div> Soal Aktif
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div> Sudah Dijawab
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div> Belum Dijawab
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CBTSiswa;
