<script setup lang="ts">
import { uuidPattern } from '~~/shared/utils/commerceSelection'

definePageMeta({ name: 'account-address-edit', layout: 'account', middleware: 'customer-account',
  key: route => route.path, validate: route => typeof route.params.id === 'string' && uuidPattern.test(route.params.id),
  i18n: { paths: { fr: '/compte/adresses/[id]', es: '/cuenta/direcciones/[id]' } } })
const { t } = useI18n()
const id = computed(() => String(useRoute().params.id))
useSeoMeta({ title: () => t('customer.addresses.edit'), robots: 'noindex, nofollow' })
</script>

<template><CustomerAddressForm :id="id" /></template>

