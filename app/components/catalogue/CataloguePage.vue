<script setup lang="ts">
import type { CategoryId, CollectionId } from '~/types/commerce'
import {
  cataloguePriceRange, catalogueSorts, emptyCatalogueFilters, findCatalogueCategory,
  type CatalogueFilters, type CatalogueSort, type CatalogueState,
} from '~/utils/catalogue'

const { t } = useI18n()
const localePath = useLocalePath()
const { source: { data, status, error, refresh }, view, state, results, visible, clearState, to, commit, preview, setSort } = useCatalogue()
const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const category = computed(() => view.value === 'category' ? findCatalogueCategory(state.value.categories[0]) : undefined)
const heading = computed(() => {
  if (view.value === 'search') return t('storefront.search.results')
  if (category.value) return t(`storefront.categories.${category.value.id}`)
  if (state.value.selection) return t(`storefront.nav.${state.value.selection}`)
  return t('catalogue.allProducts')
})
const isCatalogueHome = computed(() => view.value === 'catalogue' && !state.value.selection)
const searchEmpty = computed(() => view.value === 'search' && !state.value.q)
const sortOptions = computed(() => catalogueSorts.map(value => ({ value, label: t(`catalogue.sorts.${value}`) })))
const grid = useTemplateRef('grid')
const motion = useCatalogueMotion()
useSeoMeta({ title: heading, robots: 'noindex, follow' })

type FilterDraft = CatalogueFilters & { selection?: CollectionId }
const draft = ref<FilterDraft>(emptyCatalogueFilters())
const filterSheet = useTemplateRef('filterSheet')
const sortSheet = useTemplateRef('sortSheet')
const filterId = useId()
const sortId = useId()
const draftError = computed(() => cataloguePriceRange(draft.value).error)
const draftCount = computed(() => preview(draft.value))

function pickCategory(id?: CategoryId) {
  const next = { ...state.value, categories: id ? [id] : [], subcategory: '', page: 1 }
  if (view.value === 'search') return to(next, 'search')
  return to(next, id ? 'category' : 'catalogue')
}

type FilterChip = { key: string; label: string; remove: Partial<CatalogueState> }
const chips = computed(() => {
  const value = state.value
  const filters: FilterChip[] = value.categories.map(id => ({
    key: id, label: t(`storefront.categories.${id}`),
    remove: { categories: value.categories.filter(category => category !== id), subcategory: '' },
  }))
  if (value.subcategory) filters.push({ key: 'subcategory', label: t(`storefront.subcategories.${value.subcategory}`), remove: { subcategory: '' } })
  if (value.min) filters.push({ key: 'min', label: t('catalogue.from', { price: formatCurrency(Number(value.min)) }), remove: { min: '' } })
  if (value.max) filters.push({ key: 'max', label: t('catalogue.upTo', { price: formatCurrency(Number(value.max)) }), remove: { max: '' } })
  if (value.stock) filters.push({ key: 'stock', label: t('catalogue.stock'), remove: { stock: false } })
  if (value.selection) {
    const selection = value.selection
    filters.push({
      key: 'selection', label: t(`storefront.nav.${selection}`),
      remove: { selection: undefined, promo: selection === 'promotions' ? false : value.promo, new: selection === 'new' ? false : value.new },
    })
  }
  if (value.promo && value.selection !== 'promotions') filters.push({ key: 'promo', label: t('storefront.nav.promotions'), remove: { promo: false } })
  if (value.new && value.selection !== 'new') filters.push({ key: 'new', label: t('storefront.nav.new'), remove: { new: false } })
  return filters
})
const hasNarrowingFilters = computed(() => chips.value.length > (category.value ? 1 : 0))
const emptyTitle = computed(() => {
  if (!data.value?.products.length) return t('catalogue.empty')
  if (hasNarrowingFilters.value) return t('catalogue.noFiltered')
  return t(view.value === 'search' ? 'catalogue.noSearch' : 'catalogue.noCategory')
})

