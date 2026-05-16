import { useState, useEffect } from 'react';
import {
    broadcastsDataGlobal,
    updateBroadcastsGlobal,
    multimediaSettingsGlobal,
    updateMultimediaSettingsGlobal,
    Broadcast
} from '../../../data/sharedData';

export const useMultimedia = () => {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('broadcasts_data_v10');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse broadcasts", e);
                }
            }
        }
        return broadcastsDataGlobal;
    });

    const [channelSettings, setChannelSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('multimedia_settings_v10');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse multimedia settings", e);
                }
            }
        }
        return multimediaSettingsGlobal;
    });

    useEffect(() => {
        localStorage.setItem('broadcasts_data_v10', JSON.stringify(broadcasts));
        updateBroadcastsGlobal(broadcasts);
    }, [broadcasts]);

    useEffect(() => {
        localStorage.setItem('multimedia_settings_v10', JSON.stringify(channelSettings));
        updateMultimediaSettingsGlobal(channelSettings);
    }, [channelSettings]);

    return {
        broadcasts,
        setBroadcasts,
        channelSettings,
        setChannelSettings
    };
};
