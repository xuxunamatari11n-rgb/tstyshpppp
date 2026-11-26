<script setup lang="ts">
import type { CommercialProduct } from '~/types/commerce'

const props = defineProps<{ product: CommercialProduct; favorite?: boolean; added?: boolean }>()
const emit = defineEmits<{ favorite: [product: CommercialProduct]; add: [product: CommercialProduct] }>()
const { t } = useI18n()
const photo = computed(() => props.product.images[0])
const discount = computed(() => {
  const oldPrice = props.product.previousPrice
  return oldPrice && oldPrice > props.product.price ? Math.round((oldPrice - props.product.price) / oldPrice * 100) : 0
})
</script>

<template>
  <article class="home-product" :class="{ 'home-product-unavailable': !product.available }">
    <div class="home-product-photo" :class="{ 'home-product-cutout': photo.cutout }">
      <img :src="photo.src" :width="photo.width" :height="photo.height" :alt="t(photo.altKey)" loading="lazy" decoding="async">
      <UiBadge v-if="discount" variant="discount" class="home-product-badge">
        <UiNumericText :value="t('home.discount', { percent: discount })" />
      </UiBadge>
      <UiIconButton
        :icon="favorite ? 'ion:heart' : 'ion:heart-outline'"
        :label="t('home.actions.favorite', { product: t(product.nameKey) })"
        :aria-pressed="Boolean(favorite)"
        :title="t('home.actions.favorite', { product: t(product.nameKey) })"
        variant="ghost"
        class="home-product-favorite"
        @click="emit('favorite', product)"
      />
    </div>
    <p class="home-product-category">{{ t(`storefront.categories.${product.categoryId}`) }}</p>
    <h3 class="home-product-name">{{ t(product.nameKey) }}</h3>
    <div class="home-product-line">
      <p class="home-product-prices">
        <UiNumericText class="home-product-price" :value="formatCurrency(product.price)" />
        <del v-if="discount && product.previousPrice" class="home-previous-price">
          <span class="sr-only">{{ t('guide.specimens.previousPrice') }} </span>
          <UiNumericText :value="formatCurrency(product.previousPrice)" />
        </del>
      </p>
      <UiIconButton
        :icon="added ? 'ion:checkmark-outline' : 'ion:cart-outline'"
        :label="product.available ? t('home.actions.add', { product: t(product.nameKey) }) : t('guide.badges.danger')"
        :title="product.available ? t('home.actions.add', { product: t(product.nameKey) }) : t('guide.badges.danger')"
        :disabled="!product.available"
        class="home-product-add"
        variant="primary"
        @click="emit('add', product)"
      />
    </div>
    <p v-if="!product.available" class="home-product-stock">{{ t('guide.badges.danger') }}</p>
  </article>
</template>

