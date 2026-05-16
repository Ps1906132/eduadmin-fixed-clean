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
  Download,
  Loader2,
  ArrowLeft,
  X,
  UserPlus
} from 'lucide-react';

interface UploadSiswaProps {
  onBack?: () => void;
}

interface SiswaData {
  no: number;
  nis: string;
  nama: string;
  ttl: string;
  kelas: string;
  tingkat: string;
  paralel: string;
  ayah: string;
  ibu: string;
  pAyah: string;
  pIbu: string;
  username: string;
  // New Fields
  noHp: string;
  password: string;
}

const UploadSiswa: React.FC<UploadSiswaProps> = ({ onBack }) => {
  const [visibleCount, setVisibleCount] = useState('100');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Dummy Data
  const [dataSiswa, setDataSiswa] = useState<SiswaData[]>([
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
      username: '2025891023',
      noHp: '081234567890',
      password: 'password123'
    }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaData | null>(null);

  // 1. Download Template CSV
  const handleDownloadTemplate = () => {
    // Header CSV sesuai kolom tabel
    const headers = [
      'NIS',
      'Nama Lengkap',
      'Tempat Tanggal Lahir',
      'Kelas',
      'Tingkat',
      'Paralel',
      'Nama Ayah',
      'Nama Ibu',
      'Pekerjaan Ayah',
      'Pekerjaan Ibu',
      'No HP (WA)',
      'Username',
      'Password'
    ];

    // Data contoh untuk template
    const sampleData = [
      '2025891024,Siti Aminah,"Bandung, 10 Maret 2022",KLS-1B,Kelas 1,B,Asep,Susi,Wiraswasta,Ibu Rumah Tangga,081234567891,2025891024,password123'
    ];

    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_data_siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Trigger File Input
  const handleUploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 3. Handle File Change & Parse CSV
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        // Simple CSV Parsing
        const lines = text.split('\n');
        // Remove header row and empty lines
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');

        const parsedData: SiswaData[] = dataLines.map((line, index) => {
          // Handle quoted strings for commas (simple regex split) or simple split if no quotes expected
          const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());

          return {
            no: dataSiswa.length + index + 1,
            nis: cols[0] || '',
            nama: cols[1] || '',
            ttl: cols[2] || '',
            kelas: cols[3] || '',
            tingkat: cols[4] || '',
            paralel: cols[5] || '',
            ayah: cols[6] || '',
            ibu: cols[7] || '',
            pAyah: cols[8] || '',
            pIbu: cols[9] || '',
            noHp: cols[10] || '',
            username: cols[11] || cols[0] || '', // Default username to NIS if empty
            password: cols[12] || '123456' // Default pass
          };
        });

        // Simulate network delay
        setTimeout(() => {
          setDataSiswa(prev => [...prev, ...parsedData]);
          setIsUploading(false);
          alert(`Berhasil memuat ${parsedData.length} data siswa baru!`);
          // Reset file input
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 1000);
      } else {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // 4. Simpan Data
  const handleSimpanData = () => {
    if (dataSiswa.length === 0) {
      alert("Tidak ada data untuk disimpan.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Semua data siswa berhasil disimpan ke database!');
      // Di aplikasi nyata, ini akan mengirim dataSiswa ke backend
    }, 2000);
  };

  const handleDeleteSiswa = (no: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data siswa ini?")) {
      setDataSiswa(prev => prev.filter(item => item.no !== no));
    }
  };

  // ACTION HANDLERS Updated with Modal
  const handleViewDetail = (student: SiswaData) => {
    setSelectedSiswa({ ...student });
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditDetail = (student: SiswaData) => {
    setSelectedSiswa({ ...student });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSiswa) {
      setDataSiswa(prev => prev.map(item => item.no === selectedSiswa.no ? selectedSiswa : item));
      alert(`Data siswa ${selectedSiswa.nama} berhasil diperbarui.`);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
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
          <h2 className="text-2xl font-bold text-slate-800">Upload Seluruh Data Siswa</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Tombol Template */}
          <button
            onClick={handleDownloadTemplate}
            title="Download Template CSV"
            className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center gap-2 group"
          >
            <FileSpreadsheet size={22} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-sm font-bold">Template</span>
          </button>

          {/* Tombol Upload */}
          <button
            onClick={handleUploadFile}
            disabled={isUploading}
            title="Upload File CSV"
            className="p-3 bg-[#4d7ef2] text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-md active:scale-95 flex items-center gap-2 group disabled:opacity-70"
          >
            {isUploading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <CloudUpload size={22} className="group-hover:-translate-y-1 transition-transform" />
            )}
            <span className="hidden sm:inline text-sm font-bold">{isUploading ? 'Proses...' : 'Upload'}</span>
          </button>

          {/* Tombol Simpan */}
          <button
            onClick={handleSimpanData}
            disabled={isSaving || dataSiswa.length === 0}
            className="px-6 py-3 bg-[#e8415a] text-white rounded-xl hover:bg-[#c9344a] transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-2 group disabled:opacity-70 disabled:grayscale"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Bookmark size={20} className="fill-white group-hover:scale-110 transition-transform" />
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
              {dataSiswa.length > 0 ? (
                dataSiswa.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-4 text-xs text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-medium group-hover:text-[#004AAD]">{item.nis}</td>
                    <td className="px-4 py-4 text-sm text-slate-800 border-r border-slate-50 capitalize font-medium">{item.nama}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50">{item.ttl}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 border-r border-slate-50 font-bold text-center">{item.kelas}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.tingkat}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center font-bold text-blue-600">{item.paralel}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ayah}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.ibu}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.pAyah}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 border-r border-slate-50 text-center">{item.pIbu}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 text-center font-mono">{item.username}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditDetail(item)}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit Data"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSiswa(item.no)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Data"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <CloudUpload size={48} className="mb-4 opacity-50" />
                      <p className="font-bold text-lg mb-1">Belum ada data</p>
                      <p className="italic text-sm">Silakan download template lalu upload data siswa disini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Area Updated */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Info size={18} className="text-[#004AAD]" />
              <span className="text-xs font-bold uppercase tracking-wider">Total {dataSiswa.length} Data</span>
            </div>

            {/* Pagination Controls (Visual Only) */}
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:bg-white hover:text-[#004AAD] rounded-lg transition-all border border-transparent hover:border-slate-200">
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#004AAD] text-white rounded-lg text-xs font-bold shadow-md">1</button>
              <button className="p-2 text-slate-400 hover:bg-white hover:text-[#004AAD] rounded-lg transition-all border border-transparent hover:border-slate-200">
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
                <option value="500">500</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL FOR VIEW/EDIT */}
      {isModalOpen && selectedSiswa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  {modalMode === 'edit' ? <Edit size={20} /> : <Eye size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{modalMode === 'edit' ? 'Edit Data Siswa' : 'Detail Data Siswa'}</h3>
                  <p className="text-xs text-slate-500 font-medium">NIS: {selectedSiswa.nis}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <form id="form-edit-siswa" onSubmit={handleSaveEdit} className="space-y-6">
                {/* Data Pribadi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nomor Induk Siswa</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.nis}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, nis: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nama Lengkap</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.nama}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, nama: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Tempat, Tanggal Lahir</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.ttl}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, ttl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Kelas</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.kelas}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, kelas: e.target.value })}
                    />
                  </div>
                </div>

                {/*  Data Orang Tua */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Data Orang Tua</h4>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nama Ayah</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.ayah}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, ayah: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nama Ibu</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      value={selectedSiswa.ibu}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, ibu: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-500">No. Handphone / WhatsApp (Orang Tua)</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                      placeholder="Contoh: 08123456789"
                      value={selectedSiswa.noHp}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, noHp: e.target.value })}
                    />
                  </div>
                </div>

                {/* Akun Orang Tua/Wali */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Akun Orang Tua/wali</h4>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Username</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 font-mono"
                      value={selectedSiswa.username}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Password</label>
                    <input
                      type="text"
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 font-mono"
                      value={selectedSiswa.password}
                      onChange={(e) => setSelectedSiswa({ ...selectedSiswa, password: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all text-sm">Tutup</button>
              {modalMode === 'edit' && (
                <button type="submit" form="form-edit-siswa" className="px-6 py-2.5 rounded-xl bg-[#4338ca] text-white font-bold hover:bg-[#3730a3] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm flex items-center gap-2">
                  <Bookmark size={18} />
                  Simpan Perubahan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Additional Bottom Action Bar */}
      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-center gap-4 animate-pulse">
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <Info size={12} />
          Gunakan tombol Simpan di pojok kanan atas setelah selesai melakukan perubahan data
        </span>
      </div>
    </div>
  );
};

export default UploadSiswa;
