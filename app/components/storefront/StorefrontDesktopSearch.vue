<script setup lang="ts">
defineProps<{ recents: string[] }>()
const query = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: [term: string] }>()
const { t } = useI18n()
const root = useTemplateRef('root')
const input = useTemplateRef('input')
const panel = useTemplateRef('panel')
const panelId = useId()
const open = ref(false)
let ignoreFocus = false

function reveal() {
  if (!ignoreFocus) open.value = true
}

function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) {
    ignoreFocus = true
    input.value?.focus()
    ignoreFocus = false
  }
}

function submit(term: string) {
  if (!term.trim()) return
  close()
  emit('submit', term)
}

function clear() {
  query.value = ''
  input.value?.focus()
  reveal()
}

async function moveFocus(event: KeyboardEvent, direction: number) {
  const target = event.target
  if (!(target instanceof HTMLElement) || (target !== input.value && !target.matches('[data-search-option]'))) return
  event.preventDefault()
  reveal()
  await nextTick()
  const options = [input.value, ...(panel.value?.querySelectorAll<HTMLElement>('[data-search-option]') ?? [])]
  const index = options.indexOf(target)
  options[(index + direction + options.length) % options.length]?.focus()
}

const { onEscape, onFocusOut } = useStorefrontDisclosure(root, open, close)
const motion = useStorefrontTransition()
</script>

<template>
  <div
    ref="root"
    class="relative min-w-0"
    @focusout="onFocusOut"
    @keydown.esc="onEscape"
    @keydown.down="moveFocus($event, 1)"
    @keydown.up="moveFocus($event, -1)"
  >
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
        :aria-controls="panelId"
        :placeholder="t('storefront.search.placeholder')"
        autocomplete="off"
        maxlength="100"
        @focus="reveal"
        @click="reveal"
        @input="reveal"
      >
      <button v-if="query" type="button" class="storefront-search-button" :aria-label="t('storefront.search.clear')" @click="clear">
        <Icon name="ion:close-outline" size="22" aria-hidden="true" />
      </button>
    </form>

    <Transition v-bind="motion" :css="false">
      <section
        v-show="open"
        :id="panelId"
        ref="panel"
        :inert="!open"
        :aria-label="t('storefront.search.suggestions')"
        class="storefront-panel absolute inset-x-0 top-full z-20 mt-2 max-h-[min(65vh,32rem)] overflow-y-auto p-4"
      >
        <StorefrontSearchSuggestions :query="query" :recents="recents" @choose="submit" @navigate="close()" />
      </section>
    </Transition>
  </div>
</template>

