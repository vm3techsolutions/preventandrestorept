
'use client';

import Script from 'next/script';
import { SITE } from '@/lib/site';

export default function GhlForm() {
  return (
    <div className="w-full min-w-0" data-testid="ghl-form">
      <iframe
        src="https://link.clinicalmarketer.com/widget/form/JaIRNs6LlJ0QqpFaxSLk"
        id="inline-JaIRNs6LlJ0QqpFaxSLk"
        title="Website Availability & Pricing Form"
        loading="lazy"
        style={{
          width: '100%',
          height: '959px',
          border: 'none',
          borderRadius: '4px',
          display: 'block',
        }}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Website Availability & Pricing Form"
        data-height="959"
        data-layout-iframe-id="inline-JaIRNs6LlJ0QqpFaxSLk"
        data-form-id="JaIRNs6LlJ0QqpFaxSLk"
        data-cookie-consent="true"
        data-cookie-consent-provider="auto"
        data-testid="ghl-form-iframe"
      />

      <Script
        src="https://link.clinicalmarketer.com/js/form_embed.js"
        strategy="afterInteractive"
      />

      <p className="mt-4 text-sm text-slate-500">
        Form not loading?{' '}
        <a
          href="https://link.clinicalmarketer.com/widget/form/JaIRNs6LlJ0QqpFaxSLk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-teal underline underline-offset-2"
        >
          Open it in a new tab
        </a>
        {' '}or call{' '}
        <a href={SITE.phoneHref} className="font-medium text-teal">
          {SITE.phone}
        </a>.
      </p>
    </div>
  );
}
