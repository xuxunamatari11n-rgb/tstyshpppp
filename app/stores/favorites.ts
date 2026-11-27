import type { CommercialProduct } from '~/types/commerce'

const storageKey = 'testy-shop/favorites-v1'
type Lookup = (ids: readonly string[]) => Promise<CommercialProduct[]>

export const useFavoritesStore = defineStore('favorites', () => {
  const guestIds = ref<string[]>([])
  const accountIds = ref<string[]>([])
  const owner = ref<string | null>(null)
  const ready = ref(false)
  const sync = ref<'idle' | 'loading' | 'error'>('idle')
  const pending = shallowRef(new Set<string>())
  const ids = computed(() => owner.value ? accountIds.value : guestIds.value)
  const selected = computed(() => new Set(ids.value))
  let revision = 0

  function mount() {
    if (!import.meta.client || ready.value) return
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(saved)) guestIds.value = [...new Set(saved.filter((id): id is string =>
        typeof id === 'string' && /^[a-z0-9-]{1,120}$/i.test(id)))]
    } catch { /* A malformed guest cache starts empty. */ }
    ready.value = true
  }

  watch(guestIds, value => {
    if (import.meta.client && ready.value) {
      try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* Storage is optional. */ }
    }
  }, { flush: 'sync' })

  function switchOwner(id: string | null) {
    if (owner.value === id) return
    ++revision
    accountIds.value = []
    owner.value = id
    pending.value = new Set()
    sync.value = 'idle'
  }

  function write(id: string, productId: string, favorite: boolean) {
    return $fetch('/api/account/favorites', { method: 'POST', body: { owner: id, productId, favorite } })
  }

  async function synchronize(lookup: Lookup) {
    const id = owner.value
    if (!id || sync.value === 'loading' || pending.value.size) return
    const current = revision
    sync.value = 'loading'
    try {
      const rows = await $fetch<{ product_id: string }[]>('/api/account/favorites', { query: { owner: id } })
      if (current !== revision) return
      accountIds.value = [...new Set(rows.map(row => row.product_id))]
      const known = new Set(accountIds.value)
      guestIds.value = guestIds.value.filter(productId => !known.has(productId))
      const valid = (await lookup(guestIds.value)).map(product => product.id)
      let partialFailure = false
      for (let offset = 0; offset < valid.length && current === revision; offset += 4) {
        const batch = valid.slice(offset, offset + 4)
        const results = await Promise.allSettled(batch.map(productId => write(id, productId, true)))
        if (current !== revision) return
        const migrated = batch.filter((_, index) => results[index]?.status === 'fulfilled')
        const migratedSet = new Set(migrated)
        accountIds.value = [...new Set([...accountIds.value, ...migrated])]
        guestIds.value = guestIds.value.filter(productId => !migratedSet.has(productId))
        partialFailure ||= migrated.length !== batch.length
      }
      if (current === revision) sync.value = partialFailure ? 'error' : 'idle'
    } catch {
      if (current === revision) sync.value = 'error'
    }
  }

  function update(list: readonly string[], id: string, add: boolean) {
    return add ? [id, ...list.filter(value => value !== id)] : list.filter(value => value !== id)
  }

  async function toggle(id: string) {
    mount()
    const wasFavorite = selected.value.has(id)
    const account = owner.value
    if (!account) {
      guestIds.value = update(guestIds.value, id, !wasFavorite)
      return !wasFavorite
    }
    if (sync.value === 'loading' || pending.value.has(id)) return
    const current = revision
    pending.value = new Set([...pending.value, id])
    accountIds.value = update(accountIds.value, id, !wasFavorite)
    try {
      await write(account, id, !wasFavorite)
      if (revision === current) return !wasFavorite
    } catch (error) {
      if (revision === current) {
        accountIds.value = update(accountIds.value, id, wasFavorite)
        throw error
      }
    } finally {
      if (revision === current) pending.value = new Set([...pending.value].filter(value => value !== id))
    }
  }

  return { ready, owner, ids, selected, sync, pending, mount, switchOwner, synchronize, toggle }
})

