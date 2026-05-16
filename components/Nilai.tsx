import React, { useState, useEffect } from 'react';
import {
    Users,
    ChevronDown,
    Search,
    Save,
    BookOpen,
    Plus,
    Trash2,
    Info,
    FileText,
    ArrowLeft,
    GraduationCap,
    Wand2,
    Download,
    Upload
} from 'lucide-react';

interface Student {
    no: number;
    nis: string;
    nama: string;
    gender: string;
}

interface KelasItem {
    id: number;
    kode: string;
    nama: string;
}

interface MapelItem {
    no: number;
    nama: string;
}

interface NilaiProps {
    kelasData: KelasItem[];
    studentsData: Record<string, Student[]>;
    mapelData: MapelItem[];
    gradesData: Record<string, Record<string, Record<string, string>>>;
    setGradesData: React.Dispatch<React.SetStateAction<Record<string, Record<string, Record<string, string>>>>>;
    customColumnsData: Record<string, string[]>;
    setCustomColumnsData: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const Nilai: React.FC<NilaiProps> = ({
    kelasData,
    studentsData,
    mapelData,
    gradesData,
    setGradesData,
    customColumnsData,
    setCustomColumnsData
}) => {
    // Navigation State
    const [view, setView] = useState<'menu' | 'input' | 'deskripsi'>('menu');
    const [activeCategory, setActiveCategory] = useState<string>('');

    // Selection State
    const [selectedClassRaw, setSelectedClassRaw] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    // Data State
    // Categories list (can be added to)
    const [categories, setCategories] = useState<string[]>([
        'Ulangan Harian',
        'Penilaian Tengah Semester 1',
        'Penilaian Akhir Semester',
        'Penilaian Tengah Semester 2',
        'Penilaian Akhir Tahun'
    ]);

    // Track Category Type: Dinas vs Yayasan
    // Using simple string here now to support custom yayasan names
    const [categoryTypes, setCategoryTypes] = useState<Record<string, string>>({
        'Ulangan Harian': 'Dinas',
        'Penilaian Tengah Semester 1': 'Dinas',
        'Penilaian Akhir Semester': 'Dinas',
        'Penilaian Tengah Semester 2': 'Dinas',
        'Penilaian Akhir Tahun': 'Dinas'
    });

    // Lifted State Aliases (for easier refactoring)
    const customColumns = customColumnsData;
    const setCustomColumns = setCustomColumnsData;
    const grades = gradesData;
    const setGrades = setGradesData;

    const [searchTerm, setSearchTerm] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<'Dinas' | 'Yayasan'>('Dinas');
    const [yayasanName, setYayasanName] = useState(''); // Custom Yayasan Name

    // Description Bank State
    const [descriptionBank, setDescriptionBank] = useState<string[]>([
        "Ananda sangat baik dalam memahami materi yang diajarkan.",
        "Mampu mengikuti pembelajaran dengan baik dan aktif di kelas.",
        "Perlu lebih teliti dalam mengerjakan tugas harian.",
        "Menunjukkan peningkatan motivasi belajar yang signifikan.",
        "Memiliki sikap sopan santun dan disiplin yang baik.",
        "Perlu bimbingan lebih lanjut dalam materi hafalan.",
        "Sangat antusias dalam kegiatan praktik dan diskusi."
    ]);
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [activeBankTarget, setActiveBankTarget] = useState<{ nis: string, col: string } | null>(null);
    const [newDescToBank, setNewDescToBank] = useState('');

    // Initialize defaults
    useEffect(() => {
        if (kelasData.length > 0 && !selectedClassRaw) {
            setSelectedClassRaw(kelasData[0].nama);
        }
        if (mapelData.length > 0 && !selectedSubject) {
            setSelectedSubject(mapelData[0].nama);
        }
    }, [kelasData, mapelData, selectedClassRaw, selectedSubject]);

    // Helper functions
    const getStorageKey = () => `${selectedClassRaw}_${selectedSubject}_${activeCategory}`;

    const currentStudents = studentsData[selectedClassRaw] || [];
    const storageKey = getStorageKey();
    const currentColumns = customColumns[storageKey] || [];
    const currentGrades = grades[storageKey] || {};

    // Derived Data for Description View
    const descriptionStorageKey = `${selectedClassRaw}_${selectedSubject}_DESKRIPSI_AKHIR`;
    const descriptionData = grades[descriptionStorageKey] || {};

    const filteredStudents = currentStudents.filter(s =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.includes(searchTerm)
    );

    // Auto-create 'Nilai' column for fixed categories if missing
    useEffect(() => {
        if (view === 'input' && activeCategory) {
            const fixedCategories = ['Penilaian Tengah Semester 1', 'Penilaian Akhir Semester', 'Penilaian Tengah Semester 2', 'Penilaian Akhir Tahun'];
            if (fixedCategories.includes(activeCategory)) {
                const key = getStorageKey();
                const existingCols = customColumns[key] || [];
                if (existingCols.length === 0) {
                    setCustomColumns(prev => ({
                        ...prev,
                        [key]: ['Nilai']
                    }));
                }
            }
        }
    }, [view, activeCategory, selectedClassRaw, selectedSubject, customColumns, setCustomColumns]);

    // Handlers
    const handleAddCategory = () => {
        setNewCategoryName('');
        setNewCategoryType('Dinas');
        setYayasanName('');
        setIsModalOpen(true);
    };

    const handleSaveCategory = () => {
        if (!newCategoryName.trim()) {
            alert("Nama kategori tidak boleh kosong!");
            return;
        }

        if (categories.includes(newCategoryName)) {
            alert("Kategori tersebut sudah ada.");
            return;
        }

        // Final Type String: If Yayasan, use custom name if provided, else just 'Yayasan' (or keep 'Yayasan' as type but display name differently?)
        // The user request says: "yayasan choice with manual input for yayasan name".
        // Let's store the type as 'Yayasan' but maybe we need to store the custom name?
        // For now, let's stick to the existing structure 'Dinas' | 'Yayasan'.
        // If the user wants the BADGE to say "Yayasan Al-Falah", we might need to change the type of categoryTypes to string.

        // Let's assume specific Yayasan name is just for the "Type" label.

        const finalType = newCategoryType === 'Yayasan' && yayasanName.trim() ? yayasanName.trim() : newCategoryType;

        setCategories([...categories, newCategoryName]);
        // Note: We need to cast finalType to 'Dinas' | 'Yayasan' if we keep strict types, OR relax the type.
        // Let's relax the type definition of categoryTypes to Record<string, string>

        setCategoryTypes(prev => ({
            ...prev,
            [newCategoryName]: finalType as any
        }));

        setIsModalOpen(false);
    };

    const handleEnterCategory = (category: string) => {
        setActiveCategory(category);
        setView('input');
        setSearchTerm('');
    };

    const handleAddColumn = () => {
        if (!activeCategory) {
            alert("Kategori penilaian belum dipilih!");
            return;
        }

        const colName = prompt(`Masukkan Nama Kolom Baru untuk ${activeCategory}:`);
        if (!colName || !colName.trim()) return;

        const cleanName = colName.trim();

        // Check for duplicates
        const currentList = customColumns[storageKey] || [];
        const isDuplicate = currentList.some(col => col.split('::')[0].toLowerCase() === cleanName.toLowerCase());

        if (isDuplicate) {
            alert(`Kolom dengan nama "${cleanName}" sudah ada dalam kategori ini.`);
            return;
        }

        // Ask Column Type
        const isText = window.confirm(
            `Apakah kolom "${cleanName}" ini untuk input DESKRIPSI/CATATAN (Teks)?\n\n` +
            `[OK] = Ya, Diskripsi (Teks Panjang)\n` +
            `[Cancel] = Tidak, Nilai Biasa (Angka)`
        );

        const finalKey = isText ? `${cleanName}::TEXT` : cleanName;

        setCustomColumns(prev => ({
            ...prev,
            [storageKey]: [...(prev[storageKey] || []), finalKey]
        }));

        setIsSaved(false);
    };

    const handleRemoveColumn = (colName: string) => {
        // Display name cleanup
        const displayName = colName.split('::')[0];
        if (confirm(`Hapus kolom "${displayName}"? Semua nilai di kolom ini akan hilang.`)) {
            setCustomColumns(prev => ({
                ...prev,
                [storageKey]: prev[storageKey].filter(c => c !== colName)
            }));

            // Clean up grades for this column
            setGrades(prev => {
                const newSubjectGrades = { ...prev[storageKey] };
                Object.keys(newSubjectGrades).forEach(nis => {
                    delete newSubjectGrades[nis][colName];
                });
                return { ...prev, [storageKey]: newSubjectGrades };
            });
            setIsSaved(false);
        }
    };

    const handleGradeChange = (nis: string, colName: string, value: string) => {
        setGrades(prev => ({
            ...prev,
            [storageKey]: {
                ...prev[storageKey],
                [nis]: {
                    ...(prev[storageKey]?.[nis] || {}),
                    [colName]: value
                }
            }
        }));
        setIsSaved(false);
    };

    const handleBatchFill = (colName: string) => {
        const val = prompt(`Masukkan nilai otomatis untuk kolom "${colName}".\nNilai ini akan diisi ke SEMUA siswa di kelas ini.`);
        if (val !== null) {
            if (confirm(`Yakin ingin mengisi nilai "${val}" ke semua siswa pada kolom "${colName}"? Data lama di kolom ini akan tertimpa.`)) {
                setGrades(prev => {
                    const currentData = prev[storageKey] || {};
                    const newSubjectGrades = { ...currentData };

                    currentStudents.forEach(student => {
                        if (!newSubjectGrades[student.nis]) newSubjectGrades[student.nis] = {};
                        newSubjectGrades[student.nis] = {
                            ...newSubjectGrades[student.nis],
                            [colName]: val
                        };
                    });
                    return { ...prev, [storageKey]: newSubjectGrades };
                });
                setIsSaved(false);
            }
        }
    };

    const handleDownloadTemplate = () => {
        // Create CSV Header
        const headers = ['No', 'NIS', 'Nama Siswa', ...currentColumns];
        const rows = currentStudents.map((s, i) => {
            const gradeRow = currentGrades[s.nis] || {};
            const gradeValues = currentColumns.map(col => gradeRow[col] || '');
            return [i + 1, s.nis, `"${s.nama}"`, ...gradeValues].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `Nilai_${selectedClassRaw}_${selectedSubject}_${activeCategory}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const lines = text.split('\n');
            if (lines.length < 2) return; // No data

            // Parse headers to find column indices
            const headers = lines[0].split(',').map(h => h.trim());

            // Auto-detect columns from CSV if they don't exist in app
            // Columns start from index 3 (No, NIS, Nama)
            const newColsInCsv = headers.slice(3).filter(c => c);

            // Add new columns to state if needed
            let updatedColumns = [...currentColumns];
            newColsInCsv.forEach(c => {
                if (!updatedColumns.includes(c)) updatedColumns.push(c);
            });

            if (updatedColumns.length > currentColumns.length) {
                setCustomColumns(prev => ({
                    ...prev,
                    [storageKey]: updatedColumns
                }));
            }

            // Parse Data
            const newGrades = { ...(grades[storageKey] || {}) };

            lines.slice(1).forEach(line => {
                // Handle split properly (ignoring commas in quotes if simple, but simple split for now)
                // Assuming simple CSV without complex quoted fields for grades
                const parts = line.split(',');
                if (parts.length < 2) return;

                const nis = parts[1].trim();

                // Find student by NIS to confirm validity (optional but good)
                const studentExists = currentStudents.some(s => s.nis === nis);
                if (studentExists) {
                    if (!newGrades[nis]) newGrades[nis] = {};

                    // Map values to columns
                    updatedColumns.forEach((col, idx) => {
                        const csvVal = parts[idx + 3]?.trim(); // Offset 3 for No, NIS, Nama
                        if (csvVal !== undefined) {
                            newGrades[nis][col] = csvVal.replace(/^"|"$/g, ''); // Clean quotes
                        }
                    });
                }
            });

            setGrades(prev => ({
                ...prev,
                [storageKey]: newGrades
            }));
            setIsSaved(false);
            alert("Data nilai berhasil di-upload!");
        };
        reader.readAsText(file);
        // Reset input value to allow re-uploading same file
        event.target.value = '';
    };

    const handleSave = () => {
        console.log('Saving grades:', { key: storageKey, grades: currentGrades });
        setIsSaved(true);
        // Here you would typically make an API call to save data
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Top Navigation / Breadcrumbs (Only visible in Input view) */}
            {view === 'input' && (
                <button
                    onClick={() => setView('menu')}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#004AAD] transition-colors w-fit font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>Kembali ke Menu Nilai</span>
                </button>
            )}

            {/* View: MENU DASHBOARD */}
            {view === 'menu' && (
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 text-[#004AAD] border-b border-slate-200 pb-4">
                        <Users size={32} />
                        <h2 className="text-2xl font-bold tracking-tight">Input Nilai Hasil Pembelajaran</h2>
                    </div>

                    <div className="flex flex-col gap-6">


                        {/* Add Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddCategory}
                                className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Plus size={20} strokeWidth={3} />
                                <span>Tambahkan Nilai</span>
                            </button>

                            <button
                                onClick={() => {
                                    setView('deskripsi');
                                    setSearchTerm('');
                                }}
                                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <BookOpen size={20} strokeWidth={3} />
                                <span>Input Deskripsi</span>
                            </button>
                        </div>

                        {/* Category Grid */}
                        <div className="flex flex-wrap gap-4">
                            {categories.map((cat, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleEnterCategory(cat)}
                                    className={`relative px-6 py-4 font-semibold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all min-w-[200px] text-center overflow-hidden
                                        ${categoryTypes[cat] === 'Yayasan'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30'
                                            : 'bg-[#4F46E5] hover:bg-[#4338ca] text-white shadow-blue-500/30'}`}
                                >
                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                        <span>{cat}</span>
                                        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                            {categoryTypes[cat] || 'Dinas'}
                                        </span>
                                    </div>

                                    {/* Decor */}
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* View: INPUT TABLE */}
            {view === 'input' && (
                <div className="flex flex-col gap-6">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">{activeCategory}</h2>
                            <div className="flex flex-col md:flex-row gap-3">
                                {/* Mapel Selector Small */}
                                <div className="relative min-w-[200px]">
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD] appearance-none cursor-pointer"
                                    >
                                        {mapelData.map((m) => (
                                            <option key={m.no} value={m.nama}>{m.nama}</option>
                                        ))}
                                    </select>
                                    <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                </div>

                                {/* Class Selector Small */}
                                <div className="relative min-w-[200px]">
                                    <select
                                        value={selectedClassRaw}
                                        onChange={(e) => setSelectedClassRaw(e.target.value)}
                                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#004AAD] appearance-none cursor-pointer"
                                    >
                                        {kelasData.map((k) => (
                                            <option key={k.id} value={k.nama}>{k.nama}</option>
                                        ))}
                                    </select>
                                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="file"
                                accept=".csv"
                                id="csvUpload"
                                className="hidden"
                                onChange={handleFileUpload}
                            />

                            <button
                                onClick={() => document.getElementById('csvUpload')?.click()}
                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                                title="Upload Nilai (CSV)"
                            >
                                <Upload size={18} />
                                <span className="hidden sm:inline">Upload</span>
                            </button>

                            <button
                                onClick={handleDownloadTemplate}
                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                                title="Download Template"
                            >
                                <Download size={18} />
                                <span className="hidden sm:inline">Template</span>
                            </button>

                            {/* Add Column Button - Hidden for Semester Assessments */}
                            {!['Penilaian Tengah Semester 1', 'Penilaian Akhir Semester', 'Penilaian Tengah Semester 2', 'Penilaian Akhir Tahun'].includes(activeCategory) && (
                                <button
                                    onClick={handleAddColumn}
                                    className="px-6 py-2.5 bg-white border border-slate-200 text-[#004AAD] rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
                                >
                                    <Plus size={18} />
                                    <span>Tambah Kolom</span>
                                </button>
                            )}

                            <button
                                onClick={handleSave}
                                className={`px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 flex-1 md:flex-none
                                    ${isSaved
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                                        : 'bg-[#004AAD] text-white hover:bg-[#003380] shadow-blue-500/20'}`}
                            >
                                <Save size={18} />
                                <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari siswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004AAD] shadow-sm"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center">No</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest min-w-[250px]">Nama Siswa</th>
                                        {currentColumns.map((col) => {
                                            // Clean column name for display
                                            const displayName = col.split('::')[0];
                                            const isTextCol = col.includes('::TEXT');

                                            // Render Table Header
                                            return (
                                                <th key={col} className={`px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center group cursor-pointer hover:bg-slate-100 transition-colors ${isTextCol ? 'min-w-[300px]' : 'min-w-[100px]'}`}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span>{displayName}</span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleBatchFill(col); }}
                                                                className="p-1 hover:bg-blue-100 hover:text-blue-600 rounded-md transition-all"
                                                                title="Isi Otomatis (Batch)"
                                                            >
                                                                <Wand2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveColumn(col); }}
                                                                className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded-md transition-all"
                                                                title="Hapus kolom"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </th>
                                            )
                                        })}
                                        {currentColumns.length === 0 && (
                                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center italic font-normal">
                                                Belum ada kolom penilaian
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, index) => (
                                            <tr key={student.nis} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-center text-slate-400 text-sm font-medium">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-700">{student.nama}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{student.nis}</div>
                                                </td>
                                                {currentColumns.map((col) => {
                                                    const isTextCol = col.includes('::TEXT');
                                                    return (
                                                        <td key={col} className="px-2 py-4">
                                                            {isTextCol ? (
                                                                <div className="relative">
                                                                    <textarea
                                                                        value={currentGrades[student.nis]?.[col] || ''}
                                                                        onChange={(e) => handleGradeChange(student.nis, col, e.target.value)}
                                                                        className="w-full p-2 pr-8 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent transition-all placeholder:text-slate-300 min-h-[80px] resize-y"
                                                                        placeholder="Tulis deskripsi capaian..."
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            setActiveBankTarget({ nis: student.nis, col });
                                                                            setIsBankOpen(true);
                                                                        }}
                                                                        className="absolute top-2 right-2 p-1 bg-slate-100 hover:bg-[#004AAD] hover:text-white text-slate-400 rounded-md transition-colors"
                                                                        title="Buka Bank Deskripsi"
                                                                    >
                                                                        <BookOpen size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={currentGrades[student.nis]?.[col] || ''}
                                                                    onChange={(e) => handleGradeChange(student.nis, col, e.target.value)}
                                                                    className="w-full text-center py-2 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#004AAD] focus:border-transparent transition-all placeholder:text-slate-300"
                                                                    placeholder="-"
                                                                />
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                                {currentColumns.length === 0 && (
                                                    <td className="px-6 py-4 text-center text-slate-400 text-sm italic">
                                                        Klik "Tambah Kolom" untuk mulai input
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={currentColumns.length === 0 ? 3 : currentColumns.length + 2} className="px-6 py-12 text-center text-slate-400">
                                                Tidak ada siswa ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* View: Kelola Bank Deskripsi (Master Data) */}
            {/* View: Kelola Bank Deskripsi (Master Data) */}
            {view === 'deskripsi' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                        <button
                            onClick={() => setView('menu')}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Kelola Bank Deskripsi</h2>
                            <p className="text-slate-500 text-sm">Input data master deskripsi / capaian pembelajaran untuk referensi rapot</p>
                        </div>
                    </div>

                    {/* Filters (Mapel & Kelas) */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Mapel Selector */}
                        <div className="relative min-w-[250px]">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer shadow-sm"
                            >
                                {mapelData.map((m) => (
                                    <option key={m.no} value={m.nama}>{m.nama}</option>
                                ))}
                            </select>
                            <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>

                        {/* Class Selector */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={selectedClassRaw}
                                onChange={(e) => setSelectedClassRaw(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer shadow-sm"
                            >
                                {kelasData.map((k) => (
                                    <option key={k.id} value={k.nama}>{k.nama}</option>
                                ))}
                            </select>
                            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>

                    {/* Add New Description Box */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Plus className="text-emerald-500" />
                            Tambah Deskripsi Baru
                        </h3>
                        <div className="flex gap-4 items-start">
                            <textarea
                                value={newDescToBank}
                                onChange={(e) => setNewDescToBank(e.target.value)}
                                className="flex-1 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] bg-slate-50 focus:bg-white transition-all"
                                placeholder="Tulis kalimat deskripsi capaian pembelajaran disini..."
                            />
                            <button
                                onClick={() => {
                                    if (newDescToBank.trim()) {
                                        setDescriptionBank([newDescToBank.trim(), ...descriptionBank]);
                                        setNewDescToBank('');
                                        setIsSaved(false);
                                    }
                                }}
                                className="px-8 py-3 bg-[#004AAD] text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm h-fit self-end"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>

                    {/* Description List */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Daftar Deskripsi Tersimpan ({descriptionBank.length})</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {descriptionBank.map((desc, idx) => (
                                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#004AAD] flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 text-slate-700 leading-loose font-medium text-[15px]">
                                        {desc}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => {
                                                const newText = prompt("Edit Deskripsi:", desc);
                                                if (newText && newText !== desc) {
                                                    const newBank = [...descriptionBank];
                                                    newBank[idx] = newText;
                                                    setDescriptionBank(newBank);
                                                }
                                            }}
                                            className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Hapus deskripsi ini?")) {
                                                    setDescriptionBank(descriptionBank.filter((_, i) => i !== idx));
                                                }
                                            }}
                                            className="p-2 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {descriptionBank.length === 0 && (
                                <div className="p-12 text-center text-slate-400 italic">
                                    Belum ada data deskripsi. Silakan tambahkan di atas.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}


            {/* Modal Add Category */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-800">Tambah Kategori Nilai Baru</h3>
                                <p className="text-sm text-slate-500 mt-1">Silakan lengkapi form di bawah ini.</p>
                            </div>

                            <div className="p-6 flex flex-col gap-6">
                                {/* Input 1: Nama Kategori */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        1. Nama Kategori
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Ujian Praktik Sholat"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004AAD] transition-all"
                                        autoFocus
                                    />
                                </div>

                                {/* Input 2: Pilihan Tipe */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                                        2. Jenis Rapot
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setNewCategoryType('Dinas')}
                                            className={`px-4 py-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-1
                                            ${newCategoryType === 'Dinas'
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-white text-slate-400 hover:border-blue-300'}`}
                                        >
                                            <span className="text-lg">🏛️</span>
                                            <span>Dinas</span>
                                        </button>
                                        <button
                                            onClick={() => setNewCategoryType('Yayasan')}
                                            className={`px-4 py-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-1
                                            ${newCategoryType === 'Yayasan'
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-white text-slate-400 hover:border-emerald-300'}`}
                                        >
                                            <span className="text-lg">🕌</span>
                                            <span>Yayasan</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Conditional Input: Nama Yayasan */}
                                {newCategoryType === 'Yayasan' && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                                            Nama Yayasan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ketik nama yayasan... (Default: Yayasan)"
                                            value={yayasanName}
                                            onChange={(e) => setYayasanName(e.target.value)}
                                            className="w-full px-4 py-2 bg-emerald-50/50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-800 placeholder:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        />
                                        <p className="text-[10px] text-slate-400">*Jika dikosongkan akan tertulis 'Yayasan'.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveCategory}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#004AAD] hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    Simpan Kategori
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal Bank Deskripsi */}
            {
                isBankOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <BookOpen className="text-[#004AAD]" />
                                        Bank Deskripsi
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Pilih deskripsi yang tersedia atau tambahkan baru.</p>
                                </div>
                                <button onClick={() => setIsBankOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                                <div className="grid gap-3">
                                    {descriptionBank.map((desc, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (activeBankTarget) {
                                                    if (activeBankTarget.col === 'MAIN_SAB_SPECIAL_VIEW') {
                                                        // Handle Description View Update
                                                        setGradesData(prev => ({
                                                            ...prev,
                                                            [descriptionStorageKey]: {
                                                                ...prev[descriptionStorageKey],
                                                                [activeBankTarget.nis]: {
                                                                    ...(prev[descriptionStorageKey]?.[activeBankTarget.nis] || {}),
                                                                    'MAIN_SAB': desc
                                                                }
                                                            }
                                                        }));
                                                        setIsSaved(false);
                                                    } else {
                                                        // Normal Table Update
                                                        handleGradeChange(activeBankTarget.nis, activeBankTarget.col, desc);
                                                    }
                                                    setIsBankOpen(false);
                                                }
                                            }}
                                            className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-[#004AAD] hover:bg-blue-50 hover:shadow-md transition-all group relative"
                                        >
                                            <p className="text-slate-700 font-medium pr-8">{desc}</p>
                                            <div className="absolute top-4 right-4 text-[#004AAD] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs bg-blue-100 px-2 py-1 rounded">
                                                PILIH
                                            </div>
                                        </button>
                                    ))}
                                    {descriptionBank.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 italic">Belum ada data deskripsi tersimpan.</div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-slate-200">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tambah ke Bank</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newDescToBank}
                                        onChange={(e) => setNewDescToBank(e.target.value)}
                                        placeholder="Ketik deskripsi baru..."
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004AAD]"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newDescToBank.trim()) {
                                                setDescriptionBank([...descriptionBank, newDescToBank]);
                                                setNewDescToBank('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (newDescToBank.trim()) {
                                                setDescriptionBank([...descriptionBank, newDescToBank]);
                                                setNewDescToBank('');
                                            }
                                        }}
                                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Nilai;
