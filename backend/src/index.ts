import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql, desc } from 'drizzle-orm';
import * as schema from './db/schema';
import { encodeSequential, validateUrl, isSpamOrMalicious } from './utils/helpers';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  FRONTEND_URL?: string; // Next.js dashboard URL
  SERVICE_API_KEY?: string; // Optional fallback API key for bootstrap or local dev
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend dashboard calls
app.use('*', cors({
  origin: '*', // Set to specific frontend domain in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

/**
 * 1. DYNAMIC REDIRECT ENGINE (Ultra-fast Edge Redirect)
 */
app.get('/:code', async (c) => {
  const code = c.req.param('code');
  const db = drizzle(c.env.DB, { schema });
  const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code || code === 'api' || code === 'dashboard' || code === 'favicon.ico') {
    return c.notFound();
  }

  // A. Check Cloudflare KV Cache First
  let linkData: {
    id: string;
    longUrl: string;
    isActive: boolean;
    password?: string | null;
    expiresAt?: number | null;
  } | null = null;

  try {
    if (c.env.KV) {
      const cached = await c.env.KV.get(`code:${code}`);
      if (cached) {
        linkData = JSON.parse(cached);
      }
    }
  } catch (err) {
    console.error('KV Read Error:', err);
  }

  // B. Cache Miss: Query Cloudflare D1
  if (!linkData) {
    try {
      const results = await db
        .select()
        .from(schema.links)
        .where(
          and(
            eq(schema.links.isActive, true),
            sql`${schema.links.shortCode} = ${code} OR ${schema.links.customAlias} = ${code}`
          )
        )
        .limit(1);

      if (results.length > 0) {
        const link = results[0];
        linkData = {
          id: link.id,
          longUrl: link.longUrl,
          isActive: link.isActive,
          password: link.password,
          expiresAt: link.expiresAt,
        };

        // Cache in KV for subsequent quick access (10 min expiry or manual purge on update)
        try {
          if (c.env.KV) {
            await c.env.KV.put(`code:${code}`, JSON.stringify(linkData), { expirationTtl: 600 });
          }
        } catch (kvErr) {
          console.error('KV put error (non-fatal):', kvErr);
        }
      }
    } catch (err) {
      console.error('D1 Read Error:', err);
    }
  }

  // C. Validate Link Attributes (Active, Expiration, Password-protection)
  if (!linkData || !linkData.isActive) {
    return c.redirect(`${frontendUrl}/404`);
  }

  // Expiration check
  if (linkData.expiresAt && Date.now() > linkData.expiresAt) {
    return c.redirect(`${frontendUrl}/expired?code=${code}`);
  }

  // Password protection check -> Redirect to frontend password challenge page
  if (linkData.password) {
    return c.redirect(`${frontendUrl}/p/${code}`);
  }

  // D. Async Click tracking (non-blocking for ultra-fast redirect)
  c.executionCtx.waitUntil(
    (async () => {
      try {
        const headers = c.req.raw.headers;
        const ip = headers.get('cf-connecting-ip') || headers.get('x-real-ip') || '127.0.0.1';
        
        // Parse metadata supplied by Cloudflare Edge
        const country = c.req.raw.cf?.country || 'Unknown';
        const userAgent = headers.get('user-agent') || 'Unknown';
        const referrer = headers.get('referer') || 'Direct';

        // Parse basic device type from User Agent
        let device = 'Desktop';
        if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
          device = 'Mobile';
        } else if (/tablet|playbook|silk/i.test(userAgent)) {
          device = 'Tablet';
        }

        // Parse basic browser name
        let browser = 'Other';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Write analytics record to D1
        await db.insert(schema.analytics).values({
          id: crypto.randomUUID(),
          linkId: linkData!.id,
          clickedAt: Date.now(),
          ipAddress: ip,
          country: String(country),
          device,
          browser,
          referrer: referrer.startsWith('http') ? new URL(referrer).hostname : 'Direct',
        });
      } catch (err) {
        console.error('Analytics log error:', err);
      }
    })()
  );

  // E. Perform instant redirect
  return c.redirect(linkData.longUrl, 302);
});

/**
 * 2. API SYSTEM - AUTH MIDDLEWARE
 */
const authenticateApiKey = async (c: any, next: any) => {
  const apiKey = c.req.header('x-api-key');
  if (!apiKey) {
    return c.json({ error: 'Unauthorized: Missing x-api-key header' }, 401);
  }

  // Check service API key first (avoids D1 dependency when key matches)
  if (apiKey === (c.env.SERVICE_API_KEY || 'su_dev_bootstrap_key')) {
    c.set('userId', 'user-default');
    await next();
    return;
  }

  const db = drizzle(c.env.DB, { schema });
  try {
    const keys = await db
      .select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.keyHash, apiKey))
      .limit(1);

    if (keys.length === 0) {
      return c.json({ error: 'Unauthorized: Invalid API Key' }, 401);
    }

    c.set('userId', keys[0].userId);
    c.executionCtx.waitUntil(
      db.update(schema.apiKeys)
        .set({ lastUsedAt: Date.now() })
        .where(eq(schema.apiKeys.id, keys[0].id))
    );

    await next();
  } catch (err) {
    return c.json({ error: 'Internal Server Error authenticating API Key' }, 500);
  }
};

