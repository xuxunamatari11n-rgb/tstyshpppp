<script setup lang="ts">
definePageMeta({ name: 'catalogue-legacy', i18n: { paths: { fr: '/catalogue', es: '/catalogo' } } })
const route = useRoute()
const localePath = useLocalePath()
await navigateTo(localePath({ name: 'catalogue', query: route.query, hash: route.hash }), { redirectCode: 301 })
</script>

<template>
  <div />
</template>
