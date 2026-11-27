import type { storefrontSelections } from '~/mocks/storefront'

export type CategoryId = string
export type CollectionId = (typeof storefrontSelections)[number]

export interface CommercialImage {
  src: string
  width: number
  height: number
  altKey: string
  alt?: string
  cutout?: boolean
}

export interface CommercialProduct {
  id: string
  slug: string
  nameKey: string
  descriptionKey: string
  name?: string
  description?: string
  fullDescription?: string
  seoTitle?: string
  seoDescription?: string
  categoryId: CategoryId
  subcategoryId?: string
  images: readonly CommercialImage[]
  price: number
  previousPrice?: number
  available: boolean
  createdAt: string
  featured: boolean
  newArrival: boolean
  fullDescriptionKey?: string
  specifications?: readonly { labelKey: string; valueKey: string; label?: string; value?: string }[]
  deliveryKey?: string
  stockQuantity?: number
  relatedProductIds?: readonly string[]
}

export interface CartLineRequest {
  productId: string
  quantity: number
}

export interface CommercialCampaign {
  id: string
  categoryId: CategoryId
  image: CommercialImage
}

export interface ProductCollection {
  id: CollectionId
  productIds: readonly string[]
}

