<script setup lang="ts">
import type { FieldProps } from '~/types/ui'

defineOptions({ inheritAttrs: false })
const props = defineProps<FieldProps>()
const model = defineModel<boolean>({ required: true })
const { controlId, hintId, errorId, describedBy } = useField(props)
</script>

<template>
  <div class="ui-field">
    <label class="flex min-h-11 w-fit cursor-pointer items-center gap-3 has-disabled:cursor-not-allowed" :for="controlId">
      <input
        v-bind="$attrs"
        :id="controlId"
        v-model="model"
        class="ui-checkbox size-5 shrink-0 accent-ink"
        type="checkbox"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="[describedBy, $attrs['aria-describedby']].filter(Boolean).join(' ') || undefined"
      >
      {{ label }}
    </label>
    <p v-if="hint" :id="hintId" class="ui-hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="ui-error">{{ error }}</p>
  </div>
</template>
