'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { checkSetup, setupAdmin } from '@/store/slices/authSlice';
import { LoadingState, Spinner } from './ui';
import AuthLayout from './AuthLayout';

export default function SetupForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { setupRequired, submitting, error, status } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ token: '', name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(checkSetup());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin');
  }, [status, router]);

  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const submit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setLocalError('Passwords do not match');
    setLocalError('');
    const { confirm, ...body } = form;
    return dispatch(setupAdmin(body));
  };

  if (setupRequired === null) return <LoadingState />;
  if (!setupRequired) {
    return (
      <AuthLayout title="Setup complete" subtitle="An administrator account already exists. Initial setup is disabled.">
        <Link href="/admin/login" className="btn-primary w-full py-3" data-testid="setup-disabled-login-link">Go to sign in</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Initial setup" subtitle="Create the first administrator. The one-time setup token is printed in the server log (or run `yarn setup:token`). It expires after 24 hours.">
      <form onSubmit={submit} className="space-y-4" data-testid="setup-form">
        <div><label className="label" htmlFor="token">Setup token</label><input id="token" required className="input font-mono" {...field('token')} data-testid="setup-token-input" /></div>
        <div><label className="label" htmlFor="name">Name</label><input id="name" className="input" {...field('name')} data-testid="setup-name-input" /></div>
        <div><label className="label" htmlFor="semail">Email</label><input id="semail" type="email" required className="input" {...field('email')} data-testid="setup-email-input" /></div>
        <div><label className="label" htmlFor="spw">Password</label><input id="spw" type="password" required minLength={10} className="input" {...field('password')} data-testid="setup-password-input" /></div>
        <div><label className="label" htmlFor="spw2">Confirm password</label><input id="spw2" type="password" required className="input" {...field('confirm')} data-testid="setup-confirm-input" /></div>
        <p className="text-xs text-slate-500">At least 10 characters, including letters and numbers.</p>
        {(localError || error) && <p data-testid="setup-error" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{localError || error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={submitting} data-testid="setup-submit-button">
          {submitting ? <Spinner /> : <KeyRound className="h-4 w-4" />} Create administrator
        </button>
      </form>
    </AuthLayout>
  );
}
