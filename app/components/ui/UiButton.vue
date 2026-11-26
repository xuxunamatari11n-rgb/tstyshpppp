<script setup lang="ts">
import type { ButtonType, ButtonVariant } from '~/types/ui'

const props = withDefaults(defineProps<{
  variant?: ButtonVariant
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
}>(), { variant: 'primary', type: 'button' })

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function handleClick(event: MouseEvent) {
  if (props.loading || props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    class="ui-button"
    :data-variant="variant"
    :type="type"
    :disabled="disabled"
    :aria-disabled="loading || undefined"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <UiSpinner v-if="loading" decorative class="size-5" />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
