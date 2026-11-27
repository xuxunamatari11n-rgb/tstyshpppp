import { customerReturnQuery } from '~~/shared/utils/customerAccount'

export default defineNuxtRouteMiddleware(async to => {
  const localePath = useLocalePath()
  const baseName = useRouteBaseName()
  const { setUser } = useCustomerSession()
  const load = useShopSessionRequest()
  const { user } = await load()
  setUser(user)
  if (!user) {
    const query = { intent: 'sign-in', ...customerReturnQuery(baseName(to), to.params.id) }
    return navigateTo(localePath({ name: 'account', query }))
  }
})

