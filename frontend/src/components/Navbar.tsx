'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSnapStore } from '../context/store';
import { Menu, X, Terminal } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useSnapStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);

  const devLinks = [
    { label: 'GitHub', href: 'https://github.com/sougandhhhhh', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/sougandhhhhh', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { label: 'Discord', href: 'https://discord.com/users/sougandhhhhh', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg> },
    { label: 'Website', href: 'https://sougandhkp.me', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { label: 'Email', href: 'mailto:sougandh7ss@gmail.com', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
  ];

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
              <div className="relative">
                <button onClick={() => setShowDevMenu(!showDevMenu)} className="text-ghost-white/40 hover:text-ghost-white transition-colors">
                  <Terminal className="h-4 w-4" />
                </button>
                {showDevMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDevMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 glass-strong border border-glass-border rounded-2xl p-2 min-w-[160px] space-y-0.5">
                      {devLinks.map(link => (
                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-body text-ghost-white/50 hover:text-ghost-white hover:bg-white/[0.04] transition-colors">
                          {link.icon}
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
            <div className="flex flex-col gap-2 border-t border-glass-border pt-3 mt-3">
              <div className="flex items-center gap-3">
                {devLinks.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-ghost-white/40 hover:text-ghost-white transition-colors" title={link.label}>
                    {link.icon}
                  </a>
                ))}
              </div>
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
