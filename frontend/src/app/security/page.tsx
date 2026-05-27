'use client';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-bg-void py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-display text-4xl sm:text-5xl tracking-[0.05em] text-ghost-white">Security</h1>
          <p className="font-body text-base text-ghost-white/40">Last updated: May 26, 2026</p>
        </div>
        <div className="space-y-8 font-body text-sm text-ghost-white/60 leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">1. Infrastructure Security</h2>
            <p>SnipURL operates on Cloudflare's globally distributed edge network, providing:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>DDoS protection and edge security</li>
              <li>Automatic HTTPS/TLS encryption for all traffic</li>
              <li>KV edge storage for ultra-fast redirect serving</li>
              <li>D1 database encryption at rest and in transit</li>
              <li>Regular security audits and compliance monitoring</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">2. API Key Management</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Never share API keys in public repositories or client-side code</li>
              <li>Rotate keys regularly and revoke old ones immediately</li>
              <li>Use separate keys for different environments (dev, staging, production)</li>
              <li>Monitor API key usage logs for suspicious activity</li>
              <li>Set rate limits and IP whitelisting where possible</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">3. Link Protection</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li><span className="text-ecto-green/70">Password Protection:</span> Protect links with passwords requiring visitors to enter credentials before redirecting</li>
              <li><span className="text-ecto-green/70">Expiration Scheduling:</span> Automatically disable links after a specified date and time</li>
              <li><span className="text-ecto-green/70">Link Deactivation:</span> Manually deactivate links at any time through the dashboard</li>
              <li><span className="text-ecto-green/70">Spam Detection:</span> Our system automatically blocks known malicious and phishing URLs</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">4. Data Privacy</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Encrypted storage in D1 database with AES-256 encryption</li>
              <li>Analytics data collected securely and stored separately</li>
              <li>IP addresses and device information anonymized after 90 days</li>
              <li>No third-party data sharing without explicit consent</li>
              <li>GDPR and privacy regulation compliance</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">5. Malware & Phishing Detection</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Real-time URL validation using industry-standard threat databases</li>
              <li>Automatic blocking of known malware and phishing URLs</li>
              <li>User reporting system for suspicious or abusive links</li>
              <li>Admin review process for flagged content</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">6. Incident Response</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>We will investigate and remediate the issue immediately</li>
              <li>Affected users will be notified within 48 hours</li>
              <li>Detailed incident reports will be provided</li>
              <li>Remediation steps and preventative measures will be shared</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">7. Vulnerability Disclosure</h2>
            <p>If you discover a security vulnerability in SnipURL, please report it responsibly to <span className="text-ecto-green/70">security@snipurl.co</span></p>
          </section>
          <section className="glass rounded-xl p-6 mt-12 space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">Report a Security Issue</h2>
            <p>Email <span className="text-ecto-green/70">security@snipurl.co</span> with a description and steps to reproduce.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
