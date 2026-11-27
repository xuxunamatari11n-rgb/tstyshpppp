<script setup lang="ts">
const { t } = useI18n()
const campaign = useTemplateRef('campaign')
useCommercialReveal(campaign, true)
</script>

<template>
  <aside ref="campaign" class="auth-campaign" aria-label="Testy Shop">
    <div class="auth-campaign-copy">
      <p class="auth-campaign-title" data-commercial-reveal>
        <span class="auth-campaign-desktop">{{ t('auth.access.campaignTitle') }}</span>
        <span class="auth-campaign-mobile">{{ t('auth.access.campaignShort') }}</span>
      </p>
      <p class="auth-campaign-support" data-commercial-reveal>{{ t('auth.access.campaignSupport') }}</p>
    </div>
    <div class="auth-campaign-art" aria-hidden="true">
      <div class="auth-campaign-rings"><span data-commercial-orbit /></div>
      <div class="auth-photo auth-photo-bag">
        <img src="/images/home/crossbody.webp" width="608" height="608" alt="" data-commercial-photo>
      </div>
      <div class="auth-photo auth-photo-headphones">
        <img src="/images/home/headphones.webp" width="608" height="608" alt="" data-commercial-photo>
      </div>
      <div class="auth-photo auth-photo-sneaker">
        <img src="/images/home/sneaker.webp" width="608" height="608" alt="" fetchpriority="high" data-commercial-photo>
      </div>
    </div>
  </aside>
</template>

