
import React from 'react';
import {
  Users,
  PlusSquare,
  CloudUpload,
  Monitor,
  Database,
  School,
  Settings2
} from 'lucide-react';

interface DataSiswaProps {
  onTambahKelas?: () => void;
  onUploadSiswa?: () => void;
  onUploadPerkelas?: () => void;
  onUploadSiswaBaru?: () => void;
}

const DataSiswa: React.FC<DataSiswaProps> = ({
  onTambahKelas,
  onUploadSiswa,
  onUploadPerkelas,
  onUploadSiswaBaru
}) => {

  const menuActions = [
    {
      id: 'tambah-kelas',
      label: 'Tambah Kelas',
      icon: <PlusSquare size={32} />,
      onClick: onTambahKelas,
      color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
    },
    {
      id: 'upload-siswa',
      label: 'Upload Data Siswa',
      icon: <CloudUpload size={32} />,
      onClick: onUploadSiswa,
      color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
    },
    {
      id: 'upload-perkelas',
      label: 'Upload Perkelas',
      icon: <Monitor size={32} />,
      onClick: onUploadPerkelas,
      color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
    },
    {
      id: 'upload-siswa-baru',
      label: 'Upload Siswa Baru',
      icon: <Database size={32} />,
      onClick: onUploadSiswaBaru,
      color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Title Section */}
      <div className="flex items-center gap-3 text-[#004AAD] border-b border-slate-200 pb-4">
        <School size={24} className="stroke-[2.5]" />
        <h2 className="text-xl font-bold tracking-tight">Data Siswa dan Kelas</h2>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuActions.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              relative group flex items-center gap-4 p-5 rounded-2xl text-white 
              ${item.color} shadow-lg shadow-blue-500/10 
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95
              overflow-hidden
            `}
          >
            {/* Background Decorative Element */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
              {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 80 })}
            </div>

            <div className="shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              {item.icon}
            </div>

            <div className="text-left">
              <span className="text-sm font-bold leading-tight tracking-wide block">
                {item.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 text-slate-500 max-w-2xl mt-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#004AAD]">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">Manajemen Siswa & Kelas</p>
          <p className="text-xs">Gunakan menu di atas untuk mengelola data siswa, pembagian kelas, serta penerimaan siswa baru di sekolah Anda.</p>
        </div>
      </div>

    </div>
  );
};

export default DataSiswa;
