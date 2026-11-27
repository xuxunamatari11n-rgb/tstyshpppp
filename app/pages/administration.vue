<script setup lang="ts">
definePageMeta({ name: 'shop-admin-legacy', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/administration', es: '/administracion' } } })
await navigateTo(useLocalePath()('shop-admin'), { redirectCode: 301, replace: true })
</script>

<template><span hidden /></template>
