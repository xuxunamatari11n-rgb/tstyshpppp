import type { Ref } from 'vue'
import { suggestedSearches } from '~/mocks/storefront'
import { matchesCatalogueText, normalizeSearch, searchTerms } from '~/utils/catalogue'

const recentSearchesKey = 'storefront-recent-searches'

export function useStorefrontSearchResults(query: Ref<string>) {
  const { t } = useI18n()
  const { categories } = useShopMeta()
  const { name } = useProductContent()
  const term = ref(query.value)
  watch(query, (value, _previous, onCleanup) => {
    const timer = setTimeout(() => { term.value = value }, 180)
    onCleanup(() => clearTimeout(timer))
  })
  const { data } = useCatalogueData(computed(() => ({ q: term.value.trim(), limit: term.value.trim() ? 5 : 3 })))

  return computed(() => {
    const terms = searchTerms(query.value)
    const hasQuery = Boolean(query.value.trim())
    const matches = categories.value.filter(category => !hasQuery || (terms.length
      && matchesCatalogueText([category.name, category.description, ...category.subcategories.map(item => item.name)].join(' '), terms)))
    return {
      categories: matches.slice(0, hasQuery ? 5 : 4).map(category => ({ ...category, label: category.name })),
      products: term.value === query.value ? (data.value?.products ?? []).map(product => ({
        id: product.id, slug: product.slug, label: name(product),
      })) : [],
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

