export const storefrontFeaturedCategory = {
  id: 'electronics',
  slug: 'electronique',
  subcategories: ['phones', 'audio', 'computing'],
} as const

export const storefrontCategories = [
  { id: 'fashion', slug: 'mode-accessoires', subcategories: ['clothing', 'shoes', 'bags'] },
  storefrontFeaturedCategory,
  { id: 'home', slug: 'maison-decoration', subcategories: ['decor', 'lighting', 'kitchen'] },
  { id: 'beauty', slug: 'beaute-bien-etre', subcategories: ['skincare', 'haircare', 'wellness'] },
  { id: 'sport', slug: 'sport-loisirs', subcategories: ['fitness', 'outdoors', 'games'] },
  { id: 'children', slug: 'enfants-jouets', subcategories: ['toys', 'creative', 'baby'] },
  { id: 'office', slug: 'bureau-papeterie', subcategories: ['stationery', 'organization', 'officeAccessories'] },
  { id: 'other', slug: 'autres-produits', subcategories: ['daily', 'gifts', 'travel'] },
] as const

export const suggestedSearches = ['headphones', 'bags', 'decor'] as const
export const storefrontSelections = ['new', 'bestsellers', 'promotions'] as const

