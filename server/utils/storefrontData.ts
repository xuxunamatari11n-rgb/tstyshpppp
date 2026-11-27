import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import type { Database, Json, ShopLocale, ShopRow } from '~~/shared/types/database'
import type { ShopCategory, ShopMeta, ShopProducts } from '~/types/shop'

type Client = SupabaseClient<Database>
type CategoryPayload = {
  stable_key: string; slug: string; name: string; description: string | null
  image_path: string | null; image_alt: string | null; is_featured: boolean; children: CategoryPayload[]
}
type ProductPayload = ShopRow<'products'> & {
  category_key: string; subcategory_key: string | null; name: string; short_description: string | null
  full_description: string | null; seo_title: string | null; seo_description: string | null
  images: ShopRow<'product_images'>[]; specifications: ShopRow<'product_specifications'>[]
}

export function shopLocale(value: unknown): ShopLocale {
  return value === 'es' ? 'es' : 'fr'
}

export function shopDataError(error: { code?: string } | null) {
  if (error) {
    console.error('Storefront database read failed', error.code ?? 'unknown')
    throw createError({ statusCode: 503, statusMessage: 'Storefront data unavailable' })
  }
}

function localized(value: Json, locale: ShopLocale) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return
  const text = value[locale]
  const french = value.fr
  return typeof text === 'string' && text.trim() ? text : typeof french === 'string' ? french : undefined
}

function imageUrl(client: Client, bucket: 'category-images' | 'product-images', path: string | null) {
  if (!path) return
  if (/^\/images\/home\/[a-z0-9-]+\.webp$/.test(path)) return path
  if (/^[a-z0-9-]+\/[a-z0-9-]+\.(webp|jpeg|jpg|png|avif)$/.test(path)) return client.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function loadShopMeta(event: H3Event, locale: ShopLocale): Promise<ShopMeta> {
  const client = publicShopClient(event)
  const [categoryResult, settingsResult] = await Promise.all([
    client.rpc('shop_categories', { language: locale }),
    client.from('store_settings').select('store_name,whatsapp_number,support_email,currency_symbol,announcement,support_information,is_open').maybeSingle(),
  ])
  shopDataError(categoryResult.error)
  shopDataError(settingsResult.error)
  const categories = (categoryResult.data ?? []) as unknown as CategoryPayload[]
  const settings = settingsResult.data
  return {
    categories: categories.map((row): ShopCategory => {
      const src = imageUrl(client, 'category-images', row.image_path)
      return {
        id: row.stable_key, slug: row.slug, name: row.name, description: row.description ?? undefined,
        featured: row.is_featured, image: src ? { src, alt: row.image_alt ?? row.name } : undefined,
        subcategories: row.children.map(item => ({ id: item.stable_key, name: item.name })),
      }
    }),
    settings: settings && {
      storeName: settings.store_name, whatsappNumber: settings.whatsapp_number ?? undefined,
      supportEmail: settings.support_email ?? undefined, currencySymbol: settings.currency_symbol,
      announcement: localized(settings.announcement, locale), supportInformation: localized(settings.support_information, locale),
      open: settings.is_open,
    },
  }
}

export async function loadShopProducts(event: H3Event, locale: ShopLocale, filters: Record<string, Json | undefined>): Promise<ShopProducts> {
  const client = publicShopClient(event)
  const { data, error } = await client.rpc('shop_catalogue', { language: locale, filters })
  shopDataError(error)
  const result = data as unknown as { products: ProductPayload[]; total: number }
  return {
    total: result.total,
    products: result.products.map(row => ({
      id: row.id, slug: row.slug, categoryId: row.category_key, subcategoryId: row.subcategory_key ?? undefined,
      nameKey: '', descriptionKey: '', name: row.name, description: row.short_description ?? undefined,
      fullDescription: row.full_description ?? undefined, seoTitle: row.seo_title ?? undefined, seoDescription: row.seo_description ?? undefined,
      price: row.price, previousPrice: row.comparison_price ?? undefined, available: row.is_available,
      stockQuantity: row.stock_quantity ?? undefined, createdAt: row.created_at, featured: row.is_featured, newArrival: row.is_new_arrival,
      images: row.images.flatMap(image => {
        const src = imageUrl(client, 'product-images', image.storage_path)
        return src ? [{ src, altKey: '', alt: localized(image.alt, locale) ?? row.name, width: image.width, height: image.height, cutout: image.is_cutout }] : []
      }),
      specifications: row.specifications.map(spec => ({
        labelKey: '', valueKey: '', label: localized(spec.label, locale), value: localized(spec.value, locale),
      })),
    })),
  }
}
