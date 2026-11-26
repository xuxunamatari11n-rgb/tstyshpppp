<script setup lang="ts">
defineProps<{ inverse?: boolean }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink
    :to="localePath({ name: 'index' })"
    :aria-label="t('storefront.wordmarkLabel')"
    class="inline-flex min-h-11 shrink-0 items-center font-display text-[1.75rem] leading-none font-bold tracking-[-0.075em] sm:text-[2rem]"
  >
    <span>testyshop<span :class="inverse ? 'text-brand' : 'text-ink'" aria-hidden="true">.</span></span>
  </NuxtLink>
</template>

