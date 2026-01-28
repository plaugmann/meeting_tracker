import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import PWARegister from '@/components/pwa-register';

export const metadata: Metadata = {
  title: 'EY Meeting Tracker',
  description: 'Track customer meetings and drive engagement',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EY Meetings',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2e2e38',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <PWARegister />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
