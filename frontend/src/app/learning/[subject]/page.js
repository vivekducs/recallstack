// frontend/src/app/learning/[subject]/page.js
import Link from 'next/link';
import { getSubjectTitle } from '@/lib/seo';
import JsonLd from '@/components/common/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.com';

async function getSubjectData(slug) {
  try {
    const res = await fetch(`${API_URL}/subjects/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch subject details:', err);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const subject = await getSubjectData(params.subject);
  if (!subject) {
    return { title: 'Subject Not Found — RecallStack' };
  }

  const url = `${BASE_URL}/learning/${params.subject}`;
  const title = getSubjectTitle(subject.name);
  const description = subject.description || `Learn ${subject.name} with curated topics and notes.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'RecallStack',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SubjectPage({ params }) {
  const subject = await getSubjectData(params.subject);

  if (!subject) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-lg font-mono text-zinc-500 mb-4 tracking-wider">Not Found</div>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Subject not found.</p>
          <Link href="/" className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const jsonLdSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: subject.name,
      description: subject.description,
      url: `${BASE_URL}/learning/${subject.slug}`,
      numberOfItems: subject.topicsCount,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: subject.name, item: `${BASE_URL}/learning/${subject.slug}` },
      ],
    },
  ];

  return (
    <>
      <JsonLd schema={jsonLdSchema} />
      <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${subject.color || '#6c63f1'}, transparent 70%)` }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 fade-in" style={{ color: 'var(--color-text-dim)' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{subject.name}</span>
          </nav>

          {/* Subject Header */}
          <header className="mb-12 fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center font-mono text-sm font-semibold text-zinc-400"
                style={{ background: `${subject.color || '#6c63f1'}20`, border: `1px solid ${subject.color || '#6c63f1'}30` }}
              >
                {subject.icon || 'Book'}
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ color: 'white' }}>{subject.name}</h1>
                <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>{subject.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-dim)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>{subject.topicsCount}</span> topics
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-dim)' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>{subject.notesCount}</span> notes
              </div>
            </div>
          </header>

          {/* Topics List */}
          <section>
            <h2 className="text-2xl font-bold mb-6 fade-in" style={{ color: 'white' }}>Topics</h2>

            {!subject.topics || subject.topics.length === 0 ? (
              <div className="text-center py-16 glass-card">
                <p style={{ color: 'var(--color-text-muted)' }}>No topics yet in this subject.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.topics.map((topic, index) => (
                  <Link key={topic.id} href={`/learning/${params.subject}/${topic.slug}`}>
                    <div className={`glass-card p-5 cursor-pointer fade-in fade-in-delay-${Math.min(index + 1, 4)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1" style={{ color: 'white' }}>{topic.name}</h3>
                          {topic.description && (
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                              {topic.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                            <span>{topic.notesCount} notes</span>
                            {topic.lastUpdated && (
                              <span>Updated {new Date(topic.lastUpdated).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 mt-1" style={{ color: 'var(--color-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
