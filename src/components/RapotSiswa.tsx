import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RapotSiswaProps {
    onBack: () => void;
    user?: any;
}

interface StudentGrade {
    subject: string;
    subjectId: string;
    daily: number;
    exam: number;
    report: number;
    details: { name: string; grade: number; weight: number }[];
}

const RapotSiswa: React.FC<RapotSiswaProps> = ({ onBack, user }) => {
    const [classId, setClassId] = useState('');
    const [className, setClassName] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [subjects, setSubjects] = useState<StudentGrade[]>([]);
    const [loadingRaport, setLoadingRaport] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [subjectList, setSubjectList] = useState<{ id: string; name: string }[]>([]);
    const [currentYearId, setCurrentYearId] = useState('');

    useEffect(() => {
        if (!user?.id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { Authorization: `Bearer ${token}` };

                const [resClasses, resYears] = await Promise.all([
                    fetch(`/api/classes?teacher_id=eq.${user.id}&is_active=eq.1`, { headers }),
                    fetch('/api/academic_years?is_active=eq.1', { headers }),
                ]);

                if (resYears.ok) {
                    const years = await resYears.json();
                    if (Array.isArray(years) && years.length > 0) {
                        setCurrentYearId(years[0].id);
                    }
                }

                let classData: any = null;
                if (resClasses.ok) {
                    const classesArr = await resClasses.json();
                    if (Array.isArray(classesArr) && classesArr.length > 0) {
                        classData = classesArr[0];
                        setClassId(classData.id);
                        setClassName(classData.name || '');
                    }
                }

                if (!classData) {
                    setLoading(false);
                    return;
                }

                const [resClassStudents, resStudents, resSubjects] = await Promise.all([
                    fetch(`/api/class_students?class_id=eq.${classData.id}&is_active=eq.1`, { headers }),
                    fetch('/api/students', { headers }),
                    fetch('/api/subjects', { headers }),
                ]);

                let studentIds: string[] = [];
                if (resClassStudents.ok) {
                    const pivotData = await resClassStudents.json();
                    if (Array.isArray(pivotData)) {
                        studentIds = pivotData.map((cs: any) => cs.student_id);
                    }
                }

                if (resStudents.ok) {
                    const allStudents = await resStudents.json();
                    if (Array.isArray(allStudents)) {
                        setStudents(allStudents.filter((s: any) => studentIds.includes(s.id)));
                    }
                }

                if (resSubjects.ok) {
                    const subs = await resSubjects.json();
                    if (Array.isArray(subs)) {
                        setSubjectList(subs.map((s: any) => ({ id: s.id, name: s.name })));
                    }
                }
            } catch (e) {
                console.error('Failed to load data:', e);
                toast.error('Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    useEffect(() => {
        if (!selectedStudent || !currentYearId) return;

        const loadRaport = async () => {
            setLoadingRaport(true);
            setSubjects([]);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { Authorization: `Bearer ${token}` };
                const loaded: StudentGrade[] = [];

                const [resGradeTypes, resGrades] = await Promise.all([
                    fetch(`/api/grade_types?academic_year_id=eq.${currentYearId}&semester=eq.${selectedSemester}`, { headers }),
                    fetch(`/api/grades?student_id=eq.${selectedStudent.id}&academic_year_id=eq.${currentYearId}&semester=eq.${selectedSemester}`, { headers }),
                ]);

                const gradeTypes = resGradeTypes.ok ? await resGradeTypes.json() : [];
                const allGrades = resGrades.ok ? await resGrades.json() : [];

                const typeMap = new Map<string, { code: string; weight: number; name: string }>();
                if (Array.isArray(gradeTypes)) {
                    gradeTypes.forEach((gt: any) => {
                        typeMap.set(gt.id, { code: gt.code || '', weight: gt.weight || 1, name: gt.name || '' });
                    });
                }

                const gradesBySubject = new Map<string, any[]>();
                if (Array.isArray(allGrades)) {
                    allGrades.forEach((g: any) => {
                        const existing = gradesBySubject.get(g.subject_id) || [];
                        existing.push(g);
                        gradesBySubject.set(g.subject_id, existing);
                    });
                }

                for (const subj of subjectList) {
                    const gradeData = gradesBySubject.get(subj.id) || [];
                    let dailySum = 0, dailyWeight = 0;
                    let examSum = 0, examWeight = 0;
                    const details: { name: string; grade: number; weight: number }[] = [];

                    for (const g of gradeData) {
                        const typeInfo = g.grade_type_id ? typeMap.get(g.grade_type_id) : null;
                        const code = typeInfo?.code || g.assessment_type || '';
                        const weight = typeInfo?.weight || 1;
                        const gradeVal = g.grade_value || 0;
                        const typeName = typeInfo?.name || code;

                        if (code.startsWith('uh') || code.startsWith('tugas')) {
                            dailySum += gradeVal * weight;
                            dailyWeight += weight;
                            details.push({ name: typeName, grade: gradeVal, weight });
                        } else if (code === 'uts' || code === 'uas' || code === 'pts' || code === 'pat') {
                            examSum += gradeVal * weight;
                            examWeight += weight;
                            details.push({ name: typeName, grade: gradeVal, weight });
                        }
                    }

                    const daily = dailyWeight > 0 ? Math.round(dailySum / dailyWeight) : 0;
                    const exam = examWeight > 0 ? Math.round(examSum / examWeight) : 0;
                    const totalWeight = dailyWeight + examWeight;
                    const report = totalWeight > 0 ? Math.round((dailySum + examSum) / totalWeight) : 0;

                    loaded.push({ subject: subj.name, subjectId: subj.id, daily, exam, report, details });
                }

                setSubjects(loaded);
            } catch (e) {
                console.error('Failed to load grades:', e);
                toast.error('Gagal memuat data rapor');
            } finally {
                setLoadingRaport(false);
            }
        };

        loadRaport();
    }, [selectedStudent, selectedSemester, subjectList, currentYearId]);

    const averageReport = subjects.length > 0
        ? Math.round(subjects.reduce((acc, curr) => acc + curr.report, 0) / subjects.length)
        : 0;

    const filteredStudents = students.filter((s: any) =>
        (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis || '').includes(searchQuery)
    );

    if (selectedStudent) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                    <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {selectedStudent.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg truncate">{selectedStudent.full_name || 'Tanpa Nama'}</h3>
                        <p className="text-xs text-slate-500">NIS: {selectedStudent.nis || '-'} • Kelas {className}</p>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <label className="text-slate-600 font-bold text-sm">Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                            className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 outline-none cursor-pointer"
                        >
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                        </select>
                    </div>

                    {loadingRaport ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
                                <h4 className="font-bold text-sm">Capaian Kompetensi</h4>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">KURIKULUM MERDEKA</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold">
                                        <th className="p-3 text-left">Mata Pelajaran</th>
                                        <th className="p-3 text-center w-16">UH</th>
                                        <th className="p-3 text-center w-16">Ujian</th>
                                        <th className="p-3 text-center w-20">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {subjects.map((s, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 font-bold text-slate-700">{s.subject}</td>
                                            <td className="p-3 text-center text-slate-600">{s.daily || '-'}</td>
                                            <td className="p-3 text-center text-slate-600">{s.exam || '-'}</td>
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
                                        <td></td>
                                        <td></td>
                                        <td className="p-3 text-center font-black text-lg text-blue-600">{averageReport || '-'}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Nilai Rapot</h3>
                    <p className="text-xs text-slate-500">
                        {className ? `Kelas ${className} — ${students.length} siswa` : 'Wali Kelas'}
                    </p>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="relative mb-4">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Cari siswa..."
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <Users size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-bold">Tidak ada siswa</p>
                                <p className="text-sm">Belum ada siswa di kelas ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredStudents.map((student: any) => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white shadow-sm group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                {student.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                                    {student.full_name || 'Tanpa Nama'}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-medium">NIS: {student.nis || '-'}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default RapotSiswa;
