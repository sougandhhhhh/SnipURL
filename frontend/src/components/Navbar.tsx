'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSnapStore } from '../context/store';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useSnapStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    setMobileOpen(false);
  };

  const links = user
    ? [
        { name: 'Home', href: '/' },
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Settings', href: '/settings' },
      ]
    : [];

  return (
    <>
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
                <button onClick={() => setShowLogoutModal(true)} className="font-mono text-[10px] tracking-[0.15em] uppercase text-red-400/70 hover:text-red-400 border border-red-400/30 hover:border-red-400 rounded-full px-4 py-1.5 transition-colors">
                  Logout
                </button>
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
                <button onClick={() => setShowLogoutModal(true)} className="w-full text-center text-[10px] font-mono tracking-[0.15em] uppercase text-red-400/70 border border-red-400/30 rounded-full py-2">
                  Logout
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

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-bg-void/70 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="glass-strong relative w-full max-w-sm p-8 rounded-3xl text-center space-y-6 animate-fade-in">
            <h3 className="font-display text-base tracking-[0.1em] text-ghost-white">Sign out?</h3>
            <p className="font-body text-sm text-ghost-white/50">Are you sure you want to sign out?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowLogoutModal(false)}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-ghost-white/50 hover:text-ghost-white border border-glass-border rounded-full px-6 py-2 transition-colors">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-red-400 bg-red-400/10 border border-red-400/30 hover:bg-red-400/20 rounded-full px-6 py-2 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
