// frontend/src/app/privacy/page.js
'use client';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="mb-10 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[var(--color-text-secondary)]">Last updated: June 20, 2026</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--color-text-primary)]">
        <section>
          <h2 className="text-lg font-bold mb-3">1. Information We Collect</h2>
          <p className="mb-3 text-[var(--color-text-secondary)]">
            We collect information you provide directly to us when creating an account, publishing note drafts, writing comments, or setting preferences.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <li><strong>Account Data:</strong> Username, email address, password hash, and full name.</li>
            <li><strong>User Content:</strong> Draft and published notes, sections, tags, code snippets, rating scores, and comment histories.</li>
            <li><strong>Preferences:</strong> Layout density preferences, bookmark indexes, and active theme preferences.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. How We Use Your Information</h2>
          <p className="mb-3 text-[var(--color-text-secondary)]">
            We use the information we collect to operate and improve RecallStack:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <li>Provide note editing, sharing, and bookmarks synchronization.</li>
            <li>Authenticate user logins and secure administrative profiles.</li>
            <li>Calculate public note ratings and page view statistics.</li>
            <li>Send occasional operational email updates (password resets, service notifications).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. Data Sharing & Security</h2>
          <p className="text-[var(--color-text-secondary)]">
            RecallStack does not sell, lease, or share your private notes or credentials with third-party advertisers. All personal account information is stored securely in encrypted databases. Public notes and comments are visible to all users on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. Cookies and Local Storage</h2>
          <p className="text-[var(--color-text-secondary)]">
            We use standard web browser LocalStorage to save authentication tokens (JWT) and user preference settings (e.g. layout density). Cookies are not used for third-party tracking.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. Your Choices & Data Deletion</h2>
          <p className="text-[var(--color-text-secondary)]">
            You can modify your profile settings, delete notes, or remove comments at any time. If you wish to delete your account entirely, please contact support and all associated notes and profile data will be permanently wiped from our active directories.
          </p>
        </section>
      </div>
    </div>
  );
}
