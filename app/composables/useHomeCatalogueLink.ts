import { storefrontCategories } from '~/mocks/storefront'
import type { CategoryId, CollectionId } from '~/types/commerce'

export function useHomeCatalogueLink() {
  const localePath = useLocalePath()
  return (filter?: { categoryId?: CategoryId; selection?: CollectionId }) => {
    const category = storefrontCategories.find(entry => entry.id === filter?.categoryId)
    return localePath({
      name: 'catalogue',
      query: { category: category?.slug, selection: filter?.selection },
    })
  }
}

