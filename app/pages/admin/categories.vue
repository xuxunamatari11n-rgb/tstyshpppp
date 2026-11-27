<script setup lang="ts">
import { adminLocalized, type AdminCategory, type AdminLocale } from '~~/shared/types/admin'
import type { RegieMedia } from '~/composables/useRegieEditor'
definePageMeta({ name: 'regie-categories', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin/categories', es: '/admin/categorias' } } })
const a = useRegieText()
const refreshRegieStorefront = useRegieStorefrontRefresh()
const { locale } = useI18n()
const request = useRequestFetch()
const { data, error, refresh } = await useAsyncData('regie-categories', () => request<AdminCategory[]>('/api/regie/categories'))
const current = ref<AdminCategory>()
const editing = ref(false)
const language = ref<AdminLocale>('fr')
const frozen = ref(false)
const preparingMedia = ref(false)
const feedback = ref<RegieLabel>()
const failed = ref(false)
const baseline = ref('')
const form = reactive({
  slug: '', parent_id: null as string | null, is_visible: false, is_featured: false, sort_order: 0 as number | string,
  names: adminLocalized(null), descriptions: adminLocalized(null), imageAlt: adminLocalized(null),
})
const media = ref<RegieMedia[]>([])
const deleting = useTemplateRef('deleting')
const hiding = useTemplateRef('hiding')
const editor = useTemplateRef<HTMLElement>('categoryEditor')
const snap = () => JSON.stringify({ form, image: media.value[0]?.key })
const dirty = computed(() => editing.value && snap() !== baseline.value)
useRegieUnsaved(dirty)
const roots = computed(() => data.value?.filter(row => !row.parent_id) ?? [])
const rows = computed(() => roots.value.flatMap(parent => [parent, ...(data.value ?? []).filter(row => row.parent_id === parent.id)]))
const parentOptions = computed(() => current.value?.child_count ? [] : roots.value.filter(row => row.id !== current.value?.id))
const parentHidden = computed(() => form.parent_id && !roots.value.find(c => c.id === form.parent_id)?.effective)
function name(row: AdminCategory) {
  return row.translations.find(text => text.locale === locale.value)?.name ?? row.translations.find(text => text.locale === 'fr')?.name ?? row.slug
}
const autoSlug = ref(true)
function mayClose() { return !dirty.value || window.confirm(a('discard')) }
async function open(row?: AdminCategory) {
  if (frozen.value || preparingMedia.value || !mayClose()) return
  feedback.value = undefined
  failed.value = false
  current.value = row
  autoSlug.value = !row
  Object.assign(form, {
    slug: row?.slug ?? '', parent_id: row?.parent_id ?? null, is_visible: row?.is_visible ?? false,
    is_featured: row?.is_featured ?? false, sort_order: row?.sort_order ?? 0,
  })
  for (const key of ['fr', 'es'] as const) {
    const content = row?.translations.find(text => text.locale === key)
    form.names[key] = content?.name ?? ''
    form.descriptions[key] = content?.description ?? ''
    form.imageAlt[key] = content?.image_alt ?? ''
  }
  media.value = row?.image_path ? [{ storage_path: row.image_path, key: row.image_path, src: row.src,
    alt: adminLocalized(null), width: 800, height: 800, is_cutout: false }] : []
  language.value = 'fr'
  baseline.value = snap()
  editing.value = true
  await nextTick()
  editor.value?.focus()
}
function close() {
  if (frozen.value || preparingMedia.value || !mayClose()) return
  editing.value = false
  media.value = []
  current.value = undefined
}
async function save(event: SubmitEvent) {
  if (frozen.value || preparingMedia.value) return
  const trigger = event.submitter as HTMLElement | null
  const row = current.value
  const needsConfirm = !!row?.is_visible && !form.is_visible
  if (needsConfirm && (!trigger || !await hiding.value?.ask(trigger, name(row)))) return
  if (!form.names.fr.trim()) {
    language.value = 'fr'; feedback.value = 'frenchRequired'; failed.value = true; return
  }
  frozen.value = true
  feedback.value = undefined
  try {
    await persistRegieMedia(media.value, 'category-images')
    await $fetch('/api/regie/categories' + (row?.id ? '/' + row.id : ''), {
      method: row?.id ? 'PATCH' : 'POST',
      body: {
        slug: form.slug, parent_id: form.parent_id, is_visible: form.is_visible, is_featured: form.is_featured,
        sort_order: regieInteger(form.sort_order), image_path: media.value[0]?.storage_path ?? null,
        updated_at: row?.updated_at, confirm_hide: needsConfirm,
        translations: (['fr', 'es'] as const).map(locale => ({ locale, name: form.names[locale],
          description: form.descriptions[locale], image_alt: form.imageAlt[locale] })),
      },
    })
    failed.value = false
    feedback.value = row ? 'saved' : 'created'
    baseline.value = snap()
    editing.value = false
    media.value = []
    await refresh()
    await refreshRegieStorefront()
  } catch (error) {
    const reason = regieError(error)
    if (reason === 'spanishRequired') language.value = 'es'
    feedback.value = reason
    failed.value = true
  } finally { frozen.value = false }
}
async function remove(row: AdminCategory, trigger: HTMLElement) {
  if (frozen.value || !await deleting.value?.ask(trigger, name(row))) return
  frozen.value = true
  try {
    await $fetch('/api/regie/categories/' + row.id, { method: 'DELETE', query: { version: row.updated_at } })
    if (row.id === current.value?.id) { editing.value = false; media.value = [] }
    failed.value = false
    feedback.value = 'deleted'
    await refresh()
    await refreshRegieStorefront()
  } catch (error) { feedback.value = regieError(error); failed.value = true }
  finally { frozen.value = false }
}
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title regie-title-actions">
      <div><h1>{{ a('categories') }}</h1><p>{{ a('categoryIntro') }}</p></div>
      <button type="button" class="regie-button" data-tone="primary" :disabled="frozen" @click="open()"><Icon name="ion:add-outline" size="19" />{{ a('newCategory') }}</button>
    </header>
    <p v-if="feedback && !editing" class="regie-feedback" :data-error="failed" :role="failed ? 'alert' : 'status'">{{ a(feedback) }}</p>
    <div v-if="error" class="regie-feedback" data-error role="alert">{{ a(regieError(error)) }} <button class="regie-button" type="button" @click="refresh()">{{ a('retry') }}</button></div>
    <p v-else-if="!data" role="status">{{ a('loading') }}</p>
    <div v-else class="regie-category-layout" :data-editing="editing">
      <section class="regie-surface regie-table-surface regie-category-list" :aria-label="a('categories')">
        <header class="regie-section-head"><h2>{{ data.length }} {{ a('categoryCount') }}</h2></header>
        <p v-if="!rows.length" class="regie-empty">{{ a('empty') }}</p>
        <ul v-else class="regie-category-rows">
          <li v-for="row in rows" :key="row.id" :data-child="!!row.parent_id">
            <button type="button" class="regie-category-name" :aria-label="a('edit') + ' ' + name(row)" :disabled="frozen" @click="open(row)">
              <span class="regie-thumb"><img v-if="row.src" :src="row.src" alt="" width="38" height="38"><Icon v-else :name="row.parent_id ? 'ion:return-down-forward-outline' : 'ion:pricetag-outline'" size="17" /></span>
              <span><strong>{{ name(row) }}</strong><small>{{ a(row.parent_id ? 'child' : 'root') }} · {{ row.product_count }} {{ a('productCount') }}</small></span>
            </button>
            <AdminStatus :public="!!row.effective" :visible="row.is_visible" />
            <div class="regie-row-actions">
              <button type="button" class="regie-icon" :aria-label="a('edit') + ' ' + name(row)" :title="a('edit')" :disabled="frozen" @click="open(row)">
                <Icon name="ion:create-outline" size="18" />
              </button>
              <button type="button" class="regie-icon regie-danger-text" :aria-label="a('delete') + ' ' + name(row)"
                :title="row.product_count || row.child_count ? a('dependencies') : a('delete')" :disabled="frozen || !!row.product_count || !!row.child_count"
                @click="remove(row, $event.currentTarget as HTMLElement)"><Icon name="ion:trash-outline" size="18" /></button>
            </div>
          </li>
        </ul>
      </section>
      <form v-if="editing" ref="categoryEditor" class="regie-stack regie-category-editor" tabindex="-1" @submit.prevent="save">
        <section class="regie-surface">
          <div class="regie-row-actions regie-category-form-title">
            <h2>{{ current ? a('editCategory') : a('newCategory') }}</h2>
            <button class="regie-icon" type="button" :aria-label="a('close')" :disabled="frozen" @click="close"><Icon name="ion:close-outline" size="23" /></button>
          </div>
          <p v-if="feedback" class="regie-feedback" :data-error="failed" :role="failed ? 'alert' : 'status'">{{ a(feedback) }}</p>
          <fieldset class="regie-form-stack" :disabled="frozen">
            <div class="regie-tabs" role="group" :aria-label="a('localizedContent')">
              <button v-for="key in (['fr', 'es'] as const)" :key="key" type="button" :aria-pressed="key === language" @click="language = key">{{ a(key) }}</button>
            </div>
            <label class="regie-field"><span>{{ a('name') }} · {{ a(language) }}</span>
              <input v-model="form.names[language]" maxlength="160" :lang="language"
                @input="language === 'fr' && autoSlug && (form.slug = regieSlug(($event.target as HTMLInputElement).value))">
            </label>
            <label class="regie-field"><span>{{ a('description') }}</span><textarea v-model="form.descriptions[language]" rows="3" maxlength="5000" :lang="language" /></label>
            <label class="regie-field"><span>{{ a('alt') }}</span><input v-model="form.imageAlt[language]" maxlength="500" :lang="language"></label>
            <label class="regie-field"><span>{{ a('slug') }}</span><input v-model="form.slug" maxlength="120" required pattern="[a-z0-9]+(-[a-z0-9]+)*" @input="autoSlug = false"></label>
            <label class="regie-field"><span>{{ a('parent') }}</span><select v-model="form.parent_id" :disabled="!!current?.child_count">
              <option :value="null">{{ a('root') }}</option><option v-for="row in parentOptions" :key="row.id" :value="row.id">{{ name(row) }}</option>
            </select></label>
            <label class="regie-field"><span>{{ a('order') }}</span><input v-model.number="form.sort_order" required type="number" min="0" max="2147483647" step="1"></label>
            <label class="regie-check"><input v-model="form.is_visible" type="checkbox">{{ a('visibleToggle') }}</label>
            <label class="regie-check"><input v-model="form.is_featured" type="checkbox">{{ a('featured') }}</label>
            <p v-if="parentHidden" class="regie-callout">{{ a('categoryWarning') }}</p>
          </fieldset>
        </section>
        <AdminMedia :key="current?.id ?? 'new'" v-model="media" v-model:preparing="preparingMedia" :max="1" category :busy="frozen" />
        <div class="regie-editor-toolbar regie-category-toolbar">
          <button type="submit" class="regie-button" data-tone="primary" :disabled="frozen || preparingMedia">{{ a(frozen ? 'saving' : 'save') }}</button>
          <button type="button" class="regie-button" :disabled="frozen" @click="close">{{ a('cancel') }}</button>
        </div>
      </form>
    </div>
    <AdminConfirm ref="deleting" :title="a('deleteCategoryTitle')" :message="a('deleteCategoryBody')" :confirm-label="a('delete')" danger />
    <AdminConfirm ref="hiding" :title="a('hideCategory')" :message="a('hideCategoryBody')" :confirm-label="a('hide')" />
  </div>
</template>
