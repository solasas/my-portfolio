'use client';

import { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminToolbar() {
  const { isAdmin, exitAdmin, save } = useAdmin();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save();
      showToast('Saved');
    } catch {
      showToast('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[150] flex items-center gap-3 bg-warm-dark rounded-xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <span className="text-[0.6875rem] font-semibold text-warm-faded uppercase tracking-widest">
          Admin
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3.5 py-1.5 bg-warm-accent text-white rounded-md text-xs font-medium hover:opacity-85 transition-opacity disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={exitAdmin}
          className="px-3 py-1.5 border border-warm-dark/60 text-warm-faded rounded-md text-xs hover:border-warm-accent hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      <div
        className={`fixed bottom-20 right-6 z-[300] bg-warm-dark text-warm-light text-xs px-4 py-2.5 rounded-lg shadow-lg pointer-events-none transition-all duration-200 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        {toast}
      </div>
    </>
  );
}
