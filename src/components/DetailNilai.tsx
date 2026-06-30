import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

interface DetailNilaiProps {
    onBack: () => void;
    category: 'Nilai Ulangan' | 'Nilai Ujian';
    user: any;
}

const UJIAN_MAP: Record<string, { label: string; semester: number }> = {
    PTS: { label: 'PTS',  semester: 1 },
    PAS: { label: 'PAS',  semester: 1 },
    PAT: { label: 'PAT',  semester: 2 },
};

const DetailNilai: React.FC<DetailNilaiProps> = ({ onBack, category, user }) => {
    const [selectedSemester, setSelectedSemester] = useState<number>(1);
    const [ujianCategory, setUjianCategory] = useState<'PTS' | 'PAS' | 'PAT'>('PTS');
    const [subjects, setSubjects] = useState<any[]>([]);
    const [gradeTypes, setGradeTypes] = useState<any[]>([]);
    const [allGrades, setAllGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const studentId = user?.studentId || user?.id || '';

    useEffect(() => {
        if (category === 'Nilai Ujian') {
            const sem = UJIAN_MAP[ujianCategory]?.semester || 1;
            setSelectedSemester(sem);
        }
    }, [category, ujianCategory]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('eduadmin_token');
            if (!token || !studentId) { setLoading(false); return; }
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const gradeParams = `student_id=eq.${studentId}&semester=eq.${selectedSemester}`;
                const [subjRes, gradeRes, gtRes] = await Promise.all([
                    fetch('/api/subjects', { headers }),
                    fetch(`/api/grades?${gradeParams}`, { headers }),
                    fetch('/api/grade_types?semester=eq.' + selectedSemester, { headers }),
                ]);

                if (subjRes.ok) {
                    const d = await subjRes.json();
                    setSubjects(Array.isArray(d) ? d : []);
                }

                if (gtRes.ok) {
                    const d = await gtRes.json();
                    setGradeTypes(Array.isArray(d) ? d : []);
                }

                if (gradeRes.ok) {
                    const d = await gradeRes.json();
                    setAllGrades(Array.isArray(d) ? d : []);
                }
            } catch (err) {
                console.error('Gagal memuat data nilai:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId, selectedSemester]);

    const subjectGrades = useMemo(() => {
        const map: Record<string, Record<string, number>> = {};
        allGrades.forEach((g: any) => {
            const subId = g.subject_id?.toString() || 'unknown';
            if (!map[subId]) map[subId] = {};
            const gtId = g.grade_type_id?.toString() || '';
            map[subId][gtId] = Number(g.grade_value) || 0;
        });
        return map;
    }, [allGrades]);

    const getDisplayScore = (subjectId: string): { score: number; label: string; kkm: number } => {
        const scores = subjectGrades[subjectId] || {};
        const subject = subjects.find((s: any) => s.id?.toString() === subjectId);
        const kkm = Number(subject?.kkm) || 75;

        if (category === 'Nilai Ulangan') {
            const uhTypes = gradeTypes
                .filter(gt => gt.code?.startsWith('uh'))
                .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
            const uhScores = uhTypes.map(gt => scores[gt.id?.toString()] || 0).filter(s => s > 0);
            const avg = uhScores.length > 0 ? Math.round(uhScores.reduce((a: number, b: number) => a + b, 0) / uhScores.length) : 0;
            return { score: avg, label: `${uhScores.length} Ulangan Harian`, kkm };
        }

        const ujianType = gradeTypes.find((gt: any) => gt.code?.toLowerCase() === ujianCategory.toLowerCase());
        if (!ujianType) return { score: 0, label: ujianCategory, kkm };
        const val = scores[ujianType.id?.toString()] || 0;
        return { score: val, label: ujianType.name || ujianCategory, kkm };
    };

    const getAverage = (scores: number[]) =>
        scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <h3 className="font-bold text-slate-800 text-lg">
                    {category === 'Nilai Ulangan' ? 'Nilai Ulangan Harian' : 'Nilai Ujian'}
                </h3>
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
                            {([1, 2] as const).map(sem => (
                                <button key={sem} onClick={() => setSelectedSemester(sem)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedSemester === sem ? 'bg-[#004AAD] text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}>
                                    Semester {sem === 1 ? 'Ganjil' : 'Genap'}
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
                            const { score, label, kkm } = getDisplayScore(sub.id?.toString() || '');
                            const isPassed = score >= kkm;

                            return (
                                <div key={sub.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{sub.name}</p>
                                        <p className="text-xs text-slate-500">{label}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold px-4 py-1 rounded-full ${isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                            {score || '-'}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">KKM: {kkm}</p>
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
