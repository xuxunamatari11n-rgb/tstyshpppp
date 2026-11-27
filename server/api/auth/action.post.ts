export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  requireShopOrigin(event)
  const input = await readBody<Record<string, unknown> | null>(event)
  const body = input && typeof input === 'object' ? input : {}
  const action = body.action
  if (action !== 'login' && action !== 'signup' && action !== 'reset' && action !== 'recover' && action !== 'logout') {
    throw createError({ statusCode: 400, data: { code: 'invalid' } })
  }

  const regie = body.area === 'regie'
  if (regie && action === 'signup') throw regieAuthError('invalid', 400)

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const locale = shopLocale(body.locale)
  if (action !== 'logout' && action !== 'recover' && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw createError({ statusCode: 400, data: { code: 'email' } })
  }
  if (action !== 'logout' && action !== 'reset' && (password.length < (action === 'login' ? 1 : 8) || password.length > 128)) {
    throw createError({ statusCode: 400, data: { code: 'password' } })
  }
  if (regie && action === 'login') return signInToRegie(event, email, password)
  if (regie && action === 'reset') requireRegieRecoveryConfig(event)

  const client = shopSessionClient(event)
  const name = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 80) : ''
  const callback = (flow: 'confirm' | 'recovery') => `${shopOrigin(event)}/api/auth/callback/${locale}/${flow}`
  if (regie && action === 'recover') {
    if (!await regieRecoveryActive(event)) throw regieAuthError('expired', 403)
    await requireCustomerOwner(event, body.owner)
  } else if ((action === 'recover' || action === 'logout') && body.owner !== undefined) await requireCustomerOwner(event, body.owner)
  else if (action === 'recover') await requireShopSession(event)
  const registration = action === 'signup' ? await client.auth.signUp({ email, password, options: {
    data: { first_name: name(body.firstName), last_name: name(body.lastName) }, emailRedirectTo: callback('confirm'),
  } }) : undefined

  const outcome = registration ?? (action === 'login' ? await client.auth.signInWithPassword({ email, password })
    : action === 'reset' ? await client.auth.resetPasswordForEmail(email, { redirectTo: callback('recovery') })
    : action === 'recover' ? await client.auth.updateUser({ password })
    : await client.auth.signOut({ scope: 'local' }))
  if (outcome.error) {
    const upstream = outcome.error
    const code = upstream.status === 429 ? 'rate'
      : upstream.code === 'email_not_confirmed' ? 'unconfirmed'
      : upstream.code === 'weak_password' ? 'password'
      : upstream.code === 'reauthentication_needed' ? 'reauth'
      : action === 'login' && upstream.code === 'invalid_credentials' ? 'credentials'
      : action === 'signup' && upstream.code === 'email_address_invalid' ? 'email'
      : action === 'signup' && upstream.code === 'signup_disabled' ? 'signupClosed'
      : action === 'signup' && upstream.status && upstream.status < 500 ? 'signup'
      : 'unavailable'
    throw createError({ statusCode: upstream.status === 429 ? 429 : upstream.status && upstream.status < 500 ? 400 : 503, data: { code } })
  }
  if (regie && action === 'reset') rememberRegieRecoveryRequest(event)
  if (action === 'recover' || action === 'logout') clearRegieRecovery(event)
  if (registration) {
    return { ok: true, signup: registration.data.session ? 'session' as const : 'confirmation' as const }
  }
  return { ok: true }
})
