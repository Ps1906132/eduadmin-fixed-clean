// Simple Shared Data Store for Demonstration (Simulating a Backend)

// --- 1. PENGUMUMAN (BROADCAST) ---
export interface Announcement {
    id: number;
    title: string;
    category: string;
    target: string;
    targetClass: string;
    content: string;
    publishDate: string;
    endDate?: string;
    status: 'Draft' | 'Terbit';
    isPinned?: boolean;
    viewers: number;
    attachments?: { type: 'file' | 'link', name: string, url: string }[];
}

export let announcementDataGlobal: Announcement[] = [];

export const updateAnnouncementsGlobal = (newData: Announcement[]) => {
    announcementDataGlobal = newData;
};

// --- 1.2 MULTIMEDIA (STUDIO) ---
export interface Broadcast {
    id: number;
    title: string;
    url: string;
    description: string;
    category: 'Edukasi' | 'Pengumuman' | 'Kegiatan';
    status: 'Draft' | 'Active';
    date: string;
}

export let broadcastsDataGlobal: Broadcast[] = [];

export let multimediaSettingsGlobal = {
    name: '',
    autoplay: true,
    mode: 'manual'
};

export const updateBroadcastsGlobal = (newData: Broadcast[]) => {
    broadcastsDataGlobal = newData;
};

export const updateMultimediaSettingsGlobal = (newSettings: any) => {
    multimediaSettingsGlobal = newSettings;
};

// --- 2. DATA SISWA & ORANG TUA (MASTER) ---
export let studentsDataGlobal: any[] = [
    {
        id: 1,
        nis: "202401001",
        nama: "Aditya Pratama",
        ttl: "Jakarta, 12 Maret 2017",
        kelas: "1A",
        tingkat: 1,
        paralel: "A",
        ayah: "Heri Pratama",
        ibu: "Siti Aminah",
        jobAyah: "Wiraswasta",
        jobIbu: "Ibu Rumah Tangga",
        username: "aditya24",
        gender: "Laki-laki"
    },
    {
        id: 2,
        nis: "202401002",
        nama: "Amanda Lestari",
        ttl: "Bandung, 25 Juni 2017",
        kelas: "1A",
        tingkat: 1,
        paralel: "A",
        ayah: "Yusuf Lestari",
        ibu: "Dewi Sartika",
        jobAyah: "PNS",
        jobIbu: "Guru",
        username: "amanda24",
        gender: "Perempuan"
    },
    {
        id: 3,
        nis: "202401003",
        nama: "Budi Santoso",
        ttl: "Surabaya, 10 Agustus 2017",
        kelas: "1B",
        tingkat: 1,
        paralel: "B",
        ayah: "Joko Santoso",
        ibu: "Rini Astuti",
        jobAyah: "Karyawan Swasta",
        jobIbu: "Wiraswasta",
        username: "budi24",
        gender: "Laki-laki"
    },
    {
        id: 4,
        nis: "202402001",
        nama: "Citra Kirana",
        ttl: "Medan, 05 Februari 2016",
        kelas: "2A",
        tingkat: 2,
        paralel: "A",
        ayah: "Bambang Kirana",
        ibu: "Megawati",
        jobAyah: "TNI",
        jobIbu: "Ibu Rumah Tangga",
        username: "citra24",
        gender: "Perempuan"
    },
    {
        id: 5,
        nis: "202402002",
        nama: "Dedi Wijaya",
        ttl: "Semarang, 19 September 2016",
        kelas: "2B",
        tingkat: 2,
        paralel: "B",
        ayah: "Hendra Wijaya",
        ibu: "Kartika",
        jobAyah: "Dokter",
        jobIbu: "Dokter",
        username: "dedi24",
        gender: "Laki-laki"
    },
    {
        id: 6,
        nis: "202403001",
        nama: "Eka Saputra",
        ttl: "Yogyakarta, 30 November 2015",
        kelas: "3A",
        tingkat: 3,
        paralel: "A",
        ayah: "Supardi",
        ibu: "Sri Wahyuni",
        jobAyah: "Wiraswasta",
        jobIbu: "Pedagang",
        username: "eka24",
        gender: "Laki-laki"
    },
    {
        id: 7,
        nis: "202403002",
        nama: "Farhan Ramadhan",
        ttl: "Makassar, 18 Juni 2015",
        kelas: "3A",
        tingkat: 3,
        paralel: "A",
        ayah: "Ahmad Ramadhan",
        ibu: "Fatmawati",
        jobAyah: "PNS",
        jobIbu: "Ibu Rumah Tangga",
        username: "farhan24",
        gender: "Laki-laki"
    },
    {
        id: 8,
        nis: "202403003",
        nama: "Gita Permata",
        ttl: "Denpasar, 22 April 2015",
        kelas: "3B",
        tingkat: 3,
        paralel: "B",
        ayah: "Wayan Permata",
        ibu: "Ketut Kasih",
        jobAyah: "Karyawan Hotel",
        jobIbu: "Wiraswasta",
        username: "gita24",
        gender: "Perempuan"
    },
    {
        id: 9,
        nis: "202403004",
        nama: "Hadi Kusuma",
        ttl: "Palembang, 09 Januari 2015",
        kelas: "3B",
        tingkat: 3,
        paralel: "B",
        ayah: "Roni Kusuma",
        ibu: "Eliza",
        jobAyah: "Buruh",
        jobIbu: "Ibu Rumah Tangga",
        username: "hadi24",
        gender: "Laki-laki"
    },
    {
        id: 10,
        nis: "202403005",
        nama: "Indah Cahyani",
        ttl: "Balikpapan, 14 Oktober 2015",
        kelas: "3B",
        tingkat: 3,
        paralel: "B",
        ayah: "Gunawan Cahyani",
        ibu: "Marlina",
        jobAyah: "Arsitek",
        jobIbu: "Desainer",
        username: "indah24",
        gender: "Perempuan"
    }
];

