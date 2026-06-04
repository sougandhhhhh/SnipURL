import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const FALLBACK_API_KEY = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_KEY : undefined;

export interface Link {
  id: string;
  userId: string;
  shortCode: string;
  longUrl: string;
  customAlias: string | null;
  isActive: boolean;
  isOneTime: boolean;
  batchId?: string | null;
  batchName?: string | null;
  password?: string | null;
  expiresAt: number | null;
  createdAt: number;
  updatedAt: number;
  clickCount: number;
}

export interface ClickLog {
  id: string;
  linkId: string;
  clickedAt: number;
  ipAddress: string;
  country: string;
  device: string;
  browser: string;
  referrer: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  name: string;
  createdAt: number;
  lastUsedAt?: number | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string | null;
  passwordSet?: boolean;
  role: 'user' | 'admin';
}

interface SnapStore {
  user: User | null;
  links: Link[];
  analytics: ClickLog[];
  apiKeys: ApiKey[];
  reportedLinks: { id: string; linkId: string; reason: string; reportedAt: number }[];
  theme: 'dark' | 'light';
  loading: boolean;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  syncSupabaseUser: (supabaseUser: any) => Promise<void>;
  restoreSession: () => Promise<void>;

  // Link Operations
  shortenUrl: (longUrl: string, options?: { customAlias?: string; password?: string; expiresAt?: number; isOneTime?: boolean }) => Promise<Link>;
  expandUrl: (code: string) => Promise<{ longUrl: string } | { passwordProtected: boolean; shortCode: string }>;
  expandExternalUrl: (url: string) => Promise<{ longUrl: string }>;
  unlockUrl: (code: string, password: string) => Promise<{ longUrl: string }>;
  updateLink: (id: string, updates: Partial<Pick<Link, 'longUrl' | 'isActive' | 'password' | 'expiresAt'>>) => Promise<boolean>;
  deleteLink: (id: string) => Promise<boolean>;
  toggleLinkActive: (id: string) => Promise<boolean>;
  fetchLinks: () => Promise<boolean>;
  fetchApiKeys: () => Promise<boolean>;
  reportLink: (shortCode: string, reason: string) => Promise<boolean>;
  
  // API Key Operations
  createApiKey: (name: string) => Promise<ApiKey>;
  revokeApiKey: (id: string) => Promise<boolean>;
  
  // Theme Toggles
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Utility
  apiFetch: (path: string, options?: RequestInit) => Promise<any>;
}

const emptyLinks: Link[] = [];
const emptyClicks: ClickLog[] = [];

