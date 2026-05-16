import React, { useState } from 'react';
import { ArrowLeft, Save, FileText, CheckCircle, Database, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subjectsDataGlobal } from '../../../../data/sharedData';

interface RaporSettingsViewProps {
    setActiveView: (view: string) => void;
    showOnlyDeskripsi?: boolean;
}

const RaporSettingsView: React.FC<RaporSettingsViewProps> = ({ setActiveView, showOnlyDeskripsi = false }) => {
    const [activeTab, setActiveTab] = useState<'deskripsi' | 'resmi' | 'yayasan'>('deskripsi');
    const [selectedGroup, setSelectedGroup] = useState('Semua');
    const [selectedSubject, setSelectedSubject] = useState('');

    // Rapor Sections Configuration - SEPARATED for Resmi and Yayasan
    const initialSections = [
        { id: 'A', title: 'Sikap', source: 'Input Manual', sync: 'Master Deskripsi', desc: 'Penilaian sikap spiritual dan sosial.' },
        { id: 'B', title: 'Pengetahuan & Keterampilan', source: 'Otomatis', sync: 'Kelola Mapel & Master Deskripsi', desc: 'Nilai pengetahuan dan keterampilan per mapel.' },
        { id: 'C', title: 'Ekstrakurikuler', source: 'Input Manual', sync: '-', desc: 'Kegiatan ekstrakurikuler yang diikuti.' },
        { id: 'D', title: 'Ketidakhadiran', source: 'Otomatis', sync: 'Data Absensi', desc: 'Rekapitulasi kehadiran siswa.' },
        { id: 'E', title: 'Kepribadian', source: 'Input Manual', sync: '-', desc: 'Catatan kepribadian dan perkembangan.' },
        { id: 'F', title: 'Nilai Akhir', source: 'Otomatis', sync: 'Manajemen Nilai', desc: 'Total nilai dan rata-rata semester.' },
        { id: 'G', title: 'Keputusan', source: 'Input Manual (Akhir Tahun)', sync: '-', desc: 'Status naik kelas atau tinggal kelas.' },
    ];

    const [raporSectionsResmi, setRaporSectionsResmi] = useState(initialSections);
    const [raporSectionsYayasan, setRaporSectionsYayasan] = useState(initialSections);

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editingType, setEditingType] = useState<'resmi' | 'yayasan' | null>(null);
    const [tempSource, setTempSource] = useState('Input Manual');
    const [showPreview, setShowPreview] = useState(false);

    const handleEditClick = (sectionId: string, currentSource: string, type: 'resmi' | 'yayasan') => {
        setIsEditing(sectionId);
        setEditingType(type);
        setTempSource(currentSource);
    };

    const handleSaveSection = (sectionId: string) => {
        if (editingType === 'resmi') {
            setRaporSectionsResmi(prev => prev.map(sec => sec.id === sectionId ? { ...sec, source: tempSource } : sec));
        } else if (editingType === 'yayasan') {
            setRaporSectionsYayasan(prev => prev.map(sec => sec.id === sectionId ? { ...sec, source: tempSource } : sec));
        }
        setIsEditing(null);
        setEditingType(null);
    };

    // Description State
    const [newDesc, setNewDesc] = useState({ type: 'Rapor Resmi', predicate: 'A', knowledge: '', skill: '' });
    // State for Descriptions with LocalStorage persistence
    const [descriptions, setDescriptions] = useState<{ id: number; subject: string; knowledge: string; skill: string; type?: string; predicate?: string; [key: string]: unknown }[]>(() => {
        const saved = localStorage.getItem('mock_descriptions');
        if (saved) return JSON.parse(saved);
        return [];
    });

    // Save desc to local storage whenever it changes
    React.useEffect(() => {
        localStorage.setItem('mock_descriptions', JSON.stringify(descriptions));
    }, [descriptions]);

    const handleAddDescription = () => {
        if (!selectedSubject) return toast.error("Mohon pilih Mata Pelajaran terlebih dahulu di filter atas.");
        if (!newDesc.knowledge || !newDesc.skill) return toast.error("Mohon lengkapi deskripsi pengetahuan dan keterampilan.");

        const newId = descriptions.length > 0 ? Math.max(...descriptions.map((d: { id: number }) => d.id)) + 1 : 1;

        const entry = {
            id: newId,
            ...newDesc,
            subject: selectedSubject, // Save the filtered subject
        };

        setDescriptions([...descriptions, entry]);
        setNewDesc({ ...newDesc, knowledge: '', skill: '' }); // Reset text, keep type/predicate
        toast.success("Deskripsi berhasil ditambahkan ke Master Data.");
    };


    // --- CONFIRMATION MODAL STATE ---
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        message: '',
        onConfirm: () => { }
    });

    const handleDeleteDescription = (id: number) => {
        setConfirmModal({
            show: true,
            message: 'Apakah anda yakin ingin menghapus deskripsi ini?',
            onConfirm: () => {
                setDescriptions(prev => prev.filter(d => d.id !== id));
                setConfirmModal({ show: false, message: '', onConfirm: () => { } });
                toast.success("Deskripsi berhasil dihapus");
            }
        });
    };

    const handleEditDescription = (desc: any) => {
        setNewDesc({ type: desc.type as any, predicate: desc.predicate || 'A', knowledge: desc.knowledge, skill: desc.skill });
        if (desc.subject) setSelectedSubject(desc.subject);
    };

    // State untuk Preview Ekskul
    const [previewEkskul, setPreviewEkskul] = useState<any[]>([]);

    const handleAddEkskul = () => {
        setPreviewEkskul([...previewEkskul, { id: Date.now(), name: '', grade: 'B', desc: '' }]);
    };

    const handleRemoveEkskul = (id: number) => {
        setPreviewEkskul(previewEkskul.filter(e => e.id !== id));
    };

    const handleUpdateEkskul = (id: number, field: string, value: string) => {
        setPreviewEkskul(previewEkskul.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    // Extract unique groups
    const groups = ['Semua', ...Array.from(new Set(subjectsDataGlobal.map(s => s.kelompok || 'Lainnya')))];

    // Filter subjects based on group
    const filteredSubjects = selectedGroup === 'Semua'
        ? subjectsDataGlobal
        : subjectsDataGlobal.filter(s => (s.kelompok || 'Lainnya') === selectedGroup);

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
            {/* --- HEADER --- */}
            {/* ... (Existing Header Code) ... */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <button
                    onClick={() => setActiveView('home')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-[#1E1B4B]">Pengaturan Rapor</h2>
                    <p className="text-slate-500 text-sm">Kelola master deskripsi dan format rapor.</p>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="flex gap-2 border-b border-slate-200 mb-6 shrink-0 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('deskripsi')}
                    className={`px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'deskripsi' ? 'border-[#004AAD] text-[#004AAD]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Master Deskripsi
                </button>
                {!showOnlyDeskripsi && (
                    <>
                        <button
                            onClick={() => setActiveTab('resmi')}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'resmi' ? 'border-[#004AAD] text-[#004AAD]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Edit Rapor Resmi
                        </button>
                        <button
                            onClick={() => setActiveTab('yayasan')}
                            className={`px-6 py-3 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'yayasan' ? 'border-[#004AAD] text-[#004AAD]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Edit Rapor Yayasan
                        </button>
                    </>
                )}
            </div>

            {/* --- CONTENT --- */}

            {/* --- MODALS --- */}
            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
                            <p className="text-slate-500 text-sm">{confirmModal.message}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: () => { } })}
                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PREVIEW MODAL --- */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Preview Input Data Rapor</h3>
                                <p className="text-slate-500">Simulasi form input manual oleh wali kelas berdasarkan konfigurasi.</p>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Student Info Header Mock */}
                            <div className="bg-slate-50 p-4 rounded-xl flex gap-6 text-sm border border-slate-200">
                                <div><span className="text-slate-400 block text-xs uppercase font-bold">Nama Siswa</span> <span className="font-bold text-slate-700">Ahmad Zaki</span></div>
                                <div><span className="text-slate-400 block text-xs uppercase font-bold">Kelas</span> <span className="font-bold text-slate-700">1A</span></div>
                                <div><span className="text-slate-400 block text-xs uppercase font-bold">NIS</span> <span className="font-bold text-slate-700">24001</span></div>
                            </div>

                            {raporSectionsResmi.map((section) => (
                                <div key={section.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                    <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="text-blue-500">{section.id}.</span> {section.title}
                                        {section.source === 'Otomatis' && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Otomatis</span>}
                                    </h4>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        {/* A. SIKAP (Manual + Sync Description) */}
                                        {section.id === 'A' && section.source === 'Input Manual' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Predikat Spiritual</label>
                                                    <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50">
                                                        <option>Sangat Baik</option>
                                                        <option>Baik</option>
                                                        <option>Cukup</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi Sikap (Sync Master)</label>
                                                    <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50">
                                                        <option value="">-- Pilih Deskripsi Spiritual --</option>
                                                        {descriptions.map((d: { id: number; knowledge: string }) => (
                                                            <option key={d.id} value={d.id}>{d.knowledge.substring(0, 50)}...</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* B. PENGETAHUAN (Otomatis) */}
                                        {section.id === 'B' && (
                                            <div className="text-slate-500 italic text-sm flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                                <Database size={16} /> Nilai Rapor (Sumatif) disinkronisasi Otomatis dari Modul Penilaian Akademik.
                                            </div>
                                        )}

                                        {/* C. EKSTRAKURIKULER (Manual Dynamic) */}
                                        {section.id === 'C' && section.source === 'Input Manual' && (
                                            <div className="space-y-2">
                                                {previewEkskul.map((ekskul) => (
                                                    <div key={ekskul.id} className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-4">
                                                            <input
                                                                type="text"
                                                                placeholder="Nama Kegiatan"
                                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                                value={ekskul.name}
                                                                onChange={(e) => handleUpdateEkskul(ekskul.id, 'name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <select
                                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                                value={ekskul.grade}
                                                                onChange={(e) => handleUpdateEkskul(ekskul.id, 'grade', e.target.value)}
                                                            >
                                                                <option>A</option>
                                                                <option>B</option>
                                                                <option>C</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-span-5">
                                                            <input
                                                                type="text"
                                                                placeholder="Keterangan"
                                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                                value={ekskul.desc}
                                                                onChange={(e) => handleUpdateEkskul(ekskul.id, 'desc', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-span-1 text-center">
                                                            <button onClick={() => handleRemoveEkskul(ekskul.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={handleAddEkskul} className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-1">
                                                    <Plus size={14} /> Tambah Ekskul
                                                </button>
                                            </div>
                                        )}

                                        {/* D. KETIDAKHADIRAN (Otomatis) */}
                                        {section.id === 'D' && (
                                            <div className="grid grid-cols-3 gap-4 max-w-xs">
                                                <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    <div className="text-xs text-slate-400 font-bold">Sakit</div>
                                                    <div className="font-bold text-slate-700">2</div>
                                                </div>
                                                <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    <div className="text-xs text-slate-400 font-bold">Izin</div>
                                                    <div className="font-bold text-slate-700">1</div>
                                                </div>
                                                <div className="text-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                    <div className="text-xs text-slate-400 font-bold">Alpa</div>
                                                    <div className="font-bold text-slate-700">0</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* E. KEPRIBADIAN (Manual) */}
                                        {section.id === 'E' && section.source === 'Input Manual' && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Perkembangan Karakter</label>
                                                    <textarea rows={2} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Tulis catatan kepribadian..."></textarea>
                                                </div>
                                            </div>
                                        )}

                                        {/* Generic Manual Fallback */}
                                        {section.source === 'Input Manual' && !['A', 'C', 'E'].includes(section.id) && (
                                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm">
                                                Area input manual untuk bagian ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-6 border-t border-slate-100">
                                <button onClick={() => setShowPreview(false)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700">
                                    Simpan Data Simulasi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {/* ... (Existing Content Tabs) ... */}

                {/* 1. MASTER DESKRIPSI */}
                {activeTab === 'deskripsi' && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <Database className="text-blue-600 mt-1" size={20} />
                            <div>
                                <h3 className="font-bold text-blue-800">Master Data Deskripsi</h3>
                                <p className="text-sm text-blue-600/80">Input deskripsi capaian pembelajaran (CP) atau komptensi dasar (KD) untuk otomatisasi pengisian rapor.</p>
                            </div>
                        </div>

                        {/* Filter Group & Mapel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelompok</label>
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                                >
                                    {groups.map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                                >
                                    <option value="">-- Pilih Mapel --</option>
                                    {filteredSubjects.map(s => (
                                        <option key={s.id} value={s.nama}>{s.nama}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Table of Existing Descriptions */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit">
                                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Database size={18} /> Data Tersimpan</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-3">Jenis Rapor</th>
                                                <th className="p-3">Deskripsi</th>
                                                <th className="p-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {descriptions.map((desc) => (
                                                <tr key={desc.id} className="group hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-700 align-top w-[120px]">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-2 py-1 rounded text-[10px] w-fit ${desc.type === 'Rapor Resmi' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                {desc.type}
                                                            </span>
                                                            {desc.subject && (
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                                                                    {desc.subject}
                                                                </span>
                                                            )}
                                                            {desc.predicate && (
                                                                <span className={`text-[10px] font-bold px-2 py-1 rounded w-fit ${desc.predicate === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                                    desc.predicate === 'B' ? 'bg-blue-100 text-blue-700' :
                                                                        desc.predicate === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                                    }`}>
                                                                    Predikat: {desc.predicate}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        <div className="mb-1"><span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-1 rounded">Pengetahuan</span> <span className="text-slate-600 block mt-1 line-clamp-2">{desc.knowledge}</span></div>
                                                        <div><span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-1 rounded">Keterampilan</span> <span className="text-slate-600 block mt-1 line-clamp-2">{desc.skill}</span></div>
                                                    </td>
                                                    <td className="p-3 align-top text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => handleEditDescription(desc)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit (Salin ke Form)">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteDescription(desc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {descriptions.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="p-6 text-center text-slate-400 italic">Belum ada data deskripsi</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Right Column: Input Form */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit">
                                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18} /> Input Deskripsi Baru</h4>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Jenis Rapor</label>
                                            <select
                                                value={newDesc.type}
                                                onChange={(e) => setNewDesc({ ...newDesc, type: e.target.value })}
                                                className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                            >
                                                <option>Rapor Resmi</option>
                                                <option>Rapor Yayasan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-600 mb-1">Untuk Predikat</label>
                                            <select
                                                value={newDesc.predicate}
                                                onChange={(e) => setNewDesc({ ...newDesc, predicate: e.target.value })}
                                                className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                            >
                                                <option value="A">A (Sangat Baik)</option>
                                                <option value="B">B (Baik)</option>
                                                <option value="C">C (Cukup)</option>
                                                <option value="D">D (Kurang)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg text-xs text-blue-700">
                                        Menambahkan untuk Mapel: <strong>{selectedSubject || 'Belum dipilih (Pilih filter mapel diatas)'}</strong>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Deskripsi Pengetahuan</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Siswa mampu memahami..."
                                            value={newDesc.knowledge}
                                            onChange={(e) => setNewDesc({ ...newDesc, knowledge: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Deskripsi Keterampilan</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Siswa terampil dalam..."
                                            value={newDesc.skill}
                                            onChange={(e) => setNewDesc({ ...newDesc, skill: e.target.value })}
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <button onClick={handleAddDescription} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2">
                                            <Save size={18} /> Simpan Deskripsi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. RAPOR RESMI */}
                {activeTab === 'resmi' && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Konfigurasi Format Rapor Resmi</h3>
                                    <p className="text-slate-500">Pengaturan sumber data dan layout rapor dinas.</p>
                                </div>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg font-bold text-slate-600 hover:text-blue-600 text-sm flex items-center gap-2"
                                >
                                    <FileText size={16} /> Preview Input Form
                                </button>
                            </div>

                            <div className="space-y-3">
                                {raporSectionsResmi.map((section) => (
                                    <div key={section.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                                                {section.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">{section.title}</h4>
                                                <p className="text-xs text-slate-500">{section.desc}</p>
                                            </div>
                                        </div>

                                        {isEditing === section.id ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                                <select
                                                    value={tempSource}
                                                    onChange={(e) => setTempSource(e.target.value)}
                                                    className="p-2 text-xs border border-blue-300 rounded-lg bg-blue-50 text-blue-800 font-bold outline-none focus:ring-2 focus:ring-blue-200"
                                                >
                                                    <option value="Input Manual">Input Manual</option>
                                                    <option value="Otomatis">Otomatis</option>
                                                </select>
                                                <button onClick={() => handleSaveSection(section.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><CheckCircle size={16} /></button>
                                                <button onClick={() => setIsEditing(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><ArrowLeft size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${section.source.includes('Manual') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    {section.source}
                                                </span>
                                                {section.sync !== '-' && section.source === 'Otomatis' && (
                                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                                        <Database size={10} /> {section.sync}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(section.id, section.source, 'resmi')}
                                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg hover:bg-blue-50"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. RAPOR YAYASAN */}
                {activeTab === 'yayasan' && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Konfigurasi Format Rapor Yayasan</h3>
                                    <p className="text-slate-500">Pengaturan sumber data dan layout rapor internal yayasan.</p>
                                </div>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg font-bold text-slate-600 hover:text-blue-600 text-sm flex items-center gap-2"
                                >
                                    <FileText size={16} /> Preview Input Form
                                </button>
                            </div>

                            <div className="space-y-3">
                                {raporSectionsYayasan.map((section) => (
                                    <div key={section.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0">
                                                {section.id}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-700">{section.title}</h4>
                                                <p className="text-xs text-slate-500">{section.desc}</p>
                                            </div>
                                        </div>

                                        {isEditing === section.id ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                                <select
                                                    value={tempSource}
                                                    onChange={(e) => setTempSource(e.target.value)}
                                                    className="p-2 text-xs border border-purple-300 rounded-lg bg-purple-50 text-purple-800 font-bold outline-none focus:ring-2 focus:ring-purple-200"
                                                >
                                                    <option value="Input Manual">Input Manual</option>
                                                    <option value="Otomatis">Otomatis</option>
                                                </select>
                                                <button onClick={() => handleSaveSection(section.id)} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><CheckCircle size={16} /></button>
                                                <button onClick={() => setIsEditing(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><ArrowLeft size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${section.source.includes('Manual') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                    {section.source}
                                                </span>
                                                {section.sync !== '-' && section.source === 'Otomatis' && (
                                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                                        <Database size={10} /> {section.sync}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleEditClick(section.id, section.source, 'yayasan')}
                                                    className="p-2 text-slate-400 hover:text-purple-600 transition-colors bg-slate-50 rounded-lg hover:bg-purple-50"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default RaporSettingsView;
