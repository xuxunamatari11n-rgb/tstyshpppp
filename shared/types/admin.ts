import type { ShopRow } from '~~/shared/types/database'

export type AdminLocale = 'fr' | 'es'
export type AdminText = Record<AdminLocale, string>
export type AdminProductText = {
  locale: AdminLocale; name: string; short_description: string; full_description: string
  keywords: string[]; seo_title: string; seo_description: string
}
export type AdminImage = {
  storage_path: string; src?: string; alt: AdminText; width: number; height: number; is_cutout: boolean
}
export type AdminSpecification = { label: AdminText; value: AdminText }
export type AdminProduct = {
  id?: string; updated_at?: string; published_at?: string | null; is_public?: boolean
  slug: string; sku: string | null; category_id: string; price: number; comparison_price: number | null
  stock_quantity: number | null; is_available: boolean; is_visible: boolean; is_featured: boolean
  is_new_arrival: boolean; bestseller_rank: number | null; sort_order: number
  translations: AdminProductText[]; images: AdminImage[]; specifications: AdminSpecification[]
}
export type AdminProductRow = ShopRow<'products'> & {
  is_public: boolean; category_public: boolean; available: boolean; name_fr: string | null
  name_es: string | null; french: boolean; spanish: boolean; thumbnail: string | null; src?: string
}
export type AdminProductPage = {
  total: number; products: AdminProductRow[]
  counts: Record<'total' | 'public' | 'hidden' | 'unavailable' | 'categories' | 'publicCategories', number> | null
}
export type AdminCategoryText = { locale: AdminLocale; name: string; description: string; image_alt: string }
export type AdminCategory = {
  id?: string; updated_at?: string; stable_key?: string; effective?: boolean; product_count?: number; child_count?: number
  parent_id: string | null; slug: string; image_path: string | null; src?: string
  is_visible: boolean; is_featured: boolean; sort_order: number; translations: AdminCategoryText[]
}
export type AdminSettings = {
  store_name: string; whatsapp_number: string | null; support_email: string | null; currency_symbol: string
  announcement: AdminText; support_information: AdminText; is_open: boolean; updated_at?: string
}
export type AdminBucket = 'product-images' | 'category-images'
export const adminImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const adminImageLimit = 4 * 1024 * 1024

export function adminLocalized(value: unknown): AdminText {
  const entry = value as Partial<AdminText> | null | undefined
  return { fr: entry?.fr ?? '', es: entry?.es ?? '' }
}
