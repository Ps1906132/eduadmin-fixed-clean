import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, FolderInput, Save, TrendingUp, Award, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InputNilaiBimbelGuruProps {
    onBack: () => void;
    classes?: any[];
    enrollments?: any[];
}

const InputNilaiBimbelGuru: React.FC<InputNilaiBimbelGuruProps> = ({ onBack, classes = [], enrollments = [] }) => {
    const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 0);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [tipeLaporan, setTipeLaporan] = useState('tryout');
    const [saving, setSaving] = useState(false);
    const [existingProgress, setExistingProgress] = useState<any[]>([]);

    const [tryoutTitle, setTryoutTitle] = useState('');
    const [tryoutScore, setTryoutScore] = useState('');
    const [tryoutDate, setTryoutDate] = useState(new Date().toISOString().split('T')[0]);

    const [progressMonth, setProgressMonth] = useState(new Date().toISOString().substring(0, 7));
    const [progressNotes, setProgressNotes] = useState('');
    const [progressRecommendation, setProgressRecommendation] = useState('');

    const classEnrollments = enrollments.filter(e => e.groupId === selectedClassId);

    useEffect(() => {
        if (classEnrollments.length > 0 && !selectedStudentId) {
            setSelectedStudentId(classEnrollments[0].studentId);
        }
    }, [classEnrollments, selectedStudentId]);

    const loadProgress = useCallback(async () => {
        if (!selectedStudentId) return;
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`/api/bimbel_progress?student_id=eq.${selectedStudentId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setExistingProgress(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Failed to load bimbel progress:', e);
        }
    }, [selectedStudentId]);

    useEffect(() => {
        loadProgress();
    }, [loadProgress]);

    const handleSave = async () => {
        if (!selectedStudentId || !selectedClassId) {
            toast.error('Pilih siswa dan kelas terlebih dahulu');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('eduadmin_token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const enrollment = classEnrollments.find(e => e.studentId === selectedStudentId);
            if (!enrollment) {
                toast.error('Enrollment tidak ditemukan');
                return;
            }
            const enrollmentId = `${enrollment.groupId}-${enrollment.studentId}`;

            if (tipeLaporan === 'tryout') {
                // Validasi nilai
                const score = parseFloat(tryoutScore);
                if (isNaN(score) || score < 0 || score > 100) {
                    toast.error('Nilai harus antara 0-100');
                    setSaving(false);
                    return;
                }
                if (!tryoutTitle?.trim()) {
                    toast.error('Judul tryout wajib diisi');
                    setSaving(false);
                    return;
                }

                // Cek duplikat: tryout dengan judul sama untuk siswa yang sama
                const checkRes = await fetch(
                    `/api/bimbel_progress?student_id=eq.${selectedStudentId}&report_type=eq.tryout&title=eq.${encodeURIComponent(tryoutTitle.trim())}`,
                    { headers }
                );
                const duplicates = checkRes.ok ? await checkRes.json() : [];

                if (duplicates.length > 0) {
                    // Sudah ada → PATCH (update)
                    const patchRes = await fetch(`/api/bimbel_progress?id=eq.${duplicates[0].id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({ score, score_date: tryoutDate })
                    });
                    if (patchRes.ok) {
                        toast.success('Nilai tryout berhasil diperbarui!');
                        setTryoutTitle('');
                        setTryoutScore('');
                        setTryoutDate(new Date().toISOString().split('T')[0]);
                        loadProgress();
                    } else {
                        const err = await patchRes.text();
                        toast.error('Gagal memperbarui: ' + err);
                    }
                } else {
                    // Belum ada → POST (baru)
                    const body = {
                        id: `bprog-${Date.now()}`,
                        enrollment_id: enrollmentId,
                        tutoring_class_id: selectedClassId.toString(),
                        student_id: selectedStudentId,
                        report_type: 'tryout',
                        title: tryoutTitle.trim(),
                        score,
                        score_date: tryoutDate || null,
                        session_number: studentTryouts.length + 1
                    };
                    const res = await fetch('/api/bimbel_progress', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                    if (res.ok) {
                        toast.success('Nilai tryout berhasil disimpan!');
                        setTryoutTitle('');
                        setTryoutScore('');
                        setTryoutDate(new Date().toISOString().split('T')[0]);
                        loadProgress();
                    } else {
                        const err = await res.text();
                        toast.error('Gagal menyimpan: ' + err);
                    }
                }
            } else {
                // Validasi laporan bulanan
                if (!progressMonth) {
                    toast.error('Pilih bulan terlebih dahulu');
                    setSaving(false);
                    return;
                }
                if (!progressNotes?.trim()) {
                    toast.error('Catatan perkembangan wajib diisi');
                    setSaving(false);
                    return;
                }

                // Cek duplikat: laporan bulanan untuk bulan yang sama
                const checkRes = await fetch(
                    `/api/bimbel_progress?student_id=eq.${selectedStudentId}&report_type=eq.bulanan&month=eq.${progressMonth}`,
                    { headers }
                );
                const duplicates = checkRes.ok ? await checkRes.json() : [];

                if (duplicates.length > 0) {
                    // Sudah ada → PATCH
                    const patchRes = await fetch(`/api/bimbel_progress?id=eq.${duplicates[0].id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            notes: progressNotes.trim(),
                            recommendation: progressRecommendation?.trim() || null
                        })
                    });
                    if (patchRes.ok) {
                        toast.success('Laporan perkembangan berhasil diperbarui!');
                        setProgressNotes('');
                        setProgressRecommendation('');
                        loadProgress();
                    } else {
                        const err = await patchRes.text();
                        toast.error('Gagal memperbarui: ' + err);
                    }
                } else {
                    // Belum ada → POST
                    const body = {
                        id: `bprog-${Date.now()}`,
                        enrollment_id: enrollmentId,
                        tutoring_class_id: selectedClassId.toString(),
                        student_id: selectedStudentId,
                        report_type: 'bulanan',
                        month: progressMonth,
                        notes: progressNotes.trim(),
                        recommendation: progressRecommendation?.trim() || null,
                        session_number: studentMonthly.length + 1
                    };
                    const res = await fetch('/api/bimbel_progress', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                    });
                    if (res.ok) {
                        toast.success('Laporan perkembangan berhasil disimpan!');
                        setProgressNotes('');
                        setProgressRecommendation('');
                        loadProgress();
                    } else {
                        const err = await res.text();
                        toast.error('Gagal menyimpan: ' + err);
                    }
                }
            }
        } catch (e) {
            toast.error('Gagal menyimpan laporan');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const studentTryouts = existingProgress.filter(p => p.report_type === 'tryout');
    const studentMonthly = existingProgress.filter(p => p.report_type === 'bulanan');

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white sticky top-0 z-10">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <FolderInput className="text-indigo-500" size={20} />
                        Input Perkembangan
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                {/* Class Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Pilih Kelas Bimbel</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                    >
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                {/* Student Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Pilih Siswa Bimbel</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        {classEnrollments.map((e: any) => (
                            <option key={e.studentId} value={e.studentId}>{e.studentName}</option>
                        ))}
                    </select>
                </div>

                {/* Report Type Tabs */}
                <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
                    <button
                        onClick={() => setTipeLaporan('tryout')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipeLaporan === 'tryout' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ClipboardList size={16} /> Nilai Tryout
                    </button>
                    <button
                        onClick={() => setTipeLaporan('progress')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipeLaporan === 'progress' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <TrendingUp size={16} /> Progres Bulanan
                    </button>
                </div>

                {tipeLaporan === 'tryout' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Award className="text-yellow-500" size={20} />
                                Hasil Tryout / Latihan
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Judul Latihan / TO</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                                        placeholder="Contoh: Tryout Matematika Bab 3"
                                        value={tryoutTitle}
                                        onChange={(e) => setTryoutTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Nilai (0-100)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-center"
                                            placeholder="0"
                                            value={tryoutScore}
                                            onChange={(e) => setTryoutScore(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                                            value={tryoutDate}
                                            onChange={(e) => setTryoutDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Existing Tryout Records */}
                        {studentTryouts.length > 0 && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Riwayat Tryout</h4>
                                <div className="space-y-2">
                                    {studentTryouts.map((r: any) => (
                                        <div key={r.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-slate-700">{r.title}</p>
                                                <p className="text-xs text-slate-400">{r.score_date}</p>
                                            </div>
                                            <span className="font-bold text-lg text-indigo-600">{r.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-green-500" size={20} />
                                Evaluasi Bulanan
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Bulan</label>
                                    <input
                                        type="month"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                                        value={progressMonth}
                                        onChange={(e) => setProgressMonth(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Catatan Perkembangan</label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed"
                                        placeholder="Tuliskan perkembangan siswa selama bulan ini..."
                                        value={progressNotes}
                                        onChange={(e) => setProgressNotes(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Rekomendasi Belajar</label>
                                    <textarea
                                        rows={2}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed"
                                        placeholder="Saran materi yang perlu diulang..."
                                        value={progressRecommendation}
                                        onChange={(e) => setProgressRecommendation(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Existing Monthly Records */}
                        {studentMonthly.length > 0 && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-700 text-sm mb-3">Riwayat Evaluasi</h4>
                                <div className="space-y-2">
                                    {studentMonthly.map((r: any) => (
                                        <div key={r.id} className="bg-slate-50 p-3 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-sm text-slate-700">{r.month}</span>
                                            </div>
                                            {r.notes && <p className="text-xs text-slate-600">{r.notes}</p>}
                                            {r.recommendation && (
                                                <p className="text-xs text-indigo-500 mt-1">Rekomendasi: {r.recommendation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-700/20 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Menyimpan...' : 'Simpan Laporan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputNilaiBimbelGuru;
