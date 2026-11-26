<script setup lang="ts">
import { useStorefrontDestination } from '~/composables/useStorefrontDestination'
withDefaults(defineProps<{ count?: number; showLabel?: boolean }>(), { count: 0 })
const { t } = useI18n()
const destination = useStorefrontDestination()
</script>

<template>
  <NuxtLink
    :to="destination('cart')"
    :aria-disabled="!destination('cart') || undefined"
    :aria-label="count > 0 ? t('storefront.cartCount', count) : t('storefront.nav.cart')"
    :title="t('storefront.nav.cart')"
    class="storefront-action"
  >
    <span class="relative inline-flex">
      <Icon name="ion:cart-outline" size="24" aria-hidden="true" />
      <span v-if="count > 0" aria-hidden="true" class="absolute -end-2 -top-1 grid min-h-4 min-w-4 place-items-center rounded-sm bg-brand px-0.5 text-[0.625rem] leading-none font-bold text-brand-foreground">
        <UiNumericText :value="count > 99 ? '99+' : String(count)" />
      </span>
    </span>
    <span v-if="showLabel">{{ t('storefront.nav.cart') }}</span>
  </NuxtLink>
</template>

