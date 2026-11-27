<script setup lang="ts">
import type { CartLineRequest } from '~/types/commerce'

const props = defineProps<{
  line: CartLineRequest
  available: boolean
  closed?: boolean
  whatsappUrl?: string
  cartEnabled?: boolean
  compact?: boolean
}>()
const emit = defineEmits<{ add: [line: CartLineRequest] }>()
const { t } = useI18n()
const whatsappLabel = computed(() => props.whatsappUrl ? t('product.orderWhatsApp') : t('product.assistance'))
const cartLabel = computed(() => props.available
  ? t(props.cartEnabled ? 'product.addToCart' : 'catalogue.purchasePending')
  : t(props.closed ? 'product.shopClosed' : 'product.outOfStock'))

function add() {
  if (props.available && props.cartEnabled) emit('add', props.line)
}
</script>

<template>
  <div class="product-purchase-actions">
    <UiButton class="product-cart-action commercial-cart" variant="primary" :disabled="!available || !cartEnabled"
      :aria-label="cartLabel" :title="cartLabel" @click="add">
      <Icon name="ion:cart-outline" size="22" aria-hidden="true" />
      <span>{{ t('product.addToCart') }}</span>
    </UiButton>
    <a v-if="available" :href="whatsappUrl || '#storefront-assistance'" class="ui-button product-whatsapp-action" data-variant="secondary"
      :target="whatsappUrl ? '_blank' : undefined" :rel="whatsappUrl ? 'noopener noreferrer' : undefined"
      :aria-label="compact ? whatsappLabel : undefined" :title="compact ? whatsappLabel : undefined">
      <Icon :name="whatsappUrl ? 'ion:logo-whatsapp' : 'ion:headset-outline'" size="22" aria-hidden="true" />
      <span v-if="!compact">{{ whatsappLabel }}</span>
    </a>
    <UiButton v-else class="product-whatsapp-action" variant="secondary" disabled :aria-label="cartLabel">
      <Icon name="ion:logo-whatsapp" size="22" aria-hidden="true" />
      <span v-if="!compact">{{ t('product.orderWhatsApp') }}</span>
    </UiButton>
  </div>
</template>
