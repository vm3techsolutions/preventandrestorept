'use client';

import { useState } from 'react';
import { Check, Search } from 'lucide-react';

export default function MultiSelect({ options, value, onChange, testId, emptyText = 'Nothing to select yet.' }) {
  const [q, setQ] = useState('');
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="rounded-lg border border-slate-300" data-testid={testId}>
      {options.length > 6 && (
        <div className="relative border-b border-slate-100">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input className="w-full rounded-t-lg py-2 pl-8 pr-3 text-sm outline-none" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} data-testid={`${testId}-filter`} />
        </div>
      )}
      <ul className="max-h-48 overflow-y-auto p-1">
        {shown.length === 0 && <li className="px-2 py-2 text-xs text-slate-500">{emptyText}</li>}
        {shown.map((o) => {
          const on = value.includes(o.id);
          return (
            <li key={o.id}>
              <button type="button" onClick={() => toggle(o.id)} data-testid={`${testId}-option-${o.id}`}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${on ? 'bg-teal-50 text-navy' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-teal bg-teal text-white' : 'border-slate-300'}`}>{on && <Check className="h-3 w-3" />}</span>
                <span className="line-clamp-1">{o.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
