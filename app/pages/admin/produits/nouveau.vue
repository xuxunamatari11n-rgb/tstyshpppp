<script setup lang="ts">
definePageMeta({ name: 'regie-products-new', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin/produits/nouveau', es: '/admin/productos/nuevo' } } })
</script>

<template><AdminProductEditor /></template>
