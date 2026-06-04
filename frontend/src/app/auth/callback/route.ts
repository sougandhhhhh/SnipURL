import { type NextRequest } from 'next/server'
import { createServerContext } from '../../../lib/supabase-server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const storageKey = `sb-${projectRef}-auth-token`

export async function GET(request: NextRequest) {
  const ctx = createServerContext(request)

  const code = request.nextUrl.searchParams.get('code')
  if (!code) {
    return ctx.finalise('/login?error=No%20code%20received')
  }

  const codeVerifier = ctx.getCodeVerifier()
  if (!codeVerifier) {
    return ctx.finalise('/login?error=PKCE%20code%20verifier%20not%20found%20in%20storage')
  }

  try {
    // Exchange the authorization code for a session via the Supabase Auth REST API
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        auth_code: code,
        code_verifier: codeVerifier,
      }),
    })

    const tokenBody = await tokenRes.json()
    if (!tokenRes.ok) {
      return ctx.finalise('/login?error=' + encodeURIComponent(tokenBody.error_description || tokenBody.error || 'Token exchange failed'))
    }

    // Set the session cookie exactly as GoTrueClient expects it
    const session = tokenBody
    const maxAge = 400 * 24 * 60 * 60 // 400 days
    const cookieOptions = { path: '/', sameSite: 'lax' as const, httpOnly: false, maxAge }

    // Write the session storage item (JSON stringified)
    ctx.captureSetCookies(storageKey, JSON.stringify(session), cookieOptions)

    // Sync user to backend (non-blocking)
    const user = session.user
    if (user) {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim()
      fetch(`${apiUrl}/api/v1/auth/supabase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseId: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        }),
      }).catch(() => {})
    }

    return ctx.finalise('/')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Exchange failed'
    return ctx.finalise('/login?error=' + encodeURIComponent(msg))
  }
}
