import type { CartLineRequest, CommercialProduct } from '~/types/commerce'
import { productAvailability, productQuantityLimit } from '~/utils/product'
import { maxCartLines, maxCartQuantity } from '~~/shared/utils/commerceSelection'

export interface CartSelection extends CartLineRequest { referencePrice?: number }

export function cartQuantityLimit(product: CommercialProduct) {
  return Math.min(productQuantityLimit(product), maxCartQuantity)
}

export function cartLineStatus(line: CartLineRequest, product?: CommercialProduct) {
  if (!product) return 'missing'
  if (!productAvailability(product)) return 'unavailable'
  if (line.quantity > cartQuantityLimit(product)) return 'stock'
  return 'ready'
}

export function restoreCart(input: unknown) {
  const selections: CartSelection[] = []
  let adjusted = !Array.isArray(input)
  if (!Array.isArray(input)) return { selections, adjusted }

  const seen = new Set<string>()
  for (const value of input) {
    if (selections.length >= maxCartLines || typeof value?.productId !== 'string'
      || !/^[a-z0-9-]{1,120}$/i.test(value.productId) || seen.has(value.productId)
      || !Number.isSafeInteger(value.quantity) || value.quantity <= 0) {
      adjusted = true
      continue
    }
    const quantity = Math.min(value.quantity, maxCartQuantity)
    adjusted ||= quantity !== value.quantity
    const referencePrice = Number.isSafeInteger(value.referencePrice) && value.referencePrice >= 0 ? value.referencePrice : undefined
    selections.push({ productId: value.productId, quantity, referencePrice })
    seen.add(value.productId)
  }
  return { selections, adjusted }
}

