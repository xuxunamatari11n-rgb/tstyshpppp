<script setup lang="ts">
import type { CommercialImage } from '~/types/commerce'

const props = defineProps<{ images: readonly CommercialImage[]; discount?: number }>()
const { t } = useI18n()
const selected = ref(0)
const current = computed(() => props.images[selected.value])
const multiple = computed(() => props.images.length > 1)
const failedSources = reactive(new Set<string>())
const viewer = useTemplateRef('viewer')
const viewerClose = useTemplateRef('viewerClose')
const viewerId = useId()
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(viewer, viewerClose, { mobileOnly: false })
const motion = useStorefrontTransition(8)
let start: { x: number; y: number } | undefined
let lastSwipe = 0

watch(() => props.images, () => { selected.value = 0 })

function move(delta: number) {
  if (multiple.value) selected.value = (selected.value + delta + props.images.length) % props.images.length
}

function keyboard(event: KeyboardEvent) {
  if (!multiple.value || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  if (event.key === 'Home') selected.value = 0
  else if (event.key === 'End') selected.value = props.images.length - 1
  else move(event.key === 'ArrowLeft' ? -1 : 1)
}

function touchStart(event: TouchEvent) {
  const finger = event.touches[0]
  start = event.touches.length === 1 && finger ? { x: finger.clientX, y: finger.clientY } : undefined
  lastSwipe = 0
}

function touchEnd(event: TouchEvent) {
  const finger = event.changedTouches[0]
  if (start && finger && multiple.value) {
    const dx = finger.clientX - start.x
    const dy = finger.clientY - start.y
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      move(dx < 0 ? 1 : -1)
      lastSwipe = Date.now()
    }
  }
  start = undefined
}

function showViewer(event: MouseEvent) {
  if (Date.now() - lastSwipe < 350) return
  if (event.currentTarget instanceof HTMLElement) void open(event.currentTarget)
}

const position = computed(() => t('product.photoPosition', { index: selected.value + 1, count: props.images.length }))
</script>

<template>
  <section class="product-gallery" :aria-label="t('product.gallery')" @keydown="keyboard">
    <ul v-if="multiple" class="product-thumbnails">
      <li v-for="(image, index) in images" :key="image.src + index">
        <button type="button" :aria-label="t('product.photoPosition', { index: index + 1, count: images.length })"
          :aria-pressed="selected === index" @click="selected = index">
          <ProductPhoto :image="image" thumbnail />
        </button>
      </li>
    </ul>
    <div class="product-gallery-main">
      <div class="product-gallery-stage" @touchstart.passive="touchStart" @touchend.passive="touchEnd" @touchcancel="start = undefined">
        <button v-if="current && !failedSources.has(current.src)" type="button" class="product-gallery-zoom"
          :aria-label="t('product.viewPhoto', { description: t(current.altKey) })" aria-haspopup="dialog" :aria-controls="viewerId" @click="showViewer">
          <ProductPhoto :key="current.src" :image="current" priority @failed="current && failedSources.add(current.src)" />
          <span class="product-zoom-badge" aria-hidden="true"><Icon name="ion:expand-outline" size="21" /></span>
        </button>
        <ProductPhoto v-else />
        <UiBadge v-if="discount" variant="discount" class="product-gallery-discount">
          {{ t('home.discount', { percent: discount }) }}
        </UiBadge>
      </div>
      <div v-if="multiple" class="product-gallery-pagination">
        <UiIconButton variant="ghost" icon="ion:chevron-back-outline" :label="t('product.previousPhoto')" @click="move(-1)" />
        <span aria-live="polite">{{ position }}</span>
        <UiIconButton variant="ghost" icon="ion:chevron-forward-outline" :label="t('product.nextPhoto')" @click="move(1)" />
      </div>
    </div>

    <dialog v-if="images.length" :id="viewerId" ref="viewer" class="product-viewer" :aria-label="t('product.viewer')"
      @cancel.prevent="close()" @keydown.tab="trapFocus" @keydown.stop="keyboard">
      <Transition v-bind="motion" :css="false" @after-leave="finishClose">
        <div v-show="active" class="product-viewer-panel">
          <header class="product-viewer-toolbar">
            <span aria-live="polite">{{ position }}</span>
            <button ref="viewerClose" type="button" class="product-viewer-button" :aria-label="t('product.closeViewer')" @click="close()">
              <Icon name="ion:close-outline" size="26" aria-hidden="true" />
            </button>
          </header>
          <div class="product-viewer-stage" @touchstart.passive="touchStart" @touchend.passive="touchEnd" @touchcancel="start = undefined">
            <ProductPhoto :key="current?.src" :image="current" priority />
            <template v-if="multiple">
              <button type="button" class="product-viewer-button product-viewer-prev" :aria-label="t('product.previousPhoto')" @click="move(-1)">
                <Icon name="ion:chevron-back-outline" size="24" aria-hidden="true" />
              </button>
              <button type="button" class="product-viewer-button product-viewer-next" :aria-label="t('product.nextPhoto')" @click="move(1)">
                <Icon name="ion:chevron-forward-outline" size="24" aria-hidden="true" />
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </dialog>
  </section>
</template>
