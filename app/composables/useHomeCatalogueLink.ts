import type { CategoryId, CollectionId } from '~/types/commerce'

export function useHomeCatalogueLink() {
  const localePath = useLocalePath()
  const { categories } = useShopMeta()
  return (filter?: { categoryId?: CategoryId; selection?: CollectionId; subcategory?: string }) => {
    const category = categories.value.find(entry => entry.id === filter?.categoryId)
    const query = { selection: filter?.selection, subcategory: filter?.subcategory }
    return localePath(category
      ? { name: 'category', params: { slug: category.slug }, query }
      : { name: 'catalogue', query })
  }
}

