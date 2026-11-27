<script setup lang="ts">
import type { CommercialProduct } from '~/types/commerce'
import { productAvailability, productImages, productSavings } from '~/utils/product'

const props = defineProps<{ product: CommercialProduct }>()
const { t } = useI18n()
const { name } = useProductContent()
const formatPrice = useShopPrice()
const { categoryName } = useShopMeta()
const localePath = useLocalePath()
const { isFavorite, toggleFavorite } = useProductFavorites()
const photo = computed(() => productImages(props.product)[0])
const available = computed(() => productAvailability(props.product))
const discount = computed(() => {
  const savings = productSavings(props.product)
  return savings && props.product.previousPrice ? Math.round(savings / props.product.previousPrice * 100) : 0
})
const productLink = computed(() => localePath({ name: 'product', params: { slug: props.product.slug } }))
const cartLabel = computed(() => t(available.value ? 'catalogue.purchasePending' : 'product.outOfStock'))
</script>

<template>
  <article class="home-product" :class="{ 'home-product-unavailable': !available }" :data-product-slug="product.slug">
    <div class="home-product-photo" :class="{ 'home-product-cutout': photo?.cutout }">
      <NuxtLink :to="productLink" class="home-product-photo-link" :aria-label="name(product)">
        <ProductPhoto :image="photo" />
      </NuxtLink>
      <UiBadge v-if="discount" variant="discount" class="home-product-badge">
        <UiNumericText :value="t('home.discount', { percent: discount })" />
      </UiBadge>
      <UiIconButton
        :icon="isFavorite(product.id) ? 'ion:heart' : 'ion:heart-outline'"
        :label="t('home.actions.favorite', { product: name(product) })"
        :aria-pressed="isFavorite(product.id)"
        :title="t('home.actions.favorite', { product: name(product) })"
        variant="ghost"
        class="home-product-favorite"
        @click="toggleFavorite(product.id)"
      />
    </div>
    <p class="home-product-category">{{ categoryName(product.categoryId) }}</p>
    <h3 class="home-product-name"><NuxtLink :to="productLink">{{ name(product) }}</NuxtLink></h3>
    <p v-if="!available" class="home-product-stock">{{ t('product.outOfStock') }}</p>
    <div class="home-product-line">
      <p class="home-product-prices">
        <UiNumericText class="home-product-price" :value="formatPrice(product.price)" />
        <del v-if="discount && product.previousPrice" class="home-previous-price">
          <span class="sr-only">{{ t('guide.specimens.previousPrice') }} </span>
          <UiNumericText :value="formatPrice(product.previousPrice)" />
        </del>
      </p>
      <UiIconButton icon="ion:cart-outline" :label="cartLabel" :title="cartLabel" disabled class="home-product-add commercial-cart" variant="primary" />
    </div>
  </article>
</template>
