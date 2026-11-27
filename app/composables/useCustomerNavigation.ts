const navigation = [
  [{ name: 'account', key: 'overview', icon: 'ion:grid-outline' }],
  [
    { name: 'favorites', key: 'favorites', icon: 'ion:heart-outline' },
    { name: 'account-orders', key: 'orders', icon: 'ion:bag-handle-outline' },
    { name: 'account-addresses', key: 'addresses', icon: 'ion:location-outline' },
  ],
  [
    { name: 'account-profile', key: 'profile', icon: 'ion:person-outline' },
    { name: 'account-security', key: 'security', icon: 'ion:lock-closed-outline' },
    { name: 'account-assistance', key: 'assistance', icon: 'ion:headset-outline' },
  ],
] as const

export function useCustomerNavigation() {
  const route = useRoute()
  const baseName = useRouteBaseName()
  const localePath = useLocalePath()
  const current = computed(() => baseName(route))
  const addressForm = computed(() => current.value === 'account-address-new' || current.value === 'account-address-edit')
  const currentGroup = computed(() => addressForm.value ? 'account-addresses' : current.value)
  const currentItem = computed(() => navigation.flat().find(link => link.name === currentGroup.value))
  function path(name: string) { return localePath({ name }) }
  return { navigation, current, currentGroup, currentItem, addressForm, path }
}

