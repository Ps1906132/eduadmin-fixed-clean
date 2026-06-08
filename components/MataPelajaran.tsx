
import React, { useState, useEffect } from 'react';
import {
    BookMarked,
    ChevronDown,
    Code2,
    BookOpen,
    School,
    User,
    Users,
    Plus,
    X,
    Check,
    Edit
} from 'lucide-react';

// Interfaces for Props
interface MapelItem {
    no: number;
    nama: string;
    kode: string;
    kelas: string;
    kelompok: string;
}

interface StafItem {
    no: number;
    noPegawai: string; // NIP
    nama: string;
    jabatan: string;
}

interface KelasItem {
    id: number;
    kode: string;
    nama: string;
    wali: string;
    waliNip: string;
}

interface MataPelajaranProps {
    kelasData?: KelasItem[];
    mapelList?: MapelItem[];
    stafList?: StafItem[];
}

const MataPelajaran: React.FC<MataPelajaranProps> = ({
    kelasData = [],
    mapelList = [],
    stafList = []
}) => {
    // State
    const [selectedClassRaw, setSelectedClassRaw] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingState, setEditingState] = useState<{ isEditing: boolean; index: number | null }>({
        isEditing: false,
        index: null
    });

    // Form State
    const [formData, setFormData] = useState({
        subjectNames: [] as string[], // Using names or codes since ID might not be unique in dummy data, but let's use 'kode' if unique. App.tsx mapelData has 'kode'.
        teacherNo: ''
    });

    // Initialize selected class
    useEffect(() => {
        if (kelasData.length > 0 && !selectedClassRaw) {
            setSelectedClassRaw(kelasData[0].nama);
        }
    }, [kelasData, selectedClassRaw]);

    // Local State for Class <-> Subject Mapping
    // Format: ClassName -> Array of { subjectCode, subjectName, category, teacherName, teacherNip }
    const [classSubjectsData, setClassSubjectsData] = useState<Record<string, Array<{ id: string; subject: string; category: string; guru: string; nip: string }>>>(
        {
            // Initial Seed for Demo (Optional, relying on 'kelasData' names)
            'Kelas 1 Amanah': [
                { id: 'MP-001', subject: 'Pendidikan Agama Islam', category: 'Muatan Nasional', guru: 'Abdul Solihin, S.Pd.I', nip: '19750101 200012 1 001' },
                { id: 'MP-003', subject: 'Matematika', category: 'Muatan Nasional', guru: 'Budi Santoso, M.Pd', nip: '19840303 200903 1 003' }
            ]
        }
    );

    const currentClassInfo = kelasData.find(c => c.nama === selectedClassRaw);
    const currentSubjects = classSubjectsData[selectedClassRaw] || [];

    // Helper to filter Staff (Only Teachers?) - For now use all staff or filter by jabatan if needed.
    // Assuming all in StafList can teach for simplicity.
    const availableTeachers = stafList;

    // Helper for Mapel list
    // mapelList from App.tsx has 'kode', 'nama', 'kelompok'
    const availableSubjects = mapelList;

    const handleOpenAdd = () => {
        setEditingState({ isEditing: false, index: null });
        setFormData({ subjectNames: [], teacherNo: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item: any, index: number) => {
        setEditingState({ isEditing: true, index });
        // Find teacher by NIP and Name to get their 'no' for selection
        const teacher = availableTeachers.find(t => t.noPegawai === item.nip && t.nama === item.guru);
        setFormData({
            subjectNames: [item.id], // Storing ID/Kode here
            teacherNo: teacher ? teacher.no.toString() : ''
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const selectedTeacher = availableTeachers.find(t => t.no.toString() === formData.teacherNo);

        if (formData.subjectNames.length === 0 || !selectedTeacher) {
            alert("Mohon pilih minimal satu Mata Pelajaran dan Guru Pengampu!");
            return;
        }

        // Diagnostic: If teacher has no NIP, alert but allow if necessary? 
        // User says "harus melengkapi NIP", so let's check it.
        if (!selectedTeacher.noPegawai || selectedTeacher.noPegawai === '-') {
            alert("Guru yang dipilih belum memiliki NIP! Silakan lengkapi data NIP guru di menu Data Guru & Staff terlebih dahulu.");
            return;
        }

        if (selectedTeacher) {
            const newEntries = formData.subjectNames.map(subCode => {
                const selectedSubject = availableSubjects.find(s => s.kode === subCode);
                return selectedSubject ? {
                    id: selectedSubject.kode,
                    subject: selectedSubject.nama,
                    category: selectedSubject.kelompok,
                    guru: selectedTeacher.nama,
                    nip: selectedTeacher.noPegawai
                } : null;
            }).filter(Boolean) as any[];

            setClassSubjectsData(prev => {
                const currentList = [...(prev[selectedClassRaw] || [])];

                if (editingState.isEditing && editingState.index !== null) {
                    // Update existing
                    if (newEntries.length > 0) {
                        currentList[editingState.index] = newEntries[0];
                    }
                } else {
                    // Add new
                    newEntries.forEach(entry => currentList.push(entry));
                }

                return {
                    ...prev,
                    [selectedClassRaw]: currentList
                };
            });

            setIsModalOpen(false);
            setFormData({ subjectNames: [], teacherNo: '' });
            setEditingState({ isEditing: false, index: null });
        }
    };

    const toggleSubject = (code: string) => {
        setFormData(prev => {
            const exists = prev.subjectNames.includes(code);
            if (exists) {
                return { ...prev, subjectNames: prev.subjectNames.filter(c => c !== code) };
            } else {
                return { ...prev, subjectNames: [...prev.subjectNames, code] };
            }
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 relative">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3 text-[#004AAD]">
                    <BookMarked size={32} />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Distribusi Mata Pelajaran</h2>
                        <p className="text-sm text-slate-500">Atur mata pelajaran dan guru pengampu untuk setiap kelas.</p>
                    </div>
                </div>

                {/* Class Selector */}
                <div className="relative min-w-[250px]">
                    <select
                        value={selectedClassRaw}
                        onChange={(e) => setSelectedClassRaw(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent appearance-none cursor-pointer transition-all hover:bg-slate-50"
                    >
                        {kelasData.map((cls) => (
                            <option key={cls.id} value={cls.nama}>{cls.nama}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#004AAD]">
                        <ChevronDown size={20} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Side: Class Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <School size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{currentClassInfo?.nama || 'Pilih Kelas'}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Tahun Ajaran 2024/2025</p>

                            <div className="w-full mt-6 space-y-4">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                            <User size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wali Kelas</span>
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">{currentClassInfo?.wali || '-'}</p>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                            <BookOpen size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Mapel</span>
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">{currentSubjects.length} Mata Pelajaran</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Subjects & Teachers Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        {/* Table Toolbar */}
                        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                                <Code2 size={20} className="text-[#004AAD]" />
                                Daftar Mata Pelajaran & Pengampu
                            </h3>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleOpenAdd}
                                    className="px-4 py-2.5 bg-[#004AAD] text-white rounded-xl text-sm font-bold hover:bg-[#003380] transition-colors shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    <Plus size={18} />
                                    Tambah Pengampu
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 w-16 text-center">No</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Mata Pelajaran</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 text-center">Kelompok</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">Guru Pengampu</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200">NIP Guru</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentSubjects.length > 0 ? (
                                        currentSubjects.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-slate-500 text-center border-r border-slate-50">{idx + 1}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700 border-r border-slate-50">
                                                    {item.subject}
                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-50 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{item.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700 border-r border-slate-50 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                                        {item.guru.charAt(0)}
                                                    </div>
                                                    {item.guru}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-slate-500 border-r border-slate-50">{item.nip}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleEdit(item, idx)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                                                    >
                                                        <Edit size={14} />
                                                        Ubah
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                                Belum ada mata pelajaran yang diatur untuk kelas ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#004AAD] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{editingState.isEditing ? 'Ubah Pengampu Mapel' : 'Tambah Pengampu Mapel'}</h3>
                                <p className="text-blue-100 text-xs mt-1">
                                    {editingState.isEditing ? 'Perbarui data guru pengampu' : 'Atur pelajaran dan guru pengampu'} untuk {selectedClassRaw}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Subject Multi-Select */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Mata Pelajaran {editingState.isEditing ? '' : '(Bisa pilih lebih dari satu)'}</label>
                                {editingState.isEditing ? (
                                    <div className="relative">
                                        <select
                                            value={formData.subjectNames[0] || ''}
                                            onChange={(e) => setFormData({ ...formData, subjectNames: [e.target.value] })}
                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD] transition-all appearance-none"
                                        >
                                            <option value="">-- Pilih Mata Pelajaran --</option>
                                            {availableSubjects.map((subj) => (
                                                <option key={subj.kode} value={subj.kode}>{subj.nama}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl p-2 bg-slate-50">
                                        {availableSubjects.length > 0 ? availableSubjects.map((subj) => {
                                            const isSelected = formData.subjectNames.includes(subj.kode);
                                            return (
                                                <div
                                                    key={subj.kode}
                                                    onClick={() => toggleSubject(subj.kode)}
                                                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{subj.nama}</span>
                                                        <span className="text-[10px] text-slate-500">{subj.kelompok}</span>
                                                    </div>
                                                    {isSelected && <Check size={18} className="text-blue-600" />}
                                                </div>
                                            );
                                        }) : <div className="p-4 text-center text-slate-400 text-sm">Tidak ada data mata pelajaran.</div>}
                                    </div>
                                )}
                            </div>

                            {/* Teacher Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Guru Pengampu</label>
                                <div className="relative">
                                    <select
                                        value={formData.teacherNo}
                                        onChange={(e) => setFormData({ ...formData, teacherNo: e.target.value })}
                                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD] transition-all appearance-none"
                                    >
                                        <option value="">-- Pilih Guru --</option>
                                        {availableTeachers.map((teach) => (
                                            <option key={teach.no} value={teach.no.toString()}>{teach.nama}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {formData.teacherNo && (
                                    <div className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg inline-block font-bold font-mono">
                                        NIP: {availableTeachers.find(t => t.no.toString() === formData.teacherNo)?.noPegawai || '-'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-[#004AAD] text-white rounded-xl font-bold hover:bg-[#003380] transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                            >
                                <Check size={18} />
                                {editingState.isEditing ? 'Simpan Perubahan' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MataPelajaran;
