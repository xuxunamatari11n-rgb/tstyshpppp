<script setup lang="ts">
definePageMeta({ name: 'account-assistance', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/assistance', es: '/cuenta/ayuda' } } })
const { t } = useI18n()
const { path } = useCustomerNavigation()
const { settings } = useShopMeta()
const contact = useWhatsAppContact()
const email = computed(() => {
  const address = settings.value?.supportEmail?.trim()
  return address && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? address : undefined
})
useSeoMeta({ title: () => t('customer.nav.assistance'), robots: 'noindex, nofollow' })
</script>

<template>
  <section class="customer-detail customer-assistance">
    <div class="customer-contact-banner">
      <span class="customer-shortcut-icon"><Icon name="ion:headset-outline" size="27" aria-hidden="true" /></span>
      <div>
        <h2>{{ t('customer.support.title') }}</h2>
        <p>{{ settings?.supportInformation || t('customer.support.description') }}</p>
      </div>
      <a v-if="contact" :href="contact" class="ui-button" data-variant="primary" target="_blank" rel="noopener noreferrer">
        <Icon name="ion:logo-whatsapp" size="20" aria-hidden="true" />{{ t('storefront.footer.contactWhatsApp') }}
      </a>
    </div>
    <p v-if="!contact" class="customer-description" role="status">{{ t('customer.support.unavailable') }}</p>
    <ul class="customer-service-list">
      <li v-if="email"><a :href="`mailto:${encodeURIComponent(email)}`"><Icon name="ion:mail-outline" size="21" aria-hidden="true" /><span>{{ email }}</span><Icon name="ion:arrow-forward-outline" size="19" aria-hidden="true" /></a></li>
      <li><NuxtLink :to="path('account-orders')"><Icon name="ion:bag-handle-outline" size="21" aria-hidden="true" /><span>{{ t('customer.nav.orders') }}</span><Icon name="ion:arrow-forward-outline" size="19" aria-hidden="true" /></NuxtLink></li>
      <li><NuxtLink :to="{ path: path('index'), hash: '#storefront-assistance' }"><Icon name="ion:information-circle-outline" size="21" aria-hidden="true" /><span>{{ t('customer.support.resources') }}</span><Icon name="ion:arrow-forward-outline" size="19" aria-hidden="true" /></NuxtLink></li>
    </ul>
    <NuxtLink :to="path('catalogue')" class="ui-button" data-variant="outline">{{ t('commerce.explore') }}</NuxtLink>
  </section>
</template>

