<script setup lang="ts">
import { adminLocalized, type AdminCategory, type AdminLocale, type AdminProduct, type AdminProductText } from '~~/shared/types/admin'
import type { CommercialProduct } from '~/types/commerce'
import type { RegieMedia } from '~/composables/useRegieEditor'

const props = defineProps<{ id?: string }>()
const a = useRegieText()
const refreshRegieStorefront = useRegieStorefrontRefresh()
const { locale } = useI18n()
const path = useLocalePath()
const price = useShopPrice()
const request = useRequestFetch()
const { data, error, refresh } = await useAsyncData('regie-editor-' + (props.id ?? 'new'), async () => {
  const [categories, product] = await Promise.all([
    request<AdminCategory[]>('/api/regie/categories'),
    props.id ? request<AdminProduct>('/api/regie/products/' + props.id) : Promise.resolve(null),
  ])
  return { categories, product }
})
const languages = ['fr', 'es'] as const
const editingLocale = ref<AdminLocale>('fr')
const media = ref<RegieMedia[]>([])
const saving = ref(false)
const preparingMedia = ref(false)
const createdProduct = useState<string | null>('regie-created-product', () => null)
const feedback = ref<RegieLabel>()
const failed = ref(false)
const original = ref<AdminProduct | null>(null)
const confirmation = useTemplateRef('confirmation')
const formElement = useTemplateRef<HTMLFormElement>('formElement')
const previewElement = useTemplateRef<HTMLElement>('previewElement')
const previewVisible = ref(false)
const generatedSlug = ref(true)
const baseline = ref('')
const blankTranslation = (locale: AdminLocale): AdminProductText => ({
  locale, name: '', short_description: '', full_description: '', keywords: [], seo_title: '', seo_description: '',
})
const form = reactive({
  slug: '', sku: '', category_id: '', price: '' as number | string, comparison_price: '' as number | string,
  stock_quantity: '' as number | string, tracked: false, is_available: true, is_visible: false, is_featured: false,
  is_new_arrival: false, bestseller_rank: '' as string | number, sort_order: 0 as string | number,
  translations: { fr: blankTranslation('fr'), es: blankTranslation('es') },
  keywords: { fr: '', es: '' },
  specifications: [] as (AdminProduct['specifications'][number] & { key: number })[],
})
let specificationId = 0
const snapshot = () => JSON.stringify({ form, media: media.value.map(({ key, alt, is_cutout }) => ({ key, alt, is_cutout })) })
const dirty = computed(() => !!baseline.value && snapshot() !== baseline.value)
useRegieUnsaved(dirty)
function initialize(record: AdminProduct | null) {
  original.value = record
  generatedSlug.value = !record
  Object.assign(form, {
    slug: record?.slug ?? '', sku: record?.sku ?? '', category_id: record?.category_id ?? '',
    price: record?.price ?? '', comparison_price: record?.comparison_price ?? '', stock_quantity: record?.stock_quantity ?? '',
    tracked: record?.stock_quantity != null, is_available: record?.is_available ?? true, is_visible: record?.is_visible ?? false,
    is_featured: record?.is_featured ?? false, is_new_arrival: record?.is_new_arrival ?? false,
    bestseller_rank: record?.bestseller_rank ?? '', sort_order: record?.sort_order ?? 0,
    specifications: (record?.specifications ?? []).map(s => ({
      key: ++specificationId, label: adminLocalized(s.label), value: adminLocalized(s.value),
    })),
  })
  for (const language of languages) {
    const content = record?.translations.find(t => t.locale === language)
    const translation = blankTranslation(language)
    if (content) {
      translation.name = content.name
      translation.short_description = content.short_description ?? ''
      translation.full_description = content.full_description ?? ''
      translation.seo_title = content.seo_title ?? ''
      translation.seo_description = content.seo_description ?? ''
    }
    form.translations[language] = translation
    form.keywords[language] = content?.keywords.join(', ') ?? ''
  }
  media.value = (record?.images ?? []).map(image => ({ ...image, alt: adminLocalized(image.alt), key: image.storage_path }))
  baseline.value = snapshot()
}
watch(data, result => { if (result && !baseline.value) initialize(result.product) }, { immediate: true })

const category = computed(() => data.value?.categories.find(c => c.id === form.category_id))
function categoryName(c: AdminCategory) {
  return c.translations.find(t => t.locale === locale.value)?.name ?? c.translations.find(t => t.locale === 'fr')?.name ?? c.slug
}
const translation = computed(() => form.translations[editingLocale.value])
const completion = (language: AdminLocale) => !!(form.translations[language].name.trim()
  && form.translations[language].short_description.trim() && form.translations[language].full_description.trim())
