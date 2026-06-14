'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import Editable from '@/components/Editable';

const STORE_KEY = 'portfolio_v1_skills-data';

interface SkillCat {
  id: string;
  title: string;
  skills: string[];
}

const DEFAULTS: SkillCat[] = [
  { id: 'cat1', title: 'Languages',              skills: ['Python', 'Java', 'JavaScript'] },
  { id: 'cat2', title: 'Web & Frameworks',        skills: ['HTML/CSS', 'React', 'Next.js', 'REST APIs', 'Spring Boot'] },
  { id: 'cat3', title: 'Databases',               skills: ['Postgres', 'MySQL', 'MongoDB', 'H2'] },
  { id: 'cat4', title: 'Cloud & DevOps',          skills: ['AWS', 'Docker', 'Git'] },
  { id: 'cat5', title: 'Other Platforms & Tools', skills: ['Postman', 'Maven', 'Rstudio'] },
];

export default function Skills() {
  const { isAdmin } = useAdmin();
  const [cats, setCats] = useState<SkillCat[]>(DEFAULTS);
  const [addingSkillIn, setAddingSkillIn] = useState<Record<string, string | undefined>>({});
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) try { setCats(JSON.parse(raw)); } catch {}
    };
    load();
    window.addEventListener('portfolio-content-loaded', load);
    return () => window.removeEventListener('portfolio-content-loaded', load);
  }, []);

  const persist = (updated: SkillCat[]) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(updated));
    setCats(updated);
  };

  const updateTitle = (id: string, title: string) =>
    persist(cats.map(c => (c.id === id ? { ...c, title } : c)));

  const removeCategory = (id: string) =>
    persist(cats.filter(c => c.id !== id));

  const addCategory = () => {
    const title = newCatName.trim();
    if (title) persist([...cats, { id: `cat-${Date.now()}`, title, skills: [] }]);
    setAddingCat(false);
    setNewCatName('');
  };

  const removeSkill = (id: string, idx: number) =>
    persist(cats.map(c => (c.id === id ? { ...c, skills: c.skills.filter((_, i) => i !== idx) } : c)));

  const addSkill = (id: string) => {
    const name = (addingSkillIn[id] ?? '').trim();
    if (name) persist(cats.map(c => (c.id === id ? { ...c, skills: [...c.skills, name] } : c)));
    setAddingSkillIn(prev => ({ ...prev, [id]: undefined }));
  };

  return (
    <section id="skills" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <Editable fieldKey="skills-title" defaultContent="Skills" as="h2"
          className="font-heading font-bold text-3xl text-warm-dark tracking-tight mb-2" />
        <Editable fieldKey="skills-subtitle" defaultContent="Technologies and tools I work with" as="p"
          className="text-sm text-warm-faded mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cats.map(cat => (
            <div key={cat.id} className="relative bg-warm-bg border border-warm-border rounded-xl p-6">

              {/* Delete category */}
              {isAdmin && (
                <button
                  onClick={() => removeCategory(cat.id)}
                  title="Remove category"
                  className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded text-warm-faded/50 hover:text-red-400 hover:bg-red-50 transition-colors text-base leading-none"
                >×</button>
              )}

              {/* Editable category title */}
              {React.createElement('h3', {
                key: cat.id + '-title',
                contentEditable: isAdmin || undefined,
                suppressContentEditableWarning: true,
                dangerouslySetInnerHTML: { __html: cat.title },
                onBlur: isAdmin
                  ? (e: React.FocusEvent<HTMLHeadingElement>) => {
                      const v = e.currentTarget.innerText.trim();
                      if (v !== cat.title) updateTitle(cat.id, v);
                    }
                  : undefined,
                className: 'text-[0.75rem] font-semibold text-warm-accent uppercase tracking-[0.08em] mb-4 pr-5 outline-none',
              })}

              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-warm-border text-[0.8125rem] text-warm-muted">
                    {skill}
                    {isAdmin && (
                      <button onClick={() => removeSkill(cat.id, i)} title="Remove"
                        className="ml-0.5 text-warm-faded hover:text-red-400 transition-colors text-xs leading-none">×</button>
                    )}
                  </span>
                ))}

                {/* Add skill */}
                {isAdmin && (
                  addingSkillIn[cat.id] !== undefined ? (
                    <span className="inline-flex items-center rounded-full border border-warm-accent/50 bg-warm-light/60 text-[0.8125rem] overflow-hidden">
                      <input
                        autoFocus
                        value={addingSkillIn[cat.id] ?? ''}
                        onChange={e => setAddingSkillIn(prev => ({ ...prev, [cat.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') addSkill(cat.id);
                          if (e.key === 'Escape') setAddingSkillIn(prev => ({ ...prev, [cat.id]: undefined }));
                        }}
                        placeholder="Skill name"
                        className="pl-3 pr-1 py-1 bg-transparent outline-none text-warm-text w-24 placeholder:text-warm-faded/60"
                      />
                      <button onClick={() => addSkill(cat.id)} className="px-2 py-1 text-warm-accent hover:text-warm-dark transition-colors font-medium">✓</button>
                      <button onClick={() => setAddingSkillIn(prev => ({ ...prev, [cat.id]: undefined }))} className="px-2 py-1 text-warm-faded hover:text-warm-dark transition-colors">✕</button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setAddingSkillIn(prev => ({ ...prev, [cat.id]: '' }))}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-warm-accent/40 text-warm-accent/70 text-[0.8125rem] hover:border-warm-accent hover:text-warm-accent transition-colors"
                    >+ Add</button>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Add new category card */}
          {isAdmin && (
            addingCat ? (
              <div className="bg-warm-bg border-2 border-dashed border-warm-accent/40 rounded-xl p-6 flex flex-col gap-3">
                <p className="text-[0.75rem] font-semibold text-warm-faded uppercase tracking-[0.08em]">New Category</p>
                <input
                  autoFocus
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addCategory();
                    if (e.key === 'Escape') { setAddingCat(false); setNewCatName(''); }
                  }}
                  placeholder="e.g. Design Tools"
                  className="w-full px-3 py-2 border border-warm-border rounded-lg text-sm bg-white outline-none focus:border-warm-accent text-warm-text placeholder:text-warm-faded/60"
                />
                <div className="flex gap-2">
                  <button onClick={addCategory} className="flex-1 py-1.5 bg-warm-accent text-white rounded-lg text-xs font-medium hover:opacity-85 transition-opacity">Add</button>
                  <button onClick={() => { setAddingCat(false); setNewCatName(''); }} className="flex-1 py-1.5 border border-warm-border text-warm-muted rounded-lg text-xs hover:border-warm-soft transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCat(true)}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-warm-border hover:border-warm-accent/50 rounded-xl p-6 text-warm-faded hover:text-warm-accent transition-colors group min-h-[80px]"
              >
                <span className="text-2xl font-light group-hover:scale-110 transition-transform">+</span>
                <span className="text-sm font-medium">Add Category</span>
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
