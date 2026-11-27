import type { ShopSession } from '~/types/shop'

export function useShopIdentity() {
  return useState<ShopSession | null | undefined>('shop-identity-client', () => undefined)
}

export function useShopIdentityControl() {
  const identity = useShopIdentity()
  const version = useState('shop-identity-version', () => 0)
  function invalidate(user: ShopSession | null | undefined) {
    ++version.value
    identity.value = user
  }
  return { identity, version, invalidate }
}

export function useShopSessionRequest() {
  const request = useRequestFetch()
  const { identity, version } = useShopIdentityControl()
  const event = useRequestEvent()
  if (event) useResponseHeader('Cache-Control').value = 'private, no-store'
  return async () => {
    const current = import.meta.client ? ++version.value : 0
    const response = await request.raw<{ user: ShopSession | null }>('/api/auth/session')
    if (import.meta.server && event) {
      const { appendResponseHeader } = await import('h3')
      for (const cookie of response.headers.getSetCookie()) appendResponseHeader(event, 'Set-Cookie', cookie)
    }
    const data = response._data ?? { user: null }
    if (import.meta.client && version.value === current) identity.value = data.user
    return data
  }
}

export function useShopSession() {
  const load = useShopSessionRequest()
  return useAsyncData('shop-session', load)
}
