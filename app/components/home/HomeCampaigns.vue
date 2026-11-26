<script setup lang="ts">
import { useCommercialReveal } from '~/composables/useCommercialReveal'
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import { homeCampaigns } from '~/mocks/home'

const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const root = useTemplateRef('root')
useCommercialReveal(root)
</script>

<template>
  <section ref="root" class="home-section home-campaigns" :aria-label="t('home.campaigns.title')">
    <article v-for="campaign in homeCampaigns" :key="campaign.id" class="home-campaign" :class="`home-campaign-${campaign.id}`">
      <div class="home-campaign-copy">
        <p class="home-kicker">{{ t(`home.campaigns.${campaign.id}.label`) }}</p>
        <h2>{{ t(`home.campaigns.${campaign.id}.title`) }}</h2>
        <p>{{ t(`home.campaigns.${campaign.id}.description`) }}</p>
        <NuxtLink class="home-view-all" :to="catalogue(campaign)">
          {{ t(`home.campaigns.${campaign.id}.cta`) }}
          <Icon name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="home-campaign-photo">
        <img data-commercial-photo :src="campaign.image.src" :width="campaign.image.width" :height="campaign.image.height" :alt="t(campaign.image.altKey)" loading="lazy" decoding="async">
      </div>
    </article>
  </section>
</template>

