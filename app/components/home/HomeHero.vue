<script setup lang="ts">
import { useCommercialReveal } from '~/composables/useCommercialReveal'
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import { heroImages } from '~/mocks/home'

const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const root = useTemplateRef('root')
useCommercialReveal(root, true)

const layers = [
  { kind: 'headphones', image: heroImages.headphones },
  { kind: 'bag', image: heroImages.bag },
  { kind: 'sneaker', image: heroImages.sneaker },
] as const
const secondary = [
  { id: 'tech', categoryId: 'electronics', image: heroImages.headphones },
  { id: 'style', categoryId: 'fashion', image: heroImages.bag },
] as const
</script>

<template>
  <section ref="root" class="home-hero" aria-labelledby="home-hero-title">
    <div class="home-hero-main">
      <div class="home-hero-copy">
        <p data-commercial-reveal class="home-kicker">{{ t('home.hero.label') }}</p>
        <h1 id="home-hero-title" data-commercial-reveal>{{ t('home.hero.title') }}</h1>
        <p data-commercial-reveal class="home-hero-description">{{ t('home.hero.description') }}</p>
        <NuxtLink class="ui-button" data-variant="secondary" :to="catalogue()">
          {{ t('home.hero.cta') }}
          <Icon name="ion:arrow-forward-outline" size="20" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="home-hero-art">
        <span v-for="{ kind, image } in layers" :key="kind" class="home-hero-layer" :class="`home-hero-layer-${kind}`">
          <img
            data-commercial-photo
            :src="image.src"
            :width="image.width"
            :height="image.height"
            :alt="t(image.altKey)"
            :fetchpriority="kind === 'sneaker' ? 'high' : 'auto'"
            decoding="async"
          >
        </span>
      </div>
    </div>
    <div class="home-hero-side">
      <NuxtLink v-for="campaign in secondary" :key="campaign.id" :to="catalogue(campaign)" class="home-hero-tile" :class="`home-hero-tile-${campaign.id}`">
        <div class="home-hero-tile-copy">
          <p data-commercial-reveal class="home-kicker">{{ t(`home.hero.${campaign.id}.label`) }}</p>
          <h2 data-commercial-reveal>{{ t(`home.hero.${campaign.id}.title`) }}</h2>
          <span class="home-arrow" aria-hidden="true"><Icon name="ion:arrow-forward-outline" size="20" /></span>
        </div>
        <span class="home-hero-tile-image">
          <img data-commercial-photo :src="campaign.image.src" :width="campaign.image.width" :height="campaign.image.height" :alt="t(campaign.image.altKey)" decoding="async">
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

