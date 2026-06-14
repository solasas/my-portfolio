'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

const PREFIX = 'portfolio_v1_';

interface Ctx {
  isAdmin: boolean;
  enterAdmin: () => void;
  exitAdmin: () => void;
  getContent: (key: string) => string | undefined;
  trackChange: (key: string, value: string) => void;
  save: () => void;
}

const AdminContext = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedContent, setSavedContent] = useState<Record<string, string>>({});
  const pending = useRef<Record<string, string>>({});

  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(PREFIX)) loaded[k.slice(PREFIX.length)] = localStorage.getItem(k)!;
    }
    setSavedContent(loaded);
  }, []);

  const enterAdmin = useCallback(() => setIsAdmin(true), []);

  const exitAdmin = useCallback(() => {
    setIsAdmin(false);
    pending.current = {};
  }, []);

  const getContent = useCallback(
    (key: string) => savedContent[key],
    [savedContent]
  );

  const trackChange = useCallback((key: string, value: string) => {
    pending.current[key] = value;
  }, []);

  const save = useCallback(() => {
    const changes = { ...pending.current };
    Object.entries(changes).forEach(([k, v]) => {
      localStorage.setItem(PREFIX + k, v);
    });
    setSavedContent(prev => ({ ...prev, ...changes }));
    pending.current = {};
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, enterAdmin, exitAdmin, getContent, trackChange, save }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
