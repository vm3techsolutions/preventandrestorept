'use client';

import { useSyncExternalStore } from 'react';

const KEY = 'pr-marketing-consent';
const EVT = 'pr-consent-change';

const read = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export function setConsent(value) {
  try { value ? localStorage.setItem(KEY, value) : localStorage.removeItem(KEY); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(EVT));
}

const subscribe = (cb) => {
  window.addEventListener(EVT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener('storage', cb); };
};

// 'granted' | 'denied' | null (not chosen yet) | 'ssr' (server render, unknown)
export const useConsent = () => useSyncExternalStore(subscribe, read, () => 'ssr');
