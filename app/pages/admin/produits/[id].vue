<script setup lang="ts">
definePageMeta({ name: 'regie-products-edit', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin', key: route => route.path,
  i18n: { paths: { fr: '/admin/produits/[id]', es: '/admin/productos/[id]' } } })
const route = useRoute()
const id = computed(() => String(route.params.id))
</script>

<template><AdminProductEditor :id="id" /></template>
