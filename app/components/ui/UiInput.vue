<script setup lang="ts">
import type { FieldProps } from '~/types/ui'

defineOptions({ inheritAttrs: false })
const props = defineProps<FieldProps & {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date'
}>()
const model = defineModel<string>({ required: true })
const { controlId, hintId, errorId, describedBy } = useField(props)

function updateValue(event: Event) {
  model.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <div class="ui-field">
    <label :for="controlId">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="controlId"
      class="ui-control"
      :type="type ?? 'text'"
      :value="model"
      :name="name"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="[describedBy, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined"
      @input="updateValue"
    >
    <p v-if="hint" :id="hintId" class="ui-hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="ui-error">{{ error }}</p>
  </div>
</template>
