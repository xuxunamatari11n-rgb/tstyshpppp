<script setup lang="ts">
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import { homeUniverses } from '~/mocks/home'

const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
</script>

<template>
  <section class="home-section" aria-labelledby="home-universes-title">
    <UiSectionHeading id="home-universes-title" :title="t('home.universes.title')" />
    <ul class="home-universe-grid">
      <li v-for="universe in homeUniverses" :key="universe.id">
        <NuxtLink class="home-universe" :to="catalogue(universe)">
          <img class="home-universe-image" :src="universe.image.src" :width="universe.image.width" :height="universe.image.height" alt="" loading="lazy" decoding="async">
          <span class="home-universe-caption">
            {{ t(`home.universes.${universe.id}`) }}
            <span class="home-universe-arrow"><Icon name="ion:arrow-forward-outline" size="20" aria-hidden="true" /></span>
          </span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

