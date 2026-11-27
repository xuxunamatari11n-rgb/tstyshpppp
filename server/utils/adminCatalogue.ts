import type { H3Event } from 'h3'
import type { Json } from '~~/shared/types/database'
import { adminImageLimit, adminLocalized, type AdminBucket, type AdminCategory, type AdminProductPage } from '~~/shared/types/admin'
import { whatsappNumber } from '~/utils/whatsappCommerce'

type Client = ReturnType<typeof shopSessionClient>

export async function requireRegie(event: H3Event) {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  if ((await requireShopSession(event)).role !== 'admin') adminBad('forbidden', 403)
  if (event.method !== 'GET') requireShopOrigin(event)
  return shopSessionClient(event)
}

export function regieResult<T>(result: { data: T; error: { code: string; message: string } | null }): T {
  const error = result.error
  if (!error) return result.data
  if (error.code === '42501') return adminBad('forbidden', 403)
  if (error.code === 'P0002') return adminBad('not-found', 404)
  if (error.code === '23503') return adminBad('dependencies', 409)
  if (error.code === '23505') return adminBad(error.message.includes('sku') ? 'duplicate-sku' : 'duplicate-slug', 409)
  if (error.code === 'PT409' || error.code === '40001') return adminBad('conflict', 409)
  if (error.code === 'PT422') return adminBad(error.message)
  if (error.code === '23514') return adminBad('invalid')
  console.error('Regie database operation failed', error.code)
  return adminBad('service', 503)
}

export async function regieProducts(client: Client, raw: Record<string, unknown>) {
  const filters: Record<string, Json | undefined> = {
    q: typeof raw.q === 'string' ? raw.q.trim().slice(0, 100) : undefined,
    category: raw.category ? adminId(raw.category) : undefined,
    visibility: typeof raw.visibility === 'string' ? raw.visibility.slice(0, 15) : undefined,
    availability: typeof raw.availability === 'string' ? raw.availability.slice(0, 15) : undefined,
    sort: typeof raw.sort === 'string' ? raw.sort.slice(0, 15) : undefined,
    page: typeof raw.page === 'string' && /^\d{1,5}$/.test(raw.page) ? raw.page : undefined,
    overview: raw.overview === 'true', attention: raw.attention === 'true',
  }
  const data = regieResult(await client.rpc('regie_products', { filters })) as unknown as AdminProductPage
  return { ...data, products: data.products.map(p => ({ ...p, src: imageUrl(client, 'product-images', p.thumbnail) })) }
}

export async function regieCategories(client: Client) {
  const data = regieResult(await client.rpc('regie_categories')) as unknown as AdminCategory[]
  return data.map(c => ({ ...c, src: imageUrl(client, 'category-images', c.image_path) }))
}

export async function regieProduct(client: Client, id: string) {
  const result = regieResult(await client.from('products').select(
    '*, product_translations(*), product_images(*), product_specifications(*)',
  ).eq('id', id).maybeSingle())
  if (!result) return adminBad('not-found', 404)
  const { product_translations, product_images, product_specifications, ...base } = result
  const order = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  const category = await regieCategories(client)
  return {
    ...base, is_public: base.is_visible && !!base.published_at && Date.parse(base.published_at) <= Date.now() &&
      category.some(c => c.id === base.category_id && c.effective),
    translations: product_translations,
    images: product_images.sort(order).map(i => ({ ...i, alt: adminLocalized(i.alt), src: imageUrl(client, 'product-images', i.storage_path) })),
    specifications: product_specifications.sort(order).map(s => ({ label: adminLocalized(s.label), value: adminLocalized(s.value) })),
  }
}

const stagedPath = /^regie-[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|avif)$/

async function validateMedia(client: Client, bucket: AdminBucket, path: string, existing: Set<string>) {
  if (existing.has(path)) return
  if (!stagedPath.test(path)) adminBad('media-invalid')
  const { data, error } = await client.storage.from(bucket).info(path)
  if (error || !data) adminBad('media-missing')
}

