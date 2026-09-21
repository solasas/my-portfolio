'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';

export default function Editable({ fieldKey, defaultContent, as = 'span', className }) {
  const { isAdmin, getContent, trackChange } = useAdmin();
  const content = getContent(fieldKey) ?? defaultContent;

  return React.createElement(as, {
    className,
    contentEditable: isAdmin || undefined,
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: { __html: content },
    onInput: isAdmin
      ? (e) => trackChange(fieldKey, e.currentTarget.innerHTML)
      : undefined,
  });
}
