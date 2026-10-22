'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { fetchActivity } from '@/store/slices/activitySlice';
import { formatDateTime } from '@/lib/utils';
import { EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from './ui';
import { ACTIONS, TYPES, ActionBadge, ActivityDetails, ActivityItem } from './ActivityParts';

const BLANK = { page: 1, limit: 25, adminId: '', entityType: '', action: '', from: '', to: '', search: '' };

export default function ActivityLog() {
  const dispatch = useDispatch();
  const { items, pagination, status, error } = useSelector((s) => s.activity);
  const [query, setQuery] = useState(BLANK);
  const [search, setSearch] = useState('');
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    api.admins.list({ limit: 100 }).then((r) => setAdmins(r.data)).catch(() => setAdmins([]));
  }, []);
  useEffect(() => {
    dispatch(fetchActivity({ ...query, tzOffset: new Date().getTimezoneOffset() }));
  }, [dispatch, query]);
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === search ? q : { ...q, search, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const set = (k) => (e) => setQuery((q) => ({ ...q, [k]: e.target.value, page: 1 }));
  const reset = () => { setSearch(''); setQuery(BLANK); };
  const filtered = Object.entries(query).some(([k, v]) => !['page', 'limit'].includes(k) && v);

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Every change made in the CMS: who made it, what changed and when." />
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50/60 p-4" data-testid="activity-filters">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search item or admin…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="activity-search-input" />
          </div>
          <select className="input w-auto" value={query.adminId} onChange={set('adminId')} data-testid="activity-admin-filter">
            <option value="">All admins</option>
            {admins.map((a) => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
          </select>
          <select className="input w-auto" value={query.entityType} onChange={set('entityType')} data-testid="activity-type-filter">
            <option value="">All areas</option>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input w-auto" value={query.action} onChange={set('action')} data-testid="activity-action-filter">
            <option value="">All actions</option>
            {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">From
            <input type="date" max={query.to || undefined} className="input w-auto font-normal normal-case tracking-normal" value={query.from} onChange={set('from')} data-testid="activity-from-filter" />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">To
            <input type="date" min={query.from || undefined} className="input w-auto font-normal normal-case tracking-normal" value={query.to} onChange={set('to')} data-testid="activity-to-filter" />
          </label>
          {filtered && <button type="button" className="btn-ghost" onClick={reset} data-testid="activity-reset-filters"><RotateCcw className="h-4 w-4" /> Reset</button>}
        </div>
        {status === 'loading' && !items.length && <LoadingState />}
        {status === 'failed' && <ErrorState message={error} onRetry={() => dispatch(fetchActivity({ ...query, tzOffset: new Date().getTimezoneOffset() }))} />}
        {status === 'empty' && <EmptyState title="No activity found" text={filtered ? 'Try different filters.' : 'Changes made in the CMS will appear here.'} />}
        {items.length > 0 && status !== 'failed' && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="activity-table">
              <thead><tr><th className="th">When</th><th className="th">Admin</th><th className="th">Action</th><th className="th">Item</th><th className="th">Details</th></tr></thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70" data-testid={`activity-row-${log.id}`}>
                    <td className="td whitespace-nowrap text-xs" data-testid={`activity-row-${log.id}-when`}>{formatDateTime(log.createdAt)}</td>
                    <td className="td" data-testid={`activity-row-${log.id}-admin`}>
                      <span className="block font-medium text-navy">{log.adminName}</span>
                      <span className="text-xs text-slate-500">{log.adminEmail}{log.adminId ? ` · ID ${log.adminId}` : ''}</span>
                    </td>
                    <td className="td"><ActionBadge action={log.action} testId={`activity-row-${log.id}-action`} /></td>
                    <td className="td max-w-[320px]"><ActivityItem log={log} /></td>
                    <td className="td max-w-[360px]" data-testid={`activity-row-${log.id}-details`}><ActivityDetails log={log} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={(page) => setQuery((q) => ({ ...q, page }))} />
      </div>
    </div>
  );
}
