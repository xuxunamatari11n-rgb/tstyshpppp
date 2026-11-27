import type { Ref } from 'vue'
import type { ShopSession } from '~/types/shop'
import type { AddressForm, AddressSaveResult, CustomerAddress, CustomerProfile } from '~/types/customer'
import { customerReturnQuery } from '~~/shared/utils/customerAccount'

export function useCustomerAccount(options: { logoutDestination?: string } = {}) {
  const state = useCustomerSession()
  const { user, profile, addresses, profileStatus, addressStatus, revision, setUser } = state
  const localePath = useLocalePath()
  const { locale } = useI18n()
  const { invalidate } = useShopIdentityControl()
  const cachedSession = useNuxtData<{ user: ShopSession | null }>('shop-session').data
  const requests = useState('customer-requests', () => ({ profile: 0, addresses: 0 }))
  const signingOut = useState('customer-signing-out', () => false)
  const logoutError = useState('customer-logout-error', () => false)

  function expire() {
    invalidate(null)
    setUser(null)
    clearNuxtData('shop-session')
  }

  async function withOwner<T>(operation: (owner: string) => Promise<T>) {
    const owner = user.value?.id
    const current = revision.value
    if (!owner) return
    try {
      const result = await operation(owner)
      if (current === revision.value && user.value?.id === owner) return result
    } catch (error) {
      if (current !== revision.value || user.value?.id !== owner) return
      const status = (error as { status?: number }).status
      if (status === 401 || status === 409) expire()
      throw error
    }
  }

  async function load<T>(part: keyof typeof requests.value, target: Ref<T>, status: typeof profileStatus, get: (owner: string) => Promise<T>, force: boolean) {
    if (!user.value || (!force && (status.value === 'loading' || status.value === 'ready'))) return
    const current = revision.value
    const ticket = ++requests.value[part]
    status.value = 'loading'
    try {
      const value = await withOwner(get)
      if (value !== undefined && revision.value === current && ticket === requests.value[part]) {
        target.value = value
        status.value = 'ready'
      }
    } catch {
      if (revision.value === current && ticket === requests.value[part]) status.value = 'error'
    }
  }

  function loadProfile(force = false) {
    return load('profile', profile, profileStatus, owner => $fetch<CustomerProfile>('/api/account/profile', { query: { owner } }), force)
  }
  function loadAddresses(force = false) {
    return load('addresses', addresses, addressStatus, owner => $fetch<CustomerAddress[]>('/api/account/addresses', { query: { owner } }), force)
  }
  async function saveProfile(fields: CustomerProfile) {
    const value = await withOwner(owner => $fetch<CustomerProfile>('/api/account/profile', { method: 'PATCH', body: { ...fields, owner } }))
    if (!value || !user.value) return false
    ++requests.value.profile
    profile.value = value
    profileStatus.value = 'ready'
    const session = { ...user.value, firstName: value.first_name }
    setUser(session)
    cachedSession.value = { user: session }
    return true
  }
  async function saveAddress(fields: AddressForm, id?: string, defaultChanged = true) {
    const body = defaultChanged ? fields : { ...fields, is_default: null }
    const value = await withOwner(owner => id
      ? $fetch<AddressSaveResult>(`/api/account/addresses/${id}`, { method: 'PATCH', body: { ...body, owner } })
      : $fetch<AddressSaveResult>('/api/account/addresses', { method: 'POST', body: { ...body, owner } }))
    if (value) await loadAddresses(true)
    return value
  }
  async function changeAddress(id: string, action: 'delete' | 'default') {
    const result = await withOwner(owner => action === 'delete'
      ? $fetch(`/api/account/addresses/${id}`, { method: 'DELETE', body: { owner } })
      : $fetch(`/api/account/addresses/${id}/default`, { method: 'POST', body: { owner } }))
    if (result) await loadAddresses(true)
    return !!result
  }

  async function logout() {
    if (signingOut.value || !user.value) return
    signingOut.value = true
    logoutError.value = false
    try {
      await withOwner(owner => $fetch('/api/auth/action', { method: 'POST', body: { action: 'logout', locale: locale.value, owner } }))
      expire()
      try { localStorage.setItem('testy-shop/auth-changed', String(Date.now())) } catch { /* Current tab is cleared. */ }
      await navigateTo(localePath({ name: options.logoutDestination ?? 'index' }), { replace: true })
    } catch {
      logoutError.value = !!user.value
    } finally { signingOut.value = false }
  }

  function signIn(name?: unknown, id?: unknown) {
    return localePath({ name: 'account', query: { intent: 'sign-in', ...customerReturnQuery(name, id) } })
  }

  return { ...state, loadProfile, loadAddresses, saveProfile, saveAddress, changeAddress, logout, signingOut, logoutError, signIn }
}

