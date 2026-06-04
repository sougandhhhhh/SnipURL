import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createSupabaseServerClient(request: NextRequest) {
  let response: NextResponse | null = null
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookies) {
        for (const { name, value, options } of cookies) {
          cookiesToSet.push({ name, value, options })
        }
      },
    },
  })

  return {
    supabase,
    finalise(redirectUrl: string) {
      if (!response) {
        response = NextResponse.redirect(new URL(redirectUrl, request.url))
      }
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options)
      }
      return response
    },
    getResponse() {
      return response
    },
  }
}

export { NextResponse }
