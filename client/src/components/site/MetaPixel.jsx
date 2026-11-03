'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/lib/consent';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
let lastTracked = null;

// Supplied Meta Pixel base code; the `if (f.fbq) return` guard keeps it to one load.
function loadPixel() {
  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  if (!window.__prPixelInit) { window.fbq('init', PIXEL_ID); window.__prPixelInit = true; }
}

export default function MetaPixel() {
  const consent = useConsent();
  const pathname = usePathname();

  useEffect(() => {
    if (PIXEL_ID && consent !== 'granted' && window.fbq) window.fbq('consent', 'revoke');
  }, [consent]);

  useEffect(() => {
    if (!PIXEL_ID || consent !== 'granted') return;
    loadPixel();
    window.fbq('consent', 'grant');
    if (lastTracked === pathname) return;
    lastTracked = pathname;
    window.fbq('track', 'PageView');
  }, [consent, pathname]);

  return null;
}
