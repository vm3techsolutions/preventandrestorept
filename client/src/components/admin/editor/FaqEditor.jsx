'use client';

import { Plus, Trash2 } from 'lucide-react';

export default function FaqEditor({ faqs, onChange }) {
  const setAt = (i, patch) => onChange(faqs.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  return (
    <div className="space-y-3" data-testid="faq-editor">
      {faqs.length === 0 && <p className="text-sm text-slate-500">No FAQs yet.</p>}
      {faqs.map((f, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
          <div className="flex gap-2">
            <input className="input" placeholder="Question" value={f.question} onChange={(e) => setAt(i, { question: e.target.value })} data-testid={`faq-${i}-question`} />
            <button type="button" className="btn-ghost hover:text-rose-600" aria-label="Remove FAQ" onClick={() => onChange(faqs.filter((_, j) => j !== i))} data-testid={`faq-${i}-remove`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea className="input min-h-[70px]" placeholder="Answer" value={f.answer} onChange={(e) => setAt(i, { answer: e.target.value })} data-testid={`faq-${i}-answer`} />
        </div>
      ))}
      <button type="button" className="btn-secondary py-2" onClick={() => onChange([...faqs, { question: '', answer: '' }])} data-testid="faq-add-button">
        <Plus className="h-4 w-4" /> Add FAQ
      </button>
    </div>
  );
}
