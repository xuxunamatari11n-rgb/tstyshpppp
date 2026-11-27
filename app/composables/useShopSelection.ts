import type { CommercialProduct } from '~/types/commerce'
import { selectionBatchSize, uuidPattern } from '~~/shared/utils/commerceSelection'

export function useShopSelection() {
  const { locale } = useI18n()
  const mock = useShopMockMode()
  return async (ids: readonly string[], signal?: AbortSignal): Promise<CommercialProduct[]> => {
    const unique = [...new Set(ids)]
    if (!unique.length) return []
    if (mock) {
      const { homeProducts } = await import('~/mocks/home')
      return homeProducts.filter(product => unique.includes(product.id))
    }
    const visibleIds = unique.filter(id => uuidPattern.test(id))
    const language = locale.value
    const batches = Array.from({ length: Math.ceil(visibleIds.length / selectionBatchSize) }, (_, i) =>
      visibleIds.slice(i * selectionBatchSize, (i + 1) * selectionBatchSize))
    const products: CommercialProduct[] = []
    // Run at most two bounded catalogue requests at once for long favorites lists.
    for (let offset = 0; offset < batches.length; offset += 2) {
      const results = await Promise.all(batches.slice(offset, offset + 2).map(batch =>
        $fetch<CommercialProduct[]>('/api/shop/selection', { query: { ids: batch.join(','), locale: language }, signal })))
      products.push(...results.flat())
    }
    return products
  }
}

