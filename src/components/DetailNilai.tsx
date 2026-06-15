import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface DetailNilaiProps {
    onBack: () => void;
    category: 'Nilai Ulangan' | 'Nilai Ujian';
    user: any;
}

const DetailNilai: React.FC<DetailNilaiProps> = ({ onBack, category, user }) => {
    const [selectedClass, setSelectedClass] = useState(user?.studentClass || '1A');
    const [selectedSemester, setSelectedSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
    const [ujianCategory, setUjianCategory] = useState<'PTS' | 'PAS' | 'PAT'>('PTS');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradesData, setGradesData] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (category === 'Nilai Ujian') {
            if (ujianCategory === 'PAS') setSelectedSemester('Ganjil');
            if (ujianCategory === 'PAT') setSelectedSemester('Genap');
        }
    }, [category, ujianCategory]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('eduadmin_token');
            if (!token) { setLoading(false); return; }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [subjRes, gradeRes] = await Promise.all([
                    fetch('/api/subjects', { headers }),
                    fetch('/api/grades', { headers })
                ]);

                if (subjRes.ok) {
                    const subjData = await subjRes.json();
                    setSubjects(Array.isArray(subjData) ? subjData : []);
                }

                if (gradeRes.ok) {
                    const gradeData = await gradeRes.json();
                    if (Array.isArray(gradeData)) {
                        const grouped: Record<string, any[]> = {};
                        gradeData.forEach((g: any) => {
                            const key = g.subject_id?.toString() || 'unknown';
                            if (!grouped[key]) grouped[key] = [];
                            grouped[key].push(g);
                        });
                        setGradesData(grouped);
                    }
                }
            } catch (err) {
                console.error('Gagal memuat data nilai:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const studentId = user?.studentId || user?.id || '';
    const studentName = user?.studentName || user?.nama || '';

    const getStudentGradesForSubject = (subjectId: string) => {
        const grades = gradesData[subjectId] || [];
        const studentGrade = grades.find((g: any) =>
            g.student_id?.toString() === studentId?.toString() ||
            g.student_name?.toLowerCase() === studentName?.toLowerCase()
        );
        return studentGrade;
    };

    const getGradeScores = (subjectId: string) => {
        const sg = getStudentGradesForSubject(subjectId);
        if (!sg) return { uh: [], pts: 0, pas: 0, pat: 0 };

        const uh = [];
        for (let i = 1; i <= 4; i++) {
            const val = sg[`tp${i}`] || sg[`uh${i}`] || 0;
            if (val > 0) uh.push(val);
        }

        return {
            uh,
            pts: sg.pts || sg.uts || 0,
            pas: sg.pas || sg.uas || 0,
            pat: sg.pat || 0
        };
    };

    const getAverage = (scores: number[]) => {
        return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <h3 className="font-bold text-slate-800 text-lg">{category === 'Nilai Ulangan' ? 'Nilai Ulangan Harian' : 'Nilai Ujian'}</h3>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                    {category === 'Nilai Ujian' && (
                        <div className="flex gap-2">
                            {(['PTS', 'PAS', 'PAT'] as const).map(uc => (
                                <button key={uc} onClick={() => setUjianCategory(uc)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${ujianCategory === uc ? 'bg-[#004AAD] text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                                    {uc}
                                </button>
                            ))}
                        </div>
                    )}
                    {category === 'Nilai Ulangan' && (
                        <div className="flex gap-2">
                            {(['Ganjil', 'Genap'] as const).map(sem => (
                                <button key={sem} onClick={() => setSelectedSemester(sem)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedSemester === sem ? 'bg-[#004AAD] text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                                    Semester {sem}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Memuat data...</div>
                ) : (
                    <div className="space-y-4">
                        {subjects.map((sub: any) => {
                            const scores = getGradeScores(sub.id?.toString() || '');
                            let displayScore = 0;
                            let displayLabel = '';

                            if (category === 'Nilai Ulangan') {
                                displayScore = getAverage(scores.uh);
                                displayLabel = `${scores.uh.length} Ulangan Harian`;
                            } else if (ujianCategory === 'PTS') {
                                displayScore = scores.pts;
                                displayLabel = 'PTS';
                            } else if (ujianCategory === 'PAS') {
                                displayScore = scores.pas;
                                displayLabel = 'PAS';
                            } else if (ujianCategory === 'PAT') {
                                displayScore = scores.pat;
                                displayLabel = 'PAT';
                            }

                            return (
                                <div key={sub.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                                        <p className="text-xs text-slate-500">{displayLabel}</p>
                                    </div>
                                    <div className={`text-lg font-bold px-4 py-1 rounded-full ${displayScore >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                        {displayScore || '-'}
                                    </div>
                                </div>
                            );
                        })}

                        {subjects.length === 0 && (
                            <div className="text-center py-10 text-slate-400">Belum ada data nilai</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailNilai;
