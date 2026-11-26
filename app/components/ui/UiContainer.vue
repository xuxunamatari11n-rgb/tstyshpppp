<script setup lang="ts">
withDefaults(defineProps<{ as?: 'div' | 'section' | 'header' | 'footer' | 'main' }>(), { as: 'div' })
</script>

<template>
  <component :is="as" class="ui-container">
    <slot />
  </component>
</template>
