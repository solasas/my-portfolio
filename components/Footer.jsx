'use client';

import Editable from './Editable';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-warm-border text-center">
      <Editable
        fieldKey="footer-text"
        defaultContent="Built by Sashank · 2025"
        as="p"
        className="text-xs text-warm-faded/70"
      />
    </footer>
  );
}
