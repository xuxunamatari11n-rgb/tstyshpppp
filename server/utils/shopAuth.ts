import type { H3Event } from 'h3'
import type { ShopSession } from '~/types/shop'

const inactiveSessionCodes = new Set(['session_not_found', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'])

export function shopOrigin(event: H3Event) {
  const raw = useRuntimeConfig(event).siteUrl.trim()
  if (!raw && import.meta.dev) return getRequestURL(event).origin
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error()
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error()
    return url.origin
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Trusted storefront origin is not configured' })
  }
}

export function requireShopOrigin(event: H3Event) {
  const origin = getHeader(event, 'origin')
  if (origin !== shopOrigin(event) || getHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({ statusCode: 403, statusMessage: 'Cross-origin request refused' })
  }
}

export async function readShopSession(event: H3Event, client = shopSessionClient(event)): Promise<ShopSession | null> {
  const { data: { user }, error } = await client.auth.getUser()
  if (error) {
    if (error.name === 'AuthSessionMissingError' || error.status === 401 || error.status === 403 || inactiveSessionCodes.has(error.code ?? '')) return null
    throw createError({ statusCode: 503, statusMessage: 'Authentication unavailable' })
  }
  if (!user) return null
  const [roles, profile] = await Promise.all([
    client.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
    client.from('profiles').select('first_name').eq('id', user.id).maybeSingle(),
  ])
  if (roles.error || profile.error) throw createError({ statusCode: 503, statusMessage: 'Account data unavailable' })
  return { id: user.id, email: user.email ?? '', firstName: profile.data?.first_name ?? '', role: roles.data?.role ?? 'customer' }
}

export async function requireShopSession(event: H3Event) {
  const user = await readShopSession(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  return user
}
