'use client';

import { useEffect, useRef } from 'react';
import Editable from '@/components/Editable';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const items = [
  {
    icon: <span className="text-sm">✉</span>,
    labelKey: 'contact-email',
    defaultLabel: 'sashanksolasa@gmail.com',
    href: 'mailto:sashanksolasa@gmail.com',
  },
  {
    icon: <span className="text-xs font-bold">in</span>,
    labelKey: 'contact-linkedin',
    defaultLabel: 'linkedin.com/in/sashanksolasa',
    href: 'https://www.linkedin.com/in/sashanksolasa/',
  },
  {
    icon: <GithubIcon />,
    labelKey: 'contact-github',
    defaultLabel: 'github.com/solasas',
    href: 'https://github.com/solasas',
  },
];

export default function Contact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray('.contact-item');
      gsap.set(rows, { opacity: 0, y: 20 });
      ScrollTrigger.batch(rows, {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" className="py-24 bg-warm-bg" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <Editable
          fieldKey="contact-title"
          defaultContent="Contact"
          as="h2"
          className="font-heading font-bold text-3xl text-warm-dark tracking-tight mb-2"
        />
        <Editable
          fieldKey="contact-subtitle"
          defaultContent="Let's talk — I'm open to opportunities"
          as="p"
          className="text-sm text-warm-faded mb-10"
        />

        <div className="flex flex-col items-center gap-4">
          {items.map(item => (
            <a
              key={item.labelKey}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="contact-item flex items-center gap-3 w-full max-w-xs px-6 py-3.5 bg-white border border-warm-border rounded-xl text-warm-muted hover:border-warm-soft hover:bg-warm-card transition-all text-[0.9375rem]"
            >
              <span className="w-7 h-7 bg-warm-light rounded-md flex items-center justify-center text-warm-accent shrink-0">
                {item.icon}
              </span>
              <Editable
                fieldKey={item.labelKey}
                defaultContent={item.defaultLabel}
                as="span"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
