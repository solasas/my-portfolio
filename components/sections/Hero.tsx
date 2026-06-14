'use client';

import Image from 'next/image';
import Editable from '@/components/Editable';

export default function Hero() {
  return (
    <section id="about" className="pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <Editable
              fieldKey="hero-label"
              defaultContent="Software Developer"
              as="p"
              className="text-[0.75rem] font-medium text-warm-accent uppercase tracking-[0.12em] mb-3"
            />
            <Editable
              fieldKey="hero-name"
              defaultContent="Hi, I'm Sashank Solasa"
              as="h1"
              className="font-heading font-bold text-warm-dark tracking-tight mb-5 text-4xl sm:text-5xl"
            />
            <Editable
              fieldKey="hero-bio"
              defaultContent="I'm a fresher SDE passionate about building clean, efficient software. I love solving complex problems with elegant code, and I'm always eager to learn and grow. Currently seeking opportunities where I can contribute meaningfully from day one."
              as="p"
              className="text-[0.9375rem] text-warm-muted leading-[1.8] max-w-xl mb-9"
            />
            <div className="flex gap-3 flex-wrap">
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
                href="/cv.pdf"
                download="Sashank_CV.pdf"
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
          <div className="order-first sm:order-last">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-warm-border shadow-sm shrink-0">
              <Image
                src="/avatar.jpeg"
                alt="Sashank"
                width={176}
                height={176}
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
