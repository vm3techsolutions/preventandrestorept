'use client';

import Script from 'next/script';
import { SITE } from '@/lib/site';

// Existing GoHighLevel form embed (same form ID as the live site).
export default function GhlForm() {
  const f = SITE.ghl;
  return (
    <div data-testid="ghl-form">
      <iframe
        src={f.src}
        id={`inline-${f.formId}`}
        title={f.name}
        loading="lazy"
        className="w-full rounded-xl border-0"
        style={{ height: f.height, minHeight: 600 }}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name={f.name}
        data-height={f.height}
        data-layout-iframe-id={`inline-${f.formId}`}
        data-form-id={f.formId}
        data-testid="ghl-form-iframe"
      />
      <Script src={f.script} strategy="lazyOnload" />
      <p className="mt-4 text-sm text-slate-500">
        Form not loading? <a href={f.src} target="_blank" rel="noopener noreferrer" className="font-medium text-teal underline underline-offset-2" data-testid="ghl-form-fallback-link">Open it in a new tab</a> or call <a href={SITE.phoneHref} className="font-medium text-teal">{SITE.phone}</a>.
      </p>
    </div>
  );
}
