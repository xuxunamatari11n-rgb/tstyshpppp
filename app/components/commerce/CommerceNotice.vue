<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { notice } = useCommerce()
const motion = useStorefrontTransition(-12)
let timeout: ReturnType<typeof setTimeout> | undefined

function pause() { clearTimeout(timeout) }
function resume() {
  pause()
  if (notice.value) timeout = setTimeout(() => { notice.value = null }, 4300)
}

watch(notice, resume)
onBeforeUnmount(pause)
</script>

<template>
  <p class="sr-only" role="status" aria-live="polite" aria-atomic="true"><span v-if="notice" :key="notice.sequence">{{ t(notice.key) }}</span></p>
  <Transition v-bind="motion" :css="false">
    <aside v-if="notice" class="commerce-notice" @mouseenter="pause" @mouseleave="resume" @focusin="pause" @focusout="resume">
      <p>{{ t(notice.key) }}</p>
      <NuxtLink v-if="notice.cart" :to="localePath({ name: 'cart' })" class="commerce-text-link" @click="notice = null">
        {{ t('commerce.cart.view') }}
      </NuxtLink>
      <UiIconButton variant="ghost" icon="ion:close-outline" :label="t('commerce.close')" @click="notice = null" />
    </aside>
  </Transition>
</template>

