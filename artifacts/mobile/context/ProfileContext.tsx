import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  nationality: string;
  degreeLevel: 'bachelor' | 'master' | 'phd' | '';
  fieldOfStudy: string;
  // GPA
  gradingSystem: string;
  localGrade: string;
  cgpa4: number; // converted to 4.0
  // Test scores
  ielts: number;
  toefl: number;
  gre: number;
  // Academic extras
  publications: number;
  awards: number;
  volunteerMonths: number;
  leadershipRoles: number;
  workYears: number;
  hasLOR: boolean;
  hasSOP: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  nationality: '',
  degreeLevel: '',
  fieldOfStudy: '',
  gradingSystem: 'percentage',
  localGrade: '',
  cgpa4: 0,
  ielts: 0,
  toefl: 0,
  gre: 0,
  publications: 0,
  awards: 0,
  volunteerMonths: 0,
  leadershipRoles: 0,
  workYears: 0,
  hasLOR: false,
  hasSOP: false,
};

function computeReadinessScore(p: UserProfile): number {
  let score = 0;
  // CGPA (max 30)
  if (p.cgpa4 >= 3.7) score += 30;
  else if (p.cgpa4 >= 3.3) score += 25;
  else if (p.cgpa4 >= 3.0) score += 20;
  else if (p.cgpa4 >= 2.7) score += 14;
  else if (p.cgpa4 > 0) score += 8;

  // IELTS (max 20)
  if (p.ielts >= 7.5) score += 20;
  else if (p.ielts >= 7.0) score += 16;
  else if (p.ielts >= 6.5) score += 12;
  else if (p.ielts >= 6.0) score += 8;
  else if (p.ielts > 0) score += 4;

  // Publications (max 10)
  score += Math.min(10, p.publications * 5);

  // Awards (max 5)
  score += Math.min(5, p.awards * 2);

  // Leadership (max 8)
  score += Math.min(8, p.leadershipRoles * 3);

  // Volunteering (max 5)
  score += p.volunteerMonths >= 6 ? 5 : p.volunteerMonths >= 3 ? 3 : 0;

  // Work experience (max 7)
  score += Math.min(7, p.workYears * 2);

  // Documents (max 10)
  if (p.hasLOR) score += 5;
  if (p.hasSOP) score += 5;

  // Profile completeness bonus (max 5)
  if (p.name && p.nationality && p.degreeLevel && p.fieldOfStudy) score += 5;

  return Math.min(100, score);
}

export const GRADING_SYSTEMS: { label: string; value: string; description: string }[] = [
  { label: 'Percentage (0–100%)', value: 'percentage', description: '70% → 3.3 GPA' },
  { label: 'British Honours', value: 'british', description: 'First Class → 4.0 GPA' },
  { label: 'German Grade (1–5)', value: 'german', description: '1.0 → 4.0 GPA' },
  { label: 'Indian CGPA (10-pt)', value: 'indian10', description: '8.5/10 → 3.4 GPA' },
  { label: '4.0 GPA (USA/Canada)', value: 'gpa40', description: 'Direct entry' },
  { label: 'West African Grade', value: 'waec', description: 'Second Class Upper → 3.5 GPA' },
  { label: 'East African Grade', value: 'eastafrica', description: 'Second Class Upper → 3.5 GPA' },
];

export function convertToGPA4(system: string, grade: string): number {
  const g = grade.trim().toLowerCase();
  switch (system) {
    case 'percentage': {
      const pct = parseFloat(g);
      if (isNaN(pct)) return 0;
      if (pct >= 90) return 4.0;
      if (pct >= 85) return 3.9;
      if (pct >= 80) return 3.7;
      if (pct >= 75) return 3.5;
      if (pct >= 70) return 3.3;
      if (pct >= 65) return 3.0;
      if (pct >= 60) return 2.7;
      if (pct >= 55) return 2.4;
      if (pct >= 50) return 2.0;
      return 1.5;
    }
    case 'british': {
      if (g.includes('first') || g.includes('1st')) return 4.0;
      if (g.includes('2.1') || g.includes('2:1') || g.includes('upper')) return 3.5;
      if (g.includes('2.2') || g.includes('2:2') || g.includes('lower')) return 3.0;
      if (g.includes('third') || g.includes('3rd')) return 2.0;
      if (g.includes('pass')) return 1.5;
      return 0;
    }
    case 'german': {
      const grd = parseFloat(g);
      if (isNaN(grd)) return 0;
      if (grd <= 1.3) return 4.0;
      if (grd <= 1.7) return 3.7;
      if (grd <= 2.0) return 3.3;
      if (grd <= 2.3) return 3.0;
      if (grd <= 2.7) return 2.7;
      if (grd <= 3.0) return 2.3;
      if (grd <= 3.3) return 2.0;
      if (grd <= 3.7) return 1.7;
      if (grd <= 4.0) return 1.3;
      return 1.0;
    }
    case 'indian10': {
      const pts = parseFloat(g);
      if (isNaN(pts)) return 0;
      // 10-point CGPA to 4.0
      return Math.min(4.0, Math.round((pts / 10) * 4.0 * 10) / 10);
    }
    case 'gpa40': {
      const pts = parseFloat(g);
      return isNaN(pts) ? 0 : Math.min(4.0, Math.max(0, pts));
    }
    case 'waec':
    case 'eastafrica': {
      if (g.includes('first') || g.includes('distinction')) return 4.0;
      if (g.includes('2.1') || g.includes('upper') || g.includes('second class upper')) return 3.5;
      if (g.includes('2.2') || g.includes('lower') || g.includes('second class lower')) return 2.7;
      if (g.includes('third') || g.includes('pass')) return 2.0;
      return 0;
    }
    default:
      return 0;
  }
}

interface ProfileContextValue {
  profile: UserProfile;
  readinessScore: number;
  updateProfile: (updates: Partial<UserProfile>) => void;
  saveProfile: () => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = 'scholarshipai_profile';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setProfile(JSON.parse(raw));
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      // Auto-recalculate cgpa4 when grading inputs change
      if (updates.gradingSystem !== undefined || updates.localGrade !== undefined) {
        const system = updates.gradingSystem ?? next.gradingSystem;
        const grade = updates.localGrade ?? next.localGrade;
        next.cgpa4 = convertToGPA4(system, grade);
      }
      return next;
    });
  };

  const saveProfile = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  };

  const readinessScore = computeReadinessScore(profile);

  return (
    <ProfileContext.Provider value={{ profile, readinessScore, updateProfile, saveProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
