'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../context/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, BarChart3, LogOut } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { user, logout } = useSnapStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setIsOpen(p => !p); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch('');
  }, [isOpen]);

  const actions = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, category: 'Navigate' },
    { name: 'Sign Out', action: () => logout(), icon: LogOut, category: 'Account' },
  ];

  const filtered = actions.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} className="fixed inset-0 bg-bg-void/70 backdrop-blur-sm" />

          <motion.div initial={{ scale: 0.96, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="glass-strong w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)]">

            <div className="flex items-center border-b border-glass-border px-4">
              <Search className="h-4 w-4 text-ghost-white/30 mr-3" />
              <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search commands..."
                className="h-12 w-full bg-transparent text-sm text-ghost-white placeholder-ghost-white/30 outline-none font-body" />
              <span className="font-mono text-[9px] text-ghost-white/20 border border-glass-border rounded px-2 py-0.5">ESC</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center font-body text-sm text-ghost-white/30">No commands found.</div>
              ) : (
                Object.entries(filtered.reduce((acc, a) => {
                  (acc[a.category] = acc[a.category] || []).push(a);
                  return acc;
                }, {} as Record<string, typeof actions>)).map(([category, items]) => (
                  <div key={category} className="mb-3">
                    <span className="block px-3 py-1.5 font-mono text-[8px] tracking-[0.15em] uppercase text-ghost-white/20">
                      {category}
                    </span>
                    {items.map(act => {
                      const Icon = act.icon;
                      return (
                        <button key={act.name} onClick={() => { setIsOpen(false); if (act.href) router.push(act.href); else act.action?.(); }}
                          className="flex w-full items-center rounded-lg px-3 py-2.5 text-left font-body text-sm text-ghost-white/50 hover:bg-white/[0.04] hover:text-ghost-white transition-colors">
                          <Icon className="h-4 w-4 mr-3 text-ecto-green/50" />
                          {act.name}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between border-t border-glass-border bg-bg-surface px-4 py-3 font-mono text-[9px] text-ghost-white/20">
              <span>&uarr;&darr; navigate &crarr; select</span>
              <span>SnipURL</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
