import React from 'react';
import { ScrollText, Printer, FileText, Download, School, BookOpen, X, ArrowLeft, Home } from 'lucide-react';

interface RapotProps {
    studentsData: any;
    gradesData: any;
    attendanceData: any;

    schoolSettings: {
        name: string;
        address: string;
        accreditation: string;
        principal: string;
        academicYear: string;
    };
}

import { useGrades } from './DashboardSuperAdmin/hooks/useGrades';
import { toast } from 'react-hot-toast';

const Rapot: React.FC<RapotProps> = ({
    studentsData,
    gradesData,
    attendanceData,
    schoolSettings
}) => {
    const { fetchReportData, saveReportData, loading: syncing } = useGrades();

    // Navigation & Selection Logic
    const [selectedReportType, setSelectedReportType] = React.useState<string | null>(null);
    const [selectedStudentNIS, setSelectedStudentNIS] = React.useState<string>('');
    const [selectedClassRaw, setSelectedClassRaw] = React.useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [isPrinting, setIsPrinting] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<'manage' | 'print'>('print'); // 'print' is default
    const [manageMode, setManageMode] = React.useState<'dinas' | 'yayasan'>('dinas'); // Toggle for input mode

    // Local state for Report Data (Sikap, Ekstra, Absen, Note, etc.)
    const [reportData, setReportData] = React.useState<any>({});

    // Fetch data from server when student is selected
    React.useEffect(() => {
        const loadReportData = async () => {
            if (!selectedStudentNIS || !selectedClassRaw) return;

            const student = getStudentData(selectedStudentNIS);
            const classesRaw = localStorage.getItem('classes_data_v11');
            const classes = classesRaw ? JSON.parse(classesRaw) : [];
            const targetClass = classes.find((c: any) => c.nama === selectedClassRaw);

            if (student && targetClass) {
                const data = await fetchReportData(targetClass.id.toString(), student.id.toString());
                if (data) {
                    setReportData((prev: any) => ({
                        ...prev,
                        [selectedStudentNIS]: data
                    }));
                }
            }
        };
        loadReportData();
    }, [selectedStudentNIS, selectedClassRaw]);

    const handleSaveReportToCloud = async () => {
        if (!selectedStudentNIS || !selectedClassRaw) return;

        const student = getStudentData(selectedStudentNIS);
        const classesRaw = localStorage.getItem('classes_data_v11');
        const classes = classesRaw ? JSON.parse(classesRaw) : [];
        const targetClass = classes.find((c: any) => c.nama === selectedClassRaw);

        if (student && targetClass) {
            const res = await saveReportData(
                targetClass.id.toString(), 
                student.id.toString(), 
                reportData[selectedStudentNIS] || {}
            );
            if (res.success) {
                toast.success('Data Rapot berhasil disinkronkan ke server!');
            } else {
                toast.error('Gagal sinkronisasi data rapot: ' + res.error);
            }
        }
    };

    const handleReportDataChange = (nis: string, field: string, value: any) => {
        setReportData((prev: any) => ({
            ...prev,
            [nis]: {
                ...prev[nis],
                [field]: value
            }
        }));
    };

    // Description Bank State
    const [descriptionBank, setDescriptionBank] = React.useState<string[]>([
        "Ananda sangat baik dalam memahami materi yang diajarkan.",
        "Mampu mengikuti pembelajaran dengan baik dan aktif di kelas.",
        "Perlu lebih teliti dalam mengerjakan tugas harian.",
        "Menunjukkan peningkatan motivasi belajar yang signifikan.",
        "Memiliki sikap sopan santun dan disiplin yang baik.",
        "Perlu bimbingan lebih lanjut dalam materi hafalan.",
        "Sangat antusias dalam kegiatan praktik dan diskusi."
    ]);
    const [isBankModalOpen, setIsBankModalOpen] = React.useState(false);
    const [activeBankTarget, setActiveBankTarget] = React.useState<string | null>(null);

    // Helpers to get data

    // Helpers to get data
    const getStudentData = (nis: string) => {
        // Find in all classes... simpler if we have selectedClassRaw
        const studentList = studentsData[selectedClassRaw] || [];
        return studentList.find((s: any) => s.nis === nis);
    };

    // Calculate Attendance Helper
    const calculateAttendance = (nis: string) => {
        let s = 0, i = 0, a = 0;
        if (!attendanceData) return { s, i, a };

        Object.values(attendanceData).forEach((dailyRecord: any) => {
            const status = dailyRecord[nis];
            if (status === 'S') s++;
            if (status === 'I') i++;
            if (status === 'A') a++;
        });
        return { s, i, a };
    };

    // Print Handler
    const handlePrint = () => {
        window.print();
    };

    // Render Report Card Template (A4)
    const renderReportTemplate = (nis: string) => {
        const student = getStudentData(nis);
        if (!student) return <div className="p-8 text-center text-red-500">Data siswa tidak ditemukan</div>;

        const calculatedAbsen = calculateAttendance(nis);
        const data = reportData[nis] || {
            sikap: null,
            ekstra: [],
            absen: { ...calculatedAbsen }, // Default to calculated
            pribadian: { kelakuan: "Baik", kerajinan: "Baik", kerapian: "Baik" },
            tahfidz: { ziyadah: '', murajaah: '', predikat: '' },
            catatan: ""
        };

        // Ensure absen falls back to calculated if reportData exists but absen is partial/missing
        if (reportData[nis] && !reportData[nis].absen) {
            data.absen = calculatedAbsen;
        } else if (reportData[nis] && reportData[nis].absen) {
            // If manual values are 0, we might want to default to calculated? 
            // But maybe 0 is valid. Let's assume manual overrides completely.
            // However, to be "sinkron", we might want to default to calculation if user hasn't explicitly set them?
            // Since we don't track "touched", let's trust reportData if strictly present.
            // But for safer sync, we can just use calculated if keys are missing.
            data.absen = {
                sakit: reportData[nis].absen.sakit ?? calculatedAbsen.s,
                izin: reportData[nis].absen.izin ?? calculatedAbsen.i,
                alfa: reportData[nis].absen.alfa ?? calculatedAbsen.a
            };
        }

        const isYayasanReport = selectedReportType?.toLowerCase().includes('lembaga') || selectedReportType?.toLowerCase().includes('yayasan');

        return (
            <div className="bg-white mx-auto print:mx-0 print:w-full print:shadow-none shadow-2xl min-h-[29.7cm] w-[21cm] p-[1.5cm] text-[12px] font-serif leading-tight relative">
                {/* Header Yayasan */}
                <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                    <h2 className="text-2xl font-black uppercase font-sans mt-1">{schoolSettings.name}</h2>
                    <p className="text-xs font-medium mt-1">{schoolSettings.address}</p>
                    <p className="text-xs font-bold uppercase mt-1">Terakreditasi {schoolSettings.accreditation}</p>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold uppercase">LAPORAN HASIL BELAJAR PESERTA DIDIK</h3>
                </div>

                {/* Identity Table & Info */}
                <div className="flex justify-between mb-4">
                    <div className="w-[55%]">
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-32 py-1">Nama Peserta didik</td><td className="w-2">:</td><td className="font-bold">{student.nama}</td></tr>
                                <tr><td className="py-1">NIS / NISN</td><td>:</td><td>{student.nis} / {student.nisn || '-'}</td></tr>
                                <tr><td className="py-1">Nama Sekolah</td><td>:</td><td>{schoolSettings.name}</td></tr>
                                <tr><td className="py-1">Alamat Sekolah</td><td>:</td><td>{schoolSettings.address}</td></tr>

                            </tbody>
                        </table>
                    </div>
                    <div className="w-[40%]">
                        <table className="w-full">
                            <tbody>
                                <tr><td className="w-28 py-1">Kelas</td><td className="w-2">:</td><td className="font-bold">{selectedClassRaw.replace('Kelas ', '')}</td></tr>
                                <tr><td className="py-1">Semester</td><td>:</td><td>Genap</td></tr>
                                <tr><td className="py-1">Tahun Pelajaran</td><td>:</td><td>2024 / 2025</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* A. Sikap */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'A. Kompetensi Sikap & Kepribadian' : 'A. Sikap'}</h4>
                    <table className="w-full border-collapse border border-black">
                        <tbody>
                            <tr>
                                <td className="border border-black px-2 py-1 w-full align-top">
                                    <div className="w-full border-b border-black text-center text-[10px] bg-slate-100/50 py-1">Deskripsi</div>
                                    <div className="p-2 italic text-slate-700 whitespace-pre-wrap text-left min-h-[50px]">
                                        {data.sikap || "(Belum ada deskripsi sikap)"}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Tahfidz Section (Only for Yayasan Report) */}
                {isYayasanReport && (
                    <div className="mb-4">
                        <h4 className="font-bold mb-1">B. Program Tahfidz Al-Qur'an</h4>
                        <table className="w-full border-collapse border border-black">
                            <thead>
                                <tr className="bg-slate-100/50">
                                    <th className="border border-black px-2 py-1 text-center w-1/3">Ziyadah (Hafalan Baru)</th>
                                    <th className="border border-black px-2 py-1 text-center w-1/3">Muraja'ah (Mengulang)</th>
                                    <th className="border border-black px-2 py-1 text-center w-1/3">Predikat</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black px-2 py-4 h-16 text-center align-middle whitespace-pre-wrap">{data.tahfidz?.ziyadah || '-'}</td>
                                    <td className="border border-black px-2 py-4 h-16 text-center align-middle whitespace-pre-wrap">{data.tahfidz?.murajaah || '-'}</td>
                                    <td className="border border-black px-2 py-4 h-16 text-center align-middle font-bold">{data.tahfidz?.predikat || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* B. Pengetahuan dan Keterampilan (or C if Yayasan) */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'C. Pengetahuan dan Keterampilan' : 'B. Pengetahuan dan Keterampilan'}</h4>
                    <table className="w-full border-collapse border border-black text-[11px]">
                        <thead>
                            <tr className="bg-slate-100/50">
                                <th rowSpan={2} className="border border-black px-1 py-1 w-6">No</th>
                                <th rowSpan={2} className="border border-black px-2 py-1 text-left">Muatan Pelajaran</th>
                                <th colSpan={3} className="border border-black px-1 py-1">Pengetahuan</th>
                                <th colSpan={3} className="border border-black px-1 py-1">Keterampilan</th>
                            </tr>
                            <tr className="bg-slate-100/50">
                                <th className="border border-black px-1 py-1 w-8">Nilai</th>
                                <th className="border border-black px-1 py-1 w-12">Predikat</th>
                                <th className="border border-black px-2 py-1">Deskripsi</th>
                                <th className="border border-black px-1 py-1 w-8">Nilai</th>
                                <th className="border border-black px-1 py-1 w-12">Predikat</th>
                                <th className="border border-black px-2 py-1">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(gradesData[selectedClassRaw] || {}).map((subj, idx) => {
                                const score = parseInt(gradesData[selectedClassRaw]?.[subj]?.[nis] || '0') || 0;
                                const predikat = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';
                                const descP = data[`mapel_${subj}_pengetahuan`] || "-";
                                const descK = data[`mapel_${subj}_keterampilan`] || "-";

                                return (
                                    <tr key={idx}>
                                        <td className="border border-black text-center py-2">{idx + 1}</td>
                                        <td className="border border-black px-2 py-2">{subj}</td>

                                        {/* Pengetahuan */}
                                        <td className="border border-black text-center font-bold">{score || '-'}</td>
                                        <td className="border border-black text-center">{score ? predikat : '-'}</td>
                                        <td className="border border-black px-2 py-1 text-[10px] leading-tight">{descP}</td>

                                        {/* Keterampilan (Mock logic for now: same score - 2) */}
                                        <td className="border border-black text-center font-bold">{score ? score - 2 : '-'}</td>
                                        <td className="border border-black text-center">{score ? predikat : '-'}</td>
                                        <td className="border border-black px-2 py-1 text-[10px] leading-tight">{descK}</td>
                                    </tr>
                                );
                            })}
                            {Object.keys(gradesData[selectedClassRaw] || {}).length === 0 && (
                                <tr>
                                    <td colSpan={8} className="border border-black text-center py-4 italic text-slate-500">
                                        Belum ada data nilai mata pelajaran.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* C. Ekstrakurikuler */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'D. Ekstrakurikuler' : 'C. Ekstrakurikuler'}</h4>
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-slate-100/50">
                                <th className="border border-black px-1 py-1 w-6">No</th>
                                <th className="border border-black px-2 py-1 text-left w-[40%]">Kegiatan Ekstrakurikuler</th>
                                <th className="border border-black px-2 py-1 text-left">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.ekstra || []).length > 0 ? (data.ekstra.map((eks: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="border border-black text-center py-1">{idx + 1}</td>
                                    <td className="border border-black px-2 py-1">{eks.name}</td>
                                    <td className="border border-black px-2 py-1">{eks.predikat}</td>
                                </tr>
                            ))) : (
                                <tr>
                                    <td className="border border-black text-center py-1">1</td>
                                    <td className="border border-black px-2 py-1">-</td>
                                    <td className="border border-black px-2 py-1">-</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* D. Ketidak Hadiran */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'E. Ketidak Hadiran' : 'D. Ketidak Hadiran'}</h4>
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-slate-100/50">
                                <th className="border border-black px-1 py-1 w-6">No</th>
                                <th className="border border-black px-2 py-1 text-left w-[40%]">Aspek yang dinilai</th>
                                <th className="border border-black px-2 py-1 text-left">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black text-center py-1">1</td>
                                <td className="border border-black px-2 py-1">Sakit</td>
                                <td className="border border-black px-2 py-1">{data.absen?.sakit || 0} Hari</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center py-1">2</td>
                                <td className="border border-black px-2 py-1">Izin</td>
                                <td className="border border-black px-2 py-1">{data.absen?.izin || 0} Hari</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center py-1">3</td>
                                <td className="border border-black px-2 py-1">Tanpa Keterangan</td>
                                <td className="border border-black px-2 py-1">{data.absen?.alfa || 0} Hari</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Catatan Wali Kelas */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">Catatan Wali Kelas</h4>
                    <div className="border border-black p-2 min-h-[60px] italic text-sm">
                        {data.catatan || "Tidak ada catatan."}
                    </div>
                </div>

                {/* E. Pribadian */}
                <div className="mb-4">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'F. Pribadian' : 'E. Pribadian'}</h4>
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr className="bg-slate-100/50">
                                <th className="border border-black px-1 py-1 w-6">No</th>
                                <th className="border border-black px-2 py-1 text-left w-[40%]">Aspek yang dinilai</th>
                                <th className="border border-black px-2 py-1 text-left">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black text-center py-1">1</td>
                                <td className="border border-black px-2 py-1">Kelakuan</td>
                                <td className="border border-black px-2 py-1">{data.pribadian?.kelakuan || 'Baik'}</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center py-1">2</td>
                                <td className="border border-black px-2 py-1">Kerajinan</td>
                                <td className="border border-black px-2 py-1">{data.pribadian?.kerajinan || 'Baik'}</td>
                            </tr>
                            <tr>
                                <td className="border border-black text-center py-1">3</td>
                                <td className="border border-black px-2 py-1">Kerapian</td>
                                <td className="border border-black px-2 py-1">{data.pribadian?.kerapian || 'Baik'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* F. Nilai & Keputusan */}
                <div className="mb-8">
                    <h4 className="font-bold mb-1">{isYayasanReport ? 'G. Nilai' : 'F. Nilai'}</h4>
                    <table className="w-full border-collapse border border-black mb-4">
                        <thead>
                            <tr className="bg-slate-100/50">
                                <th className="border border-black px-1 py-1 w-6">No</th>
                                <th className="border border-black px-2 py-1 text-center">Jumlah</th>
                                <th className="border border-black px-2 py-1 text-center">Rata-rata</th>
                                <th className="border border-black px-2 py-1 text-center">Nilai akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Calculate Total and Average */}
                            {(() => {
                                const scores = Object.values(gradesData[selectedClassRaw] || {})
                                    .map((subjData: any) => parseInt(subjData[nis] || '0') || 0)
                                    .filter(s => s > 0);
                                const total = scores.reduce((a, b) => a + b, 0);
                                const avg = scores.length > 0 ? (total / scores.length).toFixed(1) : 0;

                                return (
                                    <tr>
                                        <td className="border border-black text-center py-1">1</td>
                                        <td className="border border-black px-2 py-1 text-center">{total}</td>
                                        <td className="border border-black px-2 py-1 text-center">{avg}</td>
                                        <td className="border border-black px-2 py-1 text-center font-bold">{avg}</td>
                                    </tr>
                                );
                            })()}
                        </tbody>
                    </table>

                    {/* Keputusan Box */}
                    <div className="border border-black p-1 flex">
                        <div className="w-32 py-1 px-2 border-r border-black font-bold">Keputusan</div>
                        <div className="flex-1 py-1 px-2">
                            Berdasarkan hasil yang dicapai, Peserta didik ditetapkan: <span className="font-bold">Naik ke Kelas {selectedClassRaw ? (parseInt(selectedClassRaw.replace(/\D/g, '')) + 1) : '...'}</span>
                        </div>
                    </div>

                </div>


                {/* Signatures */}
                <div className="mt-8 px-8 avoid-break">
                    <div className="flex justify-end mb-6 text-right">
                        <div className="text-left inline-block w-1/3">
                            <table className="text-sm font-serif w-full">
                                <tbody>
                                    <tr>
                                        <td className="pr-2">Di berikan di</td>
                                        <td className="pr-1">:</td>
                                        <td>Samarinda</td>
                                    </tr>
                                    <tr>
                                        <td>Tanggal</td>
                                        <td>:</td>
                                        <td>20 Juni 2025</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between items-end text-center">
                        {/* Column 1: Orang Tua */}
                        <div className="flex flex-col items-center w-1/3">
                            <p className="mb-24">Orang Tua / Wali Siswa</p>
                            <p className="font-bold border-b border-black inline-block min-w-[150px]"></p>
                        </div>

                        {/* Column 2: Kepala Sekolah */}
                        <div className="flex flex-col items-center w-1/3">
                            <p className="mb-24">Kepala Sekolah</p>
                            <div className="flex flex-col items-center">
                                <p className="font-bold border-b border-black inline-block min-w-[150px]">{schoolSettings.principal}</p>
                                <p className="text-xs mt-1 text-left w-full pl-4">NIP. ........................................</p>
                            </div>
                        </div>

                        {/* Column 3: Wali Kelas */}
                        <div className="flex flex-col items-center w-1/3">
                            <p className="mb-24">Wali Kelas</p>
                            <div className="flex flex-col items-center">
                                <p className="font-bold border-b border-black inline-block min-w-[150px]">{selectedStudentNIS ? 'Nama Wali Kelas' : '.....................'}</p>
                                <p className="text-xs mt-1 text-left w-full pl-4">NIP/NKTAM. ...........................</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div >
        );
    };
    const rapotCategories = [
        {
            title: "Rapot Negara (Dinas)",
            description: "Format rapot sesuai standar pendidikan nasional (Kurikulum Merdeka/K13).",
            icon: <School size={24} />,
            colorTheme: "blue",
            items: [
                { name: "Rapot Tengah Semester 1", type: "UTS Ganjil" },
                { name: "Rapot Akhir Semester 1", type: "UAS Ganjil" },
                { name: "Rapot Tengah Semester 2", type: "UTS Genap" },
                { name: "Rapot Akhir Semester 2", type: "UAS Genap" },
            ]
        },
        {
            title: "Rapot Lembaga (Yayasan)",
            description: "Format rapot khusus internal sekolah/pesantren (Tahfidz, Akhlak, Kitab).",
            icon: <BookOpen size={24} />,
            colorTheme: "emerald",
            items: [
                { name: "Rapot Lembaga Tengah Sem. 1", type: "Internal Ganjil" },
                { name: "Rapot Lembaga Akhir Sem. 1", type: "Internal Ganjil" },
                { name: "Rapot Lembaga Tengah Sem. 2", type: "Internal Genap" },
                { name: "Rapot Lembaga Akhir Sem. 2", type: "Internal Genap" },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-slate-800 border-b border-slate-200 pb-4">
                <ScrollText size={32} className="text-[#004AAD]" />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Cetak & Kelola Rapot</h2>
                    <p className="text-slate-500">
                        Data Terintegrasi:
                        <span className="ml-2 font-mono text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md mb-2">
                            {Object.keys(gradesData).length} Data Nilai
                        </span>
                    </p>
                </div>
            </div>



            {/* Navigation Tabs */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex-1 p-4 rounded-xl text-center font-bold text-lg transition-all border ${activeTab === 'manage' ? 'bg-[#004AAD] text-white border-[#004AAD] shadow-lg scale-[1.01]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    Kelola Data Rapot
                </button>
                <button
                    onClick={() => setActiveTab('print')}
                    className={`flex-1 p-4 rounded-xl text-center font-bold text-lg transition-all border ${activeTab === 'print' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-[1.01]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                >
                    Cetak Rapot
                </button>
            </div>

            {/* Manage View */}
            {
                activeTab === 'manage' && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <FileText className="text-[#004AAD]" /> Input Data Pelengkap Rapot
                        </h3>

                        {/* Input Mode Toggle - Modern Segmented Control */}
                        <div className="flex justify-center mb-10">
                            <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex relative shadow-inner">
                                <button
                                    onClick={() => setManageMode('dinas')}
                                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${manageMode === 'dinas'
                                        ? 'bg-white text-[#004AAD] shadow-md scale-100'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Format Dinas (Umum)
                                </button>
                                <button
                                    onClick={() => setManageMode('yayasan')}
                                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${manageMode === 'yayasan'
                                        ? 'bg-emerald-500 text-white shadow-md scale-100'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Format Yayasan (Lembaga)
                                </button>
                            </div>
                        </div>

                        {/* Class & Student Selector - Elegant Card */}
                        <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">1</span>
                                Pilih Data Siswa
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kelas</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none font-medium text-slate-700 hover:border-blue-300"
                                            value={selectedClassRaw}
                                            onChange={e => {
                                                setSelectedClassRaw(e.target.value);
                                                setSelectedStudentNIS('');
                                            }}
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            {Object.keys(studentsData).map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Siswa</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none font-medium text-slate-700 hover:border-blue-300 disabled:bg-slate-50 disabled:text-slate-400"
                                            value={selectedStudentNIS}
                                            onChange={e => setSelectedStudentNIS(e.target.value)}
                                            disabled={!selectedClassRaw}
                                        >
                                            <option value="">-- Pilih Siswa --</option>
                                            {(studentsData[selectedClassRaw] || []).map((s: any) => (
                                                <option key={s.nis} value={s.nis}>{s.nama}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedStudentNIS ? (
                            <div className="space-y-10">

                                {/* 1. Tahfidz Input Section - ONLY VISIBLE IN YAYASAN MODE */}
                                {manageMode === 'yayasan' && (
                                    <div className="bg-white rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-100/50 overflow-hidden animate-in slide-in-from-top-4 duration-500">
                                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white"><BookOpen size={20} /></div>
                                            <h4 className="text-lg font-bold text-white tracking-wide">Program Tahfidz Al-Qur'an</h4>
                                        </div>
                                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-slate-600">Ziyadah (Hafalan Baru)</label>
                                                <textarea
                                                    className="w-full h-32 p-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                                    placeholder="Contoh: Jus 30 (An-Naba s/d Al-Inshiqaq)"
                                                    value={reportData[selectedStudentNIS]?.tahfidz?.ziyadah || ''}
                                                    onChange={(e) => handleReportDataChange(selectedStudentNIS, 'tahfidz', { ...reportData[selectedStudentNIS]?.tahfidz, ziyadah: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-slate-600">Muraja'ah (Mengulang)</label>
                                                <textarea
                                                    className="w-full h-32 p-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                                    placeholder="Contoh: Juz 29 & 30 Lancar"
                                                    value={reportData[selectedStudentNIS]?.tahfidz?.murajaah || ''}
                                                    onChange={(e) => handleReportDataChange(selectedStudentNIS, 'tahfidz', { ...reportData[selectedStudentNIS]?.tahfidz, murajaah: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-sm font-bold text-slate-600">Predikat</label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white appearance-none font-medium"
                                                        value={reportData[selectedStudentNIS]?.tahfidz?.predikat || 'Baik'}
                                                        onChange={(e) => handleReportDataChange(selectedStudentNIS, 'tahfidz', { ...reportData[selectedStudentNIS]?.tahfidz, predikat: e.target.value })}
                                                    >
                                                        <option value="Sangat Baik">Sangat Baik (Mumtaz)</option>
                                                        <option value="Baik">Baik (Jayyid)</option>
                                                        <option value="Cukup">Cukup (Maqbul)</option>
                                                        <option value="Kurang">Kurang (Rasib)</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Kompetensi Sikap */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">A</span>
                                            Kompetensi Sikap
                                        </h4>
                                        <button
                                            onClick={() => {
                                                setActiveBankTarget('sikap');
                                                setIsBankModalOpen(true);
                                            }}
                                            className="text-xs bg-white text-blue-600 px-4 py-2 rounded-xl border border-blue-100 font-bold hover:bg-blue-50 transition-colors shadow-sm"
                                        >
                                            + Bank Deskripsi
                                        </button>
                                    </div>
                                    <div className="p-8">
                                        <label className="block text-sm font-bold text-slate-600 mb-3">Deskripsi Sikap (Spiritual & Sosial)</label>
                                        <textarea
                                            className="w-full h-32 p-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 leading-relaxed"
                                            placeholder="Contoh: Ananda sangat baik dalam ketaatan beribadah, berdoa sebelum dan sesudah melakukan kegiatan, serta memiliki sikap toleransi yang tinggi..."
                                            value={reportData[selectedStudentNIS]?.sikap || ''}
                                            onChange={(e) => handleReportDataChange(selectedStudentNIS, 'sikap', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* 3. Pengetahuan & Keterampilan */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">B</span>
                                            Pengetahuan dan Keterampilan
                                        </h4>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        {Object.keys(gradesData[selectedClassRaw] || {}).length > 0 ? Object.keys(gradesData[selectedClassRaw] || {}).map((subj, idx) => (
                                            <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-colors">
                                                <h4 className="font-bold text-base text-slate-800 mb-4 border-b border-slate-200 pb-2 flex justify-between items-center">
                                                    <span>{subj}</span>
                                                    <span className="text-xs font-normal text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">Mata Pelajaran</span>
                                                </h4>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengetahuan</label>
                                                            <button onClick={() => { setActiveBankTarget(`mapel_${subj}_pengetahuan`); setIsBankModalOpen(true); }} className="text-[10px] text-blue-600 hover:underline font-bold">+ Isi Otomatis</button>
                                                        </div>
                                                        <textarea
                                                            placeholder="Deskripsi pencapaian pengetahuan..."
                                                            className="w-full h-24 p-3 border border-slate-200 bg-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                            value={reportData[selectedStudentNIS]?.[`mapel_${subj}_pengetahuan`] || ''}
                                                            onChange={e => handleReportDataChange(selectedStudentNIS, `mapel_${subj}_pengetahuan`, e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keterampilan</label>
                                                            <button onClick={() => { setActiveBankTarget(`mapel_${subj}_keterampilan`); setIsBankModalOpen(true); }} className="text-[10px] text-blue-600 hover:underline font-bold">+ Isi Otomatis</button>
                                                        </div>
                                                        <textarea
                                                            placeholder="Deskripsi pencapaian keterampilan..."
                                                            className="w-full h-24 p-3 border border-slate-200 bg-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                            value={reportData[selectedStudentNIS]?.[`mapel_${subj}_keterampilan`] || ''}
                                                            onChange={e => handleReportDataChange(selectedStudentNIS, `mapel_${subj}_keterampilan`, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                                <p className="text-slate-400 font-medium">Belum ada data mata pelajaran.</p>
                                                <p className="text-xs text-slate-400 mt-1">Pastikan Anda telah menginput nilai siswa di menu "Input Nilai & Absen".</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Ekstrakurikuler */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">C</span>
                                            Ekstrakurikuler
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const newEkstra = [...(reportData[selectedStudentNIS]?.ekstra || []), { name: '', predikat: '' }];
                                                handleReportDataChange(selectedStudentNIS, 'ekstra', newEkstra);
                                            }}
                                            className="text-xs bg-[#004AAD] text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
                                        >
                                            + Tambah Kegiatan
                                        </button>
                                    </div>
                                    <div className="p-8 space-y-4">
                                        {(reportData[selectedStudentNIS]?.ekstra || [{ name: '', predikat: '' }]).map((eks: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-start animate-in slide-in-from-left duration-300">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1">Nama Kegiatan</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Misal: Pramuka, Futsal, Drumband..."
                                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        value={eks.name}
                                                        onChange={e => {
                                                            const newEkstra = [...(reportData[selectedStudentNIS]?.ekstra || [{ name: '', predikat: '' }])];
                                                            newEkstra[idx].name = e.target.value;
                                                            handleReportDataChange(selectedStudentNIS, 'ekstra', newEkstra);
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-xs font-bold text-slate-400 ml-1">Keterangan / Predikat</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Misal: Sangat Baik, Aktif..."
                                                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        value={eks.predikat}
                                                        onChange={e => {
                                                            const newEkstra = [...(reportData[selectedStudentNIS]?.ekstra || [{ name: '', predikat: '' }])];
                                                            newEkstra[idx].predikat = e.target.value;
                                                            handleReportDataChange(selectedStudentNIS, 'ekstra', newEkstra);
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newEkstra = [...(reportData[selectedStudentNIS]?.ekstra || [])];
                                                        newEkstra.splice(idx, 1);
                                                        handleReportDataChange(selectedStudentNIS, 'ekstra', newEkstra);
                                                    }}
                                                    className="mt-6 p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        {(!reportData[selectedStudentNIS]?.ekstra || reportData[selectedStudentNIS]?.ekstra.length === 0) && (
                                            <p className="text-center text-slate-400 text-sm py-4 italic">Belum ada kegiatan ekstrakurikuler yang ditambahkan.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Wrapper for Absen & Personality */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {/* 5. Ketidakhadiran */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">D</span>
                                                Ketidakhadiran
                                            </h4>
                                        </div>
                                        <div className="p-8 flex items-center justify-center flex-1">
                                            <div className="grid grid-cols-3 gap-6 w-full">
                                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                                                    <label className="block text-xs font-black text-orange-400 uppercase tracking-wider mb-2">Sakit</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-center text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-700 p-0"
                                                        placeholder={calculateAttendance(selectedStudentNIS).s.toString()}
                                                        value={reportData[selectedStudentNIS]?.absen?.sakit !== undefined ? reportData[selectedStudentNIS].absen.sakit : ''}
                                                        onChange={e => handleReportDataChange(selectedStudentNIS, 'absen', { ...reportData[selectedStudentNIS]?.absen, sakit: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                    />
                                                    <span className="text-[10px] text-orange-400 font-bold mt-1 block">HARI</span>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                                                    <label className="block text-xs font-black text-blue-400 uppercase tracking-wider mb-2">Izin</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-center text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-700 p-0"
                                                        placeholder={calculateAttendance(selectedStudentNIS).i.toString()}
                                                        value={reportData[selectedStudentNIS]?.absen?.izin !== undefined ? reportData[selectedStudentNIS].absen.izin : ''}
                                                        onChange={e => handleReportDataChange(selectedStudentNIS, 'absen', { ...reportData[selectedStudentNIS]?.absen, izin: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                    />
                                                    <span className="text-[10px] text-blue-400 font-bold mt-1 block">HARI</span>
                                                </div>
                                                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                                                    <label className="block text-xs font-black text-rose-400 uppercase tracking-wider mb-2">Alfa</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-center text-2xl font-black bg-transparent border-none focus:ring-0 text-slate-700 p-0"
                                                        placeholder={calculateAttendance(selectedStudentNIS).a.toString()}
                                                        value={reportData[selectedStudentNIS]?.absen?.alfa !== undefined ? reportData[selectedStudentNIS].absen.alfa : ''}
                                                        onChange={e => handleReportDataChange(selectedStudentNIS, 'absen', { ...reportData[selectedStudentNIS]?.absen, alfa: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                    />
                                                    <span className="text-[10px] text-rose-400 font-bold mt-1 block">HARI</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-8 pb-4 text-center">
                                            <p className="text-xs text-slate-400">Angka placeholder (abu-abu) adalah hitungan otomatis dari sistem.</p>
                                        </div>
                                    </div>

                                    {/* 6. Kepribadian */}
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                                        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                                            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">E</span>
                                                Kepribadian
                                            </h4>
                                        </div>
                                        <div className="p-8 space-y-6 flex-1">
                                            {['Kelakuan', 'Kerajinan', 'Kerapian'].map((trait) => (
                                                <div key={trait} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                                    <label className="font-bold text-slate-600">{trait}</label>
                                                    <div className="relative w-48">
                                                        <select
                                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none text-center"
                                                            value={reportData[selectedStudentNIS]?.pribadian?.[trait.toLowerCase()] || 'Baik'}
                                                            onChange={e => handleReportDataChange(selectedStudentNIS, 'pribadian', { ...reportData[selectedStudentNIS]?.pribadian, [trait.toLowerCase()]: e.target.value })}
                                                        >
                                                            <option value="Sangat Baik">Sangat Baik</option>
                                                            <option value="Baik">Baik</option>
                                                            <option value="Cukup">Cukup</option>
                                                            <option value="Kurang">Kurang</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 7. Catatan Wali Kelas */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">F</span>
                                            Catatan Wali Kelas
                                        </h4>
                                    </div>
                                    <div className="p-8">
                                        <textarea
                                            className="w-full h-32 p-4 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 leading-relaxed font-serif"
                                            placeholder="Tuliskan catatan perkembangan, motivasi, atau hal yang perlu diperhatikan orang tua..."
                                            value={reportData[selectedStudentNIS]?.catatan || ''}
                                            onChange={(e) => handleReportDataChange(selectedStudentNIS, 'catatan', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Floating Save Button for Manage View */}
                                <div className="flex justify-center pt-6">
                                    <button
                                        onClick={handleSaveReportToCloud}
                                        disabled={syncing}
                                        className="w-full max-w-md bg-emerald-600 text-white py-4 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save size={24} />
                                        {syncing ? 'Menyinkronkan...' : 'Simpan Data Rapot ke Cloud'}
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <School size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 mb-1">Mulai Kelola Rapot</h3>
                                <p className="text-slate-400 max-w-sm mx-auto">Silakan pilih <span className="font-bold text-slate-500">Kelas</span> dan <span className="font-bold text-slate-500">Siswa</span> pada panel di atas untuk mulai mengisi data rapot.</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Print View (Existing Grid) */}
            {
                activeTab === 'print' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
                        {rapotCategories.map((cat, idx) => {
                            // Safe Tailwind Classes
                            const isBlue = cat.colorTheme === 'blue';
                            const bgHeader = isBlue ? 'bg-gradient-to-r from-blue-50 to-white' : 'bg-gradient-to-r from-emerald-50 to-white';
                            const textTitle = isBlue ? 'text-blue-800' : 'text-emerald-800';
                            const iconBg = isBlue ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600';
                            const borderHover = isBlue ? 'hover:border-blue-300 hover:shadow-blue-100' : 'hover:border-emerald-300 hover:shadow-emerald-100';

                            return (
                                <div key={idx} className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-md transition-all duration-300`}>
                                    <div className={`p-8 border-b border-slate-100 ${bgHeader} flex items-start gap-5`}>
                                        <div className={`p-4 rounded-2xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            {React.cloneElement(cat.icon as any, { size: 28 })}
                                        </div>
                                        <div>
                                            <h3 className={`text-2xl font-black ${textTitle} tracking-tight`}>{cat.title}</h3>
                                            <p className="text-slate-500 mt-2 text-sm leading-relaxed">{cat.description}</p>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col gap-4">
                                        {cat.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className={`flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50/50 ${borderHover} transition-all group/item`}>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-lg group-hover/item:text-slate-900 transition-colors">{item.name}</span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">{item.type}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            // Auto-select first available student for preview convenience if none selected
                                                            const classes = Object.keys(studentsData);
                                                            if (!selectedClassRaw && classes.length > 0) {
                                                                const cls = classes[0];
                                                                setSelectedClassRaw(cls);
                                                                const st = studentsData[cls]?.[0];
                                                                if (st) setSelectedStudentNIS(st.nis);
                                                            }
                                                            setSelectedReportType(item.name);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-white hover:bg-[#004AAD] rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                                                        title="Preview & Cetak"
                                                    >
                                                        <FileText size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 ${activeTab === 'print' ? '' : 'hidden'}`}>
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600 mt-1">
                    <ScrollText size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-800">Perbedaan Format</h4>
                    <ul className="text-amber-700 mt-2 text-sm space-y-1 list-disc list-inside">
                        <li><strong>Rapot Negara:</strong> Mengikuti standar Dapodik/Nasional. Fokus pada mapel umum.</li>
                        <li><strong>Rapot Lembaga:</strong> Mengikuti standar Yayasan. Fokus pada mapel Diniyah, Tahfidz, dan Akhlak.</li>
                    </ul>
                </div>
            </div>


            {/* Preview Modal */}
            {
                isPreviewOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm print:hidden"
                            onClick={() => {
                                setIsPreviewOpen(false);
                                setSelectedReportType(null);
                                setSelectedStudentNIS('');
                            }}
                        />
                        {/* Modal Container */}
                        <div className="fixed inset-0 z-[9999] flex items-start justify-center pointer-events-none p-4 print:p-0 print:bg-white overflow-y-auto">
                            <div 
                                className="bg-slate-100 w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col print:hidden animate-in zoom-in-95 duration-200 my-8 mt-20 pointer-events-auto shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                            {/* Modal Header */}
                            <div className="p-5 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center shadow-md z-10 gap-4 sm:gap-0 sticky top-0">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            setSelectedReportType(null);
                                            setSelectedStudentNIS('');
                                        }}
                                        className="p-2.5 bg-[#004AAD] hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-md"
                                        title="Kembali ke Tampilan Awal"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-600/30">
                                        <FileText size={20} />
                                    </div>
                                    <div className="border-l border-slate-200 pl-4 h-10 flex items-center gap-4">
                                        <h3 className="font-black text-lg text-slate-800 whitespace-nowrap">{selectedReportType}</h3>
                                        {/* Simple Class/Student Selector for now */}
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <select
                                                    className="p-2 pr-8 border border-slate-200 bg-slate-50 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 hover:bg-white hover:border-blue-300 transition-all outline-none appearance-none cursor-pointer min-w-[120px]"
                                                    value={selectedClassRaw}
                                                    onChange={e => {
                                                        const newClass = e.target.value;
                                                        setSelectedClassRaw(newClass);
                                                        const firstStudent = studentsData[newClass]?.[0];
                                                        if (firstStudent) setSelectedStudentNIS(firstStudent.nis);
                                                    }}
                                                >
                                                    {Object.keys(studentsData).map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    className="p-2 pr-8 border border-slate-200 bg-slate-50 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 hover:bg-white hover:border-blue-300 transition-all outline-none appearance-none cursor-pointer min-w-[180px]"
                                                    value={selectedStudentNIS}
                                                    onChange={e => setSelectedStudentNIS(e.target.value)}
                                                >
                                                    {(studentsData[selectedClassRaw] || []).map((s: any) => (
                                                        <option key={s.nis} value={s.nis}>{s.nama}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto items-center">
                                    <button 
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            setSelectedReportType(null);
                                            setSelectedStudentNIS('');
                                        }}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 hover:text-slate-800 transition-colors flex items-center gap-2"
                                    >
                                        <Home size={18} /> Kembali
                                    </button>
                                    <button onClick={handlePrint} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#004AAD] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                                        <Printer size={18} /> Cetak / PDF
                                    </button>
                                    {/* Close Button (X) */}
                                    <button
                                        onClick={() => {
                                            setIsPreviewOpen(false);
                                            setSelectedReportType(null);
                                            setSelectedStudentNIS('');
                                        }}
                                        className="p-2.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                                        title="Tutup Modal"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body - Scrollable Preview */}
                            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200/50 min-h-0">
                                {selectedStudentNIS ? renderReportTemplate(selectedStudentNIS) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <School size={48} className="text-slate-300 mb-4" />
                                        <p className="text-slate-500 font-medium">Silakan pilih siswa untuk melihat preview rapor</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Print Only View */}
                        <div className="hidden print:block w-full h-full bg-white print:absolute print:inset-0 print:z-[9999]">
                            {selectedStudentNIS ? renderReportTemplate(selectedStudentNIS) : null}
                        </div>
                        </div>
                    </>
                )
            }

            {/* Bank Deskripsi Modal */}
            {
                isBankModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Bank Deskripsi</h3>
                                <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-2 overflow-y-auto max-h-[60vh] space-y-1">
                                {descriptionBank.map((desc, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (activeBankTarget && selectedStudentNIS) {
                                                handleReportDataChange(selectedStudentNIS, activeBankTarget, desc);
                                            }
                                            setIsBankModalOpen(false);
                                        }}
                                        className="w-full text-left p-3 hover:bg-blue-50 rounded-lg text-sm text-slate-700 border-b border-slate-50 last:border-0 transition-colors"
                                    >
                                        {desc}
                                    </button>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                <button className="text-xs font-bold text-[#004AAD] hover:underline">+ Tambah Deskripsi Baru</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Rapot;
