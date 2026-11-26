<script setup lang="ts">
defineProps<{ decorative?: boolean; label?: string }>()
const { t } = useI18n()
</script>

<template>
  <span class="inline-flex size-6 shrink-0" :role="decorative ? undefined : 'status'" :aria-hidden="decorative || undefined">
    <Icon name="ion:refresh-outline" class="size-full motion-safe:animate-spin" aria-hidden="true" />
    <span v-if="!decorative" class="sr-only">{{ label ?? t('loading') }}</span>
  </span>
</template>
