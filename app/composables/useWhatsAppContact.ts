import { whatsappLink } from '~/utils/whatsappCommerce'

export function useWhatsAppContact() {
  const config = useRuntimeConfig()
  const { settings } = useShopMeta()
  return computed(() => whatsappLink(settings.value?.whatsappNumber ?? config.public.whatsappNumber))
}