/**
 * 3. API SYSTEM - ENDPOINTS
 */

// A. URL Shortener Endpoint
app.post('/api/v1/shorten', authenticateApiKey, async (c) => {
  try {
    const body = await c.req.json();
    const { longUrl, customAlias, password, expiresAt } = body;
    const userId = c.get('userId');
    const db = drizzle(c.env.DB, { schema });

    // Input sanitization
    if (!longUrl) {
      return c.json({ error: 'Missing longUrl' }, 400);
    }
    if (!validateUrl(longUrl)) {
      return c.json({ error: 'Invalid URL scheme. Must start with http:// or https://' }, 400);
    }
    if (isSpamOrMalicious(longUrl)) {
      return c.json({ error: 'Unsafe or malicious target URL detected' }, 403);
    }
    let shortCode = customAlias ? customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '') : '';
    
    // Alias collision checks
    if (shortCode) {
      if (['api', 'dashboard', 'settings', 'admin', 'login', 'register', 'pricing', 'features'].includes(shortCode.toLowerCase())) {
        return c.json({ error: 'Alias matches a reserved system path' }, 400);
      }
      
      const existing = await db
        .select()
        .from(schema.links)
        .where(eq(schema.links.shortCode, shortCode))
        .limit(1);
      
      if (existing.length > 0) {
        return c.json({ error: 'Custom alias already in use' }, 409);
      }
    } else {
      // Sequential short code (a, b, c, ..., z, aa, ab, ...)
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.links);
      const totalCount = Number(countResult[0]?.count ?? 0);
      shortCode = encodeSequential(totalCount + 1);
    }

    const newLink = {
      id: crypto.randomUUID(),
      userId,
      shortCode,
      longUrl,
      customAlias: customAlias ? shortCode : null,
      isActive: true,
      password: password || null,
      expiresAt: expiresAt ? Number(expiresAt) : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.insert(schema.links).values(newLink);

    // Seed the KV cache immediately to avoid D1 hit on first redirect
    try {
      const kvPayload = {
        id: newLink.id,
        longUrl: newLink.longUrl,
        isActive: newLink.isActive,
        password: newLink.password,
        expiresAt: newLink.expiresAt,
      };
      await c.env.KV.put(`code:${shortCode}`, JSON.stringify(kvPayload), { expirationTtl: 600 });
    } catch (kvErr) {
      console.error('KV seed error (non-fatal):', kvErr);
    }

    const displayDomain = (c.env.FRONTEND_URL || '').replace(/\/+$/, '').trim() || c.req.url.replace('/api/v1/shorten', '');
    const shortUrl = `${displayDomain}/${shortCode}`;
    return c.json({
      success: true,
      id: newLink.id,
      shortCode,
      shortUrl,
      longUrl: newLink.longUrl,
      passwordEnabled: !!newLink.password,
      expiresAt: newLink.expiresAt,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`,
    }, 201);

  } catch (err: any) {
    return c.json({ error: err?.message || err?.toString() || 'Database error creating shortened link' }, 500);
  }
});

// B. Fetch Links List
app.get('/api/v1/links', authenticateApiKey, async (c) => {
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    const list = await db
      .select({
        id: schema.links.id,
        shortCode: schema.links.shortCode,
        longUrl: schema.links.longUrl,
        customAlias: schema.links.customAlias,
        isActive: schema.links.isActive,
        createdAt: schema.links.createdAt,
        expiresAt: schema.links.expiresAt,
        passwordEnabled: sql`CASE WHEN ${schema.links.password} IS NOT NULL THEN 1 ELSE 0 END`,
        clickCount: sql`COUNT(${schema.analytics.id})`
      })
      .from(schema.links)
      .leftJoin(schema.analytics, eq(schema.analytics.linkId, schema.links.id))
      .where(eq(schema.links.userId, userId))
      .groupBy(
        schema.links.id,
        schema.links.shortCode,
        schema.links.longUrl,
        schema.links.customAlias,
        schema.links.isActive,
        schema.links.createdAt,
        schema.links.expiresAt,
        schema.links.password
      )
      .orderBy(desc(schema.links.createdAt));

    return c.json({ success: true, links: list });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error fetching link repository' }, 500);
  }
});

// C. API Key Management Endpoints
app.get('/api/v1/apikeys', authenticateApiKey, async (c) => {
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    const keys = await db
      .select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.userId, userId))
      .orderBy(desc(schema.apiKeys.createdAt));

    return c.json({ success: true, apiKeys: keys });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error fetching API keys' }, 500);
  }
});

app.post('/api/v1/apikeys', authenticateApiKey, async (c) => {
  const body = await c.req.json();
  const { name } = body;
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  if (!name || typeof name !== 'string') {
    return c.json({ error: 'API key name is required' }, 400);
  }

  try {
    const rawKey = `su_live_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const newKey = {
      id: crypto.randomUUID(),
      userId,
      keyHash: rawKey,
      name,
      createdAt: Date.now(),
      lastUsedAt: null,
    };

    await db.insert(schema.apiKeys).values(newKey);

    return c.json({ success: true, apiKey: newKey, rawKey }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Error creating API key' }, 500);
  }
});

app.delete('/api/v1/apikeys/:id', authenticateApiKey, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    const existing = await db
      .select()
      .from(schema.apiKeys)
      .where(and(eq(schema.apiKeys.id, id), eq(schema.apiKeys.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'API key not found' }, 404);
    }

    await db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id));
    return c.json({ success: true, message: 'API key revoked successfully' });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error revoking API key' }, 500);
  }
});

