<script setup lang="ts">
import type { ButtonType, ButtonVariant } from '~/types/ui'

defineProps<{
  icon: `ion:${string}`
  label: string
  variant?: ButtonVariant
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <UiButton
    class="size-11"
    :variant="variant ?? 'outline'"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :aria-label="label"
  >
    <template #icon>
      <Icon :name="icon" class="size-5 shrink-0" aria-hidden="true" />
    </template>
  </UiButton>
</template>

<style scoped>
.ui-button {
  padding-inline: 0;
}
</style>
