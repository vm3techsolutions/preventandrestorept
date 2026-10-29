'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { uid } from '@/lib/utils';
import { Field } from '../ui';
import ImageField from './ImageField';
import FaqEditor from './FaqEditor';

const blank = () => ({ id: uid(), heading: '', description: '', symptoms: '', howPtHelps: '', imageUrl: '', imageAlt: '', faqs: [], relatedServiceIds: [], ctaLabel: '', ctaUrl: '' });

function useServices() {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.content('services').list({ limit: 100 }).then((r) => setList(r.data)).catch(() => setList([]));
  }, []);
  return list;
}

function SectionCard({ s, i, total, services, update, move, remove }) {
  const set = (patch) => update(i, { ...s, ...patch });
  const toggle = (id) => set({ relatedServiceIds: s.relatedServiceIds.includes(id) ? s.relatedServiceIds.filter((x) => x !== id) : [...s.relatedServiceIds, id] });
  const tid = `section-${i}`;
  return (
    <div className="rounded-xl border border-slate-200 p-5" data-testid={tid}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Condition {i + 1}</span>
        <div className="flex gap-1">
          <button type="button" className="btn-ghost p-1.5" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" data-testid={`${tid}-up`}><ArrowUp className="h-4 w-4" /></button>
          <button type="button" className="btn-ghost p-1.5" disabled={i === total - 1} onClick={() => move(i, 1)} aria-label="Move down" data-testid={`${tid}-down`}><ArrowDown className="h-4 w-4" /></button>
          <button type="button" className="btn-ghost p-1.5 hover:text-rose-600" onClick={() => remove(i)} aria-label="Remove section" data-testid={`${tid}-remove`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="space-y-4">
        <Field label="Heading" htmlFor={`${tid}-heading`}>
          <input id={`${tid}-heading`} className={`input ${!s.heading.trim() ? 'border-rose-300' : ''}`} value={s.heading} onChange={(e) => set({ heading: e.target.value })} data-testid={`${tid}-heading`} />
        </Field>
        <Field label="Description" htmlFor={`${tid}-desc`}><textarea id={`${tid}-desc`} className="input min-h-[80px]" value={s.description || ''} onChange={(e) => set({ description: e.target.value })} data-testid={`${tid}-description`} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Common symptoms" htmlFor={`${tid}-sym`}><textarea id={`${tid}-sym`} className="input min-h-[80px]" value={s.symptoms || ''} onChange={(e) => set({ symptoms: e.target.value })} data-testid={`${tid}-symptoms`} /></Field>
          <Field label="How PT may help" htmlFor={`${tid}-pt`}><textarea id={`${tid}-pt`} className="input min-h-[80px]" value={s.howPtHelps || ''} onChange={(e) => set({ howPtHelps: e.target.value })} data-testid={`${tid}-pt`} /></Field>
        </div>
        <details className="rounded-lg bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-navy">Image, related services, FAQs and CTA (optional)</summary>
          <div className="mt-4 space-y-4">
            <ImageField folder="treatments" testId={`${tid}-image`} value={{ url: s.imageUrl, alt: s.imageAlt }} onChange={(v) => set({ imageUrl: v.url, imageAlt: v.alt })} />
            <div>
              <p className="label">Related services</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((sv) => (
                  <label key={sv.id} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${s.relatedServiceIds.includes(sv.id) ? 'border-teal bg-teal-50 text-teal' : 'border-slate-200 text-slate-600'}`}>
                    <input type="checkbox" className="sr-only" checked={s.relatedServiceIds.includes(sv.id)} onChange={() => toggle(sv.id)} />{sv.title}
                  </label>
                ))}
              </div>
            </div>
            <FaqEditor faqs={s.faqs} onChange={(faqs) => set({ faqs })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTA label" htmlFor={`${tid}-ctal`}><input id={`${tid}-ctal`} className="input" value={s.ctaLabel || ''} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
              <Field label="CTA URL" htmlFor={`${tid}-ctau`}><input id={`${tid}-ctau`} className="input" value={s.ctaUrl || ''} onChange={(e) => set({ ctaUrl: e.target.value })} /></Field>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default function SectionsEditor({ sections, onChange }) {
  const services = useServices();
  const update = (i, s) => onChange(sections.map((x, j) => (j === i ? s : x)));
  const move = (i, d) => {
    const next = [...sections];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(sections.filter((_, j) => j !== i));
  return (
    <div className="space-y-4" data-testid="sections-editor">
      {sections.length === 0 && <p className="text-sm text-slate-500">No condition sections yet.</p>}
      {sections.map((s, i) => <SectionCard key={s.id || i} s={s} i={i} total={sections.length} services={services} update={update} move={move} remove={remove} />)}
      <button type="button" className="btn-secondary" onClick={() => onChange([...sections, blank()])} data-testid="add-section-button"><Plus className="h-4 w-4" /> Add condition section</button>
    </div>
  );
}
