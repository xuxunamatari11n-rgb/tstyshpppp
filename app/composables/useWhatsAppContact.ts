import type { MaybeRefOrGetter } from 'vue'
import { whatsappLink } from '~/utils/whatsappCommerce'

export function useWhatsAppContact(message?: MaybeRefOrGetter<string | undefined>) {
  const config = useRuntimeConfig()
  const { settings } = useShopMeta()
  return computed(() => whatsappLink(settings.value?.whatsappNumber ?? config.public.whatsappNumber, toValue(message)))
}

