'use client';

import { useState, useEffect } from 'react';
import ExpandForm from '../../components/ExpandForm';

export default function ExpandPage() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin((process.env.NEXT_PUBLIC_DISPLAY_DOMAIN || window.location.origin).replace(/\/+$/, '').trim());
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8 space-y-8">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.05em] text-ghost-white">
            Expand URL
          </h1>
          <p className="font-body text-sm text-ghost-white/40 max-w-md mx-auto">
            Paste a shortened URL or code to reveal its original destination.
          </p>
        </div>

        {/* FORM */}
        <div className="glass rounded-2xl p-6 glow-ecto">
          <h2 className="font-display text-sm tracking-[0.1em] text-ecto-green mb-4 flex items-center gap-2">
            Resolve Short Link
          </h2>
          <ExpandForm origin={origin} />
        </div>

        {/* INFO */}
        <div className="text-center space-y-2 font-mono text-[9px] tracking-[0.1em] uppercase text-ghost-white/30">
          <p>You can paste a full URL or just the short code.</p>
          <p>Results are fetched from the edge cache instantly.</p>
        </div>
      </div>
    </div>
  );
}
