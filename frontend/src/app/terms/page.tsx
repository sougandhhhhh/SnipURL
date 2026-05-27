'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-void py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <h1 className="font-display text-4xl sm:text-5xl tracking-[0.05em] text-ghost-white">Terms</h1>
          <p className="font-body text-base text-ghost-white/40">Last updated: May 26, 2026</p>
        </div>
        <div className="space-y-8 font-body text-sm text-ghost-white/60 leading-relaxed">
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">1. Acceptance of Terms</h2>
            <p>By using SnipURL, you agree to comply with these Terms of Service. If you do not agree to any part of these terms, you may not use our service. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of those changes.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">2. Service Description</h2>
            <p>SnipURL is a URL shortening service that allows users to create shortened links, customize aliases, set expiration dates, protect with passwords, and view click analytics. Our service operates on a global Cloudflare edge network with D1 database storage.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">3. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Providing accurate account information</li>
              <li>Maintaining confidentiality of API keys</li>
              <li>Not shortening URLs that contain malware, phishing, or illegal content</li>
              <li>Not using the service for spam or unauthorized link generation</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">4. Prohibited Content</h2>
            <ul className="list-disc list-inside space-y-2 ml-4 text-ghost-white/40">
              <li>Violates intellectual property rights</li>
              <li>Contains malware, viruses, or phishing attempts</li>
              <li>Promotes illegal activities or violence</li>
              <li>Is used for spam, harassment, or abuse</li>
              <li>Violates platform terms or community guidelines</li>
            </ul>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">5. Intellectual Property</h2>
            <p>SnipURL retains all rights to its platform, code, and infrastructure. The URLs you shorten remain your property, but by using our service, you grant us a limited license to store and serve these links for analytics purposes.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">6. Limitation of Liability</h2>
            <p>SnipURL is provided &ldquo;as is&rdquo; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service, including lost data or business interruption.</p>
          </section>
          <section className="space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">7. Termination</h2>
            <p>We reserve the right to terminate or suspend your account for violations of these terms, including shortening malicious or illegal content. Upon termination, your shortened links may be deactivated.</p>
          </section>
          <section className="glass rounded-xl p-6 mt-12 space-y-4">
            <h2 className="font-display text-xl tracking-[0.05em] text-ecto-green">Questions?</h2>
            <p>Contact <span className="text-ecto-green/70">legal@snipurl.co</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