const heading = computed(() => props.id ? original.value?.translations.find(t => t.locale === locale.value)?.name ||
  original.value?.translations.find(t => t.locale === 'fr')?.name || original.value?.slug || a('editProduct') : a('newProduct'))
const discount = computed(() => {
  const previous = regieInteger(form.comparison_price)
  const current = regieInteger(form.price)
  return previous && current !== null && current >= 0 && previous > current ? Math.round((previous - current) / previous * 100) : 0
})
const preview = computed<CommercialProduct>(() => ({
  id: props.id ?? 'regie-preview', slug: form.slug,
  name: (locale.value === 'es' && form.translations.es.name) || form.translations.fr.name || a('previewName'),
  nameKey: '', descriptionKey: '', categoryId: category.value?.stable_key ?? '',
  images: media.value.slice(0, 1).flatMap(item => item.src ? [{ src: item.src, width: item.width, height: item.height,
    altKey: '', alt: item.alt[locale.value === 'es' ? 'es' : 'fr'] || item.alt.fr, cutout: item.is_cutout }] : []),
  price: Math.max(regieInteger(form.price) ?? 0, 0), previousPrice: discount.value ? Number(form.comparison_price) : undefined,
  available: form.is_available, stockQuantity: form.tracked ? regieInteger(form.stock_quantity) ?? undefined : undefined,
  featured: form.is_featured, newArrival: form.is_new_arrival, createdAt: '',
}))
async function showPreview() {
  previewVisible.value = true
  await nextTick()
  previewElement.value?.scrollIntoView({ block: 'nearest' })
  previewElement.value?.focus({ preventScroll: true })
}
function addSpec() {
  form.specifications.push({ key: ++specificationId, label: adminLocalized(null), value: adminLocalized(null) })
}
function moveSpec(index: number, offset: number) {
  const [item] = form.specifications.splice(index, 1)
  if (item) form.specifications.splice(index + offset, 0, item)
}

