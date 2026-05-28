import type { Metadata } from 'next';
import { Cinzel_Decorative, Cormorant_Garamond, Share_Tech_Mono, Eater, Nosifer } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommandPalette from '../components/CommandPalette';
import ThemeProvider from '../components/ThemeProvider';

const cinzel = Cinzel_Decorative({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const shareTech = Share_Tech_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400'],
});

const eater = Eater({
  variable: '--font-brand',
  subsets: ['latin'],
  weight: ['400'],
});

const nosifer = Nosifer({
  variable: '--font-title',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'SnipURL',
  description: 'SnipURL — an ethereal, edge-deployed URL shortener with ghost-light redirects and spectral analytics.',
  keywords: 'url shortener, link shortener, ghost theme, edge computing, analytics, snapurl',
    openGraph: {
    title: 'SnipURL',
    description: 'Ethereal edge-deployed URL shortener with ghost-light redirects.',
    type: 'website',
    url: 'https://snipurl.co',
    images: [{ url: '/og-preview.png', width: 1200, height: 630, alt: 'SnipURL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnipURL',
    description: 'Ethereal edge-deployed URL shortener with ghost-light redirects.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${shareTech.variable} ${eater.variable} ${nosifer.variable}`}>
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col relative z-10">
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
