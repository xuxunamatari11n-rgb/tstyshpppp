<script setup lang="ts">
definePageMeta({ name: 'shop-admin', middleware: 'shop-auth', shopRole: 'admin', i18n: { paths: { fr: '/administration', es: '/administracion' } } })
const { t } = useI18n()
useSeoMeta({ title: () => t('auth.admin'), robots: 'noindex, nofollow' })
</script>

<template>
  <UiContainer class="grid gap-4 py-8">
    <h1 class="text-section font-semibold">{{ t('auth.admin') }}</h1>
    <p>{{ t('auth.adminReady') }}</p>
  </UiContainer>
</template>
