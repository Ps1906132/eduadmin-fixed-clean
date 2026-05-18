import React from 'react';
import Pengumuman from '../../../Pengumuman';
import { useClasses } from '../../../DashboardSuperAdmin/hooks/useClasses';

const PengumumanView: React.FC = () => {
    const { classes } = useClasses();
    // Gunakan kelas dari D1 (online). Jika belum ada kelas, kirim array kosong — jangan data palsu
    const classNames = classes && classes.length > 0
        ? classes.map((c: any) => c.nama)
        : [];

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-y-auto custom-scrollbar">
            <Pengumuman classes={classNames} />
        </div>
    );
};

export default PengumumanView;
