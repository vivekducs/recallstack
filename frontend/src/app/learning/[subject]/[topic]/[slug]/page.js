// frontend/src/app/learning/[subject]/[topic]/[slug]/page.js
import Link from 'next/link';
import CodeBlock from '@/components/note/CodeBlock';
import TableOfContents from '@/components/note/TableOfContents';
import BookmarkButton from '@/components/note/BookmarkButton';
import StarRating from '@/components/common/StarRating';
import CommentsSection from '@/components/comments/CommentsSection';
import JsonLd from '@/components/common/JsonLd';
import { getNoteTitle } from '@/lib/seo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.com';

async function getNoteData(subjectSlug, topicSlug, noteSlug) {
  try {
    const subjectRes = await fetch(`${API_URL}/subjects/${subjectSlug}`, { next: { revalidate: 60 } });
    if (!subjectRes.ok) return null;
    const subject = await subjectRes.json();

    const topic = subject.topics?.find(t => t.slug === topicSlug);
    if (!topic) return null;

    const notesRes = await fetch(`${API_URL}/topics/${topic.id}/notes`, { next: { revalidate: 60 } });
    if (!notesRes.ok) return null;
    const notes = await notesRes.json();
    const foundNote = notes.find(n => n.slug === noteSlug);
    if (!foundNote) return null;

    const noteDetailsRes = await fetch(`${API_URL}/notes/${foundNote.id}`, { next: { revalidate: 60 } });
    if (!noteDetailsRes.ok) return null;
    return await noteDetailsRes.json();
  } catch (err) {
    console.error('Failed to fetch note details on server:', err);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const note = await getNoteData(params.subject, params.topic, params.slug);
  if (!note) {
    return { title: 'Note Not Found — RecallStack' };
  }

  const title = getNoteTitle(note.title, note.topic?.name || params.topic);
  const description = note.excerpt || `Read details of ${note.title}.`;
  const url = `${BASE_URL}/learning/${params.subject}/${params.topic}/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'RecallStack',
      type: 'article',
      publishedTime: note.publishedAt,
      modifiedTime: note.updatedAt,
      authors: [note.author?.name],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}



export default async function NotePage({ params }) {
  const note = await getNoteData(params.subject, params.topic, params.slug);

  if (!note) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Note not found.</p>
          <Link href={`/learning/${params.subject}/${params.topic}`} className="inline-block mt-4 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            ← Back to Topic
          </Link>
        </div>
      </main>
    );
  }

  const getDifficultyBadge = (difficulty) => {
    const classes = {
      EASY: 'badge-easy',
      MEDIUM: 'badge-medium',
      HARD: 'badge-hard'
    };
    return classes[difficulty] || 'badge-medium';
  };

  const noteUrl = `${BASE_URL}/learning/${params.subject}/${params.topic}/${params.slug}`;

  const jsonLdSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: note.title,
      description: note.excerpt,
      url: noteUrl,
      datePublished: note.publishedAt,
      dateModified: note.updatedAt,
      author: {
        '@type': 'Person',
        name: note.author?.name || 'Unknown',
      },
      publisher: {
        '@type': 'Organization',
        name: 'RecallStack',
        url: BASE_URL,
      },
      image: `${BASE_URL}/og-default.png`,
      keywords: note.tags?.join(', ') || '',
      timeRequired: `PT${note.readingTime || 1}M`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: note.topic?.subject?.name || params.subject, item: `${BASE_URL}/learning/${params.subject}` },
        { '@type': 'ListItem', position: 3, name: note.topic?.name || params.topic, item: `${BASE_URL}/learning/${params.subject}/${params.topic}` },
        { '@type': 'ListItem', position: 4, name: note.title, item: noteUrl },
      ],
    },
  ];

  return (
    <>
      <JsonLd schema={jsonLdSchema} />
      <main className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex gap-8 justify-between">
            {/* Main Content */}
            <article className="flex-1 min-w-0 max-w-[700px]">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm mb-8 fade-in flex-wrap" style={{ color: 'var(--color-text-dim)' }} aria-label="Breadcrumb">
                <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Home</Link>
                <span>/</span>
                <Link href={`/learning/${params.subject}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                  {note.topic?.subject?.name || params.subject}
                </Link>
                <span>/</span>
                <Link href={`/learning/${params.subject}/${params.topic}`} className="hover:underline" style={{ color: 'var(--color-primary)' }}>
                  {note.topic?.name || params.topic}
                </Link>
                <span>/</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{note.title}</span>
              </nav>

              {/* Note Header */}
              <header className="mb-10 fade-in">
                <h1 className="text-4xl font-bold mb-4 text-[var(--color-text-primary)]">{note.title}</h1>

                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <span className={`badge ${getDifficultyBadge(note.difficulty)}`}>{note.difficulty}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {note.readingTime || 1} min read
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    by {note.author?.name || 'Unknown'}
                  </span>
                  {note.publishedAt && (
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {new Date(note.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                  <BookmarkButton noteId={note.id} />
                  <Link href={`/learning/${params.subject}/${params.topic}/${params.slug}/revisions`} className="text-sm font-medium hover:underline text-[var(--color-primary)]">
                    History
                  </Link>
                </div>
                
                <div className="mb-6">
                  <StarRating 
                    noteId={note.id} 
                    initialAverage={note.averageRating || 0} 
                    initialCount={note.ratingCount || 0} 
                    readOnly={false} 
                  />
                </div>

                {note.excerpt && (
                  <p className="text-lg text-[var(--color-text-secondary)]">{note.excerpt}</p>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Sections */}
              <div className="prose-dark">
                {note.sections && note.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={`section-${section.id}`}
                    className={`mb-10 fade-in fade-in-delay-${Math.min(index + 1, 4)}`}
                  >
                    <h2 className="text-2xl font-bold mt-8 mb-3 text-[var(--color-text-primary)]">{section.title}</h2>

                    {section.contentType === 'TEXT' && (
                      <div className="mb-3">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          className="prose max-w-none prose-p:text-[var(--color-text-primary)] prose-headings:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)]"
                          components={{
                            a: ({node, ...props}) => {
                              const isExternal = props.href?.startsWith('http');
                              if (isExternal) {
                                return <a {...props} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-[var(--color-primary-hover)] text-[var(--color-primary)]" />;
                              }
                              return <Link href={props.href || '#'} className="font-semibold underline hover:text-[var(--color-primary-hover)] text-[var(--color-primary)]">{props.children}</Link>;
                            }
                          }}
                        >
                          {section.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {section.contentType === 'CODE' && (
                      <div className="my-4">
                        <CodeBlock language={section.language} content={section.content} />
                      </div>
                    )}

                    {section.contentType === 'EXAMPLE' && (
                      <div className="rounded-xl p-5 mb-3" style={{ background: 'rgba(36, 166, 112, 0.08)', borderLeft: '3px solid var(--color-accent)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Example</span>
                        </div>
                        <div>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            className="prose max-w-none prose-p:text-[var(--color-text-primary)] prose-headings:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-li:text-[var(--color-text-primary)]"
                            components={{
                              a: ({node, ...props}) => {
                                const isExternal = props.href?.startsWith('http');
                                if (isExternal) {
                                  return <a {...props} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-[var(--color-primary-hover)] text-[var(--color-primary)]" />;
                                }
                                return <Link href={props.href || '#'} className="font-semibold underline hover:text-[var(--color-primary-hover)] text-[var(--color-primary)]">{props.children}</Link>;
                              }
                            }}
                          >
                            {section.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {section.contentType === 'IMAGE' && (
                      <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid var(--color-border)' }}>
                        <img src={section.content} alt={section.title} className="w-full" />
                      </div>
                    )}

                    {section.contentType === 'DIAGRAM' && (
                      <div className="rounded-xl p-5 font-mono text-sm overflow-x-auto mb-3" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                        <pre className="whitespace-pre" style={{ color: 'var(--color-text-primary)' }}>{section.content}</pre>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Discussion Section */}
              <CommentsSection noteId={note.id} noteAuthorId={note.authorId} />
            </article>

            {/* Sidebar client component for active tracking */}
            {note.sections && note.sections.length > 1 && (
              <TableOfContents sections={note.sections} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
