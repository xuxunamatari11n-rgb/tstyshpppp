<script setup lang="ts">
import '~/assets/css/auth.css'

const { t } = useI18n()
const localePath = useLocalePath()
const destination = useStorefrontDestination()
const home = computed(() => localePath({ name: 'index' }))
const privacy = computed(() => destination('privacy'))
const legal = computed(() => destination('legal'))
</script>

<template>
  <div class="auth-layout">
    <header class="auth-header">
      <NuxtLink :to="home" class="auth-back" :aria-label="t('auth.access.backToStore')">
        <Icon name="ion:arrow-back-outline" size="21" aria-hidden="true" />
        <span class="auth-back-label">{{ t('auth.access.backToStore') }}</span>
      </NuxtLink>
      <SharedBrandWordmark class="auth-wordmark" />
      <SharedLanguageSwitcher compact class="auth-language" />
    </header>
    <AuthCampaign />
    <main id="auth-content" class="auth-main">
      <slot />
    </main>
    <footer class="auth-footer">
      <small>{{ t('storefront.footer.copyright') }}</small>
      <NuxtLink v-if="privacy" :to="privacy">{{ t('storefront.footer.privacy') }}</NuxtLink>
      <NuxtLink v-if="legal" :to="legal">{{ t('storefront.footer.legal') }}</NuxtLink>
    </footer>
  </div>
</template>

