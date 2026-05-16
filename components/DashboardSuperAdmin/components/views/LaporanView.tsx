import React from 'react';
import Laporan from '../../../Laporan';

const LaporanView: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
            <Laporan />
        </div>
    );
};

export default LaporanView;
