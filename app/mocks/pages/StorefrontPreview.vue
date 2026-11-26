<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const routeBaseName = useRouteBaseName()
const title = computed(() => {
  const page = routeBaseName(route)
  if (typeof page !== 'string') return t('storefront.preview.title')
  if (page === 'account' && route.query.intent === 'sign-in') return t('storefront.drawer.signIn')
  if (page === 'account' && route.query.intent === 'create-account') return t('storefront.drawer.createAccount')
  return t(`storefront.nav.${page}`)
})
useSeoMeta({ title, robots: 'noindex, nofollow' })
</script>

<template>
  <UiContainer class="py-5 lg:py-7">
    <section class="min-h-[max(33rem,72svh)] rounded-standard border border-line bg-subtle p-5 sm:p-8 lg:p-10" aria-labelledby="preview-title">
      <h1 id="preview-title" class="text-section font-semibold">{{ title }}</h1>
      <p class="mt-2 max-w-prose text-muted-ink">{{ t('storefront.preview.pending') }}</p>
    </section>
  </UiContainer>
</template>
