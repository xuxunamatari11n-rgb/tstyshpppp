import type { Ref } from 'vue'
import { suggestedSearches, storefrontCategories } from '~/mocks/storefront'
import { matchesCatalogueText, normalizeSearch, searchTerms } from '~/utils/catalogue'

const recentSearchesKey = 'storefront-recent-searches'

export function useStorefrontSearchResults(query: Ref<string>) {
  const { t } = useI18n()
  const { data } = useCatalogueData()
  const productText = useCatalogueProductText()

  return computed(() => {
    const terms = searchTerms(query.value)
    const hasQuery = Boolean(query.value.trim())
    const categories = storefrontCategories.map(category => ({
      ...category,
      label: t(`storefront.categories.${category.id}`),
      keywords: category.subcategories.map(id => t(`storefront.subcategories.${id}`)).join(' '),
    }))
    const products = data.value?.products ?? []
    const matchingProducts = hasQuery
      ? products.filter(product => terms.length && matchesCatalogueText(productText(product), terms)) : products

    return {
      categories: hasQuery
        ? categories.filter(category => terms.length && matchesCatalogueText(`${category.label} ${category.keywords}`, terms)).slice(0, 5)
        : categories.slice(0, 4),
      products: matchingProducts.slice(0, hasQuery ? 5 : 3).map(product => ({ id: product.id, slug: product.slug, label: t(product.nameKey) })),
      suggested: suggestedSearches.map(id => t(`storefront.popular.${id}`)),
    }
  })
}

export function useStorefrontSearch() {
  const route = useRoute()
  const localePath = useLocalePath()
  const recents = useState<string[]>(recentSearchesKey, () => [])
  const query = ref('')

  watch(() => route.fullPath, () => {
    query.value = typeof route.query.q === 'string' ? route.query.q : ''
  }, { immediate: true })

  onMounted(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(recentSearchesKey) ?? '[]')
      if (Array.isArray(saved)) {
        recents.value = saved.filter((term): term is string => typeof term === 'string' && term.trim().length > 0 && term.length <= 100).slice(0, 5)
      }
    } catch {
      // Search remains available when browser storage is unavailable.
    }
  })

  async function submit(value: string) {
    const term = value.trim().slice(0, 100)
    if (!term) return
    const normalized = normalizeSearch(term)
    recents.value = [term, ...recents.value.filter(previous => normalizeSearch(previous) !== normalized)].slice(0, 5)
    try {
      sessionStorage.setItem(recentSearchesKey, JSON.stringify(recents.value))
    } catch {
      // The in-memory history is enough for navigation within the current page session.
    }
    await navigateTo(localePath({ name: 'search', query: { q: term } }))
  }

  return { query, recents, submit }
}

