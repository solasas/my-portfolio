import { Space_Grotesk, Inter } from 'next/font/google';
import { AdminProvider } from '@/context/AdminContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata = {
  title: 'Sashank Solasa',
  description: 'Personal portfolio of Sashank, a fresher software developer.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
