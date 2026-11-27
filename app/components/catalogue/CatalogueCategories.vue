<script setup lang="ts">
import type { CatalogueState } from '~/utils/catalogue'
import type { CategoryId } from '~/types/commerce'

const props = defineProps<{ state: CatalogueState; link: (id?: CategoryId) => string }>()
const { t } = useI18n()
const { categories } = useShopMeta()
const list = useTemplateRef('list')
const before = ref(false)
const after = ref(false)
let observer: ResizeObserver | undefined

function updateEdges() {
  const element = list.value
  if (!element) return
  before.value = element.scrollLeft > 2
  after.value = element.scrollWidth - element.clientWidth - element.scrollLeft > 2
}

onMounted(() => {
  if (!list.value) return
  updateEdges()
  observer = new ResizeObserver(updateEdges)
  observer.observe(list.value)
  list.value.querySelectorAll('li').forEach(item => observer?.observe(item))
})
onBeforeUnmount(() => observer?.disconnect())

function selected(id: CategoryId) {
  return props.state.categories.includes(id)
}
</script>

<template>
  <nav class="catalogue-categories" :aria-label="t('catalogue.categories')" :data-before="before" :data-after="after">
    <ul ref="list" class="catalogue-category-list" @scroll.passive="updateEdges">
      <li>
        <NuxtLink :to="link()" class="catalogue-category-link" :data-active="!state.categories.length" :aria-current="!state.categories.length ? 'true' : undefined">
          <span class="catalogue-thumb"><Icon name="ion:grid-outline" size="18" aria-hidden="true" /></span>
          {{ t('catalogue.allProducts') }}
        </NuxtLink>
      </li>
      <li v-for="category in categories" :key="category.id">
        <NuxtLink
          :to="link(category.id)"
          class="catalogue-category-link"
          :data-active="selected(category.id)"
          :aria-current="state.categories.length === 1 && selected(category.id) ? 'true' : undefined"
          :aria-label="state.categories.length > 1 && selected(category.id) ? t('catalogue.selectedCategory', { category: category.name }) : undefined"
        >
          <span class="catalogue-thumb">
            <img v-if="category.image" :src="category.image.src" alt="" width="34" height="34" loading="lazy">
            <Icon v-else name="ion:grid-outline" size="17" aria-hidden="true" />
          </span>
          {{ category.name }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
