import React from 'react';
import Multimedia from '../../../Multimedia';

const MultimediaView: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
            <Multimedia />
        </div>
    );
};

export default MultimediaView;
