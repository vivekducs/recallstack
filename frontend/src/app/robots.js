// frontend/src/app/robots.js

export default function robots() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://recallstack.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
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
