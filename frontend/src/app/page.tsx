'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSnapStore } from '../context/store';
import ExpandForm from '../components/ExpandForm';
import { ArrowRight, ChevronDown, Copy, Check, Download, Globe, BarChart3, Code2, Lock, Calendar, QrCode, ExternalLink, Scissors } from 'lucide-react';

const features = [
  { icon: Globe, title: 'Edge Redirect Engine', desc: 'Cloudflare KV memory caching processes redirects in milliseconds from edge nodes near your visitors.' },
  { icon: BarChart3, title: 'Spectral Analytics', desc: 'Track timelines, devices, browsers, countries, and referrers in deep graphical detail.' },
  { icon: Code2, title: 'REST API', desc: 'Provision API keys and integrate shortening into servers, webhooks, or terminal workflows.' },
  { icon: Lock, title: 'Password Gates', desc: 'Add gateway credentials to short codes, blocking unauthorized traffic behind a challenge screen.' },
  { icon: Calendar, title: 'Expiration Schedules', desc: 'Set exact termination times for redirects to keep campaigns and temporary links controlled.' },
  { icon: QrCode, title: 'High-Res QR Codes', desc: 'Auto-generate scannable matrix codes for every target, printable as high-resolution PNGs.' },
];

const faqs = [
  { q: 'How does SnipURL deliver redirects in under 10 milliseconds?', a: 'We utilize Cloudflare KV at the edge. When a shortened URL is requested, our edge Hono Worker retrieves the destination mapping instantly from memory without ever querying our primary SQL database.' },
  { q: 'Can I use my own custom domain?', a: 'Yes! Pro and Enterprise tiers allow you to link custom domains and define white-label short code schemes for corporate brand distributions.' },
  { q: 'Are the redirects search-engine friendly?', a: 'SnipURL uses standard HTTP 302/301 redirects, ensuring full SEO link juice and search ranking authority is cleanly forwarded to your target websites.' },
  { q: 'Can I schedule links to expire or protect them with passwords?', a: 'Yes. Link options include calendar scheduling to expire access at an exact hour, as well as password challenges to restrict redirects to authorized users.' },
];

const steps = [
  { step: '01', title: 'Paste URL', desc: 'Provide your long destination URL and configure options like custom aliases or password protection.' },
  { step: '02', title: 'Generate Code', desc: 'The edge engine compiles a secure short code or applies your chosen custom alias instantly.' },
  { step: '03', title: 'Distribute', desc: 'Deploy globally across edge nodes and track click analytics in real-time from your dashboard.' },
];

