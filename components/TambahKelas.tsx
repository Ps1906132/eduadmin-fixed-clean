
import React, { useState } from 'react';
import { PlusCircle, SquarePen, Trash2, X, Save, ChevronDown, School, Info, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface KelasItem {
  id: number;
  kode: string;
  nama: string;
  tingkat: string;
  paralel: string;
}

interface TambahKelasProps {
  onBack?: () => void;
  kelasData: KelasItem[];
  setKelasData: React.Dispatch<React.SetStateAction<KelasItem[]>>;
}

const TambahKelas: React.FC<TambahKelasProps> = ({ onBack, kelasData, setKelasData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    kodeKelas: '',
    namaKelas: '',
    tingkat: '',
    paralel: ''
  });
  const [visibleCount, setVisibleCount] = useState('100');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Data Kelas Baru:', formData);
    // Simulasi tambah data
    const newData = {
      id: kelasData.length + 1,
      kode: formData.kodeKelas,
      nama: formData.namaKelas,
      tingkat: formData.tingkat,
      paralel: formData.paralel
    };
    setKelasData([...kelasData, newData]);
    alert('Data kelas berhasil disimpan!');
    setIsModalOpen(false);
    setFormData({ kodeKelas: '', namaKelas: '', tingkat: '', paralel: '' });
  };

  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">
      {/* Title & Top Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 mr-1"
              title="Kembali ke menu sebelumnya"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex items-center gap-3 text-[#004AAD]">
            <School size={28} className="stroke-[2.5]" />
            <h2 className="text-2xl font-bold tracking-tight">Manajemen Kelas</h2>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#4d7ef2] text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 text-center border-r border-slate-200">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Kode Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-200">Tingkat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-200">Paralel</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kelasData.length > 0 ? (
                kelasData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 font-medium border-r border-slate-50">{item.kode}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{item.nama}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-50">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Kelas {item.tingkat}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold border-r border-slate-50">{item.paralel}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Edit Kelas">
                          <SquarePen size={18} />
                        </button>
                        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Hapus Kelas">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                        <School size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">Belum ada data kelas yang ditambahkan.</p>
                      <p className="text-xs text-slate-400">Silakan klik tombol "Tambah Kelas Baru" untuk memulai.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination/Limit */}
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-500">
            <Info size={16} className="text-[#004AAD]" />
            <span className="text-xs font-bold uppercase tracking-wider">Total {kelasData.length} Kelas Terdaftar</span>
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

      {/* Modal Form Tambah Kelas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Form Tambah Kelas</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Kelas</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: KLS-A1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.kodeKelas}
                    onChange={(e) => setFormData({ ...formData, kodeKelas: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kelas</label>
                  <input
                    required
                    type="text"
                    placeholder="Nama Ruangan/Kelas"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.namaKelas}
                    onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tingkat</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                      value={formData.tingkat}
                      onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                    >
                      <option value="">Pilih Tingkat</option>
                      <option value="1">Kelas 1</option>
                      <option value="2">Kelas 2</option>
                      <option value="3">Kelas 3</option>
                      <option value="4">Kelas 4</option>
                      <option value="5">Kelas 5</option>
                      <option value="6">Kelas 6</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paralel</label>
                  <input
                    type="text"
                    placeholder="Contoh: A, B, atau 1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.paralel}
                    onChange={(e) => setFormData({ ...formData, paralel: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#004AAD] text-white font-bold rounded-xl hover:bg-[#003a8a] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                >
                  <Save size={18} />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahKelas;
