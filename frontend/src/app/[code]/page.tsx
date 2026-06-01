'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CodeRedirect() {
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (!code) return;
    const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '').trim();
    fetch(`${api}/api/v1/resolve/${code}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        return { ok: r.ok, data };
      })
      .then(data => {
        if (data.data?.longUrl) {
          window.location.href = data.data.longUrl;
          return;
        }

        if (data.data?.passwordProtected && data.data.shortCode) {
          window.location.href = `/p/${encodeURIComponent(data.data.shortCode)}`;
          return;
        }

        if (data.ok) {
          window.location.href = '/404';
          return;
        }

        window.location.href = data.data?.error === 'Expired' ? `/expired?code=${encodeURIComponent(code)}` : '/404';
      })
      .catch(() => { window.location.href = '/404'; });
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-void">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/50 animate-pulse">
        Redirecting...
      </div>
    </div>
  );
}
