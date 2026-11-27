<script setup lang="ts">
definePageMeta({ name: 'cart', layout: false, i18n: { paths: { fr: '/panier', es: '/carrito' } } })
const { t, locale } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const { prepareOrder } = useCommerce()
const { settings } = useShopMeta()
const lookup = useShopSelection()
const formatPrice = useShopPrice()
const title = useTemplateRef('title')
const catalogue = computed(() => localePath({ name: 'catalogue' }))
const total = computed(() => cart.validation === 'ready' ? formatPrice(cart.subtotal) : '—')
const orderable = computed(() => cart.canOrder && settings.value?.open !== false)

useSeoMeta({ title: () => t('commerce.cart.title'), robots: 'noindex, follow' })
function refresh() { if (cart.ready) void cart.refresh(lookup) }
function prepare(event: MouseEvent) { prepareOrder({ source: 'cart' }, event) }

watch([() => cart.ready, locale], refresh)
onMounted(() => {
  refresh()
  window.addEventListener('focus', refresh)
})
onBeforeUnmount(() => window.removeEventListener('focus', refresh))
</script>

<template>
  <NuxtLayout name="default">
    <template #mobile-header>
      <div class="commerce-mobile-header lg:hidden">
        <NuxtLink :to="catalogue" :aria-label="t('commerce.explore')">
          <Icon name="ion:arrow-back-outline" size="23" aria-hidden="true" />
        </NuxtLink>
        <span>{{ t('commerce.cart.title') }}</span>
        <span v-if="cart.ready" class="commerce-mobile-count">{{ cart.quantity }}</span>
      </div>
    </template>
    <template #mobile-bottom>
      <aside v-if="cart.ready && cart.selections.length" class="commerce-checkout-bar lg:hidden" :aria-label="t('commerce.cart.summary')">
        <p>{{ t('commerce.cart.total') }} <UiNumericText :value="total" /></p>
        <UiButton :disabled="!orderable" @click="prepare">
          <template #icon><Icon name="ion:logo-whatsapp" size="19" aria-hidden="true" /></template>
          {{ t('commerce.order.whatsapp') }}
        </UiButton>
      </aside>
    </template>

    <UiContainer class="commerce-page commerce-cart-page" :data-filled="cart.selections.length > 0">
      <nav class="product-breadcrumb" :aria-label="t('catalogue.breadcrumb')">
        <ol>
          <li><NuxtLink :to="catalogue">{{ t('catalogue.shop') }}</NuxtLink></li>
          <li aria-current="page"><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />{{ t('commerce.cart.title') }}</li>
        </ol>
      </nav>
      <header class="commerce-page-head">
        <div>
          <h1 ref="title" tabindex="-1" class="commerce-page-title">{{ t('commerce.cart.title') }}</h1>
          <p v-if="cart.ready">{{ t('commerce.cart.count', cart.quantity) }}</p>
        </div>
        <NuxtLink :to="catalogue" class="commerce-text-link commerce-continue">{{ t('commerce.cart.continue') }}</NuxtLink>
      </header>
      <CommerceCartStatus />
      <UiSkeleton v-if="!cart.ready" class="min-h-48 w-full" />
      <CommerceEmpty v-else-if="!cart.selections.length" kind="cart" />
      <div v-else class="commerce-cart-grid">
        <section aria-labelledby="cart-items-title">
          <h2 id="cart-items-title" class="sr-only">{{ t('commerce.cart.products') }}</h2>
          <CommerceCartLines />
          <button type="button" class="commerce-text-link commerce-clear" @click="cart.clear(); title?.focus()">{{ t('commerce.cart.clear') }}</button>
        </section>
        <aside class="commerce-summary" aria-labelledby="cart-summary">
          <h2 id="cart-summary">{{ t('commerce.cart.summary') }}</h2>
          <dl>
            <div><dt>{{ t('commerce.cart.subtotal') }}</dt><dd><UiNumericText :value="total" /></dd></div>
            <div class="commerce-summary-total"><dt>{{ t('commerce.cart.total') }}</dt><dd><UiNumericText :value="total" /></dd></div>
          </dl>
          <p class="commerce-secondary">{{ t('commerce.order.deliveryEstimate') }}</p>
          <p v-if="settings?.open === false" class="commerce-inline-note">{{ t('product.shopClosed') }}</p>
          <UiButton class="commerce-page-order" :disabled="!orderable" @click="prepare">
            <template #icon><Icon name="ion:logo-whatsapp" size="21" aria-hidden="true" /></template>
            {{ t('commerce.order.whatsapp') }}
          </UiButton>
        </aside>
      </div>
    </UiContainer>
  </NuxtLayout>
</template>

