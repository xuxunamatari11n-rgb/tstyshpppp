<script setup lang="ts">
import { featuredCategories } from '~/mocks/home'
import { storefrontCategories } from '~/mocks/storefront'

const { id } = defineProps<{ id: string }>()
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const destination = useStorefrontDestination()
const catalogue = useHomeCatalogueLink()
const whatsappUrl = useWhatsAppContact()
const assistance = computed(() => ({ path: route.path, query: route.query, hash: '#storefront-assistance' }))
const account = computed(() => destination('account'))
const thumbnails = new Map(featuredCategories.map(category => [category.id, category.image.src]))
const dialog = useTemplateRef('dialog')
const closeButton = useTemplateRef('closeButton')
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(dialog, closeButton)
const motion = useStorefrontTransition(-46, 'x', true)

function closeForCurrentLink(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null
  if (!(link instanceof HTMLAnchorElement)) return
  if (link.href === window.location.href || link.origin !== window.location.origin) close(false)
}

defineExpose({ open })
</script>

<template>
  <dialog
    :id="id"
    ref="dialog"
    class="storefront-drawer"
    :aria-label="t('storefront.drawer.title')"
    @click.self="close()"
    @cancel.prevent="close()"
    @keydown.tab="trapFocus"
  >
    <Transition v-bind="motion" :css="false" @after-leave="finishClose">
      <div v-show="active" class="storefront-drawer-panel" @click="closeForCurrentLink">
        <div class="storefront-drawer-header">
          <SharedBrandWordmark />
          <button ref="closeButton" type="button" class="storefront-mobile-utility" :aria-label="t('storefront.drawer.close')" @click="close()">
            <Icon name="ion:close-outline" size="26" aria-hidden="true" />
          </button>
        </div>

        <section class="storefront-drawer-group" data-drawer-group>
          <slot name="customer">
            <h2 class="storefront-drawer-heading">{{ t('storefront.drawer.welcome') }}</h2>
            <div v-if="account" class="storefront-drawer-account">
              <NuxtLink :to="{ path: account, query: { intent: 'sign-in' } }" class="ui-button" data-variant="primary">
                {{ t('storefront.drawer.signIn') }}
              </NuxtLink>
              <NuxtLink :to="{ path: account, query: { intent: 'create-account' } }" class="ui-button" data-variant="outline">
                {{ t('storefront.drawer.createAccount') }}
              </NuxtLink>
            </div>
          </slot>
        </section>

        <section class="storefront-drawer-group" data-drawer-group>
          <h2 class="storefront-drawer-heading">{{ t('storefront.drawer.discovery') }}</h2>
          <StorefrontMobileShortcuts class="storefront-drawer-shortcuts" />
        </section>

        <nav class="storefront-drawer-group" :aria-label="t('storefront.drawer.categories')" data-drawer-group>
          <h2 class="storefront-drawer-heading">{{ t('storefront.drawer.categories') }}</h2>
          <ul>
            <li v-for="category in storefrontCategories" :key="category.id" class="storefront-drawer-category">
              <NuxtLink :to="catalogue({ categoryId: category.id })" class="storefront-drawer-link storefront-drawer-category-link">
                <span class="storefront-drawer-thumbnail">
                  <img v-if="thumbnails.has(category.id)" :src="thumbnails.get(category.id)" width="34" height="34" loading="lazy" alt="">
                  <Icon v-else name="ion:grid-outline" size="17" aria-hidden="true" />
                </span>
                {{ t(`storefront.categories.${category.id}`) }}
              </NuxtLink>
              <details v-if="category.subcategories.length" :name="id" class="storefront-drawer-subcategories">
                <summary class="storefront-mobile-utility" :aria-label="t('storefront.drawer.subcategories', { category: t(`storefront.categories.${category.id}`) })">
                  <Icon name="ion:chevron-down-outline" size="16" aria-hidden="true" />
                </summary>
                <ul>
                  <li v-for="subcategory in category.subcategories" :key="subcategory">
                    <NuxtLink :to="localePath({ name: 'catalogue', query: { category: category.slug, subcategory } })" class="storefront-drawer-link">
                      {{ t(`storefront.subcategories.${subcategory}`) }}
                    </NuxtLink>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </nav>

        <nav class="storefront-drawer-group" :aria-label="t('storefront.nav.assistance')" data-drawer-group>
          <h2 class="storefront-drawer-heading">{{ t('storefront.nav.assistance') }}</h2>
          <ul>
            <li>
              <NuxtLink :to="whatsappUrl || assistance" :external="Boolean(whatsappUrl)" class="storefront-drawer-link">
                <Icon name="ion:receipt-outline" size="20" aria-hidden="true" /> {{ t('storefront.drawer.orders') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="whatsappUrl || assistance" :external="Boolean(whatsappUrl)" class="storefront-drawer-link">
                <Icon name="ion:logo-whatsapp" size="20" aria-hidden="true" />
                <span>{{ t('storefront.footer.contactWhatsApp') }}<small v-if="!whatsappUrl" class="block text-muted-ink">{{ t('storefront.footer.whatsappPending') }}</small></span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="assistance" class="storefront-drawer-link">
                <Icon name="ion:headset-outline" size="20" aria-hidden="true" /> {{ t('storefront.footer.help') }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="storefront-drawer-group" data-drawer-group>
          <p class="storefront-drawer-heading">{{ t('language') }}</p>
          <SharedLanguageSwitcher />
        </div>
      </div>
    </Transition>
  </dialog>
</template>
