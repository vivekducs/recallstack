// frontend/src/app/roadmap/page.js
import { getStructuredRoadmap } from '@/lib/roadmapParser';
import { getRoadmapTitle } from '@/lib/seo';
import JsonLd from '@/components/common/JsonLd';
import { Sparkles, ExternalLink } from 'lucide-react';
import RoadmapDashboard from './RoadmapClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata = {
  title: getRoadmapTitle(),
  description: 'Learn AI Engineering step-by-step. Track your progress on Python, Neural Networks, Transformers, Hugging Face, LangChain, LlamaIndex, Vector Databases, RAG, Local LLMs, Agentic AI, and MLOps deployment.',
  keywords: 'AI Engineering Roadmap, Learn LLMs, Vector Database tutorial, Agentic AI course, Transformers, Hugging Face NLP, LangChain, LlamaIndex, RAG tutorial, Spaced Repetition revision tracker',
  alternates: {
    canonical: `${BASE_URL}/roadmap`,
  },
  openGraph: {
    title: getRoadmapTitle(),
    description: 'A structured, interactive AI Engineering study plan with progress tracking, revision flagging, and personal notes.',
    url: `${BASE_URL}/roadmap`,
    siteName: 'RecallStack',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: getRoadmapTitle(),
    description: 'Interactive AI Engineering study plan with progress tracking, revision flagging, and notes.',
  },
};

export default async function RoadmapPage() {
  const weeks = getStructuredRoadmap();

  // JSON-LD Course Schema for premium SEO indexing
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': 'AI Engineering Roadmap',
    'description': 'A comprehensive, 16-week structured course roadmap for becoming an AI Engineer, covering fundamentals to advanced Agentic AI and MLOps.',
    'provider': {
      '@type': 'Organization',
      'name': 'RecallStack',
      'url': BASE_URL,
    },
    'courseCode': 'AI-ENG-01',
    'educationalLevel': 'Intermediate to Advanced',
    'about': [
      { '@type': 'Thing', 'name': 'Python & DSA' },
      { '@type': 'Thing', 'name': 'Neural Networks & PyTorch' },
      { '@type': 'Thing', 'name': 'Transformers & NLP' },
      { '@type': 'Thing', 'name': 'Hugging Face, LangChain & LlamaIndex' },
      { '@type': 'Thing', 'name': 'Low Rank Adaption & Quantization Fine-tuning' },
      { '@type': 'Thing', 'name': 'Vector Databases & Semantic Search' },
      { '@type': 'Thing', 'name': 'Retrieval Augmented Generation (RAG)' },
      { '@type': 'Thing', 'name': 'Agentic AI & Crew AI' },
      { '@type': 'Thing', 'name': 'Model Context Protocol (MCP)' },
      { '@type': 'Thing', 'name': 'LLM Evaluation & Observability' },
      { '@type': 'Thing', 'name': 'Docker, Kubernetes & MLOps Deployment' }
    ]
  };

  return (
    <>
      <JsonLd schema={courseSchema} />
      <main className="min-h-screen">
        <div className="relative max-w-5xl mx-auto px-4 py-8">
          
          {/* Animated Background Glow Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          {/* Header section */}
          <header className="relative mb-12 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-xs font-semibold mb-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-shadow duration-300">
              <Sparkles className="w-3.5 h-3.5" />
              16-Week Curriculum
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-[var(--color-text-primary)]">
              AI Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] animate-gradient-x">Roadmap</span>
            </h1>
            
            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Master machine learning fundamentals, transformers, fine-tuning, RAG, Agentic crews, and MLOps deployment. Track your daily checklist, flag revision topics, and add custom study notes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Roadmap by{' '}
                <a
                  href="https://vivekducs.is-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 hover:underline"
                >
                  Vivek Kumar
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </span>
              <span className="text-[var(--color-border)] hidden sm:inline">|</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Connect with Vivek:</span>
                <a
                  href="https://vivekducs.is-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-neutral-900/50 text-xs font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] active:scale-95 duration-200"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Portfolio
                </a>
                <a
                  href="https://www.linkedin.com/in/vivekducs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-[#0077b5]/20 bg-[#0077b5]/5 text-xs font-semibold text-[#0077b5] dark:text-[#3babeb] hover:bg-[#0077b5]/10 hover:border-[#0077b5]/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 duration-200"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </header>

          {/* Main Interactive Dashboard */}
          <section className="relative">
            <RoadmapDashboard initialWeeks={weeks} />
          </section>

        </div>
      </main>
    </>
  );
}
