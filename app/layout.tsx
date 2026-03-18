import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import TransitionWrapper from './components/pagetransition/TransitionWrapper';
import { cn } from '@/lib/utils';

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Oman Gold API',
  description: 'A simple API for fetching and calculating gold prices in Oman.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(ibmPlexSans.variable, 'font-sans')}>
      <body className="antialiased">
        <TransitionWrapper>
          <Navbar />
          {children}
        </TransitionWrapper>
      </body>
    </html>
  );
}