// D. Update Link Configuration (Password, Status, Target)
app.put('/api/v1/links/:id', authenticateApiKey, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { longUrl, isActive, password, expiresAt } = body;
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    const existing = await db
      .select()
      .from(schema.links)
      .where(and(eq(schema.links.id, id), eq(schema.links.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'Link record not found or access denied' }, 404);
    }

    const originalLink = existing[0];
    const updateData: any = { updatedAt: Date.now() };
    
    if (longUrl !== undefined) {
      if (!validateUrl(longUrl)) return c.json({ error: 'Malformed absolute URL' }, 400);
      if (isSpamOrMalicious(longUrl)) return c.json({ error: 'Malicious domain' }, 403);
      updateData.longUrl = longUrl;
    }
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (password !== undefined) updateData.password = password || null;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? Number(expiresAt) : null;

    await db.update(schema.links).set(updateData).where(eq(schema.links.id, id));

    // Clear KV Cache immediately on edit to force cache-miss reload
    try {
      if (c.env.KV) {
        await c.env.KV.delete(`code:${originalLink.shortCode}`);
        if (originalLink.customAlias) {
          await c.env.KV.delete(`code:${originalLink.customAlias}`);
        }
      }
    } catch (kvErr) {
      console.error('KV delete error (non-fatal):', kvErr);
    }

    return c.json({ success: true, message: 'Link profile updated successfully' });
  } catch (err: any) {
    return c.json({ error: err.message || 'Database error updating link configuration' }, 500);
  }
});

// D. Delete Link Profile
app.delete('/api/v1/links/:id', authenticateApiKey, async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    const existing = await db
      .select()
      .from(schema.links)
      .where(and(eq(schema.links.id, id), eq(schema.links.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'Link profile not found' }, 404);
    }

    const originalLink = existing[0];
    
    await db.delete(schema.links).where(eq(schema.links.id, id));

    // Evict KV Cache immediately
    try {
      if (c.env.KV) {
        await c.env.KV.delete(`code:${originalLink.shortCode}`);
        if (originalLink.customAlias) {
          await c.env.KV.delete(`code:${originalLink.customAlias}`);
        }
      }
    } catch (kvErr) {
      console.error('KV delete error (non-fatal):', kvErr);
    }

    return c.json({ success: true, message: 'Link completely purged' });
  } catch (err: any) {
    return c.json({ error: err.message || 'Database error deleting link profile' }, 500);
  }
});

