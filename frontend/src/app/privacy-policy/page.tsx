import type { Metadata } from "next";
import { alternatesFor } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy - OverCreate',
  description:
    'Privacy and data protection policy for OverCreate. Learn how we process and protect your personal data according to GDPR.',
  alternates: alternatesFor('/privacy-policy'),
  openGraph: {
    title: 'Privacy Policy - OverCreate',
    description:
      'Privacy and data protection policy for OverCreate. Learn how we process and protect your personal data according to GDPR.',
    url: '/privacy-policy',
    type: 'article',
    siteName: 'OverCreate',
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 text-white/80 leading-relaxed selection:bg-white/10">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

      <p className="mb-4 text-white/70">
        Last updated: <strong>October 24, 2025</strong>
      </p>

      <p className="mb-6">
        This Privacy Policy describes how <strong>OverCreate</strong> (“we”,
        “us”, “our”) collects, uses and protects personal data in accordance
        with the <strong>GDPR</strong> and applicable Polish data protection
        law. By using this website, you agree to this Privacy Policy.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">1. Data Controller</h2>
        <p>
          The controller of your personal data is an individual operating as{" "}
          <strong>OverCreate Studio</strong> (without a legal entity) based in
          Poland.
        </p>
        <p>
          Contact for data protection inquiries:{" "}
          <a
            href="mailto:overcreate.studio@gmail.com"
            className="text-acc2 underline hover:text-acc1 transition"
          >
            overcreate.studio@gmail.com
          </a>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">
          2. What data we collect
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account & Authentication:</strong> name, email, password
            (hashed), and session tokens.
          </li>
          <li>
            <strong>Contact forms:</strong> name, email address, message content
            and attachments (if provided).
          </li>
          <li>
            <strong>Uploaded content:</strong> portfolio media (images, videos)
            and project information.
          </li>
          <li>
            <strong>Technical logs:</strong> IP address, browser headers,
            timestamps, pages visited.
          </li>
          <li>
            <strong>Cookies & Local Storage:</strong> used for authentication,
            preferences, and consent.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">
          3. Purpose and legal basis
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Providing user accounts and services (GDPR Art. 6(1)(b)).</li>
          <li>Responding to contact requests (GDPR Art. 6(1)(b)).</li>
          <li>
            Protecting the website and preventing abuse (GDPR Art. 6(1)(f)).
          </li>
          <li>
            Displaying client projects and portfolio with consent (GDPR Art.
            6(1)(a)).
          </li>
          <li>
            Storing necessary cookies for website functionality (GDPR Art.
            6(1)(f)); optional analytics only with your consent (Art. 6(1)(a)).
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">
          4. Data storage and retention
        </h2>
        <p>
          Your personal data is stored securely and retained only for as long as
          necessary:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Accounts — while active and up to 30 days after deletion.</li>
          <li>Contact requests — up to 24 months.</li>
          <li>Security logs — 90 to 180 days.</li>
          <li>
            Portfolio materials — until consent is withdrawn or project
            published.
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">
          5. Data processors and transfers
        </h2>
        <p>We use trusted third-party service providers:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Hosting / Database:</strong> railway.
          </li>
          <li>
            <strong>Media Storage:</strong> Cloudflare R2.
          </li>
          <li>
            <strong>Email:</strong> Gmail.
          </li>
          <li>
            [Optional] Analytics — only if explicitly enabled by consent.
          </li>
        </ul>
        <p className="mt-2">
          Where data is transferred outside the EEA, we ensure adequate
          safeguards via Standard Contractual Clauses (SCCs).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">
          6. Your rights under GDPR
        </h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access, correct or delete your data.</li>
          <li>Withdraw consent at any time.</li>
          <li>Restrict or object to processing.</li>
          <li>Request a copy (data portability).</li>
          <li>
            File a complaint with the <strong>UODO</strong> (Polish Data
            Protection Office) if you believe your rights are violated.
          </li>
        </ul>
        <p className="mt-2">
          To exercise your rights, contact us at{" "}
          <a
            href="mailto:overcreate.studio@gmail.com"
            className="text-acc2 underline hover:text-acc1 transition"
          >
            overcreate.studio@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
        <p className="mb-2">
          This site uses cookies and local storage to ensure proper
          functionality (e.g., login, preferences, and cookie consent banner).
          Optional analytics or media embeds are only activated after you grant
          consent.
        </p>
        <p>
          You can withdraw consent or change cookie preferences at any time via
          “Cookie Settings” in the footer or by clearing your browser cookies.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">8. Children</h2>
        <p>
          Our services are not intended for children under 16. If you believe a
          child provided us personal data, please contact us to remove it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">9. Changes</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest
          version will always be available at{" "}
          <a
            href="/privacy-policy"
            className="text-acc2 underline hover:text-acc1 transition"
          >
            overcreate.co/privacy-policy
          </a>
          .
        </p>
      </section>

      <p className="mt-10 text-white/60 text-sm">
        © {new Date().getFullYear()} OverCreate Studio. All rights reserved.
      </p>
    </main>
  );
}
