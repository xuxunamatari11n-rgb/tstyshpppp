<script setup lang="ts">
import type { CommercialProduct } from '~/types/commerce'

const { t, locale } = useI18n()
const { user, profile, addresses, addressStatus, loadAddresses } = useCustomerAccount()
const { path } = useCustomerNavigation()
const favorites = useFavoritesStore()
const lookup = useShopSelection()
const welcome = useTemplateRef('welcome')
useCommercialReveal(welcome, true)
const products = shallowRef<CommercialProduct[]>([])
const favoriteStatus = ref<'loading' | 'ready' | 'error'>('loading')
const attempts = ref(0)
const firstName = computed(() => profile.value?.first_name || user.value?.firstName)
const shortcuts = computed(() => [
  { name: 'favorites', key: 'favorites', icon: 'ion:heart-outline',
    info: favoriteStatus.value === 'ready' ? t('commerce.favorites.count', favorites.ids.length) : t('customer.shortcuts.favorites') },
  { name: 'account-addresses', key: 'addresses', icon: 'ion:location-outline',
    label: t('customer.shortcuts.addressesLabel'),
    info: addressStatus.value === 'ready' ? t('customer.addresses.count', addresses.value.length) : t('customer.shortcuts.addresses') },
  { name: 'account-orders', key: 'orders', icon: 'ion:bag-handle-outline', info: t('customer.shortcuts.orders') },
])

onMounted(() => { void loadAddresses(true) })
watch([() => user.value?.id, () => favorites.owner, () => favorites.sync, () => favorites.ids, locale, attempts],
  async (_, __, onCleanup) => {
    if (!import.meta.client) return
    const owner = user.value?.id
    if (!owner || favorites.owner !== owner || favorites.sync === 'loading') {
      products.value = []
      favoriteStatus.value = 'loading'
      return
    }
    const request = new AbortController()
    onCleanup(() => request.abort())
    favoriteStatus.value = 'loading'
    try {
      const rows = await $fetch<{ product_id: string }[]>('/api/account/favorites', { query: { owner }, signal: request.signal })
      const ids = rows.map(row => row.product_id)
      const result: CommercialProduct[] = []
      for (let index = 0; index < ids.length && result.length < 3; index += 12) {
        const batch = ids.slice(index, index + 12)
        const catalogue = new Map((await lookup(batch, request.signal)).map(product => [product.id, product]))
        for (const id of batch) {
          const item = catalogue.get(id)
          if (item) result.push(item)
          if (result.length === 3) break
        }
      }
      if (!request.signal.aborted && user.value?.id === owner) {
        products.value = result
        favoriteStatus.value = 'ready'
      }
    } catch {
      if (!request.signal.aborted) favoriteStatus.value = 'error'
    }
  }, { immediate: true })
</script>

<template>
  <div class="customer-overview">
    <section ref="welcome" class="customer-welcome" aria-labelledby="customer-welcome-title">
      <div class="customer-welcome-orbit" aria-hidden="true"><span data-commercial-orbit /></div>
      <div class="customer-welcome-content">
        <h2 id="customer-welcome-title" data-commercial-reveal>{{ firstName ? t('customer.welcome.named', { name: firstName }) : t('customer.welcome.generic') }}</h2>
        <p data-commercial-reveal>{{ t('customer.welcome.description') }}</p>
        <NuxtLink :to="path('catalogue')" class="ui-button" data-variant="primary" data-commercial-reveal>
          {{ t('commerce.cart.continue') }} <Icon name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>
    <nav :aria-label="t('customer.shortcuts.title')">
      <ul class="customer-shortcuts">
        <li v-for="service in shortcuts" :key="service.name">
          <NuxtLink :to="path(service.name)" class="customer-shortcut">
            <span class="customer-shortcut-icon"><Icon :name="service.icon" class="customer-shortcut-symbol" aria-hidden="true" /></span>
            <span><strong>{{ service.label ?? t(`customer.nav.${service.key}`) }}</strong><small>{{ service.info }}</small></span>
            <Icon class="customer-shortcut-chevron" name="ion:chevron-forward-outline" aria-hidden="true" />
            <Icon class="customer-shortcut-arrow" name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <section class="customer-recent" aria-labelledby="customer-recent-title">
      <div class="customer-section-head">
        <h2 id="customer-recent-title">{{ t('customer.recent.title') }}</h2>
        <NuxtLink :to="path('favorites')" class="commerce-text-link">{{ t('customer.recent.all') }}</NuxtLink>
      </div>
      <UiSkeleton v-if="favoriteStatus === 'loading'" class="min-h-32 w-full" />
      <p v-else-if="favoriteStatus === 'error'" class="customer-feedback" role="alert">
        {{ t('commerce.favorites.loadError') }}
        <button type="button" class="commerce-text-link" @click="attempts++">{{ t('catalogue.retry') }}</button>
      </p>
      <div v-else-if="products.length" class="customer-product-grid">
        <HomeProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <CommerceEmpty v-else kind="favorites" />
    </section>
    <section class="customer-mobile-services" aria-labelledby="customer-services-title">
      <h2 id="customer-services-title">{{ t('customer.shortcuts.title') }}</h2>
      <CustomerNavigation mobile />
    </section>
  </div>
</template>

