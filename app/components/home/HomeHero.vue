<script setup lang="ts">
import { useCommercialReveal } from '~/composables/useCommercialReveal'
import { useHomeCatalogueLink } from '~/composables/useHomeCatalogueLink'
import { heroImages } from '~/mocks/home'

const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const root = useTemplateRef('root')
const art = useTemplateRef('art')
const { $gsap } = useNuxtApp()
useCommercialReveal(root, true)

let depth: ReturnType<typeof $gsap.matchMedia> | undefined
onMounted(() => {
  depth = $gsap.matchMedia()
  depth.add('(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const element = art.value
    const surface = element?.parentElement
    if (!element || !surface) return
    const layers = Array.from(element.querySelectorAll<HTMLElement>('.home-hero-layer'))
    const movers = layers.map((layer, index) => ({
      x: $gsap.quickTo(layer, 'x', { duration: 0.42, ease: 'power3.out' }),
      y: $gsap.quickTo(layer, 'y', { duration: 0.42, ease: 'power3.out' }),
      depth: 3 + index * 2.5,
    }))
    const position = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const bounds = surface.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width - 0.5
      const y = (event.clientY - bounds.top) / bounds.height - 0.5
      movers.forEach(mover => { mover.x(x * mover.depth * 2); mover.y(y * mover.depth * 2) })
    }
    function center() {
      movers.forEach(mover => { mover.x(0); mover.y(0) })
    }
    surface.addEventListener('pointermove', position)
    surface.addEventListener('pointerleave', center)
    return () => {
      surface.removeEventListener('pointermove', position)
      surface.removeEventListener('pointerleave', center)
      for (const mover of movers) {
        mover.x.tween.kill()
        mover.y.tween.kill()
      }
      $gsap.set(layers, { clearProps: 'transform' })
    }
  })
})
onBeforeUnmount(() => depth?.revert())

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
      <div ref="art" class="home-hero-art">
        <span class="home-hero-orbit" data-commercial-orbit aria-hidden="true" />
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

