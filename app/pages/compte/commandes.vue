<script setup lang="ts">
definePageMeta({ name: 'account-orders', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/commandes', es: '/cuenta/pedidos' } } })
const { t } = useI18n()
const { path } = useCustomerNavigation()
const contact = useWhatsAppContact()
const requests = [
  { key: 'track', icon: 'ion:locate-outline' },
  { key: 'change', icon: 'ion:create-outline' },
  { key: 'delivery', icon: 'ion:cube-outline' },
  { key: 'help', icon: 'ion:chatbubble-ellipses-outline' },
].map(request => ({ ...request, href: useWhatsAppContact(() => t(`customer.orders.messages.${request.key}`)) }))
useSeoMeta({ title: () => t('customer.nav.orders'), robots: 'noindex, nofollow' })
</script>

<template>
  <section class="customer-detail customer-orders">
    <div class="customer-contact-banner">
      <span class="customer-shortcut-icon"><Icon name="ion:chatbubbles-outline" size="27" aria-hidden="true" /></span>
      <div>
        <h2>{{ t('customer.orders.title') }}</h2>
        <p>{{ t('customer.orders.description') }}</p>
      </div>
      <a v-if="contact" :href="contact" class="ui-button" data-variant="primary" target="_blank" rel="noopener noreferrer">
        <Icon name="ion:logo-whatsapp" size="20" aria-hidden="true" />{{ t('storefront.footer.contactWhatsApp') }}
      </a>
      <NuxtLink v-else :to="path('account-assistance')" class="ui-button" data-variant="primary">{{ t('commerce.order.assistance') }}</NuxtLink>
    </div>
    <p v-if="!contact" class="customer-description" role="status">{{ t('customer.support.unavailable') }}</p>
    <ul class="customer-service-list">
      <li v-for="request in requests" :key="request.key">
        <a v-if="request.href.value" :href="request.href.value" target="_blank" rel="noopener noreferrer">
          <Icon :name="request.icon" size="21" aria-hidden="true" />
          <span>{{ t(`customer.orders.actions.${request.key}`) }}</span>
          <Icon name="ion:arrow-forward-outline" size="19" aria-hidden="true" />
        </a>
        <NuxtLink v-else :to="path('account-assistance')">
          <Icon :name="request.icon" size="21" aria-hidden="true" />
          <span>{{ t(`customer.orders.actions.${request.key}`) }}</span>
          <Icon name="ion:arrow-forward-outline" size="19" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

