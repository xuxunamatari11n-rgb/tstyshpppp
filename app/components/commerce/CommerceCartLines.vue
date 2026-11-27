<script setup lang="ts">
import { cartQuantityLimit } from '~/utils/cart'
import { productImages } from '~/utils/product'

const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const { name } = useProductContent()
const { categoryName } = useShopMeta()
const formatPrice = useShopPrice()
const motion = useStorefrontTransition(9, 'x')
const root = useTemplateRef('lines')

async function remove(id: string) {
  const container = root.value?.closest('dialog, main')
  cart.remove(id)
  await nextTick()
  const remaining = root.value?.querySelector<HTMLElement>('li:not([data-removing]) .commerce-remove')
  const fallback = container?.querySelector<HTMLElement>('.commerce-overlay-close, .commerce-page-title')
  ;(remaining ?? fallback)?.focus({ preventScroll: true })
}
</script>

<template>
  <div ref="lines">
  <TransitionGroup v-bind="motion" :css="false" tag="ul" class="commerce-cart-lines"
    @before-leave="(element: Element) => element.setAttribute('data-removing', '')">
    <li v-for="item in cart.items" :key="item.productId" class="commerce-cart-row" :data-product-id="item.productId">
      <div class="commerce-row-image">
        <ProductPhoto v-if="item.product" :image="productImages(item.product)[0]" />
        <Icon v-else name="ion:bag-handle-outline" size="24" aria-hidden="true" />
      </div>
      <div class="commerce-row-content">
        <p v-if="item.product" class="commerce-row-category">{{ categoryName(item.product.categoryId) }}</p>
        <h3 v-if="item.product" class="commerce-row-title">
          <NuxtLink :to="localePath({ name: 'product', params: { slug: item.product.slug } })">{{ name(item.product) }}</NuxtLink>
        </h3>
        <h3 v-else class="commerce-row-title">{{ t(cart.validation === 'ready' ? 'commerce.validation.missing' : 'commerce.validation.checking') }}</h3>
        <UiNumericText v-if="item.product" class="commerce-row-unit" :value="formatPrice(item.product.price)" />
        <p v-if="cart.validation === 'ready' && item.status !== 'ready' && item.status !== 'missing'" class="commerce-row-warning">
          {{ t(`commerce.validation.${item.status}`) }}
        </p>
        <p v-if="item.priceChanged" class="commerce-row-warning">{{ t('commerce.validation.price') }}</p>
        <ProductQuantity v-if="item.product && (item.status === 'ready' || item.status === 'stock')" :model-value="item.quantity"
          :max="cartQuantityLimit(item.product)" @update:model-value="cart.setQuantity(item.productId, $event)" />
        <p v-else class="commerce-row-quantity">{{ t('commerce.cart.quantityValue', { count: item.quantity }) }}</p>
      </div>
      <div class="commerce-row-actions">
        <UiNumericText v-if="item.status === 'ready'" class="commerce-row-total" :value="formatPrice(item.total)" />
        <UiIconButton variant="ghost" icon="ion:trash-outline" class="commerce-remove"
          :label="t('commerce.remove', { product: item.product ? name(item.product) : t('commerce.validation.missing') })"
          @click="remove(item.productId)" />
      </div>
    </li>
  </TransitionGroup>
  </div>
</template>

