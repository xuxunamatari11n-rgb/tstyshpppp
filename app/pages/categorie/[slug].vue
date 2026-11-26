<script setup lang="ts">
import { storefrontCategories } from '~/mocks/storefront'

definePageMeta({
  name: 'category',
  scrollToTop: (to, from) => to.path !== from.path,
  i18n: { paths: { fr: '/categorie/[slug]', es: '/categoria/[slug]' } },
  validate: route => storefrontCategories.some(category => category.slug === route.params.slug),
})
</script>

<template>
  <CataloguePage />
</template>
