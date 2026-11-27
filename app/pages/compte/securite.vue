<script setup lang="ts">
definePageMeta({ name: 'account-security', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/securite', es: '/cuenta/seguridad' } } })
const { t } = useI18n()
const { user } = useCustomerAccount()
const localePath = useLocalePath()
const target = computed(() => localePath({ name: 'account', query: { intent: 'recovery', next: 'account-security' } }))
useSeoMeta({ title: () => t('customer.nav.security'), robots: 'noindex, nofollow' })
</script>

<template>
  <section class="customer-detail customer-security">
    <div class="customer-security-row">
      <span class="customer-shortcut-icon"><Icon name="ion:mail-outline" size="22" aria-hidden="true" /></span>
      <div>
        <h2>{{ t('auth.email') }}</h2>
        <p>{{ user?.email }}</p>
      </div>
    </div>
    <div class="customer-security-row">
      <span class="customer-shortcut-icon"><Icon name="ion:lock-closed-outline" size="22" aria-hidden="true" /></span>
      <div>
        <h2>{{ t('auth.password') }}</h2>
        <p>{{ t('customer.security.requirements') }}</p>
      </div>
      <NuxtLink :to="target" class="ui-button" data-variant="primary">{{ t('customer.security.change') }}</NuxtLink>
    </div>
  </section>
</template>

