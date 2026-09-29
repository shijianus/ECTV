import type { Metadata, Viewport } from 'next';
import './globals.css';
import BootSplash from '@/components/ectv/BootSplash';

export const metadata: Metadata = {
  title: {
    default: 'ECTV',
    template: '%s · ECTV',
  },
  description: 'ECTV 影城 — 你的私人深海影院',
  applicationName: 'ECTV',
  appleWebApp: {
    capable: true,
    title: 'ECTV',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#050B18',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ECTV 預設暗色：直接在 <html> 掛載 dark，避免閃白
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="bg-abyss text-mist min-h-screen">
        <BootSplash />
        {children}
      </body>
    </html>
  );
}
