import type { CommercialProduct } from '~/types/commerce'

export function findProductBySlug(products: readonly CommercialProduct[], slug: unknown) {
  if (typeof slug !== 'string' || slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return
  return products.find(product => product.slug === slug)
}

export function productImages(product: CommercialProduct) {
  return product.images.filter(image => image.src.trim() && image.width > 0 && image.height > 0)
}

export function productAvailability(product: CommercialProduct) {
  return product.available && (product.stockQuantity === undefined || product.stockQuantity >= 1)
}

export function productSavings(product: CommercialProduct) {
  const previous = product.previousPrice ?? 0
  return previous > product.price ? previous - product.price : 0
}

export function productQuantityLimit(product: CommercialProduct) {
  const safeLimit = Math.floor(Number.MAX_SAFE_INTEGER / Math.max(1, product.price))
  return Math.max(1, Math.min(safeLimit, Math.floor(product.stockQuantity ?? safeLimit)))
}

export function relatedProducts(products: readonly CommercialProduct[], product: CommercialProduct) {
  const candidates = products.filter(candidate => candidate.id !== product.id)
  const selected = product.relatedProductIds?.length
    ? [...new Set(product.relatedProductIds)].flatMap(id => {
      const candidate = candidates.find(item => item.id === id)
      return candidate ? [candidate] : []
    }) : []
  return (selected.length ? selected : candidates.filter(item => item.categoryId === product.categoryId)).slice(0, 4)
}
