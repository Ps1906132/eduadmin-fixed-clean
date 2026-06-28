import React, { useState, useEffect } from 'react';
import { ChevronLeft, FolderInput, Save, Info } from 'lucide-react';
import { useGrades, GradeRecord } from './DashboardSuperAdmin/hooks/useGrades';

interface InputNilaiGuruProps {
    onBack: () => void;
    user?: any;
}

const InputNilaiGuru: React.FC<InputNilaiGuruProps> = ({ onBack, user }) => {
    const { fetchGrades, saveGradesBatch, loading: syncing } = useGrades();
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedGradeType, setSelectedGradeType] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [classList, setClassList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [gradeTypesList, setGradeTypesList] = useState<any[]>([]);
    const [classStudentsMap, setClassStudentsMap] = useState<Record<string, string[]>>({});
    const [studentsMap, setStudentsMap] = useState<Record<string, any>>({});
    const [gradesData, setGradesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [academicYearId, setAcademicYearId] = useState('');

    useEffect(() => {
        const loadMasterData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resClasses, resSubjects, resStudents, resClassStudents, resSchedules, resAY] = await Promise.all([
                    fetch('/api/classes', { headers }),
                    fetch('/api/subjects', { headers }),
                    fetch('/api/students', { headers }),
                    fetch('/api/class_students?is_active=eq.1', { headers }),
                    fetch(`/api/schedules?teacher_id=eq.${user?.id || ''}`, { headers }),
                    fetch('/api/academic_years?is_active=eq.1', { headers }),
                ]);

                const allClasses: any[] = resClasses.ok ? (await resClasses.json()) : [];
                const allSubjects: any[] = resSubjects.ok ? (await resSubjects.json()) : [];
                const allStudents: any[] = resStudents.ok ? (await resStudents.json()) : [];
                const allClassStudents: any[] = resClassStudents.ok ? (await resClassStudents.json()) : [];
                const schedules: any[] = resSchedules.ok ? (await resSchedules.json()) : [];

                let ayId = '';
                const ayData = resAY.ok ? (await resAY.json()) : [];
                if (Array.isArray(ayData) && ayData.length > 0) {
                    ayId = ayData[0].id;
                }
                if (!ayId) {
                    const ayFallback = await fetch('/api/academic_years?order=start_date.desc&limit=1', { headers });
                    if (ayFallback.ok) {
                        const ayData2 = await ayFallback.json();
                        if (Array.isArray(ayData2) && ayData2.length > 0) ayId = ayData2[0].id;
                    }
                }
                if (ayId) setAcademicYearId(ayId);

                const sMap: Record<string, any> = {};
                allStudents.forEach((s: any) => { sMap[s.id] = s; });
                setStudentsMap(sMap);

                const csMap: Record<string, string[]> = {};
                allClassStudents.forEach((cs: any) => {
                    if (!csMap[cs.class_id]) csMap[cs.class_id] = [];
                    csMap[cs.class_id].push(cs.student_id);
                });
                setClassStudentsMap(csMap);

                const scheduleClassIds = new Set(schedules.map((s: any) => s.class_id));
                const waliClassIds = new Set(allClasses.filter((c: any) => c.teacher_id === user?.id).map((c: any) => c.id));
                const teacherClassIds = new Set([...scheduleClassIds, ...waliClassIds]);
                const filteredClasses = allClasses.filter((c: any) => teacherClassIds.has(c.id));
                setClassList(filteredClasses);

                const scheduleSubjectIds = new Set(schedules.map((s: any) => s.subject_id));
                const filteredSubjects = allSubjects.filter((s: any) => scheduleSubjectIds.has(s.id));
                setSubjectList(filteredSubjects);

                if (filteredClasses.length > 0 && !selectedClass) {
                    const defaultClass = filteredClasses.find((c: any) => c.teacher_id === user?.id) || filteredClasses[0];
                    setSelectedClass(defaultClass.id);
                }
                if (filteredSubjects.length > 0 && !selectedSubject) {
                    setSelectedSubject(filteredSubjects[0].id);
                }
            } catch (e) {
                console.error('Failed to load master data:', e);
            } finally {
                setLoading(false);
            }
        };

        loadMasterData();
    }, [user?.id]);

    useEffect(() => {
        const loadGradeTypes = async () => {
            if (!academicYearId || !selectedSemester) return;
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };
                const res = await fetch(`/api/grade_types?academic_year_id=eq.${academicYearId}&semester=eq.${selectedSemester}&is_active=eq.1&order=sort_order.asc`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    const rows = Array.isArray(data) ? data : [];
                    setGradeTypesList(rows);
                    if (rows.length > 0 && !selectedGradeType) {
                        setSelectedGradeType(rows[0].id);
                    }
                }
            } catch (e) {
                console.error('Failed to load grade types:', e);
            }
        };
        loadGradeTypes();
    }, [academicYearId, selectedSemester]);

    useEffect(() => {
        const loadGrades = async () => {
            if (!selectedClass || !selectedSubject || !academicYearId) return;

            const classStudentIds = classStudentsMap[selectedClass] || [];
            const classStudents = classStudentIds.map((sid: string) => studentsMap[sid]).filter(Boolean);

            const dbGrades = await fetchGrades({
                classId: selectedClass,
                subjectId: selectedSubject,
                academicYearId
            });

            if (classStudents.length > 0) {
                const mergedGrades = classStudents.map((s: any) => {
                    const studentGrades = dbGrades.filter((g: any) => g.student_id === s.id);
                    const row: any = {
                        studentId: s.id,
                        studentName: s.full_name,
                        studentNis: s.nis,
                    };
                    studentGrades.forEach((g: any) => {
                        row[g.grade_type_id || g.assessment_type] = g.grade_value;
                    });
                    return row;
                });
                setGradesData(mergedGrades);
            } else {
                setGradesData([]);
            }
        };

        if (classList.length > 0 && subjectList.length > 0 && classStudentsMap && studentsMap) {
            loadGrades();
        }
    }, [selectedClass, selectedSubject, selectedGradeType, selectedSemester, classStudentsMap, studentsMap, academicYearId]);

    const handleScoreChange = (studentId: string, value: string) => {
        setGradesData(prev =>
            prev.map(row =>
                row.studentId === studentId ? { ...row, [selectedGradeType]: Number(value) || 0 } : row
            )
        );
    };

    const handleSaveAll = async () => {
        if (!selectedClass || !selectedSubject || !selectedGradeType || !academicYearId) {
            alert('Pastikan kelas, mapel, dan jenis penilaian dipilih.');
            return;
        }

        const records: GradeRecord[] = gradesData
            .filter(row => row[selectedGradeType] !== undefined && row[selectedGradeType] !== 0)
            .map(row => ({
                studentId: row.studentId.toString(),
                subjectId: selectedSubject,
                classId: selectedClass,
                academicYearId,
                gradeValue: row[selectedGradeType] || 0,
                assessmentType: selectedGradeType
            }));

        if (records.length === 0) {
            alert('Tidak ada nilai yang perlu disimpan.');
            return;
        }

        const result = await saveGradesBatch(records);
        if (result.success) {
            alert(`Berhasil menyimpan ${records.length} nilai!`);
        } else {
            alert(`Gagal menyimpan: ${result.error}`);
        }
    };

    const currentGradeType = gradeTypesList.find((gt: any) => gt.id === selectedGradeType);
    const selectedClassName = classList.find((c: any) => c.id === selectedClass)?.name || selectedClass;
    const selectedSubjectName = subjectList.find((s: any) => s.id === selectedSubject)?.name || selectedSubject;

    const classStudentIds = classStudentsMap[selectedClass] || [];
    const totalStudents = classStudentIds.length;
    const filledCount = gradesData.filter(row => row[selectedGradeType] !== undefined && row[selectedGradeType] !== 0).length;

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3 md:gap-4 shrink-0 bg-white sticky top-0 z-20">
                <button onClick={onBack} className="p-2 md:p-2.5 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all text-slate-500">
                    <ChevronLeft size={22} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-base md:text-xl text-slate-800 flex items-center gap-2">
                        <div className="p-1.5 md:p-2 bg-indigo-50 rounded-lg md:rounded-xl">
                            <FolderInput className="text-indigo-600 w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        Input Nilai Siswa
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Kelas</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                        >
                            {classList.length === 0 && <option value="">Tidak ada kelas</option>}
                            {classList.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Mata Pelajaran</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                        >
                            {subjectList.length === 0 && <option value="">Tidak ada mapel</option>}
                            {subjectList.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 outline-none cursor-pointer appearance-none"
                        >
                            <option value="1">1 (Ganjil)</option>
                            <option value="2">2 (Genap)</option>
                        </select>
                    </div>
                    <div className="flex-[1.5] min-w-[240px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Jenis Penilaian</label>
                        <select
                            value={selectedGradeType}
                            onChange={(e) => setSelectedGradeType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none cursor-pointer appearance-none shadow-lg shadow-slate-200"
                        >
                            {gradeTypesList.length === 0 && <option value="">Tidak ada jenis penilaian</option>}
                            {gradeTypesList.map((gt: any) => (
                                <option key={gt.id} value={gt.id}>{gt.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 italic">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>Nilai yang baru diinput akan menghitung rata-rata secara otomatis saat raport dicetak. Klik Simpan untuk mempermanenkan data.</span>
                </div>

                {selectedClassName && selectedSubjectName && currentGradeType && (
                    <div className="mb-4 flex items-center gap-3 text-xs">
                        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100">{selectedClassName}</span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold">{selectedSubjectName}</span>
                        <span className="px-3 py-1.5 bg-slate-800 text-white rounded-lg font-bold">{currentGradeType.name}</span>
                        <span className="text-slate-400">{filledCount}/{totalStudents} siswa terisi</span>
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center">No</th>
                                    <th className="px-6 py-4">Nama Siswa</th>
                                    <th className="px-6 py-4 w-32 text-center">Input Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {gradesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center text-slate-300 font-bold">Tidak ada data siswa untuk kelas ini</td>
                                    </tr>
                                ) : (
                                    gradesData.map((siswa, index) => (
                                        <tr key={siswa.studentId} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-center text-slate-400 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700 leading-tight group-hover:text-indigo-600 transition-colors uppercase">{siswa.studentName}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{siswa.studentNis}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={siswa[selectedGradeType] || ''}
                                                    onChange={(e) => handleScoreChange(siswa.studentId, e.target.value)}
                                                    className="w-20 p-3 text-center bg-indigo-50/30 border border-slate-200 rounded-xl font-black text-indigo-700 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md shrink-0 flex items-center justify-center">
                <button
                    onClick={handleSaveAll}
                    disabled={syncing || gradesData.length === 0}
                    className="w-full max-w-md bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {syncing ? 'Menyimpan...' : `Simpan Nilai (${filledCount}/${totalStudents})`}
                </button>
            </div>
        </div>
    );
};

export default InputNilaiGuru;
