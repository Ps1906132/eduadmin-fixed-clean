
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataSiswa from './components/DataSiswa';
import TambahKelas from './components/TambahKelas';
import UploadSiswa from './components/UploadSiswa';
import UploadPerkelas from './components/UploadPerkelas';
import UploadSiswaBaru from './components/UploadSiswaBaru';
import DataGuruStaff from './components/DataGuruStaff';
import KelasWali from './components/KelasWali';
import MataPelajaran from './components/MataPelajaran';
import Jadwal from './components/Jadwal';
import Absen from './components/Absen';
import Nilai from './components/Nilai';
import Rapot from './components/Rapot';
import Keuangan from './components/Keuangan';
import Tabungan from './components/Tabungan';
import NaikKelas from './components/NaikKelas';
import BimbinganBelajar from './components/BimbinganBelajar';
import Pengumuman from './components/Pengumuman';
import Laporan from './components/Laporan';
import Pengaturan from './components/Pengaturan';
import Login from './components/Login';
import DashboardOrangTua from './components/DashboardOrangTua';
import DashboardGuruMapel from './components/DashboardGuruMapel';
import DashboardWaliKelas from './components/DashboardWaliKelas';
import DashboardGuruBimbel from './components/DashboardGuruBimbel';
import DashboardSuperAdmin from './components/DashboardSuperAdmin';
import DashboardKepalaSekolah from './components/DashboardKepalaSekolah';

// --- RBAC: Fase 1 & 2 — Permission Guard & Audit Log ---
// Sumber: TEKNIS_DATABASE_CODE.md (Middleware), KODE_SIAP_PAKAI.md (Policy)
import ProtectedModule from './components/ProtectedModule';
import { logAuthEvent } from './src/lib/rbac/auditLog';

import { schoolSettingsGlobal, updateAnnouncementsGlobal } from './data/sharedData';


