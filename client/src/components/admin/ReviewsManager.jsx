'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from './Toast';
import ReviewForm from './ReviewForm';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, PageHeader, Pagination } from './ui';

function Row({ r, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-slate-50/70" data-testid={`review-row-${r.id}`}>
      <td className="td">
        <p className="font-medium text-navy">{r.reviewerName}</p>
        <p className="line-clamp-2 max-w-md text-xs text-slate-500">{r.text}</p>
      </td>
      <td className="td text-xs">{r.rating ? <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{r.rating}</span> : '—'}</td>
      <td className="td text-xs">
        <span className={`rounded-full px-2 py-0.5 font-semibold ${r.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{r.isPublished ? 'Published' : 'Hidden'}</span>
        {r.isFeatured && <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal">Testimonial</span>}
      </td>
      <td className="td hidden text-xs md:table-cell">{r.reviewDate ? formatDate(r.reviewDate) : '—'}<br /><span className="text-slate-400">{r.source}</span></td>
      <td className="td hidden text-xs lg:table-cell">{r.updatedBy?.name || r.updatedBy?.email || '—'}</td>
      <td className="td">
        <div className="flex justify-end gap-1">
          <button type="button" className="btn-ghost p-1.5" aria-label="Edit" onClick={() => onEdit(r)} data-testid={`review-row-${r.id}-edit`}><Pencil className="h-4 w-4" /></button>
          <button type="button" className="btn-ghost p-1.5 hover:text-rose-600" aria-label="Delete" onClick={() => onDelete(r)} data-testid={`review-row-${r.id}-delete`}><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function ReviewsManager() {
  const toast = useToast();
  const [query, setQuery] = useState({ page: 1, limit: 25, search: '' });
  const [state, setState] = useState({ status: 'loading', items: [], pagination: null, error: null });
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const r = await api.reviews.list(query);
      setState({ status: r.data.length ? 'succeeded' : 'empty', items: r.data, pagination: r.pagination, error: null });
    } catch (e) {
      setState((s) => ({ ...s, status: 'failed', error: e.message }));
    }
  }, [query]);
  useEffect(() => {
    load();
  }, [load]);

  const onSaved = () => { setModal(null); toast('Review saved'); load(); };
  const confirmDelete = async () => {
    try {
      await api.reviews.remove(toDelete.id);
      toast('Review deleted');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Genuine client reviews shown on the homepage. Featured reviews appear as large testimonials. Changes appear on the site within about a minute."
        actions={<button type="button" className="btn-primary" onClick={() => setModal({})} data-testid="new-review-button"><Plus className="h-4 w-4" /> New review</button>} />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/60 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search reviews…" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} data-testid="review-search-input" />
          </div>
        </div>
        {state.status === 'loading' && !state.items.length && <LoadingState />}
        {state.status === 'failed' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'empty' && <EmptyState title="No reviews yet" text="Add genuine reviews from your Google Business Profile. The reviews section stays hidden on the website until one is published." />}
        {state.items.length > 0 && state.status !== 'failed' && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="reviews-table">
              <thead><tr><th className="th">Review</th><th className="th">Rating</th><th className="th">Status</th><th className="th hidden md:table-cell">Date / source</th><th className="th hidden lg:table-cell">Last updated by</th><th className="th text-right">Actions</th></tr></thead>
              <tbody>{state.items.map((r) => <Row key={r.id} r={r} onEdit={setModal} onDelete={setToDelete} />)}</tbody>
            </table>
          </div>
        )}
        <Pagination pagination={state.pagination} onPage={(page) => setQuery({ ...query, page })} />
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit review' : 'New review'} testId="review-modal">
        {modal && <ReviewForm initial={modal.id ? modal : null} onSaved={onSaved} onCancel={() => setModal(null)} />}
      </Modal>
      <ConfirmDialog open={!!toDelete} danger title="Delete review?" confirmLabel="Delete" message={`The review by ${toDelete?.reviewerName} will be removed from the website.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
