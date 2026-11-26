export function useProductFavorites() {
  const ids = useState<string[]>('storefront-session-favorites', () => [])
  const isFavorite = (id: string) => ids.value.includes(id)

  function toggleFavorite(id: string) {
    ids.value = isFavorite(id) ? ids.value.filter(value => value !== id) : [...ids.value, id]
  }

  return { isFavorite, toggleFavorite }
}
