<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>(), { as: 'h2' })
</script>

<template>
  <div>
    <component :is="as" class="text-section font-sans font-semibold">{{ title }}</component>
    <p v-if="description" class="mt-2 max-w-prose text-muted-ink">{{ description }}</p>
  </div>
</template>
