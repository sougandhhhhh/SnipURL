'use client';

import { useState } from 'react';
import { useSnapStore } from '../context/store';
import { ExternalLink, Copy, Check, AlertTriangle, Lock, Unlock, ClipboardPaste } from 'lucide-react';

export default function ExpandForm({ origin: baseOrigin }: { origin?: string }) {
  const { expandUrl, expandExternalUrl, unlockUrl } = useSnapStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ longUrl?: string; passwordProtected?: boolean; shortCode?: string; error?: string; externalUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const parseUrl = (value: string) => {
    const raw = value.trim();
    if (!raw) return null;
    try {
      return new URL(raw);
    } catch {
      try {
        return new URL(`https://${raw}`);
      } catch {
        return null;
      }
    }
  };

  const looksLikeExternalUrl = (value: string) => {
    const raw = value.trim();
    if (!raw) return false;
    return /:\/\//i.test(raw) || /^www\./i.test(raw) || /^[^\s/]+\.[^\s/]+/i.test(raw);
  };

  const isSnipUrlHost = (host: string) => {
    const appHost = (() => {
      try {
        return new URL(baseOrigin || window.location.origin).host.toLowerCase();
      } catch {
        return window.location.host.toLowerCase();
      }
    })();
    const normalizedHost = host.toLowerCase();
    return normalizedHost === appHost || normalizedHost.endsWith(`.${appHost}`);
  };

  const handleExpand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setPassword('');
    setPasswordError('');
    try {
      const parsed = parseUrl(input);
      if (parsed && looksLikeExternalUrl(input) && !isSnipUrlHost(parsed.host)) {
        try {
          const data = await expandExternalUrl(parsed.href);
          setResult({ longUrl: data.longUrl });
        } catch (err: any) {
          setResult({
            error: err.message || 'Failed to resolve external link',
            externalUrl: parsed.href,
          });
        }
        return;
      }

      const data = await expandUrl(input.trim());
      if ('passwordProtected' in data && data.passwordProtected) {
        setResult({ passwordProtected: true, shortCode: data.shortCode });
      } else if ('longUrl' in data) {
        setResult({ longUrl: data.longUrl });
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Failed to resolve link' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !result?.shortCode) return;
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const data = await unlockUrl(result.shortCode, password);
      if (data.longUrl) {
        setResult({ longUrl: data.longUrl });
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.longUrl) {
      navigator.clipboard.writeText(result.longUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleExpand} className="space-y-4">
        <div className="relative">
          <input
            type="text" required value={input} onChange={e => setInput(e.target.value)}
            placeholder="Paste short URL or code (e.g. https://url6.vercel.app/abc123 or abc123)"
            className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border pl-4 pr-24 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
          />
          <button
            type="button"
            onClick={async () => { try { const text = await navigator.clipboard.readText(); setInput(text); } catch {} }}
            className="absolute right-1 top-1 flex h-8 items-center gap-1.5 rounded-full border border-[#22305c] bg-[#111a37] px-3 text-[10px] font-semibold text-[#8eb2ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-[#2d3e77] hover:bg-[#142044] hover:text-[#a7c1ff]"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-ghost w-full justify-center text-[10px]">
          {loading ? 'Resolving...' : 'Expand'} <ExternalLink className="h-3 w-3" />
        </button>
      </form>

      {result && (
        <div className="glass rounded-2xl p-5 space-y-4 animate-fade-in">
          {result.error && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-red-400">{result.error}</p>
                <p className="font-body text-[10px] text-ghost-white/40 mt-1">
                  {result.externalUrl ? (
                    <>
                      Open the provider's official unlock page for this link:
                      <a href={result.externalUrl} target="_blank" rel="noreferrer" className="text-ecto-green underline underline-offset-2 ml-1">
                        {result.externalUrl}
                      </a>
                    </>
                  ) : (
                    'Check the code and try again.'
                  )}
                </p>
              </div>
            </div>
          )}

          {result.longUrl && (
            <>
              <div className="flex items-start gap-3">
                <ExternalLink className="h-4 w-4 text-ecto-green shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60 mb-1">Original URL</p>
                  <a href={result.longUrl} target="_blank" rel="noopener noreferrer"
                    className="font-body text-sm text-ecto-green underline underline-offset-2 decoration-ecto-green/30 break-all hover:decoration-ecto-green/60 transition-colors">
                    {result.longUrl}
                  </a>
                </div>
                <button onClick={handleCopy} className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors shrink-0" title="Copy">
                  {copied ? <Check className="h-3.5 w-3.5 text-ecto-green" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </>
          )}

          {result.passwordProtected && !result.longUrl && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-mono text-xs text-yellow-400">Password Protected</p>
                  <p className="font-body text-[10px] text-ghost-white/40 mt-1">
                    Enter the password to expand this link.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="password" required value={password} onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Enter password"
                  className="flex-1 h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
                  autoFocus
                />
                <button type="submit" disabled={passwordLoading}
                  className="btn-ghost shrink-0 h-10 px-4 text-[10px]">
                  {passwordLoading ? 'Unlocking...' : 'Unlock'} <Unlock className="h-3 w-3" />
                </button>
              </div>
              {passwordError && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] text-red-400">{passwordError}</p>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
