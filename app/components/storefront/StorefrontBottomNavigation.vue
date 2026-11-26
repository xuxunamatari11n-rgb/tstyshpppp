<script setup lang="ts">
const { t } = useI18n()
const destinationPath = useStorefrontDestination()
const route = useRoute()
const routeBaseName = useRouteBaseName()
const current = computed(() => routeBaseName(route))
const destinations = [
  { name: 'index', label: 'home', normal: 'ion:home-outline', active: 'ion:home' },
  { name: 'catalogue', label: 'explore', normal: 'ion:compass-outline', active: 'ion:compass' },
  { name: 'favorites', label: 'favorites', normal: 'ion:heart-outline', active: 'ion:heart' },
  { name: 'cart', label: 'cart', normal: 'ion:cart-outline', active: 'ion:cart' },
  { name: 'account', label: 'account', normal: 'ion:person-outline', active: 'ion:person' },
] as const

function isActive(name: typeof destinations[number]['name']) {
  return current.value === name || (name === 'catalogue' && current.value === 'search')
}
</script>

<template>
  <nav :aria-label="t('storefront.nav.mobile')" class="storefront-bottom-nav lg:hidden">
    <ul class="mx-auto grid max-w-[var(--content-max)] grid-cols-5">
      <li v-for="destination in destinations" :key="destination.name" class="min-w-0">
        <NuxtLink
          :to="destinationPath(destination.name)"
          :aria-disabled="!destinationPath(destination.name) || undefined"
          :aria-current="isActive(destination.name) ? (current === destination.name ? 'page' : 'location') : undefined"
          class="storefront-bottom-link"
        >
          <span class="storefront-bottom-icon">
            <Icon :name="isActive(destination.name) ? destination.active : destination.normal" size="22" aria-hidden="true" />
          </span>
          <span>{{ t(`storefront.nav.${destination.label}`) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

