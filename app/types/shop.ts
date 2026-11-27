import type { CommercialProduct } from './commerce'
import type { ShopRole } from '~~/shared/types/database'

export interface ShopCategory {
  id: string
  slug: string
  name: string
  description?: string
  image?: { src: string; alt: string }
  featured: boolean
  subcategories: { id: string; name: string }[]
}

export interface ShopMeta {
  categories: ShopCategory[]
  settings: { storeName: string; whatsappNumber?: string; supportEmail?: string; announcement?: string; supportInformation?: string; currencySymbol: string; open: boolean } | null
}

export interface ShopProducts {
  products: CommercialProduct[]
  total: number
}

export interface ShopSession {
  id: string
  email: string
  firstName: string
  role: ShopRole
}
