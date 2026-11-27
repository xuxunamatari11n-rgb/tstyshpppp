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
  return { total: result.total, products: result.products.map(row => mapCatalogueProduct(client, locale, row)) }
}

function mapCatalogueProduct(client: Client, locale: ShopLocale, row: ProductPayload) {
  return {
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
  }
}

export async function loadShopSelection(event: H3Event, locale: ShopLocale, ids: string[]) {
  if (!ids.length) return []
  const client = publicShopClient(event)
  const { data, error } = await client.from('products').select(`
    *, category:categories!products_category_id_fkey(stable_key,parent_id),
    product_translations(*), product_images(*)
  `).in('id', ids).in('product_translations.locale', locale === 'fr' ? ['fr'] : ['fr', locale])
  shopDataError(error)
  const rows = data ?? []
  const parentIds = [...new Set(rows.flatMap(row => row.category?.parent_id ? [row.category.parent_id] : []))]
  const parentRows = parentIds.length ? await client.from('categories').select('id,stable_key').in('id', parentIds) : null
  shopDataError(parentRows?.error ?? null)
  const parents = new Map(parentRows?.data?.map(category => [category.id, category.stable_key]))
  return rows.flatMap(row => {
    const { category, product_translations: translations, product_images: images, ...product } = row
    const french = translations.find(entry => entry.locale === 'fr')
    const translated = translations.find(entry => entry.locale === locale)
    if (!category || (!french && !translated)) return []
    const parent = category.parent_id ? parents.get(category.parent_id) : undefined
    if (category.parent_id && !parent) return []
    return [mapCatalogueProduct(client, locale, {
      ...product,
      category_key: parent ?? category.stable_key,
      subcategory_key: parent ? category.stable_key : null,
      name: translated?.name ?? french?.name ?? product.slug,
      short_description: translated?.short_description || french?.short_description || null,
      full_description: translated?.full_description || french?.full_description || null,
      seo_title: translated?.seo_title || french?.seo_title || null,
      seo_description: translated?.seo_description || french?.seo_description || null,
      images: images.toSorted((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)),
      specifications: [],
    })]
  })
}
