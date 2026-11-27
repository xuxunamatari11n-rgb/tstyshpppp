<script setup lang="ts">
const cart = useCartStore()
const { t } = useI18n()
const lookup = useShopSelection()
</script>

<template>
  <div class="commerce-cart-status" aria-live="polite">
    <p v-if="cart.adjusted" class="commerce-inline-note">{{ t('commerce.validation.restored') }}</p>
    <p v-if="cart.validation === 'loading'" class="commerce-inline-note">{{ t('commerce.validation.checking') }}</p>
    <p v-if="cart.validation === 'error'" class="commerce-inline-note" role="alert">
      {{ t('commerce.validation.error') }}
      <button type="button" class="commerce-text-link" @click="cart.refresh(lookup)">{{ t('catalogue.retry') }}</button>
    </p>
    <p v-if="cart.validation === 'ready' && cart.items.some(item => item.status !== 'ready')" class="commerce-inline-note">
      {{ t('commerce.validation.resolve') }}
    </p>
  </div>
</template>

