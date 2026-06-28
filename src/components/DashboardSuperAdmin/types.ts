// Types and Interfaces for DashboardSuperAdmin
import React from 'react';

export interface SuperAdminProps {
    user: any;
    onLogout: () => void;
}

// --- SCHEDULE TYPES ---
export interface ScheduleItem {
    id: string; // unique
    classId: string;
    day: string;
    period: number; // 0 for custom? Or 1-indexed. Let's use 1-indexed for periods.
    subjectId: number | string; // 'upacara', 'break', or subject ID
    teacherId?: string; // profile ID of teacher assigned to this slot
    customName?: string; // For custom items
    startTime?: string;
    endTime?: string;
}

export interface Period {
    id: number;
    start: string;
    end: string;
}

export interface MasterSchedule {
    id: number;
    name: string; // e.g. "Semester Ganjil 2025"
    status: 'draft' | 'published';
    items: ScheduleItem[];
    dailyInfos?: DailyScheduleInfo[];
}

export interface DailyScheduleInfo {
    classId: string;
    day: string;
    seragam?: string;
    catatan?: string;
}

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactElement;
}

export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