async function save(event: SubmitEvent) {
  if (saving.value || preparingMedia.value || !formElement.value?.reportValidity()) return
  const trigger = event.submitter as HTMLElement | null
  const visible = (trigger as HTMLButtonElement | null)?.value === 'publish' || (!!props.id && form.is_visible)
  failed.value = false
  feedback.value = undefined
  if (visible && !form.translations.fr.name.trim()) {
    editingLocale.value = 'fr'; feedback.value = 'frenchRequired'; failed.value = true; return
  }
  const confirmSlug = !!original.value?.published_at && form.slug !== original.value.slug
  const currentPrice = regieInteger(form.price)
  if (currentPrice === null) { feedback.value = 'priceError'; failed.value = true; return }
  const stock = form.tracked ? regieInteger(form.stock_quantity) : null
  if (form.tracked && stock === null) { feedback.value = 'stockError'; failed.value = true; return }
  saving.value = true
  try {
    if (confirmSlug && (!trigger || !await confirmation.value?.ask(trigger, original.value?.slug + ' → ' + form.slug))) return
    await persistRegieMedia(media.value, 'product-images')
    const result = await $fetch<{ id: string }>('/api/regie/products' + (props.id ? '/' + props.id : ''), {
      method: props.id ? 'PATCH' : 'POST',
      body: {
        slug: form.slug, sku: form.sku, category_id: form.category_id, price: currentPrice,
        comparison_price: regieInteger(form.comparison_price), stock_quantity: stock, is_available: form.is_available,
        is_visible: visible, is_featured: form.is_featured, is_new_arrival: form.is_new_arrival,
        bestseller_rank: regieInteger(form.bestseller_rank), sort_order: regieInteger(form.sort_order),
        translations: languages.map(language => ({ ...form.translations[language],
          keywords: form.keywords[language].split(',').map(word => word.trim()).filter(Boolean) })),
        images: media.value.map(({ storage_path, alt, width, height, is_cutout }) => ({ storage_path, alt, width, height, is_cutout })),
        specifications: form.specifications.map(({ label, value }) => ({ label, value })),
        updated_at: original.value?.updated_at, confirm_slug: confirmSlug,
      },
    })
    feedback.value = props.id ? 'saved' : 'created'
    baseline.value = snapshot()
    if (props.id) {
      const saved = await $fetch<AdminProduct>('/api/regie/products/' + props.id).catch(() => null)
      if (saved) initialize(saved)
    } else {
      createdProduct.value = result.id
      await navigateTo(path({ name: 'regie-products-edit', params: { id: result.id } }), { replace: true })
    }
    await refreshRegieStorefront()
  } catch (error) {
    const reason = regieError(error)
    if (reason === 'frenchRequired' || reason === 'spanishRequired') editingLocale.value = reason === 'frenchRequired' ? 'fr' : 'es'
    feedback.value = reason
    failed.value = true
  } finally { saving.value = false }
}
const created = !!props.id && createdProduct.value === props.id
if (created) createdProduct.value = null
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title">
      <NuxtLink :to="path('regie-products')" class="regie-back"><Icon name="ion:arrow-back-outline" size="17" />{{ a('products') }}</NuxtLink>
      <h1>{{ heading }}</h1>
      <AdminStatus v-if="original" :public="!!original.is_public" :visible="original.is_visible"
        :availability="original.is_available" :stock="original.stock_quantity" />
    </header>
    <div v-if="error" class="regie-feedback" data-error role="alert">
      {{ a(regieError(error)) }} <button type="button" class="regie-button" @click="refresh()">{{ a('retry') }}</button>
    </div>
    <p v-else-if="!data" role="status">{{ a('loading') }}</p>
    <form v-else ref="formElement" class="regie-editor" @submit.prevent="save">
      <div class="regie-editor-toolbar">
        <div class="regie-actions">
          <button type="submit" value="save" class="regie-button" :data-tone="id ? 'primary' : undefined"  :disabled="saving || preparingMedia">
            {{ a(saving ? 'saving' : id ? 'saveChanges' : 'saveDraft') }}
          </button>
          <button v-if="!id" type="submit" value="publish" class="regie-button" data-tone="primary" :disabled="saving || preparingMedia">{{ a('publish') }}</button>
          <button type="button" class="regie-button" :aria-expanded="previewVisible" @click="previewVisible ? previewVisible = false : showPreview()">
            <Icon name="ion:eye-outline" size="17" aria-hidden="true" />{{ a('preview') }}
          </button>
          <NuxtLink v-if="original?.is_public" :to="path({ name: 'product', params: { slug: original.slug } })" class="regie-button">
            {{ a('viewProduct') }} <Icon name="ion:open-outline" size="16" aria-hidden="true" />
          </NuxtLink>
        </div>
        <p v-if="feedback || created" class="regie-feedback" :data-error="failed" :role="failed ? 'alert' : 'status'">{{ a(feedback || 'created') }}</p>
      </div>
      <fieldset class="regie-editor-grid" :disabled="saving">
        <div class="regie-stack">
          <section class="regie-surface">
            <h2>{{ a('identity') }}</h2>
            <div class="regie-fields-pair">
              <label class="regie-field"><span>{{ a('sku') }}</span><input v-model="form.sku" maxlength="120" autocomplete="off"></label>
              <label class="regie-field"><span>{{ a('slug') }}</span><input v-model="form.slug" required maxlength="120" pattern="[a-z0-9]+(-[a-z0-9]+)*"
                autocapitalize="none" spellcheck="false" @input="generatedSlug = false"><small>{{ a('slugHint') }}</small></label>
            </div>
          </section>
          <section class="regie-surface">
            <h2>{{ a('localizedContent') }}</h2>
            <div class="regie-tabs" role="group" :aria-label="a('localizedContent')">
              <button v-for="language in languages" :key="language" type="button" :aria-pressed="editingLocale === language" @click="editingLocale = language">
                {{ a(language) }} <span class="regie-dot" :data-complete="completion(language)" :title="a(completion(language) ? 'complete' : 'incomplete')" />
                <span class="sr-only">{{ a(completion(language) ? 'complete' : 'incomplete') }}</span>
              </button>
            </div>
            <label class="regie-field"><span>{{ a('name') }} · {{ a(editingLocale) }}</span><input v-model="translation.name" maxlength="180"
              :lang="editingLocale" @input="editingLocale === 'fr' && generatedSlug && (form.slug = regieSlug(($event.target as HTMLInputElement).value))"></label>
            <label class="regie-field"><span>{{ a('shortDescription') }}</span><textarea v-model="translation.short_description" maxlength="1000" rows="2" :lang="editingLocale" /></label>
            <label class="regie-field"><span>{{ a('description') }}</span><textarea v-model="translation.full_description" maxlength="20000" rows="5" :lang="editingLocale" /></label>
            <label class="regie-field"><span>{{ a('keywords') }}</span><input v-model="form.keywords[editingLocale]" :lang="editingLocale"></label>
            <div class="regie-fields-pair">
              <label class="regie-field"><span>{{ a('seoTitle') }}</span><input v-model="translation.seo_title" maxlength="250" :lang="editingLocale"></label>
              <label class="regie-field"><span>{{ a('seoDescription') }}</span><input v-model="translation.seo_description" maxlength="1000" :lang="editingLocale"></label>
            </div>
          </section>
          <AdminMedia v-model="media" v-model:preparing="preparingMedia" :max="32" :busy="saving" />
          <section class="regie-surface">
            <h2>{{ a('specifications') }}</h2>
            <p v-if="!form.specifications.length">{{ a('specEmpty') }}</p>
            <div v-for="(spec, index) in form.specifications" :key="spec.key" class="regie-spec">
              <div class="regie-row-actions">
                <button type="button" class="regie-icon" :aria-label="a('moveUp')" :disabled="index === 0" @click="moveSpec(index, -1)"><Icon name="ion:arrow-up-outline" size="16" /></button>
                <button type="button" class="regie-icon" :aria-label="a('moveDown')" :disabled="index === form.specifications.length - 1" @click="moveSpec(index, 1)"><Icon name="ion:arrow-down-outline" size="16" /></button>
                <button type="button" class="regie-icon regie-danger-text" :aria-label="a('remove')" @click="form.specifications.splice(index, 1)"><Icon name="ion:trash-outline" size="16" /></button>
              </div>
              <div v-for="language in languages" :key="language" class="regie-fields-pair">
                <label class="regie-field"><span>{{ a('label') }} · {{ a(language) }}</span><input v-model="spec.label[language]" maxlength="250" :required="language === 'fr'" :lang="language"></label>
                <label class="regie-field"><span>{{ a('value') }} · {{ a(language) }}</span><input v-model="spec.value[language]" maxlength="1500" :required="language === 'fr'" :lang="language"></label>
              </div>
            </div>
            <button type="button" class="regie-button" :disabled="form.specifications.length >= 48" @click="addSpec">
              <Icon name="ion:add-outline" size="18" />{{ a('addSpec') }}
            </button>
          </section>
        </div>
        <div class="regie-stack regie-editor-side">
          <section class="regie-surface">
            <h2>{{ a('publication') }}</h2>
            <label v-if="id" class="regie-check"><input v-model="form.is_visible" type="checkbox">{{ a('visibleToggle') }}</label>
            <label class="regie-field"><span>{{ a('category') }}</span><select v-model="form.category_id" required>
              <option value="" disabled>{{ a('chooseCategory') }}</option>
              <option v-for="item in data.categories" :key="item.id" :value="item.id">
                {{ item.parent_id ? '↳ ' : '' }}{{ categoryName(item) }}{{ !item.effective ? ' · ' + a('manualHidden') : '' }}
              </option>
            </select></label>
            <p v-if="category && !category.effective" class="regie-callout">{{ a('categoryWarning') }}</p>
          </section>
          <section class="regie-surface">
            <h2>{{ a('merchandising') }}</h2>
            <label class="regie-check"><input v-model="form.is_featured" type="checkbox">{{ a('featured') }}</label>
            <label class="regie-check"><input v-model="form.is_new_arrival" type="checkbox">{{ a('newArrival') }}</label>
            <label class="regie-field"><span>{{ a('bestseller') }}</span><input v-model.number="form.bestseller_rank" type="number" min="1" max="2147483647" step="1"></label>
            <label class="regie-field"><span>{{ a('order') }}</span><input v-model.number="form.sort_order" type="number" min="0" max="2147483647" step="1" required></label>
          </section>
          <section class="regie-surface">
            <h2>{{ a('pricing') }}</h2>
            <label class="regie-field"><span>{{ a('price') }}</span><input v-model.number="form.price" type="number" required min="0" max="2147483647" inputmode="numeric" step="1"></label>
            <label class="regie-field"><span>{{ a('previousPrice') }}</span><input v-model.number="form.comparison_price" type="number" min="0" max="2147483647" inputmode="numeric" step="1"><small>{{ a('comparisonError') }}</small></label>
            <p v-if="discount" class="regie-chip" data-tone="success">{{ a('discount') }} · {{ discount }} % ({{ price(Number(form.comparison_price) - Number(form.price)) }})</p>
          </section>
          <section class="regie-surface">
            <h2>{{ a('stockSection') }}</h2>
            <label class="regie-check"><input v-model="form.is_available" type="checkbox">{{ a('availabilityToggle') }}</label>
            <label class="regie-check"><input v-model="form.tracked" type="checkbox">{{ a('trackStock') }}</label>
            <label v-if="form.tracked" class="regie-field"><span>{{ a('stock') }}</span>
              <input v-model.number="form.stock_quantity" type="number" min="0" max="2147483647" step="1" inputmode="numeric" required>
            </label>
            <p>{{ a('stockHint') }}</p>
          </section>
          <section v-if="previewVisible" ref="previewElement" class="regie-surface regie-preview" tabindex="-1">
            <h2>{{ a('preview') }}</h2>
            <HomeProductCard :product="preview" :preview="true" :preview-category="category ? categoryName(category) : a('noCategory')" />
          </section>
        </div>
      </fieldset>
    </form>
    <AdminConfirm ref="confirmation" :title="a('slug')" :message="a('slugChange')" :confirm-label="a('confirm')" />
  </div>
</template>
