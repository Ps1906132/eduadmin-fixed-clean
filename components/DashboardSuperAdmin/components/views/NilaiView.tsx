import React, { useState, useEffect } from 'react';
import {
    Save, ArrowLeft, Download, Upload, Search, Filter,
    Calculator, CheckCircle, AlertCircle, FileSpreadsheet,
    Trophy, BookOpen, User, ChevronDown, Plus, Minus
} from 'lucide-react';
import { studentsDataGlobal, classesDataGlobal } from '../../../../data/sharedData';
import { toast } from 'react-hot-toast';

interface NilaiViewProps {
    setActiveView: (view: string) => void;
}

// Tipe data untuk struktur nilai lokal
interface GradeRow {
    studentId: number;
    studentName: string;
    studentNis: string;
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
    avgSumatif: number; // Rata-rata TP

    // Asesmen Sumatif Tengah Semester & Akhir
    pts: number;        // Penilaian Tengah Semester
    pas: number;        // Penilaian Akhir Semester (Ganjil)
    pat: number;        // Penilaian Akhir Tahun (Genap)
    ujisn: number;      // Ujian Sekolah (Jika ada)

    sas: number;        // LEGACY: Keep for compatibility if needed, or mapped to PAS/PAT
    finalScore: number; // Nilai Akhir Rapor
    predicate: string;  // A, B, C
    description: string;
    [key: string]: any; // Allow dynamic TP columns
}

