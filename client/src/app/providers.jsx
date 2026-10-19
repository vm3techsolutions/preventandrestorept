'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import { ToastProvider } from '@/components/admin/Toast';

export default function Providers({ children }) {
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
