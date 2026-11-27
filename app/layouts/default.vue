<script setup lang="ts">
const cart = useCartStore()
const { t } = useI18n()
</script>

<template>
  <div class="storefront-layout flex min-h-dvh flex-col bg-surface" :class="{ 'storefront-product-layout': $slots['mobile-bottom'] }">
    <a href="#storefront-content" class="storefront-skip">{{ t('guide.skip') }}</a>
    <StorefrontHeader :cart-count="cart.quantity">
      <template v-if="$slots['mobile-header']" #mobile>
        <slot name="mobile-header" />
      </template>
    </StorefrontHeader>
    <main id="storefront-content" class="storefront-anchor grow" tabindex="-1">
      <slot />
    </main>
    <slot name="footer"><StorefrontFooter /></slot>
    <slot name="mobile-bottom"><StorefrontBottomNavigation :cart-count="cart.quantity" /></slot>
  </div>
</template>

