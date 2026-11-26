<script setup lang="ts">
import { useWhatsAppContact } from '~/composables/useWhatsAppContact'
const { t } = useI18n()
const whatsappUrl = useWhatsAppContact()
const steps = ['discover', 'select', 'send'] as const
</script>

<template>
  <section class="home-section home-whatsapp" aria-labelledby="home-whatsapp-title">
    <div>
      <div class="home-whatsapp-graphic" aria-hidden="true">
        <span><Icon name="ion:bag-handle-outline" size="28" /></span>
        <Icon name="ion:arrow-forward-outline" size="22" />
        <span class="home-whatsapp-bubble"><Icon name="ion:logo-whatsapp" size="33" /></span>
      </div>
      <p class="home-kicker text-brand">{{ t('home.whatsapp.label') }}</p>
      <h2 id="home-whatsapp-title">{{ t('home.whatsapp.title') }}</h2>
      <p class="home-whatsapp-intro">{{ t('home.whatsapp.description') }}</p>
      <NuxtLink v-if="whatsappUrl" class="ui-button" data-variant="primary" :to="whatsappUrl" external>
        <Icon name="ion:logo-whatsapp" size="22" aria-hidden="true" />
        {{ t('storefront.footer.contactWhatsApp') }}
      </NuxtLink>
      <template v-else>
        <NuxtLink class="ui-button" data-variant="primary" to="#storefront-assistance">
          {{ t('storefront.footer.help') }} <Icon name="ion:arrow-forward-outline" size="20" aria-hidden="true" />
        </NuxtLink>
        <p class="mt-3 text-sm text-line">{{ t('storefront.footer.whatsappPending') }}</p>
      </template>
    </div>
    <ol class="home-whatsapp-steps">
      <li v-for="(step, index) in steps" :key="step">
        <span class="home-step-number" aria-hidden="true">{{ index + 1 }}</span>
        <div>
          <h3>{{ t(`home.whatsapp.steps.${step}.title`) }}</h3>
          <p>{{ t(`home.whatsapp.steps.${step}.description`) }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

