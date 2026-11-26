<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <nav :aria-label="label" class="hidden lg:block">
    <h2 class="mb-1 font-semibold">{{ label }}</h2>
    <slot />
  </nav>
  <details class="storefront-footer-disclosure lg:hidden">
    <summary>
      {{ label }}
      <Icon name="ion:chevron-down-outline" size="17" aria-hidden="true" />
    </summary>
    <div class="pb-2"><slot /></div>
  </details>
</template>
