import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/hooks/useAuth';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata = {
  title: 'RecallStack - Learn Once. Recall Anytime.',
  description: 'Personal knowledge management platform for structured learning. Organize your notes with Subject → Topic → Note → Section hierarchy.',
  keywords: 'learning, notes, knowledge management, DSA, system design, programming',
  openGraph: {
    title: 'RecallStack',
    description: 'Learn Once. Recall Anytime.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecallStack',
    description: 'Learn Once. Recall Anytime.',
  },
  verification: {
    google: 'iHMxX8ri5vZrSNRo5i-s7rTjvn0eS8BpG379LJw9bJY',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}

