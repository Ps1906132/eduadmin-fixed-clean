import React from 'react';
import Laporan from '../../../Laporan';

interface LaporanViewProps {
    user?: any;
    students?: any[];
    classes?: any[];
}

const LaporanView: React.FC<LaporanViewProps> = ({ user, students, classes }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
            <Laporan user={user} students={students} classes={classes} />
        </div>
    );
};

export default LaporanView;
