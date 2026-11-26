import { storefrontCategories } from '~/mocks/storefront'
import type { CommercialCampaign, CommercialImage, CommercialProduct, ProductCollection } from '~/types/commerce'

function image(file: string, width: number, height: number, cutout = false): CommercialImage {
  return { src: `/images/home/${file}.webp`, width, height, altKey: `home.images.${file}`, cutout }
}

export const heroImages = {
  sneaker: image('sneaker', 608, 608, true),
  headphones: image('headphones', 608, 608, true),
  bag: image('crossbody', 608, 608, true),
  lamp: image('dome-lamp', 608, 608, true),
}

export const featuredCategories = storefrontCategories.slice(0, 6).map(category => ({
  ...category,
  image: image(`category-${category.id}`, 512, 512),
}))

function product(
  id: string,
  categoryId: CommercialProduct['categoryId'],
  photo: CommercialImage,
  price: number,
  options: Partial<Pick<CommercialProduct, 'available' | 'featured' | 'newArrival' | 'previousPrice' | 'subcategoryId'>>,
): CommercialProduct {
  return {
    id, slug: id, categoryId, images: [photo], price,
    nameKey: `home.products.${id}.name`,
    descriptionKey: `home.products.${id}.description`,
    available: true, featured: false, newArrival: false,
    ...options,
  }
}

export const homeProducts: readonly CommercialProduct[] = [
  product('stride-sneaker', 'fashion', heroImages.sneaker, 22500, { subcategoryId: 'shoes', previousPrice: 30000, featured: true }),
  product('pulse-headphones', 'electronics', heroImages.headphones, 15000, { subcategoryId: 'audio', previousPrice: 20000, featured: true }),
  product('desk-lamp', 'home', heroImages.lamp, 12500, { subcategoryId: 'lighting', previousPrice: 16000, newArrival: true }),
  product('studio-care', 'beauty', image('category-beauty', 512, 512), 7500, { subcategoryId: 'skincare', previousPrice: 10000 }),
  product('everyday-bag', 'fashion', heroImages.bag, 11000, { subcategoryId: 'bags', newArrival: true, featured: true }),
  product('training-kit', 'sport', image('category-sport', 512, 512), 14000, { subcategoryId: 'fitness', newArrival: true }),
  product('stacking-rings', 'children', image('category-children', 512, 512), 6500, { subcategoryId: 'toys', newArrival: true, featured: true }),
  product('pocket-speaker', 'electronics', image('category-electronics', 512, 512), 18500, { subcategoryId: 'audio', featured: true }),
]

export const homeCollections = [
  { id: 'promotions', productIds: ['stride-sneaker', 'pulse-headphones', 'desk-lamp', 'studio-care'] },
  { id: 'new', productIds: ['everyday-bag', 'training-kit', 'stacking-rings', 'desk-lamp'] },
  { id: 'bestsellers', productIds: ['pulse-headphones', 'everyday-bag', 'pocket-speaker', 'stacking-rings'] },
] as const satisfies readonly ProductCollection[]

export function getCollectionProducts(collection: ProductCollection) {
  return collection.productIds.flatMap(id => homeProducts.filter(entry => entry.id === id))
}

export const homeCampaigns: readonly CommercialCampaign[] = [
  { id: 'living', categoryId: 'home', image: image('campaign-home', 768, 512) },
  { id: 'wear', categoryId: 'fashion', image: image('universe-style', 768, 512) },
]

export const homeUniverses: readonly CommercialCampaign[] = [
  { id: 'tech', categoryId: 'electronics', image: image('universe-tech', 768, 512) },
  { id: 'style', categoryId: 'fashion', image: image('universe-style', 768, 512) },
  { id: 'home', categoryId: 'home', image: image('universe-home', 768, 512) },
]

