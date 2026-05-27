'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { BarChart3, Globe, Laptop, Compass, History, Calendar, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#39ff90', '#a0c4ff', '#7c6fa0', '#e8eaf6', '#39ff90'];

function AnalyticsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, links, analytics } = useSnapStore();
  const [selectedLinkId, setSelectedLinkId] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setOrigin((process.env.NEXT_PUBLIC_API_URL || window.location.origin).replace(/\/+$/, '').trim());
  }, [user, router]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && links.some(l => l.id === id)) setSelectedLinkId(id);
  }, [searchParams, links]);

  if (!user || !mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-5 w-5 text-ecto-green/50 animate-spin" />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/50">Compiling analytics...</span>
        </div>
      </div>
    );
  }

  const filteredClicks = selectedLinkId === 'all'
    ? analytics.filter(c => links.some(l => l.id === c.linkId))
    : analytics.filter(c => c.linkId === selectedLinkId);

  const selectedLink = links.find(l => l.id === selectedLinkId);

  const getTimeline = () => {
    const map: Record<string, number> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      map[d] = 0;
    }
    filteredClicks.forEach(c => {
      const d = new Date(c.clickedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (map[d] !== undefined) map[d]++;
    });
    return Object.entries(map).map(([name, clicks]) => ({ name, clicks }));
  };

  const getDist = (key: 'device' | 'browser' | 'country' | 'referrer') => {
    const map: Record<string, number> = {};
    filteredClicks.forEach(c => { map[c[key]] = (map[c[key]] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const timelineData = getTimeline();
  const devicesData = getDist('device');
  const browsersData = getDist('browser');
  const countriesData = getDist('country');
  const referrersData = getDist('referrer');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-glass-border pb-6 gap-4">
        <div>
          <button onClick={() => router.push('/dashboard')}
            className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors inline-flex items-center gap-1 mb-2">
            &larr; Back
          </button>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">Spectral Metrics</h1>
          <p className="font-body text-sm text-ghost-white/40">Traffic, devices, and demographics.</p>
        </div>
        <select value={selectedLinkId} onChange={e => { setSelectedLinkId(e.target.value); router.push('/analytics'); }}
          className="w-full md:w-56 h-10 rounded-full bg-white/[0.04] border border-glass-border px-4 text-xs text-ghost-white outline-none focus:border-ecto-green/40 transition-colors font-mono">
          <option value="all" className="bg-bg-void">All Links</option>
          {links.map(link => (
            <option key={link.id} value={link.id} className="bg-bg-void">/{link.shortCode} ({link.clickCount})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', val: filteredClicks.length },
          { label: 'Unique IPs', val: new Set(filteredClicks.map(c => c.ipAddress)).size },
          { label: 'Conversion', val: '100%' },
          { label: 'Bounce', val: '<1%' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-5">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ghost-white/30">{s.label}</span>
            <span className="block font-display text-2xl text-ecto-green mt-1">{s.val}</span>
          </div>
        ))}
      </div>

      {selectedLink && (
        <div className="glass rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ecto-green/50">Selected</span>
            <span className="font-mono text-sm text-ecto-green ml-3">/{selectedLink.shortCode}</span>
          </div>
          <span className="font-body text-xs text-ghost-white/40 truncate max-w-md">{selectedLink.longUrl}</span>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60 flex items-center gap-2 mb-6">
          <Calendar className="h-3.5 w-3.5" /> Timeline (7 days)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39ff90" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#39ff90" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,234,246,0.04)" />
              <XAxis dataKey="name" stroke="rgba(232,234,246,0.2)" tick={{ fontSize: 10 }} />
              <YAxis stroke="rgba(232,234,246,0.2)" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(232,234,246,0.08)', borderRadius: '12px', color: '#e8eaf6', fontSize: '11px' }} />
              <Area type="monotone" dataKey="clicks" stroke="#39ff90" strokeWidth={2} fillOpacity={1} fill="url(#gc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Devices', icon: Laptop, data: devicesData },
          { title: 'Browsers', icon: Compass, data: browsersData },
          { title: 'Countries', icon: Globe, data: countriesData },
        ].map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="glass rounded-2xl p-6">
              <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60 flex items-center gap-2 mb-4">
                <Icon className="h-3.5 w-3.5" /> {section.title}
              </h2>
              {section.data.length === 0 ? (
                <div className="py-8 text-center font-body text-xs text-ghost-white/30">No data</div>
              ) : (
                <div className="space-y-4">
                  <div className="h-36 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={section.data} cx="50%" cy="50%" innerRadius={38} outerRadius={52} paddingAngle={3} dataKey="value">
                          {section.data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5">
                    {section.data.slice(0, 5).map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center font-mono text-[10px]">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-ghost-white/40">{d.name}</span>
                        </span>
                        <span className="text-ecto-green/70">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60 flex items-center gap-2 mb-4">
            <Compass className="h-3.5 w-3.5" /> Referrers
          </h2>
          {referrersData.length === 0 ? (
            <div className="py-8 text-center font-body text-xs text-ghost-white/30">No referrers</div>
          ) : (
            <div className="space-y-2">
              {referrersData.slice(0, 6).map((r, i) => (
                <div key={i} className="flex justify-between items-center font-mono text-[10px] border-b border-glass-border pb-2 last:border-none">
                  <span className="text-ghost-white/40 truncate max-w-[140px]">{r.name}</span>
                  <span className="text-ecto-green/70">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/60 flex items-center gap-2 mb-4">
            <History className="h-3.5 w-3.5" /> Click Log
          </h2>
          {filteredClicks.length === 0 ? (
            <div className="py-8 text-center font-body text-xs text-ghost-white/30">No clicks yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] text-ghost-white/40">
                <thead>
                  <tr className="border-b border-glass-border uppercase tracking-[0.1em] text-ghost-white/20">
                    <th className="pb-3 font-normal">IP</th>
                    <th className="pb-3 font-normal">Geo</th>
                    <th className="pb-3 font-normal">Device</th>
                    <th className="pb-3 font-normal">Referrer</th>
                    <th className="pb-3 font-normal text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClicks.slice(0, 10).map(log => (
                    <tr key={log.id} className="border-b border-glass-border last:border-none">
                      <td className="py-3 text-ecto-green/60">{log.ipAddress}</td>
                      <td className="py-3">{log.country}</td>
                      <td className="py-3">{log.device} / {log.browser}</td>
                      <td className="py-3 truncate max-w-[100px]">{log.referrer}</td>
                      <td className="py-3 text-right">{new Date(log.clickedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">Loading analytics...</div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
