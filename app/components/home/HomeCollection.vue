<script setup lang="ts">
import { useCommercialReveal } from '~/composables/useCommercialReveal'
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import type { CommercialProduct, ProductCollection } from '~/types/commerce'
import { getCollectionProducts } from '~/mocks/home'

const props = defineProps<{
  collection: ProductCollection
  favorites: ReadonlySet<string>
  added: string
}>()
const emit = defineEmits<{ favorite: [product: CommercialProduct]; add: [product: CommercialProduct] }>()
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const id = useId()
const grid = useTemplateRef('grid')
const products = computed(() => getCollectionProducts(props.collection))
useCommercialReveal(grid)
</script>

<template>
  <section class="home-section" :aria-labelledby="id">
    <div class="home-section-header">
      <UiSectionHeading :id="id" :title="t(`home.collections.${collection.id}.title`)" />
      <NuxtLink class="home-view-all" :to="catalogue({ selection: collection.id })" :aria-label="t('home.viewCollection', { collection: t(`home.collections.${collection.id}.title`) })">
        {{ t('home.viewAll') }} <Icon name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
      </NuxtLink>
    </div>
    <ul ref="grid" class="home-product-grid">
      <li v-for="product in products" :key="product.id" data-commercial-reveal class="min-w-0">
        <HomeProductCard
          :product="product"
          :favorite="favorites.has(product.id)"
          :added="added === product.id"
          @favorite="emit('favorite', $event)"
          @add="emit('add', $event)"
        />
      </li>
    </ul>
  </section>
</template>

