import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import TransitionWrapper from './components/pagetransition/TransitionWrapper';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { cn } from '@/lib/utils';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-ibm-plex-sans-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Oman Gold API',
  description: 'A simple API for fetching and calculating gold prices in Oman.',
  icons: {
    icon: '/gold.svg',
    shortcut: '/gold.svg',
    apple: '/gold.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(ibmPlexSans.variable, ibmPlexSansArabic.variable, 'font-sans')}>
      <body className="antialiased">
        <LanguageProvider>
          <TransitionWrapper>
            <Navbar />
            {children}
          </TransitionWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
