'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminBodyClass() {
  const { isAdmin } = useAdmin();
  useEffect(() => {
    document.body.classList.toggle('admin-active', isAdmin);
  }, [isAdmin]);
  return null;
}
