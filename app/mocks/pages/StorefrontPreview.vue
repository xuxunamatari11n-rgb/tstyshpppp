<script setup lang="ts">
import { useProductInteractions } from '~/composables/useProductInteractions'
import { storefrontCategories, storefrontSelections } from '~/mocks/storefront'
import { getCollectionProducts, homeCollections, homeProducts } from '~/mocks/home'

const { t } = useI18n()
const route = useRoute()
const routeBaseName = useRouteBaseName()
const localePath = useLocalePath()
const page = computed(() => {
  const name = routeBaseName(route)
  return typeof name === 'string' ? name : 'index'
})
const query = computed(() => typeof route.query.q === 'string' ? route.query.q : '')
const search = useStorefrontSearchResults(query)
const category = computed(() => storefrontCategories.find(entry => entry.slug === route.query.category))
const selection = computed(() => storefrontSelections.find(id => id === route.query.selection))
const subcategory = computed(() => category.value?.subcategories.find(id => id === route.query.subcategory))
const { favorites, added, message, favorite, add } = useProductInteractions()
const products = computed(() => {
  const collection = homeCollections.find(entry => entry.id === selection.value)
  const entries = collection ? getCollectionProducts(collection) : homeProducts
  return entries.filter(product =>
    (!category.value || product.categoryId === category.value.id)
    && (!subcategory.value || product.subcategoryId === subcategory.value),
  )
})

const title = computed(() => {
  if (page.value === 'index') return t('storefront.preview.title')
  if (page.value === 'search') return t('storefront.search.results')
  if (page.value === 'catalogue') {
    if (subcategory.value) return t(`storefront.subcategories.${subcategory.value}`)
    if (category.value) return t(`storefront.categories.${category.value.id}`)
    if (selection.value) return t(`storefront.nav.${selection.value}`)
    return t('storefront.nav.explore')
  }
  return t(`storefront.nav.${page.value}`)
})

useSeoMeta({ title, robots: 'noindex, nofollow' })
</script>

<template>
  <UiContainer class="py-5 lg:py-7">
    <section class="min-h-[max(33rem,72svh)] rounded-standard border border-line bg-subtle p-5 sm:p-8 lg:p-10" aria-labelledby="preview-title">
      <h1 id="preview-title" class="text-section font-semibold">{{ title }}</h1>
      <template v-if="page === 'search'">
        <p v-if="query" class="mt-2 max-w-prose break-words text-muted-ink">{{ t('storefront.search.query', { query }) }}</p>
        <p v-else class="mt-2 max-w-prose text-muted-ink">{{ t('storefront.search.prompt') }}</p>
        <div v-if="query.trim()" class="mt-5 max-w-2xl rounded-standard border border-line bg-surface p-4 sm:p-5">
          <ul v-if="search.categories.length || search.products.length" class="divide-y divide-line">
            <li v-for="entry in search.categories" :key="entry.id">
              <NuxtLink :to="localePath({ name: 'catalogue', query: { category: entry.slug } })" class="storefront-suggestion">
                <Icon name="ion:grid-outline" size="18" aria-hidden="true" /> {{ entry.label }}
              </NuxtLink>
            </li>
            <li v-for="product in search.products" :key="product.id" class="flex min-h-11 items-center gap-2 px-2">
              <Icon name="ion:cube-outline" size="18" aria-hidden="true" /> {{ product.label }}
            </li>
          </ul>
          <UiEmptyState v-else :title="t('storefront.search.noSuggestions')" :description="t('storefront.search.retry')" icon="ion:search-outline" />
        </div>
      </template>
      <template v-else-if="page === 'catalogue'">
        <p class="mt-2 max-w-prose text-muted-ink">{{ t('home.discovery.intro') }}</p>
        <nav :aria-label="t('home.discovery.filter')" class="my-5 flex flex-wrap gap-2">
          <NuxtLink v-if="category || selection" :to="localePath({ name: 'catalogue' })" class="ui-button" data-variant="outline">
            {{ t('storefront.nav.allCategories') }}
          </NuxtLink>
          <template v-else>
            <NuxtLink v-for="entry in storefrontCategories" :key="entry.id" :to="localePath({ name: 'catalogue', query: { category: entry.slug } })" class="ui-button" data-variant="outline">
              {{ t(`storefront.categories.${entry.id}`) }}
            </NuxtLink>
          </template>
        </nav>
        <ul v-if="products.length" class="home-product-grid">
          <li v-for="product in products" :key="product.id" class="min-w-0">
            <HomeProductCard :product="product" :favorite="favorites.has(product.id)" :added="added === product.id" @favorite="favorite" @add="add" />
          </li>
        </ul>
        <UiEmptyState v-else :title="t('home.discovery.empty')" />
        <div role="status" aria-live="polite" class="home-feedback" :class="{ 'sr-only': !message }">{{ message }}</div>
      </template>
      <p v-else class="mt-2 max-w-prose text-muted-ink">
        {{ t(page === 'index' ? 'storefront.preview.description' : 'storefront.preview.pending') }}
      </p>
    </section>
  </UiContainer>
</template>


