const pages = new Set(['regie-products', 'regie-products-new', 'regie-categories', 'regie-customers', 'regie-settings'])
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i

export function regieReturnQuery(next: unknown, product: unknown): { next?: string; product?: string } {
  if (next === 'regie-products-edit' && typeof product === 'string' && uuid.test(product)) return { next, product }
  if (typeof next === 'string' && pages.has(next)) return { next }
  return {}
}

export function regieDestination(next: unknown, product: unknown) {
  const match = regieReturnQuery(next, product)
  return match.product ? { name: 'regie-products-edit', params: { id: match.product } } : { name: match.next ?? 'shop-admin' }
}

