import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, GraduationCap, School, CreditCard,
    Bell, Settings, ChevronRight, Search, MoreHorizontal,
    Calendar, BookOpen, FileText, BarChart2, Plus, Edit, Trash2,
    UploadCloud, FolderPlus, UserPlus, Download, Save, SquarePen, Eye, X, Award, Star, AlertTriangle,
    Zap, UserCheck, Info, ClipboardList, RotateCcw, ChevronLeft, ChevronDown, CheckSquare,
    File as FileIcon, Files as FilesIcon, Upload as UploadIcon, GripVertical, Shirt, Clock,
    Archive, Printer, Lock, PieChart, CheckCircle, TrendingDown, History, Video, List,
    UserCog, Megaphone, CirclePlus, Book, TrendingUp, Wallet, ArrowUpCircle, BookHeart
} from 'lucide-react';

import { studentsDataGlobal, teachersDataGlobal, classesDataGlobal, schedulesDataGlobal, updateSchedulesDataGlobal, examsDataGlobal, updateExamsDataGlobal, MasterExamSchedule, ExamScheduleItem, attendanceDataGlobal, updateAttendanceDataGlobal, AttendanceRecord, gradesDataGlobal, updateGradesDataGlobal, GradeRecord, tutoringSubjectsGlobal, updateTutoringSubjectsGlobal, tutoringTeachersGlobal, updateTutoringTeachersGlobal, schedulePeriodsGlobal } from '../data/sharedData';
import { toast, Toaster } from 'react-hot-toast';
import { hashPassword } from '../utils/auth';
import Sidebar from './DashboardSuperAdmin/components/Sidebar';
import ProtectedModule from './ProtectedModule';
import { ScheduleItem, Period, MasterSchedule, DailyScheduleInfo, DAYS } from './DashboardSuperAdmin/types';
import DashboardHome from './DashboardSuperAdmin/components/views/DashboardHome';
import GuruStaffView from './DashboardSuperAdmin/components/views/GuruStaffView';
import TeacherDataView from './DashboardSuperAdmin/components/views/TeacherDataView';
import JabatanView from './DashboardSuperAdmin/components/views/JabatanView';
import MataPelajaranView from './DashboardSuperAdmin/components/views/MataPelajaranView';
import AddSaverModal from './DashboardSuperAdmin/components/modals/AddSaverModal';
import AddExamModal from './DashboardSuperAdmin/components/modals/AddExamModal';
import ExamUniformModal from './DashboardSuperAdmin/components/modals/ExamUniformModal';
import AddExamTimeModal from './DashboardSuperAdmin/components/modals/AddExamTimeModal';

import AddBankModal from './DashboardSuperAdmin/components/modals/AddBankModal';
import AddPaymentTypeModal from './DashboardSuperAdmin/components/modals/AddPaymentTypeModal';
import EditPaymentTypeModal from './DashboardSuperAdmin/components/modals/EditPaymentTypeModal';
import EditYearModal from './DashboardSuperAdmin/components/modals/EditYearModal';

import ExamNoteModal from './DashboardSuperAdmin/components/modals/ExamNoteModal';
import ManageTutoringStudentsModal from './DashboardSuperAdmin/components/modals/ManageTutoringStudentsModal';
import KeuanganView from './DashboardSuperAdmin/components/views/KeuanganView';
import PengumumanView from './DashboardSuperAdmin/components/views/PengumumanView';
import MultimediaView from './DashboardSuperAdmin/components/views/MultimediaView';
import LaporanView from './DashboardSuperAdmin/components/views/LaporanView';
import RaporView from './DashboardSuperAdmin/components/views/RaporView';
import RaporSettingsView from './DashboardSuperAdmin/components/views/RaporSettingsView';
import CetakKartuLoginView from './DashboardSuperAdmin/components/views/CetakKartuLoginView';
import NilaiView from './DashboardSuperAdmin/components/views/NilaiView';
import DataSiswaView from './DashboardSuperAdmin/components/views/DataSiswaView';
import UploadSiswaView from './DashboardSuperAdmin/components/views/UploadSiswaView';
import UploadPerKelasView from './DashboardSuperAdmin/components/views/UploadPerKelasView';
import UploadKelasSatuView from './DashboardSuperAdmin/components/views/UploadKelasSatuView';
import TambahKelasView from './DashboardSuperAdmin/components/views/TambahKelasView';
import JadwalPelajaranView from './DashboardSuperAdmin/components/views/JadwalPelajaranView';
import AbsensiView from './DashboardSuperAdmin/components/views/AbsensiView';

import SettingsView from './DashboardSuperAdmin/components/views/SettingsView';
import AIManagementView from './DashboardSuperAdmin/components/views/AIManagementView';
import RapotDashboardView from './DashboardSuperAdmin/components/views/RapotDashboardView';
import TabunganView from './DashboardSuperAdmin/components/views/TabunganView';
import NaikKelasView from './DashboardSuperAdmin/components/views/NaikKelasView';
import BimbinganBelajarView from './DashboardSuperAdmin/components/views/BimbinganBelajarView';
import { useStudents } from './DashboardSuperAdmin/hooks/useStudents';
import { useTeachers } from './DashboardSuperAdmin/hooks/useTeachers';
import { useClasses } from './DashboardSuperAdmin/hooks/useClasses';
import { useSubjects } from './DashboardSuperAdmin/hooks/useSubjects';
import { useSavings } from './DashboardSuperAdmin/hooks/useSavings';
import { useSchedules } from './DashboardSuperAdmin/hooks/useSchedules';
import { useExams } from './DashboardSuperAdmin/hooks/useExams';

interface SuperAdminProps {
    user: any;
    onLogout: () => void;
}

const VIEW_TO_MODULE_MAP: Record<string, string> = {
    data_siswa: 'data-siswa',
    cetak_kartu_login: 'data-siswa',
    tambah_kelas_view: 'data-siswa',
    upload_kelas_satu_view: 'data-siswa',
    upload_siswa_view: 'data-siswa',
    upload_perkelas_view: 'data-siswa',
    data_guru: 'data-guru',
    tambah_guru_view: 'data-guru',
    tambah_jabatan_view: 'data-guru',
    kelas_wali: 'kelas-wali',
    mapel: 'mata-pelajaran',
    tambah_mapel_view: 'mata-pelajaran',
    jadwal: 'jadwal',
    absen: 'absen',
    ujian: 'jadwal-ujian',
    nilai: 'nilai',
    rapot: 'rapot',
    rapot_print: 'rapot',
    rapot_settings: 'rapot',
    keuangan: 'keuangan',
    tabungan: 'tabungan',
    naik_kelas: 'naik-kelas',
    bimbingan_belajar: 'bimbingan',
    pengumuman: 'pengumuman',
    laporan: 'laporan',
    multimedia: 'multimedia',
    settings: 'pengaturan',
    ai_management: 'manajemen-ai'
};

const ProtectedViewWrapper: React.FC<{
    activeView: string;
    user: any;
    children: React.ReactNode;
}> = ({ activeView, user, children }) => {
    const module = VIEW_TO_MODULE_MAP[activeView];
    if (!module) {
        return <>{children}</>;
    }
    return (
        <ProtectedModule
            userRole={user?.role || user?.role_type || user?.roleCode}
            userId={user?.id}
            module={module as any}
            requiredAction="READ"
        >
            {children}
        </ProtectedModule>
    );
};

