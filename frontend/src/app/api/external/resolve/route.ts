import { NextRequest, NextResponse } from 'next/server';

const isBlockedHost = (hostname: string) => {
  const host = hostname.toLowerCase();
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.startsWith('127.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  );
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = String(body?.url || '').trim();
    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const normalizedUrl = (() => {
      try {
        return new URL(rawUrl).href;
      } catch {
        try {
          return new URL(`https://${rawUrl}`).href;
        } catch {
          return '';
        }
      }
    })();

    if (!normalizedUrl) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const target = new URL(normalizedUrl);
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL scheme' }, { status: 400 });
    }

    if (isBlockedHost(target.hostname)) {
      return NextResponse.json({ error: 'Unsupported external host' }, { status: 400 });
    }

    const response = await fetch(target.toString(), {
      redirect: 'follow',
      headers: {
        'user-agent': 'SnipURL-Resolver/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to resolve external link (${response.status})` },
        { status: 400 }
      );
    }

    if (response.url === target.toString()) {
      return NextResponse.json(
        { error: 'Could not resolve a public redirect for this link' },
        { status: 400 }
      );
    }

    return NextResponse.json({ longUrl: response.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to resolve external link' },
      { status: 500 }
    );
  }
}
