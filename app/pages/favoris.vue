<script setup lang="ts">
import type { CommercialProduct } from '~/types/commerce'

definePageMeta({ name: 'favorites', i18n: { paths: { fr: '/favoris', es: '/favoritos' } } })
const { t, locale } = useI18n()
const favorites = useFavoritesStore()
const { toggleFavorite } = useProductFavorites()
const localePath = useLocalePath()
const lookup = useShopSelection()
const products = shallowRef<Record<string, CommercialProduct>>({})
const loading = ref(false)
const failed = ref(false)
let controller: AbortController | undefined

const visible = computed(() => favorites.ids.flatMap(id => {
  const product = Object.hasOwn(products.value, id) ? products.value[id] : undefined
  return product ? [product] : []
}))
const missing = computed(() => favorites.ids.filter(id => !Object.hasOwn(products.value, id)))
const accountLink = computed(() => localePath({ name: 'account', query: { intent: 'sign-in' } }))
useSeoMeta({ title: () => t('commerce.favorites.title'), robots: 'noindex, follow' })

async function refresh() {
  if (!favorites.ready) return
  controller?.abort()
  const request = new AbortController()
  controller = request
  loading.value = true
  failed.value = false
  try {
    const items = await lookup(favorites.ids, request.signal)
    if (!request.signal.aborted) products.value = Object.fromEntries(items.map(product => [product.id, product]))
  } catch {
    if (!request.signal.aborted) failed.value = true
  } finally {
    if (!request.signal.aborted) loading.value = false
  }
}

watch([() => favorites.ids, () => favorites.ready, locale], refresh, { immediate: true })
onMounted(() => window.addEventListener('focus', refresh))
onBeforeUnmount(() => { controller?.abort(); window.removeEventListener('focus', refresh) })
</script>

<template>
  <UiContainer class="commerce-page commerce-favorites">
    <nav class="product-breadcrumb" :aria-label="t('catalogue.breadcrumb')">
      <ol>
        <li><NuxtLink :to="localePath({ name: 'catalogue' })">{{ t('catalogue.shop') }}</NuxtLink></li>
        <li aria-current="page"><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />{{ t('commerce.favorites.title') }}</li>
      </ol>
    </nav>
    <header class="commerce-page-head">
      <div>
        <h1 class="commerce-page-title">{{ t('commerce.favorites.title') }}</h1>
        <p v-if="favorites.ready">{{ t('commerce.favorites.count', favorites.ids.length) }}</p>
      </div>
    </header>
    <div v-if="favorites.ready && !favorites.owner" class="commerce-favorites-invitation">
      <Icon name="ion:heart-outline" size="22" aria-hidden="true" />
      <p>{{ t('commerce.favorites.invitation') }}</p>
      <NuxtLink :to="accountLink" class="commerce-text-link">{{ t('auth.login') }}</NuxtLink>
    </div>
    <p v-if="favorites.sync === 'error'" role="alert" class="commerce-inline-note">
      {{ t('commerce.favorites.syncError') }}
      <button class="commerce-text-link" type="button" @click="favorites.synchronize(lookup)">{{ t('catalogue.retry') }}</button>
    </p>
    <p v-if="failed" role="alert" class="commerce-inline-note">
      {{ t('commerce.favorites.loadError') }}
      <button class="commerce-text-link" type="button" @click="refresh">{{ t('catalogue.retry') }}</button>
    </p>
    <p v-if="!favorites.ready || loading || favorites.sync === 'loading'" class="commerce-inline-note" role="status">
      {{ t('commerce.favorites.loading') }}
    </p>
    <CommerceEmpty v-if="favorites.ready && !loading && !failed && favorites.sync === 'idle' && !favorites.ids.length" kind="favorites" />
    <div v-if="visible.length" class="commerce-favorites-grid">
      <HomeProductCard v-for="product in visible" :key="product.id" :product="product" />
    </div>
    <ul v-if="!loading && !failed && missing.length" class="commerce-favorites-missing">
      <li v-for="id in missing" :key="id">
        <p>{{ t('commerce.validation.missing') }}</p>
        <button class="commerce-text-link" type="button" @click="toggleFavorite(id, $event)">{{ t('commerce.favorites.remove') }}</button>
      </li>
    </ul>
  </UiContainer>
</template>

