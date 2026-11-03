'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { EmptyState, ErrorState, LoadingState, Modal, PageHeader, Pagination } from './ui';

function LeadDetail({ lead, onClose }) {
  const rows = [
    ['Name', lead.fullName], ['Email', lead.email], ['Phone', lead.phone], ['Treatment', lead.treatmentName], ['Location', lead.location || '—'],
    ['PDF', lead.pdfFileName || '—'], ['Downloaded', lead.downloadedAt ? formatDateTime(lead.downloadedAt) : 'Not yet'], ['Submitted', formatDateTime(lead.createdAt)],
  ];
  return (
    <Modal open onClose={onClose} title="Lead details" testId="lead-detail-modal">
      <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="break-all text-navy">{v}</dd></div>)}
      </dl>
    </Modal>
  );
}

export default function PdfLeads() {
  const [query, setQuery] = useState({ page: 1, limit: 25, search: '' });
  const [search, setSearch] = useState('');
  const [state, setState] = useState({ status: 'loading', items: [], pagination: null, error: '' });
  const [open, setOpen] = useState(null);

  const load = () => {
    setState((s) => ({ ...s, status: 'loading' }));
    api.pdfLeads.list(query)
      .then((r) => setState({ status: 'ok', items: r.data, pagination: r.pagination, error: '' }))
      .catch((e) => setState({ status: 'failed', items: [], pagination: null, error: e.message }));
  };
  useEffect(load, [query]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === search ? q : { ...q, search, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div>
      <PageHeader title="PDF Leads" subtitle="Visitors who requested a treatment guide PDF from a What We Treat page." />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/60 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search name, email, phone, treatment or location…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="leads-search-input" />
          </div>
        </div>
        {state.status === 'loading' && !state.items.length && <LoadingState />}
        {state.status === 'failed' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'ok' && !state.items.length && <EmptyState title="No leads found" text={query.search ? 'Try a different search.' : 'Leads appear here when visitors download a treatment guide.'} />}
        {state.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="leads-table">
              <thead><tr>{['Name', 'Email', 'Phone', 'Treatment', 'Location', 'PDF downloaded', 'Submitted'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>
                {state.items.map((l) => (
                  <tr key={l.id} className="cursor-pointer hover:bg-slate-50/70" onClick={() => setOpen(l)} data-testid={`lead-row-${l.id}`}>
                    <td className="td font-medium text-navy"><button type="button" className="text-left hover:text-teal" data-testid={`lead-view-${l.id}`}>{l.fullName}</button></td>
                    <td className="td text-sm">{l.email}</td>
                    <td className="td whitespace-nowrap text-sm">{l.phone}</td>
                    <td className="td text-sm">{l.treatmentName}</td>
                    <td className="td text-sm">{l.location || '—'}</td>
                    <td className="td text-sm"><span className="block">{l.pdfFileName || '—'}</span><span className="text-xs text-slate-500">{l.downloadedAt ? 'Downloaded' : 'Not downloaded'}</span></td>
                    <td className="td whitespace-nowrap text-xs">{formatDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={state.pagination} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </div>
      {open && <LeadDetail lead={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
