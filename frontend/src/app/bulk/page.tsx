'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { Upload, Check, AlertTriangle, Download, ArrowLeft } from 'lucide-react';

export default function BulkPage() {
  const router = useRouter();
  const { user, shortenUrl } = useSnapStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<{ url: string; shortUrl?: string; error?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  if (user === null) {
    return (
      <div className="min-h-screen pt-28 px-4 flex items-center justify-center">
        <p className="font-body text-sm text-ghost-white/40">Sign in to use bulk shortening.</p>
      </div>
    );
  }

  const parseCSV = (text: string): string[] => {
    const urls: string[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const cols = line.split(',');
      for (const col of cols) {
        const url = col.trim().replace(/^["']|["']$/g, '');
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          urls.push(url);
        }
      }
    }
    return urls;
  };

  const processUrls = async (urls: string[]) => {
    setError('');
    setResults([]);
    if (urls.length === 0) { setError('No valid URLs found in file.'); return; }
    if (urls.length > 100) { setError('Maximum 100 URLs per batch.'); return; }
    setLoading(true);
    const out: { url: string; shortUrl?: string; error?: string }[] = [];
    for (const url of urls) {
      try {
        const link = await shortenUrl(url);
        out.push({ url, shortUrl: `${window.location.origin}/${link.shortCode}` });
      } catch (err: any) {
        out.push({ url, error: err.message || 'Failed' });
      }
    }
    setResults(out);
    setLoading(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await processUrls(parseCSV(text));
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.csv')) { setError('Please drop a .csv file.'); return; }
    const text = await file.text();
    await processUrls(parseCSV(text));
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const downloadCSV = () => {
    const header = 'Original URL,Short URL,Status\n';
    const rows = results.map(r => `"${r.url}","${r.shortUrl || ''}","${r.error || 'Success'}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'snipurl-bulk-results.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successCount = results.filter(r => !r.error).length;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <button onClick={() => router.push('/')} className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/30 hover:text-ecto-green/60 transition-colors inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
          <ArrowLeft className="h-3 w-3" /> Back
        </button>

        <div>
          <h1 className="font-display text-2xl tracking-[0.1em] text-ghost-white">Bulk Shorten</h1>
          <p className="font-body text-sm text-ghost-white/40 mt-1">Upload a CSV and shorten hundreds of URLs at once.</p>
        </div>

        <div className="glass-strong rounded-3xl p-8 space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${isDragging ? 'border-ecto-green bg-ecto-green/5' : 'border-glass-border hover:border-ecto-green/40'}`}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            <Upload className={`h-8 w-8 mx-auto ${isDragging ? 'text-ecto-green' : 'text-ecto-green/60'}`} />
            <p className="font-body text-sm text-ghost-white/60 mt-3">
              {isDragging ? 'Drop your CSV here' : 'Drag & drop a CSV file, or click to browse'}
            </p>
            <p className="font-mono text-[10px] text-ghost-white/30 mt-1">One URL per row or column. Max 100 URLs.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-400/5 border border-red-400/20 p-4 font-mono text-xs text-red-400/80 text-center">{error}</div>
          )}

          {loading && (
            <div className="text-center">
              <div className="animate-pulse font-mono text-[10px] tracking-[0.2em] uppercase text-ecto-green/60">Shortening URLs...</div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-ghost-white/60">{successCount}/{results.length} successful</p>
                <button onClick={downloadCSV} className="btn-ghost text-[10px] py-2 px-4">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className={`flex items-center gap-3 glass rounded-xl px-4 py-3 border ${r.error ? 'border-red-400/10' : 'border-glass-border'}`}>
                    {r.error ? <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" /> : <Check className="h-4 w-4 text-ecto-green shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-xs text-ghost-white/40 truncate">{r.url}</p>
                      {r.shortUrl && <p className="font-mono text-xs text-ecto-green truncate">{r.shortUrl}</p>}
                      {r.error && <p className="font-mono text-[10px] text-red-400/60">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}