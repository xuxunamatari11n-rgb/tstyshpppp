<script setup lang="ts">
defineProps<{ max: number; disabled?: boolean }>()
const value = defineModel<number>({ required: true })
const { t } = useI18n()
</script>

<template>
  <div class="product-quantity">
    <span class="product-quantity-label">{{ t('product.quantity') }}</span>
    <div class="product-quantity-controls" role="group" :aria-label="t('product.quantity')">
      <UiIconButton type="button" variant="ghost" icon="ion:remove-outline" :label="t('product.decrease')"
        :disabled="disabled || value <= 1" @click="value--" />
      <output aria-live="polite" aria-atomic="true" :aria-label="t('product.quantity')" class="product-quantity-value">{{ value }}</output>
      <UiIconButton type="button" variant="ghost" icon="ion:add-outline" :label="t('product.increase')"
        :disabled="disabled || value >= max" @click="value++" />
    </div>
  </div>
</template>
