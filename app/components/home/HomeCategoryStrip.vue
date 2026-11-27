<script setup lang="ts">
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const { categories } = useShopMeta()
const featured = computed(() => categories.value.filter(category => category.featured).slice(0, 6))
</script>

<template>
  <section v-if="featured.length" class="home-section" aria-labelledby="home-categories-title">
    <UiSectionHeading id="home-categories-title" :title="t('home.categories.title')" />
    <ul class="home-category-list">
      <li v-for="category in featured" :key="category.id" class="min-w-0">
        <NuxtLink class="home-category-link" :to="catalogue({ categoryId: category.id })">
          <span class="home-category-photo">
            <ProductPhoto :image="category.image && { ...category.image, altKey: '', width: 512, height: 512 }" />
          </span>
          <span class="home-category-label">
            {{ category.name }}
            <Icon name="ion:chevron-forward-outline" size="16" aria-hidden="true" />
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
