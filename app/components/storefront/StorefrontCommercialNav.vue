<script setup lang="ts">
import { storefrontCategories, storefrontFeaturedCategory, storefrontSelections } from '~/mocks/storefront'
import promotionImage from '~/assets/design-system/tech-accessories.webp'

const { t } = useI18n()
const localePath = useLocalePath()
const root = useTemplateRef('root')
const trigger = useTemplateRef('trigger')
const panel = useTemplateRef('panel')
const panelId = useId()
const open = ref(false)
const categoryIndex = ref(0)
const category = computed(() => storefrontCategories[categoryIndex.value] ?? storefrontCategories[0])
const route = useRoute()
const routeBaseName = useRouteBaseName()
const activeSelection = computed(() => routeBaseName(route) === 'catalogue' ? route.query.selection : undefined)

function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}

async function focusCategory(index: number) {
  categoryIndex.value = index
  await nextTick()
  panel.value?.querySelectorAll<HTMLElement>('[data-primary-category]')[index]?.focus()
}

function toggle() {
  if (open.value) close(true)
  else {
    open.value = true
    void focusCategory(categoryIndex.value)
  }
}

function moveCategory(event: KeyboardEvent, index: number) {
  const last = storefrontCategories.length - 1
  const next = { ArrowDown: (index + 1) % (last + 1), ArrowUp: (index + last) % (last + 1), Home: 0, End: last }
  if (!(event.key in next)) return
  event.preventDefault()
  void focusCategory(next[event.key as keyof typeof next])
}

const { onEscape, onFocusOut } = useStorefrontDisclosure(root, open, close)
const motion = useStorefrontTransition()
</script>

<template>
  <div ref="root" class="relative border-y border-line" @focusout="onFocusOut" @keydown.esc="onEscape">
    <UiContainer>
      <nav :aria-label="t('storefront.nav.commercial')" class="flex min-h-[50px] items-center gap-7">
        <button
          ref="trigger"
          type="button"
          class="ui-button storefront-categories"
          data-variant="primary"
          :aria-expanded="open"
          :aria-controls="panelId"
          @click="toggle"
        >
          <Icon name="ion:grid-outline" size="19" aria-hidden="true" />
          {{ t('storefront.nav.allCategories') }}
          <Icon name="ion:chevron-down-outline" size="16" aria-hidden="true" />
        </button>
        <NuxtLink
          v-for="selection in storefrontSelections"
          :key="selection"
          :to="localePath({ name: 'catalogue', query: { selection } })"
          :aria-current="activeSelection === selection ? 'page' : undefined"
          class="storefront-text-link inline-flex min-h-11 items-center text-sm font-medium"
          :class="{ underline: activeSelection === selection }"
        >
          {{ t(`storefront.nav.${selection}`) }}
        </NuxtLink>
      </nav>
    </UiContainer>

    <Transition v-bind="motion" :css="false">
      <div v-show="open" :id="panelId" ref="panel" :inert="!open" class="absolute inset-x-0 top-full mt-2">
        <UiContainer>
          <section :aria-label="t('storefront.nav.allCategories')" class="storefront-panel mega-grid grid max-h-[min(74vh,38rem)] overflow-y-auto">
            <ul class="grid content-start gap-1 bg-subtle p-3">
              <li v-for="(entry, index) in storefrontCategories" :key="entry.id">
                <button
                  type="button"
                  class="storefront-category-option"
                  data-primary-category
                  :aria-pressed="categoryIndex === index"
                  @click="categoryIndex = index"
                  @keydown="moveCategory($event, index)"
                >
                  {{ t(`storefront.categories.${entry.id}`) }}
                  <Icon name="ion:chevron-forward-outline" size="16" aria-hidden="true" />
                </button>
              </li>
            </ul>

            <div class="min-w-0 p-5">
              <h2 class="mb-2 text-lg font-semibold">{{ t(`storefront.categories.${category.id}`) }}</h2>
              <NuxtLink
                :to="localePath({ name: 'catalogue', query: { category: category.slug } })"
                class="storefront-text-link inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
                @click="close()"
              >
                {{ t('storefront.nav.viewCategory') }}
                <Icon name="ion:arrow-forward-outline" size="17" aria-hidden="true" />
              </NuxtLink>
              <ul class="mt-2 border-t border-line pt-2">
                <li v-for="id in category.subcategories" :key="id">
                  <NuxtLink
                    :to="localePath({ name: 'catalogue', query: { category: category.slug, subcategory: id } })"
                    class="storefront-suggestion"
                    @click="close()"
                  >{{ t(`storefront.subcategories.${id}`) }}</NuxtLink>
                </li>
              </ul>
            </div>

            <div class="p-3 ps-0">
              <NuxtLink
                :to="localePath({ name: 'catalogue', query: { category: storefrontFeaturedCategory.slug } })"
                class="block overflow-hidden rounded-standard bg-brand text-brand-foreground"
                @click="close()"
              >
                <img :src="promotionImage" width="768" height="768" loading="lazy" alt="" class="aspect-[5/3] w-full object-cover">
                <span class="flex min-h-14 items-center justify-between gap-2 px-4 py-3 font-semibold">
                  {{ t('storefront.nav.discoverTech') }}
                  <Icon name="ion:arrow-forward-outline" size="20" aria-hidden="true" />
                </span>
              </NuxtLink>
            </div>
          </section>
        </UiContainer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mega-grid {
  grid-template-columns: minmax(0, 25fr) minmax(0, 45fr) minmax(0, 30fr);
}
</style>

