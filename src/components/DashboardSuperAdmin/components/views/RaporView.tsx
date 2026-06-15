import React, { useState, useRef } from 'react';
import { Printer, User, ArrowLeft } from 'lucide-react';
import { studentsDataGlobal, classesDataGlobal, schoolSettingsGlobal, teachersDataGlobal } from '../../../../data/sharedData';
import { useGrades } from '../../hooks/useGrades';

// Types for the Report Card Data
interface RaporData {
    studentId: number;
    semester: string; // '1 (Ganjil)' or '2 (Genap)'
    year: string;
    sick: number;
    permission: number;
    alpha: number;
    notes: string;
    decision?: string; // e.g., "Naik ke Kelas 2"
}

interface RaporViewProps {
    setActiveView: (view: string) => void;
}

const ERapor: React.FC<RaporViewProps> = ({ setActiveView }) => {
    // --- LOCAL DATABASE STATES ---
    const [classes] = useState<any[]>(() => {
        const saved = localStorage.getItem('classes_data_v11');
        return saved ? JSON.parse(saved) : [];
    });
    const [students] = useState<any[]>(() => {
        const saved = localStorage.getItem('students_data_v11');
        return saved ? JSON.parse(saved) : [];
    });
    const [teachers] = useState<any[]>(() => {
        const saved = localStorage.getItem('teachers_data_v11');
        return saved ? JSON.parse(saved) : [];
    });

    // State
    const [selectedClass, setSelectedClass] = useState(classes.length > 0 ? classes[0].nama : '');
    const [selectedSemester, setSelectedSemester] = useState('1 (Ganjil)');
    const [selectedStudentId, setSelectedStudentId] = useState<number | string>('');
    const [raporType, setRaporType] = useState<'resmi' | 'yayasan'>('resmi');
    const { fetchReportData } = useGrades();
    const [d1ReportData, setD1ReportData] = useState<any>(null);

    React.useEffect(() => {
        if (!selectedStudentId || !selectedClass) return;
        const targetClass = classes.find((c: any) => c.nama === selectedClass);
        if (!targetClass) return;
        fetchReportData(targetClass.id.toString(), selectedStudentId.toString())
            .then(data => { if (data) setD1ReportData(data); })
            .catch(() => {});
    }, [selectedClass, selectedStudentId]);

    // Helper to get dynamic description from Settings (localStorage)
    const getDynamicDesc = (type: 'k' | 's', defaultVal: string) => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mock_descriptions');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    // Use the latest description added in Settings as a demo
                    if (data.length > 0) {
                        const latest = data[data.length - 1];
                        return type === 'k' ? latest.knowledge : latest.skill;
                    }
                } catch (e) { console.error('Error parsing mock_descriptions', e); }
            }
        }
        return defaultVal;
    };

    // --- REAL DATA INTEGRATION ---
    const getRealReportData = () => {
        const student = students.find(s => s.id === selectedStudentId);
        if (!student) return null;

        const subjectListRaw = localStorage.getItem('subjects_data_v10');
        const subjectsData = subjectListRaw ? JSON.parse(subjectListRaw) : [];

        const subjectsWithGrades = subjectsData.map((sub: any) => {
            const storageKey = `grades_v2_${selectedClass}_${sub.name}_${selectedSemester}`;
            const savedGrades = localStorage.getItem(storageKey);
            let k_nilai = 0;
            let predikat = 'D';
            let desc = '-';

            if (savedGrades) {
                try {
                    const parsed = JSON.parse(savedGrades);
                    const record = parsed.find((g: any) => g.studentId === selectedStudentId);
                    if (record) {
                        k_nilai = record.finalScore || 0;
                        predikat = record.predicate || 'D';
                        desc = record.description || '-';
                    }
                } catch (e) {
                    console.error("Error building report for " + sub.name, e);
                }
            }

            return {
                id: sub.id,
                name: sub.name,
                k_nilai: k_nilai,
                k_predikat: predikat,
                k_desc: desc,
                s_nilai: k_nilai, // Simplified: mirrors knowledge for now
                s_predikat: predikat,
                s_desc: desc
            };
        });

        // Pull Supplementary Data (from Wali Kelas)
        const suppKey = `rapor_supp_${selectedClass}_${selectedStudentId}_${selectedSemester}`;
        const savedSupp = localStorage.getItem(suppKey);
        const supp = savedSupp ? JSON.parse(savedSupp) : {
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
            note: "Pertahankan prestasimu dan tingkatkan belajarmu."
        };
        if (d1ReportData) Object.assign(supp, d1ReportData);

        return {
            schoolName: schoolSettingsGlobal.name,
            schoolAddress: schoolSettingsGlobal.address,
            studentName: student.nama,
            nis: student.nis,
            nisn: student.nisn || "0012345678",
            class: selectedClass,
            semester: selectedSemester,
            year: schoolSettingsGlobal.academicYear || "2025/2026",
            subjects: subjectsWithGrades,
            attitudes: supp.attitudes,
            extracurriculars: supp.extracurriculars,
            attendance: supp.attendance,
            personalities: supp.personalities,
            summary: {
                total: subjectsWithGrades.reduce((acc: number, s: any) => acc + s.k_nilai, 0),
                average: subjectsWithGrades.length > 0 ? (subjectsWithGrades.reduce((acc: number, s: any) => acc + s.k_nilai, 0) / subjectsWithGrades.length).toFixed(1) : 0,
                final: subjectsWithGrades.length > 0 && (subjectsWithGrades.reduce((acc: number, s: any) => acc + s.k_nilai, 0) / subjectsWithGrades.length) >= 75 ? "A" : "B"
            },
            decision: selectedSemester.includes('Genap') ? `NAIK KE KELAS: ${parseInt(selectedClass) + 1} (${(parseInt(selectedClass) + 1).toString()})` : "",
            date: "20 Desember 2025",
            note: supp.note
        };
    };

    const reportData = getRealReportData() || {
        studentName: "Pilih Siswa",
        nis: "-",
        nisn: "-",
        class: "-",
        semester: "1",
        year: "-",
        schoolName: "-",
        schoolAddress: "-",
        subjects: [],
        attitudes: [],
        extracurriculars: [],
        personalities: [],
        attendance: { sakit: 0, izin: 0, alpha: 0 },
        summary: { total: 0, average: 0, final: "-" },
        decision: "-",
        date: "-",
        note: ""
    };

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = componentRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            const printArea = printContent.outerHTML;

            // Create a temporary iframe for printing to avoid messing up the main DOM
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(`
                    <html>
                        <head>
                            <title>Cetak Rapor</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                                @media print {
                                    @page { size: A4; margin: 10mm; }
                                    body { -webkit-print-color-adjust: exact; font-family: 'Times New Roman', serif; }
                                    .print-break-inside-avoid { page-break-inside: avoid; }
                                }
                                body { font-family: 'Times New Roman', serif; }
                                table { border-collapse: collapse; width: 100%; }
                                th, td { border: 1px solid black; padding: 4px; font-size: 11pt; }
                                .no-border { border: none !important; }
                                .header-text { font-family: Arial, sans-serif; }
                            </style>
                        </head>
                        <body class="p-4">
                            ${printArea}
                        </body>
                    </html>
                `);
                doc.close();

                // Wait for styles/images to load then print
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    // document.body.removeChild(iframe); // Optional: remove after print
                }, 500);
            }
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in">
            {/* HEADER & CONTROLS */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                                <Printer size={24} className="text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Cetak E-Rapor</h2>
                                <p className="text-slate-500 text-sm font-medium">Pilih siswa dan jenis rapor untuk dicetak.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                            <div className="px-3 border-r border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Semester</label>
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer"
                                >
                                    <option value="1 (Ganjil)" className="text-slate-800">1 (Ganjil)</option>
                                    <option value="2 (Genap)" className="text-slate-800">2 (Genap)</option>
                                </select>
                            </div>
                            <div className="px-3 border-r border-slate-200">
                                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Kelas</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="bg-transparent font-bold text-slate-700 outline-none text-sm cursor-pointer"
                                >
                                    {classes.map(c => (
                                        <option key={c.id} value={c.nama} className="text-slate-800">{c.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="px-3">
                                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Siswa</label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                                    className="bg-transparent font-bold text-emerald-600 outline-none text-sm min-w-[150px] cursor-pointer"
                                >
                                    <option value="" className="text-slate-800">-- Pilih Siswa --</option>
                                    {students
                                        .filter(s => s.kelas === selectedClass)
                                        .map(s => (
                                            <option key={s.id} value={s.id} className="text-slate-800">{s.nama}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Type Tabs */}
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                            {[
                                { id: 'resmi', label: 'Rapor Resmi' },
                                { id: 'yayasan', label: 'Rapor Yayasan' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setRaporType(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${raporType === tab.id
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                        >
                            <Printer size={18} />
                            Cetak / PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* --- PREVIEW AREA --- */}
            <div className="flex-1 bg-slate-200/50 rounded-[2.5rem] p-8 overflow-y-auto flex justify-center custom-scrollbar">

                {/* --- A4 PAPER --- */}
                <div
                    ref={componentRef}
                    className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-xl text-black"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="font-bold text-lg uppercase header-text" style={{ fontFamily: 'Arial, sans-serif' }}>
                            {raporType === 'resmi' ? 'LAPORAN HASIL BELAJAR PESERTA DIDIK' : 'RAPOR HASIL BELAJAR (YAYASAN)'}
                        </h1>
                    </div>

                    {/* Student Info */}
                    <div className="flex justify-between mb-6 text-[11pt]">
                        <table className="w-full border-none">
                            <tbody>
                                <tr className="border-none">
                                    <td className="w-[150px] border-none py-1 align-top">Nama Peserta Didik</td>
                                    <td className="w-[10px] border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top font-bold">{reportData.studentName}</td>

                                    <td className="w-[50px] border-none"></td>

                                    <td className="w-[120px] border-none py-1 align-top">Kelas</td>
                                    <td className="w-[10px] border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top">{reportData.class}</td>
                                </tr>
                                <tr className="border-none">
                                    <td className="border-none py-1 align-top">NIS / NISN</td>
                                    <td className="border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top">{reportData.nis} / {reportData.nisn}</td>

                                    <td className="border-none"></td>

                                    <td className="border-none py-1 align-top">Semester</td>
                                    <td className="border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top">{reportData.semester}</td>
                                </tr>
                                <tr className="border-none">
                                    <td className="border-none py-1 align-top">Nama Sekolah</td>
                                    <td className="border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top">{reportData.schoolName}</td>

                                    <td className="border-none"></td>

                                    <td className="border-none py-1 align-top">Tahun Pelajaran</td>
                                    <td className="border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top">{reportData.year}</td>
                                </tr>
                                <tr className="border-none">
                                    <td className="border-none py-1 align-top">Alamat Sekolah</td>
                                    <td className="border-none py-1 align-top">:</td>
                                    <td className="border-none py-1 align-top" colSpan={5}>{reportData.schoolAddress}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* A. Sikap */}
                    <div className="mb-4">
                        <h3 className="font-bold text-[11pt] mb-1">A. Sikap</h3>
                        <table className="w-full border border-black">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-black p-1 text-center font-bold" colSpan={2}>Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.attitudes.map((att: { name?: string; description?: string; grade?: string; type?: string; desc?: string; [key: string]: unknown }, idx: number) => (
                                    <tr key={idx}>
                                        <td className="border border-black p-2 align-top w-[150px] font-bold indent-2">{idx + 1}. {att.type}</td>
                                        <td className="border border-black p-2 align-top text-justify min-h-[50px]">
                                            {att.desc}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* B. Pengetahuan dan keterampilan */}
                    <div className="mb-4">
                        <h3 className="font-bold text-[11pt] mb-1">B. Pengetahuan dan keterampilan</h3>
                        <table className="w-full border border-black text-[10pt]">
                            <thead className="bg-gray-100 text-center font-bold">
                                <tr>
                                    <th rowSpan={2} className="w-[30px]">No</th>
                                    <th rowSpan={2} className="w-[200px]">Muatan Pelajaran</th>
                                    <th colSpan={3}>Pengetahuan</th>
                                    <th colSpan={3}>Keterampilan</th>
                                </tr>
                                <tr>
                                    <th className="w-[40px]">Nilai</th>
                                    <th className="w-[40px]">Predikat</th>
                                    <th>Deskripsi</th>
                                    <th className="w-[40px]">Nilai</th>
                                    <th className="w-[40px]">Predikat</th>
                                    <th>Deskripsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.subjects.map((sub: { name?: string; kkm?: number; score?: number; predicate?: string; description?: string; k_nilai?: number; k_predikat?: string; k_desc?: string; s_nilai?: number; s_predikat?: string; s_desc?: string; [key: string]: unknown }, idx: number) => (
                                    <tr key={idx}>
                                        <td className="text-center align-middle">{idx + 1}</td>
                                        <td className="p-1 align-middle">{sub.name}</td>

                                        {/* Pengetahuan */}
                                        <td className="text-center align-middle">{sub.k_nilai}</td>
                                        <td className="text-center align-middle">{sub.k_predikat}</td>
                                        <td className="text-xs p-1 align-middle text-justify">{sub.k_desc}</td>

                                        {/* Keterampilan */}
                                        <td className="text-center align-middle">{sub.s_nilai}</td>
                                        <td className="text-center align-middle">{sub.s_predikat}</td>
                                        <td className="text-xs p-1 align-middle text-justify">{sub.s_desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* C. Ekstrakurikuler */}
                    <div className="mb-4 print-break-inside-avoid">
                        <h3 className="font-bold text-[11pt] mb-1">C. Ekstrakurikuler</h3>
                        <table className="w-full border border-black text-[10pt]">
                            <thead className="bg-gray-100 text-center font-bold">
                                <tr>
                                    <th className="w-[30px]">No</th>
                                    <th>Kegiatan Ekstrakurikuler</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.extracurriculars.map((ekskul: { name?: string; predicate?: string; description?: string; desc?: string; [key: string]: unknown }, idx: number) => (
                                    <tr key={idx}>
                                        <td className="text-center p-1">{idx + 1}</td>
                                        <td className="p-1 font-medium">{ekskul.name}</td>
                                        <td className="p-1">{ekskul.desc}</td>
                                    </tr>
                                ))}
                                {/* Empty row if needed */}
                                <tr>
                                    <td className="text-center p-1">&nbsp;</td>
                                    <td className="p-1"></td>
                                    <td className="p-1"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* D. Ketidakhadiran */}
                    <div className="mb-4 print-break-inside-avoid">
                        <h3 className="font-bold text-[11pt] mb-1">D. Ketidakhadiran</h3>
                        <table className="w-full border border-black text-[10pt]">
                            <thead className="bg-gray-100 text-center font-bold">
                                <tr>
                                    <th className="w-[30px]">No</th>
                                    <th>Aspek yang dinilai</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center p-1">1</td>
                                    <td className="p-1">Sakit</td>
                                    <td className="text-center p-1">{reportData.attendance.sakit} hari</td>
                                </tr>
                                <tr>
                                    <td className="text-center p-1">2</td>
                                    <td className="p-1">Izin</td>
                                    <td className="text-center p-1">{reportData.attendance.izin} hari</td>
                                </tr>
                                <tr>
                                    <td className="text-center p-1">3</td>
                                    <td className="p-1">Tanpa Keterangan</td>
                                    <td className="text-center p-1">{reportData.attendance.alpha} hari</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* E. Pribadian */}
                    <div className="mb-4 print-break-inside-avoid">
                        <h3 className="font-bold text-[11pt] mb-1">E. Pribadian</h3>
                        <table className="w-full border border-black text-[10pt]">
                            <thead className="bg-gray-100 text-center font-bold">
                                <tr>
                                    <th className="w-[30px]">No</th>
                                    <th>Aspek yang dinilai</th>
                                    <th>Keterangan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.personalities.map((item: { name?: string; description?: string; aspect?: string; desc?: string; [key: string]: unknown }, idx: number) => (
                                    <tr key={idx}>
                                        <td className="text-center p-1">{idx + 1}</td>
                                        <td className="p-1">{item.aspect}</td>
                                        <td className="p-1">{item.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* F. Nilai (Ringkasan) */}
                    {/* Based on image, it looks like a summary table */}
                    <div className="mb-6 print-break-inside-avoid">
                        <h3 className="font-bold text-[11pt] mb-1">F. Nilai</h3>
                        <table className="w-full border border-black text-[10pt]">
                            <thead className="bg-gray-100 text-center font-bold">
                                <tr>
                                    <th className="w-[30px]">No</th>
                                    <th>Jumlah</th>
                                    <th>Rata-rata</th>
                                    <th>Nilai akhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center p-2">1</td>
                                    <td className="text-center p-2 font-bold">{reportData.summary.total}</td>
                                    <td className="text-center p-2 font-bold">{reportData.summary.average}</td>
                                    <td className="text-center p-2 font-bold">{reportData.summary.final}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* KEPUTUSAN */}
                    {/* KEPUTUSAN - Only show in Even Semester */}
                    {selectedSemester.includes('Genap') && (
                        <div className="flex gap-0 mb-8 border border-black print-break-inside-avoid">
                            <div className="w-[150px] border-r border-black p-3 font-bold flex items-center justify-center">
                                Keputusan
                            </div>
                            <div className="flex-1 p-3">
                                <p className="text-sm">Berdasarkan hasil yang dicapai pada semester ini, peserta didik ditetapkan :</p>
                                <p className="font-bold uppercase text-lg mt-1">{reportData.decision}</p>
                            </div>
                        </div>
                    )}

                    {/* FOOTER & SIGNATURES */}
                    <div className="text-[11pt] print-break-inside-avoid">
                        <div className="flex justify-end mb-8">
                            <div className="text-left w-[250px]">
                                <p>Di berikan di : Jakarta</p>
                                <p>Tanggal : {reportData.date}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-start text-center">
                            <div className="w-[200px]">
                                <p className="mb-20">Orang Tua / Wali Siswa</p>
                                <p className="font-bold border-b border-black border-dotted inline-block min-w-[150px]"></p>
                            </div>

                            <div className="w-[200px]">
                                <p className="mb-20">Kepala Sekolah</p>
                                <p className="font-bold underline uppercase">{schoolSettingsGlobal.principal || "H. AHMAD FULAN, M.Pd"}</p>
                                <p>NIP. {schoolSettingsGlobal.nipPrincipal || "19800101 200501 1 001"}</p>
                            </div>

                            <div className="w-[200px]">
                                <p className="mb-20">Wali Kelas</p>
                                <p className="font-bold underline uppercase">
                                    {classes.find(c => c.nama === selectedClass)?.wali || "SITI AMINAH, S.Pd"}
                                </p>
                                <p>NIP/NKTAM. {
                                    teachers.find(t => t.nama === (classes.find(c => c.nama === selectedClass)?.wali))?.nip || "-"
                                }</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ERapor;