import { useStudents } from './components/DashboardSuperAdmin/hooks/useStudents';
import { useTeachers } from './components/DashboardSuperAdmin/hooks/useTeachers';
import { useClasses } from './components/DashboardSuperAdmin/hooks/useClasses';
import { useSubjects } from './components/DashboardSuperAdmin/hooks/useSubjects';
import { db, auth, isConfigured as isDbConfigured } from './src/lib/db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('beranda');
  // Mobile Responsive Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // --- UTILS ---
  const mapRoleToCode = (role: string) => {
    const r = (role || '').toLowerCase().trim();
    // Prioritas Orang Tua / Siswa
    if (r === 'ot' || r === 'ortu' || r.includes('orang tua') || r.includes('wali murid') || r.includes('parent') || r.includes('ortu')) return 'ot';
    if (r === 'siswa' || r.includes('murid') || r.includes('student')) return 'ot';
    
    if (r === 'ks' || r.includes('kepala sekolah')) return 'ks';
    if (r === 'wk' || r.includes('wali kelas') || r.includes('guru kelas')) return 'wk';
    if (r === 'gb' || r.includes('bimbel') || r.includes('les')) return 'gb';
    if (r === 'admin' || ['kurikulum', 'keuangan', 'multimedia', 'tata usaha', 'operator', 'super admin'].some(x => r.includes(x))) return 'admin';
    return 'gm'; // Default untuk guru mata pelajaran
  };

  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('eduadmin_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return mapRoleToCode(parsed.roleCode || parsed.role || '').toLowerCase();
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    return '';
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- PERSISTENT SESSION CHECK ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await auth.getUser();

      if (user) {
        const role = mapRoleToCode(user.roleCode || user.role || '').toLowerCase();
        setUserRole(role);
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    };

    checkSession();
  }, []);

  // --- HAPUS DATA DEMO BUATAN AI (SEKALI JALAN) ---
  useEffect(() => {
    const CLEANUP_VERSION = 'cleanup_v4'; // naikkan versi ini jika perlu jalankan ulang
    if (localStorage.getItem(CLEANUP_VERSION)) return; // sudah pernah dibersihkan

    // Demo NIS siswa buatan AI
    const AI_STUDENT_NIS = ['202401001','202401002','202401003','202402001','202402002','202403001','202403002','202403003','202403004','202403005'];
    // Demo username guru buatan AI
    const AI_TEACHER_USERNAMES = ['adminmultimedia', 'budikurikulum', 'tatausaha', 'kepsek', 'admin'];
    // Demo nama kelas buatan AI
    const AI_CLASS_NAMES = ['1A','1B','2','2A','2B','3A','3B','4A','5A','6B'];

    // Bersihkan siswa demo
    const rawStudents = localStorage.getItem('students_data_v11');
    if (rawStudents) {
      const students = JSON.parse(rawStudents);
      const cleaned = students.filter((s: any) => !AI_STUDENT_NIS.includes(s.nis));
      if (cleaned.length !== students.length) {
        localStorage.setItem('students_data_v11', JSON.stringify(cleaned));
        console.info(`[Cleanup] Dihapus ${students.length - cleaned.length} siswa demo dari localStorage.`);
      }
    }

    // Bersihkan guru demo
    const rawTeachers = localStorage.getItem('teachers_data_v11');
    if (rawTeachers) {
      const teachers = JSON.parse(rawTeachers);
      const cleaned = teachers.filter((t: any) => !AI_TEACHER_USERNAMES.includes(t.username));
      if (cleaned.length !== teachers.length) {
        localStorage.setItem('teachers_data_v11', JSON.stringify(cleaned));
        console.info(`[Cleanup] Dihapus ${teachers.length - cleaned.length} guru demo dari localStorage.`);
      }
    }

    // Bersihkan kelas demo
    const rawClasses = localStorage.getItem('classes_data_v11');
    if (rawClasses) {
      const classes = JSON.parse(rawClasses);
      const cleaned = classes.filter((c: any) => !AI_CLASS_NAMES.includes(c.nama));
      if (cleaned.length !== classes.length) {
        localStorage.setItem('classes_data_v11', JSON.stringify(cleaned));
        console.info(`[Cleanup] Dihapus ${classes.length - cleaned.length} kelas demo dari localStorage.`);
      }
    }

    localStorage.setItem(CLEANUP_VERSION, 'done');
    console.info('[Cleanup] Pembersihan data demo AI selesai.');
  }, []);

  // --- INTEGRATED DATA HOOKS ---
  const { students } = useStudents();
  const { teachers, setTeachers } = useTeachers();
  const { classes, setClasses } = useClasses();
  const { subjects, setSubjects } = useSubjects();

  // Derived / Mapped Data for Legacy Components
  const kelasData = classes.map((c: { id: string | number; nama: string; tingkat: number; paralel: string }) => ({
    id: typeof c.id === 'string' ? parseInt(c.id) || 0 : c.id as number,
    kode: `KLS-${c.nama}`,
    nama: isNaN(parseInt(c.nama[0])) ? c.nama : `Kelas ${c.nama}`,
    tingkat: c.tingkat.toString(),
    paralel: c.paralel,
    wali: teachers.find((t: { wali?: string; nama: string }) => t.wali === c.nama)?.nama || 'Belum Ditentukan',
    waliNip: teachers.find((t: { wali?: string; nip: string }) => t.wali === c.nama)?.nip || '-'
  }));

  const stafList = teachers.map((t: { nip: string; nama: string; jabatan: string; username: string; password: string }, idx: number) => ({
    no: idx + 1,
    noPegawai: t.nip,
    nama: t.nama,
    jabatan: t.jabatan,
    username: t.username,
    password: t.password
  }));

  const mapelData = subjects.map((s: { name: string; code: string; level: string; group: string }, idx: number) => ({
    no: idx + 1,
    nama: s.name,
    kode: s.code,
    kelas: s.level.replace('Kelas ', ''),
    kelompok: s.group
  }));

  const studentsDataByClass: Record<string, { no: number; nis: string; nama: string; gender: string }[]> = {};
  students.forEach((s: { kelas: string; nis: string; nama: string; gender?: string }) => {
    const rawKey = s.kelas; // e.g. '1A'
    const displayKey = isNaN(parseInt((s.kelas || '')[0])) ? s.kelas : `Kelas ${s.kelas}`; // e.g. 'Kelas 1A'

    const entry = {
      no: 0, // will be set below
      nis: s.nis,
      nama: s.nama,
      gender: s.gender || 'L'
    };

    // Index by raw key (used by DashboardSuperAdmin internal views)
    if (!studentsDataByClass[rawKey]) studentsDataByClass[rawKey] = [];
    entry.no = studentsDataByClass[rawKey].length + 1;
    studentsDataByClass[rawKey].push({ ...entry });

    // Also index by display key (used by KelasWali.tsx via kelasData.nama)
    if (displayKey !== rawKey) {
      if (!studentsDataByClass[displayKey]) studentsDataByClass[displayKey] = [];
      studentsDataByClass[displayKey].push({ ...entry, no: studentsDataByClass[displayKey].length + 1 });
    }
  });

  const handleLogin = (role: string, user: any) => {
    const normalizedRole = mapRoleToCode(role || user?.roleCode || user?.role || '').toLowerCase();
    setUserRole(normalizedRole);
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('eduadmin_user', JSON.stringify({ ...user, roleCode: normalizedRole }));
    // Fase 2: Audit log LOGIN — sesuai PERMISSION_MATRIX.md § Session Management
    logAuthEvent({ action: 'LOGIN', user_id: user?.id, user_role: normalizedRole });
  };

  const handleLogout = () => {
    // Fase 2: Audit log LOGOUT — sesuai PERMISSION_MATRIX.md § Session Management
    logAuthEvent({ action: 'LOGOUT', user_id: currentUser?.id, user_role: userRole });
    auth.signOut();
    setIsLoggedIn(false);
    setUserRole('');
    setCurrentUser(null);
    setActiveTab('beranda');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- INITIALIZE GLOBAL DATA ---
  useEffect(() => {
    // Sync Announcements from LocalStorage to Global State once on load
    const savedAnnouncements = localStorage.getItem('announcements_data_v10');
    if (savedAnnouncements) {
      try {
        updateAnnouncementsGlobal(JSON.parse(savedAnnouncements));
      } catch (e) {
        console.error("Failed to sync announcements", e);
      }
    }
  }, []);


  // --- ATTENDANCE STATE SYNC ---
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, 'H' | 'S' | 'I' | 'A'>>>(() => {
    const saved = localStorage.getItem('attendance_data_v1_legacy');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('attendance_data_v1_legacy', JSON.stringify(attendanceData));
  }, [attendanceData]);


  // Grades: { "Class_Subject_Category": { "nis": { "UH 1": "90" } } }
  const [gradesData, setGradesData] = useState<Record<string, Record<string, Record<string, string>>>>({});
  // Columns: { "Class_Subject_Category": ["UH 1", "UH 2"] }
  const [customColumnsData, setCustomColumnsData] = useState<Record<string, string[]>>({});

  // --- SETTINGS STATE ---
  const [schoolSettings, setSchoolSettings] = useState(() => {
    const saved = localStorage.getItem('school_settings_v10');
    if (saved) return JSON.parse(saved);
    return {
      name: schoolSettingsGlobal.name,
      address: schoolSettingsGlobal.address,
      accreditation: 'A',
      principal: schoolSettingsGlobal.principal,
      academicYear: schoolSettingsGlobal.academicYear,
      bannerImage: '',
      logo: schoolSettingsGlobal.logo || '',
      icon: schoolSettingsGlobal.icon || ''
    };
  });

  // Persist Settings & Update Favicon
  useEffect(() => {
    localStorage.setItem('school_settings_v10', JSON.stringify(schoolSettings));

    // Global sync for legacy components
    Object.assign(schoolSettingsGlobal, schoolSettings);

    // Update Favicon dynamically
    if (schoolSettings.icon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = schoolSettings.icon;
    }
  }, [schoolSettings]);


  if (!isLoggedIn) {
    return (
      <Login
        onLogin={handleLogin}
        schoolName={schoolSettings.name}
        bannerImage={schoolSettings.bannerImage}
        logo={schoolSettings.logo}
      />
    );
  }

  // --- DASHBOARDS ---
  if (userRole === 'ot' || userRole === 'ortu' || userRole === 'orang-tua') return <DashboardOrangTua user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;
  if (userRole === 'wk') return <DashboardWaliKelas user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;
  if (userRole === 'gb') return <DashboardGuruBimbel user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;
  if (userRole === 'gm') return <DashboardGuruMapel user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;
  if (['admin', 'kurikulum', 'keuangan', 'multimedia'].includes(userRole)) return <DashboardSuperAdmin user={currentUser} onLogout={handleLogout} />;
  if (userRole === 'ks') return <DashboardKepalaSekolah user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Mobile Responsive */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        schoolSettings={schoolSettings}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} user={currentUser} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'beranda' && <Dashboard />}

            {/* ================================================================
                MODUL ADMIN (9 Modul) — Fase 2: ProtectedModule Guard
                Sumber: PERMISSION_MATRIX.md § ADMIN ROLE
                        TEKNIS_DATABASE_CODE.md § AdminMiddleware
            ================================================================ */}
            {activeTab === 'data-siswa' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-siswa">
                <DataSiswa
                  onTambahKelas={() => setActiveTab('tambah-kelas')}
                  onUploadSiswa={() => setActiveTab('upload-siswa')}
                  onUploadPerkelas={() => setActiveTab('upload-perkelas')}
                  onUploadSiswaBaru={() => setActiveTab('upload-siswa-baru')}
                />
              </ProtectedModule>
            )}
            {activeTab === 'data-guru' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-guru">
                <DataGuruStaff
                  mapelList={mapelData}
                  setMapelList={setSubjects as any}
                  stafList={stafList}
                  setStafList={setTeachers as any}
                  kelasData={kelasData}
                  setKelasData={setClasses as any}
                />
              </ProtectedModule>
            )}
            {activeTab === 'kelas-wali' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="kelas-wali">
                <KelasWali
                  kelasData={kelasData}
                  studentsData={studentsDataByClass}
                />
              </ProtectedModule>
            )}
            {activeTab === 'mata-pelajaran' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="mata-pelajaran">
                <MataPelajaran
                  kelasData={kelasData}
                  mapelList={mapelData}
                  stafList={stafList}
                />
              </ProtectedModule>
            )}

            {activeTab === 'tambah-kelas' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-siswa" requiredAction="CREATE">
                <TambahKelas
                  onBack={() => setActiveTab('data-siswa')}
                  kelasData={kelasData}
                  setKelasData={setClasses as any}
                />
              </ProtectedModule>
            )}
            {activeTab === 'upload-siswa' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-siswa" requiredAction="CREATE">
                <UploadSiswa onBack={() => setActiveTab('data-siswa')} />
              </ProtectedModule>
            )}
            {activeTab === 'upload-perkelas' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-siswa" requiredAction="CREATE">
                <UploadPerkelas onBack={() => setActiveTab('data-siswa')} />
              </ProtectedModule>
            )}
            {activeTab === 'upload-siswa-baru' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="data-siswa" requiredAction="CREATE">
                <UploadSiswaBaru onBack={() => setActiveTab('data-siswa')} />
              </ProtectedModule>
            )}

            {/* ================================================================
                MODUL KURIKULUM (6 Modul) — Fase 2: ProtectedModule Guard
                Sumber: PERMISSION_MATRIX.md § KURIKULUM ROLE
                        TEKNIS_DATABASE_CODE.md § KurikulumMiddleware
            ================================================================ */}
            {activeTab === 'jadwal' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="jadwal">
                <Jadwal kelasData={kelasData} mapelData={mapelData} />
              </ProtectedModule>
            )}
            {activeTab === 'absen' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="absen">
                <Absen
                  kelasData={kelasData}
                  studentsData={studentsDataByClass}
                  attendanceData={attendanceData}
                  setAttendanceData={setAttendanceData}
                />
              </ProtectedModule>
            )}
            {activeTab === 'nilai' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="nilai">
                <Nilai
                  kelasData={kelasData}
                  studentsData={studentsDataByClass}
                  mapelData={mapelData}
                  gradesData={gradesData}
                  setGradesData={setGradesData}
                  customColumnsData={customColumnsData}
                  setCustomColumnsData={setCustomColumnsData}
                />
              </ProtectedModule>
            )}
            {activeTab === 'rapot' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="rapot">
                <Rapot
                  studentsData={studentsDataByClass}
                  gradesData={gradesData}
                  attendanceData={attendanceData}
                  schoolSettings={schoolSettings}
                />
              </ProtectedModule>
            )}
            {activeTab === 'naik-kelas' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="naik-kelas">
                <NaikKelas />
              </ProtectedModule>
            )}

            {/* ================================================================
                MODUL KEUANGAN (3 Modul) — Fase 2: ProtectedModule Guard
                Sumber: PERMISSION_MATRIX.md § KEUANGAN ROLE
                        TEKNIS_DATABASE_CODE.md § KeuanganMiddleware
            ================================================================ */}
            {activeTab === 'keuangan' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="keuangan">
                <Keuangan />
              </ProtectedModule>
            )}
            {activeTab === 'tabungan' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="tabungan">
                <Tabungan />
              </ProtectedModule>
            )}
            {activeTab === 'laporan' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="laporan">
                <Laporan />
              </ProtectedModule>
            )}

            {/* ================================================================
                MODUL ADMIN LANJUTAN — Tetap di Admin
                Sumber: START_HERE.md § DISTRIBUSI MODUL (Admin: 9 modul)
            ================================================================ */}
            {activeTab === 'bimbingan' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="bimbingan">
                <BimbinganBelajar />
              </ProtectedModule>
            )}
            {activeTab === 'pengumuman' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="pengumuman">
                <Pengumuman />
              </ProtectedModule>
            )}
            {activeTab === 'pengaturan' && (
              <ProtectedModule userRole={userRole} userId={currentUser?.id} module="pengaturan">
                <Pengaturan schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} />
              </ProtectedModule>
            )}

            {!['beranda', 'data-siswa', 'data-guru', 'kelas-wali', 'mata-pelajaran', 'tambah-kelas', 'upload-siswa', 'upload-perkelas', 'upload-siswa-baru', 'jadwal', 'absen', 'nilai', 'rapot', 'keuangan', 'tabungan', 'naik-kelas', 'bimbingan', 'pengumuman', 'laporan', 'pengaturan'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace(/-/g, ' ')}</h2>
                <p className="text-slate-500 mt-2">Halaman ini sedang dalam pengembangan.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
