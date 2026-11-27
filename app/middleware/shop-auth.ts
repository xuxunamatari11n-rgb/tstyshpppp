import { regieReturnQuery } from '~~/shared/utils/regieDestination'

export default defineNuxtRouteMiddleware(async to => {
  const localePath = useLocalePath()
  const load = useShopSessionRequest()
  let session
  try {
    session = await load()
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Authentication unavailable' })
  }
  if (!session.user) {
    if (to.meta.shopRole === 'admin') {
      return navigateTo(localePath({
        name: 'regie-login', query: regieReturnQuery(useRouteBaseName()(to), to.params.id),
      }))
    }
    return navigateTo(localePath({ name: 'account', query: { intent: 'sign-in' } }))
  }
  if (to.meta.shopRole === 'admin' && session.user.role !== 'admin') throw createError({ statusCode: 403, message: useNuxtApp().$i18n.t('regieAuth.deniedTitle') })
})
