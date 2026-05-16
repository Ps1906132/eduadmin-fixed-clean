import React, { useState, useEffect } from 'react';
import { ChevronLeft, BookOpen, ExternalLink, FileText, Plus, Save, X, Trash2, Send, FilePlus, HelpCircle } from 'lucide-react';
import {
    materiDataGlobal,
    updateMateriDataGlobal,
    latihanDataGlobal,
    updateLatihanDataGlobal,
    MateriItem,
    LatihanItem,
    QuestionPG,
    QuestionEssay,
    classesDataGlobal
} from '../data/sharedData';
import toast from 'react-hot-toast';

interface MateriLatihanGuruProps {
    onBack: () => void;
    user?: any;
}

const MateriLatihanGuru: React.FC<MateriLatihanGuruProps> = ({ onBack, user }) => {
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');

    // Default class based on user info if available
    const defaultClass = user?.kelas || user?.studentClass || '1A';

    // --- STATE DATA ---
    const [materiList, setMateriList] = useState<MateriItem[]>(materiDataGlobal);
    const [latihanList, setLatihanList] = useState<LatihanItem[]>(latihanDataGlobal);

    useEffect(() => {
        updateMateriDataGlobal(materiList);
    }, [materiList]);

    useEffect(() => {
        updateLatihanDataGlobal(latihanList);
    }, [latihanList]);

    // --- MODAL STATE ---
    const [showMateriModal, setShowMateriModal] = useState(false);
    const [showLatihanModal, setShowLatihanModal] = useState(false);

    // Form Materi
    const [materiForm, setMateriForm] = useState({
        title: '',
        classId: defaultClass,
        subjectName: user?.mapel || '',
        driveLink: '',
        status: 'Terbit' as 'Terbit' | 'Draft'
    });

    // Form Latihan
    const [latihanForm, setLatihanForm] = useState({
        title: '',
        classId: defaultClass,
        subjectName: user?.mapel || '',
        type: 'PG' as 'PG' | 'Essay',
        questions: [] as (QuestionPG | QuestionEssay)[],
        status: 'Terbit' as 'Terbit' | 'Draft'
    });

    // Reset forms when defaultClass changes (e.g. if user prop updates)
    useEffect(() => {
        setMateriForm(prev => ({ ...prev, classId: defaultClass }));
        setLatihanForm(prev => ({ ...prev, classId: defaultClass }));
    }, [defaultClass]);

    // --- HANDLERS ---
    const handleSaveMateri = () => {
        if (!materiForm.title || !materiForm.driveLink) {
            toast.error("Harap isi Judul dan Link Drive!");
            return;
        }

        const newMateri: MateriItem = {
            id: Date.now(),
            ...materiForm,
            publishDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        setMateriList([newMateri, ...materiList]);
        setShowMateriModal(false);
        setMateriForm({ title: '', classId: defaultClass, subjectName: user?.mapel || '', driveLink: '', status: 'Terbit' });
        toast.success("Materi berhasil diupload!");
    };

    const handleSaveLatihan = () => {
        if (!latihanForm.title || latihanForm.questions.length === 0) {
            toast.error("Harap isi Judul dan minimal 1 pertanyaan!");
            return;
        }

        const newLatihan: LatihanItem = {
            id: Date.now(),
            ...latihanForm,
            publishDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        setLatihanList([newLatihan, ...latihanList]);
        setShowLatihanModal(false);
        setLatihanForm({ title: '', classId: defaultClass, subjectName: user?.mapel || '', type: 'PG', questions: [], status: 'Terbit' });
        toast.success("Latihan soal berhasil dibuat!");
    };

    const addQuestion = () => {
        if (latihanForm.type === 'PG') {
            const newQ: QuestionPG = {
                id: Date.now(),
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0
            };
            setLatihanForm({ ...latihanForm, questions: [...latihanForm.questions, newQ] });
        } else {
            const newQ: QuestionEssay = {
                id: Date.now(),
                question: '',
                sampleAnswer: ''
            };
            setLatihanForm({ ...latihanForm, questions: [...latihanForm.questions, newQ] });
        }
    };

    const removeQuestion = (id: number) => {
        setLatihanForm({
            ...latihanForm,
            questions: latihanForm.questions.filter(q => q.id !== id)
        });
    };

    const updateQuestion = (id: number, field: string, value: any) => {
        const updated = latihanForm.questions.map(q => {
            if (q.id === id) {
                return { ...q, [field]: value };
            }
            return q;
        });
        setLatihanForm({ ...latihanForm, questions: updated });
    };

    const updateOption = (qId: number, optIdx: number, value: string) => {
        const updated = latihanForm.questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...(q as QuestionPG).options];
                newOptions[optIdx] = value;
                return { ...q, options: newOptions };
            }
            return q;
        });
        setLatihanForm({ ...latihanForm, questions: updated });
    };

    const handleDeleteMateri = (id: number) => {
        if (confirm("Hapus materi ini?")) {
            setMateriList(materiList.filter(m => m.id !== id));
            toast.success("Materi dihapus");
        }
    };

    const handleDeleteLatihan = (id: number) => {
        if (confirm("Hapus latihan ini?")) {
            setLatihanList(latihanList.filter(l => l.id !== id));
            toast.success("Latihan dihapus");
        }
    };

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3 md:gap-4 shrink-0 bg-white sticky top-0 z-20">
                <button onClick={onBack} className="p-2 md:p-2.5 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-500 hover:text-blue-600">
                    <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-base md:text-xl text-[#1E1B4B] flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-rose-50 rounded-lg md:rounded-xl">
                            <BookOpen className="text-rose-600 w-4 h-4 md:w-6 md:h-6" size={24} />
                        </div>
                        Materi dan Latihan
                    </h2>
                </div>
                <div className="bg-blue-50 rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2 border border-blue-100">
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-transparent border-none outline-none font-bold text-blue-700 cursor-pointer text-xs md:text-sm"
                    >
                        <option>1 (Ganjil)</option>
                        <option>2 (Genap)</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30 space-y-6 md:space-y-8">

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <button
                        onClick={() => setShowMateriModal(true)}
                        className="group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex flex-row items-center gap-4 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm md:text-lg">Upload Materi</h4>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Bagikan materi via Google Drive</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowLatihanModal(true)}
                        className="group bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex flex-row items-center gap-4 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm md:text-lg">Buat Latihan Soal</h4>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Buat kuis PG atau Essay</p>
                        </div>
                    </button>
                </div>

                {/* TABLE SECTION: MATERI */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg md:rounded-xl flex items-center justify-center text-blue-600">
                                <FileText size={16} className="md:w-5 md:h-5" />
                            </div>
                            <h3 className="font-bold text-sm md:text-base text-slate-800">Daftar Materi</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-slate-100">{materiList.length} Items</span>
                    </div>
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-left min-w-[450px]">
                            <thead className="bg-slate-50 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Judul</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Link Drive</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Publikasi</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {materiList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <p className="text-xs md:text-sm font-bold text-slate-700 leading-tight uppercase">{item.title}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-0.5">KELAS {item.classId}</p>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <a href={item.driveLink} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5">
                                                <ExternalLink size={12} /> Buka Drive
                                            </a>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Terbit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {item.publishDate}
                                            </span>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center justify-center">
                                                <button onClick={() => handleDeleteMateri(item.id)} className="p-1.5 md:p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABLE SECTION: LATIHAN SOAL */}
                <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600">
                                <HelpCircle size={16} className="md:w-5 md:h-5" />
                            </div>
                            <h3 className="font-bold text-sm md:text-base text-slate-800">Latihan Soal</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-slate-100">{latihanList.length} Items</span>
                    </div>
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-left min-w-[450px]">
                            <thead className="bg-slate-50 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Judul</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Jenis</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4">Publikasi</th>
                                    <th className="px-5 md:px-6 py-3 md:py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {latihanList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-700">
                                            <p className="font-bold uppercase leading-tight">{item.title}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-0.5">{item.questions.length} PERTANYAAN • KELAS {item.classId}</p>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <span className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-lg border ${item.type === 'PG' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{item.publishDate}</span>
                                        </td>
                                        <td className="px-5 md:px-6 py-3 md:py-4">
                                            <div className="flex items-center justify-center">
                                                <button onClick={() => handleDeleteLatihan(item.id)} className="p-1.5 md:p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL: UPLOAD MATERI (LINK DRIVE) */}
            {showMateriModal && (
                <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-[340px] md:max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Upload Materi</h3>
                                <button onClick={() => setShowMateriModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Judul Materi</label>
                                    <input
                                        type="text"
                                        value={materiForm.title}
                                        onChange={(e) => setMateriForm({ ...materiForm, title: e.target.value })}
                                        placeholder="Contoh: Bab 1: Sejarah Islam"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Link Google Drive</label>
                                    <div className="relative">
                                        <ExternalLink size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                                        <input
                                            type="url"
                                            value={materiForm.driveLink}
                                            onChange={(e) => setMateriForm({ ...materiForm, driveLink: e.target.value })}
                                            placeholder="Tempel link share disini"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-medium text-blue-600"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pilih Kelas</label>
                                        <select
                                            value={materiForm.classId}
                                            onChange={(e) => setMateriForm({ ...materiForm, classId: e.target.value })}
                                            className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none"
                                        >
                                            {classesDataGlobal.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                        <select
                                            value={materiForm.status}
                                            onChange={(e) => setMateriForm({ ...materiForm, status: e.target.value as any })}
                                            className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none"
                                        >
                                            <option value="Terbit">🚀 Terbitkan</option>
                                            <option value="Draft">📝 Draft</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setShowMateriModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1">Batal</button>
                                <button onClick={handleSaveMateri} className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm order-1 sm:order-2">
                                    <Send size={16} /> Simpan Materi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: BUAT LATIHAN SOAL */}
            {showLatihanModal && (
                <div className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-50 shrink-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <FilePlus size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Latihan Soal Baru</h3>
                                        <p className="text-[10px] text-slate-400 mt-0.5 ml-0.5 uppercase tracking-widest font-black">Pilihan Ganda & Essay Fungsional</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLatihanModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={latihanForm.title}
                                    onChange={(e) => setLatihanForm({ ...latihanForm, title: e.target.value })}
                                    placeholder="Judul Latihan Soal..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-sm"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={latihanForm.type}
                                        onChange={(e) => setLatihanForm({ ...latihanForm, type: e.target.value as any, questions: [] })}
                                        className="flex-1 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none font-bold text-emerald-700 text-sm cursor-pointer appearance-none"
                                    >
                                        <option value="PG">Tipe: Pilihan Ganda</option>
                                        <option value="Essay">Tipe: Essay (Uraian)</option>
                                    </select>
                                    <select
                                        value={latihanForm.classId}
                                        onChange={(e) => setLatihanForm({ ...latihanForm, classId: e.target.value })}
                                        className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 text-sm cursor-pointer appearance-none text-center"
                                    >
                                        {classesDataGlobal.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* QUESTION BUILDER AREA */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-50/20">
                            {latihanForm.questions.length === 0 ? (
                                <div className="h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 gap-2">
                                    <HelpCircle size={32} className="opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Klik Tambah Untuk Memulai</p>
                                </div>
                            ) : (
                                latihanForm.questions.map((q, idx) => (
                                    <div key={q.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-emerald-200 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-slate-200">{idx + 1}</span>
                                            <button onClick={() => removeQuestion(q.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <textarea
                                                value={q.question}
                                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                                placeholder="Tuliskan pertanyaan disini..."
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium resize-none h-24 text-sm"
                                            />

                                            {latihanForm.type === 'PG' ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(q as QuestionPG).options.map((opt, optIdx) => (
                                                        <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${(q as QuestionPG).correctAnswer === optIdx ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                                            <button
                                                                onClick={() => updateQuestion(q.id, 'correctAnswer', optIdx)}
                                                                className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all text-[10px] font-bold ${(q as QuestionPG).correctAnswer === optIdx ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100' : 'bg-white border-slate-300 text-slate-400'}`}
                                                            >
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                                placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                                                                className="flex-1 bg-transparent outline-none text-[13px] font-bold placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50">
                                                    <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 ml-1">Kunci / Saran Jawaban (Essay)</label>
                                                    <textarea
                                                        value={(q as QuestionEssay).sampleAnswer}
                                                        onChange={(e) => updateQuestion(q.id, 'sampleAnswer', e.target.value)}
                                                        placeholder="Saran jawaban untuk membantu koreksi..."
                                                        className="w-full p-4 bg-white/50 border border-emerald-100/30 rounded-xl focus:border-emerald-500 outline-none transition-all font-medium resize-none h-20 text-[13px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            <button
                                onClick={addQuestion}
                                className="w-full py-4 border-2 border-dashed border-emerald-200 rounded-[2rem] text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={20} /> Tambah Pertanyaan Baru
                            </button>
                        </div>

                        <div className="p-6 md:p-8 border-t border-slate-50 bg-white shrink-0 flex gap-4">
                            <button onClick={() => setShowLatihanModal(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
                            <button onClick={handleSaveLatihan} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95">
                                <Save size={20} /> Simpan & Publikasikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MateriLatihanGuru;
