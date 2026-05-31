'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnapStore } from '../../context/store';
import { supabase } from '../../lib/supabase';
import { User, Mail, Calendar, Lock, Eye, EyeOff, X as XIcon } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, apiFetch } = useSnapStore();
  const [mounted, setMounted] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [dobInput, setDobInput] = useState('');
  const [dobSaving, setDobSaving] = useState(false);
  const [dobMessage, setDobMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.push('/login'); return; }
    supabase.auth.getUser().then(({ data }) => {
      const identities = data?.user?.identities ?? [];
      setHasPassword(identities.some(i => i.provider === 'email'));
    });
    if (user.dateOfBirth) setDobInput(user.dateOfBirth);
  }, [mounted, user, router]);

  if (!user) return null;

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Name cannot be empty.'); return; }
    setNameError('');
    setNameSaving(true);
    try {
      await supabase.auth.updateUser({ data: { name: trimmed } });
      const result = await apiFetch('/api/v1/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed }),
      });
      if (result.user) {
        useSnapStore.setState({ user: { ...user, name: result.user.name } });
      }
      setEditingName(false);
    } catch (err: any) {
      setNameError(err.message || 'Failed to save name');
    } finally {
      setNameSaving(false);
    }
  };

  const startEditingName = () => {
    setNameInput(user.name);
    setNameError('');
    setEditingName(true);
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNameError('');
  };

  const handleSaveDob = async () => {
    setDobSaving(true);
    setDobMessage('');
    try {
      const result = await apiFetch('/api/v1/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ dateOfBirth: dobInput || null }),
      });
      if (result.user) {
        useSnapStore.setState({ user: { ...user, dateOfBirth: result.user.dateOfBirth } });
      }
      setDobMessage('Date of birth saved');
      setTimeout(() => setDobMessage(''), 2000);
    } catch (err: any) {
      setDobMessage(err.message || 'Failed to save');
    } finally {
      setDobSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!newPassword || !confirmPassword) {
      setPassError('All fields required.'); return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.'); return;
    }

    setPassLoading(true);

    if (hasPassword) {
      if (!currentPassword) { setPassError('Current password required.'); setPassLoading(false); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) { setPassError('Current password is incorrect.'); setPassLoading(false); return; }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPassLoading(false);
    if (updateError) { setPassError(updateError.message); return; }

    setPassSuccess(hasPassword ? 'Password updated.' : 'Password set successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
              <div className="flex items-center gap-3 flex-1">
                <User className="h-4 w-4 text-ecto-green/60 shrink-0" />
                {editingName ? (
                  <div className="flex-1 flex items-center gap-2 relative">
                    <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                      className="flex-1 h-9 rounded-full bg-white/[0.04] border border-glass-border px-4 pr-16 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" autoFocus />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button onClick={handleSaveName} disabled={nameSaving}
                        className="h-7 px-3 rounded-full border border-ecto-green/40 text-[10px] font-mono tracking-[0.1em] uppercase text-ecto-green hover:bg-ecto-green/10 transition-colors flex items-center gap-1">
                        {nameSaving ? '...' : 'Save'}
                      </button>
                      <button onClick={cancelEditingName} className="h-7 w-7 flex items-center justify-center rounded-full text-ghost-white/40 hover:text-ghost-white hover:bg-white/[0.06] transition-colors">
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {nameError && <p className="absolute -bottom-5 left-4 text-[10px] text-red-400">{nameError}</p>}
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-body text-sm text-ghost-white/60">Name</p>
                      <p className="font-body text-sm text-ghost-white">{user.name}</p>
                    </div>
                    <button onClick={startEditingName} className="ml-auto text-ghost-white/30 hover:text-ecto-green transition-colors">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-glass-border">
              <div className="flex items-center gap-3 flex-1">
                <Mail className="h-4 w-4 text-ecto-green/60 shrink-0" />
                <div>
                  <p className="font-body text-sm text-ghost-white/60">Email</p>
                  <p className="font-body text-sm text-ghost-white">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 flex-1">
                <Calendar className="h-4 w-4 text-ecto-green/60 shrink-0" />
                <div className="flex-1">
                  <p className="font-body text-sm text-ghost-white/60">Date of Birth</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="date" value={dobInput} onChange={e => setDobInput(e.target.value)}
                      className="flex-1 h-9 rounded-full bg-white/[0.04] border border-glass-border px-4 text-sm text-ghost-white focus:border-ecto-green/40 focus:outline-none transition-colors font-body [color-scheme:dark] max-w-[180px]" />
                    <button onClick={handleSaveDob} disabled={dobSaving}
                      className="h-7 px-3 rounded-full border border-ecto-green/40 text-[10px] font-mono tracking-[0.1em] uppercase text-ecto-green hover:bg-ecto-green/10 transition-colors">
                      {dobSaving ? '...' : 'Save'}
                    </button>
                  </div>
                  {dobMessage && <p className="text-[10px] text-ecto-green/70 mt-1">{dobMessage}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-ecto-green/60" />
            <h3 className="font-display text-base tracking-[0.05em] text-ghost-white">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </h3>
          </div>

          {!hasPassword && (
            <p className="font-body text-xs text-ghost-white/40">You signed up with Google. Set a password to enable email sign-in.</p>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passError && (
              <div className="rounded-xl bg-red-400/5 border border-red-400/20 p-3 font-mono text-[10px] text-red-400/80 text-center">{passError}</div>
            )}
            {passSuccess && (
              <div className="rounded-xl bg-ecto-green/5 border border-ecto-green/20 p-3 font-mono text-[10px] text-ecto-green/80 text-center">{passSuccess}</div>
            )}

            {hasPassword && (
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 pr-10 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ghost-white/30 hover:text-ghost-white/60 transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 pr-10 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ghost-white/30 hover:text-ghost-white/60 transition-colors">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-11 rounded-full bg-white/[0.04] border border-glass-border px-5 pr-10 text-sm text-ghost-white placeholder-ghost-white/20 focus:border-ecto-green/40 focus:outline-none transition-colors font-body" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ghost-white/30 hover:text-ghost-white/60 transition-colors">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button type="submit" disabled={passLoading} className="btn-ghost w-full justify-center text-xs py-3">
              {passLoading ? 'Updating...' : hasPassword ? 'Update Password' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}