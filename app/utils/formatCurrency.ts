const wholeFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** Format an amount in whole francs with consistent grouping in both locales. */
export function formatCurrency(amount: number, symbol = 'F'): string {
  return `${wholeFr.format(amount).replace(/\u202f|\u00a0/g, ' ')} ${symbol}`
}
