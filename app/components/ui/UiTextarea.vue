<script setup lang="ts">
import type { FieldProps } from '~/types/ui'

defineOptions({ inheritAttrs: false })
const props = defineProps<FieldProps & { rows?: number }>()
const model = defineModel<string>({ required: true })
const { controlId, hintId, errorId, describedBy } = useField(props)
</script>

<template>
  <div class="ui-field">
    <label :for="controlId">{{ label }}</label>
    <textarea
      v-bind="$attrs"
      :id="controlId"
      v-model="model"
      class="ui-control resize-y"
      :rows="rows ?? 3"
      :name="name"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="[describedBy, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined"
    />
    <p v-if="hint" :id="hintId" class="ui-hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="ui-error">{{ error }}</p>
  </div>
</template>
