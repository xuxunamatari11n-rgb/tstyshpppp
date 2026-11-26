import type { storefrontCategories, storefrontSelections } from '~/mocks/storefront'

export type CategoryId = (typeof storefrontCategories)[number]['id']
export type CollectionId = (typeof storefrontSelections)[number]

export interface CommercialImage {
  src: string
  width: number
  height: number
  altKey: string
  cutout?: boolean
}

export interface CommercialProduct {
  id: string
  slug: string
  nameKey: string
  descriptionKey: string
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
  specifications?: readonly { labelKey: string; valueKey: string }[]
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

