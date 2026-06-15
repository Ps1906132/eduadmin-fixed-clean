import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useClasses } from './DashboardSuperAdmin/hooks/useClasses';

interface RapotSiswaProps {
    onBack: () => void;
    user?: any;
}

const RapotSiswa: React.FC<RapotSiswaProps> = ({ onBack, user }) => {
    const { classes } = useClasses();
    const [selectedClass, setSelectedClass] = useState(user?.studentClass || '1A');
    const [selectedSemester, setSelectedSemester] = useState('Semester 1');
    const [rapotType, setRapotType] = useState<'diknas' | 'yayasan'>('diknas');

    const subjectList = [
        "Pendidikan Agama", "Pendidikan Pancasila", "Bahasa Indonesia",
        "Matematika", "IPAS", "Seni Budaya", "PJOK", "Bahasa Inggris"
    ];

    const [subjects, setSubjects] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [suppData, setSuppData] = useState({
        attitudes: [
            { id: 1, type: "Spiritual", desc: "" },
            { id: 2, type: "Sosial", desc: "" }
        ],
        extracurriculars: [{ id: 1, name: "", desc: "" }],
        attendance: { sakit: 0, izin: 0, alpha: 0 },
        personalities: [
            { aspect: "Kerapihan", desc: "Baik" },
            { aspect: "Kedisiplinan", desc: "Baik" },
            { aspect: "Kesehatan", desc: "Sehat" },
        ],
        note: "",
        decision: "Naik Ke Kelas"
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const studentId = user?.studentId || user?.id || 4;
                const currentSemesterFull = selectedSemester === 'Semester 1' ? '1 (Ganjil)' : '2 (Genap)';

                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const loadedSubjects: any[] = [];

                for (let i = 0; i < subjectList.length; i++) {
                    const subj = subjectList[i];
                    const targetSubjectRes = await fetch(`/api/subjects?name=eq.${encodeURIComponent(subj)}`, { headers });
                    const targetSubjects = targetSubjectRes.ok ? await targetSubjectRes.json() : [];
                    const targetSubject = Array.isArray(targetSubjects) && targetSubjects.length > 0 ? targetSubjects[0] : null;

                    let daily = 0, exam = 0, report = 0;

                    if (targetSubject) {
                        const gradeRes = await fetch(`/api/grades?student_id=eq.${studentId}&subject_id=eq.${targetSubject.id}`, { headers });
                        if (gradeRes.ok) {
                            const gradeData = await gradeRes.json();
                            if (Array.isArray(gradeData) && gradeData.length > 0) {
                                const tpGrades = gradeData.filter((g: any) => g.assessment_type?.startsWith('tp'));
                                const ptsGrade = gradeData.find((g: any) => g.assessment_type === 'pts');
                                const patGrade = gradeData.find((g: any) => g.assessment_type === 'pat');

                                if (tpGrades.length > 0) {
                                    daily = Math.round(tpGrades.reduce((sum: number, g: any) => sum + (g.grade_value || 0), 0) / tpGrades.length);
                                }
                                exam = Math.max(ptsGrade?.grade_value || 0, patGrade?.grade_value || 0);
                                report = Math.round((daily + exam) / 2);
                            }
                        }
                    }

                    loadedSubjects.push({ id: i + 1, name: subj, daily, exam, report });
                }

                setSubjects(loadedSubjects);
            } catch (e) {
                console.error('Failed to load grades from D1:', e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedClass, selectedSemester, user]);

    const averageDaily = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.daily, 0) / subjects.length) : 0;
    const averageExam = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.exam, 0) / subjects.length) : 0;
    const averageReport = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.report, 0) / subjects.length) : 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Nilai Rapot Persemester</h3>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                <>
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                    {['Rapot Diknas', 'Rapot Yayasan'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setRapotType(tab === 'Rapot Diknas' ? 'diknas' : 'yayasan')}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${(rapotType === 'diknas' && tab === 'Rapot Diknas') || (rapotType === 'yayasan' && tab === 'Rapot Yayasan')
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2 flex-1">
                        <label className="text-slate-600 font-bold whitespace-nowrap">Kelas</label>
                        <div className="relative w-full">
                            <select
                                value={selectedClass}
                                onChange={e => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                            >
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.nama}>{c.nama}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-slate-600 font-bold whitespace-nowrap">Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                            className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 outline-none appearance-none cursor-pointer"
                        >
                            <option>Semester 1</option>
                            <option>Semester 2</option>
                        </select>
                    </div>
                </div>

                {rapotType === 'diknas' && (
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
                                <h4 className="font-bold text-sm">📋 Capaian Kompetensi</h4>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">KURIKULUM MERDEKA</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold">
                                        <th className="p-3 text-left">Mata Pelajaran</th>
                                        <th className="p-3 text-center w-20">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {subjects.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 font-bold text-slate-700">{s.name}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-black text-lg ${s.report >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {s.report || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                    <tr>
                                        <td className="p-3 font-bold text-slate-800">Rata-rata</td>
                                        <td className="p-3 text-center font-black text-lg text-blue-600">{averageReport || '-'}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {rapotType === 'yayasan' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 text-center">
                            <p className="text-purple-600 font-bold">Template Rapot Yayasan</p>
                            <p className="text-sm text-slate-500 mt-1">Fitur ini akan segera tersedia.</p>
                        </div>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    );
};

export default RapotSiswa;