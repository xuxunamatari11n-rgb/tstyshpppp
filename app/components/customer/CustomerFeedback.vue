<script setup lang="ts">
defineProps<{ warning?: boolean; error?: boolean }>()
const panel = useTemplateRef('panel')
useEntranceMotion(panel, { duration: 0.22, opacity: 0.9 })
</script>

<template>
  <p ref="panel" class="customer-feedback" :data-tone="error ? 'error' : warning ? 'warning' : 'success'"
    :role="error ? 'alert' : 'status'">
    <Icon :name="error || warning ? 'ion:alert-circle-outline' : 'ion:checkmark-circle-outline'" size="20" aria-hidden="true" />
    <span><slot /></span>
  </p>
</template>

