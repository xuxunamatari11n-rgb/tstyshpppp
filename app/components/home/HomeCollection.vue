<script setup lang="ts">
import { useCommercialReveal } from '~/composables/useCommercialReveal'
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import type { CommercialProduct, ProductCollection } from '~/types/commerce'
import { getCollectionProducts } from '~/mocks/home'

const props = defineProps<{
  collection?: ProductCollection
  products?: readonly CommercialProduct[]
  title?: string
}>()
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const id = useId()
const grid = useTemplateRef('grid')
const products = computed(() => props.products ?? (props.collection ? getCollectionProducts(props.collection) : []))
const heading = computed(() => props.title ?? (props.collection ? t(`home.collections.${props.collection.id}.title`) : ''))
useCommercialReveal(grid)
</script>

<template>
  <section class="home-section" :aria-labelledby="id">
    <div class="home-section-header">
      <UiSectionHeading :id="id" :title="heading" />
      <NuxtLink v-if="collection" class="home-view-all" :to="catalogue({ selection: collection.id })"
        :aria-label="t('home.viewCollection', { collection: heading })">
        {{ t('home.viewAll') }} <Icon name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
      </NuxtLink>
    </div>
    <ul ref="grid" class="home-product-grid">
      <li v-for="product in products" :key="product.id" data-commercial-reveal class="min-w-0">
        <HomeProductCard :product="product" />
      </li>
    </ul>
  </section>
</template>