export const useSnapStore = create<SnapStore>((set, get) => {
  // Client-side initialization fallback
  const isClient = typeof window !== 'undefined';
  
  const getInitialTheme = (): 'dark' | 'light' => {
    if (!isClient) return 'dark';
    const saved = localStorage.getItem('snap-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getLocalStorage = <T>(key: string, fallback: T): T => {
    if (!isClient) return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const setLocalStorage = (key: string, value: any) => {
    if (isClient) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const normalizeShortCode = (input: string) => {
    const trimmed = input.trim();
    const withoutProtocol = trimmed.replace(/^(?:https?:\/\/)?[^\/]+\/+/i, '').replace(/^\/+/, '');
    const withoutQuery = withoutProtocol.split(/[?#]/)[0];
    const withoutPasswordRoute = withoutQuery.replace(/^p\//i, '');
    return withoutPasswordRoute.replace(/\/+$/, '');
  };

  const normalizeExternalUrl = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    try {
      return new URL(trimmed).href;
    } catch {
      try {
        return new URL(`https://${trimmed}`).href;
      } catch {
        return trimmed;
      }
    }
  };

  const getApiKeyHeader = (): string | undefined => {
    if (!isClient) return undefined;
    const stored = localStorage.getItem('snap-service-key');
    if (stored) return stored;
    const keys = get()?.apiKeys ?? [];
    if (keys.length > 0 && keys[0]?.keyHash) return keys[0].keyHash;
    if (FALLBACK_API_KEY) return FALLBACK_API_KEY;
    return undefined;
  };

  const apiFetch = async (path: string, options: RequestInit = {}) => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
    const url = `${baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    } as Record<string, string>;
    const apiKey = getApiKeyHeader();
    if (apiKey) headers['x-api-key'] = apiKey;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || response.statusText);
    }

    return response.json();
  };

  const parseResponseBody = async (response: Response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { error: text.slice(0, 200).trim() || response.statusText };
    }
  };

  // Build Store State
  const initialLinks = getLocalStorage<Link[]>('snap-links', emptyLinks);
  const initialClicks = getLocalStorage<ClickLog[]>('snap-clicks', emptyClicks);
  const initialUser = getLocalStorage<User | null>('snap-user', null);
  const initialKeys = getLocalStorage<ApiKey[]>('snap-apikeys', []);
  const initialReports = getLocalStorage('snap-reports', []);

  return {
    user: initialUser,
    links: initialLinks,
    analytics: initialClicks,
    apiKeys: initialKeys,
    reportedLinks: initialReports,
    theme: getInitialTheme(),
    loading: false,

    apiFetch,

    login: async (email, password) => {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) { set({ loading: false }); throw new Error(error.message); }
      await get().syncSupabaseUser(data.user);
      return true;
    },

    logout: async () => {
      await supabase.auth.signOut();
      set({ user: null, apiKeys: [], links: [] });
      if (isClient) {
        localStorage.removeItem('snap-user');
        localStorage.removeItem('snap-apikeys');
      }
    },

    register: async (email, password, name) => {
      set({ loading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) { set({ loading: false }); throw new Error(error.message); }
      if (!data.user) { set({ loading: false }); throw new Error('Signup failed'); }
      await get().syncSupabaseUser(data.user);
      return true;
    },

    signInWithGoogle: async () => {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const appUrl = isLocal
        ? window.location.origin
        : (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_URL : undefined) || window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${appUrl.replace(/\/+$/, '')}/auth/callback` },
      });
      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
      }
    },

    syncSupabaseUser: async (supabaseUser) => {
      try {
        const result = await apiFetch('/api/v1/auth/supabase', {
          method: 'POST',
          body: JSON.stringify({
            supabaseId: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          }),
        });

        const user: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          dateOfBirth: result.user.dateOfBirth || null,
          passwordSet: result.user.passwordSet || false,
          role: result.user.role || 'user',
        };

        const apiKey: ApiKey = result.apiKey;
        const rawKey = result.rawKey;

        set({ user, apiKeys: [apiKey], loading: false });
        setLocalStorage('snap-user', user);
        setLocalStorage('snap-apikeys', [{ ...apiKey, keyHash: rawKey || apiKey.keyHash }]);
        if (rawKey) {
          setLocalStorage('snap-service-key', rawKey);
        }

        // Claim any pending unauthenticated link
        const pendingCode = typeof window !== 'undefined' ? sessionStorage.getItem('pendingClaimCode') : null;
        if (pendingCode) {
          try {
            await apiFetch('/api/v1/links/claim', {
              method: 'POST',
              body: JSON.stringify({ shortCode: pendingCode }),
            });
          } catch {}
          sessionStorage.removeItem('pendingClaimCode');
        }

        await get().fetchLinks?.();
      } catch (err: any) {
        set({ loading: false });
        throw new Error(err.message || 'Failed to link account');
      }
    },

    restoreSession: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await get().syncSupabaseUser(session.user);
        }
      } catch (err: any) {
        // Non-fatal: silently fail so the app still loads for unauthenticated users
        console.error('restoreSession error:', err?.message || err);
        set({ loading: false });
      }
    },

    shortenUrl: async (longUrl, options = {}) => {
      set({ loading: true });
      try {
        const body = {
          longUrl,
          customAlias: options.customAlias,
          password: options.password,
          expiresAt: options.expiresAt,
          isOneTime: options.isOneTime,
        };

        const result = await apiFetch('/api/v1/shorten', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const createdLink: Link = {
          id: result.id,
          userId: result.userId || get().user?.id || '',
          shortCode: result.shortCode,
          longUrl: result.longUrl,
          customAlias: null,
          isActive: true,
          isOneTime: result.isOneTime || false,
          password: result.passwordEnabled ? '' : null,
          expiresAt: result.expiresAt ?? null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          clickCount: 0,
        };

        const updatedLinks = [createdLink, ...get().links];
        set({ links: updatedLinks, loading: false });
        setLocalStorage('snap-links', updatedLinks);
        return createdLink;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    expandUrl: async (code) => {
      const cleanCode = normalizeShortCode(code);
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
      const url = `${baseUrl}/api/v1/resolve/${encodeURIComponent(cleanCode)}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = getApiKeyHeader();
      if (apiKey) headers['x-api-key'] = apiKey;
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (!response.ok) {
        if (data.passwordProtected || response.status === 401 || response.status === 403) {
          return { passwordProtected: true, shortCode: data.shortCode || cleanCode };
        }
        throw new Error(data.error || response.statusText);
      }
      return data;
    },

    expandExternalUrl: async (url) => {
      const normalizedUrl = normalizeExternalUrl(url);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = getApiKeyHeader();
      if (apiKey) headers['x-api-key'] = apiKey;

      const endpoints = [
        '/api/external/resolve',
        `${(process.env.NEXT_PUBLIC_API_URL ?? '').trim()}/api/v1/external/resolve`,
      ].filter(Boolean);

      let lastError = '';
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ url: normalizedUrl }),
          });
          const data = await parseResponseBody(response);
          if (!response.ok) {
            lastError = data.error || response.statusText || 'Failed to resolve external link';
            continue;
          }
          return data;
        } catch (err: any) {
          lastError = err?.message || 'Failed to resolve external link';
        }
      }

      throw new Error(lastError || 'Failed to resolve external link');
    },

    unlockUrl: async (code, password) => {
      const cleanCode = normalizeShortCode(code);
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
      const url = `${baseUrl}/api/v1/resolve/${encodeURIComponent(cleanCode)}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = getApiKeyHeader();
      if (apiKey) headers['x-api-key'] = apiKey;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlock');
      }
      return data;
    },

    updateLink: async (id, updates) => {
      set({ loading: true });
      try {
        await apiFetch(`/api/v1/links/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });

        const updatedLinks = get().links.map(link => {
          if (link.id === id) {
            return {
              ...link,
              ...updates,
              updatedAt: Date.now(),
            };
          }
          return link;
        });

        set({ links: updatedLinks, loading: false });
        setLocalStorage('snap-links', updatedLinks);
        return true;
      } catch (error) {
        set({ loading: false });
        return false;
      }
    },

    deleteLink: async (id) => {
      set({ loading: true });
      try {
        await apiFetch(`/api/v1/links/${id}`, {
          method: 'DELETE',
        });

        const updatedLinks = get().links.filter(link => link.id !== id);
        const updatedClicks = get().analytics.filter(click => click.linkId !== id);

        set({ links: updatedLinks, analytics: updatedClicks, loading: false });
        setLocalStorage('snap-links', updatedLinks);
        setLocalStorage('snap-clicks', updatedClicks);
        return true;
      } catch (error) {
        set({ loading: false });
        return false;
      }
    },

    toggleLinkActive: async (id) => {
      const links = get().links;
      const target = links.find(l => l.id === id);
      if (!target) return false;

      return get().updateLink(id, { isActive: !target.isActive });
    },

    fetchLinks: async () => {
      set({ loading: true });
      try {
        const result = await apiFetch('/api/v1/links');
        if (Array.isArray(result.links)) {
          set({ links: result.links, loading: false });
          setLocalStorage('snap-links', result.links);
        }
        return true;
      } catch (error) {
        set({ loading: false });
        return false;
      }
    },

    fetchApiKeys: async () => {
      set({ loading: true });
      try {
        const result = await apiFetch('/api/v1/apikeys');
        if (Array.isArray(result.apiKeys)) {
          set({ apiKeys: result.apiKeys, loading: false });
          setLocalStorage('snap-apikeys', result.apiKeys);
        }
        return true;
      } catch (error) {
        set({ loading: false });
        return false;
      }
    },

    reportLink: async (shortCode, reason) => {
      try {
        await apiFetch('/api/v1/links/report', {
          method: 'POST',
          body: JSON.stringify({ shortCode, reason }),
        });
        return true;
      } catch {
        return false;
      }
    },

    createApiKey: async (name) => {
      set({ loading: true });
      try {
        const result = await apiFetch('/api/v1/apikeys', {
          method: 'POST',
          body: JSON.stringify({ name }),
        });

        const newKey = result.apiKey as ApiKey;
        const rawKey = result.rawKey as string;
        const updated = [newKey, ...get().apiKeys];
        set({ apiKeys: updated, loading: false });
        setLocalStorage('snap-apikeys', updated);
        if (rawKey) {
          setLocalStorage('snap-service-key', rawKey);
        }
        return newKey;
      } catch (error) {
        set({ loading: false });
        throw error;
      }
    },

    revokeApiKey: async (id) => {
      set({ loading: true });
      try {
        await apiFetch(`/api/v1/apikeys/${id}`, {
          method: 'DELETE',
        });

        const updated = get().apiKeys.filter(k => k.id !== id);
        set({ apiKeys: updated, loading: false });
        setLocalStorage('snap-apikeys', updated);

        const currentKey = localStorage.getItem('snap-service-key');
        const revoked = get().apiKeys.find(k => k.id === id);
        if (revoked?.keyHash === currentKey) {
          localStorage.removeItem('snap-service-key');
        }

        return true;
      } catch (error) {
        set({ loading: false });
        return false;
      }
    },

    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      set({ theme: nextTheme });
      if (isClient) {
        localStorage.setItem('snap-theme', nextTheme);
        const root = document.documentElement;
        if (nextTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
    },

    setTheme: (newTheme) => {
      set({ theme: newTheme });
      if (isClient) {
        localStorage.setItem('snap-theme', newTheme);
        const root = document.documentElement;
        if (newTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      }
    }
  };
});
