'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import Editable from '@/components/Editable';

const STORE_KEY = 'portfolio_v1_projects-data';

interface Project {
  id: string;
  name: string;
  desc: string;
  github: string;
  githubUrl: string;
  demo: string;
  demoUrl: string;
  showDemo: boolean;
  tags: string[];
}

const DEFAULTS: Project[] = [
  {
    id: 'proj5',
    name: 'Wayfinder',
    desc: 'A geospatial routing engine that computes shortest paths over real-world road networks, combining PostGIS spatial queries with Dijkstra\'s algorithm on OpenStreetMap data.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/Wayfinder',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['PostGIS', 'Dijkstra', 'OpenStreetMap'],
  },
  {
    id: 'proj3',
    name: 'SkillSwap',
    desc: 'A peer-to-peer skill-sharing platform backend featuring intelligent matching, exchange request management, session scheduling, and a user rating system.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/skillswap',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['SpringBoot', 'React'],
  },
  {
  id: 'proj2',
  name: 'CouponPing',
  desc: 'A Flutter-based smart coupon wallet that scans coupons using OCR and barcode detection, stores them securely, and sends timely expiry reminders with search, filtering, and analytics.',
  github: 'GitHub',
  githubUrl: 'https://github.com/solasas/CouponPing',
  demo: 'Demo',
  demoUrl: '',
  showDemo: false,
  tags: ['Flutter', 'Riverpod', 'Hive', 'Google ML Kit'],
},
  {
    id: 'proj1',
    name: 'TaskHive',
    desc: 'A full-stack task management app with real-time updates, user authentication, and priority-based sorting.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/Taskhive',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['Spring Boot', 'React', 'Postgres'],
  },
  {
    id: 'proj4',
    name: 'Emotion-Detector From Text',
    desc: 'Detects emotions from text using a pretrained DistilRoBERTa model. Built with HuggingFace Transformers and Gradio. Supports 7 emotions: joy, anger, sadness, fear, surprise, disgust, and neutral.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/Emotion-Detector',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['python', 'Gradio','HuggingFace'],
  },
  {
    id: 'proj6',
    name: 'EPG Data Pipeline',
    desc: 'An orchestrated ETL pipeline that ingests and transforms electronic program guide data, using Airflow for scheduling, FastAPI for serving, and PostgreSQL for storage.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/EPG-Data-Pipeline',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['Airflow', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'proj2',
    name: 'AnomCity.AI',
    desc: 'A multi-source urban anomaly detection dashboard fusing traffic, weather, and crime data, using Isolation Forest and LSTM models with a real-time geospatial alert visualization.',
    github: 'GitHub', githubUrl: 'https://github.com/solasas/AnomCity.AI',
    demo: 'Demo',     demoUrl: '',   showDemo: false,
    tags: ['FastAPI', 'React', 'ML'],
  },
  
];

function inlineEditable(
  tag: string,
  value: string,
  isAdmin: boolean,
  onBlur: (v: string) => void,
  className: string
) {
  return React.createElement(tag, {
    contentEditable: isAdmin || undefined,
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: { __html: value },
    onBlur: isAdmin
      ? (e: React.FocusEvent<HTMLElement>) => {
          const v = e.currentTarget.innerText.trim();
          if (v !== value) onBlur(v);
        }
      : undefined,
    className,
  });
}

export default function Projects() {
  const { isAdmin } = useAdmin();
  const [projects, setProjects] = useState<Project[]>(DEFAULTS);
  const [addingTagIn, setAddingTagIn] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) try { setProjects(JSON.parse(raw)); } catch {}
    };
    load();
    window.addEventListener('portfolio-content-loaded', load);
    return () => window.removeEventListener('portfolio-content-loaded', load);
  }, []);

  const persist = (updated: Project[]) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    setProjects(updated);
  };

  const update = (id: string, patch: Partial<Project>) =>
    persist(projects.map(p => (p.id === id ? { ...p, ...patch } : p)));

  const removeProject = (id: string) => persist(projects.filter(p => p.id !== id));

  const addProject = () =>
    persist([
      ...projects,
      {
        id: `proj-${Date.now()}`,
        name: 'New Project',
        desc: 'Describe your project here.',
        github: 'GitHub', githubUrl: '',
        demo: 'Demo',     demoUrl: '',   showDemo: true,
        tags: ['Tag'],
      },
    ]);

  const removeTag = (id: string, idx: number) =>
    update(id, { tags: projects.find(p => p.id === id)!.tags.filter((_, i) => i !== idx) });

  const addTag = (id: string) => {
    const name = (addingTagIn[id] ?? '').trim();
    if (name) update(id, { tags: [...projects.find(p => p.id === id)!.tags, name] });
    setAddingTagIn(prev => ({ ...prev, [id]: undefined }));
  };

  return (
    <section id="projects" className="py-24 bg-warm-bg">
      <div className="max-w-7xl mx-auto px-6">
        <Editable fieldKey="projects-title" defaultContent="Projects" as="h2"
          className="font-heading font-bold text-3xl text-warm-dark tracking-tight mb-2" />
        <Editable fieldKey="projects-subtitle" defaultContent="Things I've built" as="p"
          className="text-sm text-warm-faded mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <article key={p.id} className="relative bg-white border border-warm-border rounded-xl p-6 flex flex-col transition-all duration-200 hover:border-warm-soft hover:-translate-y-0.5">

              {/* Delete project */}
              {isAdmin && (
                <button
                  onClick={() => removeProject(p.id)}
                  title="Remove project"
                  className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded text-warm-faded/50 hover:text-red-400 hover:bg-red-50 transition-colors text-base leading-none"
                >×</button>
              )}

              {/* Project name + link buttons */}
              <div className="flex items-start justify-between gap-3 mb-3">
                {inlineEditable(
                  'h3', p.name, isAdmin,
                  v => update(p.id, { name: v }),
                  'font-heading font-semibold text-[1.0625rem] text-warm-dark leading-tight pr-6 outline-none'
                )}
                <div className="flex gap-1.5 shrink-0">
                  <a
                    href={p.githubUrl || undefined}
                    target={p.githubUrl ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={!p.githubUrl ? e => e.preventDefault() : undefined}
                    className={`text-[0.6875rem] text-warm-accent font-medium px-2 py-1 border border-warm-border rounded transition-colors ${p.githubUrl ? 'hover:bg-warm-light cursor-pointer' : 'opacity-40 cursor-default'}`}
                  >
                    {inlineEditable('span', p.github, isAdmin, v => update(p.id, { github: v }), 'outline-none')}
                  </a>
                  {p.showDemo && (
                    <a
                      href={p.demoUrl || undefined}
                      target={p.demoUrl ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      onClick={!p.demoUrl ? e => e.preventDefault() : undefined}
                      className={`text-[0.6875rem] text-warm-accent font-medium px-2 py-1 border border-warm-border rounded transition-colors ${p.demoUrl ? 'hover:bg-warm-light cursor-pointer' : 'opacity-40 cursor-default'}`}
                    >
                      {inlineEditable('span', p.demo, isAdmin, v => update(p.id, { demo: v }), 'outline-none')}
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              {inlineEditable(
                'p', p.desc, isAdmin,
                v => update(p.id, { desc: v }),
                'text-[0.875rem] text-warm-muted leading-relaxed mb-4 outline-none'
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {p.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-warm-accent bg-warm-light rounded px-2 py-0.5">
                    {tag}
                    {isAdmin && (
                      <button onClick={() => removeTag(p.id, i)} title="Remove tag"
                        className="text-warm-accent/50 hover:text-red-400 transition-colors text-xs leading-none">×</button>
                    )}
                  </span>
                ))}

                {isAdmin && (
                  addingTagIn[p.id] !== undefined ? (
                    <span className="inline-flex items-center rounded border border-warm-accent/50 bg-warm-light/60 text-[0.6875rem] overflow-hidden">
                      <input
                        autoFocus
                        value={addingTagIn[p.id] ?? ''}
                        onChange={e => setAddingTagIn(prev => ({ ...prev, [p.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addTag(p.id);
                          if (e.key === 'Escape') setAddingTagIn(prev => ({ ...prev, [p.id]: undefined }));
                        }}
                        placeholder="Tag"
                        className="pl-2 pr-0.5 py-0.5 bg-transparent outline-none text-warm-text w-16 placeholder:text-warm-faded/60"
                      />
                      <button onClick={() => addTag(p.id)} className="px-1.5 text-warm-accent hover:text-warm-dark transition-colors">✓</button>
                      <button onClick={() => setAddingTagIn(prev => ({ ...prev, [p.id]: undefined }))} className="px-1.5 text-warm-faded hover:text-warm-dark transition-colors">✕</button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setAddingTagIn(prev => ({ ...prev, [p.id]: '' }))}
                      className="text-[0.6875rem] font-medium text-warm-accent/60 border border-dashed border-warm-accent/30 rounded px-2 py-0.5 hover:border-warm-accent hover:text-warm-accent transition-colors"
                    >+ Tag</button>
                  )
                )}
              </div>

              {/* Admin: URL inputs */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-warm-border/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6875rem] text-warm-faded w-14 shrink-0">GitHub</span>
                    <input
                      type="url"
                      value={p.githubUrl}
                      onChange={e => update(p.id, { githubUrl: e.target.value })}
                      placeholder="https://github.com/…"
                      className="flex-1 px-2 py-1 text-[0.75rem] border border-warm-border rounded bg-warm-bg outline-none focus:border-warm-accent text-warm-text placeholder:text-warm-faded/50 transition-colors"
                    />
                  </div>
                  {p.showDemo && (
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6875rem] text-warm-faded w-14 shrink-0">Demo</span>
                      <input
                        type="url"
                        value={p.demoUrl}
                        onChange={e => update(p.id, { demoUrl: e.target.value })}
                        placeholder="https://…"
                        className="flex-1 px-2 py-1 text-[0.75rem] border border-warm-border rounded bg-warm-bg outline-none focus:border-warm-accent text-warm-text placeholder:text-warm-faded/50 transition-colors"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => update(p.id, { showDemo: !p.showDemo })}
                    className="self-start text-[0.6875rem] text-warm-faded/60 hover:text-warm-faded transition-colors"
                  >
                    {p.showDemo ? 'Hide demo link' : 'Show demo link'}
                  </button>
                </div>
              )}
            </article>
          ))}

          {/* Add new project */}
          {isAdmin && (
            <button
              onClick={addProject}
              className="flex items-center justify-center gap-2 border-2 border-dashed border-warm-border hover:border-warm-accent/50 rounded-xl p-6 text-warm-faded hover:text-warm-accent transition-colors group min-h-[160px] bg-white"
            >
              <span className="text-2xl font-light group-hover:scale-110 transition-transform">+</span>
              <span className="text-sm font-medium">Add Project</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}