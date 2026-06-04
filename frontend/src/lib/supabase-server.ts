import { stringFromBase64URL } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const storageKey = `sb-${projectRef}-auth-token`

export function createServerContext(request: NextRequest) {
  const cookiesToSet: { name: string; value: string; options: Record<string, string | number | boolean> }[] = []

  return {
    getCodeVerifier(): string | null {
      const raw = request.cookies.get(`${storageKey}-code-verifier`)?.value ?? null
      if (!raw) return null
      try {
        const prefix = 'base64-'
        if (!raw.startsWith(prefix)) return raw
        const b64url = raw.slice(prefix.length)
        const decoded = stringFromBase64URL(b64url)
        return JSON.parse(decoded)
      } catch {
        return raw
      }
    },
    captureSetCookies(name: string, value: string, options: Record<string, string | number | boolean>) {
      cookiesToSet.push({ name, value, options })
    },
    finalise(redirectUrl: string) {
      const url = new URL(redirectUrl, request.url)
      const response = NextResponse.redirect(url)
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options)
      }
      return response
    },
  }
}
