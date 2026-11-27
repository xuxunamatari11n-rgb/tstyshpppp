<script setup lang="ts">
import type { CartLineRequest, CommercialProduct } from '~/types/commerce'

const props = defineProps<{
  line: CartLineRequest
  product: CommercialProduct
  available: boolean
  closed?: boolean
  compact?: boolean
}>()
const { t } = useI18n()
const { addToCart, prepareOrder } = useCommerce()
const cartLabel = computed(() => t(props.available ? 'product.addToCart' : props.closed ? 'product.shopClosed' : 'product.outOfStock'))
function prepare(event: MouseEvent) {
  prepareOrder({ source: 'product', line: props.line, referencePrice: props.product.price }, event)
}
</script>

<template>
  <div class="product-purchase-actions">
    <UiButton class="product-cart-action commercial-cart" variant="primary" :disabled="!available"
      :aria-label="cartLabel" :title="cartLabel" @click="addToCart(product, line.quantity)">
      <Icon name="ion:cart-outline" size="22" aria-hidden="true" />
      <span>{{ t('product.addToCart') }}</span>
    </UiButton>
    <UiButton class="product-whatsapp-action" variant="secondary" :disabled="!available"
      :aria-label="t('product.orderWhatsApp')" :title="t('product.orderWhatsApp')" @click="prepare">
      <Icon name="ion:logo-whatsapp" size="22" aria-hidden="true" />
      <span v-if="!compact">{{ t('product.orderWhatsApp') }}</span>
    </UiButton>
  </div>
</template>
