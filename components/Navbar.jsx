'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-warm-border bg-warm-bg/92 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? 'shadow-[0_2px_12px_rgba(139,111,71,0.08)]' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center gap-8">
        <a
          href="#about"
          className="font-heading font-bold text-[1.05rem] text-warm-accent tracking-tight shrink-0"
        >
          Sashank
        </a>
        <ul className="hidden sm:flex gap-7 flex-1">
          {links.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-warm-muted hover:text-warm-accent transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-warm-accent group-hover:w-full transition-all duration-200" />
              </a>
            </li>
          ))}
        </ul>
        {/* Admin indicator — tiny dot, unobtrusive */}
        <button
          onClick={() => {
            const event = new CustomEvent('open-admin-modal');
            window.dispatchEvent(event);
          }}
          title={isAdmin ? 'Admin mode active' : 'Admin login'}
          className={`ml-auto w-2.5 h-2.5 rounded-full border transition-colors duration-200 ${
            isAdmin
              ? 'bg-warm-accent border-warm-accent'
              : 'bg-transparent border-warm-border hover:border-warm-soft'
          }`}
        />
      </div>
    </nav>
  );
}
