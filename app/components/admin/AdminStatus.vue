<script setup lang="ts">
const props = defineProps<{
  public: boolean; visible: boolean; availability?: boolean; stock?: number | null
}>()
const a = useRegieText()
</script>

<template>
  <div class="regie-statuses">
    <span class="regie-chip" :data-tone="props.public ? 'success' : props.visible ? 'warning' : 'neutral'"
      :title="props.visible && !props.public ? a('blockedHint') : undefined">
      {{ a(props.public ? 'public' : props.visible ? 'blocked' : 'manualHidden') }}
    </span>
    <span v-if="availability !== undefined" class="regie-chip"
      :data-tone="availability && stock !== 0 ? 'success' : 'warning'">
      {{ a(stock === 0 ? 'outOfStock' : availability ? 'available' : 'notAvailable') }}
    </span>
  </div>
</template>
