import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gh-stats-plum-five.vercel.app'),
  title: { default: 'gh-stats — Your work deserves a better README', template: '%s · gh-stats' },
  description: 'Turn your GitHub activity into beautifully crafted SVG cards. Customize your theme, preview your stats, and embed in seconds. Free and open source.',
  openGraph: { title: 'Your work deserves a better README.', description: 'Beautiful GitHub cards. Built around you.', images: ['/social.svg'] },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
