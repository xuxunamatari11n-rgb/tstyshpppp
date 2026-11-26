<script setup lang="ts">
import headphonesImage from '~/assets/design-system/wireless-headphones.webp'
import accessoriesImage from '~/assets/design-system/tech-accessories.webp'
import type { BadgeVariant, ButtonVariant } from '~/types/ui'

definePageMeta({ layout: false })

const { t } = useI18n()
useSeoMeta({ title: () => t('guide.title'), robots: 'noindex, nofollow' })

const sections = ['specimens', 'palette', 'typography', 'actions', 'forms', 'feedback', 'layout'] as const
const swatches = [
  { token: 'brand', hex: '#C8F135' },
  { token: 'brand-hover', hex: '#B5DC24' },
  { token: 'brand-foreground', hex: '#151515' },
  { token: 'ink', hex: '#151515' },
  { token: 'muted', hex: '#717171' },
  { token: 'canvas', hex: '#FAFAFA' },
  { token: 'surface', hex: '#FFFFFF' },
  { token: 'line', hex: '#E5E5E5' },
  { token: 'subtle', hex: '#F2F2F2' },
  { token: 'success', hex: '#16803C' },
  { token: 'danger', hex: '#DC2626' },
  { token: 'whatsapp', hex: '#25D366' },
] as const

const buttons = [
  { variant: 'primary', icon: 'ion:arrow-forward-outline' },
  { variant: 'secondary' },
  { variant: 'outline' },
  { variant: 'ghost' },
  { variant: 'whatsapp', icon: 'ion:logo-whatsapp' },
] satisfies { variant: ButtonVariant; icon?: string }[]
const badges: BadgeVariant[] = ['neutral', 'brand', 'discount', 'featured', 'success', 'danger']
const icons = [
  { name: 'ion:bag-outline', key: 'bag' },
  { name: 'ion:search-outline', key: 'search' },
  { name: 'ion:heart-outline', key: 'heart' },
  { name: 'ion:person-outline', key: 'person' },
  { name: 'ion:arrow-forward-outline', key: 'arrow' },
] as const
const scale = [8, 16, 24, 32, 48, 64, 96]
const price = 15000
const previousPrice = 20000
const discount = Math.round(100 * (previousPrice - price) / previousPrice)

const name = ref('')
const email = ref('testy')
const note = ref('')
const contact = ref('')
const updates = ref(false)
const selection = ref('')
const specimenAction = ref('')
const favorite = ref(false)
const contactOptions = computed(() => [
  { value: 'email', label: t('guide.fields.email') },
  { value: 'whatsapp', label: 'WhatsApp' },
])
const motionTarget = useTemplateRef('motion-target')
const { play } = useEntranceMotion(motionTarget)
</script>

