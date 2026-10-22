'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, UserCheck, UserX, KeyRound } from 'lucide-react';
import { fetchAdmins, setAdminStatus } from '@/store/slices/adminsSlice';
import { formatDate } from '@/lib/utils';
import { useToast } from './Toast';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, PageHeader, Pagination } from './ui';
import CreateAdminForm from './CreateAdminForm';
import ResetPasswordForm from './ResetPasswordForm';

function StatusPill({ active, testId }) {
  return (
    <span data-testid={testId} className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-slate-100 text-slate-500'}`}>
      {active ? 'Active' : 'Deactivated'}
    </span>
  );
}

export default function AdminsManager() {
  const dispatch = useDispatch();
  const toast = useToast();
  const me = useSelector((s) => s.auth.admin);
  const { items, pagination, status, error } = useSelector((s) => s.admins);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [toggle, setToggle] = useState(null);
  const [resetting, setResetting] = useState(null);

  useEffect(() => {
    dispatch(fetchAdmins({ page, limit: 25 }));
  }, [dispatch, page]);

  const confirmToggle = async () => {
    const r = await dispatch(setAdminStatus({ id: toggle.id, isActive: !toggle.isActive }));
    setToggle(null);
    if (r.error) toast(r.payload?.message, 'error');
    else toast(r.payload.isActive ? `${r.payload.name || r.payload.email} activated` : `${r.payload.name || r.payload.email} deactivated and signed out`);
  };

  return (
    <div>
      <PageHeader title="Admins" subtitle="Everyone listed here can sign in to the CMS. Deactivated admins are signed out and cannot log in."
        actions={<button type="button" className="btn-primary" onClick={() => setCreating(true)} data-testid="add-admin-button"><UserPlus className="h-4 w-4" /> Add admin</button>} />
      <div className="card overflow-hidden">
        {status === 'loading' && !items.length && <LoadingState />}
        {status === 'failed' && <ErrorState message={error} onRetry={() => dispatch(fetchAdmins({ page, limit: 25 }))} />}
        {status === 'empty' && <EmptyState title="No admins found" />}
        {items.length > 0 && status !== 'failed' && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="admins-table">
              <thead><tr><th className="th">ID</th><th className="th">Full name</th><th className="th">Email</th><th className="th">Status</th><th className="th hidden md:table-cell">Created</th><th className="th text-right">Actions</th></tr></thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70" data-testid={`admin-row-${a.id}`}>
                    <td className="td font-mono text-xs" data-testid={`admin-row-${a.id}-id`}>{a.id}</td>
                    <td className="td font-medium text-navy" data-testid={`admin-row-${a.id}-name`}>
                      {a.name || '—'}{a.id === me?.id && <span className="ml-2 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal">You</span>}
                      {a.isOwner && <span className="ml-2 rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white" data-testid={`admin-row-${a.id}-owner-badge`}>Owner</span>}
                    </td>
                    <td className="td" data-testid={`admin-row-${a.id}-email`}>{a.email}</td>
                    <td className="td"><StatusPill active={a.isActive} testId={`admin-row-${a.id}-status`} /></td>
                    <td className="td hidden text-xs md:table-cell" data-testid={`admin-row-${a.id}-created`}>{formatDate(a.createdAt)}</td>
                    <td className="td text-right">
                      {a.id !== me?.id && a.isOwner && !me?.isOwner && (
                        <span className="text-xs text-slate-500" data-testid={`admin-row-${a.id}-owner-protected`}>Protected owner account</span>
                      )}
                      {a.id !== me?.id && (!a.isOwner || me?.isOwner) && (
                        <div className="flex justify-end gap-1">
                          <button type="button" className="btn-ghost" onClick={() => setResetting(a)} data-testid={`admin-row-${a.id}-reset-password`}>
                            <KeyRound className="h-4 w-4" /> Reset password
                          </button>
                          <button type="button" className={`btn-ghost ${a.isActive ? 'hover:text-rose-600' : 'text-teal'}`} onClick={() => setToggle(a)} data-testid={`admin-row-${a.id}-toggle-status`}>
                            {a.isActive ? <><UserX className="h-4 w-4" /> Deactivate</> : <><UserCheck className="h-4 w-4" /> Activate</>}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPage} />
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title="Add admin" testId="create-admin-modal">
        {creating && <CreateAdminForm onCancel={() => setCreating(false)} onDone={(a) => { setCreating(false); toast(`Admin ${a.email} created`); }} />}
      </Modal>
      <Modal open={!!resetting} onClose={() => setResetting(null)} title="Reset password" testId="reset-password-modal">
        {resetting && <ResetPasswordForm admin={resetting} onCancel={() => setResetting(null)} onDone={(a) => { setResetting(null); toast(`Password reset for ${a.email}`); }} />}
      </Modal>
      <ConfirmDialog open={!!toggle} danger={toggle?.isActive} title={toggle?.isActive ? 'Deactivate admin?' : 'Activate admin?'}
        confirmLabel={toggle?.isActive ? 'Deactivate' : 'Activate'} onConfirm={confirmToggle} onCancel={() => setToggle(null)}
        message={toggle?.isActive ? `${toggle?.email} will be signed out immediately and won't be able to log in.` : `${toggle?.email} will be able to sign in again.`} />
    </div>
  );
}
