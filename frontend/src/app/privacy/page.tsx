'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-void py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-display text-4xl sm:text-5xl tracking-[0.05em] text-ghost-white">Privacy</h1>
          <p className="font-body text-base text-ghost-white/40">Last updated: May 26, 2026</p>
        </div>
        <div className="space-y-8 font-body text-sm text-ghost-white/60 leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">1. Information We Collect</h2>
            <p>SnipURL collects information you provide directly and information automatically collected when using our service. This includes URLs you shorten, custom aliases, expiration settings, and click analytics data.</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Account information (email, name)</li>
              <li>Link creation data (original URLs, aliases, passwords)</li>
              <li>Click analytics (IP address, device, browser, referrer)</li>
              <li>API key usage logs</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">2. How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Provide and improve the URL shortening service</li>
              <li>Generate click analytics and reporting</li>
              <li>Authenticate API requests and manage access keys</li>
              <li>Detect and prevent spam or malicious activity</li>
              <li>Send service notifications and updates</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">3. Data Security</h2>
            <p>SnipURL employs industry-standard security measures to protect your data. Your information is stored on Cloudflare's edge network and D1 databases with encryption in transit and at rest. We do not sell or share your personal data with third parties.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">4. Cookies and Tracking</h2>
            <p>SnipURL uses essential cookies to maintain your session and remember your theme preference. We do not use tracking cookies or third-party analytics services that track your personal behavior across the web.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">5. Your Rights</h2>
            <p>You have the right to access, modify, or delete your personal data at any time. You may revoke API keys, deactivate links, or request complete account deletion by contacting our support team.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">6. Changes to This Policy</h2>
            <p>We may update this privacy policy periodically. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your continued use of SnipURL constitutes acceptance of any changes.</p>
          </section>
          <section className="glass rounded-xl p-6 mt-12 space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">Questions?</h2>
            <p>Contact <span className="text-ecto-green/70">privacy@snipurl.co</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
