import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { gradesDataGlobal } from '../data/sharedData';

interface DetailNilaiProps {
    onBack: () => void;
    category: 'Nilai Ulangan' | 'Nilai Ujian';
    user: any;
}

const DetailNilai: React.FC<DetailNilaiProps> = ({ onBack, category, user }) => {
    const [selectedClass, setSelectedClass] = useState(user?.kelas || '1A'); // Auto-select user class
    const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil'); // Default Ganjil
    const [ujianCategory, setUjianCategory] = useState<'PTS' | 'PAS' | 'PAT'>('PTS');

    // Auto-set semester for PAS and PAT
    React.useEffect(() => {
        if (category === 'Nilai Ujian') {
            if (ujianCategory === 'PAS') setSelectedSemester('Ganjil');
            if (ujianCategory === 'PAT') setSelectedSemester('Genap');
        }
    }, [category, ujianCategory]);

    // Subject List (Matching IDs with Global Data)
    const subjects = [
        { id: 1, name: 'Pendidikan Agama Islam', teacher: 'Budi Santoso, S.Pd' },
        { id: 2, name: 'Pendidikan Pancasila', teacher: 'Siti Aminah, S.Pd' },
        { id: 3, name: 'Bahasa Indonesia', teacher: 'Dewi Sartika, S.Pd' },
        { id: 4, name: 'Matematika', teacher: 'Ahmad Dahlan, S.Pd' },
        { id: 5, name: 'IPAS', teacher: 'Ahmad Dahlan, S.Pd' },
        { id: 6, name: 'Seni Budaya', teacher: 'Budi Santoso, S.Pd' },
        { id: 7, name: 'Pendidikan Jasmani', teacher: 'Siti Aminah, S.Pd' },
        { id: 8, name: 'Bahasa Inggris', teacher: 'Dewi Sartika, S.Pd' },
    ];

    const getStudentGrades = () => {
        return subjects.map(sub => {
            // 1. Construct the dynamic key used by Guru/Admin
            const storageKey = `grades_v2_${selectedClass}_${sub.name}_${selectedSemester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}`;
            const savedData = localStorage.getItem(storageKey);
            let studentGrades: any[] = [];

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    // Find record for this specific student
                    const studentRecord = parsed.find((g: any) =>
                        g.studentId === (user?.studentId || 4) ||
                        (user?.nama && g.studentName?.toLowerCase() === user.nama.toLowerCase())
                    );

                    if (studentRecord) {
                        // Map the local flat structure to the view's expectations
                        studentGrades = [
                            { type: 'UH1', score: studentRecord.tp1 || 0 },
                            { type: 'UH2', score: studentRecord.tp2 || 0 },
                            { type: 'UH3', score: studentRecord.tp3 || 0 },
                            { type: 'UH4', score: studentRecord.tp4 || 0 },
                            { type: 'PTS', score: studentRecord.pts || 0 },
                            { type: 'PAS', score: studentRecord.pas || 0 },
                            { type: 'PAT', score: studentRecord.pat || 0 }
                        ];
                    }
                } catch (e) {
                    console.error("Failed to parse grades for " + sub.name, e);
                }
            }

            if (category === 'Nilai Ulangan') {
                const uh1 = studentGrades.find(g => g.type === 'UH1')?.score || 0;
                const uh2 = studentGrades.find(g => g.type === 'UH2')?.score || 0;
                const uh3 = studentGrades.find(g => g.type === 'UH3')?.score || 0;
                const uh4 = studentGrades.find(g => g.type === 'UH4')?.score || 0;

                const scores = [uh1, uh2, uh3, uh4].filter(s => s > 0);
                const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

                return {
                    ...sub,
                    grades: [
                        { label: 'U 1', value: uh1 || '-' },
                        { label: 'U 2', value: uh2 || '-' },
                        { label: 'U 3', value: uh3 || '-' },
                        { label: 'U 4', value: uh4 || '-' },
                        { label: 'Rata-rata', value: avg || '-' }
                    ]
                };
            } else if (category === 'Nilai Ujian') {
                const grade = studentGrades.find(g => g.type === ujianCategory)?.score || 0;
                return {
                    ...sub,
                    grades: [
                        { label: ujianCategory, value: grade || '-' }
                    ]
                };
            }
            return { ...sub, grades: [] };
        });
    };

    const data = getStudentGrades();

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{category}</h3>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">

                {/* UJIAN TABS */}
                {category === 'Nilai Ujian' && (
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                        {['PTS', 'PAS', 'PAT'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setUjianCategory(tab as any)}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${ujianCategory === tab
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Filters */}
                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <label className="text-slate-500 font-bold whitespace-nowrap min-w-[50px]">Kelas</label>
                        <div className="relative flex-1">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option>1 A</option>
                                <option>2 A</option>
                                <option>3 A</option>
                                <option>4 A</option>
                                <option>5 A</option>
                                <option>6 A</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Semester Filter - Only for Nilai Ulangan or PTS */}
                    {(category === 'Nilai Ulangan' || (category === 'Nilai Ujian' && ujianCategory === 'PTS')) && (
                        <div className="flex items-center gap-3">
                            <label className="text-slate-500 font-bold whitespace-nowrap min-w-[50px]">Sem.</label>
                            <div className="relative flex-1">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value as any)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="Ganjil">Semester 1 (Ganjil)</option>
                                    <option value="Genap">Semester 2 (Genap)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Subject List */}
                <div className="space-y-3 pb-20">
                    {data.map((subject) => (
                        <div key={subject.id} className="border border-slate-300 rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-500 font-bold mb-0.5">Mata pelajaran</p>
                                <h4 className="font-bold text-slate-800 text-sm">{subject.id}. {subject.name}</h4>
                                <p className="text-[10px] text-slate-500">{subject.teacher}</p>
                            </div>

                            <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-4 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0 scrollbar-hide">
                                {subject.grades.map((grade, gIdx) => (
                                    <div key={gIdx} className="flex flex-col items-center min-w-[50px]">
                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5 whitespace-nowrap">{grade.label}</p>
                                        <div className={`text-sm font-bold px-3 py-1 rounded-lg ${grade.label.includes('Rata') || grade.label.includes('PAS') || grade.label.includes('PTS')
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-slate-800 bg-slate-50 border border-slate-200'
                                            }`}>
                                            {grade.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DetailNilai;
