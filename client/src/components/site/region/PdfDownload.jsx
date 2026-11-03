'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Download, FileText, Loader2, X } from 'lucide-react';
import { api, apiUrl } from '@/lib/api';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,25}$/;

function validate(f) {
  const e = {};
  const digits = f.phone.replace(/\D/g, '').length;
  if (f.fullName.trim().length < 2) e.fullName = 'Please enter your full name';
  if (!EMAIL.test(f.email.trim())) e.email = 'Please enter a valid email address';
  if (!PHONE.test(f.phone.trim()) || digits < 10 || digits > 15) e.phone = 'Please enter a valid phone number';
  return e;
}

function startDownload(url) {
  const a = document.createElement('a');
  a.href = apiUrl(url);
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function Input({ id, label, error, required, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy">{label}{required && <span className="text-teal" aria-hidden> *</span>}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} required={required}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 read-only:bg-slate-50 read-only:text-slate-600 ${error ? 'border-rose-400' : 'border-slate-300'}`} {...rest} />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-rose-600" data-testid={`${id}-error`}>{error}</p>}
    </div>
  );
}

function LeadModal({ slug, treatmentName, onClose }) {
  const [f, setF] = useState({ fullName: '', email: '', phone: '', location: '', website: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: 'idle', message: '' });
  const box = useRef(null);
  const sending = useRef(false);

  useEffect(() => {
    const prev = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    box.current?.querySelector('input')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const els = [...box.current.querySelectorAll('button, input:not([tabindex="-1"]), a[href]')].filter((el) => !el.disabled);
      const first = els[0]; const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [onClose]);

  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const submit = async (e) => {
    e.preventDefault();
    if (sending.current || state.status === 'success') return;
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    sending.current = true;
    setState({ status: 'loading', message: '' });
    try {
      const { data } = await api.public.submitPdfLead(slug, { ...f, fullName: f.fullName.trim(), email: f.email.trim(), phone: f.phone.trim(), location: f.location.trim() });
      if (data.downloadUrl) startDownload(data.downloadUrl);
      setState({ status: 'success', message: 'Thank you! Your download should start automatically.' });
    } catch (err) {
      sending.current = false;
      setState({ status: 'error', message: err.message || 'Something went wrong. Please try again.' });
    }
  };

  const loading = state.status === 'loading';
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="pdf-lead-title" onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8" data-testid="pdf-lead-modal">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-teal">Treatment guide</p>
            <h2 id="pdf-lead-title" className="mt-1 font-heading text-2xl font-semibold text-navy">Get your free guide</h2>
            <p className="mt-1 text-sm text-slate-600">Tell us where to reach you and your download will start right away.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy" aria-label="Close" data-testid="pdf-lead-close"><X className="h-5 w-5" /></button>
        </div>
        {state.status === 'success' ? (
          <div className="mt-8 text-center" role="status" data-testid="pdf-lead-success">
            <CheckCircle2 className="mx-auto h-12 w-12 text-teal" />
            <p className="mt-4 font-medium text-navy">{state.message}</p>
            <button type="button" onClick={onClose} className="btn-site mt-6 justify-center" data-testid="pdf-lead-done">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-4" data-testid="pdf-lead-form">
            <Input id="lead-fullName" label="Full name" required autoComplete="name" value={f.fullName} onChange={set('fullName')} error={errors.fullName} data-testid="lead-fullname-input" />
            <Input id="lead-email" label="Email" type="email" required autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} data-testid="lead-email-input" />
            <Input id="lead-phone" label="Phone number" type="tel" required autoComplete="tel" value={f.phone} onChange={set('phone')} error={errors.phone} data-testid="lead-phone-input" />
            <Input id="lead-treatment" label="Treatment" value={treatmentName} readOnly aria-readonly="true" data-testid="lead-treatment-input" />
            <Input id="lead-location" label="Location (optional)" autoComplete="address-level2" placeholder="Your city" value={f.location} onChange={set('location')} data-testid="lead-location-input" />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} className="hidden" aria-hidden="true" />
            {state.status === 'error' && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" data-testid="pdf-lead-error">{state.message}</p>}
            <button type="submit" disabled={loading} className="btn-site w-full justify-center disabled:opacity-70" data-testid="pdf-lead-submit">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Download className="h-4 w-4" /> Download PDF</>}
            </button>
            <p className="text-center text-xs text-slate-500">We&rsquo;ll only use your details to follow up about your care.</p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function PdfDownload({ slug, treatmentName, pdf }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:sticky lg:top-28" data-testid="pdf-download-section">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal text-white"><FileText className="h-6 w-6" aria-hidden /></span>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-navy">Download Treatment Guide</h2>
      <p className="mt-2 break-words text-slate-600" data-testid="pdf-download-label">{pdf.label}</p>
      <button type="button" onClick={() => setOpen(true)} className="btn-site mt-6 w-full justify-center" data-testid="pdf-download-button">
        <Download className="h-4 w-4" aria-hidden /> Download PDF
      </button>
      {open && <LeadModal slug={slug} treatmentName={treatmentName} onClose={() => setOpen(false)} />}
    </aside>
  );
}
