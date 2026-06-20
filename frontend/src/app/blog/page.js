// frontend/src/app/blog/page.js
'use client';

import { useState } from 'react';
import Card from '@/components/common/Card';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'SYSTEM DESIGN', 'ALGORITHMS', 'PRODUCTIVITY'];

  const blogPosts = [
    {
      title: 'Deconstructing the CAP Theorem in Distributed Databases',
      excerpt: 'Consistency, Availability, and Partition Tolerance represent the core engineering tradeoffs in distributed systems. We explore how databases choose...',
      date: 'June 20, 2026',
      readTime: '6 min read',
      category: 'SYSTEM DESIGN',
      author: 'Shivansh Vasu'
    },
    {
      title: 'How Space-Repetition Promotes Coding Concept Retention',
      excerpt: 'Struggling to remember complex data structure properties? Learn why space-repetition review intervals are key to cementing technical skills...',
      date: 'June 18, 2026',
      readTime: '4 min read',
      category: 'PRODUCTIVITY',
      author: 'Aura Developer'
    },
    {
      title: 'Dijkstra vs A* Pathfinding: Visualizing Search Efficiencies',
      excerpt: 'Both algorithms find shortest paths, but they operate under very different heuristic rules. Here is a breakdown of time complexity and search spaces...',
      date: 'June 12, 2026',
      readTime: '8 min read',
      category: 'ALGORITHMS',
      author: 'Dev Admin'
    },
    {
      title: 'Clean Architecture in Node.js Microservices',
      excerpt: 'Decoupling route handlers from controllers, services, and models makes testing simple. We share clean abstraction templates for your next project...',
      date: 'June 05, 2026',
      readTime: '7 min read',
      category: 'SYSTEM DESIGN',
      author: 'Backend Lead'
    }
  ];

  const filteredPosts = selectedCategory === 'ALL'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">RecallStack Blog</h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-lg mx-auto">
          Insights, deep-dives, and tutorials on system design, database internals, and learning workflows.
        </p>
      </header>

      {/* Categories Filter tab */}
      <div className="flex gap-2 flex-wrap justify-center border-b border-[var(--color-border)] pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post, idx) => (
          <Card
            key={idx}
            variant="standard"
            className="p-6 flex flex-col h-full hover:scale-[1.01] transition-transform duration-150"
          >
            <div className="flex-1">
              {/* Category + Meta info */}
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[var(--color-primary)] mb-3">
                <span>{post.category}</span>
                <span className="text-[var(--color-text-secondary)]/70">{post.readTime}</span>
              </div>
              
              <h2 className="text-base md:text-lg font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed mb-4">
                {post.excerpt}
              </p>
            </div>

            {/* Author details */}
            <div className="border-t border-[var(--color-border)]/50 pt-4 flex items-center justify-between text-xs text-[var(--color-text-secondary)]/80 mt-auto">
              <span>By {post.author}</span>
              <span>{post.date}</span>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
