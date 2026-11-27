import type { CustomerAddress, CustomerProfile } from '~/types/customer'
import type { ShopSession } from '~/types/shop'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export function useCustomerSession() {
  const user = useState<ShopSession | null>('customer-session', () => null)
  const profile = useState<CustomerProfile | null>('customer-profile', () => null)
  const addresses = useState<CustomerAddress[]>('customer-addresses', () => [])
  const profileStatus = useState<LoadState>('customer-profile-status', () => 'idle')
  const addressStatus = useState<LoadState>('customer-address-status', () => 'idle')
  const revision = useState('customer-revision', () => 0)

  function setUser(next: ShopSession | null) {
    if (next?.id !== user.value?.id) {
      ++revision.value
      profile.value = null
      addresses.value = []
      profileStatus.value = 'idle'
      addressStatus.value = 'idle'
    }
    user.value = next
  }

  return { user, profile, addresses, profileStatus, addressStatus, revision, setUser }
}

