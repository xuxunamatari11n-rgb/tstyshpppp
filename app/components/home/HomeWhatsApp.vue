<script setup lang="ts">
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const whatsappUrl = useWhatsAppContact()
const steps = [
  { id: 'discover', icon: 'ion:compass-outline' },
  { id: 'select', icon: 'ion:bag-handle-outline' },
  { id: 'send', icon: 'ion:logo-whatsapp' },
] as const
</script>

<template>
  <section class="home-section home-whatsapp" aria-labelledby="home-whatsapp-title">
    <div>
      <p class="home-kicker text-brand">{{ t('home.whatsapp.label') }}</p>
      <h2 id="home-whatsapp-title">{{ t('home.whatsapp.title') }}</h2>
      <p class="home-whatsapp-intro">{{ t('home.whatsapp.description') }}</p>
      <NuxtLink v-if="whatsappUrl" class="ui-button" data-variant="primary" :to="whatsappUrl" external>
        <Icon name="ion:logo-whatsapp" size="22" aria-hidden="true" />
        {{ t('storefront.footer.contactWhatsApp') }}
      </NuxtLink>
      <template v-else>
        <NuxtLink class="ui-button" data-variant="primary" :to="catalogue()">
          {{ t('home.hero.cta') }} <Icon name="ion:arrow-forward-outline" size="20" aria-hidden="true" />
        </NuxtLink>
        <p class="mt-3 text-sm text-line">{{ t('storefront.footer.whatsappPending') }}</p>
      </template>
    </div>
    <ol class="home-whatsapp-steps">
      <li v-for="(step, index) in steps" :key="step.id">
        <span class="home-step-icon"><Icon :name="step.icon" size="22" aria-hidden="true" /></span>
        <div>
          <h3>{{ index + 1 }}. {{ t(`home.whatsapp.steps.${step.id}.title`) }}</h3>
          <p>{{ t(`home.whatsapp.steps.${step.id}.description`) }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

