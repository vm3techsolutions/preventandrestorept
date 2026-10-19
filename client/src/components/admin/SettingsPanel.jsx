'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Save, KeyRound, Cloud, HardDrive } from 'lucide-react';
import { api } from '@/lib/api';
import { changePassword } from '@/store/slices/authSlice';
import { useToast } from './Toast';
import { Field, LoadingState, PageHeader, Spinner } from './ui';
import TaxonomyManager from './TaxonomyManager';

function GeneralSettings({ initial }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.settings.update(form);
      toast('Settings saved');
    } catch (err) {
      toast(err.message, 'error');
    }
    setSaving(false);
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" data-testid="general-settings-form">
      <h2 className="text-lg font-semibold">SEO defaults</h2>
      <Field label="Site name" htmlFor="siteName" hint="Appended to page titles when no SEO title is set.">
        <input id="siteName" required className="input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} data-testid="settings-site-name-input" />
      </Field>
      <Field label="Default meta description" htmlFor="defMeta">
        <textarea id="defMeta" className="input min-h-[80px]" value={form.defaultMetaDescription} onChange={(e) => setForm({ ...form, defaultMetaDescription: e.target.value })} data-testid="settings-meta-description-input" />
      </Field>
      <Field label="Default social image URL" htmlFor="defOg">
        <input id="defOg" className="input" value={form.defaultOgImage} onChange={(e) => setForm({ ...form, defaultOgImage: e.target.value })} data-testid="settings-og-image-input" />
      </Field>
      <button type="submit" className="btn-primary" disabled={saving} data-testid="settings-save-button">{saving ? <Spinner /> : <Save className="h-4 w-4" />} Save settings</button>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useDispatch();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const submit = async (e) => {
    e.preventDefault();
    const r = await dispatch(changePassword(form));
    if (r.error) return toast(r.payload?.message, 'error');
    setForm({ currentPassword: '', newPassword: '' });
    return toast('Password updated. Other sessions were signed out.');
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" data-testid="password-form">
      <h2 className="text-lg font-semibold">Change password</h2>
      <Field label="Current password" htmlFor="curpw"><input id="curpw" type="password" required className="input" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} data-testid="current-password-input" /></Field>
      <Field label="New password" htmlFor="newpw" hint="At least 10 characters with letters and numbers."><input id="newpw" type="password" required minLength={10} className="input" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} data-testid="new-password-input" /></Field>
      <button type="submit" className="btn-navy" data-testid="change-password-button"><KeyRound className="h-4 w-4" /> Update password</button>
    </form>
  );
}

export default function SettingsPanel() {
  const admin = useSelector((s) => s.auth.admin);
  const [data, setData] = useState(null);
  useEffect(() => {
    api.settings.get().then((r) => setData(r.data)).catch(() => setData({ error: true }));
  }, []);
  if (!data) return <LoadingState />;
  const sys = data.system || {};
  return (
    <div>
      <PageHeader title="Settings" subtitle="Global branding, header, footer, Home and About Us remain developer-managed." />
      <div className="grid gap-6 lg:grid-cols-2">
        {data.general && <GeneralSettings initial={data.general} />}
        <div className="space-y-6">
          <div className="card space-y-3 p-6 text-sm" data-testid="system-info">
            <h2 className="text-lg font-semibold">System</h2>
            <div className="flex justify-between"><span className="text-slate-500">Signed in as</span><span className="font-medium text-navy">{admin?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Public site URL</span><span className="font-mono text-xs">{sys.siteUrl}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Session length</span><span>{sys.sessionTtlHours} hours</span></div>
            <div className="flex items-center justify-between" data-testid="storage-status">
              <span className="text-slate-500">Image storage</span>
              {sys.s3Configured
                ? <span className="inline-flex items-center gap-1.5 text-emerald-700"><Cloud className="h-4 w-4" /> Amazon S3</span>
                : <span className="inline-flex items-center gap-1.5 text-amber-700"><HardDrive className="h-4 w-4" /> Local disk (S3 not configured)</span>}
            </div>
            {!sys.s3Configured && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Uploads are stored on the API server until AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in server/.env.</p>}
          </div>
          <PasswordForm />
        </div>
      </div>
      <h2 className="mb-4 mt-10 text-xl font-semibold">Authors</h2>
      <TaxonomyManager kind="authors" />
    </div>
  );
}
