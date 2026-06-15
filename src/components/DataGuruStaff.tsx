import React, { useState } from 'react';
import {
  Users,
  BookMarked,
  Award,
  UserPlus,
  Settings2,
  UserCheck,
  ArrowLeft,
  CloudDownload,
  CloudUpload,
  Plus,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronDown,
  Info,
  List,
  FolderPlus,
  FileSpreadsheet,
  Bookmark,
  X
} from 'lucide-react';

interface MapelItem {
  no: number;
  nama: string;
  kode: string;
  kelas: string;
  kelompok: string;
}

interface DataGuruStaffProps {
  mapelList?: MapelItem[];
  setMapelList?: React.Dispatch<React.SetStateAction<MapelItem[]>>;
  stafList?: any[];
  setStafList?: React.Dispatch<React.SetStateAction<any[]>>;
  kelasData?: any[];
  setKelasData?: React.Dispatch<React.SetStateAction<any[]>>;
}

const DataGuruStaff: React.FC<DataGuruStaffProps> = ({
  mapelList: sharedMapelList,
  setMapelList: setSharedMapelList,
  stafList: sharedStafList,
  setStafList: setSharedStafList,
  kelasData = [],
  setKelasData
}) => {
  const [activeView, setActiveView] = useState('menu');
  const [visibleCount, setVisibleCount] = useState('100');

  // --- GENERIC HANDLERS ---
  const handleDownloadTemplate = (type: string) => {
    alert(`Mengunduh template untuk ${type}...`);
  };

  const handleUploadFile = (type: string) => {
    alert(`Membuka dialog upload untuk ${type}...`);
  };

  const handleSimpanData = () => {
    alert("Semua perubahan berhasil disimpan!");
  };

  // ==================== STATE MANAGEMENT ====================

  // --- MAPEL ---
  const [kelompokList, setKelompokList] = useState([
    'Muatan Nasional',
    'Muatan Lokal',
    'Ekstrakurikuler'
  ]);

  // Fallback local state if not provided
  const [localMapelList, setLocalMapelList] = useState<MapelItem[]>([
    { no: 1, nama: 'Pendidikan Agama Islam', kode: 'MP-001', kelas: '1,2,3,4,5,6', kelompok: 'Muatan Nasional' },
    { no: 2, nama: 'Bahasa Indonesia', kode: 'MP-002', kelas: '1,2,3,4,5,6', kelompok: 'Muatan Nasional' },
    { no: 3, nama: 'Matematika', kode: 'MP-003', kelas: '1,2,3,4,5,6', kelompok: 'Muatan Nasional' },
    { no: 4, nama: 'Bahasa Sunda', kode: 'MP-004', kelas: '1,2,3', kelompok: 'Muatan Lokal' },
  ]);

  const mapelList = sharedMapelList || localMapelList;
  const setMapelList = setSharedMapelList || setLocalMapelList;

  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [mapelForm, setMapelForm] = useState({ id: null as number | null, nama: '', kode: '', kelas: '', kelompok: '' });
  const [isKelompokModalOpen, setIsKelompokModalOpen] = useState(false);
  const [newKelompokName, setNewKelompokName] = useState('');
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState<string | null>(null);

  // --- JABATAN ---
  const [jabatanList, setJabatanList] = useState([
    { no: 1, kode: 'JBT-001', nama: 'Kepala Sekolah', kategori: 'Struktural', jumlah: '1 Orang', akses: 'Super Admin', roleCode: 'ks' },
    { no: 2, kode: 'JBT-002', nama: 'Guru Kelas', kategori: 'Pendidik', jumlah: '12 Orang', akses: 'Guru', roleCode: 'wk' },
    { no: 3, kode: 'JBT-003', nama: 'Guru Mata Pelajaran', kategori: 'Pendidik', jumlah: '8 Orang', akses: 'Guru', roleCode: 'gm' },
    { no: 4, kode: 'JBT-004', nama: 'Staff Tata Usaha', kategori: 'Tenaga Kependidikan', jumlah: '3 Orang', akses: 'Staff', roleCode: 'admin' },
  ]);
  const [isJabatanModalOpen, setIsJabatanModalOpen] = useState(false);
  const [jabatanForm, setJabatanForm] = useState({ id: null as number | null, nama: '', kategori: '', akses: '', roleCode: '' });

  // --- STAF ---
  // Using shared state or fallback (though fallback shouldn't be reached if App passes it)
  const [localStafList, setLocalStafList] = useState([
    { no: 1, noPegawai: '19750101 200012 1 001', nama: 'Abdul Solihin, S.Pd.I', jabatan: 'Kepala Sekolah', username: 'abdul.solihin', password: 'password123' },
  ]);
  const stafList = sharedStafList || localStafList;
  const setStafList = setSharedStafList || setLocalStafList;

  const [isStafModalOpen, setIsStafModalOpen] = useState(false);
  const [stafModalMode, setStafModalMode] = useState<'view' | 'edit' | 'add'>('add');
  const [stafForm, setStafForm] = useState({ id: null as number | null, noPegawai: '', nama: '', jabatan: '', username: '', password: '' });
  const [showStafPassword, setShowStafPassword] = useState(false);

  // --- WALI KELAS ---
  // waliKelasList is now derived from kelasData
  const [isWaliModalOpen, setIsWaliModalOpen] = useState(false);
  const [waliForm, setWaliForm] = useState({
    id: null as number | null,
    kode: '',
    nama: '',
    wali: '',
    nip: '',
    teacher_id: '' as string | number,
    tingkat: '1',
    paralel: ''
  });


  const menuActions = [
    { id: 'mapel', label: 'Tambah Mata pelajaran', icon: <BookMarked size={32} />, color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]' },
    { id: 'jabatan', label: 'Tambah Jabatan', icon: <Award size={32} />, color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]' },
    { id: 'tambah-staf', label: 'Tambah Guru dan staf', icon: <UserPlus size={32} />, color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]' },
    { id: 'wali-kelas', label: 'Wali Kelas', icon: <UserCheck size={32} />, color: 'bg-gradient-to-br from-[#6383ea] to-[#4d7ef2]' },
  ];

  const handleBack = () => setActiveView('menu');

  // ==================== HANDLERS ====================

  // --- MAPEL HANDLERS ---
  const handleOpenAddMapel = () => {
    setMapelForm({ id: null, nama: '', kode: '', kelas: '', kelompok: '' });
    setIsMapelModalOpen(true);
  };
  const handleEditMapel = (item: any) => {
    setMapelForm({ ...item, id: item.no });
    setIsMapelModalOpen(true);
  };
  const handleDeleteMapel = (id: number) => {
    if (confirm('Apakah anda yakin ingin menghapus mata pelajaran ini?')) {
      setMapelList(prev => prev.filter((item: MapelItem) => item.no !== id));
    }
  };
  const handleSaveMapel = () => {
    if (!mapelForm.nama || !mapelForm.kelompok) {
      alert("Nama dan Kelompok Mata Pelajaran wajib diisi!");
      return;
    }
    if (mapelForm.id) {
      setMapelList(prev => prev.map(item => item.no === mapelForm.id ? { ...item, ...mapelForm, id: undefined, no: item.no } : item));
    } else {
      const newNo = mapelList.length > 0 ? Math.max(...mapelList.map(i => i.no)) + 1 : 1;
      setMapelList(prev => [...prev, { ...mapelForm, no: newNo, id: undefined }]);
    }
    setIsMapelModalOpen(false);
  };
  const handleAddKelompok = () => {
    if (newKelompokName.trim() && !kelompokList.includes(newKelompokName.trim())) {
      setKelompokList([...kelompokList, newKelompokName.trim()]);
      setNewKelompokName('');
      setIsKelompokModalOpen(false);
    }
  };
  const handleDeleteKelompok = (kelompok: string) => {
    if (confirm(`Yakin ingin menghapus kelompok '${kelompok}'?`)) {
      setKelompokList(prev => prev.filter(k => k !== kelompok));
      if (selectedKelompokFilter === kelompok) {
        setSelectedKelompokFilter(null);
      }
    }
  };

  // --- JABATAN HANDLERS ---
  const getRoleCodeFromAkses = (akses: string): string => {
    switch (akses) {
      case 'Super Admin': return 'admin';
      case 'Admin': return 'admin';
      case 'Guru': return 'gm'; // Default ke Guru Mata Pelajaran
      case 'Staff': return 'admin'; // Staff menggunakan admin role
      default: return '';
    }
  };

  const handleOpenAddJabatan = () => {
    setJabatanForm({ id: null, nama: '', kategori: '', akses: '', roleCode: '' });
    setIsJabatanModalOpen(true);
  };
  const handleEditJabatan = (item: any) => {
    setJabatanForm({ id: item.no, nama: item.nama, kategori: item.kategori, akses: item.akses, roleCode: item.roleCode || '' });
    setIsJabatanModalOpen(true);
  };
  const handleSaveJabatan = () => {
    if (!jabatanForm.nama) return;
    if (jabatanForm.id) {
      setJabatanList(prev => prev.map(item => item.no === jabatanForm.id ? { ...item, ...jabatanForm, id: undefined, no: item.no } : item));
    } else {
      const newNo = jabatanList.length > 0 ? Math.max(...jabatanList.map(i => i.no)) + 1 : 1;
      const newCode = `JBT-00${newNo}`;
      setJabatanList(prev => [...prev, { ...jabatanForm, no: newNo, kode: newCode, jumlah: '0 Orang', id: undefined }]);
    }
    setIsJabatanModalOpen(false);
  };
  const handleDeleteJabatan = (no: number) => {
    if (confirm('Yakin ingin menghapus jabatan ini?')) {
      setJabatanList(prev => prev.filter(item => item.no !== no));
    }
  };

  // --- STAF HANDLERS ---
  const handleOpenAddStaf = () => {
    setStafForm({ id: null, noPegawai: '', nama: '', jabatan: '', username: '', password: '' });
    setStafModalMode('add');
    setIsStafModalOpen(true);
  };
  const handleEditStaf = (item: any) => {
    setStafForm({ id: item.no, ...item });
    setStafModalMode('edit');
    setIsStafModalOpen(true);
  };
  const handleViewStaf = (item: any) => {
    setStafForm({ id: item.no, ...item });
    setStafModalMode('view');
    setIsStafModalOpen(true);
  };
  const handleSaveStaf = () => {
    if (!stafForm.nama) return;
    if (stafList.some(s => s.no === stafForm.id)) {
      setStafList((prev: any[]) => prev.map((item: any) => item.no === stafForm.id ? { ...item, ...stafForm, id: undefined, no: item.no } : item));
    } else {
      const newNo = stafList.length > 0 ? Math.max(...stafList.map(i => i.no)) + 1 : 1;
      setStafList((prev: any[]) => [...prev, { ...stafForm, no: newNo, id: undefined }]);
    }
    setIsStafModalOpen(false);
  };
  const handleDeleteStaf = (no: number) => {
    if (confirm('Yakin ingin menghapus data pegawai ini?')) {
      setStafList((prev: any[]) => prev.filter((item: any) => item.no !== no));
    }
  };

  // --- WALI KELAS HANDLERS ---

  const handleEditWali = (kelas: any) => {
    setWaliForm({
      id: kelas.id,
      kode: kelas.kode,
      nama: kelas.nama,
      wali: kelas.wali || '',
      nip: kelas.waliNip || '',
      teacher_id: kelas.teacher_id || '',
      tingkat: kelas.tingkat || '1',
      paralel: kelas.paralel || ''
    });
    setIsWaliModalOpen(true);
  };

  const handleAddWali = () => {
    setWaliForm({
      id: null,
      kode: 'KLS-1A', // Preview default
      nama: 'Kelas 1 A', // Preview default
      wali: '',
      nip: '',
      tingkat: '1',
      paralel: 'A'
    });
    setIsWaliModalOpen(true);
  };

  const handleSaveWali = () => {
    if (!setKelasData) return;
    
    if (waliForm.id) {
      // Edit existing
      setKelasData((prev: any[]) => prev.map((cls: any) =>
        cls.id === waliForm.id
          ? { ...(cls as Record<string, unknown>), wali: waliForm.wali, waliNip: waliForm.nip, teacher_id: waliForm.teacher_id }
          : cls
      ));
    } else {
      // Add new
      const newId = kelasData.length > 0 ? Math.max(...kelasData.map(c => c.id)) + 1 : 1;
      const genKode = `KLS-${waliForm.tingkat}${waliForm.paralel.replace(/\s+/g, '').toUpperCase()}`;
      const genNama = `Kelas ${waliForm.tingkat} ${waliForm.paralel}`;

      setKelasData((prev: any[]) => [...prev, {
        id: newId,
        kode: genKode,
        nama: genNama,
        wali: waliForm.wali,
        waliNip: waliForm.nip,
        teacher_id: waliForm.teacher_id,
        tingkat: waliForm.tingkat,
        paralel: waliForm.paralel
      }]);
    }
    setIsWaliModalOpen(false);
  };

  const handleDeleteWali = (id: number) => {
    if (!setKelasData) return;
    
    if (confirm('Yakin ingin mereset wali kelas ini?')) {
      setKelasData((prev: any[]) => prev.map((cls: any) => cls.id === id ? { ...(cls as Record<string, unknown>), wali: '-', waliNip: '-' } : cls));
    }
  };


  // ==================== VIEWS ====================

  // View: Tambah Mata Pelajaran
  if (activeView === 'mapel') {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 text-[#004AAD]">
            <BookMarked size={28} />
            <h2 className="text-2xl font-bold tracking-tight">Tambah Mata pelajaran</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-700 capitalize">Kelompok</h3>
              <button onClick={() => setIsKelompokModalOpen(true)} className="p-1 bg-[#4d7ef2] text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                <Plus size={20} />
              </button>
            </div>
            <div className="bg-white border border-slate-300 rounded-lg overflow-hidden min-h-[100px] shadow-sm">
              <ul className="divide-y divide-slate-100">
                <li className={`px-4 py-3 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between ${selectedKelompokFilter === null ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`} onClick={() => setSelectedKelompokFilter(null)}>
                  <span>Semua Kelompok</span>
                </li>
                {kelompokList.map((kelompok, idx) => (
                  <li key={idx} className={`px-4 py-3 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between group/item ${selectedKelompokFilter === kelompok ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}>
                    <span onClick={() => setSelectedKelompokFilter(kelompok)} className="truncate flex-1">{kelompok}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteKelompok(kelompok); }}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                      title="Hapus Kelompok"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-4">
            <div className="flex justify-end gap-2 mb-2">
              <button onClick={() => handleDownloadTemplate('Mata Pelajaran')} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 group">
                <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => handleUploadFile('Mata Pelajaran')} className="w-10 h-10 flex items-center justify-center bg-[#4d7ef2] text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-md active:scale-95 group">
                <CloudUpload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button onClick={handleOpenAddMapel} className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group">
                <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
              </button>
              <button onClick={handleSimpanData} className="ml-2 px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group">
                <Bookmark size={18} className="fill-white group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold tracking-wide">Simpan</span>
              </button>
            </div>

            <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f8fafc] border-b border-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-300 w-12 text-center">No</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-300">Nama Mata Pelajaran</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-300 text-center">Kode</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-300 text-center">Untuk Kelas</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-slate-300 text-center">Kelompok</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mapelList
                      .filter(item => selectedKelompokFilter ? item.kelompok === selectedKelompokFilter : true)
                      .map((item, idx) => (
                        <tr key={item.no} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-2 text-sm text-slate-600 text-center border-r border-slate-200">{idx + 1}</td>
                          <td className="px-4 py-2 text-sm font-bold text-slate-800 border-r border-slate-200">{item.nama}</td>
                          <td className="px-4 py-2 text-sm font-mono text-slate-600 text-center border-r border-slate-200">{item.kode}</td>
                          <td className="px-4 py-2 text-sm text-slate-600 text-center border-r border-slate-200">{item.kelas}</td>
                          <td className="px-4 py-2 text-sm text-slate-600 text-center border-r border-slate-200">{item.kelompok}</td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditMapel(item)} className="text-emerald-500 hover:text-emerald-700 transition-all" title="Edit">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteMapel(item.no)} className="text-rose-500 hover:text-rose-700 transition-all" title="Hapus">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Mapel */}
        {isMapelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-[#004AAD] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{mapelForm.id ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
                <button onClick={() => setIsMapelModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Nama Mata Pelajaran</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={mapelForm.nama} onChange={e => setMapelForm({ ...mapelForm, nama: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Kode Mapel</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={mapelForm.kode} onChange={e => setMapelForm({ ...mapelForm, kode: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Untuk Kelas</label><input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={mapelForm.kelas} onChange={e => setMapelForm({ ...mapelForm, kelas: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Kelompok</label><select className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white" value={mapelForm.kelompok} onChange={e => setMapelForm({ ...mapelForm, kelompok: e.target.value })}>{kelompokList.map((k, i) => <option key={i} value={k}>{k}</option>)}</select></div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsMapelModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white hover:text-rose-500 transition-all">Batal</button>
                <button onClick={handleSaveMapel} className="px-5 py-2.5 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-[#003380] transition-all shadow-lg">Simpan</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Kelompok (MISSING PREVIOUSLY) */}
        {isKelompokModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Tambah Kelompok</h3>
                <button onClick={() => setIsKelompokModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
              </div>
              <div className="p-6">
                <label className="text-sm font-bold text-slate-600 block mb-2">Nama Kelompok Baru</label>
                <input
                  type="text"
                  autoFocus
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Muatan Lokal"
                  value={newKelompokName}
                  onChange={e => setNewKelompokName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddKelompok()}
                />
              </div>
              <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button onClick={() => setIsKelompokModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold hover:bg-white border border-transparent hover:border-slate-200 transition-all text-sm">Batal</button>
                <button onClick={handleAddKelompok} className="px-4 py-2 bg-[#004AAD] text-white rounded-lg font-bold hover:bg-[#003380] transition-all text-sm">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View: Tambah Jabatan
  if (activeView === 'jabatan') {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3 text-[#004AAD]"><Award size={28} /><h2 className="text-2xl font-bold tracking-tight">Data Jabatan Guru & Staf</h2></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
          <button onClick={handleOpenAddJabatan} className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group"><Plus size={22} className="group-hover:rotate-90 transition-transform" /></button>
          <button onClick={handleSimpanData} className="ml-2 px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group"><Bookmark size={18} className="fill-white group-hover:scale-110 transition-transform" /><span className="text-sm font-bold tracking-wide">Simpan</span></button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 w-16 text-center">No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 text-center">Kode</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Jabatan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 text-center">Kategori</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 text-center">Akses</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jabatanList.map((item) => (
                  <tr key={item.no} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{item.no}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 text-center border-r border-slate-50">{item.kode}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{item.nama}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-50 text-center"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">{item.kategori}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-50 text-center font-medium">{item.akses}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditJabatan(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteJabatan(item.no)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Jabatan */}
        {isJabatanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">{jabatanForm.id ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h3>
                <button onClick={() => setIsJabatanModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Nama Jabatan</label><input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={jabatanForm.nama} onChange={e => setJabatanForm({ ...jabatanForm, nama: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Kategori</label><select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={jabatanForm.kategori} onChange={e => setJabatanForm({ ...jabatanForm, kategori: e.target.value })}><option value="">Pilih Kategori</option><option value="Struktural">Struktural</option><option value="Pendidik">Pendidik</option><option value="Tenaga Kependidikan">Tenaga Kependidikan</option></select></div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Akses Sistem</label><select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={jabatanForm.akses} onChange={e => {
                  const akses = e.target.value;
                  const roleCode = getRoleCodeFromAkses(akses);
                  setJabatanForm({ ...jabatanForm, akses, roleCode });
                }}><option value="">Pilih Akses</option><option value="Super Admin">Super Admin</option><option value="Admin">Admin</option><option value="Guru">Guru</option><option value="Staff">Staff</option></select></div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Role Code</label><select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={jabatanForm.roleCode} onChange={e => setJabatanForm({ ...jabatanForm, roleCode: e.target.value })}><option value="">Pilih Role Code</option><option value="admin">admin (Super Admin)</option><option value="kurikulum">kurikulum (Admin Kurikulum)</option><option value="keuangan">keuangan (Admin Keuangan)</option><option value="multimedia">multimedia (Admin Multimedia)</option><option value="ks">ks (Kepala Sekolah)</option><option value="gm">gm (Guru Mata Pelajaran)</option><option value="wk">wk (Wali Kelas)</option><option value="gb">gb (Guru Bimbel)</option></select></div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setIsJabatanModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-white rounded-lg border border-transparent hover:border-slate-200">Batal</button>
                <button onClick={handleSaveJabatan} className="px-4 py-2 bg-[#004AAD] text-white font-bold rounded-lg hover:bg-[#003380]">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View: Tambah Guru dan Staf
  if (activeView === 'tambah-staf') {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3 text-[#004AAD]"><UserPlus size={28} /><h2 className="text-2xl font-bold tracking-tight">Data Guru & Staf Baru</h2></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
          <button onClick={handleOpenAddStaf} className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group"><Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /></button>
          <button onClick={handleSimpanData} className="ml-2 px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group"><Bookmark size={18} className="fill-white group-hover:scale-110 transition-transform" /><span className="text-sm font-bold tracking-wide">Simpan</span></button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 w-16 text-center">No</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">NIP / NUPTK</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Jabatan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Username</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stafList.map(item => (
                  <tr key={item.no} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{item.no}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 border-r border-slate-50">{item.noPegawai}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50 capitalize">{item.nama}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-50"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] uppercase font-bold tracking-wide">{item.jabatan}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-50">{item.username}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewStaf(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Lihat"><Eye size={16} /></button>
                        <button onClick={() => handleEditStaf(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteStaf(item.no)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Hapus"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Staf */}
        {isStafModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800">{stafModalMode === 'view' ? 'Detail Staf' : stafModalMode === 'edit' ? 'Edit Data Staf' : 'Tambah Staf Baru'}</h3>
                <button onClick={() => setIsStafModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-5 overflow-y-auto">
                <div className="space-y-1"><label className="text-sm font-bold text-slate-600">Nama Lengkap</label><input type="text" disabled={stafModalMode === 'view'} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" value={stafForm.nama} onChange={e => setStafForm({ ...stafForm, nama: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-sm font-bold text-slate-600">NIP / NUPTK</label><input type="text" disabled={stafModalMode === 'view'} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" value={stafForm.noPegawai} onChange={e => setStafForm({ ...stafForm, noPegawai: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-sm font-bold text-slate-600">Jabatan</label><input type="text" disabled={stafModalMode === 'view'} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100" value={stafForm.jabatan} onChange={e => setStafForm({ ...stafForm, jabatan: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1"><label className="text-sm font-bold text-slate-600">Username</label><input type="text" disabled={stafModalMode === 'view'} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 font-mono" value={stafForm.username} onChange={e => setStafForm({ ...stafForm, username: e.target.value })} /></div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600">Password</label>
                    <div className="relative">
                      <input 
                        type={showStafPassword ? 'text' : 'password'}
                        disabled={stafModalMode === 'view'} 
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 font-mono" 
                        value={stafForm.password && stafForm.password.startsWith('$2') ? '' : stafForm.password} 
                        onChange={e => setStafForm({ ...stafForm, password: e.target.value })} 
                        placeholder={stafForm.password && stafForm.password.startsWith('$2') ? "Sudah Terenkripsi (Ketik untuk ganti)" : "Ketik password baru"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStafPassword(!showStafPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showStafPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsStafModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all">Tutup</button>
                {stafModalMode !== 'view' && <button onClick={handleSaveStaf} className="px-5 py-2.5 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-[#003380] transition-all shadow-md">Simpan Data</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeView === 'settings') {
    // Settings view remains largely same, cutting for brevity in update if needed but including here for completeness
    const roles = ['Guru Mapel', 'Wali Kelas', 'Staff Tata Usaha', 'Kepala Sekolah'];
    const modules = [
      { category: 'Umum', items: ['Dashboard Ringkasan', 'Lihat Pengumuman'] },
      { category: 'Manajemen Data', items: ['Data Siswa (Lihat)', 'Data Siswa (Edit/Hapus)', 'Data Guru (Lihat)'] },
    ];
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3 text-[#004AAD]"><Settings2 size={28} /><h2 className="text-2xl font-bold tracking-tight">Pengaturan Hak Akses</h2></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-12 text-center text-slate-400">Pengaturan Hak Akses Content (Placeholder)</div>
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3"><button onClick={handleBack} className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white">Batal</button><button onClick={handleSimpanData} className="px-6 py-2.5 bg-[#4338ca] text-white rounded-xl font-bold">Simpan Perubahan</button></div>
        </div>
      </div>
    );
  }

  // View: Wali Kelas
  if (activeView === 'wali-kelas') {
    return (
      <div className="animate-in slide-in-from-right duration-500 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3 text-[#004AAD]"><UserCheck size={28} /><h2 className="text-2xl font-bold tracking-tight">Data Wali Kelas</h2></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-end gap-3">
          <button onClick={handleAddWali} className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group">
            <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
          </button>
          <button onClick={() => handleDeleteWali(0)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold flex items-center gap-2"><Trash2 size={18} className="text-rose-500" />Reset</button>
          <button onClick={handleSimpanData} className="ml-2 px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] font-bold flex items-center gap-2"><Bookmark size={18} className="fill-white" />Simpan</button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Kode Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Wali Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kelasData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600 border-r border-slate-50">{item.kode}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 border-r border-slate-50">{item.wali || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleEditWali(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteWali(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Wali Kelas */}
        {isWaliModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Atur Wali Kelas</h3>
                <button onClick={() => setIsWaliModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {!waliForm.id ? (
                  // ADD MODE: Auto-generate
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Tingkat Kelas</label>
                      <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={waliForm.tingkat}
                        onChange={e => setWaliForm({ ...waliForm, tingkat: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6].map(t => <option key={t} value={t}>Kelas {t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-700">Nama Paralel</label>
                      <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={waliForm.paralel}
                        onChange={e => setWaliForm({ ...waliForm, paralel: e.target.value })}
                      >
                        <option value="">Pilih Paralel</option>
                        {['A', 'B', 'C', 'D'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2 p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Preview Kode</p>
                        <p className="font-mono font-bold text-blue-800">KLS-{waliForm.tingkat}{waliForm.paralel.replace(/\s+/g, '').toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Preview Nama</p>
                        <p className="font-bold text-blue-800">Kelas {waliForm.tingkat} {waliForm.paralel}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // EDIT MODE: Read-only
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-500">Kode</label>
                      <input type="text" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" value={waliForm.kode} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-slate-500">Kelas</label>
                      <input type="text" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" value={waliForm.nama} />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Wali Kelas</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                      value={waliForm.wali}
                      onChange={(e) => {
                        const selectedStaff = stafList.find(s => s.nama === e.target.value);
                        setWaliForm({
                          ...waliForm,
                          wali: selectedStaff?.nama || '',
                          nip: selectedStaff?.noPegawai || '',
                          teacher_id: selectedStaff?.id || ''
                        });
                      }}
                    >
                      <option value="">Pilih Guru / Wali Kelas</option>
                      {stafList.map((staf, idx) => (
                        <option key={idx} value={staf.nama}>{staf.nama}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">NIP</label><input type="text" disabled className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" value={waliForm.nip} placeholder="NIP / NUPTK" /></div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setIsWaliModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-white rounded-lg border border-transparent hover:border-slate-200">Batal</button>
                <button onClick={handleSaveWali} className="px-4 py-2 bg-[#004AAD] text-white font-bold rounded-lg hover:bg-[#003380]">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Menu View
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center gap-3 text-[#004AAD] border-b border-slate-200 pb-4"><Users size={24} className="stroke-[2.5]" /><h2 className="text-xl font-bold tracking-tight">Data Guru & Staf Administrasi</h2></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuActions.map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`relative group flex items-center gap-4 p-5 rounded-2xl text-white ${item.color} shadow-lg shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">{React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 80 })}</div>
            <div className="shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">{item.icon}</div>
            <div className="text-left"><span className="text-sm font-bold leading-tight tracking-wide block">{item.label}</span></div>
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 text-slate-500 max-w-2xl mt-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#004AAD]"><Settings2 size={24} /></div>
        <div><p className="text-sm font-bold text-slate-800">Manajemen Guru & Staf</p><p className="text-xs">Gunakan menu di atas untuk mengelola data pendidik, tenaga kependidikan, serta pengaturan jabatan di sekolah Anda.</p></div>
      </div>
    </div>
  );
};

export default DataGuruStaff;
