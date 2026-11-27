import type { Json } from '~~/shared/types/database'

export default defineEventHandler(event => {
  const query = getQuery(event)
  const text = (key: string, limit: number) => typeof query[key] === 'string' ? query[key].slice(0, limit) : undefined
  const categories = Array.isArray(query.categories) ? query.categories : [query.categories]
  const filters: Record<string, Json | undefined> = {
    categories: categories.filter((key): key is string => typeof key === 'string' && /^[A-Za-z][A-Za-z0-9-]{0,79}$/.test(key)).slice(0, 24),
    subcategory: text('subcategory', 80), min: text('min', 16), max: text('max', 16),
    stock: text('stock', 5), promo: text('promo', 5), new: text('new', 5),
    selection: text('selection', 12), sort: text('sort', 12), q: text('q', 100),
    slug: text('slug', 120), exclude: text('exclude', 120), limit: text('limit', 2), page: text('page', 5),
  }
  return loadShopProducts(event, shopLocale(query.locale), filters)
})