<template>
  <a
    href="#guide-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-standard focus:bg-surface focus:p-3"
  >{{ t('guide.skip') }}</a>

  <header class="border-b border-line">
    <UiContainer class="flex min-h-16 flex-wrap items-center justify-between gap-x-5 py-2">
      <span class="font-display text-base font-bold sm:text-lg">Testy Shop</span>
      <SharedLanguageSwitcher />
    </UiContainer>
  </header>

  <UiContainer id="guide-content" as="main" tabindex="-1">
    <div class="guide-hero mt-4 grid gap-6 rounded-promo bg-ink p-5 text-surface sm:mt-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.5fr)] lg:items-end lg:gap-10 lg:p-10">
      <div class="min-w-0">
        <p class="mb-3 text-sm font-normal text-brand">{{ t('guide.title') }}</p>
        <h1 class="text-hero font-display font-bold">Urban Market</h1>
        <p class="mt-4 max-w-xl text-sm leading-relaxed text-line sm:text-base">{{ t('guide.intro') }}</p>
      </div>
      <nav :aria-label="t('guide.contents')" class="border-t border-surface/25 pt-3 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
        <ul class="grid grid-cols-2 gap-x-3 sm:grid-cols-3 lg:grid-cols-2">
          <li v-for="section in sections" :key="section">
            <a :href="`#${section}`" class="inline-flex min-h-11 items-center py-1 text-sm font-medium underline-offset-4 hover:text-brand hover:underline">
              {{ t(`guide.sections.${section}.title`) }}
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <section id="specimens" class="guide-section" aria-labelledby="specimens-heading">
      <UiSectionHeading id="specimens-heading" :title="t('guide.sections.specimens.title')" :description="t('guide.sections.specimens.description')" />
      <div class="specimen-grid grid items-start gap-(--product-gap)">
        <article class="min-w-0 specimen-campaign">
          <h3 class="specimen-label">{{ t('guide.specimens.banner') }}</h3>
          <div class="campaign grid overflow-hidden rounded-promo bg-brand text-brand-foreground sm:grid-cols-[minmax(0,1fr)_33%]">
            <div class="grid content-center justify-items-start gap-4 p-5 sm:p-6">
              <h4 class="max-w-[13ch] text-campaign font-display font-bold">{{ t('guide.specimens.campaignTitle') }}</h4>
              <p class="max-w-xs text-sm">{{ t('guide.specimens.campaignBody') }}</p>
              <UiButton variant="secondary" @click="specimenAction = t('guide.specimens.campaignAction')">
                {{ t('guide.specimens.campaignAction') }}
                <Icon name="ion:arrow-forward-outline" size="18" aria-hidden="true" />
              </UiButton>
            </div>
            <div class="campaign-art" aria-hidden="true">
              <Icon name="ion:flash" mode="svg" class="campaign-flash" />
            </div>
          </div>
        </article>

        <article class="min-w-0">
          <h3 class="specimen-label">{{ t('guide.specimens.productCard') }}</h3>
          <div class="rounded-standard border border-line bg-surface p-2">
            <div class="relative aspect-square overflow-hidden rounded-button bg-subtle">
              <img :src="headphonesImage" :alt="t('guide.specimens.productImage')" width="768" height="768" loading="lazy" decoding="async" class="size-full object-cover">
              <UiBadge variant="discount" class="absolute start-2 top-2">
                <UiNumericText :value="t('guide.specimens.discount', { percent: discount })" />
              </UiBadge>
              <UiIconButton
                :icon="favorite ? 'ion:heart' : 'ion:heart-outline'"
                :label="t('guide.specimens.favorite')"
                :aria-pressed="favorite"
                variant="ghost"
                class="absolute end-2 top-2 bg-surface hover:bg-subtle"
                @click="favorite = !favorite"
              />
            </div>
            <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 p-2.5">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-muted-ink">{{ t('guide.specimens.productCategory') }}</p>
                <h4 class="mt-0.5 text-base font-medium">{{ t('guide.type.product') }}</h4>
                <p class="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <UiNumericText class="text-xl font-bold" :value="formatCurrency(price)" />
                  <del class="previous-price text-sm text-muted-ink">
                    <span class="sr-only">{{ t('guide.specimens.previousPrice') }} </span>
                    <UiNumericText :value="formatCurrency(previousPrice)" />
                  </del>
                </p>
              </div>
              <UiIconButton
                icon="ion:bag-add-outline"
                :label="t('guide.specimens.add')"
                variant="primary"
                @click="specimenAction = t('guide.specimens.add')"
              />
            </div>
          </div>
        </article>

        <article class="min-w-0">
          <h3 class="specimen-label">{{ t('guide.specimens.categoryTile') }}</h3>
          <button type="button" class="category-tile block w-full overflow-hidden rounded-standard border border-line bg-ink text-start text-surface" @click="specimenAction = t('guide.specimens.category')">
            <span class="block aspect-square overflow-hidden bg-subtle">
              <img :src="accessoriesImage" alt="" width="768" height="768" loading="lazy" decoding="async" class="category-image size-full object-cover">
            </span>
            <span class="flex items-center justify-between gap-3 p-3">
              <span class="text-lg font-semibold">{{ t('guide.specimens.category') }}</span>
              <span class="category-arrow grid size-11 shrink-0 place-items-center rounded-button border border-surface/35" aria-hidden="true">
                <Icon name="ion:arrow-forward-outline" size="20" />
              </span>
            </span>
          </button>
        </article>
      </div>
      <p role="status" class="min-h-5 text-sm text-muted-ink">{{ specimenAction ? t('guide.specimenSelected', { action: specimenAction }) : '' }}</p>
    </section>

    <UiDivider />
    <section id="palette" class="guide-section" aria-labelledby="palette-heading">
      <UiSectionHeading id="palette-heading" :title="t('guide.sections.palette.title')" :description="t('guide.sections.palette.description')" />
      <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <li v-for="{ token, hex } in swatches" :key="token">
          <div class="overflow-hidden rounded-standard border border-line bg-surface">
            <div class="h-14 border-b border-line sm:h-19" :style="{ background: `var(--color-${token}, ${hex})` }" aria-hidden="true" />
            <div class="p-2.5">
              <p class="text-sm font-medium">{{ t(`guide.colors.${token}`) }}</p>
              <code class="font-sans text-xs text-muted-ink tabular-nums">{{ hex }}</code>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <UiDivider />
    <section id="typography" class="guide-section" aria-labelledby="typography-heading">
      <UiSectionHeading id="typography-heading" :title="t('guide.sections.typography.title')" :description="t('guide.sections.typography.description')" />
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="grid min-w-0 content-start gap-5 rounded-standard bg-ink p-5 text-surface sm:p-6">
          <p class="text-sm text-brand">General Sans</p>
          <p class="text-campaign font-display font-bold">Testy Shop</p>
          <p class="font-display text-base font-bold">{{ t('guide.type.display') }}</p>
        </div>
        <div class="grid min-w-0 content-start gap-4 rounded-standard border border-line bg-surface p-5 sm:p-6">
          <p class="text-sm text-muted-ink">{{ t('guide.type.interface') }}</p>
          <p class="text-section font-semibold">{{ t('guide.type.section') }}</p>
          <div>
            <p class="text-base font-medium">{{ t('guide.type.product') }}</p>
            <p class="mt-1 text-xl font-bold"><UiNumericText :value="formatCurrency(price)" /></p>
          </div>
          <p class="max-w-prose text-muted-ink">{{ t('guide.type.body') }}</p>
        </div>
      </div>
    </section>

    <UiDivider />
    <section id="actions" class="guide-section" aria-labelledby="actions-heading">
      <UiSectionHeading id="actions-heading" :title="t('guide.sections.actions.title')" :description="t('guide.sections.actions.description')" />
      <div class="grid gap-4 rounded-standard border border-line bg-surface p-4 sm:p-6">
        <div class="flex flex-wrap gap-3">
          <UiButton v-for="{ variant, icon } in buttons" :key="variant" :variant="variant" @click="selection = t(`guide.buttons.${variant}`)">
            <template v-if="icon" #icon><Icon :name="icon" class="size-5" aria-hidden="true" /></template>
            {{ t(`guide.buttons.${variant}`) }}
          </UiButton>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton disabled>{{ t('guide.buttons.disabled') }}</UiButton>
          <UiButton variant="secondary" loading>{{ t('loading') }}</UiButton>
          <UiIconButton icon="ion:search-outline" :label="t('guide.icons.search')" @click="selection = t('guide.icons.search')" />
        </div>
        <p role="status" class="min-h-6 text-sm text-muted-ink">{{ selection ? t('guide.selected', { action: selection }) : '' }}</p>
      </div>
    </section>

    <UiDivider />
    <section id="forms" class="guide-section" aria-labelledby="forms-heading">
      <UiSectionHeading id="forms-heading" :title="t('guide.sections.forms.title')" :description="t('guide.sections.forms.description')" />
      <div class="grid items-start gap-4 rounded-standard border border-line bg-surface p-4 sm:p-6 md:grid-cols-2">
        <UiInput v-model="name" :label="t('guide.fields.name')" autocomplete="name" />
        <UiInput v-model="email" type="email" :label="t('guide.fields.email')" autocomplete="email" :error="email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t('guide.fields.emailError') : undefined" />
        <UiSelect v-model="contact" :label="t('guide.fields.contact')" :placeholder="t('guide.fields.choose')" :options="contactOptions" />
        <UiInput :model-value="t('guide.fields.disabledValue')" :label="t('guide.fields.disabled')" disabled />
        <UiTextarea v-model="note" :label="t('guide.fields.note')" :hint="t('guide.fields.noteHint')" class="tabular-nums" />
        <UiCheckbox v-model="updates" :label="t('guide.fields.updates')" />
      </div>
    </section>

    <UiDivider />
    <section id="feedback" class="guide-section" aria-labelledby="feedback-heading">
      <UiSectionHeading id="feedback-heading" :title="t('guide.sections.feedback.title')" :description="t('guide.sections.feedback.description')" />
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="grid content-start gap-5 rounded-standard border border-line bg-surface p-4 sm:p-6">
          <div class="flex flex-wrap gap-2">
            <UiBadge v-for="badge in badges" :key="badge" :variant="badge">{{ t(`guide.badges.${badge}`) }}</UiBadge>
          </div>
          <ul class="flex flex-wrap gap-x-5 gap-y-3">
            <li v-for="{ name: icon, key } in icons" :key="key" class="grid justify-items-center gap-2 text-xs text-muted-ink">
              <Icon :name="icon" size="24" class="text-ink" aria-hidden="true" />
              {{ t(`guide.icons.${key}`) }}
            </li>
          </ul>
        </div>
        <div class="grid content-center gap-3 rounded-standard border border-line bg-surface p-4 sm:p-6">
          <div class="flex items-center gap-3 text-muted-ink">
            <UiSpinner decorative />
            <p role="status" class="text-sm">{{ t('loading') }}</p>
          </div>
          <UiSkeleton />
          <UiSkeleton class="w-3/4" />
          <UiSkeleton class="w-1/2" />
        </div>
        <UiEmptyState :title="t('guide.empty.title')" :description="t('guide.empty.description')" class="lg:col-span-2" />
      </div>
    </section>

    <UiDivider />
    <section id="layout" class="guide-section" aria-labelledby="layout-heading">
      <UiSectionHeading id="layout-heading" :title="t('guide.sections.layout.title')" :description="t('guide.sections.layout.description')" />
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-standard border border-line bg-surface p-4 sm:p-6">
          <h3 class="mb-5 text-lg font-semibold">{{ t('guide.spacing') }}</h3>
          <ul class="grid gap-3">
            <li v-for="size in scale" :key="size" class="flex items-center gap-3">
              <UiNumericText class="w-14 shrink-0 text-sm text-muted-ink" :value="`${size} px`" />
              <span class="h-2 bg-brand" :style="{ width: `${size}px` }" aria-hidden="true" />
            </li>
          </ul>
        </div>
        <div class="grid content-start gap-4 rounded-standard border border-line bg-surface p-4 sm:p-6">
          <h3 class="text-lg font-semibold">{{ t('guide.motion.title') }}</h3>
          <div ref="motion-target" class="flex items-center gap-3 rounded-standard bg-subtle p-4">
            <Icon name="ion:arrow-forward-outline" size="20" class="shrink-0 text-ink" aria-hidden="true" />
            <span>{{ t('guide.motion.sample') }}</span>
          </div>
          <div><UiButton variant="outline" @click="play">{{ t('guide.motion.replay') }}</UiButton></div>
        </div>
      </div>
    </section>
  </UiContainer>
