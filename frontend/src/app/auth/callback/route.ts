import { type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabase-server'

export async function GET(request: NextRequest) {
  const { supabase, finalise } = createSupabaseServerClient(request)

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return finalise('/login?error=No%20code%20received')
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return finalise('/login?error=' + encodeURIComponent('Session exchange failed: ' + error.message))
  }

  if (!data.session?.user) {
    return finalise('/login?error=No%20session%20found')
  }

  const user = data.session.user
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? '').trim()

  try {
    await fetch(`${apiUrl}/api/v1/auth/supabase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseId: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      }),
    })
  } catch {
    // non-critical; syncSupabaseUser runs again on the home page if needed
  }

  return finalise('/')
}
