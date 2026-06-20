// frontend/src/app/faq/page.js
'use client';

import { useState } from 'react';
import Card from '@/components/common/Card';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = [
    {
      q: 'What is RecallStack?',
      a: 'RecallStack is a developer-focused, structured knowledge base designed to help you organize study notes and commit technical knowledge (like system design patterns, programming concepts, and coding algorithms) to long-term memory.'
    },
    {
      q: 'How does the Note hierarchy work?',
      a: 'To maximize structural clarity, notes are organized hierarchically: Subject (e.g. System Design) → Topic (e.g. Distributed Databases) → Note (e.g. CAP Theorem) → Content Sections. You can break down notes into sections of text, example callouts, diagrams, and syntax-highlighted code blocks.'
    },
    {
      q: 'What is the Revision Tracker?',
      a: 'The Revision Tracker calculates space-repetition review cycles for notes. Once you publish or edit a note, the platform tracks revision frequencies and views to suggest optimal intervals for re-reading and recalling the study guide.'
    },
    {
      q: 'Can I bookmark notes from other developers?',
      a: 'Yes! Publicly published notes include a bookmark button in the top right. Bookmarking saves the note to your personal user dashboard bookmarks tab, where you can easily keep track of external guides.'
    },
    {
      q: 'How do I toggle Dark Mode?',
      a: 'RecallStack detects your browser/operating system dark mode preferences natively and automatically applies the optimal high-contrast color scheme. There is no manual toggle required; it adapts seamlessly to your system preferences.'
    },
    {
      q: 'Is RecallStack free to use?',
      a: 'Yes, RecallStack is completely open-source and free for developers to write, draft, publish, and bookmark study notes.'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">Frequently Asked Questions</h1>
        <p className="text-base text-[var(--color-text-secondary)]">
          Everything you need to know about structured note-taking and revision on RecallStack.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <Card 
              key={idx} 
              variant="standard" 
              className="p-5 cursor-pointer select-none transition-all duration-200"
              onClick={() => toggleFAQ(idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-[var(--color-text-primary)] text-sm md:text-base">
                  {item.q}
                </h3>
                <span className={`w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'max-h-[200px] mt-4 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-3">
                  {item.a}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
