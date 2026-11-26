<script setup lang="ts">
import { homeCollections } from '~/mocks/home'

const { t } = useI18n()
useSeoMeta({
  title: () => t('home.pageTitle'),
  description: () => t('home.pageDescription'),
})
</script>

<template>
  <UiContainer class="home-page">
    <HomeHero />
    <HomeCategoryStrip />
    <HomeCollection :collection="homeCollections[0]" />
    <HomeCampaigns />
    <HomeCollection :collection="homeCollections[1]" />
    <HomeUniverses />
    <HomeCollection :collection="homeCollections[2]" />
    <HomeWhatsApp />
  </UiContainer>
</template>