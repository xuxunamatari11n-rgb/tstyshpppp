<script setup lang="ts">
definePageMeta({ name: 'regie-customers', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin/clients', es: '/admin/clientes' } } })
const a = useRegieText()
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title"><h1>{{ a('customers') }}</h1></header>
    <section class="regie-surface">
      <Icon name="ion:lock-closed-outline" size="22" aria-hidden="true" />
      <h2>{{ a('clientsTitle') }}</h2>
      <p>{{ a('clientsInfo') }}</p>
    </section>
  </div>
</template>
