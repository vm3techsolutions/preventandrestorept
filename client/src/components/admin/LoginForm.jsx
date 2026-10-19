'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { checkSetup, fetchMe, login } from '@/store/slices/authSlice';
import { Spinner } from './ui';
import AuthLayout from './AuthLayout';

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const { status, submitting, error, setupRequired } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const next = params.get('next');
  const target = next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin';

  useEffect(() => {
    dispatch(checkSetup());
    if (status === 'idle') dispatch(fetchMe());
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'authenticated') router.replace(target);
  }, [status, router, target]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <AuthLayout title="Sign in" subtitle="Admin access for Prevent & Restore Physical Therapy content.">
      {setupRequired && (
        <div data-testid="setup-required-notice" className="mb-5 rounded-lg border border-teal/30 bg-teal-50 p-3 text-sm text-navy">
          No administrator exists yet. <Link href="/admin/setup" className="font-semibold text-teal underline" data-testid="go-to-setup-link">Complete initial setup</Link>.
        </div>
      )}
      <form onSubmit={submit} className="space-y-5" data-testid="login-form">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="username" required className="input" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="login-email-input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" required className="input" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="login-password-input" />
        </div>
        {error && <p data-testid="login-error" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting} data-testid="login-submit-button">
          {submitting ? <Spinner /> : <Lock className="h-4 w-4" />} Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
