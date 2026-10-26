'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Stethoscope, HeartPulse, Files, FolderTree, Tags, ArrowRightLeft, Settings, LogOut, X, UserCog, History, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/services', label: 'Services', icon: Stethoscope },
  { href: '/admin/what-we-treat', label: 'What We Treat', icon: HeartPulse },
  { href: '/admin/pages', label: 'Pages', icon: Files },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/redirects', label: 'URL Redirects', icon: ArrowRightLeft },
  { href: '/admin/admins', label: 'Admins', icon: UserCog },
  { href: '/admin/activity', label: 'Activity Log', icon: History },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const testId = (label) => `nav-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;

export default function Sidebar({ open, onClose, onLogout }) {
  const pathname = usePathname();
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-navy/50 lg:hidden" onClick={onClose} />}
      <aside
        data-testid="admin-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-navy-2 px-6 py-6">
          <Link href="/admin" className="block" data-testid="sidebar-brand">
            <span className="block font-heading text-lg font-bold leading-tight tracking-wide text-white">Prevent &amp; Restore</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.25em] text-teal-100/70">Physical Therapy · CMS</span>
          </Link>
          <button type="button" className="text-slate-300 lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                data-testid={testId(label)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                  active ? 'bg-teal font-medium text-white shadow-sm' : 'text-slate-300 hover:bg-teal-hover/20 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-navy-2 p-3">
          <button
            type="button"
            onClick={onLogout}
            data-testid="nav-logout"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-rose-500/15 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