export const addStudent = (student: any) => {
    studentsDataGlobal = [...studentsDataGlobal, student];
};

// --- 3. DATA GURU & STAFF (MASTER) ---
export let teachersDataGlobal: any[] = [
    {
        id: 1,
        nama: "Super Admin Demo",
        username: "admin",
        password: "admin123",
        role: "Operator Data",
        jabatan: "Operator Data"
    },
    {
        id: 2,
        nama: "Bpk. Budi (Kurikulum Demo)",
        username: "budikurikulum",
        password: "password123",
        role: "Wakil Kurikulum",
        jabatan: "Wakil Kurikulum"
    },
    {
        id: 3,
        nama: "Ibu Siti (Keuangan Demo)",
        username: "tatausaha",
        password: "password123",
        role: "Staff Tata Usaha",
        jabatan: "Staff Tata Usaha"
    },
    {
        id: 4,
        nama: "Sdr. Andi (Multimedia Demo)",
        username: "adminmultimedia",
        password: "password123",
        role: "multimedia",
        jabatan: "Admin Multimedia"
    }
];

export const addTeacher = (teacher: any) => {
    teachersDataGlobal = [...teachersDataGlobal, teacher];
};

// --- 4. DATA KELAS ---
export let classesDataGlobal: any[] = [
    { id: 1, nama: '1A', tingkat: 1, paralel: 'A' },
    { id: 2, nama: '1B', tingkat: 1, paralel: 'B' },
    { id: 3, nama: '2A', tingkat: 2, paralel: 'A' },
    { id: 4, nama: '2B', tingkat: 2, paralel: 'B' },
    { id: 5, nama: '3A', tingkat: 3, paralel: 'A' },
    { id: 6, nama: '3B', tingkat: 3, paralel: 'B' }
];


// --- 5. DATA KEUANGAN & SPP ---
export let paymentHistoryGlobal: any[] = [];

export const addPayment = (payment: any) => {
    paymentHistoryGlobal = [payment, ...paymentHistoryGlobal];
};

// --- 6. DATA MATA PELAJARAN ---
export let subjectsDataGlobal: any[] = [];

export const initialFinanceDataGlobal = {
    cashAccounts: [
        { id: 1, name: 'Kas Tunai (Bendahara)', type: 'KAS', balance: 0, isPrimary: true, number: '-' },
    ],
    studentBills: [],
    expenses: []
};

// --- 7. IDENTITAS SEKOLAH (GLOBAL CONFIG) ---
export const schoolSettingsGlobal = {
    name: "",
    foundation: "",
    address: "",
    principal: "",
    nipPrincipal: "",
    academicYear: "2025/2026",
    semester: "Ganjil",
    appName: "EduAdmin",
    logo: "",
    icon: ""
};

// --- 8. DATA TABUNGAN (GLOBAL SYNC) ---
export interface SavingsData {
    id: number;
    nis: string;
    nama: string;
    kelas: string;
    saldo: number;
    status: string;
}

export interface SavingsTransaction {
    id: string;
    date: string;
    studentId: string | number;
    studentName: string;
    type: 'Setor' | 'Tarik';
    amount: number;
    officer: string;
}

export let savingsDataGlobal: SavingsData[] = [];

export let savingsTransactionsGlobal: SavingsTransaction[] = [];

export const updateSavingsDataGlobal = (newData: SavingsData[]) => {
    savingsDataGlobal = newData;
};

export const addSavingsTransactionGlobal = (newTrx: SavingsTransaction) => {
    savingsTransactionsGlobal = [newTrx, ...savingsTransactionsGlobal];
};

// --- 9. DATA JADWAL (GLOBAL SYNC) ---
export interface ScheduleItem {
    id: string;
    classId: string;
    day: string;
    period: number;
    subjectId: number | string;
    customName?: string;
}

export interface DailyScheduleInfo {
    classId: string;
    day: string;
    seragam?: string;
    catatan?: string;
}

export interface MasterSchedule {
    id: number;
    name: string;
    status: 'draft' | 'published';
    items: ScheduleItem[];
    dailyInfos?: DailyScheduleInfo[];
}

export interface Period {
    id: number;
    start: string;
    end: string;
}

