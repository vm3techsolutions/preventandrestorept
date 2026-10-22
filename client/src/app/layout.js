import './globals.css';
import Providers from './providers';
import { SITE } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: 'One-on-one physical therapy in Marietta, GA. Relieve pain, rebuild strength, and protect your future health.',
  icons: { icon: '/icon.png' },
};

export const viewport = { themeColor: '#001D39' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
