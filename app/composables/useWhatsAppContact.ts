export function useWhatsAppContact() {
  const config = useRuntimeConfig()
  return computed(() => {
    const number = String(config.public.whatsappNumber ?? '').trim().replace(/[\s().-]/g, '').replace(/^\+/, '')
    return /^[1-9][0-9]{6,14}$/.test(number) ? `https://wa.me/${number}` : null
  })
}

