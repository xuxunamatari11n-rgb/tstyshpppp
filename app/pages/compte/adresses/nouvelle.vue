<script setup lang="ts">
definePageMeta({ name: 'account-address-new', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/adresses/nouvelle', es: '/cuenta/direcciones/nueva' } } })
const { t } = useI18n()
useSeoMeta({ title: () => t('customer.addresses.create'), robots: 'noindex, nofollow' })
</script>

<template><CustomerAddressForm /></template>

