import AdminShell from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin · Prevent & Restore PT', robots: { index: false, follow: false } };

export default function PanelLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
