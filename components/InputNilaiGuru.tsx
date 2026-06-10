import React, { useState, useEffect } from 'react';
import { ChevronLeft, FolderInput, Save, Plus, Minus, Info } from 'lucide-react';

interface InputNilaiGuruProps {
    onBack: () => void;
    user?: any;
}

import { useGrades, GradeRecord } from './DashboardSuperAdmin/hooks/useGrades';

const InputNilaiGuru: React.FC<InputNilaiGuruProps> = ({ onBack, user }) => {
    const { fetchGrades, saveGradesBatch, loading: syncing } = useGrades();

    // --- CONTEXT ---
    const isWaliKelas = user?.role === 'Wali Kelas' || user?.jabatan === 'Guru Kelas' || !!user?.kelas;
    const [selectedClass, setSelectedClass] = useState(user?.kelas || '1A');
    const [selectedMapel, setSelectedMapel] = useState(user?.mapel || 'Matematika');
    const [tipeNilai, setTipeNilai] = useState('tp1');
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');
    const [tpCount, setTpCount] = useState(4);

    // Lists for mapping
    const [classList, setClassList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);

    useEffect(() => {
        const savedClasses = localStorage.getItem('classes_data_v11');
        if (savedClasses) setClassList(JSON.parse(savedClasses));
        const savedSubjects = localStorage.getItem('subjects_data_v10');
        if (savedSubjects) setSubjectList(JSON.parse(savedSubjects));
    }, []);

    // --- DATA MANAGEMENT ---
    const [gradesData, setGradesData] = useState<any[]>([]);

    // Load data
    useEffect(() => {
        const loadGrades = async () => {
            // 1. Sync TP Count (Still local for UI state)
            const countKey = `tp_count_${selectedClass}_${selectedMapel}_${selectedSemester}`;
            const savedCount = localStorage.getItem(countKey);
            setTpCount(savedCount ? parseInt(savedCount) : 4);

            // 2. Fetch from API
            const targetClass = classList.find(c => c.nama === selectedClass);
            const targetSubject = subjectList.find(s => s.name === selectedMapel);
            
            // Get local students for the class to ensure we have a full list
            const studentsRaw = localStorage.getItem('students_data_v11');
            const allStudents = studentsRaw ? JSON.parse(studentsRaw) : [];
            const classStudents = allStudents.filter((s: any) => s.kelas === selectedClass);

            const dbGrades = await fetchGrades({
                classId: targetClass?.id,
                subjectId: targetSubject?.id,
                academicYearId: 'ay-2025-2026'
            });

            if (classStudents.length > 0) {
                const mergedGrades = classStudents.map((s: any) => {
                    // Reconstruct student record from multiple possible grade entries (diff assessment types)
                    const studentGrades = dbGrades.filter((g: any) => g.student_id === s.id.toString());
                    
                    const row: any = {
                        studentId: s.id,
                        studentName: s.nama,
                        studentNis: s.nis,
                        finalScore: 0, predicate: '-', description: ''
                    };

                    // Map assessment types to row fields
                    studentGrades.forEach((g: any) => {
                        row[g.assessment_type] = g.grade_value;
                    });

                    return row;
                });
                setGradesData(mergedGrades);
            } else {
                setGradesData([]);
            }
        };

        if (classList.length > 0 && subjectList.length > 0) {
            loadGrades();
        }
    }, [selectedClass, selectedMapel, selectedSemester, classList, subjectList, fetchGrades]);

    const saveToStorage = async () => {
        const targetClass = classList.find(c => c.nama === selectedClass);
        const targetSubject = subjectList.find(s => s.name === selectedMapel);

        if (!targetClass || !targetSubject) {
            alert('Gagal memetakan ID Kelas/Mapel. Pastikan data master tersedia.');
            return;
        }

        const records: GradeRecord[] = gradesData.map(row => ({
            studentId: row.studentId.toString(),
            subjectId: targetSubject.id.toString(),
            classId: targetClass.id.toString(),
            academicYearId: 'ay-2025-2026',
            gradeValue: row[tipeNilai] || 0,
            assessmentType: tipeNilai
        }));

        const result = await saveGradesBatch(records);
        if (result.success) {
            alert(`Nilai ${selectedMapel} berhasil disinkronkan ke server!`);
        } else {
            alert(`Gagal sinkronisasi: ${result.error}`);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/20">

                {/* Filter Controls - Modern Card */}
                <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Kelas</label>
                        {isWaliKelas ? (
                            <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700">
                                {selectedClass}
                            </div>
                        ) : (
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                            >
                                {localStorage.getItem('classes_data_v11')
                                    ? JSON.parse(localStorage.getItem('classes_data_v11')!).map((c: any) => (
                                        <option key={c.id} value={c.nama}>{c.nama}</option>
                                    ))
                                    : <option value="">Tidak ada kelas</option>}
                            </select>
                        )}
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Mata Pelajaran</label>
                        <select
                            value={selectedMapel}
                            onChange={(e) => setSelectedMapel(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                        >
                            {localStorage.getItem('subjects_data_v10')
                                ? JSON.parse(localStorage.getItem('subjects_data_v10')!).map((s: any) => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))
                                : ["Matematika", "B. Indonesia", "IPA", "IPS"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Semester</label>
                        <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className="w-full px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 outline-none cursor-pointer appearance-none"
                        >
                            <option>1 (Ganjil)</option>
                            <option>2 (Genap)</option>
                        </select>
                    </div>
                    <div className="flex-[1.5] min-w-[240px]">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Jenis Penilaian</label>
                            <div className="flex gap-1.5">
                                <button onClick={updateTpCount} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="Tambah Ulangan"><Plus size={14} /></button>
                                <button onClick={removeTpCount} className="p-1 hover:bg-rose-50 rounded text-rose-400 transition-colors" title="Hapus Terakhir"><Minus size={14} /></button>
                            </div>
                        </div>
                        <select
                            value={tipeNilai}
                            onChange={(e) => setTipeNilai(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none cursor-pointer appearance-none shadow-lg shadow-slate-200"
                        >
                            {Array.from({ length: tpCount }, (_, i) => (
                                <option key={`tp${i + 1}`} value={`tp${i + 1}`}>
                                    📝 Ulangan {i + 1} (U{i + 1})
                                </option>
                            ))}
                            <option value="pts">📊 PTS (Tengah Semester)</option>
                            <option value="pat">🎓 PAT (Akhir Tahun)</option>
                        </select>
                    </div>
                </div>

                {/* Info Note */}
                <div className="mb-4 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 italic">
                    <Info size={14} className="mt-0.5 shrink-0" />
                    <span>Nilai yang baru diinput akan menghitung rata-rata secara otomatis saat raport dicetak. Klik Simpan Nilai untuk mempermanenkan data.</span>
                </div>

                {/* Grades Table - Mobile Friendly List */}
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
                                                    value={siswa[tipeNilai] || 0}
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

            {/* Footer Footer Action */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md shrink-0 flex items-center justify-center">
                <button
                    onClick={saveToStorage}
                    className="w-full max-w-md bg-indigo-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <Save size={20} />
                    Simpan Perubahan Nilai
                </button>
            </div>
        </div>
    );
};

export default InputNilaiGuru;
