'use client';

import { useRef, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminToolbar() {
  const { isAdmin, exitAdmin, save } = useAdmin();
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save();
      showToast('Saved & published');
    } catch {
      showToast('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('cv', file);
      const res = await fetch('/api/upload-cv', { method: 'POST', body });
      showToast(res.ok ? 'CV uploaded' : 'Upload failed');
    } catch {
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[150] flex items-center gap-3 bg-warm-dark rounded-xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <span className="text-[0.6875rem] font-semibold text-warm-faded uppercase tracking-widest">
          Admin
        </span>

        {/* Upload CV */}
        <input
          ref={cvInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleCVUpload}
        />
        <button
          onClick={() => cvInputRef.current?.click()}
          disabled={uploading}
          title="Upload CV PDF"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-warm-dark/60 text-warm-faded rounded-md text-xs hover:border-warm-accent hover:text-white transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {uploading ? 'Uploading…' : 'Upload CV'}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3.5 py-1.5 bg-warm-accent text-white rounded-md text-xs font-medium hover:opacity-85 transition-opacity disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save & Publish'}
        </button>
        <button
          onClick={exitAdmin}
          className="px-3 py-1.5 border border-warm-dark/60 text-warm-faded rounded-md text-xs hover:border-warm-accent hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Toast */}
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
