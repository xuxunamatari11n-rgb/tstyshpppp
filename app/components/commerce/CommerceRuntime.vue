<script setup lang="ts">
const cart = useCartStore()
const favorites = useFavoritesStore()
const lookup = useShopSelection()
const customer = useCustomerSession()
const { identity, invalidate } = useShopIdentityControl()
const readSession = import.meta.client ? useShopSessionRequest() : undefined

function synchronize() {
  if (customer.user.value && customer.user.value.id !== identity.value?.id && identity.value !== undefined) {
    customer.setUser(null)
    clearNuxtData('shop-session')
  }
  if (!favorites.ready) return
  favorites.switchOwner(identity.value?.id ?? null)
  if (favorites.owner) void favorites.synchronize(lookup)
}

function verifySession() {
  if (document.visibilityState === 'visible') void readSession?.().catch(() => undefined)
}

function onStorage(event: StorageEvent) {
  if (event.key !== 'testy-shop/auth-changed') return
  invalidate(undefined)
  if (customer.user.value) {
    customer.setUser(null)
    clearNuxtData('shop-session')
  }
  void readSession?.().catch(() => undefined)
}

watch(() => identity.value === undefined ? undefined : identity.value?.id ?? null, synchronize, { flush: 'sync' })
onMounted(() => {
  cart.mount()
  favorites.mount()
  synchronize()
  verifySession()
  window.addEventListener('focus', verifySession)
  window.addEventListener('storage', onStorage)
})
onBeforeUnmount(() => {
  window.removeEventListener('focus', verifySession)
  window.removeEventListener('storage', onStorage)
})
</script>

<template>
  <CommerceNotice />
  <CommerceCartDrawer />
  <CommerceOrderDialog />
</template>

