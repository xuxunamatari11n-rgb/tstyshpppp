<script setup lang="ts">
import type { AdminCategory, AdminProductPage, AdminSettings } from '~~/shared/types/admin'
import { whatsappNumber } from '~/utils/whatsappCommerce'
definePageMeta({ name: 'shop-admin', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin', es: '/admin' } } })
const a = useRegieText()
const path = useLocalePath()
const request = useRequestFetch()
const { data: session } = useShopSession()
const { data, error, refresh } = await useAsyncData('regie-overview', async () => {
  const [latest, attention, categories, settings] = await Promise.all([
    request<AdminProductPage>('/api/regie/products?overview=true'),
    request<AdminProductPage>('/api/regie/products?overview=true&attention=true'),
    request<AdminCategory[]>('/api/regie/categories'),
    request<AdminSettings | null>('/api/regie/settings'),
  ])
  return { latest, attention, categories, settings }
})
const counts = computed(() => data.value?.latest.counts)
const stats = [
  { key: 'total', icon: 'ion:cube-outline', link: 'regie-products' },
  { key: 'public', icon: 'ion:eye-outline', link: 'regie-products' },
  { key: 'hidden', icon: 'ion:eye-off-outline', link: 'regie-products' },
  { key: 'unavailable', icon: 'ion:alert-circle-outline', link: 'regie-products' },
  { key: 'categories', icon: 'ion:pricetags-outline', link: 'regie-categories' },
] as const
const checks = computed(() => [
  { key: 'whatsapp', ok: !!whatsappNumber(data.value?.settings?.whatsapp_number), link: 'regie-settings' },
  { key: 'publicCategories', ok: !!counts.value?.publicCategories, link: 'regie-categories' },
  { key: 'publicProducts', ok: !!counts.value?.public, link: 'regie-products' },
  { key: 'publicSupport', ok: !!(data.value?.settings?.support_email || data.value?.settings?.support_information.fr), link: 'regie-settings' },
] as const)
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title regie-title-actions">
      <div>
        <h1>{{ a('overview') }}</h1>
        <p><strong v-if="session?.user?.firstName">{{ a('greeting') }}, {{ session.user.firstName }}. </strong>{{ a('dashboardIntro') }}</p>
      </div>
      <NuxtLink class="regie-button" data-tone="primary" :to="path('regie-products-new')"><Icon name="ion:add-outline" size="19" />{{ a('newProduct') }}</NuxtLink>
    </header>
    <div v-if="error" role="alert" class="regie-feedback" data-error>{{ a(regieError(error)) }} <button type="button" class="regie-button" @click="refresh()">{{ a('retry') }}</button></div>
    <p v-else-if="!data || !counts" role="status">{{ a('loading') }}</p>
    <template v-else>
      <div class="regie-stats">
        <NuxtLink v-for="stat in stats" :key="stat.key" :to="path(stat.link)" class="regie-stat">
          <Icon :name="stat.icon" size="19" aria-hidden="true" /><strong>{{ counts[stat.key] }}</strong><span>{{ a(stat.key) }}</span>
        </NuxtLink>
      </div>
      <div class="regie-dashboard-grid">
        <section class="regie-surface regie-table-surface">
          <header class="regie-section-head"><h2>{{ a('recent') }}</h2><NuxtLink :to="path('regie-products')">{{ a('products') }} <Icon name="ion:arrow-forward-outline" size="16" /></NuxtLink></header>
          <AdminProductTable :rows="data.latest.products" :categories="data.categories" />
        </section>
        <section class="regie-surface">
          <h2>{{ a('checks') }}</h2>
          <ul class="regie-checklist">
            <li v-for="check in checks" :key="check.key">
              <NuxtLink :to="path(check.link)">
                <Icon :name="check.ok ? 'ion:checkmark-circle-outline' : 'ion:alert-circle-outline'" size="20" :data-ok="check.ok" aria-hidden="true" />
                <span>{{ a(check.key) }}<small>{{ a(check.ok ? 'ready' : 'missing') }}</small></span>
                <Icon name="ion:chevron-forward-outline" size="15" aria-hidden="true" />
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
      <section class="regie-surface regie-table-surface">
        <header class="regie-section-head"><h2>{{ a('attention') }} <span class="regie-chip" data-tone="neutral">{{ data.attention.total }}</span></h2>
          <NuxtLink :to="path({ name: 'regie-products', query: { attention: '1' } })">{{ a('watch') }} <Icon name="ion:arrow-forward-outline" size="16" /></NuxtLink>
        </header>
        <AdminProductTable :rows="data.attention.products" :categories="data.categories" attention />
      </section>
    </template>
  </div>
</template>