const DashboardSuperAdmin: React.FC<SuperAdminProps> = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // --- FORCE RESET CLEANUP (Run once to ensure everything is empty) ---
    useEffect(() => {
        const hasReset = localStorage.getItem('force_reset_v11');
        if (!hasReset) {
            // Clear all possible legacy keys
            Object.keys(localStorage).forEach(key => {
                if (key.includes('data_v') || key.includes('finance_') || key.includes('savings_') || key.includes('announcements_') || key.includes('broadcasts_') || key.includes('subject_') || key.includes('teacher_')) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.setItem('force_reset_v11', 'true');
            // Hard refresh to ensure hooks re-initialize with empty data from sharedData
            window.location.reload();
        }
    }, []);

    const [selectedClass, setSelectedClass] = useState('1A');

    const [editItem, setEditItem] = useState<any>(null);
    const [editType, setEditType] = useState<string>('');

    // --- STATE DATA (Using Custom Hooks) ---
    const {
        students,
        setStudents,
        addNewStudent,
        updateStudent,
        updateStudents,
        selectedStudent,
        setSelectedStudent,
        showAddStudentModal,
        setShowAddStudentModal,
        modalMode,
        setModalMode,
        handleViewStudent,
        handleAddStudent,
        handleEditStudent,
        handleDelete,
        handleDownloadTemplate,
        handleUploadClick,
        handleSaveData
    } = useStudents();

    const { subjectGroups, setSubjectGroups, subjects, setSubjects } = useSubjects();
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [positions, setPositions] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('positions_data_v2');
            if (saved) return JSON.parse(saved);
        }
        return [
            { id: 1, nama: 'Kepala Sekolah', kategori: 'Struktural' },
            { id: 2, nama: 'Wakil Kurikulum', kategori: 'Struktural' },
            { id: 3, nama: 'Guru Kelas', kategori: 'Fungsional' },
            { id: 4, nama: 'Guru Mata Pelajaran', kategori: 'Fungsional' },
            { id: 5, nama: 'Staff Tata Usaha', kategori: 'Staff' },
            { id: 6, nama: 'Operator Data', kategori: 'Teknis' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('positions_data_v2', JSON.stringify(positions));
    }, [positions]);

    // --- JADWAL STATE (Using Custom Hook) ---
    const { schedules, setSchedules, refreshSchedules } = useSchedules();
    const [activeScheduleId, setActiveScheduleId] = useState<number>(1);
    const [selectedJadwalClass, setSelectedJadwalClass] = useState<string>('1A');
    const [draggedItem, setDraggedItem] = useState<{ type: string, id: number | string, name: string } | null>(null);
    const [schedulePeriods, setSchedulePeriods] = useState<Period[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('schedule_periods_v2');
            if (saved) return JSON.parse(saved);
        }
        return schedulePeriodsGlobal;
    });

    useEffect(() => {
        localStorage.setItem('schedule_periods_v2', JSON.stringify(schedulePeriods));
    }, [schedulePeriods]);
    const [selectedJadwalLevel, setSelectedJadwalLevel] = useState<number>(1);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [newPeriodData, setNewPeriodData] = useState({ start: '', end: '' });
    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState('');

    // --- PLOTTING STATE ---
    const [mapelViewMode, setMapelViewMode] = useState<'master' | 'plotting'>('plotting'); // Default to plotting as requested
    const [teacherAssignments, setTeacherAssignments] = useState<{ id?: number; classNama: string; subjectIds: number[]; teacherId: string | number }[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('teacher_assignments_v2');
            if (saved) return JSON.parse(saved);
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('teacher_assignments_v2', JSON.stringify(teacherAssignments));
    }, [teacherAssignments]);
    const [showPlottingModal, setShowPlottingModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const { teachers, setTeachers, addTeacher } = useTeachers();
    const [newTeacher, setNewTeacher] = useState({ nama: '', nip: '', jabatan: 'Guru Mata Pelajaran', mapel: '', class: '', username: '', password: '' });
    const [showTeacherModal, setShowTeacherModal] = useState(false);

    const { classes, setClasses, showAddClassModal, setShowAddClassModal, handleAddClass, handleDeleteClass } = useClasses();
    const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string | number | null>(null);
    const [deleteClassError, setDeleteClassError] = useState<string | null>(null);
    const [isDeletingClass, setIsDeletingClass] = useState(false);

    // --- ABSENSI STATE ---
    const [absenDate, setAbsenDate] = useState<Date>(new Date());
    const [absenClass, setAbsenClass] = useState<string>('1A');
    const [absenSubjects, setAbsenSubjects] = useState<number[]>([]);
    const [absenMode, setAbsenMode] = useState<'today' | 'history'>('today');
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('attendance_data_v2');
            try {
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {
                console.error("Failed to parse attendance data", e);
            }
        }
        return Array.isArray(attendanceDataGlobal) ? attendanceDataGlobal : [];
    });

    useEffect(() => {
        localStorage.setItem('attendance_data_v2', JSON.stringify(attendanceData));
        updateAttendanceDataGlobal(attendanceData);
    }, [attendanceData]);

    const [absenSearchQuery, setAbsenSearchQuery] = useState('');
    const [absenSemester, setAbsenSemester] = useState('Ganjil');

    // --- UJIAN STATE (Using Custom Hook) ---
    const { examSchedules, setExamSchedules, refreshExams } = useExams();

    const [activeExamId, setActiveExamId] = useState<number | null>(examsDataGlobal.length > 0 ? (examsDataGlobal[0].id as number) : null);
    useEffect(() => {
        if (examSchedules.length > 0 && activeExamId === null) {
            setActiveExamId(examSchedules[0].id as number);
        }
    }, [examSchedules, activeExamId]);
    const [showExamModal, setShowExamModal] = useState(false);
    const [newExamData, setNewExamData] = useState<MasterExamSchedule>({
        id: 0,
        type: 'UTS',
        semester: 'Ganjil',
        year: '2025/2026',
        status: 'draft',
        items: [],
        timeSlots: []
    });

    // --- EXAM SCHEDULE ITEMS STATE (Similar to Jadwal Pelajaran) ---
    const [examScheduleItems, setExamScheduleItems] = useState<Record<string, { subject: string; teacher: string; color: string }>>({});
    const [examTimeSlots, setExamTimeSlots] = useState<Period[]>([
        { id: 0, start: '07:30', end: '09:00' },
        { id: 1, start: '09:00', end: '09:30' },
        { id: 2, start: '09:30', end: '11:00' },
    ]);
    const [examDailyUniforms, setExamDailyUniforms] = useState<Record<string, string>>({
        'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': ''
    });
    const [examDailyNotes, setExamDailyNotes] = useState<Record<string, string>>({
        'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': ''
    });
    const [selectedExamClass, setSelectedExamClass] = useState<string>('1A');
    const [selectedExamTingkat, setSelectedExamTingkat] = useState<string>('1');
    const [examDraggedItem, setExamDraggedItem] = useState<{ subject: string; teacher: string; color: string } | null>(null);
    const [showExamTimeModal, setShowExamTimeModal] = useState(false);
    const [showExamUniformModal, setShowExamUniformModal] = useState(false);
    const [showExamNoteModal, setShowExamNoteModal] = useState(false);
    const [selectedDayForExamUniform, setSelectedDayForExamUniform] = useState<string | null>(null);
    const [selectedDayForExamNote, setSelectedDayForExamNote] = useState<string | null>(null);
    const [tempExamUniform, setTempExamUniform] = useState('');
    const [tempExamNote, setTempExamNote] = useState('');
    const [newExamTime, setNewExamTime] = useState({ start: '', end: '' });

    // --- GENERIC CONFIRMATION MODAL STATE ---
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        message: '',
        onConfirm: () => { }
    });

    // 1. Sync Load: Master -> Local State
    useEffect(() => {
        const activeExam = examSchedules.find(e => e.id === activeExamId);
        if (activeExam) {
            // Load Time Slots - only if different
            const masterTimeSlots = activeExam.timeSlots || [];
            if (JSON.stringify(masterTimeSlots) !== JSON.stringify(examTimeSlots)) {
                setExamTimeSlots(masterTimeSlots);
            }

            // Load Items for Class - only if different
            const classItems = activeExam.items.filter(item => item.classId === selectedExamClass);
            const newMap: Record<string, any> = {};
            classItems.forEach(item => {
                newMap[`${item.day}-${item.timeSlotId}`] = {
                    subject: item.subjectName,
                    teacher: item.teacherName || '-',
                    color: item.color || 'bg-blue-100 border-blue-200 text-blue-700'
                };
            });

            if (JSON.stringify(newMap) !== JSON.stringify(examScheduleItems)) {
                setExamScheduleItems(newMap);
            }

            // Load Notes - only if different
            const masterNotes = activeExam.dailyNotes || { 'Senin': '', 'Selasa': '', 'Rabu': '', 'Kamis': '', 'Jumat': '', 'Sabtu': '' };
            if (JSON.stringify(masterNotes) !== JSON.stringify(examDailyNotes)) {
                setExamDailyNotes(masterNotes);
            }
        } else if (activeExamId === null) {
            // Reset local states if no exam is selected
            if (Object.keys(examScheduleItems).length > 0) setExamScheduleItems({});
            if (examTimeSlots.length > 0) setExamTimeSlots([]);
        }
    }, [activeExamId, selectedExamClass, examSchedules]);

    // 2. Sync Save: Local State -> Master (Debounced or on Change)
    useEffect(() => {
        if (!activeExamId) return;

        setExamSchedules(prevSchedules => {
            const currentExam = prevSchedules.find(e => e.id === activeExamId);
            if (!currentExam) return prevSchedules;

            // Prepare new items list for this class
            const currentExamId = activeExamId;
            const newClassItems: ExamScheduleItem[] = Object.entries(examScheduleItems).map(([key, data]: [string, any]) => {
                const [day, slotIdStr] = key.split('-');
                return {
                    id: `e-${currentExamId}-${selectedExamClass}-${key}`,
                    examId: currentExamId,
                    classId: selectedExamClass,
                    day,
                    timeSlotId: parseInt(slotIdStr),
                    subjectName: data.subject,
                    teacherName: data.teacher,
                    color: data.color
                };
            });

            // Keep items from other classes
            const otherClassItems = currentExam.items.filter(it => it.classId !== selectedExamClass);
            const allItems = [...otherClassItems, ...newClassItems];

            // Check if anything actually changed before returning new array
            const isItemsChanged = JSON.stringify(allItems) !== JSON.stringify(currentExam.items);
            const isSlotsChanged = JSON.stringify(examTimeSlots) !== JSON.stringify(currentExam.timeSlots);
            const isNotesChanged = JSON.stringify(examDailyNotes) !== JSON.stringify(currentExam.dailyNotes);

            if (!isItemsChanged && !isSlotsChanged && !isNotesChanged) {
                return prevSchedules; // No change, keep reference same to avoid re-triggering Effect 1
            }

            return prevSchedules.map(exam => {
                if (exam.id === activeExamId) {
                    return {
                        ...exam,
                        items: allItems,
                        timeSlots: examTimeSlots,
                        dailyNotes: examDailyNotes
                    };
                }
                return exam;
            });
        });
    }, [examScheduleItems, examTimeSlots, examDailyNotes, activeExamId, selectedExamClass]);

    // --- NILAI STATE ---
    const [activeNilaiSubMenu, setActiveNilaiSubMenu] = useState<'UH' | 'UTS' | 'UAS' | 'PAS' | 'PAT' | 'GRAFIK' | 'SETTING'>('UH');
    const [nilaiData, setNilaiData] = useState<GradeRecord[]>(gradesDataGlobal);

    useEffect(() => {
        updateGradesDataGlobal(nilaiData);
    }, [nilaiData]);

    // Auto-set semester based on Exam Type
    useEffect(() => {
        if (activeNilaiSubMenu === 'PAS' || activeNilaiSubMenu === 'UAS') {
            setSelectedNilaiSemester('Ganjil');
        } else if (activeNilaiSubMenu === 'PAT') {
            setSelectedNilaiSemester('Genap');
        }
    }, [activeNilaiSubMenu]);

    const [selectedNilaiClass, setSelectedNilaiClass] = useState('');
    const [selectedNilaiSubject, setSelectedNilaiSubject] = useState('');
    const [selectedNilaiSemester, setSelectedNilaiSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
    const [selectedNilaiStudent, setSelectedNilaiStudent] = useState('');


    // --- TABUNGAN STATE (Using Custom Hook) ---
    const [savingsActiveTab, setSavingsActiveTab] = useState('dashboard'); // dashboard, data, setoran, penarikan, riwayat, rekap, pengaturan
    const { savingsData, setSavingsData, savingsTransactions, setSavingsTransactions } = useSavings();
    const [searchSavingsStudent, setSearchSavingsStudent] = useState('');
    const [selectedSavingsStudent, setSelectedSavingsStudent] = useState<any>(null);
    const [savingsAmount, setSavingsAmount] = useState(0);
    const [savingsNote, setSavingsNote] = useState('');
    const [showAddSaverModal, setShowAddSaverModal] = useState(false);
    const [newSaverId, setNewSaverId] = useState('');
    const [saverClassFilter, setSaverClassFilter] = useState('');

    // --- TABUNGAN HANDLERS ---
    const handleSavingsDeposit = () => {
        if (!selectedSavingsStudent || savingsAmount <= 0) return;

        const updatedData = savingsData.map(s =>
            s.id === selectedSavingsStudent.id ? { ...s, saldo: s.saldo + savingsAmount } : s
        );
        setSavingsData(updatedData);

        const newTrx = {
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            studentId: selectedSavingsStudent.id,
            studentName: selectedSavingsStudent.nama,
            type: 'Setor' as const,
            amount: savingsAmount,
            officer: 'Admin'
        };
        setSavingsTransactions([newTrx, ...savingsTransactions]);

        toast.success(`Setoran Rp ${savingsAmount.toLocaleString('id-ID')} berhasil disimpan!`);
        setSelectedSavingsStudent(null);
        setSavingsAmount(0);
        setSavingsNote('');
        setSearchSavingsStudent('');
    };

    const handleSavingsWithdrawal = () => {
        if (!selectedSavingsStudent || savingsAmount <= 0) return;
        if (savingsAmount > selectedSavingsStudent.saldo) {
            toast.error("Saldo tidak mencukupi!");
            return;
        }

        const updatedData = savingsData.map(s =>
            s.id === selectedSavingsStudent.id ? { ...s, saldo: s.saldo - savingsAmount } : s
        );
        setSavingsData(updatedData);

        const newTrx = {
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            studentId: selectedSavingsStudent.id,
            studentName: selectedSavingsStudent.nama,
            type: 'Tarik' as const,
            amount: savingsAmount,
            officer: 'Admin'
        };
        setSavingsTransactions([newTrx, ...savingsTransactions]);

        toast.success(`Penarikan Rp ${savingsAmount.toLocaleString('id-ID')} berhasil diproses!`);
        setSelectedSavingsStudent(null);
        setSavingsAmount(0);
        setSavingsNote('');
        setSearchSavingsStudent('');
    };



    // --- PROMOTION STATE ---
    const [promotionActiveTab, setPromotionActiveTab] = useState('dashboard'); // dashboard, persiapan, proses, lulus, riwayat

    const [promotionYear, setPromotionYear] = useState(() => {
        const saved = localStorage.getItem('promotion_year_v10');
        return saved ? JSON.parse(saved) : { current: '2025/2026', next: '2026/2027' };
    });

    useEffect(() => {
        localStorage.setItem('promotion_year_v1', JSON.stringify(promotionYear));
    }, [promotionYear]);

    const [promotionChecklist, setPromotionChecklist] = useState({ year: true, classes: true, report: false, distinct: true });

    // Initial data with explicit fallback
    const [promotionHistory, setPromotionHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('promotion_history_v10');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('promotion_history_v10', JSON.stringify(promotionHistory));
    }, [promotionHistory]);

    const [selectedPromotionClass, setSelectedPromotionClass] = useState('');
    const [targetPromotionClass, setTargetPromotionClass] = useState('');
    const [promotionStudents, setPromotionStudents] = useState<any[]>([]); // Temp holder
    const [selectedGraduationClass, setSelectedGraduationClass] = useState('6A');

    // --- PROMOTION HANDLERS ---
    const handleCheckPreparation = () => {
        toast.promise(
            new Promise((resolve) => {
                setTimeout(() => {
                    // 1. Check Classes
                    const classesReady = classes.length > 0;

                    // 2. Check Year
                    const yearReady = !!promotionYear.next;

                    // 3. Check Report (Mock logic: if we have any grades)
                    const reportReady = nilaiData.length > 0;

                    // 4. Check Distinct (Duplicate students check)
                    const uniqueNames = new Set(students.map(s => s.nama));
                    const distinctReady = uniqueNames.size === students.length;

                    setPromotionChecklist({
                        year: yearReady,
                        classes: classesReady,
                        report: reportReady,
                        distinct: distinctReady
                    });

                    resolve("Validasi sistem selesai.");
                }, 800);
            }),
            {
                loading: 'Memeriksa kelengkapan data...',
                success: 'Validasi selesai!',
                error: 'Gagal memvalidasi',
            }
        );
    };



    const handleLoadPromotionStudents = (className: string) => {
        setSelectedPromotionClass(className);
        const level = parseInt(className.match(/\d+/)?.[0] || '0');
        const parallel = className.replace(/\d+/, '');
        if (level > 0 && level < 6) {
            setTargetPromotionClass(`${level + 1}${parallel}`);
        } else {
            setTargetPromotionClass('');
        }

        const classStudents = students.filter(s => s.kelas === className);

        // Sync with Teacher's Decision Pipeline
        const semesterKey = '2 (Genap)'; // Promotion usually based on Semester 2

        const mappedStudents = classStudents.map(s => {
            const suppKey = `rapor_supp_${className}_${s.id}_${semesterKey}`;
            const savedSupp = localStorage.getItem(suppKey);
            let decision = 'Naik'; // Default

            if (savedSupp) {
                const parsed = JSON.parse(savedSupp);
                const d = parsed.decision;
                if (d === 'Naik Ke Kelas') decision = 'Naik';
                else if (d === 'Tinggal Di Kelas') decision = 'Tinggal';
                else if (d === 'Lulus') decision = 'Lulus';
                else if (d === 'Tidak Lulus') decision = 'Tidak Lulus';
            }

            return { ...s, promoStatus: decision };
        });

        setPromotionStudents(mappedStudents);
    };

    const handleExecutePromotion = () => {
        if (!selectedPromotionClass || !targetPromotionClass) return;

        // Verify preparation
        // if (!promotionChecklist.report) {
        //     toast.error("Rapor belum selesai! Harap selesaikan validasi persiapan terlebih dahulu.");
        //     return;
        // }

        const toPromote = promotionStudents.filter(s => s.promoStatus === 'Naik');
        const count = toPromote.length;

        if (confirm(`Yakin ingin memproses kenaikan kelas untuk ${count} siswa dari ${selectedPromotionClass} ke ${targetPromotionClass}?`)) {
            // Update Students Data
            const updatedStudents = toPromote.map(s => ({
                ...s,
                kelas: targetPromotionClass,
                tingkat: (s.tingkat || 1) + 1,
                // Remove promoStatus before saving back if strict, but strict typing might ignore it. 
                // We cast or rely on Partial matching.
            }));

            // Call bulk update
            updateStudents(updatedStudents);

            // Log History
            const newHistory = toPromote.map((s, idx) => ({
                id: Date.now() + idx,
                date: new Date().toISOString().split('T')[0],
                student: s.nama,
                from: selectedPromotionClass,
                to: targetPromotionClass,
                type: 'Naik Kelas',
                officer: 'Admin'
            }));

            setPromotionHistory([...newHistory, ...promotionHistory]);
            setPromotionStudents([]);
            setSelectedPromotionClass('');
            toast.success("Proses Kenaikan Kelas Berhasil! Data siswa telah diperbarui.");
        }
    };

    const handleExecuteGraduation = () => {
        const toGraduate = promotionStudents.filter(s => s.promoStatus === 'Lulus');
        const count = toGraduate.length;

        if (confirm(`Yakin ingin meluluskan ${count} siswa dari kelas ${selectedPromotionClass}? Siswa akan dipindahkan ke data Alumni.`)) {

            // Update Students Data (Move to Alumni)
            const updatedStudents = toGraduate.map(s => ({
                ...s,
                kelas: 'Alumni',
                tingkat: 7, // 7 for Alumni/Lulus
            }));

            updateStudents(updatedStudents);

            // Log History
            const newHistory = toGraduate.map((s, idx) => ({
                id: Date.now() + idx,
                date: new Date().toISOString().split('T')[0],
                student: s.nama,
                from: selectedPromotionClass,
                to: 'Alumni',
                type: 'Lulus',
                officer: 'Admin'
            }));

            setPromotionHistory([...newHistory, ...promotionHistory]);
            setPromotionStudents([]);
            setSelectedPromotionClass('');
            toast.success("Proses Kelulusan Berhasil! Siswa telah dipindahkan ke Alumni.");
        }
    };




    // Derived State for Classes (Syncs with Teachers & Students) - Memoized for performance
    const derivedClasses = React.useMemo(() => {
        return classes.map(cls => {
            // Find teacher who is assigned as wali for this class
            const waliGuru = teachers.find(t => t.wali === cls.nama);
            // Count students in this class
            const studentCount = students.filter(s => s.kelas === cls.nama).length;

            return {
                ...cls,
                wali: waliGuru ? waliGuru.nama : 'Belum Ditentukan',
                siswa: studentCount
            };
        });
    }, [classes, teachers, students]);



    // ... (rest of menuItems and useEffect) ...






    const handleAddGroup = () => {
        setShowGroupModal(true);
    };

    const handleAddLesson = () => {
        setSelectedLevels([]);
        setShowSubjectModal(true);
    };

    const confirmAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('groupName') as HTMLInputElement).value;
        if (name) {
            setSubjectGroups([...subjectGroups, { id: `sg-${Date.now()}`, name }]);
            toast.success("Kelompok berhasil ditambahkan!");
            form.reset();
        }
    };

    const confirmAddSubject = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('subjectName') as HTMLInputElement).value;
        const code = (form.elements.namedItem('subjectCode') as HTMLInputElement).value;
        const level = selectedLevels.length > 0
            ? (selectedLevels.includes("Semua Tingkat") ? "Semua Tingkat" : `Tingkat ${selectedLevels.sort().join(', ')}`)
            : "Semua Tingkat";
        const group = (form.elements.namedItem('subjectGroup') as HTMLSelectElement).value;

        if (editItem && editType === 'Mata Pelajaran') {
            setSubjects(subjects.map(s => s.id === editItem.id ? { ...s, name, code, level, group } : s));
            toast.success("Mata pelajaran berhasil diperbarui!");
        } else {
            setSubjects([...subjects, { id: Date.now(), name, code, level, group }]);
            toast.success("Mata pelajaran berhasil ditambahkan!");
        }
        setShowSubjectModal(false);
        setEditItem(null);
        setEditType('');
    };

    const handleDeleteSubject = (id: number | string) => {
        if (confirm("Apakah anda yakin ingin menghapus mata pelajaran ini?")) {
            setSubjects(subjects.filter(s => s.id !== id));
            toast.success("Mata pelajaran berhasil dihapus");
        }
    };

    const handleDeleteGroup = (id: number | string) => {
        if (confirm("Hapus kelompok ini?")) {
            setSubjectGroups(subjectGroups.filter(g => g.id !== id));
        }
    };

    const handleAddPosition = () => {
        setEditItem(null);
        setEditType('Jabatan');
        setShowPositionModal(true);
    };

    const confirmAddPosition = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const nama = (form.elements.namedItem('positionName') as HTMLInputElement).value;
        const kategori = (form.elements.namedItem('positionCategory') as HTMLSelectElement).value;

        if (nama && kategori) {
            if (editItem && editType === 'Jabatan') {
                setPositions(positions.map(p => p.id === editItem.id ? { ...p, nama, kategori } : p));
                toast.success("Jabatan berhasil diperbarui");
            } else {
                setPositions([...positions, { id: Date.now(), nama, kategori }]);
                toast.success("Jabatan berhasil ditambahkan");
            }
            setShowPositionModal(false);
            setEditItem(null);
            setEditType('');
        }
    }

    const handleDeletePosition = (id: number) => {
        setConfirmModal({
            show: true,
            message: 'Apakah anda yakin ingin menghapus jabatan ini?',
            onConfirm: () => {
                setPositions(positions.filter(p => p.id !== id));
                toast.success("Jabatan berhasil dihapus");
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
            }
        });
    }

    const handleAddTeacher = () => {
        const generatedUsername = 'guru' + Math.floor(100 + Math.random() * 900);
        setNewTeacher({
            nama: '',
            nip: '',
            jabatan: 'Guru Mata Pelajaran',
            mapel: '',
            class: '',
            username: generatedUsername,
            password: 'password123'
        });
        setShowTeacherModal(true);
    };

    const handleSaveTeacher = () => {
        if (!newTeacher.nama || !newTeacher.nip) {
            toast.error("Nama dan NIP wajib diisi!");
            return;
        }

        if (editItem && (editType === 'Teacher' || editType === 'Data Guru')) {
            setTeachers(teachers.map(t => t.id === editItem.id ? {
                ...t,
                nama: newTeacher.nama,
                nip: newTeacher.nip,
                jabatan: newTeacher.jabatan,
                role: newTeacher.jabatan, // Fix #2: mirror jabatan → role agar Login.tsx bisa baca
                mapel: newTeacher.jabatan === 'Guru Mata Pelajaran' ? newTeacher.mapel : '-',
                wali: newTeacher.jabatan === 'Guru Kelas' || newTeacher.jabatan === 'Wali Kelas' ? newTeacher.class : '-',
                username: newTeacher.username || t.username,
                password: newTeacher.password || t.password,
            } : t));
            toast.success(`Guru ${newTeacher.nama} berhasil diperbarui!`);
        } else {
            const teacherToAdd = {
                id: `guru-${Math.random().toString(36).substr(2, 9)}`,
                nama: newTeacher.nama,
                nip: newTeacher.nip,
                jabatan: newTeacher.jabatan,
                role: newTeacher.jabatan, // Fix #2: mirror jabatan → role agar Login.tsx bisa baca
                mapel: newTeacher.jabatan === 'Guru Mata Pelajaran' ? newTeacher.mapel : '-',
                wali: newTeacher.jabatan === 'Guru Kelas' || newTeacher.jabatan === 'Wali Kelas' ? newTeacher.class : '-',
                username: newTeacher.username || (newTeacher.nama.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100)),
                password: newTeacher.password || 'password123'
            };

            addTeacher(teacherToAdd);
            toast.success(`Guru ${newTeacher.nama} berhasil ditambahkan!`);
        }

        setShowTeacherModal(false);
        setEditItem(null);
        setEditType('');
        setNewTeacher({ nama: '', nip: '', jabatan: 'Guru Mata Pelajaran', mapel: '', class: '', username: '', password: '' });
    };

    const handleDeleteTeacher = (id: number) => {
        if (confirm("Hapus data guru ini?")) {
            setTeachers(teachers.filter(t => t.id !== id));
        }
    };

    // --- GENERIC EDIT HANDLER ---
    const handleEditItem = (item: any, type: string) => {
        setEditItem(item);
        setEditType(type);
        if (type === 'Mata Pelajaran') {
            const levelStr = item.level || '';
            if (levelStr === 'Semua Tingkat') {
                setSelectedLevels(['Semua Tingkat']);
            } else {
                const matches = levelStr.match(/\d+/g);
                if (matches) {
                    setSelectedLevels(matches);
                } else {
                    setSelectedLevels([]);
                }
            }
            setShowSubjectModal(true);
        } else if (type === 'Teacher' || type === 'Data Guru') {
            setNewTeacher({
                nama: item.nama,
                nip: item.nip,
                jabatan: item.jabatan,
                mapel: item.mapel,
                class: item.wali,
                username: item.username || '',
                password: item.password || ''
            });
            setShowTeacherModal(true);
        } else if (type === 'Jabatan') {
            setShowPositionModal(true);
        }
    };

    // --- JADWAL HANDLERS ---
    const handleDragStart = (e: React.DragEvent, type: string, id: number | string, name: string) => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id.toString());
        e.dataTransfer.setData('name', name);
        setDraggedItem({ type, id, name });
    };

    const handleScheduleDrop = (e: React.DragEvent, day: string, period: number) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const idStr = e.dataTransfer.getData('id');
        const name = e.dataTransfer.getData('name');

        let subjectId: number | string = idStr;
        if (type === 'subject') subjectId = parseInt(idStr);

        // Add to schedule
        const newItem: ScheduleItem = {
            id: Date.now().toString(),
            classId: selectedJadwalClass,
            day,
            period,
            subjectId: subjectId,
            customName: type === 'custom' ? name : undefined
        };

        const newSchedules = schedules.map(s => {
            if (s.id === activeScheduleId) {
                // Remove existing item in this slot if any
                const filteredItems = s.items.filter(i => !(i.classId === selectedJadwalClass && i.day === day && i.period === period));
                return { ...s, items: [...filteredItems, newItem] };
            }
            return s;
        });

        setSchedules(newSchedules);
        setDraggedItem(null);
    };

    const handleDeleteScheduleItem = (itemId: string) => {
        setSchedules(schedules.map(s => {
            if (s.id === activeScheduleId) {
                return { ...s, items: s.items.filter(i => i.id !== itemId) };
            }
            return s;
        }));
    };

    const getConflictingItem = (item: ScheduleItem) => {
        if (typeof item.subjectId === 'string') return null; // Ignore custom items for conflict now

        // 1. Get Teacher for this item
        const assignment = teacherAssignments.find(ta => ta.classNama === item.classId && ta.subjectIds.includes(item.subjectId as number));
        if (!assignment) return null; // No teacher assigned yet

        // 2. Search for other items with SAME teacher at SAME time
        const schedule = schedules.find(s => s.id === activeScheduleId);
        if (!schedule) return null;

        return schedule.items.find(other => {
            if (other.id === item.id) return false; // Self
            if (other.day !== item.day || other.period !== item.period) return false; // Different time

            // Check teacher
            if (typeof other.subjectId === 'string') return false;
            const otherAssignment = teacherAssignments.find(ta => ta.classNama === other.classId && ta.subjectIds.includes(other.subjectId as number));

            return otherAssignment?.teacherId === assignment.teacherId;
        });
    };

    const handlePublishSchedule = () => {
        // Validation logic could go here
        setSchedules(schedules.map(s => s.id === activeScheduleId ? { ...s, status: 'published' } : s));
        toast.success("Jadwal Berhasil Dipublikasikan!");
    };

    const handleUnpublishSchedule = () => {
        setSchedules(schedules.map(s => s.id === activeScheduleId ? { ...s, status: 'draft' } : s));
    };

    const handleDeleteSemester = () => {
        if (schedules.length <= 1) {
            toast.error("Tidak dapat menghapus semester terakhir. Minimal harus ada satu semester.");
            return;
        }

        setConfirmModal({
            show: true,
            message: "Apakah anda yakin ingin menghapus SEMESTER ini beserta seluruh jadwalnya? Tindakan ini tidak dapat dibatalkan.",
            onConfirm: () => {
                const newSchedules = schedules.filter(s => s.id !== activeScheduleId);
                setSchedules(newSchedules);
                setActiveScheduleId(newSchedules[0].id);
                toast.success("Semester berhasil dihapus.");
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const handleResetClassSchedule = () => {
        setConfirmModal({
            show: true,
            message: `Reset semua jadwal untuk Kelas ${selectedJadwalClass} di semester ini?`,
            onConfirm: () => {
                setSchedules(schedules.map(s => {
                    if (s.id === activeScheduleId) {
                        return { ...s, items: s.items.filter(i => i.classId !== selectedJadwalClass) };
                    }
                    return s;
                }));
                toast.success(`Jadwal Kelas ${selectedJadwalClass} dikosongkan.`);
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const confirmAddTime = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPeriodData.start || !newPeriodData.end) {
            toast.error("Jam mulai dan selesai wajib diisi!");
            return;
        }

        const newId = schedulePeriods.length > 0
            ? Math.max(...schedulePeriods.map(p => p.id)) + 1
            : 1;

        const newPeriod: Period = {
            id: newId,
            start: newPeriodData.start,
            end: newPeriodData.end
        };

        setSchedulePeriods([...schedulePeriods, newPeriod].sort((a, b) => a.start.localeCompare(b.start)));
        setShowTimeModal(false);
        setNewPeriodData({ start: '', end: '' });
        toast.success("Jam pelajaran berhasil ditambahkan!");
    };

    const handleDailyInfoChange = (day: string, field: 'seragam' | 'catatan', value: string) => {
        setSchedules(schedules.map(s => {
            if (s.id === activeScheduleId) {
                // Find existing daily info
                const existingInfoIndex = s.dailyInfos?.findIndex(info => info.classId === selectedJadwalClass && info.day === day);
                let newDailyInfos = s.dailyInfos ? [...s.dailyInfos] : [];

                if (existingInfoIndex !== undefined && existingInfoIndex !== -1) {
                    newDailyInfos[existingInfoIndex] = { ...newDailyInfos[existingInfoIndex], [field]: value };
                } else {
                    newDailyInfos.push({ classId: selectedJadwalClass, day, [field]: value });
                }
                return { ...s, dailyInfos: newDailyInfos };
            }
            return s;
        }));
    };

    const confirmAddSemester = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSemesterName) {
            toast.error("Nama semester wajib diisi!");
            return;
        }

        const newSemester: MasterSchedule = {
            id: Date.now(),
            name: newSemesterName,
            status: 'draft',
            items: [],
            dailyInfos: []
        };

        setSchedules([...schedules, newSemester]);
        setActiveScheduleId(newSemester.id);
        setShowSemesterModal(false);
        setNewSemesterName('');
        toast.success(`Semester "${newSemesterName}" berhasil dibuat!`, {
            icon: '📅',
            style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
            }
        });
    };

    return (
        <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden">
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={12}
                toastOptions={{
                    className: 'modern-toast',
                    duration: 3000,
                    style: {
                        background: 'rgba(30, 41, 59, 0.95)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                        style: {
                            borderLeft: '4px solid #10B981',
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                        style: {
                            borderLeft: '4px solid #EF4444',
                        }
                    },
                }}
            />
            {/* SIDEBAR */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                onLogout={onLogout}
                user={user}
            />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden p-6 gap-6">

                <main className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">

                    <ProtectedViewWrapper activeView={activeView} user={user}>

                    {/* --- VIEW: DASHBOARD HOME --- */}
                    {activeView === 'dashboard' && (
                        <DashboardHome students={students} classes={classes} teachers={teachers} setActiveView={setActiveView} user={user} />
                    )}

                    {/* --- VIEW: DATA SISWA & KELAS --- */}
                    {activeView === 'data_siswa' && (
                        <DataSiswaView setActiveView={setActiveView} />
                    )}

                    {/* --- VIEW: CETAK KARTU LOGIN --- */}
                    {activeView === 'cetak_kartu_login' && (
                        <CetakKartuLoginView setActiveView={setActiveView} students={students} classes={classes} />
                    )}

                    {/* --- VIEW: TAMBAH KELAS --- */}
                    {activeView === 'tambah_kelas_view' && (
                        <TambahKelasView
                            setActiveView={setActiveView}
                            classes={classes}
                            setClasses={setClasses}
                            teachers={teachers}
                            students={students}
                            setShowAddClassModal={setShowAddClassModal}
                            handleDeleteClass={handleDeleteClass}
                            handleEditClass={(cls) => {
                                setEditItem(cls);
                                setEditType('Kelas');
                                setShowAddClassModal(true);
                            }}
                        />
                    )}

                    {/* --- VIEW: UPLOAD SISWA BARU (MODERN TABLE + FILTER KELAS 1) --- */}
                    {activeView === 'upload_kelas_satu_view' && (
                        <UploadKelasSatuView
                            setActiveView={setActiveView}
                            handleDownloadTemplate={handleDownloadTemplate}
                            handleUploadClick={handleUploadClick}
                            handleSaveData={handleSaveData}
                            students={students}
                            classes={classes}
                            handleViewStudent={handleViewStudent}
                            handleEditStudent={handleEditStudent}
                            handleDelete={handleDelete}
                            user={user}
                        />
                    )}

                    {/* --- VIEW: UPLOAD SISWA VIEW (MODERN TABLE) --- */}
                    {activeView === 'upload_siswa_view' && (
                        <UploadSiswaView
                            setActiveView={setActiveView}
                            handleDownloadTemplate={handleDownloadTemplate}
                            handleUploadClick={handleUploadClick}
                            handleSaveData={handleSaveData}
                            students={students}
                            classes={classes}
                            handleViewStudent={handleViewStudent}
                            handleEditStudent={handleEditStudent}
                            handleDelete={handleDelete}
                            user={user}
                        />
                    )}

                    {/* --- VIEW: UPLOAD PERKELAS VIEW (MODERN TABLE + FILTER) --- */}
                    {activeView === 'upload_perkelas_view' && (
                        <UploadPerKelasView
                            setActiveView={setActiveView}
                            handleDownloadTemplate={handleDownloadTemplate}
                            handleUploadClick={handleUploadClick}
                            handleSaveData={handleSaveData}
                            students={students}
                            handleViewStudent={handleViewStudent}
                            handleEditStudent={handleEditStudent}
                            handleDelete={handleDelete}
                            classes={classes}
                            handleAddStudent={handleAddStudent}
                            user={user}
                        />
                    )}

                    {/* --- VIEW: DATA GURU & STAFF (Refactored) --- */}
                    {activeView === 'data_guru' && (
                        <GuruStaffView setActiveView={setActiveView} />
                    )}

                    {/* --- VIEW: TAMBAH DATA GURU (Refactored) --- */}
                    {activeView === 'tambah_guru_view' && (
                        <TeacherDataView
                            teachers={teachers}
                            setTeachers={setTeachers}
                            positions={positions}
                            setActiveView={setActiveView}
                            handleDownloadTemplate={handleDownloadTemplate}
                            handleUploadClick={handleUploadClick}
                            handleAddTeacher={handleAddTeacher}
                            handleSaveData={handleSaveData}
                            handleEditItem={handleEditItem}
                            handleDeleteTeacher={handleDeleteTeacher}
                            classes={classes}
                        />
                    )}

                    {/* --- VIEW: TAMBAH MATA PELAJARAN --- */}
                    {/* --- VIEW: TAMBAH MATA PELAJARAN & KELOLA MAPEL (Refactored) --- */}
                    {(activeView === 'mapel' || activeView === 'tambah_mapel_view') && (
                        <MataPelajaranView
                            mapelViewMode={mapelViewMode}
                            setMapelViewMode={setMapelViewMode}
                            teacherAssignments={teacherAssignments}
                            setTeacherAssignments={setTeacherAssignments}
                            teachers={teachers}
                            subjects={subjects}
                            handleAddGroup={handleAddGroup}
                            setShowSubjectModal={setShowSubjectModal}
                            setShowPlottingModal={setShowPlottingModal}
                            handleEditItem={handleEditItem}
                            setActiveView={setActiveView}
                            handleDeleteSubject={handleDeleteSubject}
                        />
                    )}




                    {/* --- VIEW: TAMBAH JABATAN (Refactored) --- */}
                    {
                        activeView === 'tambah_jabatan_view' && (
                            <JabatanView
                                positions={positions}
                                handleAddPosition={handleAddPosition}
                                handleEditItem={handleEditItem}
                                handleDeletePosition={handleDeletePosition}
                                setActiveView={setActiveView}
                            />
                        )
                    }




                    {/* --- VIEW: JADWAL PELAJARAN --- */}
                    {activeView === 'jadwal' && (
                        <JadwalPelajaranView
                            activeView={activeView}
                            selectedJadwalLevel={selectedJadwalLevel}
                            setSelectedJadwalLevel={setSelectedJadwalLevel}
                            selectedJadwalClass={selectedJadwalClass}
                            setSelectedJadwalClass={setSelectedJadwalClass}
                            activeScheduleId={activeScheduleId}
                            setActiveScheduleId={setActiveScheduleId}
                            schedules={schedules}
                            classes={classes}
                            subjects={subjects}
                            teacherAssignments={teacherAssignments}
                            teachers={teachers}
                            schedulePeriods={schedulePeriods}
                            setSchedulePeriods={setSchedulePeriods}
                            setShowSemesterModal={setShowSemesterModal}
                            setShowTimeModal={setShowTimeModal}
                            handleDeleteSemester={handleDeleteSemester}
                            handleResetClassSchedule={handleResetClassSchedule}
                            handlePublishSchedule={handlePublishSchedule}
                            handleDragStart={handleDragStart}
                            handleScheduleDrop={handleScheduleDrop}
                            handleDeleteScheduleItem={handleDeleteScheduleItem}
                            handleDailyInfoChange={handleDailyInfoChange}
                            getConflictingItem={getConflictingItem}
                        />
                    )}


                    {/* --- VIEW: ABSENSI SISWA --- */}
                    {activeView === 'absen' && (
                        <AbsensiView
                            activeView={activeView}
                            absenClass={absenClass}
                            setAbsenClass={setAbsenClass}
                            absenSemester={absenSemester}
                            setAbsenSemester={setAbsenSemester}
                            absenDate={absenDate}
                            setAbsenDate={setAbsenDate}
                            absenMode={absenMode}
                            setAbsenMode={setAbsenMode}
                            absenSearchQuery={absenSearchQuery}
                            setAbsenSearchQuery={setAbsenSearchQuery}
                            attendanceData={attendanceData}
                            setAttendanceData={setAttendanceData}
                            students={students}
                            classes={classes}
                            subjects={subjects}
                        />
                    )}


                    {/* --- VIEW: KELAS DAN WALI KELAS --- */}
                    {
                        activeView === 'kelas_wali' && (
                            <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in fade-in flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <School size={28} className="text-blue-800" />
                                    <h2 className="text-xl font-bold text-[#1E1B4B]">Data Kelas & Wali kelas</h2>
                                </div>

                                <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-4 border-r border-slate-200 text-center w-16">No</th>
                                                <th className="p-4 border-r border-slate-200">Nama Kelas</th>
                                                <th className="p-4 border-r border-slate-200 text-center">Tingkat</th>
                                                <th className="p-4 border-r border-slate-200 text-center">Paralel</th>
                                                <th className="p-4 border-r border-slate-200">Wali Kelas</th>
                                                <th className="p-4 border-r border-slate-200 text-center">Jumlah Siswa</th>
                                                <th className="p-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {derivedClasses.map((kelas, i) => (
                                                <tr key={kelas.id} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                                    <td className="p-4 font-bold text-slate-800">{kelas.nama}</td>
                                                    <td className="p-4 text-center text-slate-600">{kelas.tingkat}</td>
                                                    <td className="p-4 text-center text-slate-600">{kelas.paralel}</td>
                                                    <td className="p-4">
                                                        {kelas.wali === 'Belum Ditentukan' ? (
                                                            <span className="text-red-500 italic text-xs font-bold bg-red-50 px-2 py-1 rounded-md">Belum Ada</span>
                                                        ) : (
                                                            <span className="text-slate-700 font-medium">{kelas.wali}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{kelas.siswa} Siswa</span>
                                                    </td>
                                                    <td className="p-4 flex justify-center gap-2">
                                                        <button onClick={() => handleEditItem(kelas, 'Kelas')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg group tooltip-trigger relative">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => { setDeleteClassError(null); setConfirmDeleteClassId(kelas.id); }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }

                    {/* --- VIEW: JADWAL UJIAN --- */}
                    {
                        activeView === 'ujian' && (
                            <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
                                {/* Header & Toolbar */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-0 gap-1">
                                    <div className="flex items-center gap-3">
                                        <ClipboardList size={28} className="text-blue-600" />
                                        <div>
                                            <h2 className="text-xl font-bold text-[#1E1B4B]">Jadwal Ujian</h2>
                                            <p className="text-slate-500 text-sm">Kelola jadwal pelaksanaan ujian sekolah.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            if (!activeExamId) return;
                                            toast.success("Konfigurasi Jadwal Ujian berhasil disimpan ke database!");
                                        }} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                            <Save size={16} /> Simpan
                                        </button>
                                        <button onClick={() => {
                                            if (!activeExamId) return;
                                            setExamSchedules(prev => prev.map(ex => ex.id === activeExamId ? { ...ex, status: 'published' } : ex));
                                            toast.success("Jadwal Ujian berhasil dipublikasikan! Siswa dan Orang Tua kini dapat melihat jadwal ini.", { icon: '🚀' });
                                        }} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                            <Zap size={16} /> Publikasi
                                        </button>
                                        <button onClick={() => {
                                            setConfirmModal({
                                                show: true,
                                                message: 'Apakah anda yakin ingin mereset/menghapus semua jadwal ujian?',
                                                onConfirm: () => {
                                                    setExamSchedules([]);
                                                    toast.success("Jadwal ujian berhasil direset.");
                                                    setConfirmModal({ show: false, message: '', onConfirm: () => { } });
                                                }
                                            });
                                        }} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100">
                                            <RotateCcw size={14} /> Reset
                                        </button>
                                        <button onClick={() => setShowExamModal(true)} className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors shadow-lg">
                                            <FolderPlus size={16} /> Tambah Jenis
                                        </button>
                                    </div>
                                </div>

                                {/* Active Exam Selector & Info */}
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 mb-2 flex flex-wrap gap-3 items-center">
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pilih Jadwal Ujian</label>
                                        <select
                                            value={activeExamId || ''}
                                            onChange={(e) => setActiveExamId(Number(e.target.value))}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm outline-none focus:border-blue-500"
                                        >
                                            {examSchedules.length === 0 ? <option value="">Belum ada jadwal ujian</option> : null}
                                            {examSchedules.map(exam => (
                                                <option key={exam.id} value={exam.id}>{exam.type} - {exam.semester} {exam.year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Semester</label>
                                        <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm">
                                            {activeExamId ? examSchedules.find(e => e.id === activeExamId)?.semester : '-'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tahun Ajaran</label>
                                        <div className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 text-sm">
                                            {activeExamId ? examSchedules.find(e => e.id === activeExamId)?.year : '-'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
                                        <div className="flex items-center gap-2 h-9">
                                            {activeExamId ? (
                                                examSchedules.find(e => e.id === activeExamId)?.status === 'published' ? (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                                                        <CheckCircle size={12} /> TERBIT
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                                                        <Edit size={12} /> DRAFT
                                                    </span>
                                                )
                                            ) : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Grid - Tabel Jadwal Ujian */}
                                <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                                    {/* Filter Section */}
                                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-600 whitespace-nowrap">TINGKAT:</label>
                                            <select
                                                value={selectedExamTingkat}
                                                onChange={(e) => setSelectedExamTingkat(e.target.value)}
                                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                            >
                                                {['1', '2', '3', '4', '5', '6'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-bold text-slate-600 whitespace-nowrap">KELAS:</label>
                                            <select
                                                value={selectedExamClass}
                                                onChange={(e) => setSelectedExamClass(e.target.value)}
                                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-[#004AAD] focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                            >
                                                {derivedClasses.filter(c => c.tingkat?.toString() === selectedExamTingkat).map(c => (
                                                    <option key={c.id} value={c.nama}>{c.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Main Table Area */}
                                    {activeExamId ? (
                                        <div className="flex-1 flex gap-3 overflow-hidden">
                                            {/* Left Sidebar - Mata Pelajaran */}
                                            <div className="w-64 bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex flex-col shrink-0">
                                                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <GripVertical size={14} className="text-slate-400" />
                                                    Daftar Mata Pelajaran
                                                </h3>
                                                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                                                    {subjects.map((subj) => {
                                                        const colorClasses = [
                                                            'bg-blue-100 border-blue-200 text-blue-700',
                                                            'bg-emerald-100 border-emerald-200 text-emerald-700',
                                                            'bg-violet-100 border-violet-200 text-violet-700',
                                                            'bg-orange-100 border-orange-200 text-orange-700',
                                                            'bg-lime-100 border-lime-200 text-lime-700',
                                                        ];
                                                        const color = colorClasses[Number(subj.id) % colorClasses.length];
                                                        return (
                                                            <div
                                                                key={subj.id}
                                                                draggable
                                                                onDragStart={() => setExamDraggedItem({ subject: subj.name, teacher: '-', color })}
                                                                className={`p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${color} bg-opacity-50`}
                                                            >
                                                                <div className="font-bold text-xs">{subj.name}</div>
                                                                <div className="text-[10px] opacity-80 truncate">-</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Right Area - Schedule Grid */}
                                            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                                                <div className="overflow-auto flex-1 relative">
                                                    <table className="w-full text-left border-collapse relative">
                                                        <thead className="bg-[#f8fafc] sticky top-0 z-20 shadow-sm">
                                                            <tr>
                                                                <th className="p-2 border-r border-b border-slate-200 min-w-[100px] w-[100px] bg-slate-50 bg-opacity-95 backdrop-blur-sm z-30 sticky left-0 text-center relative group">
                                                                    <span className="text-xs font-bold text-slate-500 block mb-1">Waktu Ujian</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            setNewExamTime({ start: '', end: '' });
                                                                            setShowExamTimeModal(true);
                                                                        }}
                                                                        className="mx-auto w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm border border-green-200"
                                                                        title="Tambah Waktu Ujian Manual"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </th>
                                                                {DAYS.map(day => (
                                                                    <th key={day} className="px-4 py-8 h-28 border-r border-b border-slate-200 min-w-[180px] bg-[#f8fafc] text-center group">
                                                                        <div className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">{day}</div>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedDayForExamUniform(day);
                                                                                setTempExamUniform(examDailyUniforms[day] || '');
                                                                                setShowExamUniformModal(true);
                                                                            }}
                                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${examDailyUniforms[day] ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-400 border border-transparent hover:bg-slate-200'}`}
                                                                        >
                                                                            <Shirt size={12} />
                                                                            <span className="truncate max-w-[120px]">{examDailyUniforms[day] || 'Seragam?'}</span>
                                                                        </button>
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {examTimeSlots.map((slot) => (
                                                                <tr key={slot.id}>
                                                                    <td className="p-2 border-r border-b border-slate-100 bg-slate-50 sticky left-0 z-10 text-center group/time relative">
                                                                        <div className="text-xs font-bold text-slate-700">{slot.start} - {slot.end}</div>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm('Hapus sesi ujian ini?')) {
                                                                                    setExamTimeSlots(prev => prev.filter(t => t.id !== slot.id));
                                                                                }
                                                                            }}
                                                                            className="absolute top-1 left-1 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover/time:opacity-100"
                                                                            title="Hapus Sesi Ini"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </td>
                                                                    {DAYS.map((day) => {
                                                                        const slotKey = `${day}-${slot.id}`;
                                                                        const scheduleItem = examScheduleItems[slotKey];
                                                                        return (
                                                                            <td
                                                                                key={slotKey}
                                                                                onDragOver={(e) => e.preventDefault()}
                                                                                onDrop={() => {
                                                                                    if (examDraggedItem) {
                                                                                        setExamScheduleItems(prev => ({
                                                                                            ...prev,
                                                                                            [slotKey]: examDraggedItem
                                                                                        }));
                                                                                        setExamDraggedItem(null);
                                                                                    }
                                                                                }}
                                                                                className={`p-1 border-r border-b border-slate-100 h-36 relative transition-colors ${scheduleItem ? '' : 'hover:bg-blue-50'}`}
                                                                            >
                                                                                {scheduleItem ? (
                                                                                    <div className={`w-full h-full p-2.5 rounded-xl border flex flex-col justify-center relative group ${scheduleItem.color}`}>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const newItems = { ...examScheduleItems };
                                                                                                delete newItems[slotKey];
                                                                                                setExamScheduleItems(newItems);
                                                                                            }}
                                                                                            className="absolute top-1 right-1 p-1 rounded-full bg-white/60 hover:bg-rose-500 hover:text-white text-rose-500 transition-all z-10"
                                                                                            title="Hapus"
                                                                                        >
                                                                                            <X size={16} />
                                                                                        </button>
                                                                                        <span className="font-bold text-sm leading-tight text-center">{scheduleItem.subject}</span>
                                                                                        {scheduleItem.teacher !== '-' && (
                                                                                            <span className="text-[10px] text-center mt-1.5 opacity-80 leading-tight line-clamp-2">{scheduleItem.teacher}</span>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                                                                                        <div className="text-[10px] text-slate-400 font-medium">Drop disini</div>
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                            {/* Add Time Slot Row */}
                                                            <tr>
                                                                <td className="p-2 border-r border-slate-100 bg-slate-50 sticky left-0 z-10 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setNewExamTime({ start: '', end: '' });
                                                                            setShowExamTimeModal(true);
                                                                        }}
                                                                        className="w-full py-2 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#004AAD] hover:bg-blue-50 rounded-lg transition-all border border-dashed border-slate-300 hover:border-blue-300"
                                                                    >
                                                                        <Plus size={16} />
                                                                        <span className="text-[10px] font-bold">Tambah Sesi</span>
                                                                    </button>
                                                                </td>
                                                                <td colSpan={6} className="bg-slate-50/30"></td>
                                                            </tr>
                                                            {/* CATATAN Row */}
                                                            <tr>
                                                                <td className="p-2 border-r border-slate-100 bg-slate-50 sticky left-0 z-10 text-center">
                                                                    <div className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                                                                        <FileText size={14} />
                                                                        <span>CATATAN</span>
                                                                    </div>
                                                                </td>
                                                                {DAYS.map((day) => (
                                                                    <td key={day} className="p-2 border-r border-slate-100">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedDayForExamNote(day);
                                                                                setTempExamNote(examDailyNotes[day] || '');
                                                                                setShowExamNoteModal(true);
                                                                            }}
                                                                            className="w-full p-2 text-left text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all min-h-[60px]"
                                                                        >
                                                                            {examDailyNotes[day] ? (
                                                                                <span className="line-clamp-3">{examDailyNotes[day]}</span>
                                                                            ) : (
                                                                                <span className="text-slate-400 italic">Catatan Harian...</span>
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <FolderPlus size={64} className="mb-4 text-slate-300" />
                                            <h3 className="text-lg font-bold text-slate-500">Belum ada Jadwal Ujian</h3>
                                            <p className="text-sm text-center max-w-sm mt-2">Silakan buat jadwal ujian baru dengan menekan tombol "Tambah Jenis Ujian" di atas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }



                    {
                        activeView === 'rapot' && (
                            <RapotDashboardView 
                                setActiveView={setActiveView}
                                classes={classes}
                                students={students}
                                derivedClasses={derivedClasses}
                                setSelectedClass={setSelectedClass}
                            />
                        )
                    }

                    {/* --- VIEW: RAPOR PRINT (Detail Cetak) --- */}
                    {activeView === 'rapot_print' && (
                        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
                            <RaporView setActiveView={setActiveView} />
                        </div>
                    )}

                    {/* --- VIEW: RAPOR SETTINGS --- */}
                    {activeView === 'rapot_settings' && (
                        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
                            <RaporSettingsView setActiveView={setActiveView} />
                        </div>
                    )}

                    {/* --- VIEW: INPUT NILAI (NEW) --- */}
                    {activeView === 'nilai' && (
                        <div className="h-full">
                            <NilaiView setActiveView={setActiveView} user={user} />
                        </div>
                    )}

                    {/* --- VIEW: KEUANGAN --- */}
                    {activeView === 'keuangan' && (
                        <KeuanganView students={students} user={user} />
                    )}

                    {
                        activeView === 'tabungan' && (
                            <TabunganView 
                                students={students}
                                classes={classes}
                                user={user}
                            />
                        )
                    }


                    {
                        activeView === 'naik_kelas' && (
                            <NaikKelasView 
                                classes={classes}
                                students={students}
                            />
                        )
                    }


                    {
                        activeView === 'bimbingan_belajar' && (
                            <BimbinganBelajarView 
                                classes={classes}
                                students={students}
                            />
                        )
                    }

                    {/* --- VIEW: PENGUMUMAN --- */}
                    {activeView === 'pengumuman' && <PengumumanView />}

                    {/* --- VIEW: LAPORAN --- */}
                    {activeView === 'laporan' && <LaporanView />}

                    {/* --- VIEW: MULTIMEDIA --- */}
                    {activeView === 'multimedia' && <MultimediaView />}

                    {/* --- VIEW: PENGATURAN --- */}
                    {activeView === 'settings' && <SettingsView />}

                    {/* --- VIEW: AI MANAGEMENT --- */}
                    {activeView === 'ai_management' && (
                        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
                            <AIManagementView onBack={() => setActiveView('dashboard')} />
                        </div>
                    )}

                    </ProtectedViewWrapper>



                    {/* MODAL INPUT KELAS */}
                    {
                        showAddClassModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">{editItem && editType === 'Kelas' ? 'Edit Kelas' : 'Input Kelas Baru'}</h3>
                                        <button onClick={() => { setShowAddClassModal(false); setEditItem(null); setEditType(''); }}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>


                                    <form key={editItem && editType === 'Kelas' ? `edit-${editItem.id}-${editItem.nama}` : 'new'} onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const customName = (form.elements.namedItem('className') as HTMLInputElement).value;
                                        const tingkat = (form.elements.namedItem('tingkat') as HTMLSelectElement).value;
                                        const paralel = (form.elements.namedItem('paralel') as HTMLInputElement).value;

                                        if (editItem && editType === 'Kelas') {
                                            setClasses(prev => prev.map(c => c.id.toString() === editItem.id.toString() ? {
                                                ...c,
                                                nama: customName || `${tingkat}${paralel}`,
                                                tingkat: parseInt(tingkat),
                                                paralel
                                            } : c));
                                            toast.success("Kelas berhasil diperbarui");
                                        } else {
                                            void handleAddClass(tingkat, paralel, customName).then(() => {
                                                toast.success("Kelas berhasil ditambahkan");
                                            });
                                        }
                                        setShowAddClassModal(false);
                                        setEditItem(null);
                                        setEditType('');
                                    }} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Kelas (Opsional)</label>
                                            <input name="className" defaultValue={editItem && editType === 'Kelas' ? editItem.nama : ''} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500" placeholder="Contoh: 1A" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tingkat</label>
                                                <select name="tingkat" defaultValue={editItem && editType === 'Kelas' ? editItem.tingkat : ''} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none">
                                                    <option value="">Pilih</option>
                                                    {[1, 2, 3, 4, 5, 6].map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Paralel</label>
                                                <input name="paralel" defaultValue={editItem && editType === 'Kelas' ? editItem.paralel : ''} className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none" placeholder="Contoh: A" />
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-4 mt-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">{editItem && editType === 'Kelas' ? 'Update Kelas' : 'Simpan Kelas'}</button>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL INPUT SISWA */}
                    {
                        showAddStudentModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">
                                            {modalMode === 'add' ? 'Tambah Siswa Baru' : modalMode === 'edit' ? 'Edit Data Siswa' : 'Detail Data Siswa'}
                                        </h3>
                                        <button onClick={() => setShowAddStudentModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-2" key={selectedStudent?.id || 'new'}>
                                        {/* Data Pribadi */}
                                        <div className="col-span-1 md:col-span-2">
                                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-1">Data Pribadi</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nomor Induk Siswa (NIS)</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.nis || ''} onChange={e => setSelectedStudent({ ...selectedStudent, nis: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Nomor Induk" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Lengkap</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.nama || ''} onChange={e => setSelectedStudent({ ...selectedStudent, nama: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Nama Lengkap Siswa" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tempat Lahir</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.ttl?.split(', ')[0] || ''} onChange={e => {
                                                const datePart = selectedStudent?.ttl?.split(', ')[1] || '';
                                                setSelectedStudent({ ...selectedStudent, ttl: `${e.target.value}, ${datePart}` });
                                            }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Kota Kelahiran" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tanggal Lahir</label>
                                            <input 
                                                disabled={modalMode === 'view'} 
                                                type="date" 
                                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                                                value={(() => {
                                                    const dateStr = selectedStudent?.ttl?.split(', ')[1];
                                                    if (!dateStr) return '';
                                                    const trimmed = dateStr.trim();
                                                    // Handle ISO format YYYY-MM-DD (dari data lama)
                                                    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
                                                    // Handle format Indonesia: DD Bulan YYYY
                                                    const months: Record<string, string> = {
                                                        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
                                                        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
                                                        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
                                                    };
                                                    const parts = trimmed.split(' ');
                                                    if (parts.length !== 3) return '';
                                                    const day = parts[0].padStart(2, '0');
                                                    const month = months[parts[1]];
                                                    const year = parts[2];
                                                    return month ? `${year}-${month}-${day}` : '';
                                                })()}
                                                onChange={e => {
                                                    if (!e.target.value) return;
                                                    const date = new Date(e.target.value + 'T00:00:00');
                                                    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
                                                    const formatted = date.toLocaleDateString('id-ID', options);
                                                    const place = selectedStudent?.ttl?.split(', ')[0] || '';
                                                    setSelectedStudent({ ...selectedStudent, ttl: `${place}, ${formatted}` });
                                                }} />
                                        </div>

                                        {/* Data Akademik */}
                                        <div className="col-span-1 md:col-span-2 mt-2">
                                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-1">Data Akademik</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Kelas</label>
                                            <select disabled={modalMode === 'view'} value={selectedStudent?.kelas || ''} onChange={e => {
                                                const selectedCls = classes.find(c => c.nama === e.target.value);
                                                setSelectedStudent({ 
                                                    ...selectedStudent, 
                                                    kelas: e.target.value,
                                                    classId: selectedCls?.id,
                                                    tingkat: selectedCls ? selectedCls.tingkat : selectedStudent?.tingkat,
                                                    paralel: selectedCls ? selectedCls.paralel : selectedStudent?.paralel
                                                });
                                            }} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none disabled:opacity-60">
                                                <option value="">- Pilih Kelas -</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.nama}>{c.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Tingkat</label>
                                                <select disabled={modalMode === 'view'} value={selectedStudent?.tingkat || ""} onChange={e => setSelectedStudent({ ...selectedStudent, tingkat: parseInt(e.target.value) })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none disabled:opacity-60">
                                                    <option value="">Pilih</option>
                                                    {[1, 2, 3, 4, 5, 6].map(i => <option key={i} value={i}>{i}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Paralel</label>
                                                <input disabled={modalMode === 'view'} value={selectedStudent?.paralel || ''} onChange={e => setSelectedStudent({ ...selectedStudent, paralel: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none disabled:opacity-60" placeholder="A/B..." />
                                            </div>
                                        </div>

                                        {/* Data Orang Tua */}
                                        <div className="col-span-1 md:col-span-2 mt-2">
                                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-1">Data Orang Tua</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Ayah</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.ayah || ''} onChange={e => setSelectedStudent({ ...selectedStudent, ayah: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Nama Ayah" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Ibu</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.ibu || ''} onChange={e => setSelectedStudent({ ...selectedStudent, ibu: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Nama Ibu" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Pekerjaan Ayah</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.jobAyah || ''} onChange={e => setSelectedStudent({ ...selectedStudent, jobAyah: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Pekerjaan Ayah" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Pekerjaan Ibu</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.jobIbu || ''} onChange={e => setSelectedStudent({ ...selectedStudent, jobIbu: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Pekerjaan Ibu" />
                                        </div>

                                        {/* Akun */}
                                        <div className="col-span-1 md:col-span-2 mt-2">
                                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-1">Akun Siswa</h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Username</label>
                                            <input disabled={modalMode === 'view'} value={selectedStudent?.username || ''} onChange={e => setSelectedStudent({ ...selectedStudent, username: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60" placeholder="Username untuk login" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Password</label>
                                            <input 
                                                disabled={modalMode === 'view'} 
                                                value={selectedStudent?.password && selectedStudent.password.startsWith('$2') ? '' : (selectedStudent?.password || '')} 
                                                onChange={e => setSelectedStudent({ ...selectedStudent, password: e.target.value })} 
                                                type="text" 
                                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors disabled:opacity-60 font-mono" 
                                                placeholder={selectedStudent?.password && selectedStudent.password.startsWith('$2') ? "Sudah Terenkripsi (Ketik untuk ganti)" : "Password akun"} 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <button onClick={() => setShowAddStudentModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">{modalMode === 'view' ? 'Tutup' : 'Batal'}</button>
                                        {modalMode !== 'view' && (
                                            <button onClick={() => {
                                                if (modalMode === 'edit') {
                                                    if (selectedStudent.id) {
                                                        updateStudent(selectedStudent.id, selectedStudent);
                                                        toast.success(`Data ${selectedStudent.nama} berhasil diperbarui!`);
                                                    }
                                                } else {
                                                    if (selectedStudent.nama) {
                                                        const newStudent = {
                                                            id: Date.now(),
                                                            ...selectedStudent
                                                        };
                                                        addNewStudent(newStudent);
                                                        toast.success(`Siswa ${selectedStudent.nama} berhasil ditambahkan!`);
                                                    } else {
                                                        toast.error('Mohon isi nama siswa!');
                                                        return;
                                                    }
                                                }
                                                setShowAddStudentModal(false);
                                            }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Simpan Data</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL EDIT DATA UMUM */}
                    {
                        editItem && !['Kelas', 'Mata Pelajaran', 'Teacher', 'Data Guru'].includes(editType) && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">Edit {editType}</h3>
                                        <button onClick={() => setEditItem(null)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>

                                    <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        {Object.entries(editItem).map(([key, value]) => {
                                            if (key === 'id') return null; // Skip ID
                                            return (
                                                <div key={key}>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                                    <input
                                                        defaultValue={String(value)}
                                                        className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none focus:border-blue-500"
                                                        placeholder={`Masukkan ${key}...`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <button onClick={() => setEditItem(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                        <button onClick={() => { toast.success(`Data ${editType} berhasil diperbarui!`); setEditItem(null); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Simpan Perubahan</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH KELOMPOK */}
                    {
                        showGroupModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">Kelola Kelompok Mata Pelajaran</h3>
                                        <button onClick={() => setShowGroupModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>

                                    <form onSubmit={confirmAddGroup} className="flex gap-2 mb-6">
                                        <input name="groupName" required placeholder="Nama Kelompok Baru..." className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors" />
                                        <button type="submit" className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Tambah</button>
                                    </form>

                                    <div className="max-h-[40vh] overflow-y-auto custom-scrollbar border rounded-xl">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 sticky top-0">
                                                <tr>
                                                    <th className="p-3 border-b text-center w-12">No</th>
                                                    <th className="p-3 border-b">Nama Kelompok</th>
                                                    <th className="p-3 border-b text-center">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subjectGroups.map((g, i) => (
                                                    <tr key={g.id} className="border-b last:border-0 hover:bg-slate-50">
                                                        <td className="p-3 text-center text-slate-500">{i + 1}</td>
                                                        <td className="p-3 font-medium text-slate-700">{g.name}</td>
                                                        <td className="p-3 text-center">
                                                            <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH PELAJARAN */}
                    {
                        showSubjectModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">{editItem && editType === 'Mata Pelajaran' ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                                        <button onClick={() => { setShowSubjectModal(false); setEditItem(null); setEditType(''); }}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>

                                    <form onSubmit={confirmAddSubject} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Mata Pelajaran</label>
                                            <input name="subjectName" defaultValue={editItem && editType === 'Mata Pelajaran' ? editItem.name : ''} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors" placeholder="Contoh: Matematika" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Kode</label>
                                            <input name="subjectCode" defaultValue={editItem && editType === 'Mata Pelajaran' ? editItem.code : ''} required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors" placeholder="Contoh: MP-101" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Untuk Kelas</label>
                                                <div className="relative">
                                                    <input
                                                        readOnly
                                                        value={selectedLevels.length > 0 ? (selectedLevels.includes("Semua Tingkat") ? "Semua Tingkat" : `Tingkat ${selectedLevels.sort().join(', ')}`) : ""}
                                                        placeholder="Pilih tingkat kelas..."
                                                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors mb-2"
                                                    />
                                                    <select
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === "Semua Tingkat") {
                                                                setSelectedLevels(["Semua Tingkat"]);
                                                            } else if (val === "Reset") {
                                                                setSelectedLevels([]);
                                                            } else {
                                                                // Remove "Semua Tingkat" if specific level is selected
                                                                let newLevels = selectedLevels.filter(l => l !== "Semua Tingkat");
                                                                if (!newLevels.includes(val)) {
                                                                    newLevels.push(val);
                                                                }
                                                                setSelectedLevels(newLevels);
                                                            }
                                                            e.target.value = ""; // Reset dropdown to placeholder
                                                        }}
                                                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                                                    >
                                                        <option value="" disabled selected>+ Tambah Tingkat</option>
                                                        <option value="Semua Tingkat">Semua Tingkat (1-6)</option>
                                                        <option value="1">Tingkat 1</option>
                                                        <option value="2">Tingkat 2</option>
                                                        <option value="3">Tingkat 3</option>
                                                        <option value="4">Tingkat 4</option>
                                                        <option value="5">Tingkat 5</option>
                                                        <option value="6">Tingkat 6</option>
                                                        <option value="Reset" className="text-red-500 font-bold">Reset Pilihan</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Kelompok</label>
                                                <select name="subjectGroup" defaultValue={editItem && editType === 'Mata Pelajaran' ? editItem.group : ''} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer">
                                                    {subjectGroups.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => { setShowSubjectModal(false); setEditItem(null); setEditType(''); }} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">{editItem && editType === 'Mata Pelajaran' ? 'Simpan Perubahan' : 'Simpan'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH JABATAN */}
                    {
                        showPositionModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">{editItem ? 'Edit' : 'Tambah'} Jabatan</h3>
                                        <button onClick={() => setShowPositionModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>
                                    <form onSubmit={confirmAddPosition} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Jabatan</label>
                                            <input name="positionName" required defaultValue={editItem?.nama || ''} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors" placeholder="Contoh: Kepala Lab Komputer" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Kategori</label>
                                            <select name="positionCategory" defaultValue={editItem?.kategori || 'Struktural'} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer">
                                                <option value="Struktural">Struktural</option>
                                                <option value="Fungsional">Fungsional</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Teknis">Teknis</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => setShowPositionModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">{editItem ? 'Update' : 'Simpan'}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH WAKTU JADWAL */}
                    {
                        showTimeModal && (
                            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">Tambah Jam Pelajaran</h3>
                                        <button onClick={() => setShowTimeModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>
                                    <form onSubmit={confirmAddTime} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jam Mulai</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={newPeriodData.start}
                                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, start: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jam Selesai</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={newPeriodData.end}
                                                    onChange={(e) => setNewPeriodData({ ...newPeriodData, end: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => setShowTimeModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Tambah</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH SEMESTER JADWAL */}
                    {
                        showSemesterModal && (
                            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                <Calendar size={20} />
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800">Tambah Semester</h3>
                                        </div>
                                        <button onClick={() => setShowSemesterModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>
                                    <form onSubmit={confirmAddSemester} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Semester / Tahun Ajaran</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Contoh: Genap 2025/2026"
                                                value={newSemesterName}
                                                onChange={(e) => setNewSemesterName(e.target.value)}
                                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                                            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-700 leading-relaxed italic">
                                                Semester baru akan dimulai dengan jadwal kosong (Draft). Anda perlu mengatur ulang jadwal per kelas.
                                            </p>
                                        </div>
                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => setShowSemesterModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Buat Semester</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* MODAL TAMBAH GURU */}
                    {
                        showTeacherModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">{editItem && (editType === 'Teacher' || editType === 'Data Guru') ? 'Edit Guru & Staff' : 'Tambah Guru & Staff Baru'}</h3>
                                        <button onClick={() => { setShowTeacherModal(false); setEditItem(null); setEditType(''); }}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSaveTeacher(); }} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Lengkap</label>
                                                <input
                                                    value={newTeacher.nama}
                                                    onChange={(e) => setNewTeacher({ ...newTeacher, nama: e.target.value })}
                                                    required
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="Nama Lengkap dengan Gelar"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">NIP (Opsional)</label>
                                                <input
                                                    value={newTeacher.nip}
                                                    onChange={(e) => setNewTeacher({ ...newTeacher, nip: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="Nomor Induk Pegawai"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Jabatan</label>
                                                <select
                                                    value={newTeacher.jabatan}
                                                    onChange={(e) => setNewTeacher({ ...newTeacher, jabatan: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                                                >
                                                    {positions.map(p => (
                                                        <option key={p.id} value={p.nama}>{p.nama}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Wali Kelas (Opsional)</label>
                                                <select
                                                    value={newTeacher.class}
                                                    onChange={(e) => setNewTeacher({ ...newTeacher, class: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                                                    disabled={newTeacher.jabatan !== 'Guru Kelas' && newTeacher.jabatan !== 'Wali Kelas'}
                                                >
                                                    <option value="">- Bukan Wali Kelas -</option>
                                                    {classes.map(c => (
                                                        <option key={c.id} value={c.nama}>{c.nama}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                             <div>
                                                 <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Username</label>
                                                 <input
                                                     value={newTeacher.username}
                                                     onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                                     required
                                                     className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
                                                     placeholder="Username untuk Login"
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Password</label>
                                                 <input
                                                     type="text"
                                                     value={newTeacher.password && newTeacher.password.startsWith('$2') ? '' : newTeacher.password}
                                                     onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                                     required={!newTeacher.password || !newTeacher.password.startsWith('$2')}
                                                     className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition-colors font-mono"
                                                     placeholder={newTeacher.password && newTeacher.password.startsWith('$2') ? "Sudah Terenkripsi (Ketik untuk ganti)" : "Password untuk Login"}
                                                 />
                                             </div>
                                         </div>

                                         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 text-sm text-blue-800">
                                             <p><strong>Info:</strong> Username dan Password di atas akan digunakan guru ini untuk masuk ke Sistem Informasi Manajemen (EduAdmin).</p>
                                         </div>




                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => setShowTeacherModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Simpan Data Guru</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                    {/* MODAL PLOTTING GURU MAPEL */}
                    {
                        showPlottingModal && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in backdrop-blur-sm p-4">
                                <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <h3 className="font-bold text-lg text-slate-800">Plotting Guru & Mata Pelajaran</h3>
                                        <button onClick={() => setShowPlottingModal(false)}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                                    </div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const teacherIdValue = (form.elements.namedItem('teacherId') as HTMLSelectElement).value;
                                        // Use number if it's a numeric string, otherwise keep as string (for UUIDs)
                                        const teacherId = isNaN(Number(teacherIdValue)) ? teacherIdValue : Number(teacherIdValue);
                                        
                                        const classNama = (form.elements.namedItem('classNama') as HTMLSelectElement).value;
                                        const mapelOptions = (form.elements.namedItem('mapelIds') as HTMLSelectElement).selectedOptions;
                                        const subjectIds = Array.from(mapelOptions).map(opt => isNaN(Number(opt.value)) ? opt.value : Number(opt.value));

                                        if (teacherId && classNama && subjectIds.length > 0) {
                                            setTeacherAssignments([...teacherAssignments, {
                                                id: Date.now(),
                                                teacherId,
                                                classNama,
                                                subjectIds
                                            }]);
                                            setShowPlottingModal(false);
                                        } else {
                                            toast.error("Mohon lengkapi semua data!");
                                        }
                                    }} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Nama Guru</label>
                                            <select name="teacherId" required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const tid = isNaN(Number(val)) ? val : Number(val);
                                                    const guru = teachers.find(t => t.id === tid);
                                                    // Auto-fill NIP logic can be purely visual here or managed via state if needed
                                                    const nipInput = document.getElementById('plotting-nip') as HTMLInputElement;
                                                    if (nipInput) nipInput.value = guru?.nip || '-';
                                                }}
                                            >
                                                <option value="">Pilih Guru</option>
                                                {teachers.filter(t => t.nama !== 'Super Admin' && t.role !== 'admin').map(t => (
                                                    <option key={t.id} value={t.id}>{t.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">NIP</label>
                                            <input id="plotting-nip" readOnly className="w-full p-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed" placeholder="Otomatis terisi..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Untuk Kelas</label>
                                            <select name="classNama" required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer">
                                                <option value="">Pilih Kelas</option>
                                                {classes.map(c => (
                                                    <option key={c.id} value={c.nama}>{c.nama}</option>
                                                ))}

                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Mata Pelajaran (Bisa Pilih Banyak: Tahan Ctrl)</label>
                                            <select name="mapelIds" multiple required className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 cursor-pointer h-32">
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1 italic ml-1">*Tahan tombol Ctrl (Windows) atau Command (Mac) untuk memilih lebih dari satu.</p>
                                        </div>

                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={() => setShowPlottingModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">Batal</button>
                                            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Simpan Plotting</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )
                    }
                    {/* MODAL TAMBAH JADAWAL UJIAN */}
                    <AddExamModal
                        isOpen={showExamModal}
                        onClose={() => setShowExamModal(false)}
                        newExamData={newExamData}
                        setNewExamData={setNewExamData}
                        examSchedules={examSchedules}
                        setExamSchedules={setExamSchedules}
                        setActiveExamId={setActiveExamId}
                    />

                    {/* MODAL TAMBAH NASABAH TABUNGAN */}
                    <AddSaverModal
                        isOpen={showAddSaverModal}
                        onClose={() => setShowAddSaverModal(false)}
                        savingsData={savingsData}
                        setSavingsData={setSavingsData}
                        newSaverId={newSaverId}
                        setNewSaverId={setNewSaverId}
                        saverClassFilter={saverClassFilter}
                        setSaverClassFilter={setSaverClassFilter}
                    />

                    {/* CONFIRMATION MODAL */}
                    {confirmModal.show && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trash2 size={32} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Tindakan</h3>
                                    <p className="text-slate-500 text-sm">{confirmModal.message}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmModal({ show: false, message: '', onConfirm: () => { } })}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmModal.onConfirm}
                                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                                    >
                                        Ya, Lanjutkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* Modal Konfirmasi Hapus Kelas */}
            {confirmDeleteClassId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setConfirmDeleteClassId(null); setDeleteClassError(null); }} />
                    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-base">Hapus Kelas</h3>
                                <p className="text-sm text-slate-500 mt-1">Kelas yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?</p>
                            </div>
                            <button onClick={() => { setConfirmDeleteClassId(null); setDeleteClassError(null); }} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                        {deleteClassError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                                {deleteClassError}
                            </div>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setConfirmDeleteClassId(null); setDeleteClassError(null); }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                            >
                                Batal
                            </button>
                            <button
                                disabled={isDeletingClass}
                                onClick={async () => {
                                    setIsDeletingClass(true);
                                    const result = await handleDeleteClass(confirmDeleteClassId);
                                    setIsDeletingClass(false);
                                    if (result && !result.success && result.error) {
                                        setDeleteClassError(result.error);
                                    } else {
                                        setConfirmDeleteClassId(null);
                                        setDeleteClassError(null);
                                    }
                                }}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeletingClass ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardSuperAdmin;
