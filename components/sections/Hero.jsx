'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Editable from '@/components/Editable';
import { gsap } from '@/lib/gsap';

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
        .from('.hero-label', { opacity: 0, y: 14 })
        .from('.hero-name', { opacity: 0, y: 18 }, '-=0.5')
        .from('.hero-bio', { opacity: 0, y: 18 }, '-=0.5')
        .from('.hero-actions > *', { opacity: 0, y: 14, stagger: 0.08 }, '-=0.45')
        .from('.hero-avatar', { opacity: 0, scale: 0.94 }, '-=0.6');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="pt-36 pb-24" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <Editable
              fieldKey="hero-label"
              defaultContent="Software Developer"
              as="p"
              className="hero-label text-[0.75rem] font-medium text-warm-accent uppercase tracking-[0.12em] mb-3"
            />
            <Editable
              fieldKey="hero-name"
              defaultContent="Hi, I'm Sashank Solasa"
              as="h1"
              className="hero-name font-heading font-bold text-warm-dark tracking-tight mb-5 text-4xl sm:text-5xl"
            />
            <Editable
              fieldKey="hero-bio"
              defaultContent="I'm a fresher SDE passionate about building clean, efficient software. I love solving complex problems with elegant code, and I'm always eager to learn and grow. Currently seeking opportunities where I can contribute meaningfully from day one."
              as="p"
              className="hero-bio text-[0.9375rem] text-warm-muted leading-[1.8] max-w-xl mb-9"
            />
            <div className="hero-actions flex gap-3 flex-wrap">
              <a
                href="#contact"
                className="px-6 py-2.5 bg-warm-accent text-white rounded-lg text-sm font-medium hover:opacity-85 active:scale-95 transition-all"
              >
                Get in Touch
              </a>
              <a
                href="#projects"
                className="px-6 py-2.5 border-[1.5px] border-warm-accent text-warm-accent rounded-lg text-sm font-medium hover:opacity-85 active:scale-95 transition-all"
              >
                See My Work
              </a>
              <a
                href="/sashank's resume.pdf"
                download="sashank's resume"
                className="inline-flex items-center gap-2 px-6 py-2.5 border-[1.5px] border-warm-border text-warm-muted rounded-lg text-sm font-medium hover:border-warm-accent hover:text-warm-accent active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download CV
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="hero-avatar order-first sm:order-last">
            <div className="w-56 h-64 sm:w-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-warm-border shadow-sm shrink-0">
              <Image
                src="/avatar.jpeg"
                alt="Sashank"
                width={288}
                height={320}
                className="w-full h-full object-cover object-top"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