export async function saveRegieProduct(client: Client, id: string | undefined, payload: unknown) {
  const raw = adminObject(payload)
  const price = adminInteger(raw.price, 'price')
  const comparison = raw.comparison_price === null ? null : adminInteger(raw.comparison_price, 'comparison')
  if (comparison !== null && comparison <= price) adminBad('comparison')
  const stock = raw.stock_quantity === null ? null : adminInteger(raw.stock_quantity, 'stock')
  const translations = adminList(raw.translations, 2).map(value => {
    const translation = adminObject(value)
    const { locale, name } = adminTranslation(translation, 180)
    const short_description = adminString(translation.short_description ?? '', 1000)
    const full_description = adminString(translation.full_description ?? '', 20000)
    const keywords = adminList(translation.keywords ?? [], 50).map(word => adminString(word, 100)).filter(Boolean)
    const seo_title = adminString(translation.seo_title ?? '', 250)
    const seo_description = adminString(translation.seo_description ?? '', 1000)
    if (!name && (short_description || full_description || keywords.length || seo_title || seo_description)) {
      adminBad(locale === 'fr' ? 'french-required' : 'spanish-name')
    }
    return { locale, name, short_description, full_description, keywords, seo_title, seo_description }
  }).filter(value => value.name)
  const visible = adminBoolean(raw.is_visible)
  if (visible && !translations.some(t => t.locale === 'fr')) adminBad('french-required')
  if (new Set(translations.map(t => t.locale)).size !== translations.length) adminBad('invalid')
  const images = adminList(raw.images, 32).map((value, sort_order) => {
    const image = adminObject(value)
    return { storage_path: adminString(image.storage_path, 512, 'media-invalid', true), alt: adminLocalText(image.alt, 500),
      width: adminInteger(image.width, 'media-invalid', 1, 20000), height: adminInteger(image.height, 'media-invalid', 1, 20000),
      is_cutout: adminBoolean(image.is_cutout), sort_order }
  })
  if (new Set(images.map(image => image.storage_path)).size !== images.length) adminBad('media-duplicate')
  const existing = id && images.length
    ? regieResult(await client.from('product_images').select('storage_path').eq('product_id', id)) ?? []
    : []
  const existingPaths = new Set(existing.map(row => row.storage_path))
  await Promise.all(images.map(image => validateMedia(client, 'product-images', image.storage_path, existingPaths)))
  const specifications = adminList(raw.specifications, 48).map((value, sort_order) => {
    const spec = adminObject(value)
    return { label: adminLocalText(spec.label, 250, true), value: adminLocalText(spec.value, 1500, true), sort_order }
  })
  const sku = raw.sku === null ? null : adminString(raw.sku, 120) || null
  const item = {
    id, updated_at: id ? adminVersion(raw.updated_at) : undefined, category_id: adminId(raw.category_id),
    slug: adminSlug(raw.slug), sku, price, comparison_price: comparison, stock_quantity: stock,
    is_available: adminBoolean(raw.is_available), is_visible: visible, is_featured: adminBoolean(raw.is_featured),
    is_new_arrival: adminBoolean(raw.is_new_arrival), bestseller_rank: raw.bestseller_rank === null ? null : adminInteger(raw.bestseller_rank, 'invalid', 1),
    sort_order: adminInteger(raw.sort_order), translations, images, specifications, confirm_slug: raw.confirm_slug === true,
  }
  return { id: regieResult(await client.rpc('regie_store_product', { payload: item })) }
}

