
// Fix: Add React import to resolve React namespace errors
import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
}