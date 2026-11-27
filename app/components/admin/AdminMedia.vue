<script setup lang="ts">
import type { RegieMedia } from '~/composables/useRegieEditor'
const props = defineProps<{ max: number; category?: boolean; busy?: boolean }>()
const media = defineModel<RegieMedia[]>({ required: true })
const a = useRegieText()
const error = ref<RegieLabel>()
const dragging = ref<string>()
const preparing = defineModel<boolean>('preparing', { default: false })
const over = ref(false)
const urls = new Set<string>()
const input = useTemplateRef<HTMLInputElement>('imageInput')

function remove(index: number) {
  const current = media.value[index]
  if (!current) return
  if (current.src && urls.delete(current.src)) URL.revokeObjectURL(current.src)
  media.value.splice(index, 1)
}

async function add(files?: FileList | null) {
  if (!files?.length || props.busy || preparing.value) return
  error.value = undefined
  preparing.value = true
  try {
    for (const file of files) {
      if (!props.category && media.value.length >= props.max) { error.value = 'mediaLimit'; break }
      if (!validateRegieImage(file)) { error.value = 'mediaInvalid'; continue }
      const url = URL.createObjectURL(file)
      try {
        const record = await createRegieMedia(file, url)
        urls.add(url)
        if (props.category) {
          remove(0)
          media.value = [record]
          break
        }
        media.value.push(record)
      } catch {
        URL.revokeObjectURL(url)
        error.value = 'mediaInvalid'
      }
    }
  } finally {
    preparing.value = false
    if (input.value) input.value.value = ''
  }
}
function move(from: number, to: number) {
  if (props.busy || props.category || from === to || from < 0 || !media.value[from] || !media.value[to]) return
  const [entry] = media.value.splice(from, 1)
  if (entry) media.value.splice(to, 0, entry)
}
function drop(event: DragEvent, target?: number) {
  over.value = false
  if (event.dataTransfer?.files.length) void add(event.dataTransfer.files)
  else if (target !== undefined && dragging.value) move(media.value.findIndex(entry => entry.key === dragging.value), target)
  dragging.value = undefined
}
onBeforeUnmount(() => { for (const url of urls) URL.revokeObjectURL(url) })
</script>

<template>
  <section class="regie-surface regie-media">
    <h2><Icon name="ion:images-outline" size="20" aria-hidden="true" />{{ a(category ? 'categoryMedia' : 'productMedia') }}</h2>
    <div class="regie-drop" :data-over="over" @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="drop($event)">
      <Icon name="ion:cloud-upload-outline" size="24" aria-hidden="true" />
      <button type="button" class="regie-text-button" :disabled="busy || preparing" @click="input?.click()">{{ a('dropImages') }}</button>
      <small>{{ a('imageHelp') }}</small>
      <input ref="imageInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" tabindex="-1"
        :aria-label="a(category ? 'categoryMedia' : 'productMedia')" :multiple="!category" :disabled="busy || preparing"
        @change="add(($event.currentTarget as HTMLInputElement).files)">
    </div>
    <p v-if="error" class="regie-feedback" data-error role="alert">{{ a(error) }}</p>
    <ol v-if="media.length" class="regie-media-list">
      <li v-for="(entry, index) in media" :key="entry.key" :draggable="!busy && !category"
        @dragstart="dragging = entry.key; $event.dataTransfer?.setData('text/plain', entry.key)"
        @dragend="dragging = undefined" @dragover.prevent @drop.prevent.stop="drop($event, index)">
        <div class="regie-media-top">
          <img v-if="entry.src" :src="entry.src" alt="" width="76" height="66">
          <div>
            <strong>{{ category ? a('categoryMedia') : index === 0 ? a('primaryImage') : a('image') + ' ' + (index + 1) }}</strong>
            <small v-if="entry.file && !entry.storage_path">{{ entry.file.name }}</small>
            <small v-if="entry.file && !entry.storage_path && entry.progress === undefined">{{ a('uploadQueued') }}</small>
            <label v-if="entry.progress !== undefined" class="regie-upload-progress">
              {{ a('upload') }} · {{ entry.progress }} % <progress :value="entry.progress" max="100" />
            </label>
            <p v-if="entry.failure" class="regie-inline-error" role="alert">{{ a(entry.failure) }}</p>
          </div>
          <div class="regie-row-actions">
            <button v-if="!category" type="button" class="regie-icon" :aria-label="a('moveUp')" :title="a('moveUp')" :disabled="busy || index === 0" @click="move(index, index - 1)"><Icon name="ion:arrow-up-outline" size="17" /></button>
            <button v-if="!category" type="button" class="regie-icon" :aria-label="a('moveDown')" :title="a('moveDown')" :disabled="busy || index === media.length - 1" @click="move(index, index + 1)"><Icon name="ion:arrow-down-outline" size="17" /></button>
            <button type="button" class="regie-icon regie-danger-text" :aria-label="a('remove')" :title="a('remove')" :disabled="busy" @click="remove(index)"><Icon name="ion:trash-outline" size="17" /></button>
          </div>
        </div>
        <div v-if="!category" class="regie-fields-pair">
          <label v-for="language in (['fr', 'es'] as const)" :key="language" class="regie-field">
            <span>{{ a('alt') }} · {{ a(language) }}</span><input v-model="entry.alt[language]" maxlength="500" :disabled="busy">
          </label>
          <label class="regie-check"><input v-model="entry.is_cutout" type="checkbox" :disabled="busy">{{ a('cutout') }}</label>
        </div>
      </li>
    </ol>
  </section>
</template>
