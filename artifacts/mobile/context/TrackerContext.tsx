import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'rejected' | 'accepted' | 'visa' | 'completed';

export interface TrackedApplication {
  id: string;
  scholarshipName: string;
  university: string;
  country: string;
  amount: string;
  deadline: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  saved:     { label: 'Saved',     color: '#6B7280', bg: '#F3F4F6' },
  applied:   { label: 'Applied',   color: '#3B82F6', bg: '#EFF6FF' },
  interview: { label: 'Interview', color: '#8B5CF6', bg: '#F5F3FF' },
  rejected:  { label: 'Rejected',  color: '#EF4444', bg: '#FEF2F2' },
  accepted:  { label: 'Accepted',  color: '#10B981', bg: '#ECFDF5' },
  visa:      { label: 'Visa',      color: '#F59E0B', bg: '#FFFBEB' },
  completed: { label: 'Completed', color: '#10B981', bg: '#ECFDF5' },
};

interface TrackerContextValue {
  applications: TrackedApplication[];
  addApplication: (app: Omit<TrackedApplication, 'id' | 'createdAt'>) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  updateNotes: (id: string, notes: string) => void;
  removeApplication: (id: string) => void;
}

const TrackerContext = createContext<TrackerContextValue | null>(null);

const STORAGE_KEY = 'scholarshipai_tracker';

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setApplications(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const persist = (apps: TrackedApplication[]) => {
    setApplications(apps);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  };

  const addApplication = (app: Omit<TrackedApplication, 'id' | 'createdAt'>) => {
    const next = {
      ...app,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
    };
    persist([next, ...applications]);
  };

  const updateStatus = (id: string, status: ApplicationStatus) => {
    persist(applications.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const updateNotes = (id: string, notes: string) => {
    persist(applications.map((a) => (a.id === id ? { ...a, notes } : a)));
  };

  const removeApplication = (id: string) => {
    persist(applications.filter((a) => a.id !== id));
  };

  return (
    <TrackerContext.Provider value={{ applications, addApplication, updateStatus, updateNotes, removeApplication }}>
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within TrackerProvider');
  return ctx;
}
