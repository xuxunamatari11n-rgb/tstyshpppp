<script setup lang="ts">
import type { CartLineRequest } from '~/types/commerce'
import { findProductBySlug, productAvailability, productImages, productQuantityLimit, productSavings } from '~/utils/product'

definePageMeta({
  name: 'product',
  layout: false,
  key: route => route.path,
  i18n: { paths: { fr: '/produit/[slug]', es: '/producto/[slug]' } },
})

const route = useRoute()
const localePath = useLocalePath()
const { t, locale, locales } = useI18n()
const requestUrl = useRequestURL()
const whatsappContact = useWhatsAppContact()
const catalogue = useHomeCatalogueLink()
const { categoryName, settings } = useShopMeta()
const { name, description: describe, photoAlt } = useProductContent()
const { isFavorite, toggleFavorite } = useProductFavorites()
const { data, status, error, refresh } = await useCatalogueData(computed(() => ({
  slug: typeof route.params.slug === 'string' ? route.params.slug : '~', limit: 1,
})))
const products = computed(() => data.value?.products ?? [])
const product = computed(() => findProductBySlug(products.value, route.params.slug))
const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const category = computed(() => product.value ? categoryName(product.value.categoryId) : '')
const title = computed(() => product.value ? name(product.value) : t(error.value ? 'product.loadError' : 'product.notFound'))
const description = computed(() => product.value ? describe(product.value) : '')
const photos = computed(() => product.value ? productImages(product.value) : [])
const { data: suggested } = useCatalogueData(computed(() => product.value
  ? { categories: [product.value.categoryId], exclude: product.value.slug, limit: 4 }
  : { slug: '~', limit: 0 }))
const suggestions = computed(() => suggested.value?.products ?? [])
const available = computed(() => Boolean(product.value && productAvailability(product.value)))
const shopClosed = computed(() => settings.value?.open === false)
const purchasable = computed(() => available.value && !shopClosed.value)
const formatPrice = useShopPrice()
const savings = computed(() => product.value ? productSavings(product.value) : 0)
const discount = computed(() => savings.value && product.value?.previousPrice
  ? Math.round(savings.value / product.value.previousPrice * 100) : 0)
const max = computed(() => product.value ? productQuantityLimit(product.value) : 1)
const quantity = ref(1)
watch(max, limit => { quantity.value = Math.min(quantity.value, limit) })
const total = computed(() => (product.value?.price ?? 0) * quantity.value)
const favorite = computed(() => Boolean(product.value && isFavorite(product.value.id)))
const line = computed<CartLineRequest | undefined>(() => product.value ? { productId: product.value.id, quantity: quantity.value } : undefined)

function productUrl(language = locale.value) {
  if (!product.value) return ''
  const path = localePath({ name: 'product', params: { slug: product.value.slug } }, language)
  return new URL(path, requestUrl).href
}
const whatsappOrder = computed(() => {
  if (!whatsappContact.value || !product.value || !purchasable.value) return
  const link = new URL(whatsappContact.value)
  link.searchParams.set('text', t('product.whatsappMessage', {
    product: title.value, quantity: quantity.value, unit: formatPrice(product.value.price),
    total: formatPrice(total.value), url: productUrl(),
  }))
  return link.href
})

if (import.meta.server) {
  const event = useRequestEvent()
  if (event && !product.value && !loading.value) setResponseStatus(event, error.value ? 500 : 404)
}

useSeoMeta({
  title: () => product.value?.seoTitle ?? title.value,
  description: () => product.value?.seoDescription ?? description.value,
  ogTitle: () => product.value?.seoTitle ?? title.value,
  ogDescription: () => product.value?.seoDescription ?? description.value,
  ogUrl: () => productUrl() || undefined,
  ogImage: () => photos.value[0] ? new URL(photos.value[0].src, requestUrl).href : undefined,
  ogImageAlt: () => photos.value[0] ? photoAlt(photos.value[0]) : undefined,
  robots: () => product.value ? undefined : 'noindex, follow',
})
useHead(() => ({
  link: product.value ? [
    { rel: 'canonical', href: productUrl() },
    ...locales.value.map(language => ({
      rel: 'alternate' as const, hreflang: language.language ?? language.code, href: productUrl(language.code),
    })),
  ] : [],
}))

const shareStatus = ref<'shared' | 'copied' | 'manual'>()
const shareField = useTemplateRef('shareField')

async function share() {
  const url = productUrl()
  if (!url) return
  shareStatus.value = undefined
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: title.value, url })
      shareStatus.value = 'shared'
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url)
      shareStatus.value = 'copied'
      return
    } catch {
      // Keep the URL available to copy manually if the browser blocks clipboard access.
    }
  }
  shareStatus.value = 'manual'
  await nextTick()
  shareField.value?.focus()
  shareField.value?.select()
}

function toggle() {
  if (product.value) toggleFavorite(product.value.id)
}
</script>

