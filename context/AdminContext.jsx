'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';

const PREFIX = 'portfolio_v1_';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedContent, setSavedContent] = useState({});
  const pending = useRef({});

  useEffect(() => {
    const loaded = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) loaded[k.slice(PREFIX.length)] = localStorage.getItem(k);
    }
    setSavedContent(loaded);
  }, []);

  const enterAdmin = useCallback((password) => {
    void password;
    setIsAdmin(true);
  }, []);

  const exitAdmin = useCallback(() => {
    setIsAdmin(false);
    pending.current = {};
  }, []);

  const getContent = useCallback(
    (key) => savedContent[key],
    [savedContent]
  );

  const trackChange = useCallback((key, value) => {
    pending.current[key] = value;
  }, []);

  const save = useCallback(async () => {
    Object.entries(pending.current).forEach(([k, v]) =>
      localStorage.setItem(PREFIX + k, v)
    );
    pending.current = {};

    const allContent = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(PREFIX)) allContent[k.slice(PREFIX.length)] = localStorage.getItem(k);
    }
    setSavedContent(allContent);
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
