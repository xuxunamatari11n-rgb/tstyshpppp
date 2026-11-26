<script setup lang="ts">
const { locale, localeProperties } = useI18n()

useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
  titleTemplate: title => title ? `${title} · Testy Shop` : 'Testy Shop',
}))
</script>

<template>
  <NuxtRouteAnnouncer politeness="polite" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
