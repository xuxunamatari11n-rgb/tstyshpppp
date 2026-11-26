<script setup lang="ts">
import type { CategoryId, CollectionId } from '~/types/commerce'
import { catalogueCategories, cataloguePriceRange, findCatalogueCategory, type CatalogueFilters } from '~/utils/catalogue'

type FilterUpdate = CatalogueFilters & { selection?: CollectionId }
const props = defineProps<{ modelValue: FilterUpdate; draft?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: FilterUpdate] }>()
const { t } = useI18n()
const localPrice = reactive({ min: '', max: '' })
watch(() => [props.modelValue.min, props.modelValue.max] as const, ([min, max]) => {
  Object.assign(localPrice, { min, max })
}, { immediate: true })
const prices = computed(() => props.draft ? props.modelValue : localPrice)
const error = computed(() => cataloguePriceRange(prices.value).error)
const category = computed(() => props.modelValue.categories.length === 1
  ? findCatalogueCategory(props.modelValue.categories[0]) : undefined)
const subcategories = computed(() => [
  { value: '', label: t('catalogue.allSubcategories') },
  ...(category.value?.subcategories ?? []).map(id => ({ value: id, label: t(`storefront.subcategories.${id}`) })),
])

function patch(update: Partial<FilterUpdate>) {
  const { categories, subcategory, min, max, stock, promo, new: newArrivals, selection } = props.modelValue
  emit('update:modelValue', { categories, subcategory, min, max, stock, promo, new: newArrivals, selection, ...update })
}

function toggleCommercial(flag: 'promo' | 'new', enabled: boolean) {
  const correspondingSelection = flag === 'promo' ? 'promotions' : 'new'
  const selection = !enabled && props.modelValue.selection === correspondingSelection
    ? undefined : props.modelValue.selection
  patch({ [flag]: enabled, selection })
}

function toggleCategory(id: CategoryId, checked: boolean) {
  const current = props.modelValue.categories
  patch({ categories: checked ? [...current, id] : current.filter(category => category !== id), subcategory: '' })
}

function setPrice(key: 'min' | 'max', value: string) {
  if (props.draft) patch({ [key]: value })
  else localPrice[key] = value
}

function applyPrice() {
  if (!error.value) patch(localPrice)
}
</script>

<template>
  <div class="catalogue-filter-groups">
    <details open class="catalogue-filter-group">
      <summary>
        {{ t('catalogue.categories') }}
        <Icon name="ion:chevron-down-outline" size="16" aria-hidden="true" />
      </summary>
      <div class="catalogue-filter-fields">
        <UiCheckbox
          v-for="entry in catalogueCategories"
          :key="entry.id"
          :label="t(`storefront.categories.${entry.id}`)"
          :model-value="modelValue.categories.includes(entry.id)"
          @update:model-value="toggleCategory(entry.id, $event)"
        />
        <UiSelect
          v-if="category"
          :label="t('catalogue.subcategories')"
          :options="subcategories"
          :model-value="modelValue.subcategory"
          @update:model-value="patch({ subcategory: $event })"
        />
      </div>
    </details>

    <details open class="catalogue-filter-group">
      <summary>
        {{ t('catalogue.price') }}
        <Icon name="ion:chevron-down-outline" size="16" aria-hidden="true" />
      </summary>
      <form class="catalogue-filter-fields" @submit.prevent="draft ? undefined : applyPrice()">
        <div class="catalogue-price-fields">
          <UiInput
            :model-value="prices.min" :label="t('catalogue.min')" inputmode="numeric" maxlength="16"
            :error="error ? t(`catalogue.priceErrors.${error}`) : undefined"
            @update:model-value="setPrice('min', $event)"
          />
          <UiInput
            :model-value="prices.max" :label="t('catalogue.max')" inputmode="numeric" maxlength="16"
            :error="error ? t(`catalogue.priceErrors.${error}`) : undefined"
            @update:model-value="setPrice('max', $event)"
          />
        </div>
        <UiButton v-if="!draft" type="submit" variant="outline" :disabled="Boolean(error) || (prices.min === modelValue.min && prices.max === modelValue.max)">
          {{ t('catalogue.applyPrice') }}
        </UiButton>
      </form>
    </details>

    <details open class="catalogue-filter-group">
      <summary>
        {{ t('catalogue.refine') }}
        <Icon name="ion:chevron-down-outline" size="16" aria-hidden="true" />
      </summary>
      <div class="catalogue-filter-fields">
        <UiCheckbox :model-value="modelValue.stock" :label="t('catalogue.stock')" @update:model-value="patch({ stock: $event })" />
        <UiCheckbox :model-value="modelValue.promo || modelValue.selection === 'promotions'" :label="t('storefront.nav.promotions')" @update:model-value="toggleCommercial('promo', $event)" />
        <UiCheckbox :model-value="modelValue.new || modelValue.selection === 'new'" :label="t('storefront.nav.new')" @update:model-value="toggleCommercial('new', $event)" />
      </div>
    </details>
  </div>
</template>
