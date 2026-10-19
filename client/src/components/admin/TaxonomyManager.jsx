'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { taxonomySlices } from '@/store/slices/taxonomySlices';
import { slugify } from '@/lib/utils';
import { useToast } from './Toast';
import { ConfirmDialog, EmptyState, ErrorState, Field, LoadingState, Spinner } from './ui';

const FIELDS = {
  categories: [['description', 'Description', 'textarea']],
  tags: [['description', 'Description', 'textarea']],
  authors: [['credentials', 'Credentials', 'input'], ['bio', 'Bio', 'textarea']],
};
const LABEL = { categories: 'category', tags: 'tag', authors: 'author' };
const blank = (kind) => ({ name: '', slug: '', ...Object.fromEntries(FIELDS[kind].map(([k]) => [k, ''])) });

export default function TaxonomyManager({ kind }) {
  const { actions } = taxonomySlices[kind];
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, status, error } = useSelector((s) => s[kind]);
  const [form, setForm] = useState(blank(kind));
  const [editing, setEditing] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const noun = LABEL[kind];

  useEffect(() => {
    dispatch(actions.fetchAll());
  }, [dispatch, actions]);

  const reset = () => { setForm(blank(kind)); setEditing(null); setSlugTouched(false); };
  const startEdit = (item) => {
    setEditing(item.id);
    setSlugTouched(true);
    setForm(Object.fromEntries(Object.keys(blank(kind)).map((k) => [k, item[k] || ''])));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const r = await dispatch(editing ? actions.updateItem({ id: editing, body: form }) : actions.createItem(form));
    setSaving(false);
    if (r.error) return toast(r.payload?.message, 'error');
    toast(editing ? `Updated ${noun}` : `Created ${noun}`);
    return reset();
  };

  const confirmDelete = async () => {
    const r = await dispatch(actions.deleteItem(toDelete.id));
    setToDelete(null);
    if (r.error) toast(r.payload?.message, 'error');
    else toast(`Deleted ${noun}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="card h-fit space-y-4 p-6" data-testid={`${kind}-form`}>
        <h2 className="text-lg font-semibold">{editing ? `Edit ${noun}` : `Add ${noun}`}</h2>
        <Field label="Name" htmlFor={`${kind}-name`}>
          <input id={`${kind}-name`} required className="input" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} data-testid={`${kind}-name-input`} />
        </Field>
        <Field label="Slug" htmlFor={`${kind}-slug`}>
          <input id={`${kind}-slug`} className="input font-mono text-xs" value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }} data-testid={`${kind}-slug-input`} />
        </Field>
        {FIELDS[kind].map(([k, label, el]) => (
          <Field key={k} label={label} htmlFor={`${kind}-${k}`}>
            {el === 'textarea'
              ? <textarea id={`${kind}-${k}`} className="input min-h-[80px]" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} data-testid={`${kind}-${k}-input`} />
              : <input id={`${kind}-${k}`} className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} data-testid={`${kind}-${k}-input`} />}
          </Field>
        ))}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={saving} data-testid={`${kind}-submit-button`}>{saving ? <Spinner /> : <Plus className="h-4 w-4" />} {editing ? 'Save' : 'Add'}</button>
          {editing && <button type="button" className="btn-secondary" onClick={reset} data-testid={`${kind}-cancel-edit`}>Cancel</button>}
        </div>
      </form>
      <div className="card overflow-hidden">
        {status === 'loading' && !items.length && <LoadingState />}
        {status === 'failed' && <ErrorState message={error} onRetry={() => dispatch(actions.fetchAll())} />}
        {status === 'empty' && <EmptyState title={`No ${kind} yet`} text={`Add your first ${noun} using the form.`} />}
        {items.length > 0 && (
          <table className="w-full" data-testid={`${kind}-table`}>
            <thead><tr><th className="th">Name</th><th className="th">Slug</th><th className="th">Blogs</th><th className="th text-right">Actions</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70" data-testid={`${kind}-row-${item.id}`}>
                  <td className="td font-medium text-navy">{item.name}{item.credentials ? <span className="ml-1 text-xs text-slate-500">{item.credentials}</span> : null}</td>
                  <td className="td font-mono text-xs">{item.slug}</td>
                  <td className="td" data-testid={`${kind}-row-${item.id}-count`}>{item.blogCount}</td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <button type="button" className="btn-ghost p-1.5" aria-label="Edit" onClick={() => startEdit(item)} data-testid={`${kind}-row-${item.id}-edit`}><Pencil className="h-4 w-4" /></button>
                      <button type="button" className="btn-ghost p-1.5 hover:text-rose-600" aria-label="Delete" onClick={() => setToDelete(item)} data-testid={`${kind}-row-${item.id}-delete`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ConfirmDialog open={!!toDelete} danger title={`Delete ${noun}?`} confirmLabel="Delete" onCancel={() => setToDelete(null)} onConfirm={confirmDelete}
        message={toDelete?.blogCount ? `"${toDelete.name}" is used by ${toDelete.blogCount} blog(s). The server will block deletion until it is removed from them.` : `"${toDelete?.name}" will be permanently deleted.`} />
    </div>
  );
}
