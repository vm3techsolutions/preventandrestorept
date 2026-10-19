'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from './Toast';
import { ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, Modal, PageHeader, Pagination, Spinner, Toggle } from './ui';

const BLANK = { fromPath: '', toPath: '', statusCode: 301, isActive: true, note: '' };

function RedirectForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || BLANK);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, statusCode: Number(form.statusCode) };
      const r = initial?.id ? await api.redirects.update(initial.id, body) : await api.redirects.create(body);
      onSaved(r.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4" data-testid="redirect-form">
      <Field label="Old path" htmlFor="fromPath" hint="e.g. /knee-pain/ — trailing slashes and case are normalized.">
        <input id="fromPath" required className="input font-mono text-xs" value={form.fromPath} onChange={(e) => setForm({ ...form, fromPath: e.target.value })} data-testid="redirect-from-input" />
      </Field>
      <Field label="Destination" htmlFor="toPath" hint="A path like /what-we-treat/knee-pain or a full URL.">
        <input id="toPath" required className="input font-mono text-xs" value={form.toPath} onChange={(e) => setForm({ ...form, toPath: e.target.value })} data-testid="redirect-to-input" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="statusCode">
          <select id="statusCode" className="input" value={form.statusCode} onChange={(e) => setForm({ ...form, statusCode: e.target.value })} data-testid="redirect-status-select">
            <option value={301}>301 Permanent</option><option value={302}>302 Temporary</option><option value={307}>307 Temporary</option><option value={308}>308 Permanent</option>
          </select>
        </Field>
        <div className="flex items-end pb-2"><Toggle label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} testId="redirect-active-toggle" /></div>
      </div>
      <Field label="Note" htmlFor="note"><input id="note" className="input" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} data-testid="redirect-note-input" /></Field>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" data-testid="redirect-form-error">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} data-testid="redirect-cancel-button">Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving} data-testid="redirect-save-button">{saving && <Spinner />} Save redirect</button>
      </div>
    </form>
  );
}

export default function RedirectsManager() {
  const toast = useToast();
  const [query, setQuery] = useState({ page: 1, limit: 25, search: '' });
  const [state, setState] = useState({ status: 'loading', items: [], pagination: null, error: null });
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const r = await api.redirects.list(query);
      setState({ status: r.data.length ? 'succeeded' : 'empty', items: r.data, pagination: r.pagination, error: null });
    } catch (e) {
      setState((s) => ({ ...s, status: 'failed', error: e.message }));
    }
  }, [query]);
  useEffect(() => {
    load();
  }, [load]);

  const onSaved = () => { setModal(null); toast('Redirect saved'); load(); };
  const confirmDelete = async () => {
    try {
      await api.redirects.remove(toDelete.id);
      toast('Redirect removed');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader title="URL Redirects" subtitle="Preserve old URLs. Loops and chains are rejected automatically; changing a published slug creates a 301 here."
        actions={<button type="button" className="btn-primary" onClick={() => setModal({})} data-testid="new-redirect-button"><Plus className="h-4 w-4" /> New redirect</button>} />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/60 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search paths…" value={query.search} onChange={(e) => setQuery({ ...query, search: e.target.value, page: 1 })} data-testid="redirect-search-input" />
          </div>
        </div>
        {state.status === 'loading' && !state.items.length && <LoadingState />}
        {state.status === 'failed' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'empty' && <EmptyState title="No redirects" text="Create one to send an old URL to its new home." />}
        {state.items.length > 0 && state.status !== 'failed' && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="redirects-table">
              <thead><tr><th className="th">Old path</th><th className="th">Destination</th><th className="th">Status</th><th className="th hidden md:table-cell">Updated</th><th className="th text-right">Actions</th></tr></thead>
              <tbody>
                {state.items.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70" data-testid={`redirect-row-${r.id}`}>
                    <td className="td font-mono text-xs text-navy">{r.fromPath}</td>
                    <td className="td font-mono text-xs"><span className="inline-flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-teal" />{r.toPath}</span></td>
                    <td className="td text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-navy">{r.statusCode}</span>
                      {!r.isActive && <span className="ml-2 text-slate-400">inactive</span>}
                    </td>
                    <td className="td hidden text-xs md:table-cell">{formatDate(r.updatedAt)}</td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="btn-ghost p-1.5" aria-label="Edit" onClick={() => setModal(r)} data-testid={`redirect-row-${r.id}-edit`}><Pencil className="h-4 w-4" /></button>
                        <button type="button" className="btn-ghost p-1.5 hover:text-rose-600" aria-label="Delete" onClick={() => setToDelete(r)} data-testid={`redirect-row-${r.id}-delete`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={state.pagination} onPage={(page) => setQuery({ ...query, page })} />
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.id ? 'Edit redirect' : 'New redirect'} testId="redirect-modal">
        {modal && <RedirectForm initial={modal.id ? modal : null} onSaved={onSaved} onCancel={() => setModal(null)} />}
      </Modal>
      <ConfirmDialog open={!!toDelete} danger title="Remove redirect?" confirmLabel="Remove" message={`${toDelete?.fromPath} will no longer redirect.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
