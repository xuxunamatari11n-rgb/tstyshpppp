<script setup lang="ts">
import type { AdminCategory, AdminProductPage, AdminProductRow } from '~~/shared/types/admin'
definePageMeta({ name: 'regie-products', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin/produits', es: '/admin/productos' } } })
const a = useRegieText()
const refreshRegieStorefront = useRegieStorefrontRefresh()
const { locale } = useI18n()
const path = useLocalePath()
const route = useRoute()
const request = useRequestFetch()
const input = ref('')
const search = ref('')
const category = ref('')
const visibility = ref('')
const availability = ref('')
const sort = ref('')
const page = ref(0)
const attention = ref(route.query.attention === '1')
const selection = ref<string[]>([])
const busy = ref(false)
const notice = ref('')
const failed = ref(false)
const deleting = useTemplateRef('deleting')
const query = computed(() => ({ q: search.value, category: category.value || undefined, visibility: visibility.value,
  availability: availability.value, sort: sort.value, page: page.value, attention: attention.value }))
watch([search, category, visibility, availability, sort, attention], () => { page.value = 0 }, { flush: 'sync' })
watch(query, () => { selection.value = [] })
const { data: categories } = useAsyncData('regie-product-filter-categories', () => request<AdminCategory[]>('/api/regie/categories'), { default: () => [] })
const { data, error, status, refresh } = await useAsyncData('regie-catalogue', () => request<AdminProductPage>('/api/regie/products', { query: query.value }),
  { watch: [query] })
const rows = computed(() => data.value?.products ?? [])
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 24)))
function categoryLabel(item: AdminCategory) {
  return (item.parent_id ? '↳ ' : '') + (item.translations.find(text => text.locale === locale.value)?.name
    ?? item.translations.find(text => text.locale === 'fr')?.name ?? item.slug)
}
function toggle(id: string) {
  selection.value = selection.value.includes(id) ? selection.value.filter(key => key !== id) : [...selection.value, id]
}
function togglePage() {
  selection.value = rows.value.every(row => selection.value.includes(row.id)) ? [] : rows.value.map(row => row.id)
}
async function updateVisibility(ids: string[], visible: boolean) {
  if (busy.value || !ids.length) return
  busy.value = true
  failed.value = false
  notice.value = ''
  try {
    const results: PromiseSettledResult<unknown>[] = []
    for (let i = 0; i < ids.length; i += 4) {
      results.push(...await Promise.allSettled(ids.slice(i, i + 4).map(id =>
        $fetch('/api/regie/products/' + id + '/visibility', { method: 'POST', body: { visible } }))))
    }
    const failures = results.filter(result => result.status === 'rejected')
    selection.value = ids.filter((_, index) => results[index]?.status === 'rejected')
    failed.value = !!failures.length
    notice.value = ids.length === 1
      ? (failures[0]?.status === 'rejected' ? a(regieError(failures[0].reason)) : a('visibilitySaved'))
      : (ids.length - failures.length) + ' ' + a('successCount') + ' · ' + failures.length + ' ' + a('failCount') +
        (failures[0]?.status === 'rejected' ? ' — ' + a(regieError(failures[0].reason)) : '')
    await refresh()
    await refreshRegieStorefront()
    if (!rows.value.length && page.value) page.value = Math.min(page.value - 1, pages.value - 1)
  } finally { busy.value = false }
}
async function remove(item: AdminProductRow, trigger: HTMLElement) {
  if (busy.value || !await deleting.value?.ask(trigger, item.name_fr ?? item.slug)) return
  busy.value = true
  failed.value = false
  try {
    await $fetch('/api/regie/products/' + item.id, { method: 'DELETE', query: { version: item.updated_at } })
    notice.value = a('deleted')
    selection.value = selection.value.filter(id => id !== item.id)
    await refresh()
    await refreshRegieStorefront()
    if (!rows.value.length && page.value) page.value--
  } catch (error) { notice.value = a(regieError(error)); failed.value = true }
  finally { busy.value = false }
}
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title regie-title-actions">
      <div><h1>{{ a('products') }}</h1><p v-if="data">{{ data.total }} {{ a('productCount') }}</p></div>
      <NuxtLink :to="path('regie-products-new')" class="regie-button" data-tone="primary">
        <Icon name="ion:add-outline" size="19" aria-hidden="true" />{{ a('newProduct') }}
      </NuxtLink>
    </header>
    <section class="regie-surface regie-table-surface" :aria-label="a('products')" :aria-busy="status === 'pending' || busy">
      <div class="regie-filters">
        <div class="regie-tabs" role="group" :aria-label="a('visibility')">
          <button v-for="tab in [{ key: '', label: a('all') }, { key: 'public', label: a('public') }, { key: 'hidden', label: a('hidden') }, { key: 'blocked', label: a('blocked') }]"
            :key="tab.key" type="button" :aria-pressed="visibility === tab.key" @click="visibility = tab.key">{{ tab.label }}</button>
        </div>
        <form class="regie-filter-grid" @submit.prevent="search = input.trim()">
          <label class="regie-field regie-filter-search"><span>{{ a('filterSearch') }}</span>
            <span><input v-model="input" type="search" maxlength="100" :placeholder="a('search')" @search="search = input.trim()">
              <button type="submit" class="regie-icon" :aria-label="a('filterSearch')"><Icon name="ion:search-outline" size="19" /></button></span>
          </label>
          <label class="regie-field"><span>{{ a('category') }}</span><select v-model="category"><option value="">{{ a('allCategories') }}</option>
            <option v-for="item in categories" :key="item.id" :value="item.id">{{ categoryLabel(item) }}</option>
          </select></label>
          <label class="regie-field"><span>{{ a('availability') }}</span><select v-model="availability"><option value="">{{ a('all') }}</option>
            <option value="available">{{ a('available') }}</option><option value="unavailable">{{ a('notAvailable') }}</option><option value="stock">{{ a('outOfStock') }}</option>
          </select></label>
          <label class="regie-field"><span>{{ a('sort') }}</span><select v-model="sort"><option value="">{{ a('recentSort') }}</option>
            <option value="name">{{ a('nameSort') }}</option><option value="price-asc">{{ a('priceAsc') }}</option><option value="price-desc">{{ a('priceDesc') }}</option>
          </select></label>
        </form>
        <label class="regie-check"><input v-model="attention" type="checkbox">{{ a('attention') }}</label>
      </div>
      <div v-if="selection.length" class="regie-bulk">
        <strong>{{ selection.length }} {{ a('selected') }}</strong>
        <button type="button" class="regie-button" :disabled="busy" @click="updateVisibility(selection, true)">{{ a('publishBulk') }}</button>
        <button type="button" class="regie-button" :disabled="busy" @click="updateVisibility(selection, false)">{{ a('hideBulk') }}</button>
        <button type="button" class="regie-button" :disabled="busy" @click="selection = []">{{ a('clear') }}</button>
      </div>
      <p v-if="notice" class="regie-feedback" :data-error="failed" :role="failed ? 'alert' : 'status'">{{ notice }}</p>
      <div v-if="error" class="regie-empty" role="alert">{{ a(regieError(error)) }} <button class="regie-button" type="button" @click="refresh()">{{ a('retry') }}</button></div>
      <p v-else-if="!data" class="regie-empty" role="status">{{ a('loading') }}</p>
      <AdminProductTable v-else :rows="rows" :categories="categories" :selected="selection" :busy="busy || status === 'pending'" :attention="attention"
        @toggle="toggle" @toggle-page="togglePage" @visibility="(row, visible) => updateVisibility([row.id], visible)" @delete="remove" />
      <footer v-if="pages > 1" class="regie-pagination">
        <button type="button" class="regie-button" :disabled="page === 0 || status === 'pending'" @click="page--">{{ a('previous') }}</button>
        <span>{{ a('page') }} {{ page + 1 }} / {{ pages }}</span>
        <button type="button" class="regie-button" :disabled="page + 1 >= pages || status === 'pending'" @click="page++">{{ a('next') }}</button>
      </footer>
    </section>
    <AdminConfirm ref="deleting" :title="a('deleteProductTitle')" :message="a('deleteProductBody')" :confirm-label="a('delete')" danger />
  </div>
</template>
