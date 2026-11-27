<script setup lang="ts">
import type { CommercialImage } from '~/types/commerce'

const props = defineProps<{ image?: CommercialImage; priority?: boolean; thumbnail?: boolean }>()
const emit = defineEmits<{ failed: [] }>()
const { t } = useI18n()
const { photoAlt } = useProductContent()
const failed = ref(false)
watch(() => props.image?.src, () => { failed.value = false })

function onError() {
  failed.value = true
  emit('failed')
}
</script>

<template>
  <img
    v-if="image && !failed"
    :src="image.src"
    :width="image.width"
    :height="image.height"
    :alt="thumbnail ? '' : photoAlt(image)"
    :class="{ 'product-photo-cutout': image.cutout && !thumbnail }"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    decoding="async"
    @error="onError"
  >
  <span v-else class="product-photo-fallback" :aria-hidden="thumbnail || undefined">
    <Icon name="ion:image-outline" size="28" aria-hidden="true" />
    <span v-if="!thumbnail">{{ t('product.imageUnavailable') }}</span>
  </span>
</template>
