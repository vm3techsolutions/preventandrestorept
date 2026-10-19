'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, CheckCircle2, PencilLine, Stethoscope, HeartPulse, Files, ArrowRightLeft, Plus } from 'lucide-react';
import { fetchDashboard } from '@/store/slices/dashboardSlice';
import { ErrorState, LoadingState, PageHeader, StatusBadge } from './ui';
import { formatDate } from '@/lib/utils';

function StatCard({ label, value, sub, icon: Icon, href, testId, accent }) {
  return (
    <Link href={href} data-testid={testId} className="card group flex items-center justify-between p-6 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-teal/40">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 font-heading text-3xl font-bold text-navy" data-testid={`${testId}-value`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
      <div className={`rounded-xl p-3 ${accent || 'bg-teal-50 text-teal'} transition-colors group-hover:bg-teal group-hover:text-white`}>
        <Icon className="h-5 w-5" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, status, error } = useSelector((s) => s.dashboard);
  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of the website content stored in PostgreSQL."
        actions={<Link href="/admin/blogs/new" className="btn-primary" data-testid="dashboard-new-blog-button"><Plus className="h-4 w-4" /> New blog</Link>}
      />
      {status === 'loading' && !stats && <LoadingState />}
      {status === 'failed' && <ErrorState message={error} onRetry={() => dispatch(fetchDashboard())} />}
      {stats && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total blogs" value={stats.blogs.total} sub={`${stats.blogs.archived} archived`} icon={FileText} href="/admin/blogs" testId="stat-total-blogs" />
            <StatCard label="Published blogs" value={stats.blogs.published} icon={CheckCircle2} href="/admin/blogs" testId="stat-published-blogs" accent="bg-emerald-50 text-emerald-700" />
            <StatCard label="Draft blogs" value={stats.blogs.draft} icon={PencilLine} href="/admin/blogs" testId="stat-draft-blogs" accent="bg-amber-50 text-amber-700" />
            <StatCard label="Services" value={stats.services.total} sub={`${stats.services.published} published`} icon={Stethoscope} href="/admin/services" testId="stat-services" />
            <StatCard label="What We Treat" value={stats.treatments.total} sub={`${stats.treatments.published} published`} icon={HeartPulse} href="/admin/what-we-treat" testId="stat-treatments" />
            <StatCard label="CMS pages" value={stats.pages.total} sub={`${stats.pages.published} published`} icon={Files} href="/admin/pages" testId="stat-pages" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold">Recently updated blogs</h2>
                <Link href="/admin/blogs" className="text-sm font-medium text-teal hover:text-teal-hover" data-testid="dashboard-view-blogs-link">View all</Link>
              </div>
              <ul className="divide-y divide-slate-100" data-testid="recent-blogs-list">
                {stats.recentBlogs.length === 0 && <li className="px-6 py-8 text-sm text-slate-500">No blogs yet.</li>}
                {stats.recentBlogs.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <Link href={`/admin/blogs/${b.id}`} className="line-clamp-1 text-sm font-medium text-navy hover:text-teal" data-testid={`recent-blog-${b.id}`}>{b.title}</Link>
                    <div className="flex shrink-0 items-center gap-3"><span className="text-xs text-slate-400">{formatDate(b.updatedAt)}</span><StatusBadge status={b.status} /></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-lg font-semibold">Site structure</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[['Blog categories', stats.categories, '/admin/categories'], ['Blog tags', stats.tags, '/admin/tags'], ['Active redirects', stats.redirects, '/admin/redirects']].map(([k, v, href]) => (
                  <div key={k} className="flex items-center justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd><Link href={href} className="font-semibold text-navy hover:text-teal" data-testid={`structure-${k.toLowerCase().replace(/\s+/g, '-')}`}>{v}</Link></dd>
                  </div>
                ))}
              </dl>
              <Link href="/admin/redirects" className="btn-secondary mt-6 w-full" data-testid="dashboard-manage-redirects"><ArrowRightLeft className="h-4 w-4" /> Manage redirects</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
