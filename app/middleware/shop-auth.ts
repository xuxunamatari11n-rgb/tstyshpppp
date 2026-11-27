export default defineNuxtRouteMiddleware(async to => {
  const localePath = useLocalePath()
  const load = useShopSessionRequest()
  let session
  try {
    session = await load()
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Authentication unavailable' })
  }
  if (!session.user) return navigateTo(localePath({ name: 'account', query: { intent: 'sign-in' } }))
  if (to.meta.shopRole === 'admin' && session.user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
})
