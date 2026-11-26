<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  icon?: `ion:${string}`
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>(), { icon: 'ion:bag-outline', as: 'h3' })
</script>

<template>
  <div class="grid justify-items-center gap-2 rounded-standard border border-line bg-surface px-5 py-8 text-center">
    <Icon :name="icon" size="24" class="mb-1 text-ink" aria-hidden="true" />
    <component :is="as" class="font-sans text-lg font-semibold">{{ title }}</component>
    <p v-if="description" class="max-w-sm text-muted-ink">{{ description }}</p>
    <div v-if="$slots.action" class="mt-2"><slot name="action" /></div>
  </div>
</template>
