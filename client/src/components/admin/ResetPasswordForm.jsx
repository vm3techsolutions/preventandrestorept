'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { KeyRound } from 'lucide-react';
import { resetAdminPassword } from '@/store/slices/adminsSlice';
import { Field, PasswordInput, Spinner } from './ui';

export default function ResetPasswordForm({ admin, onDone, onCancel }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.password) v.password = 'New password is required';
    else if (form.password.length < 10 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) v.password = 'At least 10 characters, including letters and numbers';
    if (form.confirm !== form.password) v.confirm = 'Passwords do not match';
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    const r = await dispatch(resetAdminPassword({ id: admin.id, newPassword: form.password }));
    setSaving(false);
    if (r.error) setErrors({ server: r.payload?.message || 'Could not reset password' });
    else onDone(r.payload);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4" data-testid="reset-password-form">
      <p className="text-sm text-slate-600">Set a new password for <span className="font-medium text-navy">{admin.email}</span>. They will be signed out of any open sessions.</p>
      <Field label="New password" htmlFor="reset-pw" error={errors.password}>
        <PasswordInput id="reset-pw" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} invalid={!!errors.password} testId="reset-password-input" />
      </Field>
      <Field label="Confirm new password" htmlFor="reset-pw2" error={errors.confirm}>
        <PasswordInput id="reset-pw2" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} invalid={!!errors.confirm} testId="reset-password-confirm-input" />
      </Field>
      {errors.server && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" data-testid="reset-password-server-error">{errors.server}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} data-testid="reset-password-cancel-button">Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving} data-testid="reset-password-submit-button">{saving ? <Spinner /> : <KeyRound className="h-4 w-4" />} Reset password</button>
      </div>
    </form>
  );
}
