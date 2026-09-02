import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@scholarshipai_users';
const SESSION_KEY = '@scholarshipai_session';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Very lightweight deterministic hash for offline storage — not cryptographic. */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const users = await getStoredUsers();
    const normalised = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email === normalised && u.passwordHash === simpleHash(password),
    );
    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const session: AuthUser = { id: found.id, name: found.name, email: found.email };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name.trim()) return { success: false, error: 'Name is required.' };
    if (!email.includes('@')) return { success: false, error: 'Enter a valid email address.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const users = await getStoredUsers();
    const normalised = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalised)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: StoredUser = {
      id: Date.now().toString(36),
      name: name.trim(),
      email: normalised,
      passwordHash: simpleHash(password),
    };
    await saveUsers([...users, newUser]);
    const session: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { success: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
