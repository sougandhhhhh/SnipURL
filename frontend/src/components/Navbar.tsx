'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSnapStore } from '../context/store';
import { Menu, X, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useSnapStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = user
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Analytics', href: '/analytics' },
        { name: 'API Keys', href: '/settings' },
        ...(user.role === 'admin' ? [{ name: 'Admin', href: '/admin' }] : []),
      ]
    : [
        { name: 'Features', href: '/#features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API Docs', href: '/api-docs' },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4" style={{ willChange: 'transform' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ willChange: 'opacity, backdrop-filter', transition: 'opacity 200ms, backdrop-filter 200ms, background 200ms, border-color 200ms', background: scrolled ? 'rgba(8, 8, 16, 0.7)' : 'transparent', backdropFilter: scrolled ? 'blur(32px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(32px)' : 'none', borderBottom: scrolled ? '1px solid rgba(232, 234, 246, 0.08)' : '1px solid transparent' }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-10 sm:h-12 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img src="/logo.svg" alt="SnipURL" width="32" height="32" className="transition-transform duration-300 group-hover:scale-110" />
            <span className="font-brand text-lg sm:text-xl tracking-widest">
              <span className="text-ghost-white">SNIP</span><span className="text-ecto-green">URL</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {links.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-xs font-mono uppercase tracking-[0.15em] transition-colors duration-300 ${
                  pathname === link.href ? 'text-ecto-green' : 'text-ghost-white/60 hover:text-ghost-white'
                }`}
              >
                {link.name}
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-ecto-green shadow-[0_0_6px_rgba(57,255,144,0.5)]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-ghost-white/50 flex items-center gap-1.5">
                  <UserIcon className="h-3 w-3" />
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </span>
                <button onClick={logout} className="font-mono text-[10px] tracking-[0.15em] uppercase text-ecto-green/70 hover:text-ecto-green transition-colors">
                  Exit
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-ghost text-[10px] py-2 px-5">
                Sign In / Sign Up
              </Link>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-ghost-white/70 hover:text-ghost-white transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-glass-border mt-3 px-4 py-4 space-y-2">
          {links.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 text-xs font-mono tracking-[0.15em] uppercase ${
                pathname === link.href ? 'text-ecto-green' : 'text-ghost-white/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-glass-border pt-3 mt-3">
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-center text-[10px] font-mono tracking-[0.15em] uppercase text-ecto-green/70 py-2">
                Exit
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center btn-ghost text-[10px] py-2 justify-center">
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
