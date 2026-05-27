'use client';

import { useState } from 'react';
import { Terminal, Copy, Check, ShieldAlert, Cpu, Code2, Zap } from 'lucide-react';

const codeSnippets = {
  shorten: {
    curl: `curl -X POST https://api.snapurl.co/api/v1/shorten \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: su_live_your_api_key_here" \\
  -d '{
    "longUrl": "https://github.com/example",
    "customAlias": "my-link",
    "password": "optionalPass",
    "expiresAt": 1785500000000
  }'`,
    javascript: `fetch('https://api.snapurl.co/api/v1/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': 'su_live_your_api_key_here' },
  body: JSON.stringify({ longUrl: 'https://github.com/example', customAlias: 'my-link', password: 'optionalPass', expiresAt: 1785500000000 })
}).then(r => r.json()).then(console.log)`,
    python: `import requests
requests.post('https://api.snapurl.co/api/v1/shorten',
  json={"longUrl": "https://github.com/example", "customAlias": "my-link", "password": "optionalPass", "expiresAt": 1785500000000},
  headers={"x-api-key": "su_live_your_api_key_here"}
).json()`,
  },
  list: {
    curl: `curl -X GET https://api.snapurl.co/api/v1/links -H "x-api-key: su_live_your_api_key_here"`,
    javascript: `fetch('https://api.snapurl.co/api/v1/links', { headers: { 'x-api-key': 'su_live_your_api_key_here' } }).then(r => r.json()).then(console.log)`,
    python: `import requests\nrequests.get('https://api.snapurl.co/api/v1/links', headers={"x-api-key": "su_live_your_api_key_here"}).json()`,
  },
};

const responseExamples = {
  shorten: `{
  "success": true,
  "id": "link_8f29ea1b",
  "shortCode": "my-link",
  "shortUrl": "https://snip.url/my-link",
  "longUrl": "https://github.com/example",
  "passwordEnabled": true,
  "expiresAt": 1785500000000
}`,
  error: `{ "error": "Custom alias already in use" }`,
};

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="absolute top-[15%] left-1/3 -z-10 h-80 w-80 rounded-full bg-ecto-green/3 blur-[90px] pointer-events-none" />

      <div className="border-b border-glass-border pb-6 space-y-3">
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white flex items-center gap-2">
          <Terminal className="h-6 w-6 text-ecto-green/60" /> API
        </h1>
        <p className="font-body text-sm text-ghost-white/40">
          Programmatic shortening. All endpoints require a valid{' '}
          <a href="/settings" className="text-ecto-green/70 hover:underline">API key</a>.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Cpu, title: 'Base URL', val: 'https://api.snapurl.co' },
          { icon: Code2, title: 'Auth', val: 'Header: x-api-key' },
          { icon: Zap, title: 'Rate Limit', val: '100 req/min per key' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border text-ecto-green/50">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60">{s.title}</h3>
              <span className="font-mono text-xs text-ecto-green/70 block">{s.val}</span>
            </div>
          );
        })}
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ecto-green bg-ecto-green/10 border border-ecto-green/30 rounded-md px-2.5 py-1">POST</span>
          <span className="font-mono text-sm text-ghost-white">/api/v1/shorten</span>
          <span className="font-body text-xs text-ghost-white/40">Create a shortened URL.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60">Parameters</h4>
            {[
              { name: 'longUrl', type: 'string (required)', desc: 'Target URL with HTTP/HTTPS.' },
              { name: 'customAlias', type: 'string (optional)', desc: 'Custom short code.' },
              { name: 'password', type: 'string (optional)', desc: 'Password gate the redirect.' },
              { name: 'expiresAt', type: 'integer (optional)', desc: 'Epoch ms expiration.' },
            ].map((p, i) => (
              <div key={i} className="border-b border-glass-border pb-2 last:border-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-ecto-green/70">{p.name}</span>
                  <span className="font-mono text-[8px] text-ghost-white/30 uppercase">{p.type}</span>
                </div>
                <p className="font-body text-xs text-ghost-white/40">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex bg-bg-surface border-b border-glass-border px-4 justify-between items-center">
              <div className="flex gap-4">
                {(['curl', 'javascript', 'python'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`h-10 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
                      activeTab === tab ? 'text-ecto-green border-b-2 border-ecto-green' : 'text-ghost-white/30 hover:text-ghost-white/60'
                    }`}>{tab}</button>
                ))}
              </div>
              <button onClick={() => handleCopy('shorten', codeSnippets.shorten[activeTab])} className="text-ghost-white/30 hover:text-ecto-green p-1">
                {copiedCode === 'shorten' ? <Check className="h-4 w-4 text-ecto-green" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-ecto-green/70 leading-relaxed max-h-60 bg-bg-void select-all">
              <code>{codeSnippets.shorten[activeTab]}</code>
            </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: 'Success (201)', code: responseExamples.shorten, color: 'text-ecto-green/70' },
            { label: 'Error (409)', code: responseExamples.error, color: 'text-red-400/60' },
          ].map((ex, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60">{ex.label}</h4>
              <pre className={`p-4 rounded-xl border border-glass-border bg-bg-void overflow-x-auto text-[10px] font-mono ${ex.color} leading-relaxed select-all`}>
                <code>{ex.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-glass-border">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ecto-green/50 bg-ecto-green/5 border border-ecto-green/20 rounded-md px-2.5 py-1">GET</span>
          <span className="font-mono text-sm text-ghost-white">/api/v1/links</span>
          <span className="font-body text-xs text-ghost-white/40">List your links.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/60">Response</h4>
            <p className="font-body text-xs text-ghost-white/40">Returns an array of your links with shortCode, longUrl, isActive, createdAt, and metadata.</p>
            <div className="glass rounded-xl p-3 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-ecto-green/50 shrink-0 mt-0.5" />
              <span className="font-body text-[10px] text-ghost-white/40">Password hashes are redacted for security.</span>
            </div>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex bg-bg-surface border-b border-glass-border px-4 justify-between items-center">
              <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-ecto-green/60">Snippet</span>
              <button onClick={() => handleCopy('list', codeSnippets.list[activeTab])} className="text-ghost-white/30 hover:text-ecto-green p-1">
                {copiedCode === 'list' ? <Check className="h-4 w-4 text-ecto-green" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] font-mono text-ecto-green/70 leading-relaxed max-h-48 bg-bg-void select-all">
              <code>{codeSnippets.list[activeTab]}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
