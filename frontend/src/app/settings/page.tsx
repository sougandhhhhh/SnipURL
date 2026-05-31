'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { User, Mail, Shield, Calendar, Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useSnapStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !user) router.push('/login');
  }, [mounted, user, router]);

  if (!user) return null;

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="font-display text-2xl tracking-[0.1em] text-ghost-white">Settings</h1>
          <p className="font-body text-sm text-ghost-white/40 mt-1">Manage your profile and account details.</p>
        </div>

        <div className="glass-strong rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-ecto-green/10 flex items-center justify-center text-xl font-display text-ecto-green">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-lg tracking-[0.05em] text-ghost-white">{user.name}</h2>
              <p className="font-body text-sm text-ghost-white/40">{user.email}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between py-3 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-ecto-green/60" />
                <div>
                  <p className="font-body text-sm text-ghost-white/60">Name</p>
                  <p className="font-body text-sm text-ghost-white">{user.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-ecto-green/60" />
                <div>
                  <p className="font-body text-sm text-ghost-white/60">Email</p>
                  <p className="font-body text-sm text-ghost-white">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-ecto-green/60" />
                <div>
                  <p className="font-body text-sm text-ghost-white/60">Role</p>
                  <p className="font-body text-sm text-ghost-white capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-ecto-green/60" />
                <div>
                  <p className="font-body text-sm text-ghost-white/60">User ID</p>
                  <p className="font-body text-xs text-ghost-white/40 font-mono truncate max-w-[220px]">{user.id}</p>
                </div>
              </div>
              <button onClick={copyId} className="text-ghost-white/40 hover:text-ecto-green transition-colors">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
