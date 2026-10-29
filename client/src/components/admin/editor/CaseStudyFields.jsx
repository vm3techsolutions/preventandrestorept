'use client';

import { Field, Toggle } from '../ui';

const GLANCE = [['primaryConcern', 'Primary concern'], ['patientGoal', 'Patient goal'], ['careApproach', 'Care approach'], ['outcomeSummary', 'Outcome (summary)']];
const STORY = [['challenge', '01 · The Challenge'], ['assessment', '02 · The Assessment'], ['plan', '03 · The Personalized Plan'], ['progress', '04 · Progress Over Time'], ['outcome', '05 · The Outcome'], ['takeaways', '06 · Key Takeaways']];

// Case study fields. Leave anything unapproved empty; empty fields are hidden on the website.
export default function CaseStudyFields({ form, set }) {
  return (
    <div className="space-y-5" data-testid="case-study-fields">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Use approved, non-identifying details only. Do not include names, dates of birth or other identifying information.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {GLANCE.map(([k, l]) => (
          <Field key={k} label={l} htmlFor={k}><input id={k} className="input" value={form[k] || ''} onChange={(e) => set({ [k]: e.target.value })} data-testid={`case-${k}-input`} /></Field>
        ))}
      </div>
      {STORY.map(([k, l]) => (
        <Field key={k} label={l} htmlFor={k} hint="Separate paragraphs with a blank line.">
          <textarea id={k} className="input min-h-[110px]" value={form[k] || ''} onChange={(e) => set({ [k]: e.target.value })} data-testid={`case-${k}-input`} />
        </Field>
      ))}
      <Field label="Clinician (optional)" htmlFor="clinician"><input id="clinician" className="input" value={form.clinician || ''} onChange={(e) => set({ clinician: e.target.value })} data-testid="case-clinician-input" /></Field>
      <Toggle label="Show the Assess → Plan → Progress → Reassess diagram" checked={form.showApproach} onChange={(v) => set({ showApproach: v })} testId="case-approach-toggle" />
    </div>
  );
}
