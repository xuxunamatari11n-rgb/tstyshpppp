<script setup lang="ts">
import type { AdminCategory, AdminProductRow } from '~~/shared/types/admin'
const props = defineProps<{ rows: AdminProductRow[]; categories: AdminCategory[]; selected?: string[]; busy?: boolean; attention?: boolean }>()
const emit = defineEmits<{ toggle: [id: string]; togglePage: []; visibility: [row: AdminProductRow, visible: boolean]; delete: [row: AdminProductRow, trigger: HTMLElement] }>()
const a = useRegieText()
const { locale } = useI18n()
const path = useLocalePath()
const price = useShopPrice()
const dates = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }))
function categoryName(id: string) {
  const category = props.categories.find(item => item.id === id)
  return category?.translations.find(text => text.locale === locale.value)?.name ??
    category?.translations.find(text => text.locale === 'fr')?.name ?? category?.slug
}
function name(row: AdminProductRow) {
  return (locale.value === 'es' && row.name_es) || row.name_fr || row.slug
}
function closeMenu(event: Event) {
  const menu = (event.currentTarget as HTMLElement).closest('details')
  if (menu) menu.open = false
  return menu?.querySelector('summary') ?? event.currentTarget as HTMLElement
}
</script>

<template>
  <p v-if="!rows.length" class="regie-empty">{{ a('empty') }}</p>
  <table v-else class="regie-table">
    <thead>
      <tr>
        <th v-if="selected" class="regie-check-cell"><input type="checkbox" :aria-label="a('selectPage')"
          :checked="rows.every(row => selected?.includes(row.id))" :indeterminate.prop="rows.some(row => selected?.includes(row.id)) && !rows.every(row => selected?.includes(row.id))"
          :disabled="busy" @change="emit('togglePage')"></th>
        <th scope="col">{{ a('product') }}</th>
        <th scope="col" class="regie-table-category">{{ a('category') }}</th>
        <th scope="col">{{ a('price') }}</th>
        <th scope="col">{{ a('publication') }} / {{ a('availability') }}</th>
        <th scope="col" class="regie-table-date">{{ a(attention ? 'attention' : 'updated') }}</th>
        <th scope="col"><span class="sr-only">{{ a('actions') }}</span></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td v-if="selected" class="regie-check-cell"><input type="checkbox" :aria-label="a('select') + ' ' + name(row)"
          :checked="selected.includes(row.id)" :disabled="busy" @change="emit('toggle', row.id)"></td>
        <th scope="row" class="regie-table-product">
          <NuxtLink :to="path({ name: 'regie-products-edit', params: { id: row.id } })" class="regie-cell-product">
            <span class="regie-thumb"><img v-if="row.src" :src="row.src" alt="" width="38" height="38" loading="lazy"><Icon v-else name="ion:image-outline" size="17" /></span>
            <span><strong>{{ name(row) }}</strong><small>{{ row.sku || row.slug }}</small></span>
          </NuxtLink>
        </th>
        <td class="regie-table-category">{{ categoryName(row.category_id) }}</td>
        <td class="regie-table-price"><UiNumericText :value="price(row.price)" /></td>
        <td class="regie-table-status"><AdminStatus :public="row.is_public" :visible="row.is_visible" :availability="row.is_available" :stock="row.stock_quantity" /></td>
        <td v-if="attention" class="regie-table-attention">
          <span v-if="!row.thumbnail">{{ a('missingImage') }}</span>
          <span v-if="!row.french">{{ a('missingFrench') }}</span>
          <span v-if="!row.spanish">{{ a('missingSpanish') }}</span>
          <span v-if="row.is_visible && !row.is_public">{{ a('blocked') }}</span>
        </td>
        <td v-else class="regie-table-date"><time :datetime="row.updated_at">{{ dates.format(new Date(row.updated_at)) }}</time></td>
        <td class="regie-table-action">
          <details v-if="selected" class="regie-menu" @keydown.esc.prevent="closeMenu($event)?.focus()">
            <summary class="regie-icon" :aria-label="a('actions') + ' ' + name(row)"><Icon name="ion:ellipsis-horizontal" size="21" aria-hidden="true" /></summary>
            <div class="regie-menu-content">
              <NuxtLink :to="path({ name: 'regie-products-edit', params: { id: row.id } })" @click="closeMenu">{{ a('edit') }}</NuxtLink>
              <NuxtLink v-if="row.is_public" :to="path({ name: 'product', params: { slug: row.slug } })" @click="closeMenu">{{ a('viewProduct') }}</NuxtLink>
              <button type="button" :disabled="busy || (!row.is_visible && (!row.category_public || !row.french))"
                @click="closeMenu($event)?.focus(); emit('visibility', row, !row.is_visible)">{{ a(row.is_visible ? 'hide' : 'publish') }}</button>
              <button type="button" class="regie-danger-text" :disabled="busy" @click="emit('delete', row, closeMenu($event))">{{ a('delete') }}</button>
            </div>
          </details>
          <NuxtLink v-else class="regie-icon" :to="path({ name: 'regie-products-edit', params: { id: row.id } })" :aria-label="a('edit') + ' ' + name(row)">
            <Icon name="ion:create-outline" size="18" aria-hidden="true" />
          </NuxtLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>