function openFilters(event: MouseEvent) {
  const { sort: _sort, q: _q, page: _page, ...filters } = state.value
  draft.value = { ...filters, categories: [...filters.categories] }
  if (event.currentTarget instanceof HTMLElement) void filterSheet.value?.open(event.currentTarget)
}

function openSort(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLElement) void sortSheet.value?.open(event.currentTarget)
}

function applyDraft() {
  if (draftError.value) return
  filterSheet.value?.close()
  return commit({ ...draft.value, selection: draft.value.selection })
}

function applySort(sort: CatalogueSort) {
  sortSheet.value?.close()
  return setSort(sort)
}

function selectSort(value: string) {
  const sort = catalogueSorts.find(option => option === value)
  if (sort) return setSort(sort)
}

async function loadMore() {
  const firstNew = visible.value.length
  await commit({ page: state.value.page + 1 })
  await nextTick()
  grid.value?.$el?.children[firstNew]?.focus({ preventScroll: true })
}
</script>

<template>
  <UiContainer class="catalogue-page">
    <header class="catalogue-heading">
      <nav :aria-label="t('catalogue.breadcrumb')">
        <ol class="catalogue-breadcrumb">
          <li><NuxtLink :to="localePath({ name: 'index' })">{{ t('storefront.nav.home') }}</NuxtLink></li>
          <li v-if="!isCatalogueHome">
            <Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />
            <NuxtLink :to="localePath({ name: 'catalogue' })">{{ t('catalogue.shop') }}</NuxtLink>
          </li>
          <li aria-current="page">
            <Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />
            {{ isCatalogueHome ? t('catalogue.shop') : heading }}
          </li>
        </ol>
      </nav>
      <h1>{{ heading }}</h1>
      <p v-if="view === 'search' && state.q" class="catalogue-query">{{ t('storefront.search.query', { query: state.q }) }}</p>
      <p v-else-if="searchEmpty">{{ t('catalogue.searchPrompt') }}</p>
      <p v-if="!loading && !error && !searchEmpty" class="catalogue-heading-count">{{ t('catalogue.results', results.length) }}</p>
    </header>

    <CatalogueCategories :state="state" :link="pickCategory" />

    <div class="catalogue-layout">
      <aside class="catalogue-sidebar" :aria-label="t('catalogue.filters')">
        <div class="catalogue-sidebar-heading"><h2>{{ t('catalogue.filters') }}</h2></div>
        <CatalogueFilters :model-value="state" @update:model-value="commit($event)" />
        <UiButton variant="outline" :disabled="!chips.length" class="mt-4" @click="commit(clearState)">{{ t('catalogue.reset') }}</UiButton>
      </aside>

      <section class="catalogue-results" :aria-label="t('catalogue.resultsRegion')" :aria-busy="loading">
        <div class="catalogue-toolbar">
          <p role="status" aria-live="polite" class="catalogue-status">
            <template v-if="!loading && !error && !searchEmpty">{{ t('catalogue.results', results.length) }}</template>
          </p>
          <div class="catalogue-desktop-sort">
            <UiSelect :model-value="state.sort" :options="sortOptions" :label="t('catalogue.sort')" @update:model-value="selectSort" />
          </div>
          <div class="catalogue-mobile-controls">
            <button type="button" class="ui-button" data-variant="outline" aria-haspopup="dialog" :aria-controls="filterId" @click="openFilters">
              <Icon name="ion:options-outline" size="19" aria-hidden="true" />
              {{ t('catalogue.filters') }}<span v-if="chips.length" class="catalogue-filter-count">{{ chips.length }}</span>
            </button>
            <button type="button" class="ui-button" data-variant="outline" aria-haspopup="dialog" :aria-controls="sortId" @click="openSort">
              <Icon name="ion:swap-vertical-outline" size="19" aria-hidden="true" />
              {{ t('catalogue.sort') }}
            </button>
          </div>
        </div>

        <div v-if="chips.length" class="catalogue-applied">
          <TransitionGroup v-bind="motion" :css="false" tag="ul" class="catalogue-chip-list" :aria-label="t('catalogue.applied')">
            <li v-for="chip in chips" :key="chip.key">
              <button :aria-label="t('catalogue.remove', { filter: chip.label })" class="catalogue-chip" type="button" @click="commit(chip.remove)">
                {{ chip.label }} <Icon name="ion:close-outline" size="16" aria-hidden="true" />
              </button>
            </li>
          </TransitionGroup>
          <button class="catalogue-reset" type="button" @click="commit(clearState)">{{ t('catalogue.reset') }}</button>
        </div>

        <ul v-if="loading" class="catalogue-grid" :aria-label="t('catalogue.loading')">
          <li v-for="placeholder in 6" :key="placeholder" aria-hidden="true">
            <UiSkeleton class="catalogue-skeleton-photo" />
            <UiSkeleton class="mt-3 w-2/3" />
            <UiSkeleton class="mt-2 w-1/3" />
          </li>
        </ul>
        <UiEmptyState v-else-if="error" as="h2" :title="t('catalogue.error')" :description="t('catalogue.errorHint')" icon="ion:alert-circle-outline">
          <template #action><UiButton variant="outline" @click="refresh()">{{ t('catalogue.retry') }}</UiButton></template>
        </UiEmptyState>
        <UiEmptyState v-else-if="searchEmpty" as="h2" :title="t('catalogue.searchPrompt')" icon="ion:search-outline">
          <template #action><NuxtLink class="ui-button" data-variant="outline" :to="localePath({ name: 'catalogue' })">{{ t('catalogue.browse') }}</NuxtLink></template>
        </UiEmptyState>
        <UiEmptyState v-else-if="!results.length" as="h2"
          :title="emptyTitle"
          :description="t(view === 'search' ? 'storefront.search.retry' : 'catalogue.emptyHint')"
        >
          <template #action>
            <UiButton v-if="hasNarrowingFilters" variant="outline" @click="commit(clearState)">{{ t('catalogue.reset') }}</UiButton>
            <NuxtLink v-else class="ui-button" data-variant="outline" :to="localePath({ name: 'catalogue' })">
              {{ t(view === 'search' ? 'catalogue.clearSearch' : 'catalogue.browse') }}
            </NuxtLink>
          </template>
        </UiEmptyState>
        <template v-else>
          <TransitionGroup ref="grid" v-bind="motion" :css="false" tag="ul" class="catalogue-grid">
            <li v-for="product in visible" :key="product.id" tabindex="-1">
              <HomeProductCard :product="product" />
            </li>
          </TransitionGroup>
          <div class="catalogue-pagination">
            <p role="status">{{ t('catalogue.visible', { shown: visible.length, total: results.length }) }}</p>
            <UiButton v-if="visible.length < results.length" variant="outline" @click="loadMore">
              {{ t('catalogue.loadMore') }} <Icon name="ion:chevron-down-outline" size="17" aria-hidden="true" />
            </UiButton>
            <p v-else class="text-xs">{{ t('catalogue.end') }}</p>
          </div>
        </template>
      </section>
    </div>

    <CatalogueSheet :id="filterId" ref="filterSheet" :title="t('catalogue.filters')">
      <CatalogueFilters v-model="draft" draft />
      <template #footer>
        <UiButton variant="outline" @click="draft = emptyCatalogueFilters()">{{ t('catalogue.reset') }}</UiButton>
        <UiButton variant="primary" :disabled="Boolean(draftError)" @click="applyDraft">{{ t('catalogue.apply', draftCount) }}</UiButton>
      </template>
    </CatalogueSheet>
    <CatalogueSheet :id="sortId" ref="sortSheet" :title="t('catalogue.sort')">
      <ul class="catalogue-sort-options">
        <li v-for="option in catalogueSorts" :key="option">
          <button type="button" :aria-pressed="state.sort === option" @click="applySort(option)">
            {{ t(`catalogue.sorts.${option}`) }}
            <Icon v-if="state.sort === option" name="ion:checkmark-outline" size="20" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </CatalogueSheet>
  </UiContainer>
</template>
