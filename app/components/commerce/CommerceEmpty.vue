<script setup lang="ts">
defineProps<{ kind: 'cart' | 'favorites' }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="commerce-empty">
    <span class="commerce-empty-icon"><Icon :name="kind === 'cart' ? 'ion:bag-handle-outline' : 'ion:heart-outline'" size="32" aria-hidden="true" /></span>
    <h2>{{ t(`commerce.${kind}.emptyTitle`) }}</h2>
    <p>{{ t(`commerce.${kind}.emptyText`) }}</p>
    <NuxtLink :to="localePath({ name: 'catalogue' })" class="ui-button" data-variant="primary">{{ t('commerce.explore') }}</NuxtLink>
  </div>
</template>

