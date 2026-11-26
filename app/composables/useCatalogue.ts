import {
  catalogueLocation, emptyCatalogueFilters, filterCatalogueProducts, normalizeCatalogueFilters, readCatalogueState,
  type CatalogueFilters, type CatalogueSort, type CatalogueState, type CatalogueView,
} from '~/utils/catalogue'

const pageSize = 6

export function useCatalogue() {
  const route = useRoute()
  const routeBaseName = useRouteBaseName()
  const localePath = useLocalePath()
  const source = useCatalogueData()
  const searchText = useCatalogueProductText()
  const view = computed<CatalogueView>(() => {
    const name = routeBaseName(route)
    return name === 'category' || name === 'search' ? name : 'catalogue'
  })
  const state = computed(() => readCatalogueState(route.query, view.value === 'category' ? route.params.slug : undefined))
  const match = (filters: CatalogueState) => filterCatalogueProducts(
    source.data.value?.products ?? [], source.data.value?.bestSellers ?? [], filters, searchText,
  )
  const results = computed(() => match(state.value))
  const visible = computed(() => results.value.slice(0, state.value.page * pageSize))
  const clearState = computed<CatalogueState>(() => ({
    ...state.value, ...emptyCatalogueFilters(), selection: undefined, page: 1,
  }))

  function to(next: CatalogueState, target = view.value) {
    return localePath(catalogueLocation(target, next))
  }

  function commit(patch: Partial<CatalogueState>, target = view.value) {
    const next = { ...state.value, page: 1, ...patch }
    return navigateTo(to({ ...next, ...normalizeCatalogueFilters(next) }, target))
  }

  function preview(filters: CatalogueFilters & Pick<CatalogueState, 'selection'>) {
    return match({ ...state.value, ...normalizeCatalogueFilters(filters), selection: filters.selection }).length
  }

  function setSort(sort: CatalogueSort) {
    if (sort !== state.value.sort) return commit({ sort })
  }

  return { source, view, state, results, visible, clearState, to, commit, preview, setSort }
}
