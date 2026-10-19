'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { LoadingState } from './ui';
import { fetchMe, logout, sessionExpired } from '@/store/slices/authSlice';

export default function AdminShell({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { status, admin, expiresAt } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchMe());
  }, [status, dispatch]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  useEffect(() => {
    const onExpired = () => dispatch(sessionExpired());
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const ms = new Date(expiresAt).getTime() - Date.now();
    const t = setTimeout(() => dispatch(sessionExpired()), Math.max(ms, 0));
    return () => clearTimeout(t);
  }, [expiresAt, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/admin/login');
  };

  if (status !== 'authenticated') return <div className="min-h-screen bg-slate-50"><LoadingState label="Checking your session…" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button type="button" className="btn-ghost lg:hidden" onClick={() => setMenuOpen(true)} data-testid="open-menu-button" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:block">Content management</p>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4" data-testid="topbar-user">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-xs font-semibold uppercase text-white">
              {(admin?.name || admin?.email || '?').slice(0, 1)}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-navy">{admin?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-500">{admin?.email}</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
