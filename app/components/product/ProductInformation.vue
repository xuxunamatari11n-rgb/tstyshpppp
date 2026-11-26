<script setup lang="ts">
import type { CommercialProduct } from '~/types/commerce'
const props = defineProps<{ product: CommercialProduct }>()
const { t } = useI18n()
const sections = computed(() => [
  ...(props.product.fullDescriptionKey ? [{ id: 'description', icon: 'ion:document-text-outline', text: t(props.product.fullDescriptionKey) }] : []),
  ...(props.product.specifications?.length ? [{ id: 'specifications', icon: 'ion:list-outline', text: '' }] : []),
  ...(props.product.deliveryKey ? [{ id: 'delivery', icon: 'ion:cube-outline', text: t(props.product.deliveryKey) }] : []),
  { id: 'support', icon: 'ion:headset-outline', text: '' },
])
</script>

<template>
  <section class="product-information" :aria-label="t('product.moreInformation')">
    <details v-for="section in sections" :key="section.id" class="product-information-group">
      <summary>
        <Icon :name="section.icon" size="20" aria-hidden="true" />
        <span>{{ t(`product.info.${section.id}`) }}</span>
        <Icon name="ion:chevron-down-outline" size="18" aria-hidden="true" />
      </summary>
      <div class="product-information-content">
        <dl v-if="section.id === 'specifications'">
          <div v-for="item in product.specifications" :key="item.labelKey">
            <dt>{{ t(item.labelKey) }}</dt><dd>{{ t(item.valueKey) }}</dd>
          </div>
        </dl>
        <a v-else-if="section.id === 'support'" class="product-help-link" href="#storefront-assistance">{{ t('product.assistance') }}</a>
        <p v-else>{{ section.text }}</p>
      </div>
    </details>
  </section>
</template>
