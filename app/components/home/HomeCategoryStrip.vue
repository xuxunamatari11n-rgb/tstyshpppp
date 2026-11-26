<script setup lang="ts">
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import { featuredCategories } from '~/mocks/home'

const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
</script>

<template>
  <section class="home-section" aria-labelledby="home-categories-title">
    <UiSectionHeading id="home-categories-title" :title="t('home.categories.title')" />
    <ul class="home-category-list">
      <li v-for="category in featuredCategories" :key="category.id" class="min-w-0">
        <NuxtLink class="home-category-link" :to="catalogue({ categoryId: category.id })">
          <span class="home-category-photo">
            <img :src="category.image.src" :width="category.image.width" :height="category.image.height" :alt="t(category.image.altKey)" loading="lazy" decoding="async">
          </span>
          <span class="home-category-label">
            {{ t(`storefront.categories.${category.id}`) }}
            <Icon name="ion:chevron-forward-outline" size="16" aria-hidden="true" />
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

