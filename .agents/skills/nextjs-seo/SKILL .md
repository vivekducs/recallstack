---
name: nextjs-seo
description: >
  SEO implementation patterns for RecallStack using Next.js 14 App Router.
  Use this skill for every SEO-related task: metadata, JSON-LD structured data,
  Open Graph tags, sitemap generation, robots.txt, RSS feed, canonical URLs,
  breadcrumbs, and the /llms.txt file for AI crawlers. Trigger on any mention
  of metadata, SEO, sitemap, Open Graph, structured data, JSON-LD, robots,
  RSS, or crawlers. Always consult this before writing any Next.js metadata
  or structured data code.
---

# Next.js SEO Patterns — RecallStack

This skill governs all SEO implementation in the RecallStack Next.js 14
frontend. RecallStack is a public knowledge platform. Every page that can be
reached by a search engine or AI crawler must have complete, correct metadata.

---

## ABSOLUTE RULES

1. Every public page must have a unique title and meta description. Never
   reuse the same string on two pages.
2. Every public page must have a canonical URL. Never omit it.
3. JSON-LD must be present on every public page. The schema type depends on
   the page — see the page-by-page rules below.
4. Never put SEO metadata in client components. Metadata must be exported
   from server components (page.js or layout.js files) using the Next.js
   `generateMetadata` function or the static `metadata` export.
5. The `/llms.txt` file must be kept up to date as new subjects and topics
   are added. It is how AI crawlers discover and index the platform.
6. Never hardcode URLs. Always derive canonical URLs from the
   `NEXT_PUBLIC_BASE_URL` environment variable.

---

## NEXT.JS 14 METADATA API

Next.js 14 App Router uses two patterns for metadata. Use the correct one
for each situation.

### Static metadata (for pages that do not depend on dynamic data)

```js
/*
 * Use for: homepage, about page, static landing pages.
 * The metadata object is evaluated at build time.
 */
export const metadata = {
  title: 'RecallStack — Learn Once. Recall Anytime.',
  description:
    'A personal knowledge management platform for interview prep, DSA, and system design. Browse subjects, topics, and structured notes.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
  },
  openGraph: {
    title: 'RecallStack — Learn Once. Recall Anytime.',
    description:
      'A personal knowledge management platform for interview prep, DSA, and system design.',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: 'RecallStack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RecallStack — Learn Once. Recall Anytime.',
    description:
      'A personal knowledge management platform for interview prep, DSA, and system design.',
  },
};
```

### Dynamic metadata (for pages driven by database content)