function GhostBurst() {
  const [go, setGo] = useState(false);
  const ghosts = useRef<{ id: number; angle: number; dist: number; delay: number }[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      angle: (i / 15) * 360 + Math.random() * 20,
      dist: 250 + Math.random() * 350,
      delay: Math.random() * 0.06,
    }))
  ).current;

  const start = useCallback(() => {
    requestAnimationFrame(() => setGo(true));
    setTimeout(() => setGo(false), 500);
  }, []);

  useEffect(() => { const t = setTimeout(start, 10); return () => clearTimeout(t); }, [start]);

  if (!go) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {ghosts.map((g) => {
        const x = Math.cos((g.angle * Math.PI) / 180) * g.dist;
        const y = Math.sin((g.angle * Math.PI) / 180) * g.dist;
        return (
          <div
            key={g.id}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out"
            style={{
              transform: go
                ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.2)`
                : 'translate(-50%, -50%) scale(1)',
              opacity: go ? 0 : 1,
              transitionDelay: `${g.delay}s`,
            }}
          >
            <svg width="22" height="26" viewBox="-15 -15 30 35" fill="none">
              <path d="M0 -12 C-8 -12 -14 -6 -14 0 L-14 10 C-14 14 -18 16 -20 14 L-22 12 L-24 16 L-26 12 L-28 16 L-28 0 C-28 -6 -22 -12 -14 -12 L14 -12 C22 -12 28 -6 28 0 L28 16 L26 12 L24 16 L22 12 L20 14 C18 16 14 14 14 10 L14 0 C14 -6 8 -12 0 -12Z"
                fill="white" stroke="white" strokeWidth="1" />
              <circle cx="-8" cy="-2" r="2" fill="#0a0a0f" />
              <circle cx="8" cy="-2" r="2" fill="#0a0a0f" />
              <path d="M-5 4 Q0 8 5 4" stroke="#0a0a0f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const { shortenUrl, loading, user } = useSnapStore();
  const [mode, setMode] = useState<'shorten' | 'expand'>('shorten');
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [password, setPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [ghostKey, setGhostKey] = useState(0);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin((process.env.NEXT_PUBLIC_DISPLAY_DOMAIN || window.location.origin).replace(/\/+$/, '').trim());
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    try {
      const link = await shortenUrl(longUrl, {
        customAlias: customAlias || undefined,
        password: password || undefined,
      });
      const baseUrl = (process.env.NEXT_PUBLIC_DISPLAY_DOMAIN || window.location.origin).replace(/\/+$/, '').trim();
      setResult({ shortUrl: `${baseUrl}/${link.shortCode}`, longUrl: link.longUrl, shortCode: link.shortCode });
      setGhostKey(k => k + 1);
      setLongUrl('');
      setCustomAlias('');
      setPassword('');
      setShowAdvanced(false);
    } catch (err: any) {
      alert(err.message || 'Error shortening URL');
    }
  };

  const handleCopy = () => {
    if (result?.shortUrl) {
      navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GhostBurst key={ghostKey} />
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-bg-void/80 backdrop-blur-sm" onClick={() => setResult(null)} />
          <div className="glass-strong relative w-full max-w-lg p-10 rounded-3xl text-center space-y-8 animate-fade-in">
            <button onClick={() => setResult(null)} className="absolute top-5 right-5 text-ghost-white/30 hover:text-ghost-white font-mono text-3xl leading-none">&times;</button>

            <span className="font-mono text-xs tracking-[0.2em] uppercase text-ecto-green block">Link Summoned</span>

            {/* QR Code */}
            <div className="mx-auto bg-white p-3 rounded-2xl w-44 h-44 flex items-center justify-center shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(result.shortUrl)}`}
                alt="QR"
                className="w-40 h-40"
              />
            </div>

            {/* Short URL */}
            <div className="flex items-center gap-3 glass rounded-xl px-5 py-4 border border-glass-border">
              <span
                onClick={() => window.open(result.shortUrl, '_blank')}
                className="text-base text-ecto-green underline underline-offset-2 decoration-ecto-green/40 truncate cursor-pointer font-mono flex-1"
              >
                {result.shortUrl.replace(/^https?:\/\//, '')}
              </span>
              <button onClick={handleCopy} className="text-ecto-green hover:text-ecto-green/80 shrink-0 p-1.5">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            {!user && (
              <p className="font-body text-sm text-ghost-white/50 leading-relaxed">
                This link will disappear forever after closing this modal. Copy the QR and link now.
              </p>
            )}

            {/* Auth message */}
            {user ? (
              <p className="font-mono text-xs tracking-[0.1em] text-ecto-green/70">
                This link is saved in your dashboard &rarr;
              </p>
            ) : (
              <div className="pt-2">
                <Link href="/login" className="btn-ghost text-sm py-3 px-8">Sign In / Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8 text-center">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-ecto-green/3 blur-[150px] pointer-events-none" />

        <h1 className="font-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.05em] text-ghost-white leading-[1.15]">
          Shorten the
          <br />
          <span className="text-ecto-green drop-shadow-[0_0_30px_rgba(57,255,144,0.3)]">Void</span>
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-base sm:text-lg font-body text-ghost-white/50 leading-relaxed">
          Edge-deployed URL shortening with ghost-light redirects, spectral analytics, and password gates.
        </p>

        {/* FLOATING GHOSTS */}
        <div className="absolute top-20 left-[8%] w-16 h-16 opacity-10 pointer-events-none animate-float-slow">
          <svg viewBox="0 0 100 100" fill="#39ff90">
            <path d="M50 5C27.9 5 10 22.9 10 45c0 15 7 28 18 36.5V95l12-8 10 8V81.5C61 73 68 60 68 45 68 22.9 72.1 5 50 5z" />
          </svg>
        </div>
        <div className="absolute top-32 right-[10%] w-10 h-10 opacity-8 pointer-events-none animate-float-slower">
          <svg viewBox="0 0 100 100" fill="#a0c4ff">
            <path d="M50 5C27.9 5 10 22.9 10 45c0 15 7 28 18 36.5V95l12-8 10 8V81.5C61 73 68 60 68 45 68 22.9 72.1 5 50 5z" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-[20%] w-12 h-12 opacity-6 pointer-events-none animate-float-medium">
          <svg viewBox="0 0 100 100" fill="#7c6fa0">
            <path d="M50 5C27.9 5 10 22.9 10 45c0 15 7 28 18 36.5V95l12-8 10 8V81.5C61 73 68 60 68 45 68 22.9 72.1 5 50 5z" />
          </svg>
        </div>
      </section>

      {/* SHORTENER / EXPANDER */}
      <section className="mx-auto max-w-2xl px-4 mt-12 sm:px-6">
        <div className="glass rounded-2xl p-6 sm:p-8 glow-ecto">
          <div className="flex border-b border-glass-border mb-6 -mx-1">
            <button
              onClick={() => setMode('shorten')}
              className={`flex-1 pb-3 px-4 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors relative ${
                mode === 'shorten' ? 'text-ecto-green' : 'text-ghost-white/30 hover:text-ghost-white/60'
              }`}
            >
              <Scissors className="h-3 w-3 inline mr-1.5 -mt-0.5" />
              Shorten
              {mode === 'shorten' && <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-ecto-green shadow-[0_0_6px_rgba(57,255,144,0.5)]" />}
            </button>
            <button
              onClick={() => setMode('expand')}
              className={`flex-1 pb-3 px-4 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors relative ${
                mode === 'expand' ? 'text-ecto-green' : 'text-ghost-white/30 hover:text-ghost-white/60'
              }`}
            >
              <ExternalLink className="h-3 w-3 inline mr-1.5 -mt-0.5" />
              Expand
              {mode === 'expand' && <span className="absolute bottom-0 left-4 right-4 h-[1px] bg-ecto-green shadow-[0_0_6px_rgba(57,255,144,0.5)]" />}
            </button>
          </div>

          {mode === 'shorten' ? (
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={longUrl}
                  onChange={e => setLongUrl(e.target.value)}
                  placeholder="Paste a long URL..."
                  className="flex-1 h-12 rounded-full bg-white/[0.04] border border-glass-border px-5 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ghost justify-center h-12 px-6 text-[10px]"
                >
                  {loading ? 'Summoning...' : 'Shorten'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors flex items-center gap-1.5"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                {showAdvanced ? 'Hide options' : 'Alias & protection'}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <input
                    type="text"
                    value={customAlias}
                    onChange={e => setCustomAlias(e.target.value)}
                    placeholder="Custom alias (e.g. my-link)"
                    className="h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password protect"
                    className="h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
                  />
                </div>
              )}
            </form>
          ) : (
            <ExpandForm origin={origin} />
          )}
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="mx-auto max-w-7xl px-4 mt-20 sm:px-6 lg:px-8 border-t border-glass-border pt-12 text-center">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ghost-white/20">Trusted by</span>
        <div className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4 opacity-25">
          {['Stripe', 'Vercel', 'Linear', 'Arc', 'Supabase', 'Clerk'].map(c => (
            <span key={c} className="font-display text-base tracking-widest text-ghost-white/40">{c}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 mt-24 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl tracking-[0.05em] text-ghost-white">Ethereal by Design</h2>
          <p className="mt-3 font-body text-base text-ghost-white/40">Built on the edge. Haunted by performance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="ghost-card p-6 flex flex-col justify-between min-h-[220px]">
                <Icon className="h-7 w-7 text-ecto-green/60" />
                <div>
                  <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white mb-2">{f.title}</h3>
                  <p className="font-body text-xs text-ghost-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 mt-24 sm:px-6 lg:px-8 border-t border-glass-border pt-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl tracking-[0.05em] text-ghost-white">Summon in Three</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <div key={i} className="text-center space-y-4">
              <span className="font-mono text-lg text-ecto-green/50">{s.step}</span>
              <h3 className="font-display text-base tracking-[0.1em] text-ghost-white">{s.title}</h3>
              <p className="font-body text-sm text-ghost-white/40 max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 mt-24 sm:px-6 lg:px-8 border-t border-glass-border pt-16">
        <h2 className="font-display text-3xl sm:text-4xl tracking-[0.05em] text-ghost-white text-center mb-10">Specters & Answers</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const open = activeFaq === i;
            return (
              <div key={i} className="glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(open ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-body text-sm text-ghost-white/80">{faq.q}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-ghost-white/30 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-5 pb-4 text-xs font-body text-ghost-white/40 leading-relaxed border-t border-glass-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 mt-24 mb-16 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-12 sm:p-16 text-center glow-ecto-strong">
          <h2 className="font-display text-3xl sm:text-4xl tracking-[0.05em] text-ghost-white">Enter the Void</h2>
          <p className="mt-4 font-body text-base text-ghost-white/50 max-w-lg mx-auto">
            Thousands of developers already trust SnipURL for ghost-light redirects.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/login?tab=register" className="btn-ghost">
              Summon Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
