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
  enterAdmin: (password: string) => void;
  exitAdmin: () => void;
  getContent: (key: string) => string | undefined;
  trackChange: (key: string, value: string) => void;
  save: () => Promise<void>;
}

const AdminContext = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedContent, setSavedContent] = useState<Record<string, string>>({});
  const pending = useRef<Record<string, string>>({});
  const sessionPw = useRef<string | null>(null);

  // On mount: fetch from KV → write to localStorage → update state → notify components
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const kvContent: Record<string, string> = await res.json();
          if (Object.keys(kvContent).length > 0) {
            Object.entries(kvContent).forEach(([k, v]) =>
              localStorage.setItem(PREFIX + k, v)
            );
            setSavedContent(kvContent);
            window.dispatchEvent(new CustomEvent('portfolio-content-loaded'));
            return;
          }
        }
      } catch {}

      // Fallback: read from localStorage
      const loaded: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (k.startsWith(PREFIX)) loaded[k.slice(PREFIX.length)] = localStorage.getItem(k)!;
      }
      setSavedContent(loaded);
    };

    load();
  }, []);

  const enterAdmin = useCallback((password: string) => {
    sessionPw.current = password;
    setIsAdmin(true);
  }, []);

  const exitAdmin = useCallback(() => {
    setIsAdmin(false);
    sessionPw.current = null;
    pending.current = {};
  }, []);

  const getContent = useCallback(
    (key: string) => savedContent[key],
    [savedContent]
  );

  const trackChange = useCallback((key: string, value: string) => {
    pending.current[key] = value;
  }, []);

  const save = useCallback(async () => {
    // Flush pending text edits to localStorage
    Object.entries(pending.current).forEach(([k, v]) =>
      localStorage.setItem(PREFIX + k, v)
    );
    pending.current = {};

    // Collect ALL portfolio content from localStorage
    const allContent: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(PREFIX)) allContent[k.slice(PREFIX.length)] = localStorage.getItem(k)!;
    }
    setSavedContent(allContent);

    // Sync to Vercel KV
    if (sessionPw.current) {
      try {
        await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: sessionPw.current, content: allContent }),
        });
      } catch (e) {
        console.error('KV sync failed:', e);
      }
    }
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
