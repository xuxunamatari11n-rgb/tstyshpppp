<script setup lang="ts">
defineProps<{ favorite: boolean }>()
const emit = defineEmits<{ favorite: [event: MouseEvent]; share: [] }>()
const { t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()
const routeBaseName = useRouteBaseName()
const discovery = new Set(['index', 'catalogue', 'category', 'search', 'product'])

function goBack(event: MouseEvent) {
  if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return false
  const previous = window.history.state?.back
  if (typeof previous !== 'string' || !previous.startsWith('/') || previous.startsWith('//')) return false
  const name = routeBaseName(router.resolve(previous))
  if (typeof name !== 'string' || !discovery.has(name)) return false
  event.preventDefault()
  router.back()
  return true
}
</script>

<template>
  <UiContainer class="product-mobile-header lg:hidden">
    <NuxtLink :to="localePath({ name: 'catalogue' })" custom v-slot="{ href, navigate }">
      <a :href="href ?? undefined" class="storefront-mobile-utility" :aria-label="t('product.back')"
        @click="goBack($event) || navigate($event)">
        <Icon name="ion:arrow-back-outline" size="22" aria-hidden="true" />
      </a>
    </NuxtLink>
    <span class="product-mobile-header-title">{{ t('product.details') }}</span>
    <div class="flex items-center">
      <UiIconButton class="product-mobile-favorite" variant="ghost" :icon="favorite ? 'ion:heart' : 'ion:heart-outline'" :aria-pressed="favorite"
        :label="t('product.favorite')" @click="emit('favorite', $event)" />
      <UiIconButton variant="ghost" icon="ion:share-social-outline" :label="t('product.share')" @click="emit('share')" />
    </div>
  </UiContainer>
</template>