<template>
  <NuxtLayout name="default">
    <template v-if="product" #mobile-header>
      <ProductMobileHeader :favorite="favorite" @favorite="toggle" @share="share" />
    </template>
    <template v-if="line" #mobile-bottom>
      <aside class="product-mobile-bar lg:hidden" :aria-label="t('product.purchase')">
        <UiContainer class="product-mobile-bar-inner">
          <div class="product-mobile-total">
            <span>{{ t('product.total') }}</span>
            <output aria-live="polite"><UiNumericText :value="formatPrice(total)" /></output>
          </div>
          <ProductPurchaseActions :line="line" :available="purchasable" :closed="shopClosed" :whatsapp-url="whatsappOrder" compact />
        </UiContainer>
      </aside>
    </template>

    <UiContainer v-if="product && line" class="product-detail">
      <nav :aria-label="t('catalogue.breadcrumb')" class="product-breadcrumb">
        <ol>
          <li><NuxtLink :to="localePath({ name: 'catalogue' })">{{ t('catalogue.shop') }}</NuxtLink></li>
          <li><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />
            <NuxtLink :to="catalogue({ categoryId: product.categoryId })">{{ category }}</NuxtLink>
          </li>
          <li aria-current="page"><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />{{ title }}</li>
        </ol>
      </nav>

      <div class="product-detail-grid">
        <ProductGallery :images="photos" :discount="discount" />

        <div class="product-summary">
          <NuxtLink :to="catalogue({ categoryId: product.categoryId })" class="product-category">{{ category }}</NuxtLink>
          <h1>{{ title }}</h1>

          <div class="product-pricing">
            <UiNumericText class="product-unit-price" :value="formatPrice(product.price)" />
            <del v-if="savings && product.previousPrice" class="product-previous-price">
              <span class="sr-only">{{ t('guide.specimens.previousPrice') }}</span>
              <UiNumericText :value="formatPrice(product.previousPrice)" />
            </del>
            <UiBadge v-if="discount" variant="discount">{{ t('home.discount', { percent: discount }) }}</UiBadge>
          </div>
          <p v-if="savings" class="product-savings">{{ t('product.savings', { amount: formatPrice(savings) }) }}</p>

          <div class="product-availability" :data-available="available">
            <Icon :name="available ? 'ion:checkmark-circle-outline' : 'ion:alert-circle-outline'" size="19" aria-hidden="true" />
            {{ t(available ? 'product.inStock' : 'product.outOfStock') }}
          </div>
          <p v-if="description" class="product-description">{{ description }}</p>

          <div class="product-summary-order">
            <div class="product-quantity-line">
              <ProductQuantity v-model="quantity" :max="max" :disabled="!purchasable" />
              <div class="product-inline-total">
                <span>{{ t('product.total') }}</span>
                <UiNumericText :value="formatPrice(total)" />
              </div>
            </div>

            <div class="hidden lg:block">
              <ProductPurchaseActions :line="line" :available="purchasable" :closed="shopClosed" :whatsapp-url="whatsappOrder" />
            </div>
            <p v-if="available" class="product-purchase-note">
              {{ t(shopClosed ? 'product.shopClosed' : whatsappOrder ? 'product.whatsappHint' : 'storefront.footer.whatsappPending') }}
            </p>

            <div class="product-secondary-actions hidden lg:flex">
              <UiButton variant="ghost" :aria-pressed="favorite" @click="toggle">
                <Icon :name="favorite ? 'ion:heart' : 'ion:heart-outline'" size="20" aria-hidden="true" />{{ t('product.favorite') }}
              </UiButton>
              <UiButton variant="ghost" @click="share">
                <Icon name="ion:share-social-outline" size="20" aria-hidden="true" />{{ t('product.share') }}
              </UiButton>
            </div>
            <p role="status" aria-live="polite" class="product-share-status">{{ shareStatus ? t(`product.shareFeedback.${shareStatus}`) : '' }}</p>
            <div v-if="shareStatus === 'manual'" class="product-share-field">
              <label for="product-share-url">{{ t('product.shareUrl') }}</label>
              <input id="product-share-url" ref="shareField" class="ui-control" :value="productUrl()" readonly @focus="shareField?.select()">
            </div>
          </div>
        </div>
      </div>

      <ProductInformation :product="product" />
      <HomeCollection v-if="suggestions.length" :products="suggestions" :title="t('product.related')" />
    </UiContainer>

    <UiContainer v-else class="product-detail product-status">
      <template v-if="loading">
        <h1>{{ t('product.loading') }}</h1>
        <UiSkeleton class="product-loading-photo" />
      </template>
      <template v-else>
        <h1>{{ title }}</h1>
        <p>{{ t(error ? 'product.loadErrorHint' : 'product.notFoundHint') }}</p>
        <UiButton v-if="error" variant="outline" @click="refresh()">{{ t('catalogue.retry') }}</UiButton>
        <NuxtLink v-else :to="localePath({ name: 'catalogue' })" class="ui-button" data-variant="primary">{{ t('catalogue.browse') }}</NuxtLink>
      </template>
    </UiContainer>
  </NuxtLayout>
</template>
