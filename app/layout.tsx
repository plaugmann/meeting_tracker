import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAInstallPrompt from '@/components/pwa-install-prompt';
import PWARegister from '@/components/pwa-register';
import ClientWrapper from '@/components/client-wrapper';
import AuthSessionProvider from '@/components/session-provider';

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
    icon: '/web-app-manifest-192x192.png',
    apple: '/apple-icon.png',
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
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/web-app-manifest-512x512.png" />
      </head>
      <body className="antialiased min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: 'url(/background.png)' }} suppressHydrationWarning>
        <ClientWrapper>
          <PWARegister />
          <PWAInstallPrompt />
        </ClientWrapper>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
