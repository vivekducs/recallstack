// frontend/src/app/sitemap.js

export default async function sitemap() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.vercel.app';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://recallstack.onrender.com/api';

  try {
    const res = await fetch(`${API_URL}/search/sitemap`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch sitemap data');
    const subjects = await res.json();

    const subjectUrls = subjects.map((s) => ({
      url: `${BASE_URL}/learning/${s.slug}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    const topicUrls = subjects.flatMap((s) =>
      (s.topics || []).map((t) => ({
        url: `${BASE_URL}/learning/${s.slug}/${t.slug}`,
        lastModified: new Date(t.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    );

    const noteUrls = subjects.flatMap((s) =>
      (s.topics || []).flatMap((t) =>
        (t.notes || []).map((n) => ({
          url: `${BASE_URL}/learning/${s.slug}/${t.slug}/${n.slug}`,
          lastModified: new Date(n.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
      )
    );

    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/roadmap`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.95,
      },
      ...subjectUrls,
      ...topicUrls,
      ...noteUrls,
    ];
  } catch (err) {
    console.error('Error compiling dynamic sitemap:', err);
    // Fallback static sitemap to prevent build failures when backend is offline
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/roadmap`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.95,
      }
    ];
  }
}
