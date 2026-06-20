'use client';

import Editable from '@/components/Editable';

const entries = [
  {
    yearKey: 'edu-1-year',
    defaultYear: '2023 — 2027',
    degreeKey: 'edu-1-degree',
    defaultDegree: 'B.Tech in Computer Science & Engineering',
    instKey: 'edu-1-inst',
    defaultInst: 'Vellore Institute of Technology - AP',
    detailKey: 'edu-1-detail',
    defaultDetail: 'CGPA: 8.53 / 10 · Coursework: Data Structures, Algorithms, DBMS, OS, Networks',
  },
  {
    yearKey: 'edu-2-year',
    defaultYear: '2021 — 2023',
    degreeKey: 'edu-2-degree',
    defaultDegree: 'Class XII',
    instKey: 'edu-2-inst',
    defaultInst: 'Sri Chaitanya Junior College - Vijayawada',
    detailKey: 'edu-2-detail',
    defaultDetail: 'Percentage: 96.5% · Stream: PCM (Physics, Chemistry, Mathematics)',
  },
  {
    yearKey: 'edu-3-year',
    defaultYear: '2009 — 2021',
    degreeKey: 'edu-3-degree',
    defaultDegree: 'Class X',
    instKey: 'edu-3-inst',
    defaultInst: 'St. Claret High School ',
    detailKey: 'edu-3-detail',
    defaultDetail: '',
  }
];

export default function Education() {
  return (
    <section id="education" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <Editable
          fieldKey="edu-title"
          defaultContent="Education"
          as="h2"
          className="font-heading font-bold text-3xl text-warm-dark tracking-tight mb-2"
        />
        <Editable
          fieldKey="edu-subtitle"
          defaultContent="Academic background"
          as="p"
          className="text-sm text-warm-faded mb-12"
        />

        <div className="border-l-2 border-warm-border ml-2">
          {entries.map((e, i) => (
            <div
              key={e.yearKey}
              className={`relative pl-8 pb-10 ${i === entries.length - 1 ? 'pb-0' : ''}`}
            >
              {/* Timeline dot */}
              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-warm-border border-2 border-white" />

              <Editable
                fieldKey={e.yearKey}
                defaultContent={e.defaultYear}
                as="span"
                className="text-[0.8125rem] text-warm-faded font-medium"
              />
              <Editable
                fieldKey={e.degreeKey}
                defaultContent={e.defaultDegree}
                as="h3"
                className="font-heading font-semibold text-warm-dark mt-1 mb-0.5"
              />
              <Editable
                fieldKey={e.instKey}
                defaultContent={e.defaultInst}
                as="p"
                className="text-sm text-warm-accent font-medium mb-1.5"
              />
              <Editable
                fieldKey={e.detailKey}
                defaultContent={e.defaultDetail}
                as="p"
                className="text-[0.8125rem] text-warm-faded leading-relaxed"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
