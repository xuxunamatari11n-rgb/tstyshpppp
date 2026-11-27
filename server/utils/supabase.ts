import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie, setResponseHeader, type H3Event } from 'h3'
import type { Database } from '~~/shared/types/database'
const sessions = new WeakMap<H3Event, SupabaseClient<Database>>()

function credentials(event: H3Event) {
  const config = useRuntimeConfig(event)
  const url = config.supabaseUrl.trim()
  const key = config.supabasePublishableKey.trim()
  if (!url || !key.startsWith('sb_publishable_') || key === 'sb_publishable_replace_me') {
    throw createError({ statusCode: 503, statusMessage: 'Supabase is not configured' })
  }
  return { url, key }
}

export function publicShopClient(event: H3Event) {
  const { url, key } = credentials(event)
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function shopSessionClient(event: H3Event) {
  const existing = sessions.get(event)
  if (existing) return existing
  const { url, key } = credentials(event)
  const secure = useRuntimeConfig(event).siteUrl.startsWith('https://') || getRequestURL(event).protocol === 'https:'
  const availableCookies = new Map(Object.entries(parseCookies(event)))
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const client = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => [...availableCookies].map(([name, value]) => ({ name, value })),
      setAll(cookies, headers) {
        for (const [name, value] of Object.entries(headers)) setResponseHeader(event, name, value)
        for (const { name, value, options } of cookies) {
          availableCookies.set(name, value)
          setCookie(event, name, value, { ...options, path: '/', httpOnly: true, sameSite: 'lax', secure })
        }
      },
    },
  })
  sessions.set(event, client)
  return client
}
