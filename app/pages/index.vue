<script setup lang="ts">
import { homeCollections } from '~/mocks/home'

const { t } = useI18n()
const { favorites, added, message, favorite, add } = useProductInteractions()
useSeoMeta({
  title: () => t('home.pageTitle'),
  description: () => t('home.pageDescription'),
})
</script>

<template>
  <UiContainer class="home-page">
    <HomeHero />
    <HomeCategoryStrip />
    <HomeCollection :collection="homeCollections[0]" :favorites="favorites" :added="added" @favorite="favorite" @add="add" />
    <HomeCampaigns />
    <HomeCollection :collection="homeCollections[1]" :favorites="favorites" :added="added" @favorite="favorite" @add="add" />
    <HomeUniverses />
    <HomeCollection :collection="homeCollections[2]" :favorites="favorites" :added="added" @favorite="favorite" @add="add" />
    <HomeWhatsApp />
    <div role="status" aria-live="polite" class="home-feedback" :class="{ 'sr-only': !message }">{{ message }}</div>
  </UiContainer>
</template>

