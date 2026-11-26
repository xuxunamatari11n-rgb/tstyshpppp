<script setup lang="ts">
withDefaults(defineProps<{ cartCount?: number }>(), { cartCount: 0 })
const { t } = useI18n()
const destination = useStorefrontDestination()
const { query, recents, submit } = useStorefrontSearch()
const mobileSearch = useTemplateRef('mobileSearch')

function openSearch(event: MouseEvent) {
  if (event.currentTarget instanceof HTMLElement) void mobileSearch.value?.open(event.currentTarget)
}
</script>

<template>
  <div class="storefront-announcement hidden bg-ink text-surface lg:block">
    <UiContainer class="flex min-h-8 items-center justify-between gap-4 text-xs">
      <p>{{ t('storefront.announcement') }}</p>
      <div class="flex shrink-0 items-center gap-5">
        <a href="#storefront-assistance" class="storefront-text-link inline-flex min-h-8 items-center gap-1.5">
          <Icon name="ion:headset-outline" size="15" aria-hidden="true" /> {{ t('storefront.nav.assistance') }}
        </a>
        <SharedLanguageSwitcher compact class="border-s border-white/25 ps-4" />
      </div>
    </UiContainer>
  </div>

  <header class="sticky top-0 z-40 bg-surface">
    <div class="hidden lg:block">
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

    <div class="border-b border-line lg:hidden">
      <UiContainer class="pb-2.5">
        <div class="flex min-h-14 items-center justify-between gap-2">
          <SharedBrandWordmark />
          <div class="flex shrink-0 items-center gap-1">
            <SharedLanguageSwitcher compact />
            <StorefrontCart :count="cartCount" />
          </div>
        </div>
        <button
          type="button"
          class="storefront-search-field w-full gap-3 px-3 text-start text-muted-ink"
          aria-haspopup="dialog"
          :aria-label="query ? t('storefront.search.openWithQuery', { query }) : undefined"
          @click="openSearch"
        >
          <Icon name="ion:search-outline" size="22" aria-hidden="true" />
          <span class="min-w-0 truncate font-normal">{{ query || t('storefront.search.placeholder') }}</span>
        </button>
      </UiContainer>
      <StorefrontMobileSearch ref="mobileSearch" v-model="query" :recents="recents" @submit="submit" />
    </div>
  </header>
</template>

