import React from 'react';
import Multimedia from '../../../Multimedia';

interface MultimediaViewProps {
    user?: any;
}

const MultimediaView: React.FC<MultimediaViewProps> = ({ user }) => {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-hidden">
            <Multimedia user={user} />
        </div>
    );
};

export default MultimediaView;
