import type { CartLineRequest, CommercialProduct } from '~/types/commerce'

export type OrderRequest = { source: 'cart' } | { source: 'product'; line: CartLineRequest; referencePrice: number }

export function useCommerce() {
  const notice = useState<{ key: string; cart: boolean; sequence: number } | null>('commerce-notice', () => null)
  const drawer = useState('commerce-drawer-request', () => 0)
  const order = useState<OrderRequest | null>('commerce-order-request', () => null)
  const cart = useCartStore()
  const { settings } = useShopMeta()

  function notify(key: string, viewCart = false) {
    notice.value = { key, cart: viewCart, sequence: (notice.value?.sequence ?? 0) + 1 }
  }

  function addToCart(product: CommercialProduct, quantity = 1) {
    if (settings.value?.open === false) return
    const result = cart.add(product, quantity)
    notify(`commerce.feedback.${result}`, result === 'added')
  }

  function prepareOrder(request: OrderRequest, event?: MouseEvent) {
    if (event?.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true })
    order.value = request
  }

  return { notice, drawer, order, notify, addToCart, prepareOrder }
}

