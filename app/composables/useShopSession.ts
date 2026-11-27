import type { ShopSession } from '~/types/shop'

export function useShopSessionRequest() {
  const request = useRequestFetch()
  const event = useRequestEvent()
  if (event) useResponseHeader('Cache-Control').value = 'private, no-store'
  return async () => {
    const response = await request.raw<{ user: ShopSession | null }>('/api/auth/session')
    if (import.meta.server && event) {
      const { appendResponseHeader } = await import('h3')
      for (const cookie of response.headers.getSetCookie()) appendResponseHeader(event, 'Set-Cookie', cookie)
    }
    return response._data ?? { user: null }
  }
}

export function useShopSession() {
  const load = useShopSessionRequest()
  return useAsyncData('shop-session', load)
}
