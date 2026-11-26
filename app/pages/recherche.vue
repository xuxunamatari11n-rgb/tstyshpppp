<script setup lang="ts">
definePageMeta({
  name: 'search',
  scrollToTop: (to, from) => to.path !== from.path,
  i18n: { paths: { fr: '/recherche', es: '/buscar' } },
})
</script>

<template>
  <CataloguePage />
</template>
