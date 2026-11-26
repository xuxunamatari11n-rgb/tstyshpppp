import type { Ref } from 'vue'
import { popularSearches, storefrontCategories } from '~/mocks/storefront'
import { homeProducts } from '~/mocks/home'

const recentSearchesKey = 'storefront-recent-searches'

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
}

export function useStorefrontSearchResults(query: Ref<string>) {
  const { t } = useI18n()
  const matches = (label: string, terms: string[]) => {
    const normalized = normalizeSearch(label)
    return terms.every(term => normalized.includes(term))
  }

  return computed(() => {
    const terms = normalizeSearch(query.value).split(' ').filter(Boolean)
    const categories = storefrontCategories.map(category => ({
      ...category,
      label: t(`storefront.categories.${category.id}`),
      keywords: category.subcategories.map(id => t(`storefront.subcategories.${id}`)).join(' '),
    }))
    const products = homeProducts.map(product => ({
      ...product,
      label: t(product.nameKey),
    }))

    return {
      categories: terms.length ? categories.filter(category => matches(`${category.label} ${category.keywords}`, terms)) : categories.slice(0, 4),
      products: terms.length ? products.filter(product => {
        const category = categories.find(entry => entry.id === product.categoryId)
        return matches(`${product.label} ${category?.label ?? ''}`, terms)
      }) : products.slice(0, 3),
      popular: popularSearches.map(id => t(`storefront.popular.${id}`)),
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

