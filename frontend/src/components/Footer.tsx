'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative border-t border-glass-border bg-bg-void pt-16 pb-8 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-ecto-green/20 to-transparent pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/logo.svg" alt="SnipURL" width="28" height="28" />
              <span className="font-brand text-base tracking-widest">
              <span className="text-ghost-white">SNIP</span><span className="text-ecto-green">URL</span>
            </span>
            </Link>
            <p className="text-xs font-body text-ghost-white/40 leading-relaxed">
              Edge-deployed URL shortening. Spectral analytics. Ghost-light redirects.
            </p>
            <div className="flex space-x-4 pt-2">
              {['X', 'Git', 'Chat'].map(label => (
                <a key={label} href="#" className="font-mono text-[10px] tracking-[0.1em] uppercase text-ghost-white/30 hover:text-ecto-green transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Venture', links: ['Redirects', 'Enterprise'] },
            { title: 'Developer', links: ['API Keys', 'Status', 'Expand'] },
          ].map(group => (
            <div key={group.title} className="space-y-4">
              <h4 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map(link => (
                  <li key={link}>
                    <Link href={link === 'Expand' ? '/expand' : '#'} className="font-body text-sm text-ghost-white/40 hover:text-ghost-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h4 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60">
              Subscribe
            </h4>
            <p className="text-xs font-body text-ghost-white/40">
              Spectral updates to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.co"
                className="w-full rounded-full bg-white/5 border border-glass-border px-4 py-2.5 pr-12 text-xs text-ghost-white placeholder-ghost-white/30 focus:border-ecto-green/50 focus:outline-none transition-colors font-body"
              />
              <button type="submit" className="absolute right-1.5 rounded-full bg-ecto-green/10 border border-ecto-green/30 p-1.5 text-ecto-green hover:bg-ecto-green/20 transition-colors">
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
            {subscribed && (
              <span className="block text-[10px] font-mono text-ecto-green animate-pulse tracking-[0.1em] uppercase">
                Summoned ✓
              </span>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-glass-border pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono tracking-[0.1em] uppercase text-ghost-white/20 gap-4">
          <span>&copy; {new Date().getFullYear()} SnipURL. Spectral rights reserved.</span>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:text-ghost-white/50 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-ghost-white/50 transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-ghost-white/50 transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
