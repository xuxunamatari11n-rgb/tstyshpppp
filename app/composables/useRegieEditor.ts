import type { Ref } from 'vue'
import { adminImageLimit, adminImageTypes, type AdminBucket, type AdminImage } from '~~/shared/types/admin'

export type RegieMedia = AdminImage & { key: string; file?: File; progress?: number; failure?: RegieLabel }

export function useRegieUnsaved(dirty: Readonly<Ref<boolean>>) {
  const a = useRegieText()
  const off = useRouter().beforeEach(() => !import.meta.client || !dirty.value || window.confirm(a('discard')))
  function unload(event: BeforeUnloadEvent) {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', unload))
  onBeforeUnmount(() => { off(); if (import.meta.client) window.removeEventListener('beforeunload', unload) })
}

export function regieInteger(value: number | string | null | undefined) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

export function useRegieStorefrontRefresh() {
  const nuxt = useNuxtApp()
  return async () => {
    const keys = Object.keys(nuxt.payload.data).filter(key => /^(shop-meta-|shop-products-|shop-product-|shop-selection-|home-)/.test(key))
    if (keys.length) await nuxt.runWithContext(() => refreshNuxtData(keys))
  }
}

export function validateRegieImage(file: File) {
  return file.size > 0 && file.size <= adminImageLimit && adminImageTypes.includes(file.type)
}

export function createRegieMedia(file: File, url: string): Promise<RegieMedia> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth > 20000 || image.naturalHeight > 20000) { reject(new Error('dimensions')); return }
      resolve({ file, src: url, key: crypto.randomUUID(), storage_path: '', alt: { fr: '', es: '' },
        width: image.naturalWidth, height: image.naturalHeight, is_cutout: false })
    }
    image.onerror = reject
    image.src = url
  })
}

export function uploadRegieImage(file: File, bucket: AdminBucket, progress: (percent: number) => void) {
  return new Promise<{ path: string; src: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/regie/media?bucket=' + bucket)
    xhr.timeout = 90000
    xhr.responseType = 'json'
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) progress(Math.round(event.loaded / event.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.path) resolve(xhr.response)
      else reject({ statusCode: xhr.status, data: xhr.response })
    }
    xhr.onerror = xhr.ontimeout = () => reject(new Error('Upload failed'))
    xhr.send(file)
  })
}

export async function persistRegieMedia(media: RegieMedia[], bucket: AdminBucket) {
  for (const item of media) {
    if (!item.file || item.storage_path) continue
    item.progress = 0
    item.failure = undefined
    try {
      const result = await uploadRegieImage(item.file, bucket, percent => { item.progress = percent })
      item.storage_path = result.path
    } catch (error) {
      const reason = regieError(error)
      item.failure = reason === 'error' ? 'mediaFailure' : reason
      throw error
    } finally { item.progress = undefined }
  }
}