</template>

<style scoped>
.guide-hero {
  --focus-ring: var(--color-brand);
}

.guide-section {
  display: grid;
  gap: clamp(16px, 2.4vw, 28px);
  padding-block: var(--section-space);
  scroll-margin-block-start: 24px;
}

.specimen-label {
  margin-block-end: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.previous-price {
  position: relative;
  text-decoration: none;
}

.previous-price::after {
  position: absolute;
  inset-inline: 0;
  top: 50%;
  border-top: 1px solid currentColor;
  content: "";
  pointer-events: none;
}

.campaign-art {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 7rem;
  overflow: hidden;
  background: var(--color-ink);
  color: var(--color-brand);
}

.campaign-art::before,
.campaign-art::after {
  position: absolute;
  width: 110%;
  height: 55%;
  border: 1px solid currentColor;
  border-radius: 50%;
  content: "";
  transform: rotate(-34deg);
  opacity: 0.45;
}

.campaign-art::after {
  width: 145%;
  height: 76%;
}

.campaign-flash {
  z-index: 1;
  width: 56%;
  height: auto;
  max-height: 9rem;
  transform: rotate(-12deg);
}

.category-tile:is(:hover, :focus-visible) .category-arrow {
  border-color: var(--color-brand);
  background: var(--color-brand);
  color: var(--color-brand-foreground);
}

@media (prefers-reduced-motion: no-preference) {
  .category-arrow { transition: background-color var(--motion-micro), color var(--motion-micro), border-color var(--motion-micro); }
  .category-image { transition: transform var(--motion-functional) ease-out; }
  .category-tile:is(:hover, :focus-visible) .category-image { transform: scale(1.035); }
}

@media (min-width: 40rem) {
  .specimen-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .specimen-campaign { grid-column: 1 / -1; }
  .campaign { min-height: 17rem; }
}

@media (min-width: 70rem) {
  .specimen-grid { grid-template-columns: minmax(0, 1.75fr) repeat(2, minmax(0, 1fr)); }
  .specimen-campaign { grid-column: auto; }
}
</style>
