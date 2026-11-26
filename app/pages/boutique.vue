<script setup lang="ts">
definePageMeta({
  name: 'catalogue',
  scrollToTop: (to, from) => to.path !== from.path,
  i18n: { paths: { fr: '/boutique', es: '/tienda' } },
})
</script>

<template>
  <CataloguePage />
</template>
