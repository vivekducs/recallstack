// frontend/src/app/contact/page.js
'use client';

import { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate sending message API
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">Contact Us</h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-lg mx-auto">
          Have questions about RecallStack? Found a bug? Or just want to say hi? Drop us a message below.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        
        {/* Form Column */}
        <div className="md:col-span-3">
          <Card variant="standard" className="p-6 md:p-8">
            {submitted ? (
              <div className="text-center py-10">
                <svg className="w-10 h-10 mx-auto text-[var(--color-primary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold mb-2 text-[var(--color-success)]">Message Sent Successfully!</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  Thank you for reaching out, {name}. Our team will get back to you shortly.
                </p>
                <Button variant="secondary" onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-3 mb-2">Send a Message</h2>
                
                {error && (
                  <div className="p-3 text-xs text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded">
                    {error}
                  </div>
                )}

                <Input
                  id="contact-name"
                  type="text"
                  label="Your Name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  id="contact-email"
                  type="email"
                  label="Email Address"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  id="contact-message"
                  type="textarea"
                  label="Your Message"
                  placeholder="Type your message details here..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="min-w-[150px]"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Support Email */}
          <Card variant="standard" className="p-6">
            <svg className="w-6 h-6 text-[var(--color-primary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">Direct Support</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">For urgent account or platform queries:</p>
            <a href="mailto:support@recallstack.com" className="text-xs font-semibold text-[var(--color-primary)] hover:underline font-mono">
              support@recallstack.com
            </a>
          </Card>

          {/* GitHub Channel */}
          <Card variant="standard" className="p-6">
            <svg className="w-6 h-6 text-[var(--color-primary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h3 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">GitHub Issues</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">Want to contribute or report platform bugs?</p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Submit an Issue →
            </a>
          </Card>

          {/* Discord Sandbox */}
          <Card variant="standard" className="p-6">
            <svg className="w-6 h-6 text-[var(--color-primary)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-bold text-sm text-[var(--color-text-primary)] mb-1">Developer Community</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">Connect with other developers studying with RecallStack.</p>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              Join Discord Server →
            </a>
          </Card>

        </div>
      </div>
    </div>
  );
}
