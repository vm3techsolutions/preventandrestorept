'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { UserPlus } from 'lucide-react';
import { createAdmin } from '@/store/slices/adminsSlice';
import { Field, PasswordInput, Spinner } from './ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERR = ({ id, msg }) => (msg ? <p className="mt-1 text-xs text-rose-600" data-testid={id}>{msg}</p> : null);

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Full name is required';
  if (!f.email.trim()) e.email = 'Email address is required';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (!f.password) e.password = 'Password is required';
  else if (f.password.length < 10 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = 'At least 10 characters, including letters and numbers';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  return e;
}

export default function CreateAdminForm({ onDone, onCancel }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setServerError('');
    if (Object.keys(v).length) return;
    setSaving(true);
    const r = await dispatch(createAdmin({ name: form.name.trim(), email: form.email.trim(), password: form.password }));
    setSaving(false);
    if (r.error) {
      if (r.payload?.status === 409) setErrors({ email: r.payload.message });
      else setServerError(r.payload?.message || 'Could not create admin');
      return;
    }
    onDone(r.payload);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4" data-testid="create-admin-form">
      <Field label="Full name" htmlFor="admin-name">
        <input id="admin-name" className={`input ${errors.name ? 'border-rose-400' : ''}`} value={form.name} onChange={set('name')} data-testid="create-admin-name-input" />
        <ERR id="create-admin-name-error" msg={errors.name} />
      </Field>
      <Field label="Email address" htmlFor="admin-email">
        <input id="admin-email" type="email" className={`input ${errors.email ? 'border-rose-400' : ''}`} value={form.email} onChange={set('email')} data-testid="create-admin-email-input" />
        <ERR id="create-admin-email-error" msg={errors.email} />
      </Field>
      <Field label="Password" htmlFor="admin-password">
        <PasswordInput id="admin-password" autoComplete="new-password" value={form.password} onChange={set('password')} invalid={!!errors.password} testId="create-admin-password-input" />
        <ERR id="create-admin-password-error" msg={errors.password} />
      </Field>
      <Field label="Confirm password" htmlFor="admin-confirm">
        <PasswordInput id="admin-confirm" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} invalid={!!errors.confirm} testId="create-admin-confirm-input" />
        <ERR id="create-admin-confirm-error" msg={errors.confirm} />
      </Field>
      {serverError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" data-testid="create-admin-server-error">{serverError}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} data-testid="create-admin-cancel-button">Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving} data-testid="create-admin-submit-button">{saving ? <Spinner /> : <UserPlus className="h-4 w-4" />} Create admin</button>
      </div>
    </form>
  );
}
