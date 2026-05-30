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
  shortenUrl: (longUrl: string, options?: { customAlias?: string; password?: string; expiresAt?: number }) => Promise<Link>;
  expandUrl: (code: string) => Promise<{ longUrl: string } | { passwordProtected: boolean; shortCode: string }>;
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
}

// Generates high quality pre-seeded chronological analytical clicks over the last 14 days
const generateSeedClicks = (links: Link[]): ClickLog[] => {
  const seedLogs: ClickLog[] = [];
  const countries = ['United States', 'India', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Brazil', 'France'];
  const referrers = ['X / Twitter', 'LinkedIn', 'GitHub', 'Direct / Email', 'Reddit', 'HackerNews', 'ProductHunt'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];

  const weightByCountry = [0.4, 0.2, 0.15, 0.08, 0.07, 0.04, 0.03, 0.03];
  const weightByReferrer = [0.35, 0.25, 0.15, 0.15, 0.05, 0.03, 0.02];
  const weightByDevice = [0.65, 0.3, 0.05];
  const weightByBrowser = [0.55, 0.25, 0.12, 0.08];

  const pickWeighted = <T>(items: T[], weights: number[]): T => {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (r <= sum) return items[i];
    }
    return items[items.length - 1];
  };

  const now = Date.now();
  links.forEach(link => {
    // Generate clicks based on click count
    for (let i = 0; i < link.clickCount; i++) {
      // Clicks distributed unevenly in the last 14 days
      const daysAgo = Math.pow(Math.random(), 1.5) * 14; 
      const clickedAt = now - daysAgo * 24 * 60 * 60 * 1000;

      seedLogs.push({
        id: `click-${Math.random().toString(36).substr(2, 9)}`,
        linkId: link.id,
        clickedAt,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: pickWeighted(countries, weightByCountry),
        device: pickWeighted(devices, weightByDevice),
        browser: pickWeighted(browsers, weightByBrowser),
        referrer: pickWeighted(referrers, weightByReferrer),
      });
    }
  });

  return seedLogs.sort((a, b) => b.clickedAt - a.clickedAt);
};

// Initial Seed Links
const initialMockLinks: Link[] = [
  {
    id: 'link-1',
    userId: 'user-default',
    shortCode: 'github',
    longUrl: 'https://github.com/sougandhhhhh',
    customAlias: 'github',
    isActive: true,
    expiresAt: null,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    clickCount: 1245
  },
  {
    id: 'link-2',
    userId: 'user-default',
    shortCode: 'portfolio',
    longUrl: 'https://sougandhhhhh.github.io',
    customAlias: 'portfolio',
    isActive: true,
    expiresAt: null,
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    clickCount: 834
  },
  {
    id: 'link-3',
    userId: 'user-default',
    shortCode: 'tw-docs',
    longUrl: 'https://tailwindcss.com/docs',
    customAlias: 'tw-docs',
    isActive: true,
    expiresAt: null,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    clickCount: 342
  },
  {
    id: 'link-4',
    userId: 'user-default',
    shortCode: 'expired-next',
    longUrl: 'https://nextjs.org/docs',
    customAlias: 'expired-next',
    isActive: true,
    expiresAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // Expired yesterday
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    clickCount: 98
  },
  {
    id: 'link-5',
    userId: 'user-default',
    shortCode: 'stripe-pay',
    longUrl: 'https://stripe.com',
    customAlias: 'stripe-pay',
    isActive: true,
    password: 'securePassword123',
    expiresAt: null,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    clickCount: 12
  }
];

const mockSeedClicks = generateSeedClicks(initialMockLinks);

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

  // Build Store State
  const initialLinks = getLocalStorage<Link[]>('snap-links', initialMockLinks);
  const initialClicks = getLocalStorage<ClickLog[]>('snap-clicks', mockSeedClicks);
  const initialUser = getLocalStorage<User | null>('snap-user', null);
  const initialKeys = getLocalStorage<ApiKey[]>('snap-apikeys', [
    {
      id: 'key-1',
      userId: 'user-default',
      name: 'Production Server Core',
      keyHash: FALLBACK_API_KEY || 'su_dev_bootstrap_key',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastUsedAt: Date.now() - 2 * 60 * 60 * 1000
    }
  ]);
  const initialReports = getLocalStorage('snap-reports', [
    {
      id: 'rep-1',
      linkId: 'link-4',
      reason: 'Phishing attempt on NextJS replica',
      reportedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    }
  ]);

  return {
    user: initialUser,
    links: initialLinks,
    analytics: initialClicks,
    apiKeys: initialKeys,
    reportedLinks: initialReports,
    theme: getInitialTheme(),
    loading: false,

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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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
          role: result.user.role || 'user',
        };

        const apiKey: ApiKey = result.apiKey;
        const rawKey = result.rawKey;

        set({ user, apiKeys: [apiKey], loading: false });
        setLocalStorage('snap-user', user);
        setLocalStorage('snap-apikeys', [{ ...apiKey, keyHash: rawKey || apiKey.keyHash }]);
        await get().fetchLinks?.();
      } catch (err: any) {
        set({ loading: false });
        throw new Error(err.message || 'Failed to link account');
      }
    },

    restoreSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const storedUser = getLocalStorage<User | null>('snap-user', null);
        const storedKeys = getLocalStorage<ApiKey[]>('snap-apikeys', []);
        if (storedUser && storedKeys.length > 0) {
          set({ user: storedUser, apiKeys: storedKeys });
          await get().fetchLinks?.();
        } else {
          await get().syncSupabaseUser(session.user);
        }
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
        };

        const result = await apiFetch('/api/v1/shorten', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const createdLink: Link = {
          id: result.id,
          userId: get().user?.id || '',
          shortCode: result.shortCode,
          longUrl: result.longUrl,
          customAlias: null,
          isActive: true,
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
      const cleanCode = code.replace(/^https?:\/\/[^\/]+\//, '').replace(/^\/+/, '').replace(/\/+$/, '');
      return apiFetch(`/api/v1/resolve/${encodeURIComponent(cleanCode)}`);
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
      const link = get().links.find(l => l.shortCode === shortCode);
      if (!link) return false;

      const newReport = {
        id: `rep-${Math.random().toString(36).substr(2, 9)}`,
        linkId: link.id,
        reason,
        reportedAt: Date.now(),
      };

      const updated = [newReport, ...get().reportedLinks];
      set({ reportedLinks: updated });
      setLocalStorage('snap-reports', updated);
      return true;
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
