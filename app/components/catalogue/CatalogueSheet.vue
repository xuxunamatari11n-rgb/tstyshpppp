<script setup lang="ts">
defineProps<{ title: string; id: string }>()
const emit = defineEmits<{ closed: [] }>()
const { t } = useI18n()
const dialog = useTemplateRef('dialog')
const closeButton = useTemplateRef('closeButton')
const titleId = useId()
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(dialog, closeButton)
const motion = useStorefrontTransition(28)
function afterClose() {
  finishClose()
  emit('closed')
}
defineExpose({ open, close })
</script>

<template>
  <dialog
    :id="id" ref="dialog" class="catalogue-sheet" :aria-labelledby="titleId"
    @cancel.prevent="close()" @click.self="close()" @keydown.tab="trapFocus"
  >
    <Transition v-bind="motion" :css="false" @after-leave="afterClose">
      <section v-show="active" class="catalogue-sheet-panel">
        <header class="catalogue-sheet-header">
          <h2 :id="titleId">{{ title }}</h2>
          <button ref="closeButton" class="storefront-mobile-utility" type="button" :aria-label="t('catalogue.close')"
            @click="close()">
            <Icon name="ion:close-outline" size="24" aria-hidden="true" />
          </button>
        </header>
        <div class="catalogue-sheet-body"><slot /></div>
        <div v-if="$slots.footer" class="catalogue-sheet-footer"><slot name="footer" /></div>
      </section>
    </Transition>
  </dialog>
</template>
