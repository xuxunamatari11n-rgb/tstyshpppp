import { homeCollections, homeProducts } from '~/mocks/home'
import type { CommercialProduct } from '~/types/commerce'

async function loadCatalogue() {
  const bestSellers = homeCollections.find(collection => collection.id === 'bestsellers')?.productIds ?? []
  return { products: homeProducts, bestSellers }
}

export function useCatalogueData() {
  return useAsyncData('storefront-catalogue', loadCatalogue, { lazy: true })
}

export function useCatalogueProductText() {
  const { t } = useI18n()
  return (product: CommercialProduct) => [
    t(product.nameKey), t(product.descriptionKey), t(`storefront.categories.${product.categoryId}`),
    product.subcategoryId ? t(`storefront.subcategories.${product.subcategoryId}`) : '',
  ].join(' ')
}
