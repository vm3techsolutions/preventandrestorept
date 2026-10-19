'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Search } from 'lucide-react';
import { CONTENT_TYPES } from '@/lib/contentTypes';
import { contentSlices } from '@/store/slices/contentSlices';
import { taxonomySlices } from '@/store/slices/taxonomySlices';
import { useToast } from './Toast';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from './ui';
import ContentRow from './ContentRow';

const STATUS_OPTIONS = [['', 'All statuses'], ['PUBLISHED', 'Published'], ['DRAFT', 'Draft'], ['ARCHIVED', 'Archived'], ['TRASHED', 'Trash']];
const MESSAGES = { publish: 'Published', unpublish: 'Moved to draft', archive: 'Archived' };

export default function ContentListPage({ typeKey }) {
  const type = CONTENT_TYPES[typeKey];
  const { actions } = contentSlices[typeKey];
  const dispatch = useDispatch();
  const toast = useToast();
  const { items, pagination, listStatus, listError } = useSelector((s) => s[typeKey]);
  const categories = useSelector((s) => s.categories.items);
  const tags = useSelector((s) => s.tags.items);
  const [query, setQuery] = useState({ page: 1, limit: 20, search: '', status: '', category: '', tag: '' });
  const [searchInput, setSearchInput] = useState('');
  const [confirm, setConfirm] = useState(null);
  const isBlog = type.kind === 'blog';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const load = useCallback(() => dispatch(actions.fetchList(query)), [dispatch, actions, query]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === searchInput ? q : { ...q, search: searchInput, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => {
    if (isBlog) {
      dispatch(taxonomySlices.categories.actions.fetchAll());
      dispatch(taxonomySlices.tags.actions.fetchAll());
    }
  }, [isBlog, dispatch]);

  const setFilter = (k) => (e) => setQuery((q) => ({ ...q, [k]: e.target.value, page: 1 }));

  const runAction = async (item, action) => {
    const r = await dispatch(actions.changeStatus({ id: item.id, action }));
    if (r.error) return toast(r.payload?.message || 'Action failed', 'error');
    toast(`${MESSAGES[action]}: ${item.title}`);
    if (query.status) load();
    return null;
  };

  const onConfirm = async () => {
    const { item, kind } = confirm;
    const r = await dispatch(kind === 'delete' ? actions.removeItem(item.id) : actions.restoreItem(item.id));
    setConfirm(null);
    if (r.error) toast(r.payload?.message, 'error');
    else toast(kind === 'delete' ? 'Moved to trash' : 'Restored as draft');
  };

  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    const next = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id));
    dispatch(actions.setOrder(next));
    const r = await dispatch(actions.reorderItems(next));
    if (r.error) {
      toast(r.payload?.message || 'Could not save order', 'error');
      load();
    } else toast('Order saved');
  };

  const dragDisabled = query.status === 'TRASHED';

  return (
    <div>
      <PageHeader
        title={type.plural}
        subtitle={`Drag rows to change the display order on the website.${type.kind === 'page' ? ' Home, About Us, header and footer stay developer-managed.' : ''}`}
        actions={<Link href={`${type.adminPath}/new`} className="btn-primary" data-testid={`new-${typeKey}-button`}><Plus className="h-4 w-4" /> New {type.label.toLowerCase()}</Link>}
      />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/60 p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder={`Search ${type.plural.toLowerCase()}…`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} data-testid="list-search-input" />
          </div>
          <select className="input w-auto" value={query.status} onChange={setFilter('status')} data-testid="list-status-filter">
            {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {isBlog && (
            <>
              <select className="input w-auto" value={query.category} onChange={setFilter('category')} data-testid="list-category-filter">
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="input w-auto" value={query.tag} onChange={setFilter('tag')} data-testid="list-tag-filter">
                <option value="">All tags</option>
                {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </>
          )}
        </div>
        {listStatus === 'loading' && !items.length && <LoadingState />}
        {listStatus === 'failed' && <ErrorState message={listError} onRetry={load} />}
        {listStatus === 'empty' && (
          <EmptyState title={`No ${type.plural.toLowerCase()} found`} text="Try a different search or filter, or create a new one." />
        )}
        {items.length > 0 && listStatus !== 'failed' && (
          <div className="overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <table className="w-full border-collapse" data-testid={`${typeKey}-table`}>
                <thead>
                  <tr>
                    <th className="th w-10" aria-label="Reorder" />
                    <th className="th">Title</th>
                    <th className="th">Status</th>
                    {isBlog && <th className="th hidden md:table-cell">Author</th>}
                    {isBlog && <th className="th hidden lg:table-cell">Categories</th>}
                    <th className="th hidden sm:table-cell">{isBlog ? 'Published' : 'Updated'}</th>
                    <th className="th text-right">Actions</th>
                  </tr>
                </thead>
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy} disabled={dragDisabled}>
                  <tbody>
                    {items.map((item) => (
                      <ContentRow key={item.id} item={item} type={type} trashed={query.status === 'TRASHED'} dragDisabled={dragDisabled}
                        onAction={runAction} onDelete={() => setConfirm({ item, kind: 'delete' })} onRestore={() => setConfirm({ item, kind: 'restore' })} />
                    ))}
                  </tbody>
                </SortableContext>
              </table>
            </DndContext>
          </div>
        )}
        <Pagination pagination={pagination} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </div>
      <ConfirmDialog
        open={!!confirm}
        danger={confirm?.kind === 'delete'}
        title={confirm?.kind === 'delete' ? `Move to trash?` : 'Restore item?'}
        message={confirm?.kind === 'delete'
          ? `"${confirm?.item.title}" will be removed from the website and admin lists. It can be restored from the Trash filter.`
          : `"${confirm?.item.title}" will be restored as a draft.`}
        confirmLabel={confirm?.kind === 'delete' ? 'Move to trash' : 'Restore'}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
