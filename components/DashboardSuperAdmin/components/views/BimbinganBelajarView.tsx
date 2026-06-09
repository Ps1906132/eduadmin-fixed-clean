import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Book, UserCog, FileText, Plus, SquarePen, 
    Trash2, UserPlus, Video, X, ChevronRight 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
    tutoringSubjectsGlobal, updateTutoringSubjectsGlobal, 
    tutoringTeachersGlobal, updateTutoringTeachersGlobal,
    tutoringEnrollmentsGlobal, updateTutoringEnrollmentsGlobal
} from '../../../../data/sharedData';
import { hashPassword } from '../../../../utils/auth';
import ManageTutoringStudentsModal from '../modals/ManageTutoringStudentsModal';
import { useTutoring } from '../../hooks/useTutoring';

interface BimbinganBelajarViewProps {
    students: any[];
    classes: any[];
}

const BimbinganBelajarView: React.FC<BimbinganBelajarViewProps> = ({
    students,
    classes
}) => {
    const [tutoringActiveTab, setTutoringActiveTab] = useState('dashboard'); // dashboard, mapel, guru, materi
    const [tutoringSubjects, setTutoringSubjects] = useState<any[]>(tutoringSubjectsGlobal);
    const [tutoringTeachers, setTutoringTeachers] = useState<any[]>(tutoringTeachersGlobal);
    // Sync with Teacher's view via useTutoring hook
    const { 
        tutoringClasses, 
        loading: tutoringLoading, 
        setTutoringClasses,
        enrollments: tutoringEnrollments,
        setEnrollments: setTutoringEnrollments
    } = useTutoring();
    
    // Derived state for materials from tutoringClasses sessions
    const tutoringMaterials = tutoringClasses.flatMap(cls => 
        (cls.sessions || []).map((session, idx) => ({
            id: session.id || `${cls.id}-${idx}`,
            teacherId: cls.id,
            teacherName: cls.teacher,
            subjectName: cls.title,
            meeting: idx + 1,
            title: session.title,
            videoUrl: session.youtubeId,
            fileUrl: session.driveLink,
            date: session.date
        }))
    );

    // Fetch from D1 on mount (with fallback to localStorage/global memory)
    const fetchTutoringData = async () => {
        const token = localStorage.getItem('eduadmin_token');
        if (!token) return;
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // 1. Fetch Subjects
            const subRes = await fetch('/api/tutoring_subjects', { headers });
            if (subRes.ok) {
                const subData = await subRes.json();
                if (subData && Array.isArray(subData)) {
                    const mapped = subData.map(s => ({
                        id: Number(s.id),
                        name: s.name,
                        classes: typeof s.classes === 'string' ? JSON.parse(s.classes) : (s.classes || []),
                        meetings: Number(s.meetings),
                        status: s.status
                    }));
                    setTutoringSubjects(mapped);
                    updateTutoringSubjectsGlobal(mapped);
                }
            }

            // 2. Fetch Teachers (Tutoring groups)
            const teachRes = await fetch('/api/tutoring_teachers', { headers });
            if (teachRes.ok) {
                const teachData = await teachRes.json();
                if (teachData && Array.isArray(teachData)) {
                    const mapped = teachData.map(t => ({
                        id: Number(t.id),
                        name: t.name,
                        source: t.source,
                        subjectId: t.subject_id,
                        subjectName: t.subject_name,
                        classId: t.class_id,
                        scheduleDay: t.schedule_day,
                        scheduleStart: t.schedule_start,
                        scheduleEnd: t.schedule_end,
                        username: t.username,
                        password: t.password,
                        studentsCount: Number(t.students_count || 0),
                        status: t.status
                    }));
                    setTutoringTeachers(mapped);
                    updateTutoringTeachersGlobal(mapped);
                }
            }

            // 3. Fetch Enrollments
            const enrollRes = await fetch('/api/tutoring_enrollments', { headers });
            if (enrollRes.ok) {
                const enrollData = await enrollRes.json();
                if (enrollData && Array.isArray(enrollData)) {
                    const mapped = enrollData.map(e => ({
                        groupId: Number(e.group_id),
                        studentId: Number(e.student_id)
                    }));
                    setTutoringEnrollments(mapped);
                    updateTutoringEnrollmentsGlobal(mapped);
                }
            }
        } catch (error) {
            console.error('Gagal mengambil data bimbingan dari database:', error);
        }
    };

    useEffect(() => {
        fetchTutoringData();
    }, []);

    const [showAddTutoringSubject, setShowAddTutoringSubject] = useState(false);
    const [showAddTutoringTeacher, setShowAddTutoringTeacher] = useState(false);
    const [newTutoringSubject, setNewTutoringSubject] = useState({ name: '', classes: [] as string[], meetings: 10, status: 'Aktif' });
    const [newTutoringTeacher, setNewTutoringTeacher] = useState({ name: '', source: 'internal', subjectId: '', classId: '', scheduleDay: 'Senin', scheduleStart: '14:00', scheduleEnd: '15:00', username: '', password: '' });
    const [editingTutoringTeacherId, setEditingTutoringTeacherId] = useState<number | null>(null);

    const handleAddTutoringSubject = async () => {
        const newSubject = { ...newTutoringSubject, id: Date.now(), classes: newTutoringSubject.classes || [] };
        
        // Optimistic UI Update
        const updatedList = [...tutoringSubjects, newSubject];
        setTutoringSubjects(updatedList);
        updateTutoringSubjectsGlobal(updatedList);
        setShowAddTutoringSubject(false);
        setNewTutoringSubject({ name: '', classes: [], meetings: 10, status: 'Aktif' });
        toast.success("Mata pelajaran bimbel ditambahkan");

        // Save to D1
        try {
            const token = localStorage.getItem('eduadmin_token');
            await fetch('/api/tutoring_subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id: newSubject.id.toString(),
                    name: newSubject.name,
                    classes: JSON.stringify(newSubject.classes),
                    meetings: newSubject.meetings,
                    status: newSubject.status
                })
            });
        } catch (e) {
            console.error('Gagal menyimpan mata pelajaran bimbel ke database:', e);
        }
    };

    const handleDeleteTutoringSubject = async (id: number) => {
        if (confirm("Hapus mata pelajaran bimbel ini?")) {
            const updatedList = tutoringSubjects.filter(s => s.id !== id);
            setTutoringSubjects(updatedList);
            updateTutoringSubjectsGlobal(updatedList);
            toast.success("Mata pelajaran bimbel dihapus");

            try {
                const token = localStorage.getItem('eduadmin_token');
                await fetch(`/api/tutoring_subjects?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleAddTutoringTeacher = async () => {
        const subject = tutoringSubjects.find(s => s.id.toString() === newTutoringTeacher.subjectId);
        const token = localStorage.getItem('eduadmin_token');

        if (editingTutoringTeacherId) {
            let updatedTeacher = { ...newTutoringTeacher };
            if (newTutoringTeacher.password && !newTutoringTeacher.password.startsWith('$2')) {
                updatedTeacher.password = await hashPassword(newTutoringTeacher.password);
            }

            const updatedList = tutoringTeachers.map(t => t.id === editingTutoringTeacherId ? {
                ...t,
                ...updatedTeacher,
                subjectName: subject?.name || t.subjectName
            } : t);

            setTutoringTeachers(updatedList);
            updateTutoringTeachersGlobal(updatedList);

            // Update associated class
            setTutoringClasses(prev => prev.map(c => c.id === editingTutoringTeacherId ? {
                ...c,
                title: `${subject?.name || 'Bimbel'} - ${updatedTeacher.classId}`,
                teacher: updatedTeacher.name,
                schedule: `${updatedTeacher.scheduleDay}, ${updatedTeacher.scheduleStart}-${updatedTeacher.scheduleEnd}`
            } : c));

            toast.success("Data guru diperbarui");

            try {
                await fetch(`/api/tutoring_teachers?id=eq.${editingTutoringTeacherId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        name: updatedTeacher.name,
                        source: updatedTeacher.source,
                        subject_id: updatedTeacher.subjectId,
                        subject_name: subject?.name || '',
                        class_id: updatedTeacher.classId,
                        schedule_day: updatedTeacher.scheduleDay,
                        schedule_start: updatedTeacher.scheduleStart,
                        schedule_end: updatedTeacher.scheduleEnd,
                        username: updatedTeacher.username,
                        password: updatedTeacher.password
                    })
                });
            } catch (e) {
                console.error(e);
            }
        } else {
            const id = Date.now();
            const username = newTutoringTeacher.username || newTutoringTeacher.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
            const rawPassword = newTutoringTeacher.password || Math.random().toString(36).substring(2, 10);
            const hashedPassword = await hashPassword(rawPassword);

            const newTeacher = {
                ...newTutoringTeacher,
                id,
                subjectName: subject?.name || '-',
                studentsCount: 0,
                status: 'Aktif',
                username,
                password: hashedPassword
            };

            const updatedList = [...tutoringTeachers, newTeacher];
            setTutoringTeachers(updatedList);
            updateTutoringTeachersGlobal(updatedList);
            
            // Create associated class for teacher's dashboard
            setTutoringClasses(prev => [...prev, {
                id,
                title: `${subject?.name || 'Bimbel'} - ${newTutoringTeacher.classId}`,
                teacher: newTutoringTeacher.name,
                schedule: `${newTutoringTeacher.scheduleDay}, ${newTutoringTeacher.scheduleStart}-${newTutoringTeacher.scheduleEnd}`,
                room: 'Lab/Kelas',
                status: 'Aktif',
                description: `Kelas bimbingan belajar ${subject?.name || ''}`,
                sessions: []
            }]);

            toast.success(`Guru berhasil ditambahkan. Password: ${rawPassword}`, { duration: 10000 });

            try {
                await fetch('/api/tutoring_teachers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        id: id.toString(),
                        name: newTeacher.name,
                        source: newTeacher.source,
                        subject_id: newTeacher.subjectId,
                        subject_name: newTeacher.subjectName,
                        class_id: newTeacher.classId,
                        schedule_day: newTeacher.scheduleDay,
                        schedule_start: newTeacher.scheduleStart,
                        schedule_end: newTeacher.scheduleEnd,
                        username: newTeacher.username,
                        password: newTeacher.password,
                        students_count: 0,
                        status: newTeacher.status
                    })
                });
            } catch (e) {
                console.error(e);
            }
        }
        setShowAddTutoringTeacher(false);
        setNewTutoringTeacher({ name: '', source: 'internal', subjectId: '', classId: '', scheduleDay: 'Senin', scheduleStart: '14:00', scheduleEnd: '15:00', username: '', password: '' });
        setEditingTutoringTeacherId(null);
    };

    const handleEditTutoringTeacher = (t: any) => {
        setEditingTutoringTeacherId(t.id);
        setNewTutoringTeacher({
            name: t.name,
            source: t.source || 'internal',
            subjectId: t.subjectId ? t.subjectId.toString() : '',
            classId: t.classId,
            scheduleDay: t.scheduleDay,
            scheduleStart: t.scheduleStart,
            scheduleEnd: t.scheduleEnd,
            username: t.username,
            password: t.password
        });
        setShowAddTutoringTeacher(true);
    };

    const handleDeleteTutoringTeacher = async (id: number) => {
        if (confirm("Hapus data guru bimbel ini?")) {
            const updatedList = tutoringTeachers.filter(t => t.id !== id);
            setTutoringTeachers(updatedList);
            updateTutoringTeachersGlobal(updatedList);
            toast.success("Guru dihapus");

            try {
                const token = localStorage.getItem('eduadmin_token');
                await fetch(`/api/tutoring_teachers?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const [showManageTutoringStudentsModal, setShowManageTutoringStudentsModal] = useState(false);
    const [selectedTutoringGroup, setSelectedTutoringGroup] = useState<any>(null);

    const handleManageTutoringStudents = (group: any) => {
        setSelectedTutoringGroup(group);
        setShowManageTutoringStudentsModal(true);
    };

    const handleAddStudentToTutoring = async (studentId: number) => {
        if (!selectedTutoringGroup) return;
        if (tutoringEnrollments.some(e => e.groupId === selectedTutoringGroup.id && e.studentId === studentId)) return;

        const newEnrollment = { groupId: selectedTutoringGroup.id, studentId };
        const updatedList = [...tutoringEnrollments, newEnrollment];
        setTutoringEnrollments(updatedList);
        updateTutoringEnrollmentsGlobal(updatedList);
        toast.success("Siswa berhasil ditambahkan ke bimbingan!");

        try {
            const token = localStorage.getItem('eduadmin_token');
            const id = `${selectedTutoringGroup.id}-${studentId}`;
            await fetch('/api/tutoring_enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    id,
                    group_id: selectedTutoringGroup.id.toString(),
                    student_id: studentId.toString()
                })
            });

            // Update studentsCount on group in UI
            const updatedTeachers = tutoringTeachers.map(t =>
                t.id === selectedTutoringGroup.id ? { ...t, studentsCount: (t.studentsCount || 0) + 1 } : t
            );
            setTutoringTeachers(updatedTeachers);
            updateTutoringTeachersGlobal(updatedTeachers);

            await fetch(`/api/tutoring_teachers?id=eq.${selectedTutoringGroup.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    students_count: ((selectedTutoringGroup.studentsCount || 0) + 1)
                })
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveStudentFromTutoring = async (studentId: number) => {
        if (!selectedTutoringGroup) return;
        const updatedList = tutoringEnrollments.filter(e => !(e.groupId === selectedTutoringGroup.id && e.studentId === studentId));
        setTutoringEnrollments(updatedList);
        updateTutoringEnrollmentsGlobal(updatedList);
        toast.success("Siswa dihapus dari bimbingan.");

        try {
            const token = localStorage.getItem('eduadmin_token');
            const id = `${selectedTutoringGroup.id}-${studentId}`;
            await fetch(`/api/tutoring_enrollments?id=eq.${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Update studentsCount on group in UI
            const updatedTeachers = tutoringTeachers.map(t =>
                t.id === selectedTutoringGroup.id ? { ...t, studentsCount: Math.max(0, (t.studentsCount || 0) - 1) } : t
            );
            setTutoringTeachers(updatedTeachers);
            updateTutoringTeachersGlobal(updatedTeachers);

            await fetch(`/api/tutoring_teachers?id=eq.${selectedTutoringGroup.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    students_count: Math.max(0, (selectedTutoringGroup.studentsCount || 0) - 1)
                })
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Calculate activeGroupEnrollments
    const activeGroupEnrollments = (() => {
        if (!selectedTutoringGroup || !selectedTutoringGroup.id) return [];
        return (tutoringEnrollments || [])
            .filter(e => e && e.groupId === selectedTutoringGroup.id)
            .map(e => e.studentId);
    })();

    return (
        <div className="bg-[#F4F7FE] p-6 h-full overflow-y-auto">
            <div className="animate-in fade-in space-y-6">
                {/* Header & Tabs */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                                <Book size={24} className="text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Bimbingan Belajar</h2>
                                <p className="text-slate-500 text-sm font-medium">Manajemen kelas tambahan dan materi bimbel.</p>
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
                                { id: 'mapel', label: 'Mata Pelajaran', icon: <Book size={16} /> },
                                { id: 'guru', label: 'Guru Bimbel', icon: <UserCog size={16} /> },
                                { id: 'materi', label: 'Materi Kelas', icon: <FileText size={16} /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setTutoringActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tutoringActiveTab === tab.id
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 1. DASHBOARD */}
                    {tutoringActiveTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Mata Pelajaran</p>
                                <h3 className="text-3xl font-bold text-slate-800">{tutoringSubjects.length}</h3>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Guru Bimbel</p>
                                <h3 className="text-3xl font-bold text-slate-800">{tutoringTeachers.length}</h3>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Siswa</p>
                                <h3 className="text-3xl font-bold text-slate-800">{tutoringEnrollments.length}</h3>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Materi Aktif</p>
                                <h3 className="text-3xl font-bold text-slate-800">{tutoringMaterials.length}</h3>
                            </div>
                        </div>
                    )}

                    {/* 2. MATA PELAJARAN */}
                    {tutoringActiveTab === 'mapel' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">Daftar Mata Pelajaran Bimbel</h3>
                                <button onClick={() => setShowAddTutoringSubject(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                                    <Plus size={18} /> Tambah Mapel
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 border-b">Nama Mapel</th>
                                            <th className="p-4 border-b">Untuk Kelas</th>
                                            <th className="p-4 border-b text-center">Jml Pertemuan</th>
                                            <th className="p-4 border-b text-center">Status</th>
                                            <th className="p-4 border-b text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {tutoringSubjects.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-700">{s.name}</td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {s.classes.map((c: string) => <span key={c} className="px-2 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">{c}</span>)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-700">{s.meetings}x</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><SquarePen size={18} /></button>
                                                        <button onClick={() => handleDeleteTutoringSubject(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. GURU BIMBEL */}
                    {tutoringActiveTab === 'guru' && (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">Data Guru Pengajar</h3>
                                <button onClick={() => setShowAddTutoringTeacher(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                                    <Plus size={18} /> Tambah Guru
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 border-b">Nama Lengkap</th>
                                            <th className="p-4 border-b">Kelas Bimbingan</th>
                                            <th className="p-4 border-b">Username</th>
                                            <th className="p-4 border-b">Password</th>
                                            <th className="p-4 border-b text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {tutoringTeachers.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-bold text-slate-700">{t.name}</td>
                                                <td className="p-4 text-slate-600">
                                                    <div className="font-bold">{t.subjectName}</div>
                                                    <div className="text-xs text-slate-400">Kelas {t.classId}</div>
                                                    <div className="text-xs text-slate-500 mt-1">{t.scheduleDay}, {t.scheduleStart}-{t.scheduleEnd}</div>
                                                </td>
                                                <td className="p-4 font-mono text-slate-600 bg-slate-50/50">{t.username || '-'}</td>
                                                <td className="p-4 font-mono text-slate-600 bg-slate-50/50">
                                                    {t.password && (t.password.startsWith('$2') || t.password.length > 20) ? '••••••••' : (t.password || '-')}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-3">
                                                        <button onClick={() => handleManageTutoringStudents(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Kelola Siswa"><UserPlus size={18} /></button>
                                                        <button onClick={() => handleEditTutoringTeacher(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><SquarePen size={18} /></button>
                                                        <button onClick={() => handleDeleteTutoringTeacher(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 4. MATERI KELAS */}
                    {tutoringActiveTab === 'materi' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-slate-800">Materi Pembelajaran Aktif</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 border-b">Guru & Mapel</th>
                                                <th className="p-4 border-b">Detail Materi</th>
                                                <th className="p-4 border-b">Konten</th>
                                                <th className="p-4 border-b text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm">
                                            {tutoringMaterials.map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-700">{tutoringTeachers.find((t: any) => t.id === m.teacherId)?.name || m.teacherName || '-'}</div>
                                                        <div className="text-xs text-slate-500">{m.subjectName}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-700">Pertemuan {m.meeting}</div>
                                                        <div className="text-xs text-slate-500">{m.title}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-600">
                                                        <div className="flex gap-2">
                                                            {m.videoUrl && <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs border border-red-100 flex items-center gap-1"><Video size={12} /> Video</span>}
                                                            {m.fileUrl && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs border border-blue-100 flex items-center gap-1 flex-shrink-0"><FileText size={12} /> File</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">Lihat Detail</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tambah Mapel */}
            {showAddTutoringSubject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Tambah Mapel Bimbel</h3>
                            <button onClick={() => setShowAddTutoringSubject(false)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                                <input 
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="Contoh: Matematika Olimpiade"
                                    value={newTutoringSubject.name}
                                    onChange={(e) => setNewTutoringSubject({ ...newTutoringSubject, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Kelas Sasaran (Klik untuk pilih)</label>
                                <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                                    {classes.map(c => {
                                        const isSelected = newTutoringSubject.classes.includes(c.nama);
                                        return (
                                            <button 
                                                key={c.id}
                                                onClick={() => {
                                                    const current = [...newTutoringSubject.classes];
                                                    if (isSelected) {
                                                        setNewTutoringSubject({ ...newTutoringSubject, classes: current.filter(x => x !== c.nama) });
                                                    } else {
                                                        setNewTutoringSubject({ ...newTutoringSubject, classes: [...current, c.nama] });
                                                    }
                                                }}
                                                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                {c.nama}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Jumlah Pertemuan</label>
                                <input 
                                    type="number"
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                    value={newTutoringSubject.meetings}
                                    onChange={(e) => setNewTutoringSubject({ ...newTutoringSubject, meetings: parseInt(e.target.value) || 10 })}
                                />
                            </div>
                            <button onClick={handleAddTutoringSubject} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-colors">Simpan Mapel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah Guru */}
            {showAddTutoringTeacher && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{editingTutoringTeacherId ? 'Edit Guru Bimbel' : 'Tambah Guru Bimbel'}</h3>
                            <button onClick={() => { setShowAddTutoringTeacher(false); setEditingTutoringTeacherId(null); }} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap Guru</label>
                                <input 
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                    placeholder="Nama Lengkap"
                                    value={newTutoringTeacher.name}
                                    onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Pilih Mata Pelajaran Bimbel</label>
                                <select 
                                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                                    value={newTutoringTeacher.subjectId}
                                    onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, subjectId: e.target.value })}
                                >
                                    <option value="">-- Pilih Mapel --</option>
                                    {tutoringSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Kelas Asuhan</label>
                                    <select 
                                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                                        value={newTutoringTeacher.classId}
                                        onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, classId: e.target.value })}
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classes.map(c => <option key={c.id} value={c.nama}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Hari Jadwal</label>
                                    <select 
                                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                                        value={newTutoringTeacher.scheduleDay}
                                        onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, scheduleDay: e.target.value })}
                                    >
                                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Jam Mulai</label>
                                    <input 
                                        type="time"
                                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                                        value={newTutoringTeacher.scheduleStart}
                                        onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, scheduleStart: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Jam Selesai</label>
                                    <input 
                                        type="time"
                                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                                        value={newTutoringTeacher.scheduleEnd}
                                        onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, scheduleEnd: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 pt-4 space-y-4">
                                <h4 className="font-bold text-slate-800 text-sm">Akun Akses Guru</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Username (Opsional)</label>
                                        <input 
                                            className="w-full p-2.5 border border-slate-200 rounded-xl"
                                            placeholder="Otomatis jika kosong"
                                            value={newTutoringTeacher.username}
                                            onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, username: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-1">Password (Opsional)</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
                                            placeholder={newTutoringTeacher.password && newTutoringTeacher.password.startsWith('$2') ? "Sudah Terenkripsi (Ketik untuk ganti)" : "Otomatis jika kosong"}
                                            value={newTutoringTeacher.password && newTutoringTeacher.password.startsWith('$2') ? '' : newTutoringTeacher.password}
                                            onChange={(e) => setNewTutoringTeacher({ ...newTutoringTeacher, password: e.target.value })}
                                        />
                                    </div>

                                </div>
                            </div>
                            <button onClick={handleAddTutoringTeacher} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg transition-colors">Simpan Data Guru</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Manage Students */}
            {showManageTutoringStudentsModal && selectedTutoringGroup && (
                <ManageTutoringStudentsModal
                    isOpen={showManageTutoringStudentsModal}
                    onClose={() => setShowManageTutoringStudentsModal(false)}
                    tutoringGroup={selectedTutoringGroup}
                    allStudents={students || []}
                    enrolledStudents={activeGroupEnrollments}
                    onAddStudent={handleAddStudentToTutoring}
                    onRemoveStudent={handleRemoveStudentFromTutoring}
                />
            )}
        </div>
    );
};

export default BimbinganBelajarView;
