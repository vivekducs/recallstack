// frontend/src/app/learning/[subject]/[topic]/page.js
import Link from 'next/link';
import { getTopicTitle } from '@/lib/seo';
import JsonLd from '@/components/common/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.com';

async function getTopicAndNotesData(subjectSlug, topicSlug) {
  try {
    const subjectRes = await fetch(`${API_URL}/subjects/${subjectSlug}`, { next: { revalidate: 60 } });
    if (!subjectRes.ok) return null;
    const subject = await subjectRes.json();

    const topic = subject.topics?.find(t => t.slug === topicSlug);
    if (!topic) return null;

    const notesRes = await fetch(`${API_URL}/topics/${topic.id}/notes`, { next: { revalidate: 60 } });
    const notes = notesRes.ok ? await notesRes.json() : [];

    return { subject, topic, notes };
  } catch (err) {
    console.error('Failed to fetch topic details on server:', err);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const data = await getTopicAndNotesData(params.subject, params.topic);
  if (!data) {
    return { title: 'Topic Not Found — RecallStack' };
  }

  const { subject, topic } = data;
  const title = getTopicTitle(topic.name, subject.name);
  const description = topic.description || `Browse notes on ${topic.name} in ${subject.name}.`;
  const url = `${BASE_URL}/learning/${params.subject}/${params.topic}`;

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

export default async function TopicPage({ params }) {
  const data = await getTopicAndNotesData(params.subject, params.topic);

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-lg font-mono text-zinc-500 mb-4 tracking-wider">Not Found</div>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Topic not found.</p>
          <Link href={`/learning/${params.subject}`} className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            ← Back to Subject
          </Link>
        </div>
      </main>
    );
  }

  const { subject, topic, notes } = data;

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  const jsonLdSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: topic.name,
      description: topic.description,
      url: `${BASE_URL}/learning/${subject.slug}/${topic.slug}`,
      numberOfItems: topic.notesCount,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: subject.name, item: `${BASE_URL}/learning/${subject.slug}` },
        { '@type': 'ListItem', position: 3, name: topic.name, item: `${BASE_URL}/learning/${subject.slug}/${topic.slug}` },
      ],
    },
  ];

  return (
    <>
      <JsonLd schema={jsonLdSchema} />
      <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 fade-in flex-wrap" style={{ color: 'var(--color-text-dim)' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
            <span>/</span>
            <Link href={`/learning/${params.subject}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
              {subject.name}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{topic.name}</span>
          </nav>

          {/* Topic Header */}
          <header className="mb-10 fade-in">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'white' }}>{topic.name}</h1>
            {topic.description && (
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>{topic.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: 'var(--color-text-dim)' }}>
              <span className="font-medium">{notes.length} notes</span>
            </div>
          </header>

          {/* Notes List */}
          <section>
            <h2 className="text-xl font-bold mb-6 fade-in" style={{ color: 'white' }}>
              Notes
            </h2>

            {notes.length === 0 ? (
              <div className="text-center py-16 glass-card">
                <div className="text-xl mb-4 font-mono text-zinc-500 tracking-wider">Empty Topic</div>
                <p style={{ color: 'var(--color-text-muted)' }}>No notes yet in this topic.</p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-dim)' }}>Be the first to contribute!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <Link key={note.id} href={`/learning/${params.subject}/${params.topic}/${note.slug}`}>
                    <div className={`glass-card p-5 cursor-pointer fade-in fade-in-delay-${Math.min(index + 1, 4)} mb-4`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{note.title}</h3>
                          {note.excerpt && (
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                              {note.excerpt}
                            </p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>
                              {note.difficulty}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                              {note.readingTime || 1} min read
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                              by {note.author?.name || 'Unknown'}
                            </span>
                            {note.publishedAt && (
                              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                                {new Date(note.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {note.tags.map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <svg className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: 'var(--color-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
