export function useProductFavorites() {
  const favorites = useFavoritesStore()
  const { notify } = useCommerce()
  const { $gsap } = useNuxtApp()
  let animation: ReturnType<typeof $gsap.fromTo> | undefined

  function isFavorite(id: string) {
    return favorites.selected.has(id)
  }

  async function toggleFavorite(id: string, event?: MouseEvent) {
    const target = event?.currentTarget
    try {
      const favorite = await favorites.toggle(id)
      if (favorite === undefined) return
      notify(favorite ? 'commerce.feedback.favoriteAdded' : 'commerce.feedback.favoriteRemoved')
      if (target instanceof HTMLElement && target.isConnected && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animation?.revert()
        animation = $gsap.fromTo(target, { scale: 0.88 }, { scale: 1, duration: 0.19, ease: 'power2.out', clearProps: 'scale,transform' })
      }
    } catch { notify('commerce.feedback.favoriteError') }
  }

  onBeforeUnmount(() => animation?.revert())
  return { isFavorite, toggleFavorite }
}
