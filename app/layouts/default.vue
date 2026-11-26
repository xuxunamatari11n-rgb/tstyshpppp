<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="storefront-layout flex min-h-dvh flex-col bg-surface">
    <a href="#storefront-content" class="storefront-skip">{{ t('guide.skip') }}</a>
    <StorefrontHeader />
    <main id="storefront-content" class="storefront-anchor grow" tabindex="-1">
      <slot />
    </main>
    <StorefrontFooter />
    <StorefrontBottomNavigation />
  </div>
</template>