// E. Retrieve Analytical Report
app.get('/api/v1/analytics/:linkId', authenticateApiKey, async (c) => {
  const linkId = c.req.param('linkId');
  const userId = c.get('userId');
  const db = drizzle(c.env.DB, { schema });

  try {
    // 1. Verify link ownership
    const linkOwnership = await db
      .select()
      .from(schema.links)
      .where(and(eq(schema.links.id, linkId), eq(schema.links.userId, userId)))
      .limit(1);

    if (linkOwnership.length === 0) {
      return c.json({ error: 'Access denied to these metrics' }, 403);
    }

    // 2. Fetch full click streams
    const logs = await db
      .select()
      .from(schema.analytics)
      .where(eq(schema.analytics.linkId, linkId))
      .orderBy(desc(schema.analytics.clickedAt));

    // Aggregate values
    const totalClicks = logs.length;
    const uniqueIPs = new Set(logs.map(log => log.ipAddress));
    
    const countriesMap: Record<string, number> = {};
    const devicesMap: Record<string, number> = {};
    const browsersMap: Record<string, number> = {};
    const referrersMap: Record<string, number> = {};

    logs.forEach(log => {
      countriesMap[log.country] = (countriesMap[log.country] || 0) + 1;
      devicesMap[log.device] = (devicesMap[log.device] || 0) + 1;
      browsersMap[log.browser] = (browsersMap[log.browser] || 0) + 1;
      referrersMap[log.referrer] = (referrersMap[log.referrer] || 0) + 1;
    });

    const formatToSortedList = (map: Record<string, number>) => 
      Object.entries(map)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return c.json({
      success: true,
      analytics: {
        totalClicks,
        uniqueVisitors: uniqueIPs.size,
        countries: formatToSortedList(countriesMap),
        devices: formatToSortedList(devicesMap),
        browsers: formatToSortedList(browsersMap),
        referrers: formatToSortedList(referrersMap),
        clicksHistory: logs.map(log => ({
          timestamp: log.clickedAt,
          ip: log.ipAddress,
          country: log.country,
          device: log.device,
          browser: log.browser
        })).slice(0, 100), // Limit history array size to avoid bloat
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Error processing analytical dashboard queries' }, 500);
  }
});

// F. Supabase Auth Endpoint (no auth) — creates/links user + returns API key
app.post('/api/v1/auth/supabase', async (c) => {
  try {
    const body = await c.req.json();
    const { supabaseId, email, name } = body;
    if (!supabaseId || !email) {
      return c.json({ error: 'supabaseId and email required' }, 400);
    }

    const db = drizzle(c.env.DB, { schema });
    const displayName = name || email.split('@')[0] || 'User';
    const now = Date.now();

    let [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, supabaseId))
      .limit(1);

    if (!existingUser) {
      const newUser = { id: supabaseId, email, name: displayName, passwordHash: null, createdAt: now };
      await db.insert(schema.users).values(newUser);
      existingUser = newUser as any;
    } else {
      await db.update(schema.users)
        .set({ email, name: displayName })
        .where(eq(schema.users.id, supabaseId));
    }

    const [existingKey] = await db
      .select()
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.userId, supabaseId))
      .limit(1);

    if (existingKey) {
      return c.json({
        success: true,
        user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.email?.includes('admin') ? 'admin' : 'user' },
        apiKey: { id: existingKey.id, userId: existingKey.userId, name: existingKey.name, keyHash: existingKey.keyHash, createdAt: existingKey.createdAt, lastUsedAt: existingKey.lastUsedAt },
      });
    }

    const rawKey = `su_live_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
    const newKey = {
      id: crypto.randomUUID(),
      userId: supabaseId,
      keyHash: rawKey,
      name: 'Auto-generated',
      createdAt: now,
      lastUsedAt: null,
    };

    await db.insert(schema.apiKeys).values(newKey);

    return c.json({
      success: true,
      user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.email?.includes('admin') ? 'admin' : 'user' },
      apiKey: newKey,
      rawKey,
    }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || err?.toString() || 'Error processing Supabase auth' }, 500);
  }
});

// G. Public Resolve Endpoint (no auth) — used by frontend catch-all redirect
app.get('/api/v1/resolve/:code', async (c) => {
  const code = c.req.param('code');
  let linkData: any = null;

  // Try KV cache first
  if (c.env.KV) {
    try {
      const cached = await c.env.KV.get(`code:${code}`);
      if (cached) linkData = JSON.parse(cached);
    } catch {}
  }

  // Fallback to D1
  if (!linkData) {
    const db = drizzle(c.env.DB, { schema });
    try {
      const rows = await db
        .select()
        .from(schema.links)
        .where(eq(schema.links.shortCode, code))
        .limit(1);
      if (rows.length > 0) {
        const row = rows[0];
        linkData = {
          longUrl: row.longUrl,
          password: row.password,
          expiresAt: row.expiresAt,
          isActive: row.isActive,
        };
      }
    } catch {}
  }

  if (!linkData) {
    return c.json({ error: 'Not found' }, 404);
  }

  if (!linkData.isActive || (linkData.expiresAt && Date.now() > linkData.expiresAt)) {
    return c.json({ error: 'Expired' }, 410);
  }

  if (linkData.password) {
    return c.json({ passwordProtected: true, shortCode: code }, 403);
  }

  return c.json({ longUrl: linkData.longUrl });
});

export default app;
