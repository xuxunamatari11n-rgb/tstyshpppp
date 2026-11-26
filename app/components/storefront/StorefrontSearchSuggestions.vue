<script setup lang="ts">
const props = defineProps<{
  query: string
  recents: string[]
}>()
const emit = defineEmits<{ choose: [term: string]; navigate: [] }>()
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const localePath = useLocalePath()
const matches = useStorefrontSearchResults(toRef(props, 'query'))
</script>

<template>
  <div class="grid gap-5">
    <template v-if="!query.trim()">
      <div>
        <h3 class="mb-2 text-sm font-semibold">{{ t('storefront.search.recent') }}</h3>
        <ul v-if="recents.length" class="flex flex-wrap gap-2">
          <li v-for="term in recents" :key="term">
            <UiButton variant="outline" data-search-option @click="emit('choose', term)">
              <Icon name="ion:time-outline" size="17" aria-hidden="true" />
              {{ term }}
            </UiButton>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-ink">{{ t('storefront.search.noRecent') }}</p>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-semibold">{{ t('storefront.search.suggested') }}</h3>
        <ul class="flex flex-wrap gap-2">
          <li v-for="term in matches.suggested" :key="term">
            <UiButton variant="outline" data-search-option @click="emit('choose', term)">{{ term }}</UiButton>
          </li>
        </ul>
      </div>
      <UiDivider />
    </template>

    <div v-if="matches.categories.length || matches.products.length" class="grid gap-4 sm:grid-cols-2">
      <div v-if="matches.categories.length">
        <h3 class="mb-1 text-sm font-semibold">{{ t('storefront.search.categories') }}</h3>
        <ul>
          <li v-for="category in matches.categories" :key="category.id">
            <NuxtLink
              :to="catalogue({ categoryId: category.id })"
              class="storefront-suggestion"
              data-search-option
              @click="emit('navigate')"
            >
              <Icon name="ion:grid-outline" size="18" aria-hidden="true" /> {{ category.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div v-if="matches.products.length">
        <h3 class="mb-1 text-sm font-semibold">{{ t('storefront.search.products') }}</h3>
        <ul>
          <li v-for="product in matches.products" :key="product.id">
            <NuxtLink :to="localePath({ name: 'product', params: { slug: product.slug } })" class="storefront-suggestion"
              data-search-option @click="emit('navigate')">
              <Icon name="ion:cube-outline" size="18" aria-hidden="true" /> {{ product.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    <UiEmptyState v-else :title="t('storefront.search.noSuggestions')" :description="t('storefront.search.retry')" icon="ion:search-outline" />
  </div>
</template>

