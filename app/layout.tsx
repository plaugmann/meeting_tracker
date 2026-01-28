import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EY Meeting Tracker',
  description: 'Track customer meetings and drive engagement',
  manifest: '/manifest.json',
  themeColor: '#2e2e38',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EY Meetings',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
