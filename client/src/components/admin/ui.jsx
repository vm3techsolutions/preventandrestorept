'use client';

import { useState } from 'react';
import { Loader2, Inbox, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-300',
  TRASHED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function StatusBadge({ status, testId }) {
  return (
    <span data-testid={testId} className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', STATUS_STYLES[status])}>
      {status?.toLowerCase()}
    </span>
  );
}

export function Field({ label, hint, error, children, htmlFor, right }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        {label && <label htmlFor={htmlFor} className="label">{label}</label>}
        {right}
      </div>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function PasswordInput({ id, value, onChange, testId, autoComplete = 'current-password', invalid, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange}
        aria-invalid={invalid || undefined} className={cn('input pr-11', invalid && 'border-rose-400')} data-testid={testId} {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:text-teal" data-testid={`${testId}-toggle`}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div data-testid="loading-state" className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <Spinner className="text-teal" /> {label}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-teal-50 p-3 text-teal"><Inbox className="h-6 w-6" /></div>
      <p className="font-heading text-base font-semibold text-navy">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div data-testid="error-state" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-600" />
      <p className="text-sm text-navy">{message}</p>
      {onRetry && <button type="button" className="btn-secondary" onClick={onRetry} data-testid="retry-button">Try again</button>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, testId }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-navy">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-testid={testId}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-teal' : 'bg-slate-300')}
      >
        <span className={cn('absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </label>
  );
}

export function Modal({ open, onClose, title, children, testId, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        data-testid={testId}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('animate-rise w-full rounded-xl bg-white shadow-2xl', wide ? 'max-w-2xl' : 'max-w-md')}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-navy" aria-label="Close" data-testid="modal-close-button">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} testId="confirm-dialog">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} data-testid="confirm-cancel-button">Cancel</button>
        <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={busy} data-testid="confirm-ok-button">
          {busy && <Spinner />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 data-testid="page-title" className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
      <span data-testid="pagination-info">Page {page} of {totalPages} · {total} items</span>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)} data-testid="pagination-prev">Previous</button>
        <button type="button" className="btn-secondary py-1.5" disabled={page >= totalPages} onClick={() => onPage(page + 1)} data-testid="pagination-next">Next</button>
      </div>
    </div>
  );
}
