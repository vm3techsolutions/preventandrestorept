'use client';

import { Plus, X } from 'lucide-react';
import RichText from './RichText';
import ImageField from './ImageField';

const Input = (props) => <input className="input" {...props} />;

function ListFields({ data, onChange, testId }) {
  const setItem = (i, v) => onChange({ ...data, items: data.items.map((x, j) => (j === i ? v : x)) });
  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        {['unordered', 'ordered'].map((s) => (
          <button key={s} type="button" onClick={() => onChange({ ...data, style: s })} data-testid={`${testId}-style-${s}`}
            className={`rounded-full border px-3 py-1 ${data.style === s ? 'border-teal bg-teal text-white' : 'border-slate-300 text-slate-600'}`}>
            {s === 'ordered' ? 'Numbered' : 'Bulleted'}
          </button>
        ))}
      </div>
      {data.items.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} className="flex items-start gap-2">
          <span className="mt-9 w-5 text-right text-xs text-slate-400">{data.style === 'ordered' ? `${i + 1}.` : '•'}</span>
          <div className="flex-1"><RichText singleLine value={item} onChange={(v) => setItem(i, v)} placeholder="List item" testId={`${testId}-item-${i}`} /></div>
          <button type="button" className="mt-9 text-slate-400 hover:text-rose-600" aria-label="Remove item" onClick={() => onChange({ ...data, items: data.items.filter((_, j) => j !== i) })} data-testid={`${testId}-remove-item-${i}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" className="btn-ghost text-teal" onClick={() => onChange({ ...data, items: [...data.items, ''] })} data-testid={`${testId}-add-item`}>
        <Plus className="h-4 w-4" /> Add item
      </button>
    </div>
  );
}

export default function BlockFields({ block, onChange, folder, testId }) {
  const { type, data } = block;
  const set = (patch) => onChange({ ...data, ...patch });
  switch (type) {
    case 'heading':
      return <Input value={data.text} onChange={(e) => set({ text: e.target.value })} placeholder={`Heading ${data.level}`} data-testid={`${testId}-text`} />;
    case 'paragraph':
      return <RichText value={data.html} onChange={(html) => set({ html })} placeholder="Write a paragraph…" testId={`${testId}-html`} />;
    case 'list':
      return <ListFields data={data} onChange={onChange} testId={testId} />;
    case 'image':
      return <ImageField value={data} onChange={(v) => onChange({ ...data, ...v })} folder={folder} showCaption testId={`${testId}-image`} />;
    case 'quote':
      return (
        <div className="space-y-2">
          <textarea className="input min-h-[80px]" value={data.text} onChange={(e) => set({ text: e.target.value })} placeholder="Quote text" data-testid={`${testId}-text`} />
          <Input value={data.cite} onChange={(e) => set({ cite: e.target.value })} placeholder="Attribution (optional)" data-testid={`${testId}-cite`} />
        </div>
      );
    case 'cta':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input value={data.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="CTA heading (optional)" data-testid={`${testId}-heading`} /></div>
          <div className="sm:col-span-2"><textarea className="input min-h-[60px]" value={data.text} onChange={(e) => set({ text: e.target.value })} placeholder="Supporting text (optional)" data-testid={`${testId}-text`} /></div>
          <Input value={data.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} placeholder="Button label" data-testid={`${testId}-button-label`} />
          <Input value={data.buttonUrl} onChange={(e) => set({ buttonUrl: e.target.value })} placeholder="/request-appointment/ or https://…" data-testid={`${testId}-button-url`} />
        </div>
      );
    case 'disclaimer':
      return <textarea className="input min-h-[80px] bg-amber-50/40" value={data.text} onChange={(e) => set({ text: e.target.value })} placeholder="Medical disclaimer text" data-testid={`${testId}-text`} />;
    default:
      return null;
  }
}
