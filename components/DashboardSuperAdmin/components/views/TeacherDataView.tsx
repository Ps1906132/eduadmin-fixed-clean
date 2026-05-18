import React from 'react';
import {
    ChevronRight, Download, UploadCloud, UserPlus, Save, Edit, Trash2, Printer
} from 'lucide-react';

interface TeacherDataViewProps {
    teachers: any[];
    setTeachers: (teachers: any[]) => void;
    positions: any[];
    setActiveView: (view: string) => void;
    handleDownloadTemplate: () => void;
    handleUploadClick: () => void;
    handleAddTeacher: () => void;
    handleSaveData: () => void;
    handleEditItem: (item: any, type: string) => void;
    handleDeleteTeacher: (id: number) => void;
    classes?: any[];
}

const TeacherDataView: React.FC<TeacherDataViewProps> = ({
    teachers,
    setTeachers,
    positions,
    setActiveView,
    handleDownloadTemplate,
    handleUploadClick,
    handleAddTeacher,
    handleSaveData,
    handleEditItem,
    handleDeleteTeacher,
    classes
}) => {
    const classOptions = classes && classes.length > 0
        ? classes.map((c: any) => c.nama)
        : ['1A', '1B', '2A', '2B', '3A', '3B'];

    const handlePrintSingleCard = (guru: any) => {
        const savedSettings = localStorage.getItem('school_settings_v10');
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
        const schoolName = parsedSettings?.name || "EduAdmin";
        const logo = parsedSettings?.logo || "";

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Kartu Login - ${guru.nama}</title>
                <style>
                    body {
                        font-family: 'Inter', system-ui, -apple-system, sans-serif;
                        background: #f8fafc;
                        margin: 0;
                        padding: 40px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    .card {
                        width: 380px;
                        background: #ffffff;
                        border-radius: 24px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                        overflow: hidden;
                        position: relative;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                        color: #ffffff;
                        padding: 24px;
                        text-align: center;
                        position: relative;
                    }
                    .header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: #f59e0b;
                    }
                    .logo-placeholder {
                        width: 50px;
                        height: 50px;
                        background: #ffffff;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 10px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .logo-img {
                        max-width: 32px;
                        max-height: 32px;
                        object-fit: contain;
                    }
                    .logo-txt {
                        font-weight: 800;
                        color: #1e3a8a;
                        font-size: 14px;
                    }
                    .school-name {
                        font-size: 14px;
                        font-weight: 800;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .card-title {
                        font-size: 10px;
                        font-weight: 600;
                        color: #93c5fd;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        margin: 4px 0 0 0;
                    }
                    .content {
                        padding: 24px;
                    }
                    .info-group {
                        margin-bottom: 16px;
                    }
                    .info-label {
                        font-size: 9px;
                        text-transform: uppercase;
                        color: #64748b;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        margin-bottom: 4px;
                    }
                    .info-val {
                        font-size: 14px;
                        font-weight: 600;
                        color: #0f172a;
                    }
                    .credentials-box {
                        background: #f8fafc;
                        border: 1px dashed #cbd5e1;
                        border-radius: 16px;
                        padding: 16px;
                        margin-top: 20px;
                    }
                    .credential-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .credential-row:last-child {
                        margin-bottom: 0;
                    }
                    .cred-label {
                        font-size: 11px;
                        font-weight: 700;
                        color: #475569;
                    }
                    .cred-val {
                        font-family: monospace;
                        font-size: 13px;
                        font-weight: 700;
                        color: #1e3a8a;
                        background: #eff6ff;
                        padding: 4px 10px;
                        border-radius: 6px;
                        border: 1px solid #bfdbfe;
                    }
                    .footer {
                        text-align: center;
                        padding: 16px 24px;
                        border-top: 1px solid #f1f5f9;
                        font-size: 10px;
                        color: #64748b;
                        font-weight: 500;
                    }
                    @media print {
                        body {
                            background: transparent;
                            padding: 0;
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        .card {
                            box-shadow: none;
                            border: 1px solid #cbd5e1;
                            page-break-inside: avoid;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <div class="logo-placeholder">
                            ${logo ? `<img class="logo-img" src="${logo}" />` : `<span class="logo-txt">EDU</span>`}
                        </div>
                        <h3 class="school-name">${schoolName}</h3>
                        <p class="card-title">Kartu Login Guru & Staff</p>
                    </div>
                    <div class="content">
                        <div class="info-group">
                            <div class="info-label">Nama Lengkap</div>
                            <div class="info-val">${guru.nama}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">NIP</div>
                            <div class="info-val">${guru.nip || '-'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Jabatan</div>
                            <div class="info-val">${guru.jabatan}</div>
                        </div>
                        
                        <div class="credentials-box">
                            <div class="credential-row">
                                <span class="cred-label">Username</span>
                                <span class="cred-val">${guru.username}</span>
                            </div>
                            <div class="credential-row">
                                <span class="cred-label">Password</span>
                                <span class="cred-val">${guru.password}</span>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        Simpan kartu ini dengan aman. Jangan bagikan password Anda.
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintAllCards = () => {
        const savedSettings = localStorage.getItem('school_settings_v10');
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
        const schoolName = parsedSettings?.name || "EduAdmin";
        const logo = parsedSettings?.logo || "";

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let cardsHtml = '';
        teachers.forEach((guru) => {
            cardsHtml += `
                <div class="card">
                    <div class="header">
                        <div class="logo-placeholder">
                            ${logo ? `<img class="logo-img" src="${logo}" />` : `<span class="logo-txt">EDU</span>`}
                        </div>
                        <h3 class="school-name">${schoolName}</h3>
                        <p class="card-title">Kartu Login Guru & Staff</p>
                    </div>
                    <div class="content">
                        <div class="info-group">
                            <div class="info-label">Nama Lengkap</div>
                            <div class="info-val">${guru.nama}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">NIP</div>
                            <div class="info-val">${guru.nip || '-'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Jabatan</div>
                            <div class="info-val">${guru.jabatan}</div>
                        </div>
                        
                        <div class="credentials-box">
                            <div class="credential-row">
                                <span class="cred-label">Username</span>
                                <span class="cred-val">${guru.username}</span>
                            </div>
                            <div class="credential-row">
                                <span class="cred-label">Password</span>
                                <span class="cred-val">${guru.password}</span>
                            </div>
                        </div>
                    </div>
                    <div class="footer">
                        Simpan kartu ini dengan aman. Jangan bagikan password Anda.
                    </div>
                </div>
            `;
        });

        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Semua Kartu Login Guru & Staff</title>
                <style>
                    body {
                        font-family: 'Inter', system-ui, -apple-system, sans-serif;
                        background: #f8fafc;
                        margin: 0;
                        padding: 20px;
                    }
                    .grid-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                        gap: 20px;
                        justify-items: center;
                    }
                    .card {
                        width: 360px;
                        background: #ffffff;
                        border-radius: 20px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e2e8f0;
                        overflow: hidden;
                        position: relative;
                        display: inline-block;
                        text-align: left;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        position: relative;
                    }
                    .header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 5px;
                        background: #f59e0b;
                    }
                    .logo-placeholder {
                        width: 44px;
                        height: 44px;
                        background: #ffffff;
                        border-radius: 50%;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 8px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .logo-img {
                        max-width: 28px;
                        max-height: 28px;
                        object-fit: contain;
                    }
                    .logo-txt {
                        font-weight: 800;
                        color: #1e3a8a;
                        font-size: 12px;
                    }
                    .school-name {
                        font-size: 13px;
                        font-weight: 800;
                        letter-spacing: 0.05em;
                        text-transform: uppercase;
                        margin: 0;
                    }
                    .card-title {
                        font-size: 9px;
                        font-weight: 600;
                        color: #93c5fd;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        margin: 2px 0 0 0;
                    }
                    .content {
                        padding: 20px;
                    }
                    .info-group {
                        margin-bottom: 12px;
                    }
                    .info-label {
                        font-size: 8px;
                        text-transform: uppercase;
                        color: #64748b;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        margin-bottom: 2px;
                    }
                    .info-val {
                        font-size: 13px;
                        font-weight: 600;
                        color: #0f172a;
                    }
                    .credentials-box {
                        background: #f8fafc;
                        border: 1px dashed #cbd5e1;
                        border-radius: 12px;
                        padding: 12px;
                        margin-top: 14px;
                    }
                    .credential-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 6px;
                    }
                    .credential-row:last-child {
                        margin-bottom: 0;
                    }
                    .cred-label {
                        font-size: 10px;
                        font-weight: 700;
                        color: #475569;
                    }
                    .cred-val {
                        font-family: monospace;
                        font-size: 12px;
                        font-weight: 700;
                        color: #1e3a8a;
                        background: #eff6ff;
                        padding: 3px 8px;
                        border-radius: 5px;
                        border: 1px solid #bfdbfe;
                    }
                    .footer {
                        text-align: center;
                        padding: 12px 20px;
                        border-top: 1px solid #f1f5f9;
                        font-size: 9px;
                        color: #64748b;
                        font-weight: 500;
                    }
                    @media print {
                        body {
                            background: transparent;
                            padding: 0;
                            margin: 0;
                        }
                        .grid-container {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                        }
                        .card {
                            box-shadow: none;
                            border: 1px solid #cbd5e1;
                            page-break-inside: avoid;
                            margin: 0;
                            width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="grid-container">
                    ${cardsHtml}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-4 h-full shadow-sm animate-in slide-in-from-right flex flex-col">
            {/* Header Buttons */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveView('data_guru')} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight className="rotate-180 text-slate-500" /></button>
                    <div>
                        <h2 className="text-xl font-bold text-[#1E1B4B]">Kelola Data Guru & Staff</h2>
                        <p className="text-slate-400 text-sm">Kelola akun, jabatan, dan penugasan guru</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors border border-green-200 shadow-sm">
                        <Download size={18} /> Template
                    </button>
                    <button onClick={handleUploadClick} className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                        <UploadCloud size={18} /> Upload
                    </button>
                    <button onClick={handlePrintAllCards} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm">
                        <Printer size={18} /> Cetak Semua
                    </button>
                    <button onClick={handleAddTeacher} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-sm">
                        <UserPlus size={18} /> Tambah Guru
                    </button>
                    <button onClick={handleSaveData} className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                        <Save size={18} /> Simpan
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-[1.5rem] border border-slate-200 shadow-inner bg-slate-50/50">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#F1F5F9] text-slate-700 font-bold sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 border-r border-slate-200 text-center w-12">No</th>
                            <th className="p-4 border-r border-slate-200">Nama Lengkap</th>
                            <th className="p-4 border-r border-slate-200">NIP</th>
                            <th className="p-4 border-r border-slate-200 min-w-[200px]">Jabatan</th>

                            <th className="p-4 border-r border-slate-200 min-w-[150px]">Wali Kelas</th>
                            <th className="p-4 border-r border-slate-200">Username</th>
                            <th className="p-4 border-r border-slate-200">Password</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {teachers.map((guru, i) => (
                            <tr key={guru.id} className="hover:bg-green-50/50 transition-colors">
                                <td className="p-4 text-center text-slate-500 font-medium">{i + 1}</td>
                                <td className="p-4 font-bold text-slate-700">{guru.nama}</td>
                                <td className="p-4 font-mono text-slate-600">{guru.nip}</td>
                                {/* DROPDOWN JABATAN */}
                                <td className="p-4">
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-green-500 cursor-pointer"
                                        defaultValue={guru.jabatan}
                                        onChange={(e) => {
                                            const newTeachers = [...teachers];
                                            newTeachers[i].jabatan = e.target.value;
                                            setTeachers(newTeachers);
                                        }}
                                    >
                                        {positions.map(p => (
                                            <option key={p.id} value={p.nama}>{p.nama}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* DROPDOWN WALI KELAS */}
                                <td className="p-4 hover:bg-slate-50">
                                    <select className="w-full bg-transparent border-none outline-none text-slate-700 font-bold cursor-pointer disabled:opacity-30"
                                        defaultValue={guru.wali}
                                        disabled={['Kepala Sekolah', 'Staff Tata Usaha', 'Operator Data'].includes(guru.jabatan)}
                                        onChange={(e) => {
                                            const newTeachers = [...teachers];
                                            newTeachers[i].wali = e.target.value;
                                            setTeachers(newTeachers);
                                        }}
                                    >
                                        <option value="-">-</option>
                                        {classOptions.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-slate-600">{guru.username}</td>
                                <td className="p-4 text-slate-600 font-mono text-sm bg-slate-50 px-2 rounded border border-slate-100">{guru.password}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => handlePrintSingleCard(guru)} title="Cetak Kartu Login" className="p-2 hover:bg-indigo-50 text-indigo-500 rounded-lg"><Printer size={16} /></button>
                                    <button onClick={() => handleEditItem(guru, 'Data Guru')} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteTeacher(guru.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherDataView;