export async function saveRegieCategory(client: Client, id: string | undefined, payload: unknown) {
  const raw = adminObject(payload)
  const translations = adminList(raw.translations, 2).map(value => {
    const text = adminObject(value)
    const { locale, name } = adminTranslation(text, 160)
    const description = adminString(text.description ?? '', 5000)
    const image_alt = adminString(text.image_alt ?? '', 500)
    if (!name && (description || image_alt)) adminBad(locale === 'fr' ? 'french-required' : 'spanish-name')
    return { locale, name, description, image_alt }
  }).filter(value => value.name)
  if (!translations.some(t => t.locale === 'fr')) adminBad('french-required')
  if (new Set(translations.map(t => t.locale)).size !== translations.length) adminBad('invalid')
  const image_path = raw.image_path === null ? null : adminString(raw.image_path, 512, 'media-invalid', true)
  if (image_path) {
    const previous = id ? regieResult(await client.from('categories').select('image_path').eq('id',id).maybeSingle()) : null
    await validateMedia(client, 'category-images', image_path, new Set(previous?.image_path ? [previous.image_path] : []))
  }
  const item = {
    id, updated_at: id ? adminVersion(raw.updated_at) : undefined, parent_id: raw.parent_id === null ? null : adminId(raw.parent_id),
    slug: adminSlug(raw.slug), image_path, is_visible: adminBoolean(raw.is_visible), is_featured: adminBoolean(raw.is_featured),
    sort_order: adminInteger(raw.sort_order), confirm_hide: raw.confirm_hide === true, translations,
  }
  return { id: regieResult(await client.rpc('regie_store_category', { payload: item })) }
}

export async function saveRegieSettings(client: Client, payload: unknown) {
  const raw = adminObject(payload)
  const suppliedNumber = adminString(raw.whatsapp_number ?? '', 40)
  const number = whatsappNumber(suppliedNumber)
  if (suppliedNumber && !number) adminBad('phone')
  const email = adminString(raw.support_email ?? '', 254)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) adminBad('email')
  const settings = {
    store_name: adminString(raw.store_name, 100, 'invalid', true), whatsapp_number: number, support_email: email || null,
    currency_symbol: adminString(raw.currency_symbol, 12, 'invalid', true), is_open: adminBoolean(raw.is_open),
    announcement: adminLocalText(raw.announcement, 250), support_information: adminLocalText(raw.support_information, 1500),
  }
  if (raw.updated_at) {
    const result = regieResult(await client.from('store_settings').update(settings).eq('singleton',true)
      .eq('updated_at',adminVersion(raw.updated_at)).select().maybeSingle())
    if (!result) adminBad('conflict', 409)
    return result
  }
  return regieResult(await client.from('store_settings').insert(settings).select().single())
}

export async function regieUpload(event: H3Event, client: Client) {
  const bucket = getQuery(event).bucket
  if (bucket !== 'product-images' && bucket !== 'category-images') adminBad('invalid')
  const length = Number(getHeader(event,'content-length') ?? 0)
  if (!Number.isSafeInteger(length) || length > adminImageLimit || length <= 0) adminBad('media-size', 413)
  const type = getHeader(event,'content-type')
  const buffer = await readRawBody(event, false)
  if (!buffer || buffer.length !== length || buffer.length > adminImageLimit) return adminBad('media-size', 413)
  const marker = (start: number, end: number) => buffer.subarray(start, end).toString('ascii')
  let extension
  if (type === 'image/jpeg' && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) extension = 'jpg'
  else if (type === 'image/png' && buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') extension = 'png'
  else if (type === 'image/webp' && marker(0,4) === 'RIFF' && marker(8,12) === 'WEBP') extension = 'webp'
  else if (type === 'image/avif' && marker(4,8) === 'ftyp' && /avif|avis/.test(marker(8,40))) extension = 'avif'
  if (!extension) return adminBad('media-invalid')
  const path = 'regie-' + crypto.randomUUID() + '/' + crypto.randomUUID() + '.' + extension
  const { error } = await client.storage.from(bucket).upload(path, buffer, { contentType: type, upsert: false })
  if (error) {
    console.error('Regie media upload failed', error.status)
    return adminBad('media-upload', 503)
  }
  return { path, src: imageUrl(client, bucket, path) }
}

