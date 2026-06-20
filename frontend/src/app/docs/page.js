// frontend/src/app/docs/page.js
'use client';

import { useState } from 'react';
import Card from '@/components/common/Card';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'subjects' | 'auth'

  const apiEndpoints = {
    notes: [
      {
        method: 'GET',
        path: '/api/notes',
        desc: 'Retrieve a list of public notes, filtered by pagination, subject, or topic.',
        params: [
          { name: 'page', type: 'integer', desc: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', desc: 'Notes per page (default: 10)' },
          { name: 'subject', type: 'string', desc: 'Subject slug filter' }
        ],
        response: `{
  "notes": [
    {
      "id": "cmqlccfr7001qwemo4ye3ozaz",
      "title": "The CAP Theorem",
      "slug": "the-cap-theorem",
      "excerpt": "Master consistency, availability, and partition tolerance...",
      "difficulty": "HARD",
      "views": 482,
      "topic": {
        "name": "Distributed Databases",
        "slug": "distributed-databases"
      }
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}`
      },
      {
        method: 'GET',
        path: '/api/notes/:id',
        desc: 'Retrieve comprehensive details of a single public note, including its content sections.',
        params: [
          { name: 'id', type: 'string', desc: 'Unique UUID or Cuid of the note' }
        ],
        response: `{
  "id": "cmqlccfr7001qwemo4ye3ozaz",
  "title": "The CAP Theorem",
  "status": "PUBLISHED",
  "sections": [
    {
      "id": "sec-1",
      "title": "Deconstructing CAP",
      "contentType": "TEXT",
      "content": "Formulated by Eric Brewer..."
    }
  ]
}`
      }
    ],
    subjects: [
      {
        method: 'GET',
        path: '/api/subjects',
        desc: 'Retrieve all available Subjects in the catalog, along with their metadata and topic counts.',
        params: [],
        response: `[
  {
    "id": "sub-1",
    "name": "System Design",
    "slug": "system-design",
    "icon": "system-design",
    "topicsCount": 8
  }
]`
      }
    ],
    auth: [
      {
        method: 'POST',
        path: '/api/auth/login',
        desc: 'Authenticate user credentials and receive a JSON Web Token (JWT) for secure requests.',
        params: [
          { name: 'email', type: 'string', desc: 'Registered user email address (required)' },
          { name: 'password', type: 'string', desc: 'Account password (required)' }
        ],
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-1",
    "username": "admin",
    "role": "ADMIN"
  }
}`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-2">API Reference</h1>
        <p className="text-base text-[var(--color-text-secondary)]">
          Query public notes, subjects, and topics directly from your code tools using our developer endpoints.
        </p>
      </header>

      {/* Endpoint Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)] pb-4 mb-8">
        {[
          { id: 'notes', label: 'Notes API' },
          { id: 'subjects', label: 'Subjects API' },
          { id: 'auth', label: 'Authentication' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Endpoints Flow */}
      <div className="space-y-12">
        {apiEndpoints[activeTab].map((endpoint, index) => (
          <div key={index} className="glass-card p-6 flex flex-col gap-6">
            
            {/* Header / Info Row */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  endpoint.method === 'GET' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}>
                  {endpoint.method}
                </span>
                <span className="text-xs font-mono font-semibold text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded">
                  {endpoint.path}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{endpoint.desc}</p>
            </div>

            {/* Query parameters table */}
            {endpoint.params.length > 0 && (
              <div>
                <h4 className="text-xs uppercase font-bold text-[var(--color-text-primary)] mb-2 tracking-wider">Request Parameters</h4>
                <div className="overflow-x-auto border border-[var(--color-border)] rounded">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-b border-[var(--color-border)] font-bold">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-secondary)]">
                      {endpoint.params.map((p, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-mono font-semibold text-[var(--color-text-primary)]">{p.name}</td>
                          <td className="p-2.5 font-mono text-[var(--color-text-secondary)]">{p.type}</td>
                          <td className="p-2.5">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mock Response code snippet */}
            <div>
              <h4 className="text-xs uppercase font-bold text-[var(--color-text-primary)] mb-2 tracking-wider">Example Response (JSON)</h4>
              <pre className="p-4 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)] overflow-x-auto font-mono text-[11px] leading-relaxed text-[var(--color-text-primary)]">
                <code>{endpoint.response}</code>
              </pre>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
