import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { PiProvider } from '@/components/providers/pi-provider';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'PUSD',
  description: 'The stablecoin for Pi Network. Instant. Stable. Secure.',
  keywords: ['stablecoin', 'Pi Network', 'PUSD', 'cryptocurrency', 'DeFi'],
  authors: [{ name: 'PUSD' }],
  openGraph: {
    title: 'PUSD',
    description: 'The stablecoin for Pi Network',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <Script id="pi-init" strategy="beforeInteractive">
          {`
            const Pi = window.Pi;
            Pi.init({ version: "2.0"});
          `}
        </Script>
        <PiProvider>
          {children}
          <Toaster />
        </PiProvider>
      </body>
    </html>
  );
}
