<script setup lang="ts">
const { t } = useI18n()
const promotions = useCatalogueData({ selection: 'promotions', limit: 4 })
const arrivals = useCatalogueData({ selection: 'new', limit: 4 })
const bestsellers = useCatalogueData({ selection: 'bestsellers', limit: 4 })
const sections = [promotions, arrivals, bestsellers]
await Promise.all(sections)
const failed = computed(() => sections.some(section => section.error.value))
const pending = computed(() => sections.some(section => section.pending.value))
const empty = computed(() => !pending.value && !failed.value && sections.every(section => !section.data.value?.products.length))
useSeoMeta({ title: () => t('home.pageTitle'), description: () => t('home.pageDescription') })

function retryProducts() {
  return Promise.all(sections.map(section => section.refresh()))
}
</script>

<template>
  <UiContainer class="home-page">
    <HomeHero />
    <HomeCategoryStrip />
    <UiEmptyState v-if="failed" class="home-section" :title="t('catalogue.error')" :description="t('catalogue.errorHint')">
      <template #action><UiButton variant="outline" @click="retryProducts">{{ t('catalogue.retry') }}</UiButton></template>
    </UiEmptyState>
    <UiSkeleton v-else-if="pending" class="home-section" />
    <UiEmptyState v-else-if="empty" class="home-section" :title="t('catalogue.empty')" />
    <HomeCollection v-if="promotions.data.value?.products.length" selection="promotions"
      :title="t('home.collections.promotions.title')" :products="promotions.data.value.products" />
    <HomeCampaigns />
    <HomeCollection v-if="arrivals.data.value?.products.length" selection="new"
      :title="t('home.collections.new.title')" :products="arrivals.data.value.products" />
    <HomeUniverses />
    <HomeCollection v-if="bestsellers.data.value?.products.length" selection="bestsellers"
      :title="t('home.collections.bestsellers.title')" :products="bestsellers.data.value.products" />
    <HomeWhatsApp />
  </UiContainer>
</template>
