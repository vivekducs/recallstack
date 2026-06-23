// frontend/src/app/llms.txt/route.js

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.vercel.app';
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${API_URL}/search/sitemap`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Failed to fetch data');
    const subjects = await res.json();

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

      for (const topic of (subject.topics || [])) {
        lines.push(`### ${topic.name}`);
        lines.push(`> ${BASE_URL}/learning/${subject.slug}/${topic.slug}`);

        for (const note of (topic.notes || [])) {
          lines.push(
            `- [${note.title}](${BASE_URL}/learning/${subject.slug}/${topic.slug}/${note.slug})`
          );
        }
        lines.push('');
      }
    }

    return new Response(lines.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      },
    });
  } catch (err) {
    console.error('Error generating llms.txt:', err);
    return new Response('# RecallStack\n\nAI discovery index is temporarily offline.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
