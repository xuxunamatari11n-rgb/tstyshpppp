<script setup lang="ts">
defineProps<{
  label: string
  name: string
  autocomplete: 'current-password' | 'new-password'
  disabled?: boolean
  error?: string
  hint?: string
  minlength?: number
}>()
const model = defineModel<string>({ required: true })
const { t } = useI18n()
const visible = ref(false)
const inputId = useId()
</script>

<template>
  <UiInput
    :id="inputId"
    v-model="model"
    :label="label"
    :name="name"
    :type="visible ? 'text' : 'password'"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :minlength="minlength"
    maxlength="128"
    autocapitalize="none"
    spellcheck="false"
    required
  >
    <template #trailing>
      <button
        class="auth-password-toggle"
        type="button"
        :aria-controls="inputId"
        :aria-label="t(visible ? 'auth.access.hidePassword' : 'auth.access.showPassword', { field: label })"
        :disabled="disabled"
        @click="visible = !visible"
      >
        <Icon v-if="visible" name="ion:eye-off-outline" size="21" aria-hidden="true" />
        <Icon v-else name="ion:eye-outline" size="21" aria-hidden="true" />
      </button>
    </template>
  </UiInput>
</template>

