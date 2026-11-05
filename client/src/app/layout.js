
import GhlStickyForm from '@/components/site/GhlStickyForm';
import './globals.css';
import Providers from './providers';
import { SITE } from '@/lib/site';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description:
    'One-on-one physical therapy in Marietta, GA. Relieve pain, rebuild strength, and protect your future health.',
  icons: {
    icon: '/icon.png',
  },
};

export const viewport = {
  themeColor: '#001D39',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-K57J2LTH');
            `,
          }}
        />
      </head>

      <body>

        {/* Google Tag Manager - No JavaScript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K57J2LTH"
            height="0"
            width="0"
            style={{
              display: 'none',
              visibility: 'hidden',
            }}
            title="Google Tag Manager"
          />
        </noscript>

        <Providers>
          {children}
        </Providers>

        <GhlStickyForm/>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '1128906485316283');
            fbq('track', 'PageView');
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1128906485316283&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

      </body>
    </html>
  );
}
