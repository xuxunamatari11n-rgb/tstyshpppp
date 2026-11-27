<script setup lang="ts">
import '~/assets/css/regie-auth.css'
const { t } = useI18n()
const path = useLocalePath()
</script>

<template>
  <div class="regie-auth">
    <aside class="regie-auth-brand">
      <div class="regie-auth-wordmark">
        <SharedBrandWordmark inverse />
        <span>{{ t('regieAuth.workspace') }}</span>
      </div>
      <div class="regie-auth-brand-message">
        <p>{{ t('regieAuth.headline') }}</p>
        <p>{{ t('regieAuth.tagline') }}</p>
      </div>
      <div class="regie-auth-shape" aria-hidden="true"><span /><span /><span /></div>
    </aside>
    <div class="regie-auth-workspace">
      <header class="regie-auth-nav">
        <NuxtLink :to="path('index')" class="regie-auth-link">
          <Icon name="ion:arrow-back-outline" size="18" aria-hidden="true" />
          {{ t('regieAuth.store') }}
        </NuxtLink>
        <SharedLanguageSwitcher compact />
      </header>
      <main class="regie-auth-content"><slot /></main>
    </div>
  </div>
</template>

