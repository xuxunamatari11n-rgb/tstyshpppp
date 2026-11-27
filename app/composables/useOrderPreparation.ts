import type { CommercialProduct, CartLineRequest } from '~/types/commerce'
import type { ShopMeta } from '~/types/shop'
import type { OrderRequest } from '~/composables/useCommerce'
import { cartLineStatus } from '~/utils/cart'
import { formatCurrency } from '~/utils/formatCurrency'
import { whatsappLink } from '~/utils/whatsappCommerce'

export function useOrderPreparation() {
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const config = useRuntimeConfig()
  const origin = useRequestURL().origin
  const selection = useShopSelection()
  const { name } = useProductContent()
  const cart = useCartStore()
  const request = shallowRef<OrderRequest | null>(null)
  const failure = ref('')
  const checking = ref(false)
  const lines = shallowRef<{ line: CartLineRequest; product?: CommercialProduct; priceChanged: boolean; status: ReturnType<typeof cartLineStatus> }[]>([])
  const settings = shallowRef<ShopMeta['settings']>(null)
  const contact = ref('')
  const delivery = ref('')
  let revision = 0

  const phone = computed(() => settings.value?.whatsappNumber ?? config.public.whatsappNumber)
  const contactAvailable = computed(() => !!whatsappLink(phone.value))
  const open = computed(() => settings.value?.open !== false)
  const total = computed(() => lines.value.reduce((sum, entry) =>
    sum + (entry.status === 'ready' ? (entry.product?.price ?? 0) * entry.line.quantity : 0), 0))
  const usable = computed(() => open.value && lines.value.length > 0 && lines.value.every(entry => entry.status === 'ready'))
  const money = (value: number) => formatCurrency(value, settings.value?.currencySymbol?.trim() || 'F')
  const message = computed(() => {
    if (!usable.value) return ''
    const items = lines.value.flatMap(({ line, product }) => {
      if (!product) return []
      const text = t('commerce.message.line', { product: name(product), count: line.quantity, amount: money(product.price * line.quantity) })
      const path = localePath({ name: 'product', params: { slug: product.slug } })
      return request.value?.source === 'product' && path ? [text, new URL(path, origin).href] : [text]
    })
    return [t('commerce.message.greeting', { shop: settings.value?.storeName || 'Testy Shop' }), '', t('commerce.message.intro'), '',
      ...items, '', t('commerce.message.total', { amount: money(total.value) }),
      ...(contact.value.trim() ? [t('commerce.message.contact', { details: contact.value.trim() })] : []),
      ...(delivery.value.trim() ? [t('commerce.message.delivery', { details: delivery.value.trim() })] : []), '',
      t('commerce.message.confirm')].join('\n')
  })
  const link = computed(() => message.value ? whatsappLink(phone.value, message.value) : null)
  const tooLong = computed(() => (link.value?.length ?? 0) > 7500)

  function snapshot() {
    return JSON.stringify([lines.value.map(({ line, product, status }) => [
      line.productId, line.quantity, product?.price, product && name(product), status,
    ]), phone.value, settings.value?.currencySymbol, open.value])
  }

  async function refresh() {
    const order = request.value
    if (!order) return false
    const current = ++revision
    const selected = order.source === 'product' ? [order.line] : cart.selections.map(({ productId, quantity }) => ({ productId, quantity }))
    const ids = selected.map(line => line.productId)
    checking.value = true
    failure.value = ''
    try {
      const [products, meta] = await Promise.all([
        selection(ids), $fetch<ShopMeta>('/api/shop/meta', { query: { locale: locale.value }, cache: 'no-store' }),
      ])
      if (current !== revision) return false
      settings.value = meta.settings
      const byId = new Map(products.map(product => [product.id, product]))
      lines.value = selected.map(line => {
        const product = byId.get(line.productId)
        const reference = order.source === 'product' ? order.referencePrice
          : cart.selections.find(item => item.productId === line.productId)?.referencePrice
        return { line, product, priceChanged: !!product && reference !== undefined && product.price !== reference,
          status: cartLineStatus(line, product) }
      })
      if (order.source === 'cart') await cart.refresh(async () => products)
      return current === revision
    } catch {
      if (current === revision) failure.value = 'commerce.validation.error'
      return false
    } finally {
      if (current === revision) checking.value = false
    }
  }

  function reset(order: OrderRequest | null) {
    ++revision
    request.value = order
    lines.value = []
    settings.value = null
    contact.value = ''
    delivery.value = ''
    failure.value = ''
    checking.value = false
  }

  async function handoff() {
    if (checking.value || !usable.value || !link.value || tooLong.value) return
    const reviewed = snapshot()
    if (!await refresh()) return
    if (reviewed !== snapshot()) {
      failure.value = 'commerce.order.changed'
      return
    }
    if (usable.value && link.value && !tooLong.value) window.location.assign(link.value)
  }

  return { checking, lines, open, contactAvailable, total, usable, failure, contact, delivery, message, tooLong,
    money, refresh, handoff, reset }
}

