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

import { studentsDataGlobal, teachersDataGlobal, classesDataGlobal, examsDataGlobal, updateExamsDataGlobal, MasterExamSchedule, ExamScheduleItem, tutoringSubjectsGlobal, updateTutoringSubjectsGlobal, tutoringTeachersGlobal, updateTutoringTeachersGlobal } from '../data/sharedData';
import { toast, Toaster } from 'react-hot-toast';
import { hashPassword } from '../utils/auth';
import Sidebar from './DashboardSuperAdmin/components/Sidebar';
import ProtectedModule from './ProtectedModule';

import DashboardHome from './DashboardSuperAdmin/components/views/DashboardHome';
import GuruStaffView from './DashboardSuperAdmin/components/views/GuruStaffView';
import TeacherDataView from './DashboardSuperAdmin/components/views/TeacherDataView';
import JabatanView from './DashboardSuperAdmin/components/views/JabatanView';
import MataPelajaranView from './DashboardSuperAdmin/components/views/MataPelajaranView';
import AddBankModal from './DashboardSuperAdmin/components/modals/AddBankModal';
import AddPaymentTypeModal from './DashboardSuperAdmin/components/modals/AddPaymentTypeModal';
import EditPaymentTypeModal from './DashboardSuperAdmin/components/modals/EditPaymentTypeModal';
import EditYearModal from './DashboardSuperAdmin/components/modals/EditYearModal';

import JadwalUjianView from './DashboardSuperAdmin/components/views/JadwalUjianView';
import KelasWaliView from './DashboardSuperAdmin/components/views/KelasWaliView';
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
import AuditLogView from './DashboardSuperAdmin/components/views/AuditLogView';
import RapotDashboardView from './DashboardSuperAdmin/components/views/RapotDashboardView';
import TabunganView from './DashboardSuperAdmin/components/views/TabunganView';
import NaikKelasView from './DashboardSuperAdmin/components/views/NaikKelasView';
import BimbinganBelajarView from './DashboardSuperAdmin/components/views/BimbinganBelajarView';
import { useStudents } from './DashboardSuperAdmin/hooks/useStudents';
import { useTeachers } from './DashboardSuperAdmin/hooks/useTeachers';
import { useClasses } from './DashboardSuperAdmin/hooks/useClasses';
import { useSubjects } from './DashboardSuperAdmin/hooks/useSubjects';
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
    ai_management: 'manajemen-ai',
    audit_log: 'pengaturan'
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

    // Data operasional sekarang bersumber dari D1, bukan localStorage.
    // Lihat hooks/ masing-masing untuk detail implementasi.

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
    const [positions, setPositions] = useState<{ id: number; nama: string; kategori: string }[]>([
        { id: 1, nama: 'Kepala Sekolah', kategori: 'Struktural' },
        { id: 2, nama: 'Wakil Kurikulum', kategori: 'Struktural' },
        { id: 3, nama: 'Guru Kelas', kategori: 'Fungsional' },
        { id: 4, nama: 'Guru Mata Pelajaran', kategori: 'Fungsional' },
        { id: 5, nama: 'Staff Tata Usaha', kategori: 'Staff' },
        { id: 6, nama: 'Operator Data', kategori: 'Teknis' },
    ]);

    // --- JADWAL state managed internally by JadwalPelajaranView ---

    // --- PLOTTING STATE ---
    const [mapelViewMode, setMapelViewMode] = useState<'master' | 'plotting'>('plotting'); // Default to plotting as requested
    const [teacherAssignments, setTeacherAssignments] = useState<{ id?: number; classNama: string; subjectIds: number[]; teacherId: string | number }[]>([]);
    const [showPlottingModal, setShowPlottingModal] = useState(false);
    const [showPositionModal, setShowPositionModal] = useState(false);
    const { teachers, setTeachers, addTeacher } = useTeachers();
    const [newTeacher, setNewTeacher] = useState({ nama: '', nip: '', jabatan: 'Guru Mata Pelajaran', mapel: '', class: '', username: '', password: '' });
    const [showTeacherModal, setShowTeacherModal] = useState(false);

    const { classes, setClasses, showAddClassModal, setShowAddClassModal, handleAddClass, handleDeleteClass } = useClasses();
    const [confirmDeleteClassId, setConfirmDeleteClassId] = useState<string | number | null>(null);
    const [deleteClassError, setDeleteClassError] = useState<string | null>(null);
    const [isDeletingClass, setIsDeletingClass] = useState(false);

    // --- ABSENSI state managed internally by AbsensiView ---

    // --- UJIAN STATE (Using Custom Hook) ---
    const { examSchedules, setExamSchedules, refreshExams } = useExams();

    const [activeExamId, setActiveExamId] = useState<number | null>(examsDataGlobal.length > 0 ? (examsDataGlobal[0].id as number) : null);
    useEffect(() => {
        if (examSchedules.length > 0 && activeExamId === null) {
            setActiveExamId(examSchedules[0].id as number);
        }
    }, [examSchedules, activeExamId]);
    // --- GENERIC CONFIRMATION MODAL STATE ---
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        message: '',
        onConfirm: () => { }
    });






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

    // --- JADWAL HANDLERS managed internally by JadwalPelajaranView ---

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
                            classes={classes}
                            subjects={subjects}
                            teacherAssignments={teacherAssignments}
                            teachers={teachers}
                            setConfirmModal={setConfirmModal}
                        />
                    )}


                    {/* --- VIEW: ABSENSI SISWA --- */}
                    {activeView === 'absen' && (
                        <AbsensiView
                            students={students}
                            classes={classes}
                            subjects={subjects}
                        />
                    )}


                    {/* --- VIEW: KELAS DAN WALI KELAS --- */}
                    {activeView === 'kelas_wali' && (
                        <KelasWaliView
                            derivedClasses={derivedClasses}
                            onEditClass={(kelas) => handleEditItem(kelas, 'Kelas')}
                            onDeleteClass={(id) => handleDeleteClass(id as number)}
                        />
                    )}

                    {/* --- VIEW: JADWAL UJIAN --- */}
                    {activeView === 'ujian' && (
                        <JadwalUjianView
                            examSchedules={examSchedules}
                            setExamSchedules={setExamSchedules}
                            activeExamId={activeExamId}
                            setActiveExamId={setActiveExamId}
                            subjects={subjects}
                            derivedClasses={derivedClasses}
                            setConfirmModal={setConfirmModal}
                        />
                    )}



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

                    {/* --- VIEW: AUDIT LOG --- */}
                    {activeView === 'audit_log' && (
                        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
                            <AuditLogView onBack={() => setActiveView('dashboard')} />
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
