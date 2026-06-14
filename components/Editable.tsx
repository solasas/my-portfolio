'use client';

import React from 'react';
import { useAdmin } from '@/context/AdminContext';

interface Props {
  fieldKey: string;
  defaultContent: string;
  as?: string;
  className?: string;
}

export default function Editable({ fieldKey, defaultContent, as = 'span', className }: Props) {
  const { isAdmin, getContent, trackChange } = useAdmin();
  const content = getContent(fieldKey) ?? defaultContent;

  return React.createElement(as, {
    className,
    contentEditable: isAdmin || undefined,
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: { __html: content },
    onInput: isAdmin
      ? (e: React.FormEvent<HTMLElement>) =>
          trackChange(fieldKey, (e.currentTarget as HTMLElement).innerHTML)
      : undefined,
  });
}
