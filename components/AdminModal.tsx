'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const ADMIN_PASSWORD = 'sashank2025';

export default function AdminModal() {
  const { isAdmin, enterAdmin, exitAdmin } = useAdmin();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => {
      if (isAdmin) { exitAdmin(); return; }
      setOpen(true);
      setPw('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener('open-admin-modal', handler);
    return () => window.removeEventListener('open-admin-modal', handler);
  }, [isAdmin, exitAdmin]);

  const close = () => { setOpen(false); setError(false); };

  const submit = () => {
    if (pw === ADMIN_PASSWORD) {
      enterAdmin(pw);
      close();
    } else {
      setError(true);
      setPw('');
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-warm-dark/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white border border-warm-border rounded-2xl p-9 w-80 shadow-[0_8px_40px_rgba(139,111,71,0.12)]">
        <h3 className="font-heading font-semibold text-xl text-warm-dark mb-5">Admin Login</h3>
        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Enter password"
          className="w-full px-3.5 py-2.5 border-[1.5px] border-warm-border rounded-lg text-sm bg-warm-bg text-warm-text outline-none focus:border-warm-accent transition-colors mb-2"
        />
        {error && (
          <p className="text-xs text-red-500 mb-4">Incorrect password</p>
        )}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={submit}
            className="flex-1 py-2 bg-warm-accent text-white rounded-lg text-sm font-medium hover:opacity-85 transition-opacity"
          >
            Login
          </button>
          <button
            onClick={close}
            className="flex-1 py-2 border border-warm-border text-warm-muted rounded-lg text-sm hover:border-warm-soft transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
