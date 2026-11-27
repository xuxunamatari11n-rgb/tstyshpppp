<script setup lang="ts">
import { useStorefrontDestination } from '~/composables/useStorefrontDestination'
withDefaults(defineProps<{ count?: number; showLabel?: boolean }>(), { count: 0 })
const { t } = useI18n()
const destination = useStorefrontDestination()
const { drawer } = useCommerce()

function activate(event: MouseEvent, navigate: (event?: MouseEvent) => unknown) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    || !window.matchMedia('(min-width: 64rem)').matches) {
    navigate(event)
    return
  }
  event.preventDefault()
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true })
  drawer.value++
}
</script>

<template>
  <NuxtLink :to="destination('cart')" custom v-slot="{ href, navigate }">
    <a
      :href="href ?? undefined"
      :aria-label="count > 0 ? t('storefront.cartCount', count) : t('storefront.nav.cart')"
      :title="t('storefront.nav.cart')"
      :aria-haspopup="showLabel ? 'dialog' : undefined"
      class="storefront-action"
      @click="activate($event, navigate)"
    >
      <span class="relative inline-flex">
        <Icon name="ion:cart-outline" size="24" aria-hidden="true" />
        <span v-if="count > 0" aria-hidden="true" class="absolute -end-2 -top-1 grid min-h-4 min-w-4 place-items-center rounded-sm bg-brand px-0.5 text-[0.625rem] leading-none font-bold text-brand-foreground">
          <UiNumericText :value="count > 99 ? '99+' : String(count)" />
        </span>
      </span>
      <span v-if="showLabel">{{ t('storefront.nav.cart') }}</span>
    </a>
  </NuxtLink>
</template>

