export function useWhatsAppContact() {
  const config = useRuntimeConfig()
  const { settings } = useShopMeta()
  return computed(() => {
    if (settings.value?.open === false) return null
    const number = String(settings.value?.whatsappNumber ?? config.public.whatsappNumber ?? '').trim().replace(/[\s().-]/g, '').replace(/^\+/, '')
    return /^[1-9][0-9]{6,14}$/.test(number) ? `https://wa.me/${number}` : null
  })
}

