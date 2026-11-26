<script setup lang="ts">
import type { FieldProps, SelectOption } from '~/types/ui'

defineOptions({ inheritAttrs: false })
const props = defineProps<FieldProps & {
  options: readonly SelectOption[]
  placeholder?: string
}>()
const model = defineModel<string>({ required: true })
const { controlId, hintId, errorId, describedBy } = useField(props)
</script>

<template>
  <div class="ui-field">
    <label :for="controlId">{{ label }}</label>
    <div class="relative">
      <select
        v-bind="$attrs"
        :id="controlId"
        v-model="model"
        class="ui-control appearance-none pe-10"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="[describedBy, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined"
      >
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
          {{ option.label }}
        </option>
      </select>
      <Icon name="ion:chevron-down-outline" class="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 forced-colors:hidden" aria-hidden="true" />
    </div>
    <p v-if="hint" :id="hintId" class="ui-hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="ui-error">{{ error }}</p>
  </div>
</template>
