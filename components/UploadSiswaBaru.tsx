import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  CloudUpload,
  Bookmark,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Loader2,
  X,
  Save,
  Check,
  ArrowLeft
} from 'lucide-react';

interface UploadSiswaBaruProps {
  onBack?: () => void;
}

const UploadSiswaBaru: React.FC<UploadSiswaBaruProps> = ({ onBack }) => {
  const [visibleCount, setVisibleCount] = useState('100');
  const [selectedKelas, setSelectedKelas] = useState('1 A');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for Editing
  const [editId, setEditId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Form State for "Tambah Siswa"
  const [newStudent, setNewStudent] = useState({
    nama: '',
    nis: '',
    tempatLahir: '',
    tanggalLahir: '',
    namaAyah: '',
    namaIbu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    noHp: '',
    username: '',
    password: ''
  });

  // Contoh data (dummy)
  const [dataSiswa, setDataSiswa] = useState([
    {
      no: 1,
      nis: '2025891023',
      nama: 'abdul solihin',
      ttl: 'Garut, 20 Januari 2022',
      kelas: 'KLS-1A',
      tingkat: 'Kelas 1',
      paralel: 'A',
      ayah: 'Usep',
      ibu: 'Ani',
      pAyah: 'Polisi',
      pIbu: 'Bidan',
      username: '2025891023'
    }
  ]);

  const listKelas1 = ['1 A', '1 B', '1 C'];

  // Handlers
  const handleDownloadTemplate = () => {
    alert("Mengunduh Template Excel Siswa Baru...");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setTimeout(() => {
        alert(`File "${file.name}" berhasil diunggah!`);
      }, 1000);
    }
  };

  const handleOpenAddModal = () => {
    setEditId(null);
    setIsViewMode(false);
    setNewStudent({
      nama: '', nis: '', tempatLahir: '', tanggalLahir: '',
      namaAyah: '', namaIbu: '', pekerjaanAyah: '', pekerjaanIbu: '',
      noHp: '', username: '', password: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: any) => {
    setEditId(student.no);
    setIsViewMode(false);
    setNewStudent({
      nama: student.nama,
      nis: student.nis,
      tempatLahir: student.ttl.split(', ')[0] || '',
      tanggalLahir: '',
      namaAyah: student.ayah,
      namaIbu: student.ibu,
      pekerjaanAyah: student.pAyah,
      pekerjaanIbu: student.pIbu,
      noHp: '08123456789',
      username: student.username,
      password: 'password123'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenViewModal = (student: any) => {
    setEditId(student.no);
    setIsViewMode(true);
    setNewStudent({
      nama: student.nama,
      nis: student.nis,
      tempatLahir: student.ttl.split(', ')[0] || '',
      tanggalLahir: '',
      namaAyah: student.ayah,
      namaIbu: student.ibu,
      pekerjaanAyah: student.pAyah,
      pekerjaanIbu: student.pIbu,
      noHp: '08123456789',
      username: student.username,
      password: 'password123'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setDataSiswa(prev => prev.map(item =>
        item.no === editId ? { ...item, nama: newStudent.nama, nis: newStudent.nis } : item
      ));
      alert(`Data siswa ${newStudent.nama} berhasil diperbarui!`);
    } else {
      alert(`Siswa ${newStudent.nama} berhasil ditambahkan!`);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteStudent = (no: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setDataSiswa(prev => prev.filter(item => item.no !== no));
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls,.csv" />

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 p-2 pr-4 hover:bg-slate-100 rounded-full transition-colors text-slate-500 mr-1"
              title="Kembali ke menu sebelumnya"
            >
              <ArrowLeft size={24} />
              <span className="text-sm font-medium">Kembali</span>
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-800">Upload Siswa baru</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <button onClick={handleDownloadTemplate} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 group" title="Download Template">
              <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={handleUploadClick} className="w-10 h-10 flex items-center justify-center bg-[#4d7ef2] text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-md active:scale-95 group" title="Upload File">
              <CloudUpload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>
            <button onClick={handleOpenAddModal} className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group" title="Tambah Siswa">
              <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-w-[180px]">
            <div className="px-4 py-2 border-r border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Kelas</div>
            <div className="relative flex-1">
              <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)} className="w-full px-4 py-2 text-sm font-bold text-[#004AAD] appearance-none focus:outline-none cursor-pointer">
                {listKelas1.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]"><ChevronDown size={14} /></div>
            </div>
          </div>

          <button onClick={() => { setIsSaving(true); setTimeout(() => { setIsSaving(false); alert('Data tersimpan!'); }, 1500); }} disabled={isSaving} className="px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group disabled:opacity-70">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} className="fill-white group-hover:scale-110 transition-transform" />}
            <span className="text-sm font-bold tracking-wide">Simpan</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <tr className="border-b border-slate-200">
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200 text-center w-12">No</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200">Nomor Induk Siswa</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200">Nama Lengkap Siswa</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200">Tempat dan tanggal lahir</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200">Nama kelas</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200 text-center">Tingkat</th>
                <th rowSpan={2} className="px-4 py-5 border-r border-slate-200 text-center">Paralel</th>
                <th colSpan={2} className="px-4 py-3 border-b border-r border-slate-200 text-center bg-slate-100/30">Nama orangtua / wali</th>
                <th colSpan={2} className="px-4 py-3 border-b border-r border-slate-200 text-center bg-slate-100/30">Pekerjaan</th>
                <th rowSpan={2} className="px-4 py-5 text-center">Username</th>
                <th rowSpan={2} className="px-4 py-5 text-center">Aksi</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-4 py-2 border-r border-slate-200 text-center font-bold">Ayah</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center font-bold">Ibu</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center font-bold">Ayah</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center font-bold">Ibu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataSiswa.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-4 text-xs text-slate-500 text-center border-r border-slate-50">{item.no}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-medium group-hover:text-[#004AAD]">{item.nis}</td>
                  <td className="px-4 py-4 text-sm text-slate-800 border-r border-slate-50 capitalize font-medium">{item.nama}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50">{item.ttl}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-bold text-center">{item.kelas}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.tingkat}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center font-bold text-[#004AAD]">{item.paralel}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ayah}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ibu}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.pAyah}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.pIbu}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 text-center font-mono">{item.username}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenViewModal(item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Lihat">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleOpenEditModal(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteStudent(item.no)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer Area */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200">
          {/* ... Pagination same as before ... */}
          <div className="flex items-center gap-6"><div className="flex items-center gap-2 text-slate-500"><Info size={18} className="text-[#004AAD]" /><span className="text-xs font-bold uppercase tracking-wider">Registrasi Siswa Baru</span></div></div>
          <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pilih Jumlah terlihat</span>
            <select value={visibleCount} onChange={(e) => setVisibleCount(e.target.value)} className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer">
              <option value="50">50</option><option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><UserPlus size={20} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{isViewMode ? 'Detail Siswa' : editId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
                  <p className="text-xs text-slate-500 font-medium">Input data siswa secara manual untuk kelas {selectedKelas}</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="form-siswa" onSubmit={handleSaveStudent} className="space-y-8">
                {/* Data Diri */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informasi Siswa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Nama Lengkap</label><input required disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.nama} onChange={e => setNewStudent({ ...newStudent, nama: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Nomor Induk</label><input required disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.nis} onChange={e => setNewStudent({ ...newStudent, nis: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Tempat Lahir</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.tempatLahir} onChange={e => setNewStudent({ ...newStudent, tempatLahir: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Tanggal Lahir</label><input disabled={isViewMode} type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.tanggalLahir} onChange={e => setNewStudent({ ...newStudent, tanggalLahir: e.target.value })} /></div>
                  </div>
                </div>

                {/* Orang Tua */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Data Orang Tua</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Nama Ayah</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.namaAyah} onChange={e => setNewStudent({ ...newStudent, namaAyah: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Nama Ibu</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.namaIbu} onChange={e => setNewStudent({ ...newStudent, namaIbu: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Pekerjaan Ayah</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.pekerjaanAyah} onChange={e => setNewStudent({ ...newStudent, pekerjaanAyah: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Pekerjaan Ibu</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.pekerjaanIbu} onChange={e => setNewStudent({ ...newStudent, pekerjaanIbu: e.target.value })} /></div>
                    <div className="space-y-2 col-span-2"><label className="text-xs font-bold text-slate-600">No. Handphone / WhatsApp</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50" value={newStudent.noHp} onChange={e => setNewStudent({ ...newStudent, noHp: e.target.value })} /></div>
                  </div>
                </div>

                {/* Akun Orang Tua/wali */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Akun Orang Tua/wali</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Username</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 font-mono" value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Password</label><input disabled={isViewMode} type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 font-mono" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} /></div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all text-sm">Tutup</button>
              {!isViewMode && <button type="submit" form="form-siswa" className="px-6 py-2.5 rounded-xl bg-[#4338ca] text-white font-bold hover:bg-[#3730a3] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm flex items-center gap-2"><Save size={18} />Simpan Data Siswa</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadSiswaBaru;
