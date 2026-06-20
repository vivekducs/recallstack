// frontend/src/app/terms/page.js
'use client';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="mb-10 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-2">Terms of Service</h1>
        <p className="text-xs text-[var(--color-text-secondary)]">Last updated: June 20, 2026</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--color-text-primary)]">
        <section>
          <h2 className="text-lg font-bold mb-3">1. Acceptance of Terms</h2>
          <p className="text-[var(--color-text-secondary)]">
            By creating an account or accessing the RecallStack web application, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must immediately cease using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. User Accounts & Security</h2>
          <p className="text-[var(--color-text-secondary)]">
            You are responsible for safeguarding the credentials you use to access the service and for any activities or actions under your account. You agree not to disclose your password to any third party and to notify us immediately of any security breaches.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. Acceptable Content & Code Conduct</h2>
          <p className="mb-3 text-[var(--color-text-secondary)]">
            RecallStack is designed for technical learning and study guides. By uploading or creating content, you agree NOT to publish:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <li>Malicious code, spyware, or security exploits.</li>
            <li>Spam, promotional advertisements, or affiliate marketing links.</li>
            <li>Plagiarized documentation or materials violating copyright laws.</li>
            <li>Hate speech, harassment, or abusive comments.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. Intellectual Property</h2>
          <p className="text-[var(--color-text-secondary)]">
            You retain full ownership of the copyright for the text and code snippets you compose on RecallStack. By publishing notes publicly, you grant RecallStack a worldwide, royalty-free license to host, display, index, and distribute your guides to other users on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. Disclaimer of Warranties</h2>
          <p className="text-[var(--color-text-secondary)]">
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. RecallStack makes no warranties regarding system uptime, data persistence, or the absolute correctness of user-published study notes.
          </p>
        </section>
      </div>
    </div>
  );
}
