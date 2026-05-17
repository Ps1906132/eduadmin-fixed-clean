import React, { useState, useEffect } from 'react';
import Pengaturan from '../../../Pengaturan';
import { schoolSettingsGlobal } from '../../../../data/sharedData';

// SettingsView is self-contained - reads/writes its own state from localStorage
const SettingsView: React.FC = () => {
    const [schoolSettings, setSchoolSettings] = useState(() => {
        const saved = localStorage.getItem('school_settings_v10');
        if (saved) return JSON.parse(saved);
        return {
            name: schoolSettingsGlobal.name,
            address: schoolSettingsGlobal.address,
            accreditation: 'A',
            principal: schoolSettingsGlobal.principal,
            academicYear: schoolSettingsGlobal.academicYear,
            bannerImage: '',
            logo: schoolSettingsGlobal.logo || '',
            icon: schoolSettingsGlobal.icon || ''
        };
    });

    // BUG FIX: Persist ke localStorage setiap kali schoolSettings berubah
    // Sebelumnya hanya update React state saja — hilang saat refresh
    useEffect(() => {
        localStorage.setItem('school_settings_v10', JSON.stringify(schoolSettings));
        // Sync ke global agar komponen lain (Rapot, Login) ikut update
        Object.assign(schoolSettingsGlobal, {
            name: schoolSettings.name,
            address: schoolSettings.address,
            principal: schoolSettings.principal,
            academicYear: schoolSettings.academicYear,
            logo: schoolSettings.logo || '',
            icon: schoolSettings.icon || '',
        });
    }, [schoolSettings]);

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-y-auto custom-scrollbar">
            <Pengaturan schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} />
        </div>
    );
};

export default SettingsView;
