import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FileText, CheckCircle, Database, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RaporSettingsViewProps {
    setActiveView: (view?: string) => void;
    showOnlyDeskripsi?: boolean;
    user?: any;
}

const RaporSettingsView: React.FC<RaporSettingsViewProps> = ({ setActiveView, showOnlyDeskripsi = false, user }) => {
    const [activeTab, setActiveTab] = useState<'deskripsi' | 'resmi' | 'yayasan'>('deskripsi');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('1');

    const [classList, setClassList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [descriptions, setDescriptions] = useState<any[]>([]);
    const [academicYearId, setAcademicYearId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newDesc, setNewDesc] = useState({
        predicate_A: '',
        predicate_B: '',
        predicate_C: '',
        predicate_D: '',
        description_text: '',
    });

    const [confirmModal, setConfirmModal] = useState({
        show: false,
        message: '',
        onConfirm: () => {}
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resClasses, resSubjects, resSchedules, resAY] = await Promise.all([
                    fetch('/api/classes', { headers }),
                    fetch('/api/subjects', { headers }),
                    fetch(`/api/schedules?teacher_id=eq.${user?.id || ''}`, { headers }),
                    fetch('/api/academic_years?is_active=eq.1', { headers }),
                ]);

                const allClasses: any[] = resClasses.ok ? (await resClasses.json()) : [];
                const allSubjects: any[] = resSubjects.ok ? (await resSubjects.json()) : [];
                const schedules: any[] = resSchedules.ok ? (await resSchedules.json()) : [];

                let ayId = '';
                const ayData = resAY.ok ? (await resAY.json()) : [];
                if (Array.isArray(ayData) && ayData.length > 0) ayId = ayData[0].id;
                if (!ayId) {
                    const ayFallback = await fetch('/api/academic_years?order=start_date.desc&limit=1', { headers });
                    if (ayFallback.ok) {
                        const ayData2 = await ayFallback.json();
                        if (Array.isArray(ayData2) && ayData2.length > 0) ayId = ayData2[0].id;
                    }
                }
                if (ayId) setAcademicYearId(ayId);

                const scheduleClassIds = new Set(schedules.map((s: any) => s.class_id));
                const waliClassIds = new Set(allClasses.filter((c: any) => c.teacher_id === user?.id).map((c: any) => c.id));
                const teacherClassIds = new Set([...scheduleClassIds, ...waliClassIds]);
                const filteredClasses = allClasses.filter((c: any) => teacherClassIds.has(c.id));
                setClassList(filteredClasses);

                const scheduleSubjectIds = new Set(schedules.map((s: any) => s.subject_id));
                const filteredSubjects = allSubjects.filter((s: any) => scheduleSubjectIds.has(s.id));
                setSubjectList(filteredSubjects);

                if (filteredClasses.length > 0 && !selectedClass) {
                    const defaultClass = filteredClasses.find((c: any) => c.teacher_id === user?.id) || filteredClasses[0];
                    setSelectedClass(defaultClass.id);
                }
                if (filteredSubjects.length > 0 && !selectedSubject) {
                    setSelectedSubject(filteredSubjects[0].id);
                }
            } catch (e) {
                console.error('Failed to load data:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id]);

    useEffect(() => {
        const loadDescriptions = async () => {
            if (!user?.id || !academicYearId) return;
            try {
                const token = localStorage.getItem('eduadmin_token');
                const headers = { 'Authorization': `Bearer ${token}` };
                const res = await fetch(
                    `/api/rapor_descriptions?teacher_id=eq.${user.id}&academic_year_id=eq.${academicYearId}&semester=eq.${selectedSemester}`,
                    { headers }
                );
                if (res.ok) {
                    const data = await res.json();
                    setDescriptions(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error('Failed to load descriptions:', e);
            }
        };
        loadDescriptions();
    }, [user?.id, academicYearId, selectedSemester]);

    const handleSaveDescription = async () => {
        if (!selectedSubject || !selectedClass || !academicYearId) {
            toast.error('Pilih kelas, mapel, dan pastikan tahun ajaran aktif.');
            return;
        }
        if (!newDesc.predicate_A && !newDesc.predicate_B && !newDesc.predicate_C && !newDesc.predicate_D && !newDesc.description_text) {
            toast.error('Minimal isi salah satu deskripsi predikat.');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

            const existing = descriptions.find(
                (d: any) => d.subject_id === selectedSubject && d.class_id === selectedClass
            );

            const body = {
                subject_id: selectedSubject,
                class_id: selectedClass,
                teacher_id: user?.id,
                academic_year_id: academicYearId,
                semester: parseInt(selectedSemester),
                description_text: newDesc.description_text || null,
                predicate_A: newDesc.predicate_A || null,
                predicate_B: newDesc.predicate_B || null,
                predicate_C: newDesc.predicate_C || null,
                predicate_D: newDesc.predicate_D || null,
            };

            if (existing) {
                await fetch(`/api/rapor_descriptions?id=eq.${existing.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(body)
                });
            } else {
                await fetch('/api/rapor_descriptions', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        ...body,
                        id: `rd-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
                    })
                });
            }

            const res = await fetch(
                `/api/rapor_descriptions?teacher_id=eq.${user?.id}&academic_year_id=eq.${academicYearId}&semester=eq.${selectedSemester}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setDescriptions(Array.isArray(data) ? data : []);
            }

            toast.success('Deskripsi berhasil disimpan!');
            setNewDesc({ predicate_A: '', predicate_B: '', predicate_C: '', predicate_D: '', description_text: '' });
        } catch (e) {
            toast.error('Gagal menyimpan deskripsi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDescription = (id: string) => {
        setConfirmModal({
            show: true,
            message: 'Apakah anda yakin ingin menghapus deskripsi ini?',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('eduadmin_token');
                    await fetch(`/api/rapor_descriptions?id=eq.${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setDescriptions(prev => prev.filter((d: any) => d.id !== id));
                    toast.success('Deskripsi berhasil dihapus');
                } catch (e) {
                    toast.error('Gagal menghapus deskripsi.');
                }
                setConfirmModal({ show: false, message: '', onConfirm: () => {} });
            }
        });
    };

    const handleEditDescription = (desc: any) => {
        setSelectedSubject(desc.subject_id);
        setSelectedClass(desc.class_id);
        setNewDesc({
            predicate_A: desc.predicate_A || '',
            predicate_B: desc.predicate_B || '',
            predicate_C: desc.predicate_C || '',
            predicate_D: desc.predicate_D || '',
            description_text: desc.description_text || '',
        });
    };

    const filteredDescriptions = descriptions.filter((d: any) => {
        if (selectedClass && d.class_id !== selectedClass) return false;
        if (selectedSubject && d.subject_id !== selectedSubject) return false;
        return true;
    });

    const selectedClassName = classList.find((c: any) => c.id === selectedClass)?.name || '';
    const selectedSubjectName = subjectList.find((s: any) => s.id === selectedSubject)?.name || '';

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in flex flex-col overflow-hidden">
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <button onClick={() => setActiveView('home')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-[#1E1B4B]">Master Deskripsi</h2>
                    <p className="text-slate-500 text-sm">Kelola deskripsi capaian pembelajaran per mapel per kelas.</p>
                </div>
            </div>

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
                            <button onClick={() => setConfirmModal({ show: false, message: '', onConfirm: () => {} })} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                Batal
                            </button>
                            <button onClick={confirmModal.onConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                        <Database className="text-blue-600 mt-1" size={20} />
                        <div>
                            <h3 className="font-bold text-blue-800">Master Data Deskripsi</h3>
                            <p className="text-sm text-blue-600/80">Input deskripsi capaian pembelajaran (CP) per mapel per kelas untuk otomatisasi pengisian rapor.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kelas</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                                {classList.length === 0 && <option value="">Tidak ada kelas</option>}
                                {classList.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
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
                                {subjectList.length === 0 && <option value="">Tidak ada mapel</option>}
                                {subjectList.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                                <option value="1">1 (Ganjil)</option>
                                <option value="2">2 (Genap)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            {selectedClassName && selectedSubjectName && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100">{selectedClassName}</span>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold">{selectedSubjectName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Database size={18} /> Data Tersimpan ({filteredDescriptions.length})</h4>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                                        <tr>
                                            <th className="p-3">Kelas</th>
                                            <th className="p-3">Mapel</th>
                                            <th className="p-3">Predikat</th>
                                            <th className="p-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredDescriptions.map((desc: any) => {
                                            const cls = classList.find((c: any) => c.id === desc.class_id);
                                            const subj = subjectList.find((s: any) => s.id === desc.subject_id);
                                            return (
                                                <tr key={desc.id} className="group hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-700">{cls?.name || desc.class_id}</td>
                                                    <td className="p-3 font-medium text-slate-700">{subj?.name || desc.subject_id}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {desc.predicate_A && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">A</span>}
                                                            {desc.predicate_B && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">B</span>}
                                                            {desc.predicate_C && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">C</span>}
                                                            {desc.predicate_D && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700">D</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => handleEditDescription(desc)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteDescription(desc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Hapus">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredDescriptions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-slate-400 italic">Belum ada data deskripsi</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18} /> Input Deskripsi Baru</h4>

                            <div className="space-y-4">
                                <div className="bg-blue-50 p-2 rounded-lg text-xs text-blue-700">
                                    Mapel: <strong>{selectedSubjectName || 'Belum dipilih'}</strong> | Kelas: <strong>{selectedClassName || 'Belum dipilih'}</strong>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Deskripsi Umum</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Siswa mampu memahami..."
                                        value={newDesc.description_text}
                                        onChange={(e) => setNewDesc({ ...newDesc, description_text: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-emerald-600 mb-1">Predikat A (Sangat Baik)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Deskripsi untuk predikat A..."
                                            value={newDesc.predicate_A}
                                            onChange={(e) => setNewDesc({ ...newDesc, predicate_A: e.target.value })}
                                            className="w-full p-2 border border-emerald-200 rounded-lg outline-none focus:border-emerald-500 bg-emerald-50/30 text-sm"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-blue-600 mb-1">Predikat B (Baik)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Deskripsi untuk predikat B..."
                                            value={newDesc.predicate_B}
                                            onChange={(e) => setNewDesc({ ...newDesc, predicate_B: e.target.value })}
                                            className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 bg-blue-50/30 text-sm"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-amber-600 mb-1">Predikat C (Cukup)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Deskripsi untuk predikat C..."
                                            value={newDesc.predicate_C}
                                            onChange={(e) => setNewDesc({ ...newDesc, predicate_C: e.target.value })}
                                            className="w-full p-2 border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-amber-50/30 text-sm"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-rose-600 mb-1">Predikat D (Perlu Bimbingan)</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Deskripsi untuk predikat D..."
                                            value={newDesc.predicate_D}
                                            onChange={(e) => setNewDesc({ ...newDesc, predicate_D: e.target.value })}
                                            className="w-full p-2 border border-rose-200 rounded-lg outline-none focus:border-rose-500 bg-rose-50/30 text-sm"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveDescription}
                                        disabled={saving}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Menyimpan...' : 'Simpan Deskripsi'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RaporSettingsView;
