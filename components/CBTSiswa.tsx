import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface CBTSiswaProps {
    onBack: () => void;
    title: string;
}

const CBTSiswa: React.FC<CBTSiswaProps> = ({ onBack, title }) => {
    // Dummy Soal Data
    const questions = [
        {
            id: 1,
            type: 'pg',
            question: 'Hasil dari 12 x (5 + 3) adalah...',
            options: ['96', '60', '85', '106'],
            correctAnswer: 0 // Index A
        },
        {
            id: 2,
            type: 'pg',
            question: 'Bangun datar yang memiliki 4 sisi sama panjang dan 4 sudut siku-siku disebut...',
            options: ['Persegi Panjang', 'Belah Ketupat', 'Persegi', 'Trapesium'],
            correctAnswer: 2 // Index C
        },
        {
            id: 3,
            type: 'essay',
            question: 'Jelaskan perbedaan antara kubus dan balok dari sisi, rusuk, dan titik sudutnya!',
            answer: ''
        }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (val: any) => {
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

    const handleSubmit = () => {
        if (confirm('Apakah Anda yakin ingin mengumpulkan jawaban?')) {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full bg-white rounded-3xl text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Latihan Selesai!</h2>
                <p className="text-slate-600 mb-8">Jawaban Anda telah berhasil dikirim ke guru pembimbing.</p>
                <button
                    onClick={onBack}
                    className="bg-[#004AAD] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Kembali ke Materi
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-slate-200">
            {/* Header CBT */}
            <div className="bg-[#004AAD] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{title}</h2>
                        <p className="text-xs text-blue-200">Matematika • Pertemuan 1</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    <Clock size={16} />
                    <span className="font-mono font-bold">59:30</span>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left: Question Area */}
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="flex-1">
                        {/* Question Badge */}
                        <div className="flex items-center justify-between mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-[#004AAD] rounded-lg text-sm font-bold">
                                Soal No. {currentQuestion + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {questions[currentQuestion].type === 'pg' ? 'Pilihan Ganda' : 'Essay / Uraian'}
                            </span>
                        </div>

                        {/* Question Text */}
                        <p className="text-slate-800 text-lg font-medium leading-relaxed mb-8">
                            {questions[currentQuestion].question}
                        </p>

                        {/* Answer Input */}
                        {questions[currentQuestion].type === 'pg' ? (
                            <div className="space-y-3">
                                {questions[currentQuestion].options?.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 group ${answers[questions[currentQuestion].id] === idx
                                                ? 'border-[#004AAD] bg-blue-50 text-[#004AAD]'
                                                : 'border-slate-100 hover:border-blue-200 text-slate-700'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${answers[questions[currentQuestion].id] === idx
                                                ? 'bg-[#004AAD] text-white border-[#004AAD]'
                                                : 'bg-white text-slate-400 border-slate-200 group-hover:border-blue-200'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-medium">{opt}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                value={answers[questions[currentQuestion].id] || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004AAD]/20 min-h-[200px]"
                                placeholder="Ketik jawaban Anda di sini..."
                            ></textarea>
                        )}
                    </div>

                    {/* Navigation Buttons */}
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
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                            >
                                <Save size={18} /> Selesai & Kumpulkan
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

                {/* Right: Number Navigation (Sidebar style on Desktop, Hidden on Mobile/Modal on Mobile) */}
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
