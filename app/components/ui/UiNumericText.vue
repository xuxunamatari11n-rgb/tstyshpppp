<script setup lang="ts">
defineProps<{ value: string }>()
</script>

<template>
  <span class="whitespace-nowrap tabular-nums">
    <span class="sr-only select-none">{{ value }}</span>
    <span aria-hidden="true">
      <template v-for="(character, index) in value" :key="index">
        <span v-if="/[0-9]/.test(character)" class="numeric-digit">{{ character }}</span>
        <template v-else>{{ character }}</template>
      </template>
    </span>
  </span>
</template>

<style scoped>
.numeric-digit {
  display: inline-block;
  inline-size: 0.65em;
  text-align: center;
}
</style>
