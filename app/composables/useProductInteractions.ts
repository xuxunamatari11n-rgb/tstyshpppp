import type { CommercialProduct } from '~/types/commerce'

export function useProductInteractions() {
  const { t } = useI18n()
  const favorites = reactive(new Set<string>())
  const added = ref('')
  const message = ref('')
  let timeout: ReturnType<typeof setTimeout> | undefined

  function announce(text: string) {
    if (timeout !== undefined) clearTimeout(timeout)
    message.value = text
    timeout = setTimeout(() => {
      added.value = ''
      message.value = ''
    }, 2300)
  }

  function favorite(product: CommercialProduct) {
    const selected = !favorites.has(product.id)
    if (selected) favorites.add(product.id)
    else favorites.delete(product.id)
    announce(t(selected ? 'home.actions.saved' : 'home.actions.removed', { product: t(product.nameKey) }))
  }

  function add(product: CommercialProduct) {
    if (!product.available) return
    added.value = product.id
    announce(t('home.actions.added', { product: t(product.nameKey) }))
  }

  onBeforeUnmount(() => {
    if (timeout !== undefined) clearTimeout(timeout)
  })

  return { favorites, added, message, favorite, add }
}

