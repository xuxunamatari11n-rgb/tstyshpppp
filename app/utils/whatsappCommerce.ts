export function whatsappNumber(value: unknown) {
  const number = String(value ?? '').trim().replace(/[\s().-]/g, '').replace(/^\+/, '')
  return /^[1-9][0-9]{6,14}$/.test(number) ? number : null
}

export function whatsappLink(value: unknown, message?: string) {
  const number = whatsappNumber(value)
  if (!number) return null
  const url = new URL(`https://wa.me/${number}`)
  if (message) url.searchParams.set('text', message)
  return url.href
}

