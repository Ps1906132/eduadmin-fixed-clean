
import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Wallet,
  ArrowUpCircle,
  BookOpen,
  Megaphone,
  FileText,
  Settings,
  X,
  BookMarked,
  UserCheck,
  ScrollText
} from 'lucide-react';

// Custom Rupiah Icon to match Lucide style
const RupiahIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12h3a3 3 0 0 0 0-6H6v12" />
    <path d="M14 18l3-3-3-3" />
    <path d="M17 15H14" />
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  schoolSettings?: any;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar, schoolSettings, userRole = '' }) => {
  const allMenuItems = [
    { id: 'beranda', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
    { id: 'data-siswa', label: 'Data Siswa dan kelas', icon: <Users size={18} />, roles: ['admin'] },
    { id: 'data-guru', label: 'Data Guru & Staff', icon: <GraduationCap size={18} />, roles: ['admin'] },
    { id: 'kelas-wali', label: 'Kelas dan wali kelas', icon: <School size={18} />, roles: ['admin', 'wk'] },
    { id: 'mata-pelajaran', label: 'Mata Pelajaran', icon: <BookMarked size={18} />, roles: ['admin'] },
    { id: 'jadwal', label: 'Jadwal', icon: <Calendar size={18} />, roles: ['admin', 'kurikulum', 'wk', 'gm'] },
    { id: 'absen', label: 'Absen', icon: <UserCheck size={18} />, roles: ['admin', 'kurikulum', 'wk', 'gm'] },
    { id: 'nilai', label: 'Nilai', icon: <BarChart3 size={18} />, roles: ['admin', 'kurikulum', 'wk', 'gm'] },
    { id: 'rapot', label: 'Rapot', icon: <ScrollText size={18} />, roles: ['admin', 'kurikulum', 'wk'] },
    { id: 'keuangan', label: 'Keuangan', icon: <Wallet size={18} />, roles: ['admin', 'keuangan'] },
    { id: 'tabungan', label: 'Tabungan', icon: <RupiahIcon size={18} />, roles: ['admin', 'keuangan', 'ot'] },
    { id: 'naik-kelas', label: 'Naik Kelas', icon: <ArrowUpCircle size={18} />, roles: ['admin', 'kurikulum'] },
    { id: 'bimbingan', label: 'Bimbingan belajar (les)', icon: <BookOpen size={18} />, roles: ['admin', 'gb'] },
    { id: 'pengumuman', label: 'Pengumuman', icon: <Megaphone size={18} />, roles: ['admin', 'kurikulum', 'keuangan'] },
    { id: 'laporan', label: 'Laporan', icon: <FileText size={18} />, roles: ['admin', 'keuangan'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings size={18} />, roles: ['admin'] },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true; // Menu publik (Beranda)
    return item.roles.includes(userRole.toLowerCase());
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#004AAD] font-bold text-xs overflow-hidden border border-slate-200">
            {schoolSettings?.logo ? (
              <img src={schoolSettings.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              "LOGO"
            )}
          </div>
          <h1 className="font-bold text-[#004AAD] text-sm truncate flex-1">{schoolSettings?.name || "Nama Sekolah"}</h1>
          <button onClick={toggleSidebar} className="ml-auto lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-[#004AAD] text-white'
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="text-[13px] font-medium truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
