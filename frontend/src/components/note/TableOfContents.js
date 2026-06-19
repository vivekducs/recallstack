// frontend/src/components/note/TableOfContents.js
'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ sections }) {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-20">
        <nav className="glass-card p-5" aria-label="Table of Contents">
          <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
            Contents
          </h3>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#section-${section.id}`}
                  className="block text-sm py-1 px-3 rounded-md transition-colors"
                  style={{
                    color: activeSection === `section-${section.id}` ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    background: activeSection === `section-${section.id}` ? 'rgba(108, 99, 241, 0.1)' : 'transparent',
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
