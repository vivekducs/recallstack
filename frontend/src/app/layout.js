import './globals.css';
import Layout from '@/components/layout/Layout';

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
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}

