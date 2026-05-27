'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-specter-blue/5 blur-[120px] pointer-events-none" />

      <div className="glass-strong w-full max-w-lg p-12 rounded-3xl text-center space-y-8">
        <img src="/logo.svg" alt="SnipURL" width="80" height="80" className="mx-auto" />

        <div className="space-y-3">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50">404</span>
          <h2 className="font-display text-3xl tracking-[0.05em] text-ghost-white">Lost in the Void</h2>
          <p className="font-body text-sm text-ghost-white/40 max-w-sm mx-auto">
            This URL has vanished into the ether. No redirect mapping exists for this path.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/" className="btn-ghost text-[10px] py-3 px-6">
            Return Home
          </Link>
          <Link href="/#features" className="btn-outline text-[10px] py-3 px-6">
            Explore
          </Link>
        </div>

        <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/20 border-t border-glass-border pt-4">
          SnipURL &middot; Spectral Redirects
        </div>
      </div>
    </div>
  );
}
