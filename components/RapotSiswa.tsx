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

    // Standard subjects list matching NilaiView
    const subjectList = [
        "Pendidikan Agama", "Pendidikan Pancasila", "Bahasa Indonesia",
        "Matematika", "IPAS", "Seni Budaya", "PJOK", "Bahasa Inggris"
    ];

    const [subjects, setSubjects] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // Supplementary Data State
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
        decision: "Naik Ke Kelas" // Default decision
    });

    // Load Grades and Supplementary Data
    useEffect(() => {
        const studentId = user?.studentId || user?.id || 4; // Mock student if needed for testing
        const currentSemesterFull = selectedSemester === 'Semester 1' ? '1 (Ganjil)' : '2 (Genap)';

        // 1. Load Grades
        const loadGrades = () => {
            const loadedSubjects: any[] = [];
            subjectList.forEach((subj, index) => {
                const key = `grades_v2_${selectedClass}_${subj}_${currentSemesterFull}`;
                const localData = localStorage.getItem(key);
                let daily = 0, exam = 0, report = 0;

                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        const studentRow = parsed.find((s: any) => s.studentName === user?.studentName || s.studentName === user?.nama);
                        if (studentRow) {
                            daily = studentRow.avgSumatif || 0;
                            exam = Math.max(studentRow.pas || 0, studentRow.pat || 0, studentRow.ujisn || 0);
                            report = studentRow.finalScore || 0;
                        }
                    } catch (e) { console.error("Error parsing grades", e); }
                }
                loadedSubjects.push({ id: index + 1, name: subj, daily, exam, report });
            });
            setSubjects(loadedSubjects);
        };

        // 2. Load Supplementary Data (The Pipeline Hook)
        const loadSupp = () => {
            const suppKey = `rapor_supp_${selectedClass}_${studentId}_${currentSemesterFull}`;
            const saved = localStorage.getItem(suppKey);
            if (saved) {
                setSuppData(JSON.parse(saved));
            } else {
                // Reset to default if no data
                setSuppData({
                    attitudes: [
                        { id: 1, type: "Spiritual", desc: "Ananda sangat taat beribadah dan berperilaku jujur." },
                        { id: 2, type: "Sosial", desc: "Ananda memiliki sikap sosial yang baik dan disiplin." }
                    ],
                    extracurriculars: [{ id: 1, name: "-", desc: "-" }],
                    attendance: { sakit: 0, izin: 0, alpha: 0 },
                    personalities: [
                        { aspect: "Kerapihan", desc: "Baik" },
                        { aspect: "Kedisiplinan", desc: "Baik" },
                        { aspect: "Kesehatan", desc: "Sehat" },
                    ],
                    note: "Pertahankan prestasimu dan tingkatkan belajarmu.",
                    decision: "Naik Ke Kelas"
                });
            }
        };

        loadGrades();
        loadSupp();
    }, [selectedClass, selectedSemester, user]);

    const handleSaveSupp = () => {
        const studentId = user?.studentId || user?.id || 4;
        const currentSemesterFull = selectedSemester === 'Semester 1' ? '1 (Ganjil)' : '2 (Genap)';
        const suppKey = `rapor_supp_${selectedClass}_${studentId}_${currentSemesterFull}`;

        localStorage.setItem(suppKey, JSON.stringify(suppData));
        setIsEditing(false);
        alert("Data pelengkap rapor berhasil disimpan!");
    };

    // Calculate Averages
    const averageDaily = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.daily, 0) / subjects.length) : 0;
    const averageExam = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.exam, 0) / subjects.length) : 0;
    const averageReport = subjects.length > 0 ? Math.round(subjects.reduce((acc, curr) => acc + curr.report, 0) / subjects.length) : 0;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">Nilai Rapot Persemester</h3>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                    >
                        Kelola Data
                    </button>
                )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {/* RAPOT TABS (Diknas / Yayasan) */}
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2 flex-1">
                        <label className="text-slate-600 font-bold whitespace-nowrap">Kelas</label>
                        <div className="relative w-full">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="">- Pilih Kelas -</option>
                                {classes && classes.map((c: any) => (
                                    <option key={c.id} value={c.nama}>{c.nama}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        <label className="text-slate-600 font-bold whitespace-nowrap">Semester</label>
                        <div className="relative w-full">
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2 px-4 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option>Semester 1</option>
                                <option>Semester 2</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Subject List - Only show in View Mode */}
                {!isEditing && (
                    <div className="space-y-3 pb-20">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="border border-slate-300 rounded-2xl p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5">Mata pelajaran</p>
                                        <h4 className="font-bold text-slate-800 text-sm">{subject.id}. {subject.name}</h4>
                                        <p className="text-[10px] text-slate-500">{subject.teacher}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-6 mt-1 text-center">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5">Nilai Harian</p>
                                        <p className="text-sm font-bold text-slate-800">{subject.daily}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5">Ujian</p>
                                        <p className="text-sm font-bold text-slate-800">{subject.exam}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold mb-0.5">Rapot</p>
                                        <p className="text-sm font-extrabold text-slate-900">{subject.report}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Mode: Supplementary Data Management */}
                {isEditing && (
                    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom duration-300">
                        {/* 1. SIKAP */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">A</span>
                                Pengisian Sikap
                            </h4>
                            <div className="space-y-4">
                                {suppData.attitudes.map((att, idx) => (
                                    <div key={idx}>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Deskripsi {att.type}</label>
                                        <textarea
                                            value={att.desc}
                                            onChange={(e) => {
                                                const newAtt = [...suppData.attitudes];
                                                newAtt[idx].desc = e.target.value;
                                                setSuppData({ ...suppData, attitudes: newAtt });
                                            }}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-all h-20"
                                            placeholder={`Tulis deskripsi sikap ${att.type.toLowerCase()}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. EKSTRAKURIKULER */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs">B</span>
                                    Ekstrakurikuler
                                </h4>
                                <button
                                    onClick={() => setSuppData({ ...suppData, extracurriculars: [...suppData.extracurriculars, { id: Date.now(), name: '', desc: '' }] })}
                                    className="text-[10px] font-bold text-emerald-600 uppercase hover:underline"
                                >
                                    + Tambah
                                </button>
                            </div>
                            <div className="space-y-3">
                                {suppData.extracurriculars.map((eks, idx) => (
                                    <div key={eks.id} className="flex gap-2">
                                        <input
                                            value={eks.name}
                                            onChange={(e) => {
                                                const newEks = [...suppData.extracurriculars];
                                                newEks[idx].name = e.target.value;
                                                setSuppData({ ...suppData, extracurriculars: newEks });
                                            }}
                                            placeholder="Nama Ekskul"
                                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                                        />
                                        <input
                                            value={eks.desc}
                                            onChange={(e) => {
                                                const newEks = [...suppData.extracurriculars];
                                                newEks[idx].desc = e.target.value;
                                                setSuppData({ ...suppData, extracurriculars: newEks });
                                            }}
                                            placeholder="Keterangan/Predikat"
                                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. ABSENSI */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-orange-600 text-white rounded-lg flex items-center justify-center text-xs">C</span>
                                Rekap Ketidakhadiran
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                                {(['sakit', 'izin', 'alpha'] as const).map(type => (
                                    <div key={type}>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase text-center block mb-1">{type}</label>
                                        <input
                                            type="number"
                                            value={suppData.attendance[type]}
                                            onChange={(e) => setSuppData({ ...suppData, attendance: { ...suppData.attendance, [type]: parseInt(e.target.value) || 0 } })}
                                            className="w-full p-2.5 text-center bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. CATATAN WALI KELAS */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xs">D</span>
                                Catatan Wali Kelas
                            </h4>
                            <textarea
                                value={suppData.note}
                                onChange={(e) => setSuppData({ ...suppData, note: e.target.value })}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-purple-500 outline-none transition-all h-24"
                                placeholder="Write notes for parents..."
                            />
                        </div>

                        {/* 5. KEPUTUSAN KENAIKAN/KELULUSAN */}
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">E</span>
                                Keputusan Kenaikan/Kelulusan
                            </h4>
                            <select
                                value={suppData.decision}
                                onChange={(e) => setSuppData({ ...suppData, decision: e.target.value })}
                                className="w-full p-3 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-700 focus:border-blue-500 outline-none appearance-none"
                            >
                                <option value="Naik Ke Kelas">Naik Ke Kelas</option>
                                <option value="Tinggal Di Kelas">Tinggal Di Kelas</option>
                                <option value="Lulus">Lulus (Untuk Kelas 6)</option>
                                <option value="Tidak Lulus">Tidak Lulus (Untuk Kelas 6)</option>
                            </select>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 font-bold rounded-2xl">Batal</button>
                            <button onClick={handleSaveSupp} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100">Simpan Perubahan</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Average */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
                <div className="border border-slate-300 rounded-2xl p-4 bg-white flex items-center justify-between shadow-sm">
                    <span className="font-bold text-slate-800 text-sm">Nilai Rata-Rata</span>
                    <div className="flex gap-6 text-center">
                        <div className="w-12">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Nilai Harian</p>
                            <p className="text-sm font-bold text-slate-800">{averageDaily}</p>
                        </div>
                        <div className="w-10">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Ujian</p>
                            <p className="text-sm font-bold text-slate-800">{averageExam}</p>
                        </div>
                        <div className="w-10">
                            <p className="text-[10px] text-slate-500 font-bold mb-0.5">Rapot</p>
                            <p className="text-sm font-extrabold text-slate-900">{averageReport}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RapotSiswa;
