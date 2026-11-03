'use client';

import Link from 'next/link';
import { setConsent, useConsent } from '@/lib/consent';

export default function CookieConsent() {
  const consent = useConsent();
  if (consent !== null) return null;
  return (
    <div role="dialog" aria-live="polite" aria-labelledby="cookie-consent-title" className="fixed inset-x-4 bottom-4 z-[60] max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-navy/20 sm:left-6 sm:right-auto" data-testid="cookie-consent-banner">
      <p id="cookie-consent-title" className="font-heading font-semibold text-navy">Your privacy choices</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        With your permission, we use the Meta Pixel to measure how visitors find us through our advertising. You can change this anytime from &ldquo;Cookie preferences&rdquo; in the footer. See our <Link href="/privacy-policy/" className="font-medium text-teal underline hover:text-teal-hover">Privacy Policy</Link>.
      </p>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => setConsent('granted')} className="btn-site flex-1 justify-center py-2.5" data-testid="cookie-consent-accept">Accept</button>
        <button type="button" onClick={() => setConsent('denied')} className="btn-site-outline flex-1 justify-center py-2.5" data-testid="cookie-consent-decline">Decline</button>
      </div>
    </div>
  );
}

export function CookiePreferencesButton() {
  return (
    <button type="button" onClick={() => setConsent(null)} className="footer-link" data-testid="footer-cookie-preferences">Cookie preferences</button>
  );
}
