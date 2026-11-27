import { readFile, writeFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

const root = new URL('../', import.meta.url)
const categoriesUrl = new URL('app/mocks/storefront.ts', root)
const { storefrontCategories } = await import(categoriesUrl.href)
const moduleSource = (await readFile(new URL('app/mocks/home.ts', root), 'utf8')).replace('~/mocks/storefront', categoriesUrl.href)
const output = stripTypeScriptTypes(moduleSource)
const { homeProducts, homeCollections, featuredCategories } = await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'))
const locales = await Promise.all(['fr', 'es'].map(async locale =>
  [locale, JSON.parse(await readFile(new URL('i18n/locales/' + locale + '.json', root), 'utf8'))],
))
const text = (messages, key) => key.split('.').reduce((value, segment) => value?.[segment], messages)
const quote = value => value == null ? 'null' : typeof value === 'boolean' || typeof value === 'number' ? String(value) : "'" + value.replaceAll("'", "''") + "'"
const json = value => quote(JSON.stringify(value)) + '::jsonb'
const localized = key => Object.fromEntries(locales.map(([locale, messages]) => [locale, text(messages, key)]))
const categories = []
const translations = []
const products = []
const productTranslations = []
const images = []
const rank = homeCollections.find(collection => collection.id === 'bestsellers').productIds

for (const [index, category] of storefrontCategories.entries()) {
  const photo = featuredCategories.find(item => item.id === category.id)?.image
  categories.push('(' + [quote(category.id), quote(category.slug), 'null', quote(photo?.src), 'true', quote(Boolean(photo)), index].join(', ') + ')')
  for (const [locale, messages] of locales) {
    translations.push('((select id from public.categories where stable_key = ' + quote(category.id) + '), ' +
      [locale, text(messages, 'storefront.categories.' + category.id), photo && text(messages, photo.altKey)].map(quote).join(', ') + ')')
  }
}
for (const category of storefrontCategories) {
  for (const [index, id] of category.subcategories.entries()) {
    const slug = category.slug + '-' + id.replace(/[A-Z]/g, match => '-' + match.toLowerCase())
    categories.push('(' + [quote(id), quote(slug), '(select id from public.categories where stable_key = ' + quote(category.id) + ')', 'null', 'true', 'false', index].join(', ') + ')')
    for (const [locale, messages] of locales) {
      translations.push('((select id from public.categories where stable_key = ' + quote(id) + '), ' +
        [locale, text(messages, 'storefront.subcategories.' + id), null].map(quote).join(', ') + ')')
    }
  }
}
for (const [index, item] of homeProducts.entries()) {
  const categoryKey = item.subcategoryId ?? item.categoryId
  const best = rank.indexOf(item.id)
  products.push('((select id from public.categories where stable_key = ' + quote(categoryKey) + '), ' +
    [item.slug, item.price, item.previousPrice, item.available, true, item.featured, item.newArrival, best === -1 ? null : best + 1,
      item.createdAt + 'T00:00:00Z', item.createdAt + 'T00:00:00Z', index].map(quote).join(', ') + ')')
  const productId = '(select id from public.products where slug = ' + quote(item.slug) + ')'
  for (const [locale, messages] of locales) {
    productTranslations.push('(' + [productId, ...[locale, text(messages, item.nameKey), text(messages, item.descriptionKey)].map(quote)].join(', ') + ')')
  }
  for (const [index, photo] of item.images.entries()) {
    images.push('(' + [productId, quote(photo.src), json(localized(photo.altKey)), photo.width, photo.height, quote(Boolean(photo.cutout)), index].join(', ') + ')')
  }
}

function statement(columns, entries, conflict) {
  if (entries.length) return 'insert into ' + columns + ' values\n  ' + entries.join(',\n  ') + '\non conflict (' + conflict + ') do nothing;'
}
const categoryTable = 'public.categories(stable_key, slug, parent_id, image_path, is_visible, is_featured, sort_order)'
const lines = [
  '-- Demonstration inventory. Generated with node scripts/generate-shop-seed.mjs.',
  'begin;',
  statement(categoryTable, categories.slice(0, storefrontCategories.length), 'stable_key'),
  statement(categoryTable, categories.slice(storefrontCategories.length), 'stable_key'),
  statement('public.category_translations(category_id, locale, name, image_alt)', translations, 'category_id, locale'),
  statement('public.products(category_id, slug, price, comparison_price, is_available, is_visible, is_featured, is_new_arrival, bestseller_rank, published_at, created_at, sort_order)', products, 'slug'),
  statement('public.product_translations(product_id, locale, name, short_description)', productTranslations, 'product_id, locale'),
  statement('public.product_images(product_id, storage_path, alt, width, height, is_cutout, sort_order)', images, 'product_id, storage_path'),
  "insert into public.store_settings(store_name, announcement, support_information) values ('Testy Shop', " +
    json(localized('storefront.announcement')) + ', ' + json(localized('storefront.trust.help.description')) + ') on conflict (singleton) do nothing;',
  'commit;',
]
await writeFile(new URL('supabase/seed.sql', root), lines.filter(Boolean).join('\n\n') + '\n', 'utf8')
