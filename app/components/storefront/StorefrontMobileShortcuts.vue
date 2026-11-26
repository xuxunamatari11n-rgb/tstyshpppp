<script setup lang="ts">
const { t } = useI18n()
const catalogue = useHomeCatalogueLink()
const route = useRoute()
const routeBaseName = useRouteBaseName()
const list = useTemplateRef('list')
const more = ref(false)
const before = ref(false)
let observer: ResizeObserver | undefined
const shortcuts = [
  { label: 'allCategories', selection: undefined, icon: 'ion:grid-outline' },
  { label: 'new', selection: 'new', icon: 'ion:sparkles-outline' },
  { label: 'promotions', selection: 'promotions', icon: 'ion:pricetag-outline' },
  { label: 'bestsellers', selection: 'bestsellers', icon: 'ion:trending-up-outline' },
] as const

function isActive(selection?: string) {
  return routeBaseName(route) === 'catalogue' && route.query.selection === selection && !route.query.category
}

function updateContinuation() {
  const element = list.value
  more.value = Boolean(element && element.scrollWidth - element.clientWidth - element.scrollLeft > 3)
  before.value = Boolean(element && element.scrollLeft > 3)
}

onMounted(() => {
  if (!list.value) return
  updateContinuation()
  observer = new ResizeObserver(updateContinuation)
  observer.observe(list.value)
  list.value.querySelectorAll('li').forEach(item => observer?.observe(item))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav :aria-label="t('storefront.nav.commercial')" class="storefront-mobile-shortcuts" :data-more="more" :data-before="before">
    <ul ref="list" class="storefront-shortcut-list" @scroll.passive="updateContinuation">
      <li v-for="item in shortcuts" :key="item.label">
        <NuxtLink
          :to="catalogue({ selection: item.selection })"
          :aria-current="isActive(item.selection) ? 'page' : undefined"
          :data-shortcut="item.label"
          class="storefront-shortcut"
        >
          <Icon :name="item.icon" size="18" aria-hidden="true" />
          {{ t(`storefront.nav.${item.label}`) }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
