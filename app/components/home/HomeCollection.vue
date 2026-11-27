<script setup lang="ts">
import type { CollectionId, CommercialProduct } from '~/types/commerce'

defineProps<{ selection?: CollectionId; products: readonly CommercialProduct[]; title: string }>()
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const id = useId()
const grid = useTemplateRef('grid')
useCommercialReveal(grid)
</script>

<template>
  <section class="home-section" :aria-labelledby="id">
    <div class="home-section-header">
      <UiSectionHeading :id="id" :title="title" />
      <NuxtLink v-if="selection" class="home-view-all" :to="catalogue({ selection })"
        :aria-label="t('home.viewCollection', { collection: title })">
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
