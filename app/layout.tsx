import { Inter_Tight } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import TransitionWrapper from './components/pagetransition/TransitionWrapper';

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Oman Gold API',
  description: 'A simple API for fetching and calculating gold prices in Oman.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} antialiased`}>
        <TransitionWrapper>
          <Navbar />
          {children}
        </TransitionWrapper>
      </body>
    </html>
  );
}