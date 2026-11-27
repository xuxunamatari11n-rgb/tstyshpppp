import {
  catalogueLocation, emptyCatalogueFilters, findCatalogueCategory, normalizeCatalogueFilters, readCatalogueState,
  type CatalogueFilters, type CatalogueSort, type CatalogueState, type CatalogueView,
} from '~/utils/catalogue'

export const cataloguePageSize = 6

export function useCatalogue() {
  const route = useRoute()
  const routeBaseName = useRouteBaseName()
  const localePath = useLocalePath()
  const { data: meta, categories } = useShopMeta()
  const view = computed<CatalogueView>(() => {
    const name = routeBaseName(route)
    return name === 'category' || name === 'search' ? name : 'catalogue'
  })
  const category = computed(() => view.value === 'category' ? findCatalogueCategory(route.params.slug, categories.value) : undefined)
  const invalidCategory = computed(() => Boolean(meta.value && view.value === 'category' && !category.value))
  const state = computed(() => readCatalogueState(route.query, categories.value, category.value?.slug))
  const source = useCatalogueData(computed(() => ({
    ...state.value, limit: cataloguePageSize, slug: invalidCategory.value ? '~' : undefined,
  })))
  const visible = computed(() => source.data.value?.products ?? [])
  const total = computed(() => source.data.value?.total ?? 0)
  const clearState = computed<CatalogueState>(() => ({
    ...state.value, ...emptyCatalogueFilters(), selection: undefined, page: 1,
  }))

  function to(next: CatalogueState, target = view.value) {
    return localePath(catalogueLocation(target, next, categories.value))
  }

  function commit(patch: Partial<CatalogueState>, target = view.value) {
    const next = { ...state.value, page: 1, ...patch }
    return navigateTo(to({ ...next, ...normalizeCatalogueFilters(next, categories.value) }, target))
  }

  async function preview(filters: CatalogueFilters & Pick<CatalogueState, 'selection'>, signal?: AbortSignal) {
    const result = await source.get({ ...state.value, ...normalizeCatalogueFilters(filters, categories.value),
      selection: filters.selection, page: 1, limit: 0 }, signal)
    return result.total
  }

  function setSort(sort: CatalogueSort) {
    if (sort !== state.value.sort) return commit({ sort })
  }

  return { source, view, category, invalidCategory, state, total, visible, clearState, to, commit, preview, setSort }
}
