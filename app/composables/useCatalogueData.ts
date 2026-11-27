import type { MaybeRefOrGetter } from 'vue'
import type { ShopProducts } from '~/types/shop'
import { emptyCatalogueFilters, filterCatalogueProducts, type CatalogueState } from '~/utils/catalogue'

export type ShopProductQuery = Partial<CatalogueState> & { slug?: string; exclude?: string; limit?: number }

export function useCatalogueData(query: MaybeRefOrGetter<ShopProductQuery>) {
  const { locale, t } = useI18n()
  const mock = useShopMockMode()

  async function get(filters: ShopProductQuery, signal?: AbortSignal): Promise<ShopProducts> {
    if (mock) {
      const { homeProducts, homeCollections } = await import('~/mocks/home')
      const ranking = homeCollections.find(collection => collection.id === 'bestsellers')?.productIds ?? []
      const state = { ...emptyCatalogueFilters(), page: 1, q: '', sort: 'default', ...filters } satisfies CatalogueState
      const items = filterCatalogueProducts(homeProducts.filter(product =>
        (!filters.slug || product.slug === filters.slug) && (!filters.exclude || product.slug !== filters.exclude)),
      ranking, state, product => [t(product.nameKey), t(product.descriptionKey), t(`storefront.categories.${product.categoryId}`),
        product.subcategoryId ? t(`storefront.subcategories.${product.subcategoryId}`) : ''].join(' '))
      const limit = filters.limit ?? 6
      const offset = (state.page - 1) * limit
      return { products: items.slice(offset, offset + limit), total: items.length }
    }
    return $fetch<ShopProducts>('/api/shop/products', { query: { ...filters, locale: locale.value }, signal })
  }

  const source = useAsyncData(computed(() => `shop-products-${locale.value}-${JSON.stringify(toValue(query))}`),
    (_, { signal }) => get(toValue(query), signal), { lazy: true })
  return Object.assign(source, { get })
}
