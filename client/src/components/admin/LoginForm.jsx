'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { checkSetup, clearAuthError, fetchMe, login } from '@/store/slices/authSlice';
import { PasswordInput, Spinner } from './ui';
import AuthLayout from './AuthLayout';

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const { status, submitting, error, setupRequired } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
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
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    if (!Object.keys(next).length) dispatch(login({ email: form.email.trim(), password: form.password }));
  };
  const update = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
    if (error) dispatch(clearAuthError());
  };

  return (
    <AuthLayout title="Sign in" subtitle="Admin access for Prevent & Restore Physical Therapy content.">
      {setupRequired && (
        <div data-testid="setup-required-notice" className="mb-5 rounded-lg border border-teal/30 bg-teal-50 p-3 text-sm text-navy">
          No administrator exists yet. <Link href="/admin/setup" className="font-semibold text-teal underline" data-testid="go-to-setup-link">Complete initial setup</Link>.
        </div>
      )}
      <form onSubmit={submit} noValidate className="space-y-5" data-testid="login-form">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email || undefined} className={`input ${errors.email ? 'border-rose-400' : ''}`}
            value={form.email} onChange={update('email')} data-testid="login-email-input" />
          {errors.email && <p className="mt-1 text-xs text-rose-600" data-testid="login-email-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput id="password" value={form.password} onChange={update('password')} invalid={!!errors.password} testId="login-password-input" />
          {errors.password && <p className="mt-1 text-xs text-rose-600" data-testid="login-password-error">{errors.password}</p>}
        </div>
        {error && <p data-testid="login-error" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting} data-testid="login-submit-button">
          {submitting ? <Spinner /> : <Lock className="h-4 w-4" />} Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
