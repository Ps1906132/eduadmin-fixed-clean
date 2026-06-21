
import React, { useState } from 'react';
import { PlusCircle, SquarePen, Trash2, X, Save, ChevronDown, School, Info, AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

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

// ─── Helper: ambil token dari localStorage ───────────────────────────────────
const getToken = () => localStorage.getItem('eduadmin_token') || '';

// ─── Helper: ambil academic year aktif ────────────────────────────────────────
const getAcademicYear = async (token: string) => {
  try {
    let res = await fetch('/api/academic_years?is_active=eq.1', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data[0].id;
    }
    res = await fetch('/api/academic_years?order=start_date.desc&limit=1', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data[0].id;
    }
  } catch (e) {
    console.warn('Gagal mengambil tahun ajaran:', e);
  }
  return null;
};

const TambahKelas: React.FC<TambahKelasProps> = ({ onBack, kelasData, setKelasData }) => {
  // ── Modal Tambah/Edit ──────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KelasItem | null>(null); // null = mode Tambah
  const [formData, setFormData] = useState({
    kodeKelas: '',
    namaKelas: '',
    tingkat: '',
    paralel: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // ── Modal Konfirmasi Hapus ─────────────────────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Toast Inline ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Visible count ──────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState('100');

  // ───────────────────────────────────────────────────────────────────────────
  //  BUKA MODAL TAMBAH
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditTarget(null);
    setFormData({ kodeKelas: '', namaKelas: '', tingkat: '', paralel: '' });
    setIsModalOpen(true);
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  BUKA MODAL EDIT — pre-fill dari data kelas
  // ───────────────────────────────────────────────────────────────────────────
  const handleOpenEdit = (item: KelasItem) => {
    setEditTarget(item);
    setFormData({
      kodeKelas: item.kode,
      namaKelas: item.nama,
      tingkat: item.tingkat,
      paralel: item.paralel,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
    setFormData({ kodeKelas: '', namaKelas: '', tingkat: '', paralel: '' });
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  SUBMIT: TAMBAH atau EDIT kelas → sync ke D1
  // ───────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const nama = formData.namaKelas || `${formData.tingkat}${formData.paralel}`;
    const tingkat = parseInt(formData.tingkat) || 0;
    const token = getToken();

    try {
      if (editTarget) {
        // ── MODE EDIT ──────────────────────────────────────────────────────
        // Optimistic UI update
        const updated = kelasData.map((k) =>
          k.id === editTarget.id
            ? { ...k, kode: formData.kodeKelas, nama, tingkat: formData.tingkat, paralel: formData.paralel }
            : k
        );
        setKelasData(updated);
        localStorage.setItem('classes_data_v11', JSON.stringify(
          updated.map((k) => ({
            id: k.id,
            nama: k.nama,
            tingkat: parseInt(k.tingkat),
            paralel: k.paralel,
          }))
        ));

        // Sync ke D1 — PATCH /api/classes?id=eq.{id}
        const res = await fetch(`/api/classes?id=eq.${editTarget.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: nama, grade_level: tingkat }),
        });

        if (!res.ok) {
          console.warn('[TambahKelas] PATCH D1 gagal, data disimpan lokal:', await res.text());
        }

        showToast('success', `Kelas "${nama}" berhasil diperbarui!`);
      } else {
        // ── MODE TAMBAH ────────────────────────────────────────────────────
        const tempId = Date.now(); // ID unik sementara
        const newItem: KelasItem = {
          id: tempId,
          kode: formData.kodeKelas || `KLS-${nama}`,
          nama,
          tingkat: formData.tingkat,
          paralel: formData.paralel,
        };

        // Optimistic UI update
        const updated = [...kelasData, newItem];
        setKelasData(updated);
        localStorage.setItem('classes_data_v11', JSON.stringify(
          updated.map((k) => ({
            id: k.id,
            nama: k.nama,
            tingkat: parseInt(k.tingkat),
            paralel: k.paralel,
          }))
        ));

        // Sync ke D1 — POST /api/classes
        try {
          const academicYearId = await getAcademicYear(token);
          if (!academicYearId) {
            showToast('error', 'Tahun ajaran tidak ditemukan. Buat tahun ajaran di Pengaturan terlebih dahulu.');
            setIsSaving(false);
            return;
          }

          const res = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              id: tempId.toString(),
              name: nama,
              grade_level: tingkat,
              academic_year_id: academicYearId,
              is_active: 1,
            }),
          });

          if (!res.ok) {
            console.warn('[TambahKelas] POST D1 gagal, kelas disimpan lokal:', await res.text());
          }
        } catch (apiErr) {
          console.warn('[TambahKelas] D1 tidak tersedia, kelas disimpan lokal saja:', apiErr);
        }

        showToast('success', `Kelas "${nama}" berhasil ditambahkan!`);
      }
    } catch (err) {
      console.error('[TambahKelas] handleSubmit error:', err);
      showToast('error', 'Terjadi kesalahan. Perubahan mungkin hanya tersimpan secara lokal.');
    } finally {
      setIsSaving(false);
      handleCloseModal();
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  HAPUS kelas → konfirmasi dulu → sync ke D1
  // ───────────────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setIsDeleting(true);
    setDeleteError(null);

    const token = getToken();
    const originalData = [...kelasData];

    // Optimistic UI update
    const updated = kelasData.filter((k) => k.id !== confirmDeleteId);
    setKelasData(updated);
    localStorage.setItem('classes_data_v11', JSON.stringify(
      updated.map((k) => ({
        id: k.id,
        nama: k.nama,
        tingkat: parseInt(k.tingkat),
        paralel: k.paralel,
      }))
    ));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`/api/classes?id=eq.${confirmDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errText = '';
        try { errText = await res.text(); } catch (_) {}

        const isFKError =
          errText.toLowerCase().includes('foreign key') ||
          errText.toLowerCase().includes('constraint');

        // Rollback UI jika gagal
        setKelasData(originalData);
        localStorage.setItem('classes_data_v11', JSON.stringify(
          originalData.map((k) => ({
            id: k.id,
            nama: k.nama,
            tingkat: parseInt(k.tingkat),
            paralel: k.paralel,
          }))
        ));

        setDeleteError(
          isFKError
            ? 'Kelas tidak dapat dihapus karena masih memiliki data terkait (siswa/jadwal/absensi). Hapus data terkait terlebih dahulu.'
            : `Gagal menghapus kelas di server (HTTP ${res.status}). Pastikan Backend API berjalan.`
        );
        return; // jangan tutup modal supaya error terlihat
      }

      // Berhasil
      showToast('success', 'Kelas berhasil dihapus!');
      setConfirmDeleteId(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Timeout → anggap sukses secara lokal
        console.warn('[TambahKelas] Backend timeout, kelas dihapus dari cache lokal saja.');
        showToast('success', 'Kelas dihapus (tersimpan lokal, backend timeout).');
        setConfirmDeleteId(null);
        return;
      }

      // Network error → hapus lokal saja
      console.warn('[TambahKelas] Network error saat hapus, dihapus lokal saja:', err);
      showToast('success', 'Kelas dihapus (mode offline).');
      setConfirmDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 relative">

      {/* ── Toast Notifikasi ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300
            ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── Title & Top Action ── */}
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
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-3 bg-[#4d7ef2] text-white rounded-xl hover:bg-[#3b66d1] transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
        >
          <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="font-bold text-sm tracking-wide">Tambah Kelas Baru</span>
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#f8fafc] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 text-center border-r border-slate-200">No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Nama Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-200">Tingkat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-r border-slate-200">Paralel</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kelasData.length > 0 ? (
                kelasData.slice(0, parseInt(visibleCount)).map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">{item.nama}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center border-r border-slate-50">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                        Kelas {item.tingkat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center font-bold border-r border-slate-50">{item.paralel}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Tombol Edit ── sekarang berfungsi */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Edit Kelas"
                        >
                          <SquarePen size={18} />
                        </button>
                        {/* Tombol Hapus ── sekarang berfungsi */}
                        <button
                          onClick={() => { setDeleteError(null); setConfirmDeleteId(item.id); }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Kelas"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
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

        {/* Footer */}
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

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: TAMBAH / EDIT KELAS
      ══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header modal */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">
                {editTarget ? 'Edit Data Kelas' : 'Form Tambah Kelas'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama Kelas */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nama Kelas
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: 1A, 2B, 3 Merah"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.namaKelas}
                    onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Tingkat */}
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
                {/* Paralel */}
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
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-[#004AAD] text-white font-bold rounded-xl hover:bg-[#003a8a] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save size={18} /> {editTarget ? 'Update Kelas' : 'Simpan Data'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: KONFIRMASI HAPUS
      ══════════════════════════════════════════════════════════════════════ */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => { if (!isDeleting) { setConfirmDeleteId(null); setDeleteError(null); } }}
          />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base">Hapus Kelas</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Kelas yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
                </p>
              </div>
              {!isDeleting && (
                <button
                  onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Pesan error dari D1 (misal FK constraint) */}
            {deleteError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <><Loader2 size={16} className="animate-spin" /> Menghapus...</>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahKelas;
