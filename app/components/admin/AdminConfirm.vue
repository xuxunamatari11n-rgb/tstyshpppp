<script setup lang="ts">
const props = defineProps<{ title: string; message: string; confirmLabel: string; danger?: boolean }>()
const a = useRegieText()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const cancel = useTemplateRef<HTMLButtonElement>('cancel')
const modal = useStorefrontModal(dialog, cancel, { mobileOnly: false })
const transition = useStorefrontTransition(6)
const subject = ref('')
const id = useId()
let settle: ((result: boolean) => void) | undefined

async function ask(trigger: HTMLElement, identity = '') {
  if (settle) return false
  subject.value = identity
  return await new Promise<boolean>(resolve => {
    settle = resolve
    void modal.open(trigger)
  })
}

function answer(result: boolean) {
  settle?.(result)
  settle = undefined
  modal.close()
}

watch(modal.active, active => { if (!active && settle) answer(false) })
onBeforeUnmount(() => settle?.(false))
defineExpose({ ask })
</script>

<template>
  <dialog ref="dialog" class="regie-confirm" :aria-labelledby="id + '-title'" :aria-describedby="id + '-text'"
    @cancel.prevent="answer(false)" @keydown.tab="modal.trapFocus" @click.self="answer(false)">
    <Transition v-bind="transition" @after-leave="modal.finishClose">
      <div v-if="modal.active.value" class="regie-confirm-panel">
        <h2 :id="id + '-title'">{{ props.title }}</h2>
        <strong v-if="subject">{{ subject }}</strong>
        <p :id="id + '-text'">{{ message }}</p>
        <div class="regie-actions">
          <button ref="cancel" type="button" class="regie-button" @click="answer(false)">{{ a('cancel') }}</button>
          <button type="button" class="regie-button" :data-tone="danger ? 'danger' : 'primary'" @click="answer(true)">{{ confirmLabel }}</button>
        </div>
      </div>
    </Transition>
  </dialog>
</template>