const NilaiView: React.FC<NilaiViewProps> = ({ setActiveView }) => {
    // --- STATE FILTER ---
    const [selectedClass, setSelectedClass] = useState(classesDataGlobal[0]?.nama || '1A');
    const [selectedSubject, setSelectedSubject] = useState('Matematika');
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');

    // --- DYNAMIC TP STATE ---
    const [tpCount, setTpCount] = useState(4); // Default 4 columns

    // --- STATE TABLE ---
    // Expanded tabs to support specific exam types
    const [activeTab, setActiveTab] = useState<'sumatif' | 'pts' | 'pas_pat' | 'rapor'>('sumatif');
    const [searchQuery, setSearchQuery] = useState('');
    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [masterDescriptions, setMasterDescriptions] = useState<any[]>([]);

    // --- SUBJECTS DATA ---
    const subjects: string[] = localStorage.getItem('subjects_data_v2')
        ? JSON.parse(localStorage.getItem('subjects_data_v2')!).map((s: { name: string }) => s.name)
        : ["Matematika", "B. Indonesia", "IPA", "IPS"];

    // --- INITIALIZE DATA ---
    // --- STORAGE KEY HELPER ---
    const getStorageKey = () => `grades_v2_${selectedClass}_${selectedSubject}_${selectedSemester}`;

    // --- INITIALIZE DATA ---
    useEffect(() => {
        const key = getStorageKey();
        const savedData = localStorage.getItem(key);

        if (savedData) {
            setGrades(JSON.parse(savedData));
            setIsDirty(false);
            return;
        }

        const classStudents = studentsDataGlobal.filter(s => s.kelas === selectedClass);

        // Initial empty state (0) instead of random mock
        const initialGrades: GradeRow[] = classStudents.map(s => ({
            studentId: s.id,
            studentName: s.nama,
            studentNis: s.nis,
            tp1: 0,
            tp2: 0,
            tp3: 0,
            tp4: 0,
            avgSumatif: 0,
            pts: 0,
            pas: 0,
            pat: 0,
            ujisn: 0,
            sas: 0,
            finalScore: 0,
            predicate: '-',
            description: ''
        }));

        setGrades(initialGrades);
        setIsDirty(false);
    }, [selectedClass, selectedSubject, selectedSemester]);

    // --- AUTO SAVE TO LOCAL STORAGE ---
    useEffect(() => {
        if (grades.length > 0) {
            const key = getStorageKey();
            localStorage.setItem(key, JSON.stringify(grades));
        }
    }, [grades, selectedClass, selectedSubject, selectedSemester]);

    // --- SYNC TP COUNT ---
    useEffect(() => {
        const countKey = `tp_count_${selectedClass}_${selectedSubject}_${selectedSemester}`;
        const savedCount = localStorage.getItem(countKey);
        if (savedCount) {
            setTpCount(parseInt(savedCount));
        } else {
            setTpCount(4); // Default
        }
    }, [selectedClass, selectedSubject, selectedSemester]);

    const updateTpCount = (newCount: number) => {
        setTpCount(newCount);
        const countKey = `tp_count_${selectedClass}_${selectedSubject}_${selectedSemester}`;
        localStorage.setItem(countKey, newCount.toString());
    };

    const removeTpCount = () => {
        if (tpCount <= 1) return;
        updateTpCount(tpCount - 1);
    };

    // --- LOAD MASTER DESCRIPTIONS ---
    useEffect(() => {
        const savedDesc = localStorage.getItem('mock_descriptions');
        if (savedDesc) {
            try {
                setMasterDescriptions(JSON.parse(savedDesc));
            } catch (e) {
                console.error("Failed to load master descriptions", e);
            }
        }
    }, []);

    // --- CALCULATION LOGIC ---
    const calculateRow = (row: GradeRow): GradeRow => {
        // 1. Hitung Rata-rata Sumatif (TP yang diisi saja)
        // Dynamically gather all 'tpX' values based on current tpCount
        const tps: number[] = [];
        for (let i = 1; i <= tpCount; i++) {
            const val = row[`tp${i}`];
            if (val && val > 0) tps.push(Number(val));
        }

        const avgSum = tps.length > 0 ? Math.round(tps.reduce((a, b) => a + b, 0) / tps.length) : 0;

        // 2. Hitung Nilai Akhir
        // Formula: 40% Rata-rata Harian + 20% PTS + 40% (PAS/PAT/UJISN)
        // Kita ambil nilai akhir semester dari PAS atau PAT tergantung mana yang diisi (prioritas PAT jika semester genap/ada nilai)
        const examScore = Math.max(row.pas, row.pat, row.ujisn, row.sas);

        // Bobot: Harian 40%, PTS 20%, PAS/PAT 40%
        let final = 0;

        if (row.pts > 0 || examScore > 0) {
            final = Math.round((avgSum * 0.4) + (row.pts * 0.2) + (examScore * 0.4));
        } else {
            final = avgSum;
        }

        // 3. Tentukan Predikat
        let pred = 'D';
        if (final >= 90) pred = 'A';
        else if (final >= 80) pred = 'B';
        else if (final >= 75) pred = 'C'; // KKM 75
        else if (final > 0) pred = 'D'; // Belum tuntas
        else pred = '-';

        // 4. Generate Deskripsi Otomatis dari Master Data
        let desc = row.description;
        if (!desc && final > 0) { // Hanya auto-gen jika kosong
            // Cek Master Description (Sync) based on Subject & Predicate
            const masterDesc = masterDescriptions.find((d: any) =>
                (d.subject === selectedSubject || !d.subject) && // Match Subject or Generic
                d.predicate === pred &&
                d.type === 'Rapor Resmi' // Default priority to Resmi
            );

            if (masterDesc) {
                desc = `${masterDesc.knowledge}\n${masterDesc.skill}`;
            } else {
                // Fallback Legacy
                if (pred === 'A') desc = "Ananda sangat baik dalam memahami materi dan penerapannya.";
                else if (pred === 'B') desc = "Ananda baik dalam memahami sebagian besar materi.";
                else if (pred === 'C') desc = "Ananda cukup baik, namun perlu peningkatan dalam latihan soal.";
                else desc = "Ananda perlu bimbingan lebih intensif.";
            }
        }

        return {
            ...row,
            avgSumatif: avgSum,
            finalScore: final,
            predicate: pred,
            description: desc
        };
    };

    // --- HANDLERS ---
    const handleInputChange = (id: number, field: keyof GradeRow, value: any) => {
        setGrades(prev => prev.map(row => {
            if (row.studentId === id) {
                const updatedRow = { ...row, [field]: Number(value) };
                // Recalculate logic
                return calculateRow(updatedRow);
            }
            return row;
        }));
        setIsDirty(true);
    };

    const handleDescriptionChange = (id: number, text: string) => {
        setGrades(prev => prev.map(row =>
            row.studentId === id ? { ...row, description: text } : row
        ));
        setIsDirty(true);
    };

    const handleSave = () => {
        // Simulasi Save
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Menyimpan data nilai...',
                success: 'Data nilai berhasil disimpan ke Database!',
                error: 'Gagal menyimpan.',
            }
        );
        setIsDirty(false);
    };

    // --- RENDER HELPERS ---
    const getScoreColor = (score: number) => {
        if (score === 0) return 'text-slate-300';
        if (score < 75) return 'text-rose-600 font-bold';
        return 'text-slate-700';
    };

    const filteredGrades = grades.filter(g =>
        g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.studentNis.includes(searchQuery)
    );

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in">
            {/* HEADER & TABS */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                <FileSpreadsheet size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Manajemen Nilai</h2>
                                <p className="text-slate-500 text-sm font-medium">Kelola nilai harian (ulangan) dan ujian akhir siswa.</p>
                            </div>
                        </div>

                        {/* Filters integrated into header */}
                        <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200">
                            <div className="px-3 border-r border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kelas</label>
                                <div className="relative">
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        className="appearance-none bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer pr-6 w-20"
                                    >
                                        {classesDataGlobal.map(c => <option key={c.id} value={c.nama} className="text-slate-800">{c.nama}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="px-3 border-r border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mata Pelajaran</label>
                                <div className="relative">
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="appearance-none bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer pr-6 w-40 truncate"
                                    >
                                        {subjects.map(s => <option key={s} value={s} className="text-slate-800">{s}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-0 top-1 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="px-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Semester</label>
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="bg-transparent font-bold text-blue-600 outline-none text-sm cursor-pointer"
                                >
                                    <option className="text-slate-800">1 (Ganjil)</option>
                                    <option className="text-slate-800">2 (Genap)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {[
                            { id: 'sumatif', label: 'Ulangan Harian', icon: <BookOpen size={16} /> },
                            { id: 'pts', label: 'PTS', icon: <FileSpreadsheet size={16} /> },
                            { id: 'pas_pat', label: 'PAS / PAT', icon: <Calculator size={16} /> },
                            { id: 'rapor', label: 'Nilai Rapor', icon: <Trophy size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col overflow-hidden">

                {/* TOOLBAR */}
                <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    {/* TABS */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl overflow-x-auto custom-scrollbar gap-1">
                        <button
                            onClick={() => setActiveTab('sumatif')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'sumatif' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BookOpen size={16} /> Ulangan
                        </button>
                        <button
                            onClick={() => setActiveTab('pts')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pts' ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileSpreadsheet size={16} /> PTS
                        </button>
                        <button
                            onClick={() => setActiveTab('pas_pat')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pas_pat' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Calculator size={16} /> PAS / PAT
                        </button>
                        <button
                            onClick={() => setActiveTab('rapor')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'rapor' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Trophy size={16} /> Nilai Rapor
                        </button>
                    </div>

                    {/* SEARCH & ACTIONS */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari Siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-blue-500 w-48"
                            />
                        </div>

                        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                        <button className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors" title="Export Excel">
                            <Download size={20} />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Import Excel">
                            <Upload size={20} />
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!isDirty}
                            className={`ml-2 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${isDirty ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                        >
                            <Save size={18} /> Simpan Perubahan
                        </button>
                    </div>
                </div>

                {/* TABLE AREA */}
                <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F8FAFC] text-slate-500 font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-4 px-6 w-16 text-center border-b font-extrabold bg-[#F8FAFC]">No</th>
                                <th className="py-4 px-6 w-64 border-b bg-[#F8FAFC]">Nama Siswa</th>

                                {activeTab === 'sumatif' && (
                                    <>
                                        {Array.from({ length: tpCount }).map((_, i) => (
                                            <th key={i} className="py-4 px-2 w-24 text-center border-b bg-[#F8FAFC]">
                                                U {i + 1}
                                            </th>
                                        ))}
                                        {/* Add Button */}
                                        <th className="py-4 px-2 w-20 text-center border-b bg-[#F8FAFC]">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => updateTpCount(Math.min(tpCount + 1, 15))}
                                                    className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                                                    title="Tambah Kolom Ulangan"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                                <button
                                                    onClick={removeTpCount}
                                                    className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors"
                                                    title="Hapus Kolom Ulangan Terakhir"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                            </div>
                                        </th>
                                        <th className="py-4 px-4 w-32 text-center border-b bg-blue-50 text-blue-700 border-l border-r border-blue-100">Rerata Nilai</th>
                                        <th className="border-b bg-[#F8FAFC] min-w-[20px]"></th>
                                    </>
                                )}

                                {activeTab === 'pts' && (
                                    <>
                                        <th className="py-4 px-4 w-40 text-center border-b bg-amber-50 text-amber-700 border-l border-amber-100">Nilai PTS</th>
                                        <th className="border-b bg-[#F8FAFC] w-full"></th>
                                    </>
                                )}

                                {activeTab === 'pas_pat' && (
                                    <>
                                        <th className="py-4 px-4 w-32 text-center border-b bg-purple-50 text-purple-700 border-l border-purple-100">Nilai PAS (Ganjil)</th>
                                        <th className="py-4 px-4 w-32 text-center border-b bg-rose-50 text-rose-700 border-l border-rose-100">Nilai PAT (Genap)</th>
                                        <th className="border-b bg-[#F8FAFC] w-full"></th>
                                    </>
                                )}

                                {activeTab === 'rapor' && (
                                    <>
                                        <th className="py-4 px-4 w-32 text-center border-b bg-slate-50 text-slate-600">Rerata Ulangan</th>
                                        <th className="py-4 px-2 w-24 text-center border-b bg-amber-50 text-amber-700 border border-amber-100">PTS</th>
                                        <th className="py-4 px-2 w-24 text-center border-b bg-purple-50 text-purple-700 border border-purple-100">PAS/PAT</th>
                                        <th className="py-4 px-4 w-32 text-center border-b bg-emerald-50 text-emerald-700 border border-emerald-100">Nilai Akhir</th>
                                        <th className="py-4 px-4 w-20 text-center border-b bg-[#F8FAFC]">Predikat</th>
                                        <th className="py-4 px-6 min-w-[300px] border-b bg-[#F8FAFC]">Deskripsi Capaian Kompetensi</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredGrades.map((grade, idx) => (
                                <tr key={grade.studentId} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="py-3 px-6 text-center text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="py-3 px-6 font-medium text-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
                                                {grade.studentName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="group-hover:text-blue-600 transition-colors">{grade.studentName}</div>
                                                <div className="text-xs text-slate-400 font-normal">{grade.studentNis}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {activeTab === 'sumatif' && (
                                        <>
                                            {/* INPUTS SUMATIF DYNAMIC */}
                                            {Array.from({ length: tpCount }).map((_, i) => {
                                                const tpKey = `tp${i + 1}`;
                                                return (
                                                    <td key={tpKey} className="p-2 text-center">
                                                        <input
                                                            type="number"
                                                            min="0" max="100"
                                                            value={grade[tpKey] || ''}
                                                            onChange={(e) => handleInputChange(grade.studentId, tpKey as keyof GradeRow, e.target.value)}
                                                            placeholder="0"
                                                            className={`w-16 h-10 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all font-bold ${getScoreColor(Number(grade[tpKey]))}`}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            {/* Spacer for the + button column */}
                                            <td></td>

                                            <td className="p-2 text-center bg-blue-50/30 border-l border-r border-blue-50">
                                                <span className={`font-bold text-lg ${getScoreColor(grade.avgSumatif)}`}>
                                                    {grade.avgSumatif || '-'}
                                                </span>
                                            </td>
                                            <td></td>
                                        </>
                                    )}

                                    {activeTab === 'pts' && (
                                        <>
                                            <td className="p-2 text-center bg-amber-50/20">
                                                <input
                                                    type="number"
                                                    min="0" max="100"
                                                    value={grade.pts || ''}
                                                    onChange={(e) => handleInputChange(grade.studentId, 'pts', e.target.value)}
                                                    className={`w-28 h-10 text-center border-2 border-amber-100 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all font-bold text-amber-700 bg-white shadow-sm`}
                                                />
                                            </td>
                                            <td></td>
                                        </>
                                    )}

                                    {activeTab === 'pas_pat' && (
                                        <>
                                            <td className="p-2 text-center bg-purple-50/20">
                                                <input
                                                    type="number"
                                                    min="0" max="100"
                                                    value={grade.pas || ''}
                                                    onChange={(e) => handleInputChange(grade.studentId, 'pas', e.target.value)}
                                                    placeholder="PAS"
                                                    className={`w-24 h-10 text-center border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all font-bold text-purple-700 bg-white shadow-sm`}
                                                />
                                            </td>
                                            <td className="p-2 text-center bg-rose-50/20">
                                                <input
                                                    type="number"
                                                    min="0" max="100"
                                                    value={grade.pat || ''}
                                                    onChange={(e) => handleInputChange(grade.studentId, 'pat', e.target.value)}
                                                    placeholder="PAT"
                                                    className={`w-24 h-10 text-center border-2 border-rose-100 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition-all font-bold text-rose-700 bg-white shadow-sm`}
                                                />
                                            </td>

                                            <td></td>
                                        </>
                                    )}

                                    {activeTab === 'rapor' && (
                                        <>
                                            {/* READ ONLY SUMMARY */}
                                            <td className="p-2 text-center text-slate-500 font-bold bg-slate-50/50">
                                                {grade.avgSumatif}
                                            </td>
                                            <td className="p-2 text-center text-amber-600 font-bold bg-amber-50/30">
                                                {grade.pts}
                                            </td>
                                            <td className="p-2 text-center text-purple-600 font-bold bg-purple-50/30">
                                                {Math.max(grade.pas, grade.pat, grade.ujisn, grade.sas)}
                                            </td>

                                            {/* FINAL SCORE */}
                                            <td className="p-2 text-center bg-emerald-50/20 border-l border-emerald-50">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className={`font-extrabold text-lg ${grade.finalScore >= 75 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {grade.finalScore}
                                                    </span>
                                                    {grade.finalScore > 0 && (
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                                            {grade.finalScore >= 75 ? 'Tuntas' : 'Remedial'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-2 text-center">
                                                <span className={`inline-block w-8 h-8 leading-8 rounded-lg font-bold ${grade.predicate === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                    grade.predicate === 'B' ? 'bg-blue-100 text-blue-700' :
                                                        grade.predicate === 'C' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {grade.predicate}
                                                </span>
                                            </td>

                                            <td className="p-2">
                                                <textarea
                                                    value={grade.description}
                                                    onChange={(e) => handleDescriptionChange(grade.studentId, e.target.value)}
                                                    placeholder="Deskripsi otomatis..."
                                                    className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 outline-none resize-none h-16 bg-white"
                                                />
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {filteredGrades.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                                        Tidak ada data siswa ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER LEGEND */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white border border-slate-300 rounded"></div>
                        <span>Input Aktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-50 border border-slate-300 rounded"></div>
                        <span>Nilai {'<'} 75 (Perlu Remedial)</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span>Semua perubahan tersimpan otomatis di perangkat lokal sementara.</span>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default NilaiView;
