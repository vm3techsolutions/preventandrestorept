import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Prevent & Restore Physical Therapy',
  description: 'Prevent & Restore Physical Therapy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
