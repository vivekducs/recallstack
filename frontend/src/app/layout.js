import './globals.css';

export const metadata = {
  title: 'RecallStack - Learn Once. Recall Anytime.',
  description: 'Personal knowledge management platform for structured learning. Organize your notes with Subject → Topic → Note → Section hierarchy.',
  keywords: 'learning, notes, knowledge management, DSA, system design, programming',
  openGraph: {
    title: 'RecallStack',
    description: 'Learn Once. Recall Anytime.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
