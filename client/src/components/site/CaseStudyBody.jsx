import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Paras } from './RegionSections';
import { withSlash } from '@/lib/seo';

const STEPS = ['Assess', 'Plan', 'Progress', 'Reassess'];
const STORY = [['challenge', 'The Challenge'], ['assessment', 'The Assessment'], ['plan', 'The Personalized Plan'], ['progress', 'Progress Over Time'], ['outcome', 'The Outcome'], ['takeaways', 'Key Takeaways']];

function Glance({ cs }) {
  const items = [['Primary concern', cs.primaryConcern], ['Patient goal', cs.patientGoal], ['Care approach', cs.careApproach], ['Outcome', cs.outcomeSummary]].filter(([, v]) => v);
  if (!items.length) return null;
  return (
    <section aria-labelledby="glance-h" className="rounded-2xl bg-navy p-6 text-white sm:p-8" data-testid="case-glance">
      <h2 id="glance-h" className="eyebrow text-teal-100">Case at a glance</h2>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">{items.map(([k, v]) => <div key={k}><dt className="text-sm text-slate-400">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}</dl>
    </section>
  );
}

export function ApproachDiagram() {
  return (
    <figure className="rounded-2xl border border-slate-200 p-6" data-testid="case-approach-diagram">
      <figcaption className="eyebrow text-teal">Clinical approach</figcaption>
      <ol className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3 md:flex-1">
            <span className="flex flex-1 items-center gap-3 rounded-xl bg-navy px-4 py-3 font-semibold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm">{i + 1}</span>{s}</span>
            {i < STEPS.length - 1 && <ArrowRight className="hidden h-5 w-5 shrink-0 text-teal md:block" aria-hidden />}
          </li>
        ))}
      </ol>
    </figure>
  );
}

// Case study body (shared by the public page and the admin preview). Empty fields are omitted.
export default function CaseStudyBody({ cs }) {
  let n = 0;
  return (
    <div className="space-y-12" data-testid="case-body">
      <Glance cs={cs} />
      {STORY.map(([k, label]) => {
        if (!cs[k] && !(k === 'plan' && cs.showApproach)) return null;
        n += 1;
        return (
          <section key={k} aria-labelledby={`case-${k}`} data-testid={`case-section-${k}`}>
            <p className="eyebrow text-teal">{String(n).padStart(2, '0')}</p>
            <h2 id={`case-${k}`} className="mt-2 font-heading text-2xl font-semibold text-navy sm:text-3xl">{label}</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-700 md:text-lg"><Paras text={cs[k]} /></div>
            {k === 'plan' && cs.showApproach && <div className="mt-8"><ApproachDiagram /></div>}
            {k === 'takeaways' && [...(cs.relatedServices || []), ...(cs.relatedConditions || [])].length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {[...(cs.relatedServices || []), ...(cs.relatedConditions || [])].map((r) => <Link key={r.path} href={withSlash(r.path)} className="rounded-full border border-teal/30 px-3 py-1 text-sm font-medium text-teal hover:bg-teal-50">{r.title}</Link>)}
              </div>
            )}
          </section>
        );
      })}
      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Individual results vary. This case study describes one person’s experience and is not a guarantee of results.</p>
    </div>
  );
}
