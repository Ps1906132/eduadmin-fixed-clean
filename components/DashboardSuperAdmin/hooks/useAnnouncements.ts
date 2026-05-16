import { useState, useEffect } from 'react';
import { announcementDataGlobal, updateAnnouncementsGlobal, Announcement } from '../../../data/sharedData';

export const useAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('announcements_data_v10');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse announcements", e);
                }
            }
        }
        return announcementDataGlobal;
    });

    useEffect(() => {
        localStorage.setItem('announcements_data_v10', JSON.stringify(announcements));
        updateAnnouncementsGlobal(announcements);
    }, [announcements]);

    return {
        announcements,
        setAnnouncements
    };
};
