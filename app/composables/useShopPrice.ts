export function useShopPrice() {
  const { settings } = useShopMeta()
  return (amount: number) => formatCurrency(amount, settings.value?.currencySymbol.trim() || 'F')
}