```js
/*
 * Use for: subject pages, topic pages, note pages.
 * generateMetadata runs on the server at request time and has access
 * to route params and can fetch from the database or API.
 */
export async function generateMetadata({ params }) {
  const note = await getNoteBySlug(params.slug);

  if (!note) {
    return { title: 'Note not found — RecallStack' };
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/learning/${params.subject}/${params.topic}/${params.slug}`;

  return {
    title: note.seoTitle || `${note.title} — RecallStack`,
    description: note.seoDescription || note.excerpt,
    keywords: note.seoKeywords,
    alternates: { canonical: url },
    openGraph: {
      title: note.seoTitle || note.title,
      description: note.seoDescription || note.excerpt,
      url,
      siteName: 'RecallStack',
      type: 'article',
      publishedTime: note.publishedAt,
      modifiedTime: note.updatedAt,
      authors: [note.author.name],
      images: note.ogImage ? [{ url: note.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: note.seoTitle || note.title,
      description: note.seoDescription || note.excerpt,
    },
  };
}
```

---

## JSON-LD STRUCTURED DATA BY PAGE TYPE

JSON-LD is injected into the page via a `<script>` tag in the page component,
not in metadata. Use a shared `JsonLd` component.

```js
/*
 * FILE: frontend/src/components/common/JsonLd.js
 *
 * PURPOSE:
 * Renders a JSON-LD script tag for structured data.
 * Accepts any valid schema.org object as the `schema` prop.
 * Used on every public page to provide structured data for search engines
 * and AI crawlers.
 */
export default function JsonLd({ schema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Homepage — WebSite + SearchAction

```js
const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RecallStack',
  url: process.env.NEXT_PUBLIC_BASE_URL,
  description: 'A personal knowledge management platform for interview prep, DSA, and system design.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
```

### Subject page — CollectionPage + BreadcrumbList

```js
const schema = [
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
```

### Topic page — CollectionPage + BreadcrumbList

```js
const schema = [
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
```

### Note page — Article + BreadcrumbList + Person

```js
const schema = [
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
      name: note.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'RecallStack',
      url: BASE_URL,
    },
    image: note.ogImage || `${BASE_URL}/og-default.png`,
    keywords: note.tags.join(', '),
    timeRequired: `PT${note.readingTime}M`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: subject.name, item: `${BASE_URL}/learning/${subject.slug}` },
      { '@type': 'ListItem', position: 3, name: topic.name, item: `${BASE_URL}/learning/${subject.slug}/${topic.slug}` },
      { '@type': 'ListItem', position: 4, name: note.title, item: noteUrl },
    ],
  },
];
```

---

## SITEMAP GENERATION

The sitemap is generated dynamically by Next.js using the `sitemap.js`
convention file in the `app/` directory.

```js
/*
 * FILE: frontend/src/app/sitemap.js
 *
 * PURPOSE:
 * Generates the XML sitemap for RecallStack dynamically from the database.
 * Next.js calls this at build time (or on-demand with ISR) and serves
 * the result at /sitemap.xml.
 *
 * Priority guidelines:
 *   1.0  Homepage
 *   0.9  Subject pages
 *   0.8  Topic pages
 *   0.7  Note pages
 *   0.5  Static pages (search, about)
 *
 * changeFrequency guidelines:
 *   Subject and topic pages: weekly (structure changes rarely)
 *   Note pages: monthly (content is stable once published)
 */
export default async function sitemap() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const subjects = await getSubjectsWithTopicsAndNotes();

  const subjectUrls = subjects.map((s) => ({
    url: `${BASE_URL}/learning/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const topicUrls = subjects.flatMap((s) =>
    s.topics.map((t) => ({
      url: `${BASE_URL}/learning/${s.slug}/${t.slug}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  );

  const noteUrls = subjects.flatMap((s) =>
    s.topics.flatMap((t) =>
      t.notes
        .filter((n) => n.status === 'PUBLISHED')
        .map((n) => ({
          url: `${BASE_URL}/learning/${s.slug}/${t.slug}/${n.slug}`,
          lastModified: n.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
    )
  );

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...subjectUrls,
    ...topicUrls,
    ...noteUrls,
  ];
}
```

---

## ROBOTS.TXT

```js
/*
 * FILE: frontend/src/app/robots.js
 *
 * PURPOSE:
 * Tells search engine and AI crawlers what they can and cannot index.
 * Admin routes, draft content, and user-specific pages are disallowed.
 * All public learning content is allowed.
 */
export default function robots() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/my-learnings/create',
          '/my-learnings/',
          '/bookmarks/',
          '/revision-tracker/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

---

## RSS FEED

```js
/*
 * FILE: frontend/src/app/rss.xml/route.js
 *
 * PURPOSE:
 * Generates an RSS 2.0 feed of the most recently published notes.
 * Served at /rss.xml. Useful for readers and for AI crawlers that
 * prefer feed formats for discovering new content.
 * Returns the 50 most recently published notes sorted by publishedAt desc.
 */
export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const notes = await getRecentPublishedNotes(50);

  const items = notes
    .map(
      (note) => `
    <item>
      <title><![CDATA[${note.title}]]></title>
      <link>${BASE_URL}/learning/${note.topic.subject.slug}/${note.topic.slug}/${note.slug}</link>
      <guid>${BASE_URL}/learning/${note.topic.subject.slug}/${note.topic.slug}/${note.slug}</guid>
      <description><![CDATA[${note.excerpt || ''}]]></description>
      <pubDate>${new Date(note.publishedAt).toUTCString()}</pubDate>
      <category>${note.topic.subject.name}</category>
      <category>${note.topic.name}</category>
    </item>`
    )
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RecallStack</title>
    <link>${BASE_URL}</link>
    <description>Learn Once. Recall Anytime. Notes on DSA, System Design, and Interview Prep.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
```

---

## LLMS.TXT — AI CRAWLER SUPPORT

The `/llms.txt` file is a plain text index that tells AI crawlers (like
Claude, Perplexity, and others) what content is available and how to navigate
it. It follows the emerging standard at llmstxt.org.

```js
/*
 * FILE: frontend/src/app/llms.txt/route.js
 *
 * PURPOSE:
 * Serves a plain text index of all RecallStack content at /llms.txt.
 * AI crawlers fetch this file to discover available pages without
 * parsing the full HTML sitemap. The format is: one URL per line,
 * prefixed with a human-readable title and brief description.
 * Regenerated on each request so it stays current as content is added.
 */
export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const subjects = await getSubjectsWithTopicsAndNotes();

  const lines = [
    '# RecallStack',
    '# Learn Once. Recall Anytime.',
    '# Personal knowledge platform for DSA, System Design, and Interview Prep.',
    '',
    `> Homepage: ${BASE_URL}`,
    '',
  ];

  for (const subject of subjects) {
    lines.push(`## ${subject.name}`);
    lines.push(`> ${BASE_URL}/learning/${subject.slug}`);
    lines.push('');

    for (const topic of subject.topics) {
      lines.push(`### ${topic.name}`);
      lines.push(`> ${BASE_URL}/learning/${subject.slug}/${topic.slug}`);

      for (const note of topic.notes.filter((n) => n.status === 'PUBLISHED')) {
        lines.push(
          `- [${note.title}](${BASE_URL}/learning/${subject.slug}/${topic.slug}/${note.slug})`
        );
      }
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

---

## SEMANTIC HTML RULES

These rules make content readable by both humans and crawlers without
relying on JavaScript.

- Every note page must use a single `<h1>` for the note title.
- Section titles inside a note use `<h2>`.
- Sub-headings inside a section use `<h3>`.
- The subject/topic breadcrumb must use `<nav aria-label="Breadcrumb">`.
- Code blocks must use `<pre><code class="language-{lang}">`.
- Note pages must be server-rendered (no `use client` on the note page itself).
  Interactive elements (bookmark button, helpful button) can be client
  components nested inside the server-rendered page.
- All images must have a descriptive `alt` attribute. Never use `alt=""` for
  content images. Empty alt is only correct for decorative images.

---

## TITLE FORMAT CONVENTION

Every page title follows the same format so the site has a consistent identity
in search results:

```
Note page:    {Note Title} — {Topic Name} — RecallStack
Topic page:   {Topic Name} — {Subject Name} — RecallStack
Subject page: {Subject Name} — RecallStack
Homepage:     RecallStack — Learn Once. Recall Anytime.
```

The `generateMetadata` function in `frontend/src/lib/seo.js` should export
helper functions that assemble these titles so they are never constructed
inline in individual page files.
