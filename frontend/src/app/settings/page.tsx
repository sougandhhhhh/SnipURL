'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { Key, Copy, Check, Trash2, Plus, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, apiKeys, createApiKey, revokeApiKey, fetchApiKeys } = useSnapStore();
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const [webhookUrl, setWebhookUrl] = useState('https://hooks.example.com/...');
  const [webhookEvent, setWebhookEvent] = useState('click');
  const [webhookActive, setWebhookActive] = useState(true);
  const [webhookSaved, setWebhookSaved] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchApiKeys();
  }, [user, router, fetchApiKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    try {
      const newKey = await createApiKey(newKeyName);
      setGeneratedKey(newKey.keyHash);
      setNewKeyName('');
    } catch { alert('Error creating API key'); }
  };

  const handleRevokeKey = async (id: string) => {
    if (confirm('Revoke this API key? Apps using it will get 401 errors.')) await revokeApiKey(id);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-glass-border pb-6">
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">Crypt</h1>
        <p className="font-body text-sm text-ghost-white/40">Manage keys, webhooks, and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PROFILE */}
        <div className="md:col-span-1">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-xs tracking-[0.1em] text-ecto-green uppercase">Profile</h3>
            <div className="space-y-3 font-body text-sm">
              <div>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30 block">Name</span>
                <span className="text-ghost-white">{user.name}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30 block">Email</span>
                <span className="text-ghost-white/70">{user.email}</span>
              </div>
              <div>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30 block">Role</span>
                <span className="font-mono text-[10px] text-ecto-green/70 uppercase tracking-[0.1em]">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="md:col-span-2 space-y-6">
          {/* API KEYS */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="font-display text-sm tracking-[0.1em] text-ecto-green flex items-center gap-2">
              <Key className="h-4 w-4" /> API Keys
            </h2>
            <form onSubmit={handleCreateKey} className="flex gap-2">
              <input type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Service"
                className="flex-1 h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
              <button type="submit" className="btn-ghost text-[9px] py-0 px-4">
                <Plus className="h-3 w-3" /> Create
              </button>
            </form>

            {generatedKey && (
              <div className="glass rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] text-ecto-green/70">Key generated — copy it now.</span>
                </div>
                <div className="flex items-center justify-between glass-strong rounded-lg p-3">
                  <span className="font-mono text-[10px] text-ecto-green/60 truncate max-w-[260px]">{generatedKey}</span>
                  <button onClick={() => { navigator.clipboard.writeText(generatedKey); setCopiedToken(true); setTimeout(() => setCopiedToken(false), 2000); }}
                    className="text-ecto-green/50 hover:text-ecto-green">
                    {copiedToken ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30">Active Keys</h3>
              {apiKeys.length === 0 ? (
                <div className="font-body text-xs text-ghost-white/30 text-center py-6">No keys yet.</div>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map(key => (
                    <div key={key.id} className="glass rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1 truncate pr-4">
                        <span className="font-body text-sm text-ghost-white block">{key.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-ghost-white/30">{key.keyHash.substring(0, 12)}&bull;&bull;&bull;</span>
                          <button onClick={() => { navigator.clipboard.writeText(key.keyHash); setCopiedKeyId(key.id); setTimeout(() => setCopiedKeyId(null), 2000); }}
                            className="text-ghost-white/30 hover:text-ecto-green">
                            {copiedKeyId === key.id ? <Check className="h-3 w-3 text-ecto-green" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                        <span className="font-mono text-[8px] text-ghost-white/20">
                          Created {new Date(key.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button onClick={() => handleRevokeKey(key.id)}
                        className="text-red-400/50 hover:text-red-400 p-2 border border-glass-border rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* WEBHOOKS */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm tracking-[0.1em] text-ecto-green flex items-center gap-2">
                <Bell className="h-4 w-4" /> Webhooks
              </h2>
              <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-ecto-green/40 border border-ecto-green/20 rounded-full px-2 py-0.5">PRO</span>
            </div>

            <form onSubmit={e => { e.preventDefault(); setWebhookSaved(true); setTimeout(() => setWebhookSaved(false), 2500); }} className="space-y-4">
              <input type="url" required value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.example.com/..."
                className="w-full h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select value={webhookEvent} onChange={e => setWebhookEvent(e.target.value)}
                  className="h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white outline-none focus:border-ecto-green/40 transition-colors font-mono">
                  <option value="click" className="bg-bg-void">Clicks</option>
                  <option value="expire" className="bg-bg-void">Expirations</option>
                </select>
                <select value={webhookActive ? 'active' : 'inactive'} onChange={e => setWebhookActive(e.target.value === 'active')}
                  className="h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white outline-none focus:border-ecto-green/40 transition-colors font-mono">
                  <option value="active" className="bg-bg-void">Active</option>
                  <option value="inactive" className="bg-bg-void">Inactive</option>
                </select>
              </div>
              <button type="submit" className="btn-ghost text-[9px]">
                <Save className="h-3 w-3" /> Save
              </button>
            </form>
            {webhookSaved && (
              <span className="font-mono text-[9px] tracking-[0.1em] text-ecto-green/70 animate-pulse block">Webhook saved.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
