<script setup lang="ts">

definePageMeta({
  name: 'category',
  scrollToTop: (to, from) => to.path !== from.path,
  i18n: { paths: { fr: '/categorie/[slug]', es: '/categoria/[slug]' } },
})
</script>

<template>
  <CataloguePage />
</template>
