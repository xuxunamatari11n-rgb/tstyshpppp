<script setup lang="ts">
import { storefrontSelections } from '~/mocks/storefront'

const { t } = useI18n()
const localePath = useLocalePath()
const destination = useStorefrontDestination()
const whatsappUrl = useWhatsAppContact()
const trust = [
  { id: 'delivery', icon: 'ion:cube-outline' },
  { id: 'help', icon: 'ion:headset-outline' },
  { id: 'whatsapp', icon: 'ion:logo-whatsapp' },
  { id: 'discovery', icon: 'ion:compass-outline' },
] as const
</script>

<template>
  <footer>
    <section id="storefront-assistance" :aria-label="t('storefront.footer.reassurance')" class="storefront-anchor border-y border-line bg-surface">
      <UiContainer>
        <ul class="grid grid-cols-1 gap-x-6 gap-y-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:py-7">
          <li v-for="item in trust" :key="item.id" class="flex min-w-0 items-start gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-button bg-subtle">
              <Icon :name="item.icon" size="23" aria-hidden="true" />
            </span>
            <div>
              <h2 class="text-sm font-semibold">{{ t(`storefront.trust.${item.id}.title`) }}</h2>
              <p class="mt-0.5 text-sm text-muted-ink">{{ t(`storefront.trust.${item.id}.description`) }}</p>
            </div>
          </li>
        </ul>
      </UiContainer>
    </section>

    <div class="storefront-footer bg-ink text-surface">
      <UiContainer>
        <div class="grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:py-10">
          <div>
            <SharedBrandWordmark inverse />
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-line">{{ t('storefront.footer.description') }}</p>
          </div>

          <nav :aria-label="t('storefront.footer.shopping')">
            <h2 class="mb-1 font-semibold">{{ t('storefront.footer.shopping') }}</h2>
            <ul class="text-sm text-line">
              <li><NuxtLink :to="localePath({ name: 'catalogue' })" class="storefront-footer-link">{{ t('storefront.nav.explore') }}</NuxtLink></li>
              <li v-for="selection in storefrontSelections" :key="selection">
                <NuxtLink :to="localePath({ name: 'catalogue', query: { selection } })" class="storefront-footer-link">{{ t(`storefront.nav.${selection}`) }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <nav :aria-label="t('storefront.nav.assistance')">
            <h2 class="mb-1 font-semibold">{{ t('storefront.nav.assistance') }}</h2>
            <ul class="text-sm text-line">
              <li><a href="#storefront-assistance" class="storefront-footer-link">{{ t('storefront.footer.help') }}</a></li>
              <li><NuxtLink :to="destination('account')" :aria-disabled="!destination('account') || undefined" class="storefront-footer-link">{{ t('storefront.nav.account') }}</NuxtLink></li>
            </ul>
            <NuxtLink v-if="whatsappUrl" :to="whatsappUrl" external class="storefront-footer-link gap-2 text-sm text-brand">
              <Icon name="ion:logo-whatsapp" size="20" aria-hidden="true" /> {{ t('storefront.footer.contactWhatsApp') }}
            </NuxtLink>
            <p v-else class="mt-2 flex items-center gap-2 text-sm text-line">
              <Icon name="ion:logo-whatsapp" size="20" aria-hidden="true" /> {{ t('storefront.footer.whatsappPending') }}
            </p>
          </nav>

          <nav :aria-label="t('storefront.footer.legal')">
            <h2 class="mb-1 font-semibold">{{ t('storefront.footer.legal') }}</h2>
            <ul class="text-sm text-line">
              <li><NuxtLink :to="destination('legal')" :aria-disabled="!destination('legal') || undefined" class="storefront-footer-link">{{ t('storefront.nav.legal') }}</NuxtLink></li>
              <li><NuxtLink :to="destination('privacy')" :aria-disabled="!destination('privacy') || undefined" class="storefront-footer-link">{{ t('storefront.nav.privacy') }}</NuxtLink></li>
            </ul>
          </nav>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-x-4 border-t border-white/20 py-2">
          <p class="text-xs text-line">{{ t('storefront.footer.copyright') }}</p>
          <SharedLanguageSwitcher />
        </div>
      </UiContainer>
    </div>
  </footer>
</template>

