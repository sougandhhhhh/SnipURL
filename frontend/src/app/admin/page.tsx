'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { Shield, Users, ShieldAlert, Trash2, Eye, Globe, Ban, Search } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, links, reportedLinks, updateLink, deleteLink, fetchLinks } = useSnapStore();

  const [platformUsers] = useState([
    { id: 'usr-1', name: 'Sougandh K', email: 'sougandh@snapurl.co', role: 'admin', linksCount: 5, status: 'active' },
    { id: 'usr-2', name: 'Albin Joseph', email: 'albin@domain.co', role: 'user', linksCount: 12, status: 'active' },
    { id: 'usr-3', name: 'Sherin Varghese', email: 'sherin@domain.co', role: 'user', linksCount: 8, status: 'active' },
    { id: 'usr-4', name: 'Spam Bot Crawler', email: 'temp_spam@mailinator.com', role: 'user', linksCount: 42, status: 'blocked' },
  ]);

  const [activeTab, setActiveTab] = useState<'reported' | 'users' | 'links'>('reported');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/home'); return; }
    fetchLinks();
  }, [user, router, fetchLinks]);

  const handleBlockLink = async (linkId: string) => {
    await updateLink(linkId, { isActive: false });
  };

  const handleDeleteLink = async (linkId: string) => {
    if (confirm('Permanently purge this link?')) await deleteLink(linkId);
  };

  if (!user || user.role !== 'admin') return null;

  const globalClicks = links.reduce((acc, l) => acc + l.clickCount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-glass-border pb-6">
        <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-ecto-green/60" /> Admin
        </h1>
        <p className="font-body text-sm text-ghost-white/40">Platform moderation and oversight.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Users', val: platformUsers.length, icon: Users },
          { label: 'Links', val: links.length, icon: Globe },
          { label: 'Clicks', val: globalClicks, icon: Eye },
          { label: 'Reports', val: reportedLinks.length, icon: ShieldAlert },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-glass-border text-ecto-green/50">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30">{s.label}</span>
                <span className="block font-display text-xl text-ghost-white">{s.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex border-b border-glass-border gap-6">
        {[
          { key: 'reported' as const, name: 'Reports', icon: ShieldAlert },
          { key: 'users' as const, name: 'Users', icon: Users },
          { key: 'links' as const, name: 'Links', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-1.5 transition-colors border-b-2 ${
                activeTab === tab.key ? 'text-ecto-green border-ecto-green' : 'text-ghost-white/30 border-transparent hover:text-ghost-white/60'
              }`}>
              <Icon className="h-3.5 w-3.5" /> {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'reported' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60">Flagged Links</h3>
          {reportedLinks.length === 0 ? (
            <div className="font-body text-xs text-ghost-white/30 py-8 text-center">No reports — system is clean.</div>
          ) : (
            <div className="space-y-3">
              {reportedLinks.map(rep => {
                const link = links.find(l => l.id === rep.linkId);
                if (!link) return null;
                return (
                  <div key={rep.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-ecto-green">/{link.shortCode}</span>
                        <span className={`font-mono text-[8px] tracking-[0.1em] uppercase rounded-full px-2 py-0.5 border ${
                          link.isActive ? 'text-ecto-green border-ecto-green/30' : 'text-red-400/50 border-red-400/20'
                        }`}>{link.isActive ? 'Active' : 'Blocked'}</span>
                      </div>
                      <p className="font-body text-xs text-ghost-white/40 truncate">{link.longUrl}</p>
                      <p className="font-mono text-[9px] text-red-400/60">Reason: {rep.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {link.isActive && (
                        <button onClick={() => handleBlockLink(link.id)}
                          className="font-mono text-[9px] tracking-[0.1em] uppercase text-ecto-green/50 border border-ecto-green/20 rounded-lg px-3 py-1.5 hover:text-ecto-green transition-colors flex items-center gap-1">
                          <Ban className="h-3 w-3" /> Block
                        </button>
                      )}
                      <button onClick={() => handleDeleteLink(link.id)}
                        className="rounded-lg bg-white/[0.04] p-2 text-red-400/50 hover:text-red-400 border border-glass-border transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60">Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] text-ghost-white/40">
              <thead>
                <tr className="border-b border-glass-border uppercase tracking-[0.1em]">
                  <th className="pb-3 font-normal text-ghost-white/20">User</th>
                  <th className="pb-3 font-normal">Email</th>
                  <th className="pb-3 font-normal">Role</th>
                  <th className="pb-3 font-normal text-center">Links</th>
                  <th className="pb-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {platformUsers.map(u => (
                  <tr key={u.id} className="border-b border-glass-border last:border-none">
                    <td className="py-3.5 text-ghost-white/70">{u.name}</td>
                    <td className="py-3.5">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`font-mono text-[8px] tracking-[0.1em] uppercase rounded px-2 py-0.5 border ${
                        u.role === 'admin' ? 'text-ecto-green border-ecto-green/30' : 'text-ghost-white/30 border-glass-border'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3.5 text-center text-ecto-green/70">{u.linksCount}</td>
                    <td className="py-3.5">
                      <span className={`font-mono text-[8px] tracking-[0.1em] uppercase rounded-full px-2 py-0.5 border ${
                        u.status === 'active' ? 'text-ecto-green border-ecto-green/30' : 'text-red-400/50 border-red-400/20'
                      }`}>{u.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60">All Links</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] text-ghost-white/40">
              <thead>
                <tr className="border-b border-glass-border uppercase tracking-[0.1em]">
                  <th className="pb-3 font-normal text-ghost-white/20">Code</th>
                  <th className="pb-3 font-normal">Destination</th>
                  <th className="pb-3 font-normal text-center">Clicks</th>
                  <th className="pb-3 font-normal">Owner</th>
                  <th className="pb-3 font-normal text-right">Purge</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} className="border-b border-glass-border last:border-none">
                    <td className="py-3.5 font-mono text-ecto-green">/{link.shortCode}</td>
                    <td className="py-3.5 max-w-[200px] truncate">{link.longUrl}</td>
                    <td className="py-3.5 text-center text-ecto-green/70">{link.clickCount}</td>
                    <td className="py-3.5 text-[9px]">{link.userId}</td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => handleDeleteLink(link.id)}
                        className="rounded-lg bg-white/[0.04] p-1.5 text-red-400/50 hover:text-red-400 border border-glass-border transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
