export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  setResponseHeader(event, 'Referrer-Policy', 'no-referrer')
  const locale = shopLocale(getRouterParam(event, 'locale'))
  const flow = getRouterParam(event, 'flow')
  const account = locale === 'es' ? '/es/cuenta' : '/compte'
  if (flow !== 'confirm' && flow !== 'recovery') return sendRedirect(event, `${account}?auth=invalid`, 303)
  const { code, token_hash: token } = getQuery(event)
  if (typeof code !== 'string' && typeof token !== 'string') return sendRedirect(event, `${account}?auth=invalid`, 303)
  const client = shopSessionClient(event)
  const result = typeof token === 'string' && token.length <= 256
    ? await client.auth.verifyOtp({ token_hash: token, type: flow === 'recovery' ? 'recovery' : 'email' })
    : typeof code === 'string' && code.length <= 256 ? await client.auth.exchangeCodeForSession(code) : null
  return sendRedirect(event, !result || result.error ? `${account}?auth=invalid`
    : flow === 'recovery' ? `${account}?intent=recovery` : `${account}?auth=confirmed`, 303)
})
