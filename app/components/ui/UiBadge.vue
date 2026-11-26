<script setup lang="ts">
import type { BadgeVariant } from '~/types/ui'

const appearances: Record<BadgeVariant, string> = {
  neutral: 'bg-subtle text-ink',
  brand: 'bg-brand/30 text-brand-foreground',
  discount: 'bg-danger-ink text-surface',
  featured: 'bg-brand-foreground text-brand',
  success: 'bg-success/10 text-success-ink',
  danger: 'bg-danger/10 text-danger-ink',
}

withDefaults(defineProps<{ variant?: BadgeVariant }>(), { variant: 'neutral' })
</script>

<template>
  <span class="inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold" :class="appearances[variant]">
    <slot />
  </span>
</template>
