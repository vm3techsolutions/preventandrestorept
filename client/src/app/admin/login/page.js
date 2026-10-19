import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Sign in · Prevent & Restore PT', robots: { index: false } };

export default function Page() {
  return <Suspense><LoginForm /></Suspense>;
}
