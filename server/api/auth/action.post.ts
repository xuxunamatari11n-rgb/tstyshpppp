export default defineEventHandler(async event => {
  requireShopOrigin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const input = await readBody<Record<string, unknown> | null>(event)
  const body = input && typeof input === 'object' ? input : {}
  const action = body.action
  if (action !== 'login' && action !== 'signup' && action !== 'reset' && action !== 'recover' && action !== 'logout') {
    throw createError({ statusCode: 400, data: { code: 'invalid' } })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const locale = shopLocale(body.locale)
  if (action !== 'logout' && action !== 'recover' && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw createError({ statusCode: 400, data: { code: 'email' } })
  }
  if (action !== 'logout' && action !== 'reset' && (password.length < (action === 'login' ? 1 : 8) || password.length > 128)) {
    throw createError({ statusCode: 400, data: { code: 'password' } })
  }
  const client = shopSessionClient(event)
  const name = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 80) : ''
  const callback = (flow: 'confirm' | 'recovery') => `${shopOrigin(event)}/api/auth/callback/${locale}/${flow}`
  if ((action === 'recover' || action === 'logout') && body.owner !== undefined) await requireCustomerOwner(event, body.owner)
  else if (action === 'recover') await requireShopSession(event)
  const outcome = action === 'login' ? await client.auth.signInWithPassword({ email, password })
    : action === 'signup' ? await client.auth.signUp({ email, password, options: {
      data: { first_name: name(body.firstName), last_name: name(body.lastName) }, emailRedirectTo: callback('confirm'),
    } })
    : action === 'reset' ? await client.auth.resetPasswordForEmail(email, { redirectTo: callback('recovery') })
    : action === 'recover' ? await client.auth.updateUser({ password })
    : await client.auth.signOut({ scope: 'local' })
  if (outcome.error) {
    const upstream = outcome.error
    const code = upstream.status === 429 ? 'rate'
      : upstream.code === 'email_not_confirmed' ? 'unconfirmed'
      : upstream.code === 'weak_password' ? 'password'
      : upstream.code === 'reauthentication_needed' ? 'reauth'
      : action === 'login' && upstream.code === 'invalid_credentials' ? 'credentials' : 'unavailable'
    throw createError({ statusCode: upstream.status === 429 ? 429 : upstream.status && upstream.status < 500 ? 400 : 503, data: { code } })
  }
  return { ok: true }
})
