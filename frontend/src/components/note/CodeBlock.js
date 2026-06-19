'use client';

import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';

// Register commonly used languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import c from 'highlight.js/lib/languages/c';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);

export default function CodeBlock({ language = 'javascript', content }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      try {
        const result = hljs.highlight(content, {
          language: language || 'plaintext',
          ignoreIllegals: true
        });
        codeRef.current.innerHTML = result.value;
      } catch {
        codeRef.current.textContent = content;
      }
    }
  }, [content, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block">
      {/* Header */}
      <div className="code-block-header">
        <span className="font-medium" style={{ color: 'var(--color-text-dim)' }}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors"
          style={{
            background: copied ? 'rgba(36, 166, 112, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: copied ? 'var(--color-accent)' : 'var(--color-text-dim)',
            border: '1px solid transparent'
          }}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="flex font-mono text-[13px] leading-[1.5]" style={{ padding: '12px 0', backgroundColor: 'var(--color-bg-secondary)' }}>
        {/* Line Numbers Column */}
        <div className="select-none text-right text-[var(--color-text-secondary)] pr-3 border-r border-[var(--color-border)] mr-3" style={{ minWidth: '2.5rem', opacity: 0.5, userSelect: 'none' }}>
          {content.trimEnd().split('\n').map((_, index) => (
            <div key={index} style={{ height: '1.5em' }}>{index + 1}</div>
          ))}
        </div>
        {/* Code Column */}
        <pre style={{ margin: 0, padding: 0, overflowX: 'auto', flex: 1, background: 'transparent', border: 'none' }}>
          <code ref={codeRef} className={`language-${language}`} style={{ padding: 0, display: 'block', lineHeight: '1.5em', background: 'transparent' }}>{content}</code>
        </pre>
      </div>
    </div>
  );
}
