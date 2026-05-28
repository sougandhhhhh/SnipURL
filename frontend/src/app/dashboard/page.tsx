'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore, Link as LinkType } from '../../context/store';
import { Copy, Check, QrCode, Trash2, Search, Plus, X, Calendar, Lock, ExternalLink, Eye, Download, ChevronDown } from 'lucide-react';
export default function DashboardPage() {
  const router = useRouter();
  const { user, links, shortenUrl, updateLink, deleteLink, loading, fetchLinks } = useSnapStore();

  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrLink, setActiveQrLink] = useState<LinkType | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setOrigin((process.env.NEXT_PUBLIC_DISPLAY_DOMAIN || window.location.origin).replace(/\/+$/, '').trim());
    fetchLinks();
  }, [user, router, fetchLinks]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    try {
      const expirationTimestamp = expiresAt ? new Date(expiresAt).getTime() : undefined;
      await shortenUrl(longUrl, { customAlias: customAlias || undefined, password: password || undefined, expiresAt: expirationTimestamp });
      setLongUrl(''); setCustomAlias(''); setPassword(''); setExpiresAt(''); setShowOptions(false);
    } catch (err: any) {
      alert(err.message || 'Error creating shortened link');
    }
  };

  const handleCopy = (id: string, shortCode: string) => {
    navigator.clipboard.writeText(`${origin.replace(/^https?:\/\//, '')}/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (link: LinkType) => {
    await updateLink(link.id, { isActive: !link.isActive });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently purge this shortened link?')) await deleteLink(id);
  };

  const filteredLinks = links.filter(link =>
    link.userId === user?.id || link.userId === 'anonymous'
  ).filter(link =>
    search === '' || link.shortCode.toLowerCase().includes(search.toLowerCase()) || link.longUrl.toLowerCase().includes(search.toLowerCase()) || (link.customAlias?.toLowerCase().includes(search.toLowerCase()))
  );

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-glass-border pb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">Link Vault</h1>
          <p className="font-body text-sm text-ghost-white/40">Manage your summoned URLs.</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span className="glass rounded-full px-3 py-1.5 text-ecto-green/70">
            Total: {links.length}
          </span>
          <span className="glass rounded-full px-3 py-1.5 text-ecto-green/70">
            Clicks: {links.reduce((acc, l) => acc + l.clickCount, 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* LEFT: SHORTENER */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 sticky top-24 glow-ecto">
            <h2 className="font-display text-sm tracking-[0.1em] text-ecto-green mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Summon New URL
            </h2>
            <form onSubmit={handleShorten} className="space-y-4">
              <input
                type="url" required value={longUrl} onChange={e => setLongUrl(e.target.value)}
                placeholder="https://example.com/long/path"
                className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body"
              />
              <button type="button" onClick={() => setShowOptions(!showOptions)}
                className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors flex items-center gap-1.5">
                <ChevronDown className={`h-3 w-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                {showOptions ? 'Hide options' : 'Alias & protection'}
              </button>
              {showOptions && (
                <div className="space-y-3">
                  <input type="text" value={customAlias} onChange={e => setCustomAlias(e.target.value)}
                    placeholder="Custom alias (e.g. my-link)"
                    className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password protect"
                    className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
                  <div className="flex items-center gap-2 text-ghost-white/30 font-mono text-[9px] uppercase tracking-[0.1em]">
                    <Calendar className="h-3 w-3 text-ecto-green/40" />
                    <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                      className="flex-1 h-9 rounded-full bg-white/[0.04] border border-glass-border px-3 text-[10px] text-ghost-white focus:border-ecto-green/40 focus:outline-none transition-colors [color-scheme:dark]" />
                  </div>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-ghost w-full justify-center text-[10px]">
                {loading ? 'Summoning...' : 'Shorten'} <Plus className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: LINK LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl flex items-center px-4">
            <Search className="h-4 w-4 text-ghost-white/30 shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search short codes or destinations..."
              className="h-11 w-full bg-transparent px-3 text-xs text-ghost-white placeholder-ghost-white/20 outline-none font-body" />
            {search && <button onClick={() => setSearch('')} className="text-ghost-white/30 hover:text-ghost-white"><X className="h-4 w-4" /></button>}
          </div>

          {filteredLinks.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center space-y-4">
              <div className="font-mono text-4xl text-ecto-green/20">~</div>
              <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white/60">No links found</h3>
              <p className="font-body text-xs text-ghost-white/30">Summon your first URL in the panel to the left.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map(link => {
                const isExpired = link.expiresAt && Date.now() > link.expiresAt;
                return (
                  <div key={link.id} className={`ghost-card p-5 ${link.isActive && !isExpired ? '' : 'opacity-60'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span onClick={() => window.location.href = `${origin}/${link.shortCode}`}
                            className="font-mono text-sm text-ecto-green hover:underline cursor-pointer flex items-center gap-1">
                            /{link.shortCode} <ExternalLink className="h-3 w-3" />
                          </span>
                          {link.password && <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-ecto-green/50 border border-ecto-green/20 rounded-full px-2 py-0.5 flex items-center gap-1"><Lock className="h-2.5 w-2.5" />Pass</span>}
                          {link.expiresAt && <span className={`font-mono text-[8px] tracking-[0.15em] uppercase rounded-full px-2 py-0.5 border ${isExpired ? 'text-red-400/60 border-red-400/20' : 'text-ecto-green/50 border-ecto-green/20'}`}>{isExpired ? 'Expired' : 'Timer'}</span>}
                          <span className={`font-mono text-[8px] tracking-[0.15em] uppercase rounded-full px-2 py-0.5 border ${link.isActive && !isExpired ? 'text-ecto-green border-ecto-green/30' : 'text-ghost-white/30 border-ghost-white/10'}`}>
                            {link.isActive && !isExpired ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {editingLink?.id === link.id ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                              className="flex-1 h-8 rounded-full bg-white/[0.04] border border-glass-border px-3 text-xs text-ghost-white outline-none focus:border-ecto-green/40 font-body" />
                            <button onClick={async () => { if (editingLink) { await updateLink(editingLink.id, { longUrl: editUrl }); setEditingLink(null); }}}
                              className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green hover:text-ecto-green/80">Save</button>
                            <button onClick={() => setEditingLink(null)} className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ghost-white/60">Cancel</button>
                          </div>
                        ) : (
                          <p className="font-body text-xs text-ghost-white/40 truncate max-w-md">
                            {link.longUrl}
                          </p>
                        )}
                        <span className="font-mono text-[9px] text-ghost-white/20">
                          {new Date(link.createdAt).toLocaleDateString()} &middot; {link.clickCount} clicks
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-stretch sm:self-auto border-t border-glass-border sm:border-none pt-3 sm:pt-0">
                        <button onClick={() => handleCopy(link.id, link.shortCode)}
                          className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors" title="Copy">
                          {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-ecto-green" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setActiveQrLink(link)}
                          className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors" title="QR Code">
                          <QrCode className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => router.push(`/analytics?id=${link.id}`)}
                          className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors" title="Analytics">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setEditingLink(link); setEditUrl(link.longUrl); }}
                          className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30 hover:text-ecto-green/60 border border-glass-border rounded-lg px-2.5 py-1.5 transition-colors">Edit</button>
                        <button onClick={() => handleToggleActive(link)}
                          className={`rounded-lg p-1.5 border transition-colors ${link.isActive ? 'text-ecto-green border-ecto-green/30' : 'text-ghost-white/20 border-glass-border'}`} title="Toggle">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {link.isActive
                              ? <><rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="16" cy="12" r="3" fill="currentColor" /></>
                              : <><rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="8" cy="12" r="3" fill="currentColor" /></>}
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(link.id)}
                          className="rounded-lg bg-white/[0.04] p-2 text-red-400/50 hover:text-red-400 border border-glass-border transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR MODAL */}
      {activeQrLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-bg-void/70 backdrop-blur-sm" onClick={() => setActiveQrLink(null)} />
          <div className="glass-strong w-full max-w-sm p-6 rounded-3xl relative z-10 text-center space-y-4">
            <button onClick={() => setActiveQrLink(null)} className="absolute top-4 right-4 text-ghost-white/30 hover:text-ghost-white">
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white">QR Code</h3>
            <p className="font-body text-xs text-ghost-white/40">/{activeQrLink.shortCode}</p>
            <div className="mx-auto bg-white p-3 rounded-2xl w-48 h-48 flex items-center justify-center shadow-lg">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${origin}/${activeQrLink.shortCode}`)}`} alt="QR" className="h-44 w-44" />
            </div>
            <a href={`https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(`${origin}/${activeQrLink.shortCode}`)}`}
              download={`qr-${activeQrLink.shortCode}.png`}
              className="btn-ghost justify-center text-[10px] w-full">
              <Download className="h-3 w-3" /> Download
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
