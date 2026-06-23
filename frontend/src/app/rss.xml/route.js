// frontend/src/app/rss.xml/route.js
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/search/sitemap`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch sitemap data');
    const subjects = await res.json();

    const allNotes = [];
    subjects.forEach((s) => {
      (s.topics || []).forEach((t) => {
        (t.notes || []).forEach((n) => {
          allNotes.push({
            ...n,
            topicSlug: t.slug,
            topicName: t.name,
            subjectSlug: s.slug,
            subjectName: s.name,
          });
        });
      });
    });

    const recentNotes = allNotes
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 50);

    const items = recentNotes
      .map(
        (note) => `
    <item>
      <title><![CDATA[${note.title}]]></title>
      <link>${BASE_URL}/learning/${note.subjectSlug}/${note.topicSlug}/${note.slug}</link>
      <guid>${BASE_URL}/learning/${note.subjectSlug}/${note.topicSlug}/${note.slug}</guid>
      <description><![CDATA[${note.excerpt || ''}]]></description>
      <pubDate>${new Date(note.publishedAt).toUTCString()}</pubDate>
      <category>${note.subjectName}</category>
      <category>${note.topicName}</category>
    </item>`
      )
      .join('');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${BASE_URL}</link>
    <description>${SITE_TAGLINE}</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      },
    });
  } catch (err) {
    console.error('Error generating RSS feed:', err);
    // Simple empty feed on error
    const emptyFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${BASE_URL}</link>
    <description>${SITE_TAGLINE} (Feed temporarily offline)</description>
  </channel>
</rss>`;
    return new Response(emptyFeed, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
