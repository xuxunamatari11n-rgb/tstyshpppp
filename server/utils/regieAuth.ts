import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'

const recoveryCookie = 'testy-regie-recovery'
const requestCookie = 'testy-regie-recovery-request'
const duration = 15 * 60

export function regieAuthError(code: string, statusCode: number) {
  return createError({ statusCode, data: { code } })
}

export async function signInToRegie(event: H3Event, email: string, password: string) {
  // Only the candidate client sees the new tokens until the server checks its role.
  const candidate = publicShopClient(event)
  const outcome = await candidate.auth.signInWithPassword({ email, password })
  if (outcome.error) {
    const error = outcome.error
    if (error.status === 429) throw regieAuthError('rate', 429)
    if (error.code === 'email_not_confirmed') throw regieAuthError('unconfirmed', 400)
    if (error.code === 'invalid_credentials') throw regieAuthError('credentials', 400)
    throw regieAuthError('unavailable', 503)
  }
  let installed = false
  try {
    const session = outcome.data.session
    if (!session) throw regieAuthError('credentials', 400)
    const verified = await readShopSession(event, candidate)
    if (verified?.role !== 'admin') throw regieAuthError('denied', 403)

    const result = await shopSessionClient(event).auth.setSession({
      access_token: session.access_token, refresh_token: session.refresh_token,
    })
    if (result.error || !result.data.session) throw regieAuthError('unavailable', 503)
    installed = true
    clearRegieRecovery(event)
    return { ok: true as const }
  } finally {
    if (!installed) await candidate.auth.signOut({ scope: 'local' }).catch(() => {})
  }
}

function cookieOptions(event: H3Event) {
  return { path: '/', httpOnly: true, sameSite: 'lax' as const, secure: shopOrigin(event).startsWith('https:') }
}

function recoverySecret(event: H3Event) {
  return useRuntimeConfig(event).regieRecoverySecret.trim()
}

export function requireRegieRecoveryConfig(event: H3Event) {
  if (recoverySecret(event).length < 32) throw regieAuthError('unavailable', 503)
}

export function rememberRegieRecoveryRequest(event: H3Event) {
  setCookie(event, requestCookie, '1', { ...cookieOptions(event), maxAge: 60 * 60 })
}

export function consumeRegieRecoveryRequest(event: H3Event) {
  const requested = getCookie(event, requestCookie) === '1'
  if (requested) deleteCookie(event, requestCookie, cookieOptions(event))
  return requested
}

export function clearRegieRecovery(event: H3Event) {
  if (getCookie(event, recoveryCookie)) deleteCookie(event, recoveryCookie, cookieOptions(event))
}

async function currentSessionId(event: H3Event) {
  const { data, error } = await shopSessionClient(event).auth.getClaims()
  return !error && typeof data?.claims.session_id === 'string' ? data.claims.session_id : undefined
}

const encoding = new TextEncoder()
function recoveryKey(secret: string) {
  return crypto.subtle.importKey('raw', encoding.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}
function recoveryPayload(userId: string, sessionId: string, expires: number) {
  return encoding.encode(`${userId}:${sessionId}:${expires}`)
}

export async function issueRegieRecovery(event: H3Event, userId: string) {
  const secret = recoverySecret(event)
  if (secret.length < 32) return false
  const sessionId = await currentSessionId(event)
  if (!sessionId) return false
  const expires = Math.floor(Date.now() / 1000) + duration
  const signed = await crypto.subtle.sign('HMAC', await recoveryKey(secret), recoveryPayload(userId, sessionId, expires))
  const hex = Array.from(new Uint8Array(signed), value => value.toString(16).padStart(2, '0')).join('')
  setCookie(event, recoveryCookie, `${expires}.${hex}`, {
    ...cookieOptions(event), maxAge: duration,
  })
  return true
}

export async function regieRecoveryActive(event: H3Event) {
  const receipt = getCookie(event, recoveryCookie)
  const secret = recoverySecret(event)
  if (secret.length < 32 || !receipt || !/^\d{10}\.[a-f0-9]{64}$/.test(receipt)) return false
  const [timestamp, supplied] = receipt.split('.')
  const expires = Number(timestamp)
  if (!supplied || expires <= Math.floor(Date.now() / 1000)) return false
  const user = await readShopSession(event)
  if (user?.role !== 'admin') return false
  const sessionId = await currentSessionId(event)
  if (!sessionId) return false
  const signature = Uint8Array.from(supplied.match(/../g) ?? [], value => Number.parseInt(value, 16))
  return crypto.subtle.verify('HMAC', await recoveryKey(secret), signature, recoveryPayload(user.id, sessionId, expires))
}

