import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { AdminProvider } from '@/context/AdminContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata: Metadata = {
  title: 'Sashank — Software Developer',
  description: 'Personal portfolio of Sashank, a fresher software developer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