export let schedulePeriodsGlobal: Period[] = [
    { id: 0, start: '07:00', end: '07:30' },
    { id: 1, start: '07:30', end: '08:30' },
    { id: 2, start: '08:30', end: '09:30' },
    { id: 3, start: '09:30', end: '10:00' },
    { id: 4, start: '10:00', end: '11:00' },
    { id: 5, start: '11:00', end: '12:00' },
    { id: 6, start: '12:30', end: '13:30' },
];

export let schedulesDataGlobal: MasterSchedule[] = [];

export const updateSchedulesDataGlobal = (newData: MasterSchedule[]) => {
    schedulesDataGlobal = newData;
};

// --- 10. DATA UJIAN (GLOBAL SYNC) ---
export interface ExamScheduleItem {
    id: string; // unique
    examId: number; // Foreign Key to MasterExamSchedule
    classId: string; // e.g., '1A', '6B'
    day: string; // 'Senin', 'Selasa', ...
    timeSlotId: number; // Index of time slot
    subjectName: string; // Store name directly for now as per Dashboard logic
    teacherName?: string;
    color?: string; // Visual color
}

export interface MasterExamSchedule {
    id: number;
    type: string; // e.g., 'UTS', 'UAS'
    semester: string; // 'Ganjil', 'Genap'
    year: string; // '2025/2026'
    status: 'draft' | 'published'; // New Status Field
    items: ExamScheduleItem[]; // The actual schedule items
    timeSlots: { id: number; start: string; end: string }[];
    dailyNotes?: Record<string, string>; // Notes per day
}

export let examsDataGlobal: MasterExamSchedule[] = [];

export const updateExamsDataGlobal = (newData: MasterExamSchedule[]) => {
    examsDataGlobal = newData;
};

// --- 11. DATA ABSENSI (GLOBAL SYNC) ---
export interface AttendanceRecord {
    id: string;
    studentId: number;
    studentName: string;
    classId: string;
    date: string;
    status: 'H' | 'S' | 'I' | 'A' | 'Hadir' | 'Sakit' | 'Izin' | 'Alpha';
    time?: string;
    note?: string;
    checked?: boolean;
}

export let attendanceDataGlobal: AttendanceRecord[] = [];

export const updateAttendanceDataGlobal = (newData: AttendanceRecord[]) => {
    attendanceDataGlobal = newData;
};

// --- 12. DATA NILAI (GLOBAL SYNC) ---
export interface GradeRecord {
    id: string; // unique ID
    studentId: number;
    subjectId: number | string; // Assuming subject IDs are numbers, matches 'subjects' list
    classId: string;
    semester: 'Ganjil' | 'Genap';
    type: 'UH1' | 'UH2' | 'UH3' | 'UH4' | 'PTS' | 'PAS' | 'PAT' | 'UTS' | 'UAS'; // Supported types
    score: number;
    note?: string;
}

export let gradesDataGlobal: GradeRecord[] = [];

export const updateGradesDataGlobal = (newData: GradeRecord[]) => {
    gradesDataGlobal = newData;
};

// --- 13. DATA MATERI & LATIHAN (GLOBAL SYNC) ---
export interface MateriItem {
    id: number;
    title: string;
    classId: string;
    subjectName: string;
    driveLink: string;
    publishDate: string;
    status: 'Terbit' | 'Draft';
}

export interface QuestionPG {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
}

export interface QuestionEssay {
    id: number;
    question: string;
    sampleAnswer?: string;
}

export interface LatihanItem {
    id: number;
    title: string;
    classId: string;
    subjectName: string;
    type: 'PG' | 'Essay';
    questions: (QuestionPG | QuestionEssay)[];
    publishDate: string;
    status: 'Terbit' | 'Draft';
}

export let materiDataGlobal: MateriItem[] = [];

export let latihanDataGlobal: LatihanItem[] = [];

export const updateMateriDataGlobal = (newData: MateriItem[]) => {
    materiDataGlobal = newData;
};

export const updateLatihanDataGlobal = (newData: LatihanItem[]) => {
    latihanDataGlobal = newData;
};

// --- 14. DATA BIMBINGAN BELAJAR (GLOBAL SYNC) ---
export interface TutoringSubject {
    id: number;
    name: string;
    classes: string[];
    meetings: number;
    status: string;
}

export interface TutoringTeacher {
    id: number;
    name: string;
    source: string;
    subjectId: string;
    subjectName?: string;
    classId: string;
    scheduleDay: string;
    scheduleStart: string;
    scheduleEnd: string;
    username: string;
    password: string;
    studentsCount: number;
    status: string;
}

export let tutoringSubjectsGlobal: TutoringSubject[] = [];
export let tutoringTeachersGlobal: TutoringTeacher[] = [];

export const updateTutoringSubjectsGlobal = (newData: TutoringSubject[]) => {
    tutoringSubjectsGlobal = newData;
};

export const updateTutoringTeachersGlobal = (newData: TutoringTeacher[]) => {
    tutoringTeachersGlobal = newData;
};
