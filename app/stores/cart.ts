import type { CommercialProduct } from '~/types/commerce'
import { cartLineStatus, cartQuantityLimit, restoreCart, type CartSelection } from '~/utils/cart'
import { maxCartLines } from '~~/shared/utils/commerceSelection'

type Lookup = (ids: readonly string[]) => Promise<CommercialProduct[]>
const storageKey = 'testy-shop/cart-v1'

export const useCartStore = defineStore('cart', () => {
  const selections = ref<CartSelection[]>([])
  const catalogue = shallowRef<Record<string, CommercialProduct>>({})
  const ready = ref(false)
  const adjusted = ref(false)
  const validation = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
  let revision = 0

  const getProduct = (id: string) => Object.hasOwn(catalogue.value, id) ? catalogue.value[id] : undefined
  const quantity = computed(() => selections.value.reduce((total, item) => total + item.quantity, 0))
  const items = computed(() => selections.value.map(line => {
    const product = getProduct(line.productId)
    const status = cartLineStatus(line, product)
    return { ...line, product, status, priceChanged: product && line.referencePrice !== undefined && product.price !== line.referencePrice,
      total: status === 'ready' && product ? product.price * line.quantity : 0 }
  }))
  const subtotal = computed(() => items.value.reduce((total, line) => total + line.total, 0))
  const canOrder = computed(() => validation.value === 'ready' && items.value.length > 0 && items.value.every(line => line.status === 'ready'))

  function mount() {
    if (!import.meta.client || ready.value) return
    try {
      const persisted = localStorage.getItem(storageKey)
      if (persisted) {
        const restored = restoreCart(JSON.parse(persisted))
        selections.value = restored.selections
        adjusted.value = restored.adjusted
      }
    } catch { adjusted.value = true }
    ready.value = true
  }

  watch(selections, value => {
    if (import.meta.client && ready.value) {
      try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* Browsing still works without storage. */ }
    }
  }, { deep: true, flush: 'sync' })

  function add(product: CommercialProduct, amount: number) {
    mount()
    if (!Number.isSafeInteger(amount) || amount <= 0 || cartLineStatus({ productId: product.id, quantity: amount }, product) !== 'ready') return 'stock'
    const line = selections.value.find(entry => entry.productId === product.id)
    const next = (line?.quantity ?? 0) + amount
    if (next > cartQuantityLimit(product)) return 'stock'
    if (!line && selections.value.length >= maxCartLines) return 'cartFull'
    catalogue.value = { ...catalogue.value, [product.id]: product }
    if (line) line.quantity = next
    else selections.value = [...selections.value, { productId: product.id, quantity: amount, referencePrice: product.price }]
    return 'added'
  }

  function setQuantity(id: string, amount: number) {
    const line = selections.value.find(entry => entry.productId === id)
    const product = getProduct(id)
    if (!line || !product || !Number.isSafeInteger(amount) || amount < 1 || cartLineStatus({ productId: id, quantity: 1 }, product) !== 'ready') return
    line.quantity = Math.min(amount, cartQuantityLimit(product))
  }

  function remove(id: string) {
    selections.value = selections.value.filter(line => line.productId !== id)
    const { [id]: _removed, ...remaining } = catalogue.value
    catalogue.value = remaining
  }

  function clear() {
    ++revision
    selections.value = []
    catalogue.value = {}
    validation.value = 'idle'
    adjusted.value = false
  }

  async function refresh(lookup: Lookup) {
    const current = ++revision
    const ids = selections.value.map(line => line.productId)
    if (!ids.length) { validation.value = 'ready'; return }
    validation.value = 'loading'
    try {
      const products = await lookup(ids)
      if (current !== revision) return
      const active = new Set(selections.value.map(line => line.productId))
      const requested = new Set(ids)
      const addedWhileLoading = Object.entries(catalogue.value).filter(([id]) => active.has(id) && !requested.has(id))
      catalogue.value = Object.fromEntries([...addedWhileLoading, ...products.filter(product => active.has(product.id)).map(product => [product.id, product] as const)])
      validation.value = 'ready'
    } catch {
      if (current === revision) validation.value = 'error'
    }
  }

  return { selections, ready, adjusted, validation, items, quantity, subtotal, canOrder,
    mount, add, setQuantity, remove, clear, refresh }
})

