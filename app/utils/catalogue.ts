import type { LocationQuery, LocationQueryRaw, RouteLocationRaw } from 'vue-router'
import { storefrontSelections } from '~/mocks/storefront'
import type { ShopCategory } from '~/types/shop'
import type { CategoryId, CollectionId, CommercialProduct } from '~/types/commerce'
import { productAvailability } from '~/utils/product'

export const catalogueSorts = ['default', 'price-asc', 'price-desc', 'newest', 'bestsellers'] as const
export type CatalogueSort = typeof catalogueSorts[number]
export type CatalogueView = 'catalogue' | 'category' | 'search'

export interface CatalogueFilters {
  categories: CategoryId[]
  subcategory: string
  min: string
  max: string
  stock: boolean
  promo: boolean
  new: boolean
}

export interface CatalogueState extends CatalogueFilters {
  selection?: CollectionId
  sort: CatalogueSort
  q: string
  page: number
}

export const emptyCatalogueFilters = (): CatalogueFilters => ({
  categories: [], subcategory: '', min: '', max: '', stock: false, promo: false, new: false,
})

export function findCatalogueCategory(value: unknown, categories: ShopCategory[]) {
  return categories.find(category => category.id === value || category.slug === value)
}

function price(value: string) {
  const text = value.trim()
  if (!text) return undefined
  if (!/^[0-9]{1,16}$/.test(text)) return NaN
  const amount = Number(text)
  return Number.isSafeInteger(amount) ? amount : NaN
}

export function cataloguePriceRange(filters: Pick<CatalogueFilters, 'min' | 'max'>) {
  const min = price(filters.min)
  const max = price(filters.max)
  const error = Number.isNaN(min) || Number.isNaN(max) ? 'invalid'
    : min !== undefined && max !== undefined && min > max ? 'inverted' : undefined
  return { min, max, error } as const
}

export function normalizeCatalogueFilters(filters: CatalogueFilters, knownCategories: ShopCategory[]): CatalogueFilters {
  const categories = [...new Set(filters.categories)]
  const category = categories.length === 1 ? findCatalogueCategory(categories[0], knownCategories) : undefined
  const { min, max, error } = cataloguePriceRange(filters)
  return {
    ...filters,
    categories,
    subcategory: category?.subcategories.some(item => item.id === filters.subcategory) ? filters.subcategory : '',
    min: error === 'inverted' || min === undefined || Number.isNaN(min) ? '' : String(min),
    max: error === 'inverted' || max === undefined || Number.isNaN(max) ? '' : String(max),
  }
}

export function readCatalogueState(query: LocationQuery, knownCategories: ShopCategory[], categorySlug?: unknown): CatalogueState {
  const text = (key: string) => typeof query[key] === 'string' ? query[key] : ''
  const values = Array.isArray(query.category) ? query.category : [query.category]
  const category = findCatalogueCategory(categorySlug, knownCategories)
  const categories = category ? [category.id] : values.flatMap(value => {
    const match = findCatalogueCategory(value, knownCategories)
    return match ? [match.id] : []
  })
  const pageText = text('page')
  const page = /^[1-9][0-9]{0,8}$/.test(pageText) ? Math.min(10_000, Number(pageText)) : 1
  return {
    ...normalizeCatalogueFilters({
      categories, subcategory: text('subcategory'), min: text('min'), max: text('max'),
      stock: text('stock') === '1', promo: text('promo') === '1', new: text('new') === '1',
    }, knownCategories),
    selection: storefrontSelections.find(id => id === text('selection')),
    sort: catalogueSorts.find(id => id === text('sort')) ?? 'default',
    q: text('q').trim().slice(0, 100),
    page,
  }
}

export function catalogueLocation(view: CatalogueView, state: CatalogueState, knownCategories: ShopCategory[]): RouteLocationRaw {
  const category = view === 'category' && state.categories.length === 1
    ? findCatalogueCategory(state.categories[0], knownCategories) : undefined
  const categories = state.categories
  const query: LocationQueryRaw = {
    category: category || !categories.length ? undefined : categories.length === 1 ? categories[0] : categories,
    subcategory: state.subcategory || undefined,
    min: state.min || undefined, max: state.max || undefined,
    stock: state.stock ? '1' : undefined, promo: state.promo ? '1' : undefined, new: state.new ? '1' : undefined,
    selection: state.selection,
    sort: state.sort === 'default' ? undefined : state.sort,
    q: state.q || undefined,
    page: state.page > 1 ? state.page : undefined,
  }
  return category ? { name: 'category', params: { slug: category.slug }, query }
    : { name: view === 'search' ? 'search' : 'catalogue', query }
}

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ').trim()
}

export function searchTerms(query: string) {
  return normalizeSearch(query).split(' ').filter(Boolean)
}

export function matchesCatalogueText(text: string, terms: readonly string[]) {
  const normalized = normalizeSearch(text)
  return terms.every(term => normalized.includes(term))
}

export function cataloguePromotion(product: CommercialProduct) {
  return product.previousPrice !== undefined && product.previousPrice > product.price
}

export function filterCatalogueProducts(
  products: readonly CommercialProduct[],
  bestSellers: readonly string[],
  state: CatalogueState,
  searchText: (product: CommercialProduct) => string,
) {
  const terms = searchTerms(state.q)
  const { min, max } = cataloguePriceRange(state)
  const rank = new Map(bestSellers.map((id, index) => [id, index]))
  const matches = products.filter(product =>
    (!state.q || (terms.length > 0 && matchesCatalogueText(searchText(product), terms)))
    && (!state.categories.length || state.categories.includes(product.categoryId))
    && (!state.subcategory || state.subcategory === product.subcategoryId)
    && (min === undefined || product.price >= min)
    && (max === undefined || product.price <= max)
    && (!state.stock || productAvailability(product))
    && (!(state.promo || state.selection === 'promotions') || cataloguePromotion(product))
    && (!(state.new || state.selection === 'new') || product.newArrival)
    && (state.selection !== 'bestsellers' || rank.has(product.id)),
  )
  if (state.sort === 'price-asc') return matches.sort((a, b) => a.price - b.price)
  if (state.sort === 'price-desc') return matches.sort((a, b) => b.price - a.price)
  if (state.sort === 'newest') return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (state.sort === 'bestsellers' || state.selection === 'bestsellers') {
    return matches.sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity) || 0)
  }
  return matches
}
