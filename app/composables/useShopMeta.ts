import type { InjectionKey, Ref } from 'vue'
import type { ShopMeta } from '~/types/shop'

const shopMetaKey: InjectionKey<Ref<ShopMeta | undefined>> = Symbol('shop-meta')

export function useShopMockMode() {
  return import.meta.dev && String(useRuntimeConfig().public.storefrontMock) === 'true'
}

export function provideShopMeta() {
  const { locale, t } = useI18n()
  const mock = useShopMockMode()
  const source = useAsyncData(computed(() => `shop-meta-${locale.value}`), async () => {
    if (mock) {
      const [{ storefrontCategories }, { featuredCategories }] = await Promise.all([
        import('~/mocks/storefront'), import('~/mocks/home'),
      ])
      return {
        categories: storefrontCategories.map(category => {
          const photo = featuredCategories.find(entry => entry.id === category.id)?.image
          return {
            id: category.id, slug: category.slug, name: t(`storefront.categories.${category.id}`),
            featured: Boolean(photo), image: photo ? { src: photo.src, alt: t(photo.altKey) } : undefined,
            subcategories: category.subcategories.map(id => ({ id, name: t(`storefront.subcategories.${id}`) })),
          }
        }),
        settings: null,
      } satisfies ShopMeta
    }
    return $fetch<ShopMeta>('/api/shop/meta', { query: { locale: locale.value } })
  })
  provide(shopMetaKey, source.data)
  return source
}

export function useShopMeta() {
  const data = inject(shopMetaKey, shallowRef<ShopMeta>())
  const categories = computed(() => data.value?.categories ?? [])
  const settings = computed(() => data.value?.settings ?? null)
  const categoryName = (id: string) => categories.value.find(category => category.id === id)?.name ?? id
  const subcategoryName = (id: string) => categories.value.flatMap(category => category.subcategories).find(category => category.id === id)?.name ?? id
  return { data, categories, settings, categoryName, subcategoryName }
}
