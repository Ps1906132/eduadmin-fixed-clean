
import React from 'react';
import {
  Users,
  GraduationCap,
  School,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  BookOpen,
  Calendar,
  Sparkles,
  ScrollText
} from 'lucide-react';
import { getColorClasses, type ColorName } from '../utils/tailwindHelpers';

// Custom Rupiah Icon
const RupiahIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12h3a3 3 0 0 0 0-6H6v12" />
    <path d="M14 18l3-3-3-3" />
    <path d="M17 15H14" />
  </svg>
);

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Siswa', value: '1.250', icon: <Users size={28} />, color: 'blue' },
    { label: 'Guru & Staff', value: '85', icon: <GraduationCap size={28} />, color: 'purple' },
    { label: 'Jumlah Kelas', value: '32', icon: <School size={28} />, color: 'amber' },
    { label: 'Kehadiran Hari Ini', value: '98%', subValue: '12 Absen', icon: <CheckCircle2 size={28} />, color: 'emerald' },
  ];

  const notifications = [
    { id: 1, text: 'Rapat Koordinasi Guru - 10:00 WIB', type: 'warning' },
    { id: 2, text: 'Pendaftaran Siswa Baru Gelombang II Dibuka', type: 'info' },
    { id: 3, text: 'Maintenance Server Sistem Nilai Hari Sabtu', type: 'warning' },
    { id: 4, text: 'Laporan Keuangan Bulanan Telah Disetujui', type: 'success' },
    { id: 5, text: 'Update Jadwal UTS Semester Ganjil', type: 'info' },
  ];

  const quickActions = [
    { label: 'Tambah Siswa', icon: <UserPlus />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tambah Guru', icon: <GraduationCap />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Lihat Kelas', icon: <School />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Mata Pelajaran', icon: <BookOpen />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Hasil Belajar', icon: <BarChartIcon />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Tabungan', icon: <RupiahIcon />, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'SPP', icon: <CheckCircle2 />, color: 'bg-rose-50 text-rose-600' },
    { label: 'Edit Jadwal', icon: <Calendar />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Cetak Rapot', icon: <ScrollText />, color: 'bg-teal-50 text-teal-600' },
    { label: 'Pengumuman', icon: <AlertTriangle />, color: 'bg-slate-50 text-slate-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Beranda (Dashboard Utama)</h2>
        <p className="text-slate-500 mt-1">Selamat datang kembali, mari cek ringkasan data hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</h3>
                {stat.subValue && <p className="text-xs font-semibold text-rose-500 mt-1">{stat.subValue}</p>}
              </div>
              <div className={`p-4 rounded-xl ${getColorClasses(stat.color as ColorName).bg50} ${getColorClasses(stat.color as ColorName).text600} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Notifications */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Notifikasi Penting
            </h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Tandai Semua Selesai</button>
          </div>
          <div className="p-0">
            {notifications.map((notif) => (
              <div key={notif.id} className="group p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${notif.type === 'warning' ? 'bg-amber-400' : notif.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`} />
                <p className="flex-1 text-sm font-medium text-slate-700">{notif.text}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-lg uppercase tracking-wider font-bold">Detail</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Quick Access */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-blue-500" size={20} />
              Akses Cepat
            </h3>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <button key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                  {React.cloneElement(action.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter text-center leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper Icon for Quick Access
const BarChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

export default Dashboard;
