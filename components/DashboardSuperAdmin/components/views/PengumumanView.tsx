import React from 'react';
import Pengumuman from '../../../Pengumuman';
import { classesDataGlobal } from '../../../../data/sharedData';

const PengumumanView: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-y-auto custom-scrollbar">
            <Pengumuman classes={classesDataGlobal.map(c => c.nama)} />
        </div>
    );
};

export default PengumumanView;
