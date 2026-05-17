
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
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- PERSISTENT SESSION CHECK ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await auth.getUser();

      if (user) {
        setUserRole(user.role);
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    };

    checkSession();
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
    const className = s.kelas;
    if (!studentsDataByClass[className]) studentsDataByClass[className] = [];
    studentsDataByClass[className].push({
      no: studentsDataByClass[className].length + 1,
      nis: s.nis,
      nama: s.nama,
      gender: s.gender || 'L'
    });
  });

  const handleLogin = (role: string, user: any) => {
    setUserRole(role);
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('eduadmin_user', JSON.stringify({ role, ...user }));
  };

  const handleLogout = () => {
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
  if (userRole === 'ot') return <DashboardOrangTua user={currentUser} onLogout={handleLogout} schoolName={schoolSettings.name} />;
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
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} user={currentUser} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'beranda' && <Dashboard />}
            {activeTab === 'data-siswa' && (
              <DataSiswa
                onTambahKelas={() => setActiveTab('tambah-kelas')}
                onUploadSiswa={() => setActiveTab('upload-siswa')}
                onUploadPerkelas={() => setActiveTab('upload-perkelas')}
                onUploadSiswaBaru={() => setActiveTab('upload-siswa-baru')}
              />
            )}
            {activeTab === 'data-guru' && (
              <DataGuruStaff
                mapelList={mapelData}
                setMapelList={setSubjects as any}
                stafList={stafList}
                setStafList={setTeachers as any}
                kelasData={kelasData}
                setKelasData={setClasses as any}
              />
            )}
            {activeTab === 'kelas-wali' && (
              <KelasWali
                kelasData={kelasData}
                studentsData={studentsDataByClass}
              />
            )}
            {activeTab === 'mata-pelajaran' && (
              <MataPelajaran
                kelasData={kelasData}
                mapelList={mapelData}
                stafList={stafList}
              />
            )}

            {activeTab === 'tambah-kelas' && (
              <TambahKelas
                onBack={() => setActiveTab('data-siswa')}
                kelasData={kelasData}
                setKelasData={setClasses as any}
              />
            )}
            {activeTab === 'upload-siswa' && <UploadSiswa onBack={() => setActiveTab('data-siswa')} />}
            {activeTab === 'upload-perkelas' && <UploadPerkelas onBack={() => setActiveTab('data-siswa')} />}
            {activeTab === 'upload-siswa-baru' && <UploadSiswaBaru onBack={() => setActiveTab('data-siswa')} />}

            {activeTab === 'jadwal' && <Jadwal kelasData={kelasData} mapelData={mapelData} />}
            {activeTab === 'absen' && (
              <Absen
                kelasData={kelasData}
                studentsData={studentsDataByClass}
                attendanceData={attendanceData}
                setAttendanceData={setAttendanceData}
              />
            )}
            {activeTab === 'nilai' && (
              <Nilai
                kelasData={kelasData}
                studentsData={studentsDataByClass}
                mapelData={mapelData}
                gradesData={gradesData}
                setGradesData={setGradesData}
                customColumnsData={customColumnsData}
                setCustomColumnsData={setCustomColumnsData}
              />
            )}
            {activeTab === 'rapot' && (
              <Rapot
                studentsData={studentsDataByClass}
                gradesData={gradesData}
                attendanceData={attendanceData}
                schoolSettings={schoolSettings}
              />
            )}
            {activeTab === 'keuangan' && <Keuangan />}
            {activeTab === 'tabungan' && <Tabungan />}
            {activeTab === 'naik-kelas' && <NaikKelas />}
            {activeTab === 'bimbingan' && <BimbinganBelajar />}
            {activeTab === 'pengumuman' && <Pengumuman />}
            {activeTab === 'laporan' && <Laporan />}
            {activeTab === 'pengaturan' && <Pengaturan schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} />}

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
