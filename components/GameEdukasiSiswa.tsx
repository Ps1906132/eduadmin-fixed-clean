import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowRight, ArrowLeft, ArrowUp, X, Trophy, Heart, Brain, Gamepad2, Globe } from 'lucide-react';

interface GameProps {
    onBack: () => void;
    userGender?: 'L' | 'P';
}

interface Letter {
    id: number;
    char: string;
    x: number;
    y: number;
    collected: boolean;
}

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: 'platform' | 'ground' | 'obstacle';
}

// OpenTDB Types
interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

const GameEdukasiSiswa: React.FC<GameProps> = ({ onBack, userGender = 'L' }) => {
    // Global State
    const [gameMode, setGameMode] = useState<'menu' | 'platformer' | 'quiz'>('menu');

    // --- PLATFORMER STATE ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'level_complete' | 'game_over'>('menu');
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [collectedWord, setCollectedWord] = useState('');
    const [targetWord, setTargetWord] = useState('');
    const [loadingWord, setLoadingWord] = useState(false);

    // Platformer Mutable State
    const playerRef = useRef({ x: 50, y: 200, width: 40, height: 60, vx: 0, vy: 0, grounded: false, facingRight: true });
    const platformsRef = useRef<GameObject[]>([]);
    const lettersRef = useRef<Letter[]>([]);
    const obstaclesRef = useRef<GameObject[]>([]);
    const requestRef = useRef<number | undefined>(undefined);
    const keys = useRef<{ [key: string]: boolean }>({});

    // --- QUIZ STATE ---
    const [quizQuestions, setQuizQuestions] = useState<TriviaQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

    // --- SHARED UTILS ---
    const decodeHTML = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    // --- DATAMUSE API (Platformer) ---
    const fetchDatamuseWord = async () => {
        setLoadingWord(true);
        try {
            // Fetch words related to 'school' or 'education'
            const response = await fetch('https://api.datamuse.com/words?topics=school&max=50');
            const data = await response.json();
            // Filter words: 4-7 letters, alphanumeric only
            const validWords = data.filter((item: any) => {
                const w = item.word.toUpperCase();
                return w.length >= 4 && w.length <= 7 && /^[A-Z]+$/.test(w);
            });

            if (validWords.length > 0) {
                const randomWord = validWords[Math.floor(Math.random() * validWords.length)].word.toUpperCase();
                return randomWord;
            }
            return 'SCHOOL'; // Fallback
        } catch (e) {
            return 'LEARN'; // Fallback
        } finally {
            setLoadingWord(false);
        }
    };

    // --- OPENTDB API (Quiz) ---
    const fetchQuizData = async () => {
        setQuizLoading(true);
        setQuizFinished(false);
        setQuizScore(0);
        setCurrentQuestionIndex(0);
        try {
            // Fetch 5 questions, General Knowledge (9) or Science (17), easy
            const response = await fetch('https://opentdb.com/api.php?amount=5&category=17&difficulty=easy&type=multiple');
            const data = await response.json();
            if (data.results) {
                setQuizQuestions(data.results);
                prepareAnswers(data.results[0]);
            }
        } catch (e) {
            console.error("Quiz Fetch Error", e);
        } finally {
            setQuizLoading(false);
        }
    };

    const prepareAnswers = (question: TriviaQuestion) => {
        if (!question) return;
        const answers = [...question.incorrect_answers, question.correct_answer];
        // Shuffle
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        setShuffledAnswers(answers);
    };

    const handleAnswerClick = (answer: string) => {
        const currentQ = quizQuestions[currentQuestionIndex];
        if (answer === currentQ.correct_answer) {
            setQuizScore(prev => prev + 20); // 20 pts per question (5 questions = 100)
        }

        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx < quizQuestions.length) {
            setCurrentQuestionIndex(nextIdx);
            prepareAnswers(quizQuestions[nextIdx]);
        } else {
            setQuizFinished(true);
        }
    };

    // --- PLATFORMER LOGIC ---
    const startLevel = async (lvlIndex: number) => {
        setGameState('playing');
        setCollectedWord('');

        // Reset Player
        playerRef.current = { x: 50, y: 200, width: 40, height: 60, vx: 0, vy: 0, grounded: false, facingRight: true };

        let word = '';
        if (lvlIndex <= 3) {
            // Tutorial Level (Indonesian)
            const staticWords = ['BUKU', 'ILMU', 'SANTRI'];
            word = staticWords[lvlIndex - 1];
        } else {
            // Dynamic Level (English from API)
            word = await fetchDatamuseWord();
        }
        setTargetWord(word);
        generateMap(lvlIndex, word);
    };

    const generateMap = (lvl: number, word: string) => {
        platformsRef.current = [];
        lettersRef.current = [];
        obstaclesRef.current = [];

        // Ground
        platformsRef.current.push({ x: 0, y: 350, width: 2000, height: 50, type: 'ground' });

        // Procedural Generation simple logic
        let cx = 300;
        let cy = 250;

        // Always create platforms for each letter
        word.split('').forEach((char, i) => {
            // Platform
            const pWidth = 100;
            // Randomize height slightly
            cy = 200 + Math.random() * 100;
            platformsRef.current.push({ x: cx, y: cy, width: pWidth, height: 20, type: 'platform' });

            // Letter on top
            lettersRef.current.push({ id: i, char, x: cx + pWidth / 2 - 10, y: cy - 40, collected: false });

            // Add gap
            cx += pWidth + 80 + (lvl * 10); // Gap increases with level

            // Random Obstacle between platforms (ground level)
            if (Math.random() > 0.5 && lvl > 1) {
                obstaclesRef.current.push({ x: cx - 60, y: 320, width: 30, height: 30, type: 'obstacle' });
            }
        });
    };

    // Game Loop (Only active when gameMode === 'platformer' && gameState === 'playing')
    useEffect(() => {
        if (gameMode !== 'platformer' || gameState !== 'playing') return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const update = () => {
            const player = playerRef.current;

            // Simple movement logic (same as before)
            if (keys.current['ArrowRight'] || keys.current['d']) { player.vx = 5; player.facingRight = true; }
            else if (keys.current['ArrowLeft'] || keys.current['a']) { player.vx = -5; player.facingRight = false; }
            else { player.vx = 0; }

            if ((keys.current['ArrowUp'] || keys.current[' '] || keys.current['w']) && player.grounded) {
                player.vy = -12;
                player.grounded = false;
            }

            player.vy += 0.6; // Gravity
            player.x += player.vx;
            player.y += player.vy;
            player.grounded = false;

            // Collisions
            platformsRef.current.forEach(plat => {
                if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
                    player.y < plat.y + plat.height && player.y + player.height > plat.y) {
                    if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
                        player.y = plat.y - player.height;
                        player.vy = 0;
                        player.grounded = true;
                    }
                }
            });

            obstaclesRef.current.forEach(obs => {
                if (player.x < obs.x + obs.width && player.x + player.width > obs.x &&
                    player.y < obs.y + obs.height && player.y + player.height > obs.y) {
                    player.x = 50; player.y = 200; setLives(prev => Math.max(0, prev - 1));
                }
            });

            // Letter Collection (Any order for now)
            const allLetters = lettersRef.current;
            allLetters.forEach(l => {
                if (!l.collected && player.x < l.x + 20 && player.x + player.width > l.x &&
                    player.y < l.y + 30 && player.y + player.height > l.y) {
                    l.collected = true;
                    setCollectedWord(prev => {
                        const newWord = prev + l.char;
                        if (newWord.length === targetWord.length) setTimeout(() => setGameState('level_complete'), 500);
                        return newWord;
                    });
                    setScore(prev => prev + 10);
                }
            });

            if (player.y > 400) { player.x = 50; player.y = 200; setLives(prev => Math.max(0, prev - 1)); }

            draw(ctx);
            requestRef.current = requestAnimationFrame(update);
        };

        const draw = (ctx: CanvasRenderingContext2D) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Background
            ctx.fillStyle = '#E0F2FE'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Platforms
            ctx.fillStyle = '#65a30d';
            platformsRef.current.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

            // Obstacles
            ctx.fillStyle = '#ef4444';
            obstaclesRef.current.forEach(o => {
                ctx.beginPath(); ctx.moveTo(o.x, o.y + o.height); ctx.lineTo(o.x + o.width / 2, o.y); ctx.lineTo(o.x + o.width, o.y + o.height); ctx.fill();
            });

            // Letters
            ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center';
            lettersRef.current.forEach(l => {
                if (!l.collected) {
                    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(l.x + 10, l.y + 10, 20, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#000'; ctx.fillText(l.char, l.x + 10, l.y + 18);
                }
            });

            // Player (Simplified Drawing)
            const p = playerRef.current;
            const x = p.x, y = p.y, w = p.width, h = p.height;
            const color = userGender === 'P' ? '#ec4899' : '#3b82f6';
            ctx.fillStyle = color; ctx.fillRect(x, y + 20, w, 30);
            ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(x + w / 2, y + 15, 15, 0, Math.PI * 2); ctx.fill();
            if (userGender === 'P') {
                ctx.fillStyle = '#fce7f3'; ctx.beginPath(); ctx.arc(x + w / 2, y + 15, 18, Math.PI, Math.PI * 2);
                ctx.lineTo(x + w + 5, y + 40); ctx.lineTo(x - 5, y + 40); ctx.fill();
            } else {
                ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x + 5, y, w - 10, 10);
            }
            ctx.fillStyle = userGender === 'P' ? '#166534' : '#1e3a8a';
            ctx.fillRect(x + 5, y + 50, 12, 10); ctx.fillRect(x + w - 17, y + 50, 12, 10);
            // Eyes
            ctx.fillStyle = 'black';
            if (p.facingRight) ctx.fillRect(x + w - 15, y + 10, 4, 4); else ctx.fillRect(x + 10, y + 10, 4, 4);
        };

        update();
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [gameMode, gameState, targetWord, level]);

    // Keyboard Listeners
    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
        const handleUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
        window.addEventListener('keydown', handleDown); window.addEventListener('keyup', handleUp);
        return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); };
    }, []);

    // --- RENDER ---
    return (
        <div className="fixed inset-0 bg-slate-900 z-[100] font-sans flex flex-col">
            {/* Nav Header */}
            <div className="flex-none p-4 flex justify-between items-center z-50 text-white bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-md">
                <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X /></button>
                <div className="font-bold text-xl flex items-center gap-2">
                    <Gamepad2 /> GAME CENTER
                </div>
                <div className="w-10"></div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <div className="min-h-full flex flex-col items-center justify-start pt-4 pb-20">

                    {/* MAIN MENU */}
                    {gameMode === 'menu' && (
                        <div className="flex flex-col gap-6 w-full max-w-sm sm:max-w-2xl animate-in zoom-in duration-300">
                            {/* Empty State */}
                            <div className="text-center text-white/50 py-20">
                                <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Belum ada game yang tersedia.</p>
                            </div>
                        </div>
                    )}

                    {/* PLATFORMER UI */}
                    {gameMode === 'platformer' && (
                        <div className="relative w-full max-w-5xl aspect-video bg-blue-300 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700">

                            {/* HUD */}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
                                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full text-white backdrop-blur-sm">
                                    <Trophy size={16} className="text-yellow-400" /> Lvl {level}
                                </div>
                                <div className="flex gap-1">
                                    {targetWord.split('').map((char, i) => (
                                        <div key={i} className={`w-8 h-8 rounded bg-black/40 text-white flex items-center justify-center font-bold ${collectedWord[i] ? 'text-yellow-400 border border-yellow-400' : 'opacity-50'}`}>
                                            {collectedWord[i] || '_'}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1 bg-black/40 rounded-full text-red-400 backdrop-blur-sm">
                                    <Heart fill="currentColor" size={16} /> {lives}
                                </div>
                            </div>

                            {gameState === 'menu' && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20">
                                    <h2 className="text-4xl font-bold mb-4 text-yellow-400">PETUALANG KATA</h2>
                                    <p className="mb-8 opacity-80 max-w-md text-center">Bantu karakter mengumpulkan huruf! Level 4 ke atas menggunakan kata Bahasa Inggris dari Datamuse API.</p>
                                    <button onClick={() => startLevel(1)} className="px-8 py-3 bg-[#004AAD] rounded-xl font-bold hover:scale-105 transition-transform">START GAME</button>
                                    <button onClick={() => setGameMode('menu')} className="mt-4 text-sm text-slate-300 hover:text-white">Kembali ke Menu Game</button>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <>
                                    <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover" />
                                    {/* Mobile Controls... (Omitted for brevity, but same as before) */}
                                </>
                            )}

                            {gameState === 'level_complete' && (
                                <div className="absolute inset-0 bg-[#004AAD]/95 flex flex-col items-center justify-center text-white z-20 animate-in zoom-in">
                                    <Trophy size={64} className="text-yellow-400 mb-4 animate-bounce" />
                                    <h2 className="text-3xl font-bold">LEVEL SELESAI!</h2>
                                    <p className="mb-6">Kata: {targetWord}</p>
                                    <button onClick={() => { setLevel(l => l + 1); startLevel(level + 1); }} className="px-6 py-3 bg-white text-[#004AAD] rounded-xl font-bold hover:scale-105 transition-transform">
                                        NEXT LEVEL {level + 1}
                                    </button>
                                </div>
                            )}

                            {lives <= 0 && (
                                <div className="absolute inset-0 bg-red-900/95 flex flex-col items-center justify-center text-white z-20">
                                    <h2 className="text-3xl font-bold mb-4">GAME OVER</h2>
                                    <button onClick={() => { setLives(3); startLevel(level); }} className="px-6 py-3 bg-white text-red-900 rounded-xl font-bold">TRY AGAIN</button>
                                    <button onClick={() => setGameMode('menu')} className="mt-4 text-white/50">Quit</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QUIZ UI */}
                    {gameMode === 'quiz' && (
                        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative z-20">
                            <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
                                <h2 className="text-2xl font-bold flex items-center gap-2"><Brain /> Kuis Pintar (Science)</h2>
                                <div className="bg-white/20 px-4 py-1 rounded-full font-mono text-sm">Score: {quizScore}</div>
                            </div>

                            <div className="flex-1 p-8 flex flex-col justify-center">
                                {quizLoading ? (
                                    <div className="text-center text-slate-400 animate-pulse">Memuat Soal dari OpenTDB...</div>
                                ) : quizFinished ? (
                                    <div className="text-center">
                                        <Trophy size={80} className="mx-auto text-yellow-400 mb-4" />
                                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Kuis Selesai!</h2>
                                        <p className="text-xl text-slate-600 mb-8">Skor Akhir: <span className="font-bold text-purple-600">{quizScore} / 100</span></p>
                                        <div className="flex justify-center gap-4">
                                            <button onClick={fetchQuizData} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">Main Lagi</button>
                                            <button onClick={() => setGameMode('menu')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Menu Utama</button>
                                        </div>
                                    </div>
                                ) : quizQuestions.length > 0 ? (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <div className="mb-2 text-sm text-purple-600 font-bold uppercase tracking-wider">Pertanyaan {currentQuestionIndex + 1} / {quizQuestions.length}</div>
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                                            {decodeHTML(quizQuestions[currentQuestionIndex].question)}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {shuffledAnswers.map((ans, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerClick(ans)}
                                                    className="p-4 rounded-xl border-2 border-slate-100 font-medium text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all text-left active:scale-95"
                                                >
                                                    {decodeHTML(ans)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-400">Gagal memuat soal. Cek koneksi internet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameEdukasiSiswa;
