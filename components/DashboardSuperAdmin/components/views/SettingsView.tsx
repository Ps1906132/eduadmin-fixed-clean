import React, { useState, useEffect } from 'react';
import Pengaturan from '../../../Pengaturan';
import { schoolSettingsGlobal } from '../../../../data/sharedData';

// SettingsView is self-contained - reads/writes its own state from API & localStorage
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

    // Fetch from D1 on Mount
    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return;
            try {
                const res = await fetch('/api/school_settings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const s = data[0];
                        setSchoolSettings((prev: any) => ({
                            ...prev,
                            name: s.school_name || prev.name,
                            address: s.school_address || prev.address,
                            principal: s.principal_name || prev.principal,
                            logo: s.school_logo || prev.logo
                        }));
                    }
                }
            } catch (err) {
                console.error("Gagal mengambil data sekolah dari API", err);
            }
        };
        fetchSettings();
    }, []);

    // BUG FIX: Persist ke localStorage setiap kali schoolSettings berubah
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

        // Sync to D1 API (Background)
        const syncToD1 = async () => {
            const token = localStorage.getItem('eduadmin_token');
            if (!token) return;
            try {
                await fetch('/api/school_settings?id=eq.settings-school', {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        school_name: schoolSettings.name,
                        school_address: schoolSettings.address,
                        principal_name: schoolSettings.principal,
                        school_logo: schoolSettings.logo
                    })
                });
            } catch (err) {
                console.error("Gagal sinkronisasi data sekolah ke API", err);
            }
        };
        syncToD1();
    }, [schoolSettings]);

    return (
        <div className="bg-white rounded-[2.5rem] p-6 h-full shadow-sm animate-in fade-in overflow-y-auto custom-scrollbar">
            <Pengaturan schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} />
        </div>
    );
};

export default SettingsView;
