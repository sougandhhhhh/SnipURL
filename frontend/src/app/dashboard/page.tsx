'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore, Link as LinkType } from '../../context/store';
import { Copy, Check, QrCode, Trash2, Search, X, Lock, ExternalLink, Download, ChevronDown, ChevronRight, Layers } from 'lucide-react';

function LinkRow({ link, origin, copiedId, onCopy, onEdit, onQr, onDelete }: {
  link: LinkType; origin: string; copiedId: string | null;
  onCopy: (id: string, code: string) => void;
  onEdit: (link: LinkType) => void;
  onQr: (link: LinkType) => void;
  onDelete: (id: string) => void;
}) {
  const isExpired = link.expiresAt && Date.now() > link.expiresAt;
  return (
    <div className={`ghost-card p-5 ${link.isActive && !isExpired ? '' : 'opacity-60'}`}>
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
          <p className="font-body text-xs text-ghost-white/40 truncate">
            {link.longUrl}
          </p>
          <span className="font-mono text-[9px] text-ghost-white/20">
            {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto border-t border-glass-border sm:border-none pt-3 sm:pt-0">
          <button onClick={() => onEdit(link)}
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30 hover:text-ecto-green/60 border border-glass-border rounded-lg px-2.5 py-1.5 transition-colors">Edit</button>
          <button onClick={() => onCopy(link.id, link.shortCode)}
            className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors" title="Copy">
            {copiedId === link.id ? <Check className="h-3.5 w-3.5 text-ecto-green" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => onQr(link)}
            className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors" title="QR Code">
            <QrCode className="h-3.5 w-3.5" />
          </button>
          <a href={`${origin}/${link.shortCode}`} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-white/[0.04] p-2 text-ghost-white/40 hover:text-ecto-green border border-glass-border transition-colors inline-flex" title="Open link">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button onClick={() => onDelete(link.id)}
            className="rounded-lg bg-white/[0.04] p-2 text-red-400/50 hover:text-red-400 border border-glass-border transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, links, updateLink, deleteLink, fetchLinks } = useSnapStore();

  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrLink, setActiveQrLink] = useState<LinkType | null>(null);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [origin, setOrigin] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setOrigin((process.env.NEXT_PUBLIC_DISPLAY_DOMAIN || window.location.origin).replace(/\/+$/, '').trim());
    fetchLinks();
  }, [user, router, fetchLinks]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(t);
  }, [message]);

  const handleCopy = (id: string, shortCode: string) => {
    navigator.clipboard.writeText(`${origin.replace(/^https?:\/\//, '')}/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await deleteLink(deleteConfirmId);
    setDeleteConfirmId(null);
    setMessage('Link deleted');
  };

  const handleSaveEdit = async () => {
    if (!editingLink) return;
    await updateLink(editingLink.id, { longUrl: editUrl });
    setEditingLink(null);
    setMessage('Link updated');
  };

  const handleDownloadQr = async () => {
    if (!activeQrLink) return;
    try {
      const resp = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(`${origin}/${activeQrLink.shortCode}`)}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${activeQrLink.shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  const userLinks = links.filter(link =>
    !user || link.userId === user.id || link.userId === 'user-default'
  ).filter(link =>
    search === '' || link.shortCode.toLowerCase().includes(search.toLowerCase()) || link.longUrl.toLowerCase().includes(search.toLowerCase()) || (link.customAlias?.toLowerCase().includes(search.toLowerCase()))
  );

  const { batches, individualLinks } = useMemo(() => {
    const byBatch = new Map<string, LinkType[]>();
    const individual: LinkType[] = [];
    for (const link of userLinks) {
      if (link.batchId) {
        const arr = byBatch.get(link.batchId) || [];
        arr.push(link);
        byBatch.set(link.batchId, arr);
      } else {
        individual.push(link);
      }
    }
    const sortedBatches = Array.from(byBatch.entries())
      .map(([batchId, links]) => ({ batchId, links: links.sort((a, b) => a.createdAt - b.createdAt) }))
      .sort((a, b) => b.links[0].createdAt - a.links[0].createdAt);
    return { batches: sortedBatches, individualLinks: individual.sort((a, b) => b.createdAt - a.createdAt) };
  }, [userLinks]);

  const allItems = useMemo(() => {
    const items: { type: 'batch'; batchId: string; links: LinkType[] } | { type: 'individual'; link: LinkType }[] = [];
    const list: ({ type: 'batch'; batchId: string; links: LinkType[] } | { type: 'individual'; link: LinkType })[] = [];
    for (const batch of batches) {
      list.push({ type: 'batch', batchId: batch.batchId, links: batch.links });
    }
    for (const link of individualLinks) {
      list.push({ type: 'individual', link });
    }
    return list.sort((a, b) => {
      const aTime = a.type === 'batch' ? a.links[0].createdAt : a.link.createdAt;
      const bTime = b.type === 'batch' ? b.links[0].createdAt : b.link.createdAt;
      return bTime - aTime;
    });
  }, [batches, individualLinks]);

  const displayItems = showAll ? allItems : allItems.slice(0, 10);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-8 lg:px-12 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-glass-border pb-6 gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">Link Vault</h1>
          <p className="font-body text-sm text-ghost-white/40">All your summoned URLs.</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span className="glass rounded-full px-3 py-1.5 text-ecto-green/70">
            Total: {links.length}
          </span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="glass rounded-xl flex items-center px-4 max-w-2xl">
        <Search className="h-4 w-4 text-ghost-white/30 shrink-0" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search short codes or destinations..."
          className="h-11 w-full bg-transparent px-3 text-xs text-ghost-white placeholder-ghost-white/20 outline-none font-body" />
        {search && <button onClick={() => setSearch('')} className="text-ghost-white/30 hover:text-ghost-white"><X className="h-4 w-4" /></button>}
      </div>

      {/* TOAST MESSAGE */}
      {message && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass rounded-full px-6 py-3 text-xs font-mono text-ecto-green animate-fade-in">
          {message}
        </div>
      )}

      {/* LINK LIST */}
      {userLinks.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center space-y-4">
          <div className="font-mono text-4xl text-ecto-green/20">~</div>
          <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white/60">No links found</h3>
          <p className="font-body text-xs text-ghost-white/30">Shorten a URL on the landing page to see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map(item => {
            if (item.type === 'batch') {
              const expanded = expandedBatches.has(item.batchId);
              return (
                <div key={item.batchId} className="ghost-card overflow-hidden">
                  <button onClick={() => toggleBatch(item.batchId)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-ecto-green/60" />
                      <div>
                        <span className="font-mono text-sm text-ghost-white">Batch</span>
                        <span className="font-body text-xs text-ghost-white/40 ml-3">{item.links.length} links</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-ghost-white/20">
                        {new Date(item.links[0].createdAt).toLocaleDateString()}
                      </span>
                      {expanded ? <ChevronDown className="h-4 w-4 text-ghost-white/40" /> : <ChevronRight className="h-4 w-4 text-ghost-white/40" />}
                    </div>
                  </button>
                  {expanded && (
                    <div className="border-t border-glass-border px-5 pb-5 pt-3 space-y-3">
                      {item.links.map(link => (
                        <LinkRow key={link.id} link={link} origin={origin} copiedId={copiedId}
                          onCopy={handleCopy} onEdit={setEditingLink} onQr={setActiveQrLink} onDelete={handleDelete} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <LinkRow key={item.link.id} link={item.link} origin={origin} copiedId={copiedId}
                onCopy={handleCopy} onEdit={setEditingLink} onQr={setActiveQrLink} onDelete={handleDelete} />
            );
          })}
          {allItems.length > 10 && !showAll && (
            <button onClick={() => setShowAll(true)}
              className="w-full glass rounded-xl py-3 text-center font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60 hover:text-ecto-green transition-colors flex items-center justify-center gap-2">
              <ChevronDown className="h-3 w-3" /> Show all ({allItems.length - 10} more)
            </button>
          )}
        </div>
      )}

      {/* EDIT INLINE */}
      {editingLink && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-bg-void/70 backdrop-blur-sm" onClick={() => setEditingLink(null)} />
          <div className="glass-strong w-full max-w-md p-6 rounded-3xl relative z-10 space-y-4">
            <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white">Edit destination</h3>
            <p className="font-mono text-[10px] text-ecto-green">/{editingLink.shortCode}</p>
            <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)}
              className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white outline-none focus:border-ecto-green/40 font-body" />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit}
                className="btn-ghost justify-center text-[10px] flex-1">Save</button>
              <button onClick={() => setEditingLink(null)}
                className="flex-1 h-10 rounded-full border border-glass-border text-[10px] font-mono tracking-[0.1em] uppercase text-ghost-white/40 hover:text-ghost-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-bg-void/70 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="glass-strong w-full max-w-sm p-6 rounded-3xl relative z-10 text-center space-y-5">
            <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white">Delete link?</h3>
            <p className="font-body text-xs text-ghost-white/40">This action cannot be undone. The shortened URL will stop working immediately.</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete}
                className="flex-1 h-10 rounded-full bg-red-400/10 border border-red-400/30 text-[10px] font-mono tracking-[0.1em] uppercase text-red-400 hover:bg-red-400/20 transition-colors">Delete</button>
              <button onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-10 rounded-full border border-glass-border text-[10px] font-mono tracking-[0.1em] uppercase text-ghost-white/40 hover:text-ghost-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

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
            <button onClick={handleDownloadQr}
              className="btn-ghost justify-center text-[10px] w-full">
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}