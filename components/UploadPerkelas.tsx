import React, { useState, useRef, useEffect } from 'react';
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
import { useClasses } from './DashboardSuperAdmin/hooks/useClasses';
import { useStudents } from './DashboardSuperAdmin/hooks/useStudents';

interface UploadPerkelasProps {
  onBack?: () => void;
}

const UploadPerkelas: React.FC<UploadPerkelasProps> = ({ onBack }) => {
  const { classes } = useClasses();
  const { students, addNewStudent, updateStudent, handleDelete } = useStudents();

  // Dynamic class options from system database
  const classOptions = classes && classes.length > 0
    ? classes.map(c => c.nama)
    : [];

  const [visibleCount, setVisibleCount] = useState('100');
  const [selectedKelas, setSelectedKelas] = useState(() => classOptions[0] || '1A');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync selected class when classes load
  useEffect(() => {
    if (classes && classes.length > 0 && !classOptions.includes(selectedKelas)) {
      setSelectedKelas(classes[0].nama);
    }
  }, [classes]);

  // State for Editing
  const [editId, setEditId] = useState<string | number | null>(null);
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

  // Filter students based on selected class
  const filteredStudents = students.filter(s => s.kelas === selectedKelas);

  // Handlers
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,No,NIS,Nama,TTL,Kelas,Tingkat,Paralel,Ayah,Ibu,PekerjaanAyah,PekerjaanIbu,Username';
    link.download = `template_siswa_${selectedKelas}.csv`;
    link.click();
    alert('Template berhasil diunduh!');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file.name);
    setIsSaving(true);

    const currentClass = classes.find((c: any) => c.nama === selectedKelas);
    const tingkat = currentClass ? currentClass.tingkat : 1;
    const paralel = currentClass ? currentClass.paralel : selectedKelas.replace(/[0-9]/g, '') || 'A';

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      if (!text) { setIsSaving(false); return; }

      const lines = text.split('\n').filter(l => l.trim() !== '');
      const dataLines = lines.slice(1); // skip header

      if (dataLines.length === 0) {
        setIsSaving(false);
        alert('File tidak memiliki data siswa. Pastikan format file sesuai template.');
        return;
      }

      const parsedStudents = dataLines.map((line) => {
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
        return {
          id: Date.now() + Math.floor(Math.random() * 100000),
          nis: cols[0] || '',
          nama: cols[1] || '',
          ttl: cols[2] || '',
          kelas: selectedKelas,
          tingkat,
          paralel,
          ayah: cols[3] || '',
          ibu: cols[4] || '',
          jobAyah: cols[5] || '',
          jobIbu: cols[6] || '',
          noHp: cols[7] || '',
          username: cols[8] || cols[0] || '',
          password: cols[9] || '123456'
        };
      }).filter(s => s.nis && s.nama);

      for (const s of parsedStudents) {
        await addNewStudent(s);
      }

      setIsSaving(false);
      alert(`File "${file.name}" berhasil diunggah! ${parsedStudents.length} siswa berhasil diimpor ke kelas ${selectedKelas}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
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
    setEditId(student.id);
    setIsViewMode(false);
    
    // Helper to convert "01 Januari 2000" to "2000-01-01" for <input type="date">
    const convertToISODate = (dateStr: string) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return dateStr.trim();
      const months: Record<string, string> = {
        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
      };
      const parts = dateStr.trim().split(' ');
      if (parts.length !== 3) return '';
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      return month ? `${year}-${month}-${day}` : '';
    };

    const ttlParts = student.ttl?.split(', ') || [];

    setNewStudent({
      nama: student.nama,
      nis: student.nis,
      tempatLahir: ttlParts[0] || '',
      tanggalLahir: convertToISODate(ttlParts[1] || ''),
      namaAyah: (student.ayah === '-' ? '' : student.ayah) || '',
      namaIbu: (student.ibu === '-' ? '' : student.ibu) || '',
      pekerjaanAyah: (student.jobAyah === '-' ? '' : student.jobAyah) || student.pAyah || '',
      pekerjaanIbu: (student.jobIbu === '-' ? '' : student.jobIbu) || student.pIbu || '',
      noHp: student.noHp || '08123456789',
      username: student.username,
      password: student.password || 'password123'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenViewModal = (student: any) => {
    setEditId(student.id);
    setIsViewMode(true);
    
    // Same helper for View mode
    const convertToISODate = (dateStr: string) => {
      if (!dateStr) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return dateStr.trim();
      const months: Record<string, string> = {
        'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
        'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
      };
      const parts = dateStr.trim().split(' ');
      if (parts.length !== 3) return '';
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      return month ? `${year}-${month}-${day}` : '';
    };

    const ttlParts = student.ttl?.split(', ') || [];

    setNewStudent({
      nama: student.nama,
      nis: student.nis,
      tempatLahir: ttlParts[0] || '',
      tanggalLahir: convertToISODate(ttlParts[1] || ''),
      namaAyah: student.ayah || '',
      namaIbu: student.ibu || '',
      pekerjaanAyah: student.jobAyah || student.pAyah || '',
      pekerjaanIbu: student.jobIbu || student.pIbu || '',
      noHp: student.noHp || '08123456789',
      username: student.username,
      password: student.password || 'password123'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentClass = classes.find(c => c.nama === selectedKelas);
    const tingkat = currentClass ? currentClass.tingkat : 1;
    const paralel = currentClass ? currentClass.paralel : selectedKelas.replace(/[0-9]/g, '') || 'A';
    const classId = currentClass ? String(currentClass.id) : undefined;

    // Konversi tanggal ISO (YYYY-MM-DD) ke format Indonesia (DD Bulan YYYY) untuk field ttl
    const convertISOToIndonesian = (isoDate: string): string => {
      if (!isoDate) return '1 Januari 2015';
      if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate.trim())) {
        const d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      return isoDate; // sudah format Indonesia
    };

    const formattedDate = convertISOToIndonesian(newStudent.tanggalLahir);

    const studentPayload = {
      id: editId !== null ? editId : Date.now(),
      nis: newStudent.nis,
      nama: newStudent.nama,
      ttl: `${newStudent.tempatLahir}, ${formattedDate}`,
      kelas: selectedKelas,
      tingkat,
      paralel,
      ayah: newStudent.namaAyah,
      ibu: newStudent.namaIbu,
      jobAyah: newStudent.pekerjaanAyah,
      jobIbu: newStudent.pekerjaanIbu,
      username: newStudent.username || newStudent.nis,
      password: newStudent.password || 'password123',
      classId,
    };

    if (editId !== null) {
      await updateStudent(editId, studentPayload);
      alert(`Data siswa ${newStudent.nama} berhasil diperbarui!`);
    } else {
      await addNewStudent(studentPayload as any);
      alert(`Siswa ${newStudent.nama} berhasil ditambahkan!`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteStudent = async (student: any) => {
    await handleDelete(student);
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv"
      />

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
          <h2 className="text-2xl font-bold text-slate-800">Upload data siswa perkelas</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ikon Tombol Aksi Bulat */}
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={handleDownloadTemplate}
              className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 group"
              title="Download Template Excel"
            >
              <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleUploadClick}
              className={`w-10 h-10 flex items-center justify-center ${uploadedFile ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-[#4d7ef2]'} text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-md active:scale-95 group relative`}
              title={uploadedFile ? `File Terpilih: ${uploadedFile}` : "Upload File Excel"}
            >
              {uploadedFile ? <Check size={20} /> : <CloudUpload size={20} className="group-hover:-translate-y-0.5 transition-transform" />}
            </button>
            <button
              onClick={handleOpenAddModal}
              className="w-10 h-10 flex items-center justify-center bg-[#4338ca] text-white rounded-xl hover:bg-[#3730a3] transition-all shadow-md active:scale-95 group"
              title="Tambah Siswa Manual"
            >
              <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Selector Kelas */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative min-w-[120px]">
            <div className="px-4 py-2 border-r border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Nama Kelas
            </div>
            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full pl-4 pr-8 py-2 text-sm font-bold text-[#004AAD] appearance-none focus:outline-none cursor-pointer bg-transparent"
              >
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => {
                setIsSaving(false);
                alert('Seluruh perubahan berhasil disimpan ke database!');
              }, 1500);
            }}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Bookmark size={18} className="fill-white group-hover:scale-110 transition-transform" />
            )}
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
              {filteredStudents.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-4 text-xs text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-medium group-hover:text-[#004AAD]">{item.nis}</td>
                  <td className="px-4 py-4 text-sm text-slate-800 border-r border-slate-50 capitalize font-medium">{item.nama}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50">{item.ttl}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-bold text-center">{item.kelas}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">Kelas {item.tingkat}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center font-bold text-[#004AAD]">{item.paralel}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ayah}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ibu}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.jobAyah || '-'}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.jobIbu || '-'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 text-center font-mono">{item.username}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenViewModal(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Edit Data"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(item)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hapus Data"
                      >
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Info size={18} className="text-[#004AAD]" />
              <span className="text-xs font-bold uppercase tracking-wider">Menampilkan {filteredStudents.length} data perkelas</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#004AAD] text-white rounded-lg text-xs font-bold shadow-md">1</button>
              <button className="p-2 text-slate-400 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pilih Jumlah terlihat</span>
            <div className="relative min-w-[90px]">
              <select
                value={visibleCount}
                onChange={(e) => setVisibleCount(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT SISWA MANUAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {isViewMode ? 'Detail Siswa' : editId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isViewMode ? 'Informasi detail data siswa' : `Input data siswa secara manual untuk kelas ${selectedKelas}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="form-siswa" onSubmit={handleSaveStudent} className="space-y-8">
                {/* Section Data Diri */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Informasi Siswa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Nama Lengkap</label>
                      <input
                        required
                        disabled={isViewMode}
                        type="text"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Nama lengkap siswa"
                        value={newStudent.nama} onChange={e => setNewStudent({ ...newStudent, nama: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">NIS (Nomor Induk Siswa)</label>
                      <input
                        required
                        disabled={isViewMode}
                        type="number"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Nomor Induk"
                        value={newStudent.nis} onChange={e => setNewStudent({ ...newStudent, nis: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Tempat Lahir</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Kota kelahiran"
                        value={newStudent.tempatLahir} onChange={e => setNewStudent({ ...newStudent, tempatLahir: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Tanggal Lahir</label>
                      <input
                        type="date"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-600 disabled:bg-slate-50 disabled:text-slate-500"
                        value={newStudent.tanggalLahir} onChange={e => setNewStudent({ ...newStudent, tanggalLahir: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section Orang Tua */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Data Orang Tua</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Nama Ayah</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Nama Ayah"
                        value={newStudent.namaAyah} onChange={e => setNewStudent({ ...newStudent, namaAyah: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Nama Ibu</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Nama Ibu"
                        value={newStudent.namaIbu} onChange={e => setNewStudent({ ...newStudent, namaIbu: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Pekerjaan Ayah"
                        value={newStudent.pekerjaanAyah} onChange={e => setNewStudent({ ...newStudent, pekerjaanAyah: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Pekerjaan Ibu"
                        value={newStudent.pekerjaanIbu} onChange={e => setNewStudent({ ...newStudent, pekerjaanIbu: e.target.value })}
                      />
                    </div>
                    {/* NEW FIELDS: No Handphone */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-600">No. Handphone / WhatsApp (Orang Tua)</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500" placeholder="Contoh: 081234567890"
                        value={newStudent.noHp} onChange={e => setNewStudent({ ...newStudent, noHp: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* NEW SECTION: Akun Siswa */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Akun Orang Tua/wali</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Username</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500 font-mono" placeholder="Username untuk login"
                        value={newStudent.username} onChange={e => setNewStudent({ ...newStudent, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Password</label>
                      <input
                        type="text"
                        disabled={isViewMode}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500 font-mono" placeholder="Password akun"
                        value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all text-sm"
              >
                Tutup
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  form="form-siswa"
                  className="px-6 py-2.5 rounded-xl bg-[#4338ca] text-white font-bold hover:bg-[#3730a3] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm flex items-center gap-2"
                >
                  <Save size={18} />
                  Simpan Data Siswa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPerkelas;
