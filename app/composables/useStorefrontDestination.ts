export function useStorefrontDestination() {
  const router = useRouter()
  const baseName = useRouteBaseName()
  const localePath = useLocalePath()
  const available = new Set(router.getRoutes().map(route => baseName(route)))

  return (name: string) => available.has(name) ? localePath({ name }) || undefined : undefined
}
