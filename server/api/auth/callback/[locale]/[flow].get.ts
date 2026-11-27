export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  setResponseHeader(event, 'Referrer-Policy', 'no-referrer')
  const locale = shopLocale(getRouterParam(event, 'locale'))
  const flow = getRouterParam(event, 'flow')
  const account = locale === 'es' ? '/es/cuenta' : '/compte'
  const regie = locale === 'es' ? '/es/admin/acceso' : '/admin/connexion'
  const requestedByRegie = flow === 'recovery' && consumeRegieRecoveryRequest(event)
  const invalid = `${requestedByRegie ? regie : account}?auth=invalid`
  if (flow !== 'confirm' && flow !== 'recovery') return sendRedirect(event, `${account}?auth=invalid`, 303)
  const { code, token_hash: token } = getQuery(event)
  if (typeof code !== 'string' && typeof token !== 'string') return sendRedirect(event, invalid, 303)
  const client = shopSessionClient(event)
  const usesTokenHash = typeof token === 'string' && token.length <= 256
  const result = usesTokenHash
    ? await client.auth.verifyOtp({ token_hash: token, type: flow === 'recovery' ? 'recovery' : 'email' })
    : typeof code === 'string' && code.length <= 256 ? await client.auth.exchangeCodeForSession(code) : null
  if (!result || result.error) return sendRedirect(event, invalid, 303)
  if (flow === 'confirm') return sendRedirect(event, `${account}?auth=confirmed`, 303)

  // Cross-device recovery links still use the same registered callback URLs.
  clearRegieRecovery(event)
  const user = await readShopSession(event).catch(() => null)
  const recoveryVerified = usesTokenHash || ('redirectType' in result.data && result.data.redirectType === 'recovery')
  if (recoveryVerified && result.data.session && user?.role === 'admin' && user.id === result.data.user?.id
    && await issueRegieRecovery(event, user.id).catch(() => false)) {
    return sendRedirect(event, `${regie}?intent=recovery`, 303)
  }
  return sendRedirect(event, requestedByRegie && user?.role === 'admin' ? invalid : `${account}?intent=recovery`, 303)
})
