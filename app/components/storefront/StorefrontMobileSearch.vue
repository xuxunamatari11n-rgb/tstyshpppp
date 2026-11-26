<script setup lang="ts">
defineProps<{ recents: string[] }>()
const query = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: [term: string] }>()
const { t } = useI18n()
const dialog = useTemplateRef('dialog')
const input = useTemplateRef('input')
const titleId = useId()
const active = ref(false)
let invoker: HTMLElement | null = null
let oldOverflow: string | undefined
let desktop: MediaQueryList | undefined
let restoreFocus = true

function unlock() {
  if (oldOverflow === undefined) return
  document.documentElement.style.overflow = oldOverflow
  oldOverflow = undefined
}

async function open(trigger: HTMLElement) {
  if (!dialog.value || dialog.value.open) return
  invoker = trigger
  restoreFocus = true
  dialog.value.showModal()
  oldOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  active.value = true
  await nextTick()
  input.value?.focus({ preventScroll: true })
}

function finishClose() {
  dialog.value?.close()
  unlock()
  if (restoreFocus && invoker?.isConnected && invoker.getClientRects().length) {
    invoker.focus({ preventScroll: true })
  }
  invoker = null
}

function close(restore = true) {
  if (!active.value) return
  restoreFocus = restore
  active.value = false
}

function submit(term: string) {
  if (!term.trim()) return
  close(false)
  emit('submit', term)
}

function clear() {
  query.value = ''
  input.value?.focus()
}

function breakpointChanged(event: MediaQueryListEvent) {
  if (event.matches) close(false)
}

const route = useRoute()
watch(() => route.fullPath, () => close(false))
onMounted(() => {
  desktop = window.matchMedia('(min-width: 64rem)')
  desktop.addEventListener('change', breakpointChanged)
})
onBeforeUnmount(() => {
  desktop?.removeEventListener('change', breakpointChanged)
  dialog.value?.close()
  unlock()
})

const motion = useStorefrontTransition(12)
defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" class="storefront-search-dialog" :aria-labelledby="titleId" @cancel.prevent="close()">
    <Transition v-bind="motion" :css="false" @after-leave="finishClose">
      <div v-show="active" class="flex min-h-full flex-col bg-canvas">
        <div class="sticky top-0 z-10 border-b border-line bg-surface">
          <UiContainer class="py-3">
            <div class="mb-2 flex items-center gap-2">
              <UiIconButton icon="ion:arrow-back-outline" :label="t('storefront.search.back')" variant="ghost" @click="close()" />
              <h2 :id="titleId" class="text-lg font-semibold">{{ t('storefront.search.title') }}</h2>
            </div>
            <form class="storefront-search-field" role="search" :aria-label="t('storefront.search.title')" @submit.prevent="submit(query)">
              <button type="submit" class="storefront-search-button" :aria-label="t('storefront.search.submit')">
                <Icon name="ion:search-outline" size="22" aria-hidden="true" />
              </button>
              <input
                ref="input"
                v-model="query"
                type="search"
                name="q"
                :aria-label="t('storefront.search.title')"
                :placeholder="t('storefront.search.placeholder')"
                autocomplete="off"
                maxlength="100"
              >
              <button v-if="query" type="button" class="storefront-search-button" :aria-label="t('storefront.search.clear')" @click="clear">
                <Icon name="ion:close-outline" size="22" aria-hidden="true" />
              </button>
            </form>
          </UiContainer>
        </div>
        <UiContainer class="storefront-dialog-content grow py-5">
          <StorefrontSearchSuggestions :query="query" :recents="recents" @choose="submit" @navigate="close(false)" />
        </UiContainer>
      </div>
    </Transition>
  </dialog>
</template>

