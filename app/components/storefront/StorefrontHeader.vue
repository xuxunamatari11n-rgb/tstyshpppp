<script setup lang="ts">
import { useStorefrontDestination } from '~/composables/useStorefrontDestination'
withDefaults(defineProps<{ cartCount?: number }>(), { cartCount: 0 })
const { t } = useI18n()
const destination = useStorefrontDestination()
const { query, recents, submit } = useStorefrontSearch()
const mobileSearch = useTemplateRef('mobileSearch')
const mobileDrawer = useTemplateRef('mobileDrawer')
const mobileHeader = useTemplateRef('mobileHeader')
const drawerId = useId()
const compact = useStorefrontMobileHeader(mobileHeader)
const whatsappUrl = useWhatsAppContact()
const { settings } = useShopMeta()
const route = useRoute()
const assistance = computed(() => ({ path: route.path, query: route.query, hash: '#storefront-assistance' }))

function openDrawer(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLElement) void mobileDrawer.value?.open(event.currentTarget)
}

function openSearch(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLElement) void mobileSearch.value?.open(event.currentTarget)
}
</script>

<template>
  <div class="storefront-announcement hidden bg-ink text-surface lg:block">
    <UiContainer class="flex min-h-8 items-center justify-between gap-4 text-xs">
      <p>{{ settings?.announcement || t('storefront.announcement') }}</p>
      <div class="flex shrink-0 items-center gap-5">
        <a href="#storefront-assistance" class="storefront-text-link inline-flex min-h-8 items-center gap-1.5">
          <Icon name="ion:headset-outline" size="15" aria-hidden="true" /> {{ t('storefront.nav.assistance') }}
        </a>
        <SharedLanguageSwitcher compact class="border-s border-white/25 ps-4" />
      </div>
    </UiContainer>
  </div>

  <header class="storefront-header sticky top-0 z-40">
    <div class="hidden bg-surface lg:block">
      <UiContainer class="relative z-10 grid min-h-[82px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-7 xl:gap-12">
        <SharedBrandWordmark />
        <StorefrontDesktopSearch v-model="query" :recents="recents" @submit="submit" />
        <nav :aria-label="t('storefront.nav.actions')" class="flex items-center gap-2">
          <NuxtLink
            v-for="action in [{ route: 'favorites', icon: 'ion:heart-outline' }, { route: 'account', icon: 'ion:person-outline' }]"
            :key="action.route"
            :to="destination(action.route)"
            :aria-disabled="!destination(action.route) || undefined"
            :title="t(`storefront.nav.${action.route}`)"
            class="storefront-action"
          >
            <Icon :name="action.icon" size="24" aria-hidden="true" />
            <span>{{ t(`storefront.nav.${action.route}`) }}</span>
          </NuxtLink>
          <StorefrontCart :count="cartCount" show-label />
        </nav>
      </UiContainer>
      <StorefrontCommercialNav />
    </div>

    <slot name="mobile">
      <div ref="mobileHeader" class="storefront-mobile-header lg:hidden" :data-compact="compact">
        <UiContainer class="storefront-mobile-brand-row" :inert="compact">
          <button
            type="button"
            class="storefront-mobile-utility"
            :aria-label="t('storefront.drawer.open')"
            aria-haspopup="dialog"
            :aria-controls="drawerId"
            @click="openDrawer"
          >
            <Icon name="ion:menu-outline" size="26" aria-hidden="true" />
          </button>
          <SharedBrandWordmark class="storefront-mobile-wordmark" />
          <div class="storefront-mobile-brand-actions">
            <SharedLanguageSwitcher compact />
            <NuxtLink
              :to="whatsappUrl || assistance"
              :external="Boolean(whatsappUrl)"
              class="storefront-mobile-utility"
              :aria-label="whatsappUrl ? t('storefront.footer.contactWhatsApp') : t('storefront.drawer.whatsappFallback')"
            >
              <Icon name="ion:logo-whatsapp" size="23" aria-hidden="true" />
            </NuxtLink>
          </div>
        </UiContainer>
        <UiContainer class="storefront-mobile-search-row">
          <button
            type="button"
            class="storefront-search-field storefront-mobile-search-trigger w-full gap-3 px-3 text-start text-muted-ink"
            aria-haspopup="dialog"
            :aria-label="query ? t('storefront.search.openWithQuery', { query }) : undefined"
            @click="openSearch"
          >
            <Icon name="ion:search-outline" size="22" aria-hidden="true" />
            <span class="min-w-0 truncate font-normal">{{ query || t('storefront.search.placeholder') }}</span>
          </button>
        </UiContainer>
        <div class="storefront-mobile-shortcut-row" :inert="compact">
          <StorefrontMobileShortcuts class="storefront-header-shortcuts" />
        </div>
      </div>
    </slot>
  </header>
  <template v-if="!$slots.mobile">
    <StorefrontMobileDrawer :id="drawerId" ref="mobileDrawer" />
    <StorefrontMobileSearch ref="mobileSearch" v-model="query" :recents="recents" @submit="submit" />
  </template>
</template>

