'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    desc: 'For personal blogs and experiments.',
    price: 0,
    features: ['50 Short URLs/mo', '10ms Edge Redirects', 'Basic Analytics', 'QR Codes', '1 API Key', '7-day retention'],
    href: '/login?tab=register',
    popular: false,
  },
  {
    name: 'Pro',
    desc: 'For creators, agencies, startups.',
    price: 24,
    features: ['Unlimited URLs', '3 Custom Domains', 'Geo & Referrer Analytics', 'Password Protection', 'Expiry Schedules', '5 API Keys', '90-day retention', 'Webhooks'],
    href: '/login?tab=register&plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large-scale deployments.',
    price: null,
    features: ['Multi-domain', 'Team Workspaces', 'SLA 99.99%', 'Custom Rate Limits', '1-year retention', 'Dedicated Manager', '24/7 Support'],
    href: 'mailto:enterprise@snapurl.co',
    popular: false,
  },
];

export default function PricingPage() {
  const [period, setPeriod] = useState<'monthly' | 'annually'>('monthly');

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 space-y-16">
      <div className="absolute top-[-10%] left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(57,255,144,0.03),transparent_60%)] pointer-events-none" />

      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl sm:text-5xl tracking-[0.05em] text-ghost-white">Pricing</h1>
        <p className="font-body text-base text-ghost-white/40 max-w-xl mx-auto">Start free. Upgrade as you haunt the edge.</p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`font-mono text-[10px] tracking-[0.1em] uppercase ${period === 'monthly' ? 'text-ghost-white' : 'text-ghost-white/30'}`}>Monthly</span>
          <button onClick={() => setPeriod(period === 'monthly' ? 'annually' : 'monthly')}
            className="relative flex h-6 w-11 items-center rounded-full bg-ecto-green/30 transition-colors">
            <span className={`inline-block h-4 w-4 rounded-full bg-ecto-green transition-transform ${period === 'annually' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`font-mono text-[10px] tracking-[0.1em] uppercase flex items-center gap-1.5 ${period === 'annually' ? 'text-ghost-white' : 'text-ghost-white/30'}`}>
            Annually
            <span className="font-mono text-[8px] text-ecto-green/60 border border-ecto-green/20 rounded-full px-2 py-0.5">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`ghost-card p-8 flex flex-col justify-between relative ${plan.popular ? 'glow-ecto-strong' : ''}`}>
            {plan.popular && (
              <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.15em] uppercase text-bg-void bg-ecto-green rounded-full px-3 py-1">
                Most Popular
              </span>
            )}
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg tracking-[0.1em] text-ghost-white">{plan.name}</h3>
                <p className="font-body text-xs text-ghost-white/40 mt-1">{plan.desc}</p>
              </div>

              <div className="py-3 border-y border-glass-border">
                {plan.price !== null ? (
                  <div className="flex items-baseline text-ghost-white">
                    <span className="font-display text-3xl tracking-[0.05em]">$</span>
                    <span className="font-display text-5xl tracking-[0.05em]">{plan.price}</span>
                    <span className="font-body text-xs text-ghost-white/40 ml-1">/mo</span>
                  </div>
                ) : (
                  <div className="font-display text-4xl tracking-[0.05em] text-ghost-white">Custom</div>
                )}
                {period === 'annually' && plan.price !== null && (
                  <span className="font-mono text-[9px] text-ecto-green/60">Billed annually</span>
                )}
              </div>

              <ul className="space-y-2">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start font-body text-xs text-ghost-white/50">
                    <Check className="h-3.5 w-3.5 text-ecto-green/50 mr-2 shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link href={plan.href} className={`block w-full text-center py-3 rounded-full font-mono text-[9px] tracking-[0.15em] uppercase transition-all ${
                plan.popular ? 'btn-ghost justify-center' : 'btn-outline justify-center'
              }`}>
                {plan.price === 0 ? 'Get Started' : plan.price ? 'Upgrade' : 'Contact Sales'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-display text-sm tracking-[0.1em] text-ghost-white">Compare</h3>
        </div>
        <table className="w-full text-left font-mono text-[10px] text-ghost-white/40">
          <thead>
            <tr className="border-b border-glass-border uppercase tracking-[0.1em]">
              <th className="p-5 font-normal text-ghost-white/20">Feature</th>
              <th className="p-5 font-normal">Free</th>
              <th className="p-5 font-normal text-ecto-green/70">Pro</th>
              <th className="p-5 font-normal">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {[
              { f: 'Edge SLA', free: 'Standard', pro: 'High Priority', ent: '99.99%' },
              { f: 'Domains', free: 'snipurl.co/*', pro: 'Up to 3 Custom', ent: 'Unlimited' },
              { f: 'API Keys', free: '1', pro: '5', ent: 'Unlimited' },
              { f: 'Retention', free: '7 days', pro: '90 days', ent: '1 year' },
              { f: 'Support', free: 'Community', pro: 'Priority Email', ent: '24/7 Dedicated' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-glass-border last:border-none">
                <td className="p-5 text-ghost-white/60">{row.f}</td>
                <td className="p-5">{row.free}</td>
                <td className="p-5 text-ecto-green/60">{row.pro}</td>
                <td className="p-5">{row.ent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
