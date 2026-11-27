import type { CommercialImage, CommercialProduct } from '~/types/commerce'

export function useProductContent() {
  const { t } = useI18n()
  const name = (product: CommercialProduct) => product.name ?? t(product.nameKey)
  const description = (product: CommercialProduct) => product.description ?? (product.descriptionKey ? t(product.descriptionKey) : '')
  const photoAlt = (image: CommercialImage) => image.alt ?? t(image.altKey)
  return { name, description, photoAlt }
}
